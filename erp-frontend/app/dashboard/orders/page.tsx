'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const STATUS_OPTIONS = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'];
const statusBadge: Record<string, string> = { PENDING: 'badge-yellow', PAID: 'badge-green', SHIPPED: 'badge-blue', CANCELLED: 'badge-red' };
const statusDot: Record<string, string> = { PENDING: '#d97706', PAID: '#15803d', SHIPPED: '#1d4ed8', CANCELLED: '#b91c1c' };

function TableSkeleton() {
    return (
        <div>
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    <div className="skeleton" style={{ height: 13, width: 80 }} />
                    <div className="skeleton" style={{ height: 13, flex: 1 }} />
                    <div className="skeleton" style={{ height: 13, width: 70 }} />
                    <div className="skeleton" style={{ height: 20, width: 60, borderRadius: 50 }} />
                    <div className="skeleton" style={{ height: 20, width: 70, borderRadius: 50 }} />
                    <div className="skeleton" style={{ height: 13, width: 80 }} />
                    <div className="skeleton" style={{ height: 28, width: 70, borderRadius: 8 }} />
                </div>
            ))}
        </div>
    );
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any>(null);

    const load = () => {
        setLoading(true);
        api.get('/orders?limit=100').then((r) => setOrders(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const updateStatus = async (orderId: string, status: string) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            toast.success(`Status updated to ${status}`);
            setSelected((prev: any) => prev ? { ...prev, status } : null);
            load();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error');
        }
    };

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Orders</div>
                    <div className="page-subtitle">Manage all customer orders</div>
                </div>
                {selected && (
                    <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>
                        <X size={14} /> Close details
                    </button>
                )}
            </div>

            <div className="erp-content" style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
                <div className="card">
                    {loading ? <TableSkeleton /> : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Method</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o.id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>
                                                #{o.id.slice(-8).toUpperCase()}
                                            </td>
                                            <td style={{ fontSize: '0.875rem', fontWeight: 500 }}>{o.customer?.user?.email || '—'}</td>
                                            <td style={{ fontWeight: 700, fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>${Number(o.totalAmount).toFixed(2)}</td>
                                            <td><span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>{o.paymentMethod}</span></td>
                                            <td>
                                                <span className={`badge ${statusBadge[o.status]}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusDot[o.status], display: 'inline-block' }} />
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm ${selected?.id === o.id ? 'btn-primary' : 'btn-outline'}`}
                                                    onClick={() => setSelected(selected?.id === o.id ? null : o)}
                                                >
                                                    {selected?.id === o.id ? 'Close' : 'Details'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {selected && (
                    <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: 80 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                            <div>
                                <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '0.3rem' }}>Order</p>
                                <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.04em' }}>#{selected.id.slice(-10).toUpperCase()}</p>
                            </div>
                            <span className={`badge ${statusBadge[selected.status]}`}>{selected.status}</span>
                        </div>

                        <div style={{ padding: '0.85rem', background: 'var(--bg)', borderRadius: 8, marginBottom: '1.25rem' }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: '0.25rem' }}>Customer</p>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selected.customer?.user?.email}</p>
                            {selected.customer?.phone && <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.15rem' }}>{selected.customer.phone}</p>}
                        </div>

                        <div style={{ marginBottom: '1.1rem' }}>
                            {selected.orderItems?.map((item: any) => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', alignItems: 'center' }}>
                                    <span>
                                        {item.product?.name}
                                        <span style={{ color: 'var(--muted)', marginLeft: '0.3rem' }}>×{item.quantity}</span>
                                    </span>
                                    <span style={{ fontWeight: 600 }}>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: '0.85rem', fontSize: '1rem', letterSpacing: '-0.02em' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--primary)' }}>${Number(selected.totalAmount).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Update status</label>
                            <select value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value)}>
                                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
