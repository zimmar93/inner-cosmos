'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { label: string; badge: string; dot: string }> = {
    PENDING:   { label: 'Pending',   badge: 'badge-yellow', dot: '#d97706' },
    PAID:      { label: 'Paid',      badge: 'badge-green',  dot: '#15803d' },
    SHIPPED:   { label: 'Shipped',   badge: 'badge-blue',   dot: '#1d4ed8' },
    CANCELLED: { label: 'Cancelled', badge: 'badge-red',    dot: '#b91c1c' },
};

function OrderSkeleton() {
    return (
        <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--card)', padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skeleton" style={{ height: 11, width: 80 }} />
                    <div className="skeleton" style={{ height: 16, width: 140 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <div className="skeleton" style={{ height: 22, width: 70, borderRadius: 50 }} />
                    <div className="skeleton" style={{ height: 11, width: 90 }} />
                </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 13, width: '80%' }} />
                <div className="skeleton" style={{ height: 13, width: '60%' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <div className="skeleton" style={{ height: 16, width: 50 }} />
                    <div className="skeleton" style={{ height: 18, width: 80 }} />
                </div>
            </div>
        </div>
    );
}

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!Cookies.get('access_token')) { router.push('/login'); return; }
        api.get('/orders/my')
            .then((r) => setOrders(r.data.data))
            .catch(() => toast.error('Could not load orders'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <div className="page-header">
                <span className="eyebrow">Account</span>
                <h1>My <span>Orders</span></h1>
                <p>Track your order history and download invoices</p>
            </div>

            <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: 780 }}>
                {loading ? (
                    <>
                        <OrderSkeleton />
                        <OrderSkeleton />
                        <OrderSkeleton />
                    </>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" style={{ margin: '0 auto 1.5rem', display: 'block' }}>
                            <circle cx="50" cy="50" r="46" fill="var(--primary-100)" />
                            <rect x="28" y="32" width="44" height="36" rx="4" stroke="var(--primary)" strokeWidth="2.5" fill="white" />
                            <line x1="35" y1="44" x2="65" y2="44" stroke="var(--primary-300)" strokeWidth="2" strokeLinecap="round" />
                            <line x1="35" y1="52" x2="58" y2="52" stroke="var(--primary-300)" strokeWidth="2" strokeLinecap="round" />
                            <line x1="35" y1="60" x2="50" y2="60" stroke="var(--primary-300)" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>No orders yet</h2>
                        <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>When you place an order, it will appear here.</p>
                        <Link href="/products" className="btn btn-primary" style={{ display: 'inline-flex' }}>Start shopping</Link>
                    </div>
                ) : (
                    <div>
                        {orders.map((order) => {
                            const cfg = statusConfig[order.status] || statusConfig.PENDING;
                            return (
                                <div key={order.id} className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '0.3rem' }}>Order</p>
                                            <p style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.04em' }}>
                                                #{order.id.slice(-10).toUpperCase()}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span className={`badge ${cfg.badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                                                {cfg.label}
                                            </span>
                                            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
                                                {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                        {order.orderItems?.map((item: any) => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--text)' }}>
                                                    {item.product?.name}
                                                    <span style={{ color: 'var(--muted)', marginLeft: '0.4rem' }}>×{item.quantity}</span>
                                                </span>
                                                <span style={{ fontWeight: 600 }}>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 500 }}>
                                                    {order.paymentMethod === 'COD' ? '💵 Cash on delivery' : '💳 Card payment'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                                                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Total</span>
                                                <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--primary)' }}>
                                                    ${Number(order.totalAmount).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
