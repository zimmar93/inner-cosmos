'use client';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import { ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useCms } from '@/lib/cms';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';

export default function Navbar() {
    const itemCount = useCart((s) => s.itemCount);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [count, setCount] = useState(0);
    const [pageLinks, setPageLinks] = useState<{ slug: string; title: string }[]>([]);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const cms = useCms();
    const nav = cms.navbar || {};

    const storeName = nav.storeName || 'Inner Cosmos';
    const logoUrl = nav.logoUrl || '';
    const linkColor = nav.linkColor || undefined;

    useEffect(() => {
        const token = Cookies.get('access_token');
        setIsLoggedIn(!!token);
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
                setUserEmail(payload.email || '');
            } catch (e) { }
        } else {
            setUserEmail('');
        }
        setCount(itemCount());
    }, [itemCount, pathname]);

    useEffect(() => {
        api.get('/pages?status=published').then(r => {
            const pages = (r.data || []).filter((p: any) => !p.isHomepage);
            setPageLinks(pages.map((p: any) => ({ slug: p.slug, title: p.title })));
        }).catch(() => { });
    }, []);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const logout = () => {
        Cookies.remove('access_token');
        setIsLoggedIn(false);
        setUserEmail('');
        window.location.href = '/';
    };

    const initials = userEmail ? userEmail.substring(0, 2).toUpperCase() : 'U';

    return (
        <nav style={{
            background: 'rgba(250, 249, 255, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: scrolled ? '1px solid rgba(124,58,237,0.12)' : '1px solid transparent',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            transition: 'border-color 0.25s, box-shadow 0.25s',
            boxShadow: scrolled ? '0 2px 24px rgba(124,58,237,0.07)' : 'none',
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.5rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
                    {logoUrl ? (
                        <img src={logoUrl} alt={storeName} style={{ height: 30, borderRadius: 4 }} />
                    ) : (
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="3" fill="white" />
                                <circle cx="8" cy="8" r="6.5" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
                                <circle cx="8" cy="8" r="5" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3" />
                            </svg>
                        </div>
                    )}
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>{storeName}</span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
                    <Link href="/products" style={{ color: linkColor || 'var(--muted)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = linkColor || 'var(--muted)')}>
                        Products
                    </Link>
                    {pageLinks.map(p => (
                        <Link key={p.slug} href={`/${p.slug}`} style={{ color: linkColor || 'var(--muted)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', transition: 'color 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                            onMouseLeave={e => (e.currentTarget.style.color = linkColor || 'var(--muted)')}>
                            {p.title}
                        </Link>
                    ))}

                    {isLoggedIn ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link href="/orders" style={{ color: linkColor || 'var(--muted)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', transition: 'color 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                                onMouseLeave={e => (e.currentTarget.style.color = linkColor || 'var(--muted)')}>
                                Orders
                            </Link>
                            <div title={userEmail} style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary-100)', border: '2px solid var(--primary-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                                {initials}
                            </div>
                            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', transition: 'color 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" style={{ color: linkColor || 'var(--muted)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', transition: 'color 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                                onMouseLeave={e => (e.currentTarget.style.color = linkColor || 'var(--muted)')}>
                                Sign in
                            </Link>
                            <Link href="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}>
                                Get started
                            </Link>
                        </>
                    )}

                    <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 10, background: count > 0 ? 'var(--primary-100)' : 'transparent', border: '1.5px solid', borderColor: count > 0 ? 'var(--primary-200)' : 'var(--border)', color: count > 0 ? 'var(--primary)' : 'var(--muted)', transition: 'all 0.15s', textDecoration: 'none' }}>
                        <ShoppingCart size={18} />
                        {count > 0 && (
                            <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--primary)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>
                                {count}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
}
