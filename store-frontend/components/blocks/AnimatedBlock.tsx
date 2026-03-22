'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export type AnimationType = 'none' | 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'zoom-in';

interface AnimatedBlockProps {
    animation?: AnimationType;
    delay?: number;
    children: ReactNode;
}

export function AnimatedBlock({ animation = 'none', delay = 0, children }: AnimatedBlockProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (animation === 'none') { setVisible(true); return; }

        const el = ref.current;
        if (!el) return;

        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.15 },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [animation]);

    if (animation === 'none') return <>{children}</>;

    return (
        <div
            ref={ref}
            className={`anim-block anim-${animation} ${visible ? 'anim-visible' : ''}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}
