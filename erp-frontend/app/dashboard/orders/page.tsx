'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'];
const statusColor: Record<string, string> = { PENDING: 'badge-yellow', PAID: 'badge-green', SHIPPED: 'badge-blue', CANCELLED: 'badge-red' };

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
            toast.success(`Order updated to ${status}`);
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
            </div>
            <div className="erp-content" style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
                <div className="card">
                    <div className="table-wrap">
                        {loading ? <div className="loading-spinner" /> : (
                            <table>
                                <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o.id} style={{ cursor: 'pointer' }}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{o.id.slice(-8).toUpperCase()}</td>
                                            <td style={{ fontSize: '0.875rem' }}>{o.customer?.user?.email || 'N/A'}</td>
                                            <td style={{ fontWeight: 700 }}>${Number(o.totalAmount).toFixed(2)}</td>
                                            <td><span className="badge badge-purple">{o.paymentMethod}</span></td>
                                            <td><span className={`badge ${statusColor[o.status]}`}>{o.status}</span></td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button className="btn btn-outline btn-sm" onClick={() => setSelected(selected?.id === o.id ? null : o)}>
                                                    {selected?.id === o.id ? 'Close' : 'Details'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {selected && (
                    <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: 80 }}>
                        <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Order Details</h3>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>{selected.id}</p>
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Customer</p>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selected.customer?.user?.email}</p>
                        </div>
                        {selected.orderItems?.map((item: any) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                                <span>{item.product?.name} ×{item.quantity}</span>
                                <span style={{ fontWeight: 600 }}>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, margin: '1rem 0', fontSize: '1rem' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--primary)' }}>${Number(selected.totalAmount).toFixed(2)}</span>
                        </div>
                        <div className="form-group">
                            <label>Update Status</label>
                            <select value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value)}>
                                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        {selected.invoice && (
                            <a href={selected.invoice.pdfUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }}>
                                📄 Download Invoice
                            </a>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
