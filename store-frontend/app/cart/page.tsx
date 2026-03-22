'use client';
import { useCart } from '@/store/cart';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
                <ShoppingBag size={64} color="var(--muted)" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Your cart is empty</h2>
                <Link href="/products" className="btn btn-primary">Browse Products</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Shopping Cart</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
                <div>
                    {items.map((item) => (
                        <div key={item.productId} className="card" style={{ display: 'flex', gap: '1.5rem', padding: '1.25rem', marginBottom: '1rem', alignItems: 'center' }}>
                            <div style={{ width: 80, height: 80, borderRadius: 8, background: '#e0e0ff', overflow: 'hidden', flexShrink: 0 }}>
                                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🌌</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{item.name}</h3>
                                <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>${item.price.toFixed(2)} each</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Minus size={14} />
                                </button>
                                <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div style={{ fontWeight: 800, color: 'var(--primary)', minWidth: 80, textAlign: 'right' }}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>
                            <button onClick={() => removeItem(item.productId)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    <button onClick={clearCart} className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444', marginTop: '0.5rem' }}>
                        <Trash2 size={16} /> Clear Cart
                    </button>
                </div>
                <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: 80 }}>
                    <h2 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Order Summary</h2>
                    {items.map((item) => (
                        <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--muted)' }}>{item.name} ×{item.quantity}</span>
                            <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--primary)' }}>${total().toFixed(2)}</span>
                    </div>
                    <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                        Proceed to Checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}
