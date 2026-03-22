'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { Package, FileText, ExternalLink } from 'lucide-react';

const statusColor: Record<string, string> = {
    PENDING: 'badge-yellow',
    PAID: 'badge-green',
    SHIPPED: 'badge-blue',
    CANCELLED: 'badge-red',
};

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
                <h1>My Orders</h1>
                <p>Track your order history and invoices</p>
            </div>
            <div className="container" style={{ padding: '3rem 1.5rem' }}>
                {loading ? (
                    <div className="loading-spinner" />
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
                        <Package size={56} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No orders yet</p>
                        <a href="/products" className="btn btn-primary">Start Shopping</a>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {orders.map((order) => (
                            <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Order ID</p>
                                        <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}>{order.id.slice(-12).toUpperCase()}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`badge ${statusColor[order.status] || 'badge-blue'}`}>{order.status}</span>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
                                            {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                    {order.orderItems?.map((item: any) => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                            <span>{item.product?.name} <span style={{ color: 'var(--muted)' }}>×{item.quantity}</span></span>
                                            <span style={{ fontWeight: 600 }}>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                                        <span>Total</span>
                                        <span style={{ color: 'var(--primary)' }}>${Number(order.totalAmount).toFixed(2)}</span>
                                    </div>
                                </div>
                                {order.invoice && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                        <a href={order.invoice.pdfUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                            <FileText size={15} /> Download Invoice <ExternalLink size={13} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
