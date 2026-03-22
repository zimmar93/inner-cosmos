'use client';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import { ShoppingCart, Package } from 'lucide-react';
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
    const pathname = usePathname();
    const cms = useCms();
    const nav = cms.navbar || {};

    const storeName = nav.storeName || 'Inner Cosmos';
    const logoUrl = nav.logoUrl || '';
    const bgColor = nav.bgColor || '#1a1a2e';
    const linkColor = nav.linkColor || 'rgba(255,255,255,0.8)';

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

    const logout = () => {
        Cookies.remove('access_token');
        setIsLoggedIn(false);
        setUserEmail('');
        window.location.href = '/';
    };

    const initials = userEmail ? userEmail.substring(0, 2).toUpperCase() : 'U';

    return (
        <nav style={{
            background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
            position: 'sticky', top: 0, zIndex: 100,
            boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: '1.25rem' }}>
                    {logoUrl ? (
                        <img src={logoUrl} alt={storeName} style={{ height: 32, borderRadius: 4 }} />
                    ) : (
                        <Package size={28} color="var(--primary)" />
                    )}
                    {storeName}
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Link href="/products" style={{ color: linkColor, textDecoration: 'none', fontWeight: 500 }}>Products</Link>
                    {pageLinks.map(p => (
                        <Link key={p.slug} href={`/${p.slug}`} style={{ color: linkColor, textDecoration: 'none', fontWeight: 500 }}>{p.title}</Link>
                    ))}
                    {isLoggedIn ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link href="/orders" style={{ color: linkColor, textDecoration: 'none', fontWeight: 500 }}>Orders</Link>
                            <div title={userEmail} style={{
                                width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                            }}>
                                {initials}
                            </div>
                            <button onClick={logout} style={{ background: 'none', border: 'none', color: linkColor, cursor: 'pointer', fontWeight: 500, opacity: 0.7 }}>Logout</button>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" style={{ color: linkColor, textDecoration: 'none', fontWeight: 500 }}>Login</Link>
                            <Link href="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Register</Link>
                        </>
                    )}
                    <Link href="/cart" style={{ position: 'relative', color: 'white', display: 'flex' }}>
                        <ShoppingCart size={24} />
                        {count > 0 && (
                            <span style={{
                                position: 'absolute', top: -8, right: -8,
                                background: 'var(--primary)', color: 'white',
                                borderRadius: '50%', width: 18, height: 18,
                                fontSize: '0.7rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>{count}</span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
}
