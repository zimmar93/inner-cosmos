'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

/* ── Small helpers ── */
function StarRating({ rating }: { rating: number }) {
    return <span>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

function StockBadge({ stock }: { stock: number }) {
    if (stock === 0) return <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 20, background: '#fee2e2', color: '#dc2626', fontWeight: 700 }}>Out of Stock</span>;
    if (stock <= 5) return <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 20, background: '#fef3c7', color: '#d97706', fontWeight: 700 }}>Low Stock</span>;
    return <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 20, background: '#dcfce7', color: '#16a34a', fontWeight: 700 }}>In Stock</span>;
}

function useCountdown(endsAt: string) {
    const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });
    useEffect(() => {
        const update = () => {
            const diff = new Date(endsAt).getTime() - Date.now();
            if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true }); return; }
            setTimeLeft({
                d: Math.floor(diff / 86400000),
                h: Math.floor((diff % 86400000) / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
                expired: false,
            });
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [endsAt]);
    return timeLeft;
}

/* ══════════════════════════════════════
   EXISTING BLOCK RENDERERS (Phase 1/2)
   ══════════════════════════════════════ */

export function RichTextBlock({ data }: { data: any }) {
    return (
        <section style={{ background: data.bgColor || '#fff', padding: `${data.padding || '3rem'} 1.5rem`, textAlign: data.alignment || 'left' }}>
            <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
                {data.heading && <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: data.textColor || 'var(--text)', marginBottom: '1rem' }}>{data.heading}</h2>}
                {data.body && <div style={{ color: data.textColor || 'var(--text)', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-line' }}>{data.body}</div>}
            </div>
        </section>
    );
}

export function ImageGalleryBlock({ data }: { data: any }) {
    const images = data.images || [];
    if (images.length === 0) return null;
    return (
        <section style={{ background: data.bgColor || '#fff', padding: `${data.padding || '3rem'} 1.5rem` }}>
            <div className="container">
                {data.title && <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem' }}>{data.title}</h2>}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.columns || 3}, 1fr)`, gap: data.gap || '1rem' }}>
                    {images.map((url: string, i: number) => (
                        url && <img key={i} src={url} alt="" style={{ width: '100%', height: 250, objectFit: 'cover', borderRadius: 'var(--radius, 12px)' }} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export function VideoBlock({ data }: { data: any }) {
    if (!data.url) return null;
    return (
        <section style={{ background: data.bgColor || '#000', padding: `${data.padding || '3rem'} 1.5rem` }}>
            <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
                {data.title && <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '1.5rem', color: '#fff' }}>{data.title}</h2>}
                <div style={{ position: 'relative', paddingBottom: data.aspectRatio === '4/3' ? '75%' : data.aspectRatio === '1/1' ? '100%' : '56.25%' }}>
                    <iframe
                        src={data.url}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', borderRadius: 'var(--radius, 12px)' }}
                        allowFullScreen
                        title={data.title || 'Video'}
                    />
                </div>
            </div>
        </section>
    );
}

export function CTABlock({ data }: { data: any }) {
    return (
        <section style={{ background: data.bgColor || 'var(--primary)', padding: `${data.padding || '4rem'} 1.5rem`, textAlign: 'center' }}>
            <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: data.textColor || '#fff', marginBottom: '0.75rem' }}>{data.heading}</h2>
                {data.subheading && <p style={{ fontSize: '1.1rem', color: `${data.textColor || '#fff'}cc`, marginBottom: '2rem' }}>{data.subheading}</p>}
                {data.buttonText && (
                    <Link href={data.buttonLink || '#'} style={{
                        display: 'inline-block', padding: '0.9rem 2rem', borderRadius: 'var(--radius, 12px)',
                        background: data.buttonBgColor || '#fff', color: data.buttonTextColor || 'var(--primary)',
                        fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                    }}>
                        {data.buttonText}
                    </Link>
                )}
            </div>
        </section>
    );
}

export function FeaturedProductsBlock({ data }: { data: any }) {
    const [products, setProducts] = useState<any[]>([]);
    const { useCart } = require('@/store/cart');
    const addItem = useCart((s: any) => s.addItem);

    useEffect(() => {
        if (data.visible === false) return;
        api.get(`/products?activeOnly=true&limit=${data.count || 6}`).then(r => setProducts(r.data.data || [])).catch(() => { });
    }, [data.count, data.visible]);

    if (data.visible === false || products.length === 0) return null;

    return (
        <section style={{ background: data.bgColor || '#fff', padding: `${data.padding || '3rem'} 1.5rem` }}>
            <div className="container">
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>{data.title || 'Featured Products'}</h2>
                <div className="grid-products">
                    {products.map((p: any) => (
                        <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                            <div className="card" style={{ position: 'relative' }}>
                                {data.showStockBadge && <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}><StockBadge stock={p.stock ?? 99} /></div>}
                                <div className="product-image">
                                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>🌌</span>}
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <h3 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>{p.name}</h3>
                                    <p style={{ color: 'var(--primary)', fontWeight: 800 }}>${Number(p.price).toFixed(2)}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link href="/products" className="btn btn-outline">View All Products</Link>
                </div>
            </div>
        </section>
    );
}

export function CategoryGridBlock({ data }: { data: any }) {
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data || [])).catch(() => { });
    }, []);

    if (categories.length === 0) return null;

    return (
        <section style={{ background: data.bgColor || '#f9f9fb', padding: `${data.padding || '3rem'} 1.5rem` }}>
            <div className="container">
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>{data.title || 'Shop by Category'}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.columns || 3}, 1fr)`, gap: '1.25rem' }}>
                    {categories.map((cat: any) => (
                        <Link key={cat.id} href={`/products?category=${cat.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{
                                background: 'white', borderRadius: 'var(--radius, 12px)', padding: '2rem 1.5rem',
                                textAlign: 'center', border: '1px solid #eee', transition: 'all 0.2s',
                            }}>
                                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>{cat.name}</h3>
                                {cat.description && <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.5rem' }}>{cat.description}</p>}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function TestimonialsBlock({ data }: { data: any }) {
    const items = data.items || [];
    if (items.length === 0) return null;
    return (
        <section style={{ background: data.bgColor || '#f9f9fb', padding: `${data.padding || '3rem'} 1.5rem` }}>
            <div className="container">
                {data.title && <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem' }}>{data.title}</h2>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {items.map((t: any, i: number) => (
                        <div key={t.id || i} style={{ background: 'white', borderRadius: 'var(--radius, 12px)', padding: '1.75rem', border: '1px solid #eee' }}>
                            <div style={{ color: '#f59e0b', marginBottom: '0.75rem' }}><StarRating rating={t.rating || 5} /></div>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#374151', marginBottom: '1rem' }}>"{t.text}"</p>
                            <strong style={{ fontSize: '0.9rem' }}>{t.name}</strong>
                            {t.role && <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{t.role}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FAQBlock({ data }: { data: any }) {
    const [openIdx, setOpenIdx] = useState<number | null>(null);
    const items = data.items || [];
    if (items.length === 0) return null;
    return (
        <section style={{ background: data.bgColor || '#fff', padding: `${data.padding || '3rem'} 1.5rem` }}>
            <div className="container" style={{ maxWidth: 750, margin: '0 auto' }}>
                {data.title && <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem' }}>{data.title}</h2>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {items.map((item: any, i: number) => (
                        <div key={item.id || i} style={{ border: '1px solid #e5e7eb', borderRadius: 'var(--radius, 12px)', overflow: 'hidden' }}>
                            <button
                                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                                style={{
                                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '1rem 1.25rem', background: 'white', border: 'none', cursor: 'pointer',
                                    fontWeight: 600, fontSize: '0.95rem', textAlign: 'left',
                                }}
                            >
                                {item.question}
                                <ChevronDown size={18} style={{ transform: openIdx === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginLeft: '1rem' }} />
                            </button>
                            {openIdx === i && (
                                <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7 }}>{item.answer}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function BadgesBlock({ data }: { data: any }) {
    const items = data.items || [];
    if (items.length === 0) return null;
    return (
        <section style={{ background: data.bgColor || '#fff', padding: `${data.padding || '2rem'} 1.5rem` }}>
            <div className="container">
                {data.title && <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '1.5rem' }}>{data.title}</h2>}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    {items.map((badge: any, i: number) => (
                        <div key={badge.id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                            <span style={{ fontSize: '1.5rem' }}>{badge.icon}</span>{badge.label}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ShippingInfoBlock({ data }: { data: any }) {
    const sections = data.sections || [];
    return (
        <section style={{ background: data.bgColor || '#f9f9fb', padding: `${data.padding || '3rem'} 1.5rem` }}>
            <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
                {data.title && <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem', color: data.textColor }}>{data.title}</h2>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {sections.map((sec: any, i: number) => (
                        <div key={i} style={{ background: 'white', borderRadius: 'var(--radius, 12px)', padding: '1.5rem', border: '1px solid #eee' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: data.textColor }}>{sec.heading}</h3>
                            <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7 }}>{sec.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════
   PHASE 3 — COMMERCE BLOCKS
   ══════════════════════════════════════ */

/** Product Showcase — hand-pick specific products by ID from the ERP catalog */
export function ProductPickerBlock({ data }: { data: any }) {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const ids: string[] = data.productIds || [];
        if (ids.length === 0) {
            // Fallback: show latest products
            api.get(`/products?activeOnly=true&limit=${data.columns || 3}`).then(r => setProducts(r.data.data || [])).catch(() => { });
        } else {
            // Fetch all then filter by selected IDs preserving order
            api.get('/products?activeOnly=true&limit=200').then(r => {
                const all: any[] = r.data.data || [];
                const ordered = ids.map(id => all.find((p: any) => p.id === id)).filter(Boolean);
                setProducts(ordered);
            }).catch(() => { });
        }
    }, [JSON.stringify(data.productIds)]);

    if (products.length === 0) return null;

    return (
        <section style={{ background: data.bgColor || '#fff', padding: `${data.padding || '3rem'} 1.5rem` }}>
            <div className="container">
                {data.title && <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem' }}>{data.title}</h2>}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.columns || 3}, 1fr)`, gap: '1.5rem' }}>
                    {products.map((p: any) => (
                        <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                            <div className="card" style={{ position: 'relative', height: '100%' }}>
                                {data.showStockBadge && (
                                    <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
                                        <StockBadge stock={p.stock ?? 99} />
                                    </div>
                                )}
                                <div className="product-image">
                                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>🌌</span>}
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <h3 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>{p.name}</h3>
                                    <p style={{ color: 'var(--primary)', fontWeight: 800 }}>${Number(p.price).toFixed(2)}</p>
                                    {p.description && <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem', lineHeight: 1.5 }}>{p.description.slice(0, 80)}{p.description.length > 80 ? '...' : ''}</p>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

/** Category Carousel — horizontal scrollable pill strip of all categories */
export function CategoryCarouselBlock({ data }: { data: any }) {
    const [categories, setCategories] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data || [])).catch(() => { });
    }, []);

    const scroll = (dir: -1 | 1) => { scrollRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' }); };

    if (categories.length === 0) return null;

    return (
        <section style={{ background: data.bgColor || '#fff', padding: `${data.padding || '2.5rem'} 1.5rem` }}>
            <div className="container">
                {data.title && <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>{data.title}</h2>}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => scroll(-1)} style={{ flexShrink: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                        <ChevronLeft size={18} />
                    </button>
                    <div ref={scrollRef} style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', scrollbarWidth: 'none', flex: 1, padding: '0.5rem 0' }}>
                        {categories.map((cat: any) => (
                            <Link key={cat.id} href={`/products?category=${cat.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                                <div style={{
                                    padding: '0.6rem 1.4rem', borderRadius: 999, border: `2px solid ${data.pillBg || '#f3f4f6'}`,
                                    background: data.pillBg || '#f3f4f6', color: data.pillColor || '#1a1a2e',
                                    fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap',
                                }}>
                                    {cat.name}
                                </div>
                            </Link>
                        ))}
                    </div>
                    <button onClick={() => scroll(1)} style={{ flexShrink: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    );
}

/** Promotion Banner — with live countdown timer */
export function PromotionBannerBlock({ data }: { data: any }) {
    const time = useCountdown(data.endsAt || new Date(Date.now() + 86400000).toISOString());
    const pad = (n: number) => String(n).padStart(2, '0');

    const boxStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.15)', borderRadius: 10,
        padding: '0.6rem 1rem', textAlign: 'center', minWidth: 60,
    };

    return (
        <section style={{ background: data.bgColor || '#1a1a2e', padding: `${data.padding || '3rem'} 1.5rem`, textAlign: 'center' }}>
            <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: data.textColor || '#fff', marginBottom: '0.5rem' }}>{data.title || '🔥 Flash Sale'}</h2>
                {data.subtitle && !time.expired && (
                    <p style={{ color: `${data.textColor || '#fff'}99`, fontSize: '1rem', marginBottom: '1.5rem' }}>{data.subtitle}</p>
                )}
                {!time.expired ? (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        {[['d', time.d], ['h', time.h], ['m', time.m], ['s', time.s]].map(([label, val]) => (
                            <div key={label as string} style={boxStyle}>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: data.accentColor || '#f59e0b', lineHeight: 1 }}>{pad(val as number)}</div>
                                <div style={{ fontSize: '0.65rem', color: `${data.textColor || '#fff'}99`, textTransform: 'uppercase', marginTop: '0.2rem' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: data.accentColor || '#f59e0b', fontWeight: 700, marginBottom: '2rem', fontSize: '1.1rem' }}>This offer has ended</p>
                )}
                {data.ctaText && !time.expired && (
                    <Link href={data.ctaLink || '/products'} style={{
                        display: 'inline-block', padding: '0.9rem 2.5rem', borderRadius: 'var(--radius, 12px)',
                        background: data.accentColor || '#f59e0b', color: data.bgColor || '#1a1a2e',
                        fontWeight: 800, fontSize: '1rem', textDecoration: 'none',
                    }}>
                        {data.ctaText}
                    </Link>
                )}
            </div>
        </section>
    );
}

/* ══════════════════════════════════════
   PHASE 3 — FORM BLOCKS
   ══════════════════════════════════════ */

/** Contact Form — submits to /api/leads */
export function ContactFormBlock({ data }: { data: any }) {
    const fields: string[] = data.fields || ['name', 'email', 'message'];
    const [form, setForm] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await api.post('/leads', { ...form, source: 'contact-form', page: window.location.pathname });
            setStatus('success');
            setForm({});
        } catch {
            setStatus('error');
        }
    };

    const inp: React.CSSProperties = {
        width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb',
        borderRadius: 10, fontSize: '0.95rem', fontFamily: 'inherit', background: 'white',
        outline: 'none', boxSizing: 'border-box',
    };

    return (
        <section style={{ background: data.bgColor || '#f9f9fb', padding: `${data.padding || '4rem'} 1.5rem` }}>
            <div className="container" style={{ maxWidth: 620, margin: '0 auto' }}>
                {data.title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: data.textColor || '#1a1a2e', marginBottom: '0.5rem', textAlign: 'center' }}>{data.title}</h2>}
                {data.subtitle && <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '2rem', lineHeight: 1.6 }}>{data.subtitle}</p>}

                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 16, border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h3 style={{ fontWeight: 700, color: '#16a34a', marginBottom: '0.5rem' }}>Message Sent!</h3>
                        <p style={{ color: '#6b7280' }}>{data.successMessage || "Thank you! We'll be in touch soon."}</p>
                        <button onClick={() => setStatus('idle')} style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', background: 'white', fontWeight: 600 }}>Send Another</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 16, padding: '2rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {fields.includes('name') && (
                            <input style={inp} placeholder="Your Name" required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                        )}
                        {fields.includes('email') && (
                            <input type="email" style={inp} placeholder="Your Email" required value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                        )}
                        {fields.includes('phone') && (
                            <input type="tel" style={inp} placeholder="Phone Number (optional)" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        )}
                        {fields.includes('message') && (
                            <textarea style={{ ...inp, minHeight: 120, resize: 'vertical' }} placeholder="Your message..." required value={form.message || ''} onChange={e => setForm({ ...form, message: e.target.value })} />
                        )}
                        {status === 'error' && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>Something went wrong. Please try again.</p>}
                        <button type="submit" disabled={status === 'sending'} style={{
                            padding: '0.85rem', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: data.accentColor || '#6c63ff', color: 'white', fontWeight: 700, fontSize: '1rem',
                            opacity: status === 'sending' ? 0.7 : 1,
                        }}>
                            {status === 'sending' ? 'Sending...' : (data.submitText || 'Send Message')}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}

/** Newsletter — email subscription */
export function NewsletterBlock({ data }: { data: any }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus('sending');
        try {
            await api.post('/leads', { email, source: 'newsletter', page: window.location.pathname });
            setStatus('success');
            setEmail('');
        } catch {
            setStatus('error');
        }
    };

    return (
        <section style={{ background: data.bgColor || '#6c63ff', padding: `${data.padding || '4rem'} 1.5rem`, textAlign: 'center' }}>
            <div className="container" style={{ maxWidth: 560, margin: '0 auto' }}>
                {data.title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: data.textColor || '#fff', marginBottom: '0.5rem' }}>{data.title}</h2>}
                {data.subtitle && <p style={{ color: `${data.textColor || '#fff'}cc`, marginBottom: '2rem', lineHeight: 1.6 }}>{data.subtitle}</p>}

                {status === 'success' ? (
                    <p style={{ color: data.textColor || '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{data.successMessage || "🎉 You're subscribed!"}</p>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: 460, margin: '0 auto', flexWrap: 'wrap' }}>
                        <input
                            type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            placeholder={data.placeholder || 'Enter your email'}
                            style={{
                                flex: 1, minWidth: 200, padding: '0.85rem 1.1rem', borderRadius: 10, border: 'none',
                                fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
                            }}
                        />
                        <button type="submit" disabled={status === 'sending'} style={{
                            padding: '0.85rem 1.75rem', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: 'white', color: data.bgColor || '#6c63ff', fontWeight: 700,
                            opacity: status === 'sending' ? 0.7 : 1, flexShrink: 0,
                        }}>
                            {status === 'sending' ? '...' : (data.submitText || 'Subscribe')}
                        </button>
                    </form>
                )}
                {status === 'error' && <p style={{ color: '#fca5a5', marginTop: '0.75rem', fontSize: '0.875rem' }}>Something went wrong. Please try again.</p>}
            </div>
        </section>
    );
}

/* ══════════════════════════════════════
   LEGACY BLOCKS (Phase 1)
   ══════════════════════════════════════ */

export function AnnouncementBlock({ data }: { data: any }) {
    if (data.enabled === false) return null;
    return (
        <div style={{
            background: data.bgColor || 'var(--primary)',
            color: data.textColor || '#fff',
            textAlign: 'center', padding: '0.6rem 1rem',
            fontSize: '0.85rem', fontWeight: 600,
        }}>
            {data.link ? (
                <Link href={data.link} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {data.text}
                </Link>
            ) : data.text}
        </div>
    );
}

export function HeroBlock({ data }: { data: any }) {
    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
    
    useEffect(() => {
        const slideCount = data.bgImages?.length || 0;
        if (slideCount <= 1) return;
        const speed = data.slideInterval || 5000;
        const interval = setInterval(() => {
            setCurrentHeroSlide((p) => (p + 1) % slideCount);
        }, speed);
        return () => clearInterval(interval);
    }, [data.bgImages, data.slideInterval]);

    const overlayColor = data.overlayColor || 'rgba(26,26,46,0.85)';
    const heroTextColor = data.textColor || '#ffffff';
    const heroPadding = data.padding || '6rem';

    let heroBg = 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)';
    if (data.bgImages && data.bgImages.length > 0) {
        heroBg = `linear-gradient(135deg, ${overlayColor}, ${overlayColor}), url(${data.bgImages[currentHeroSlide]}) center/cover`;
    } else if (data.bgImage) {
        heroBg = `linear-gradient(135deg, ${overlayColor}, ${overlayColor}), url(${data.bgImage}) center/cover`;
    }

    return (
        <section style={{
            background: heroBg,
            transition: 'background 1s ease-in-out',
            color: heroTextColor, padding: `${heroPadding} 1.5rem`, textAlign: 'center',
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 120%,rgba(108,99,255,0.25),transparent 70%)', pointerEvents: 'none' }} />
            <p style={{ color: 'var(--primary)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {data.subtitle}
            </p>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
                {data.title}<br /><span style={{ color: 'var(--primary)' }}>{data.titleHighlight}</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: `${heroTextColor}b3`, maxWidth: 520, margin: '0 auto 2.5rem' }}>
                {data.description}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={data.ctaLink || '/products'} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}>
                    {data.ctaText || 'Shop Now'}
                </Link>
                {data.cta2Text && (
                    <Link href={data.cta2Link || '/register'} className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.05rem', borderColor: `${heroTextColor}4d`, color: heroTextColor }}>
                        {data.cta2Text}
                    </Link>
                )}
            </div>
        </section>
    );
}

export function BannerSlidesBlock({ data }: { data: any }) {
    const slides = data.slides || [];
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((p) => (p + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides]);

    if (slides.length === 0) return null;

    return (
        <section style={{ position: 'relative', overflow: 'hidden', background: '#0a0a1a' }}>
            <div style={{ position: 'relative', width: '100%', height: 340 }}>
                {slides.map((slide: any, i: number) => (
                    <div key={slide.id || i} style={{
                        position: 'absolute', inset: 0,
                        opacity: i === currentSlide ? 1 : 0,
                        transition: 'opacity 0.6s ease-in-out',
                    }}>
                        {slide.imageUrl && (
                            <img src={slide.imageUrl} alt={slide.title} style={{
                                width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5,
                            }} />
                        )}
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: '2rem',
                        }}>
                            {slide.title && <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{slide.title}</h2>}
                            {slide.subtitle && <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '1rem' }}>{slide.subtitle}</p>}
                            {slide.link && (
                                <Link href={slide.link} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                                    Learn More
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {slides.length > 1 && (
                <>
                    <button onClick={() => setCurrentSlide((p) => (p - 1 + slides.length) % slides.length)}
                        aria-label="Previous slide"
                        style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentSlide((p) => (p + 1) % slides.length)}
                        aria-label="Next slide"
                        style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronRight size={20} />
                    </button>
                    <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
                        {slides.map((_: any, i: number) => (
                            <button key={i} onClick={() => setCurrentSlide(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                style={{
                                    width: i === currentSlide ? 24 : 8, height: 8, borderRadius: 4,
                                    background: i === currentSlide ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                                    border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                                }} />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}

export function FeatureCardsBlock({ data }: { data: any }) {
    const items = data.items || [];
    if (items.length === 0) return null;
    return (
        <section style={{ background: data.bgColor || '#ffffff', padding: '4rem 1.5rem' }}>
            <div className="container">
                {data.sectionTitle && (
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center', color: 'var(--text)' }}>
                        {data.sectionTitle}
                    </h2>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
                    {items.map((f: any, i: number) => (
                        <div key={f.title || i} style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                            <div style={{ marginBottom: '1rem', fontSize: '1.75rem' }}>{f.icon}</div>
                            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Block renderer map ── */
const BLOCK_RENDERERS: Record<string, React.FC<{ data: any }>> = {
    // Legacy mapping
    'hero': HeroBlock,
    'announcement': AnnouncementBlock,
    'banner-slides': BannerSlidesBlock,
    'feature-cards': FeatureCardsBlock,
    // Phase 1/2
    'richtext': RichTextBlock,
    'image-gallery': ImageGalleryBlock,
    'video': VideoBlock,
    'cta': CTABlock,
    'featured-products': FeaturedProductsBlock,
    'category-grid': CategoryGridBlock,
    'testimonials': TestimonialsBlock,
    'faq': FAQBlock,
    'badges': BadgesBlock,
    'shipping-info': ShippingInfoBlock,
    // Phase 3 — Commerce
    'product-picker': ProductPickerBlock,
    'category-carousel': CategoryCarouselBlock,
    'promotion-banner': PromotionBannerBlock,
    // Phase 3 — Forms
    'contact-form': ContactFormBlock,
    'newsletter': NewsletterBlock,
};

export function getBlockRenderer(type: string): React.FC<{ data: any }> | null {
    return BLOCK_RENDERERS[type] || null;
}
