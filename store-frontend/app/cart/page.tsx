'use client';
import { useCart } from '@/store/cart';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';

function EmptyCartIllustration() {
    return (
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ margin: '0 auto 1.5rem', display: 'block' }}>
                <circle cx="60" cy="60" r="56" fill="var(--primary-100)" />
                <path d="M35 48h50l-8 30H43L35 48Z" stroke="var(--primary)" strokeWidth="2.5" fill="white" strokeLinejoin="round" />
                <path d="M35 48l-5-16H20" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="49" cy="84" r="4.5" fill="var(--primary)" />
                <circle cx="71" cy="84" r="4.5" fill="var(--primary)" />
                <path d="M52 64h16" stroke="var(--primary-300)" strokeWidth="2" strokeLinecap="round" />
                <path d="M55 58v12" stroke="var(--primary-300)" strokeWidth="2" strokeLinecap="round" />
                <path d="M65 58v12" stroke="var(--primary-300)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.6rem' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>Looks like you haven't added anything yet.</p>
            <Link href="/products" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                Browse products
            </Link>
        </div>
    );
}

export default function CartPage() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCart();

    if (items.length === 0) return <EmptyCartIllustration />;

    return (
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Shopping Cart</h1>
                <button onClick={clearCart} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                    <Trash2 size={14} /> Clear all
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
                <div>
                    {items.map((item) => (
                        <div key={item.productId} className="card" style={{ display: 'flex', gap: '1.25rem', padding: '1.1rem 1.25rem', marginBottom: '0.85rem', alignItems: 'center' }}>
                            <div style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--primary-100)', overflow: 'hidden', flexShrink: 0 }}>
                                {item.imageUrl
                                    ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <span style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>🌌</span>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                                <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>${item.price.toFixed(2)} each</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} style={{ background: 'var(--primary-100)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', transition: 'background 0.15s' }}>
                                    <Minus size={12} />
                                </button>
                                <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} style={{ background: 'var(--primary-100)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', transition: 'background 0.15s' }}>
                                    <Plus size={12} />
                                </button>
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--text)', minWidth: 72, textAlign: 'right', fontSize: '1rem', letterSpacing: '-0.02em' }}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>
                            <button onClick={() => removeItem(item.productId)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.25rem', borderRadius: 6, transition: 'color 0.15s, background 0.15s', display: 'flex' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fee2e2'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'none'; }}>
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: 80, boxShadow: 'var(--shadow)' }}>
                    <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Order Summary</h2>
                    {items.map((item) => (
                        <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.88rem' }}>
                            <span style={{ color: 'var(--muted)' }}>{item.name} ×{item.quantity}</span>
                            <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--primary)' }}>${total().toFixed(2)}</span>
                    </div>
                    <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
                        Proceed to checkout
                    </Link>
                    <Link href="/products" style={{ display: 'block', textAlign: 'center', marginTop: '0.85rem', color: 'var(--muted)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                        Continue shopping →
                    </Link>
                </div>
            </div>
        </div>
    );
}
