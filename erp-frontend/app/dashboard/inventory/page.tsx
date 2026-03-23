'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adjusting, setAdjusting] = useState<{ id: string; productId: string; name: string } | null>(null);
    const [qty, setQty] = useState('');
    const [mode, setMode] = useState<'adjust' | 'set'>('adjust');

    const TableSkeleton = () => (
        <div>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    <div className="skeleton" style={{ height: 14, flex: 2 }} />
                    <div className="skeleton" style={{ height: 14, width: 60 }} />
                    <div className="skeleton" style={{ height: 14, width: 50 }} />
                    <div className="skeleton" style={{ height: 20, width: 60, borderRadius: 50 }} />
                    <div className="skeleton" style={{ height: 28, width: 80, borderRadius: 8 }} />
                </div>
            ))}
        </div>
    );

    const load = () => {
        setLoading(true);
        api.get('/inventory').then((r) => setItems(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async () => {
        if (!adjusting || !qty) return;
        try {
            if (mode === 'adjust') {
                await api.patch(`/inventory/${adjusting.productId}/adjust`, { quantity: +qty });
                toast.success('Stock adjusted!');
            } else {
                await api.put(`/inventory/${adjusting.productId}/set`, { quantityAvailable: +qty });
                toast.success('Stock set!');
            }
            setAdjusting(null);
            setQty('');
            load();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error');
        }
    };

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Inventory</div>
                    <div className="page-subtitle">Monitor and manage stock levels</div>
                </div>
                <a href="/dashboard/inventory/low-stock" className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                    <AlertTriangle size={15} /> Low Stock Alerts
                </a>
            </div>
            <div className="erp-content">
                <div className="card">
                    <div className="table-wrap">
                        {loading ? <TableSkeleton /> : (
                            <table>
                                <thead><tr><th>Product</th><th>SKU</th><th>Available</th><th>Reserved</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {items.map((item) => {
                                        const avail = item.quantityAvailable - item.reservedQuantity;
                                        return (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: 600 }}>{item.product?.name}</td>
                                                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.product?.sku}</td>
                                                <td>
                                                    <span className={`badge ${avail > 10 ? 'badge-green' : avail > 0 ? 'badge-yellow' : 'badge-red'}`}>
                                                        {avail}
                                                    </span>
                                                </td>
                                                <td>{item.reservedQuantity}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button className="btn btn-outline btn-sm" onClick={() => { setAdjusting({ id: item.id, productId: item.productId, name: item.product?.name }); setMode('adjust'); setQty(''); }}>
                                                            Adjust
                                                        </button>
                                                        <button className="btn btn-primary btn-sm" onClick={() => { setAdjusting({ id: item.id, productId: item.productId, name: item.product?.name }); setMode('set'); setQty(String(item.quantityAvailable)); }}>
                                                            Set
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {adjusting && (
                <div className="modal-overlay" onClick={() => setAdjusting(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
                        <div className="modal-header">
                            <div className="modal-title">{mode === 'adjust' ? 'Adjust Stock' : 'Set Stock'}</div>
                        </div>
                        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{adjusting.name}</p>
                        <div className="form-group">
                            <label>{mode === 'adjust' ? 'Quantity (+/-)' : 'New Stock Quantity'}</label>
                            <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder={mode === 'adjust' ? 'e.g. 50 or -10' : 'e.g. 100'} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => setAdjusting(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSubmit}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
