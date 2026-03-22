'use client';
import Link from 'next/link';
import { useCms } from '@/lib/cms';

export default function Footer() {
    const cms = useCms();
    const f = cms.footer || {};

    const text = f.text || `© ${new Date().getFullYear()} Inner Cosmos. All rights reserved.`;
    const bgColor = f.bgColor || '#111827';
    const textColor = f.textColor || '#9ca3af';
    const links: { label: string; url: string }[] = f.links || [];

    return (
        <footer style={{ background: bgColor, color: textColor, textAlign: 'center', padding: '2rem 1rem', fontSize: '0.875rem' }}>
            <p>{text}</p>
            {links.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {links.map((l, i) => (
                        <Link key={i} href={l.url || '#'} style={{ color: textColor, textDecoration: 'underline', opacity: 0.8 }}>
                            {l.label}
                        </Link>
                    ))}
                </div>
            )}
        </footer>
    );
}
