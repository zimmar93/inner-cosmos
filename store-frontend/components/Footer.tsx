'use client';
import Link from 'next/link';
import { useCms } from '@/lib/cms';

export default function Footer() {
    const cms = useCms();
    const f = cms.footer || {};

    const year = new Date().getFullYear();
    const text = f.text || `© ${year} Inner Cosmos`;
    const links: { label: string; url: string }[] = f.links || [];

    // Use CMS colour if explicitly set, otherwise use our design-system default
    const useCustomBg = f.bgColor && f.bgColor !== '#111827';
    const bgColor = useCustomBg ? f.bgColor : 'var(--bg)';
    const textColor = useCustomBg ? (f.textColor || '#9ca3af') : 'var(--muted)';

    return (
        <footer style={{
            background: bgColor,
            borderTop: '1px solid var(--border)',
            padding: '2.5rem 1.5rem',
        }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="2.2" fill="white" />
                            <circle cx="6" cy="6" r="5" stroke="white" strokeWidth="0.9" fill="none" opacity="0.5" />
                        </svg>
                    </div>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: textColor === 'var(--muted)' ? 'var(--text)' : textColor, letterSpacing: '-0.02em' }}>
                        Inner Cosmos
                    </span>
                </div>

                {/* Links */}
                {links.length > 0 && (
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {links.map((l, i) => (
                            <Link key={i} href={l.url || '#'} style={{ color: textColor, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                                onMouseLeave={e => (e.currentTarget.style.color = textColor)}>
                                {l.label}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Copyright */}
                <p style={{ color: textColor, fontSize: '0.82rem' }}>{text}</p>
            </div>
        </footer>
    );
}
