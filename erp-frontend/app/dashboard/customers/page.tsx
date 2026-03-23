'use client';
import { useEffect, useState } from 'react';
import { Plus, X, User } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function TableSkeleton() {
    return (
        <div>
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
                    <div className="skeleton" style={{ height: 14, flex: 1 }} />
                    <div className="skeleton" style={{ height: 14, flex: 1.5 }} />
                    <div className="skeleton" style={{ height: 20, width: 80, borderRadius: 50 }} />
                    <div className="skeleton" style={{ height: 14, width: 100 }} />
                    <div className="skeleton" style={{ height: 14, width: 80 }} />
                </div>
            ))}
        </div>
    );
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [cf, setCf] = useState({ name: '', email: '', phone: '', company: '', address: '' });
    const [saving, setSaving] = useState(false);

    const loadCustomers = () => {
        setLoading(true);
        api.get('/users?limit=100').then((r) => {
            setCustomers(r.data.data.filter((u: any) => u.role === 'CUSTOMER'));
        }).finally(() => setLoading(false));
    };

    useEffect(() => { loadCustomers(); }, []);

    const addCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cf.name || !cf.email) return;
        setSaving(true);
        try {
            await api.post('/auth/register', {
                name: cf.name,
                email: cf.email,
                phone: cf.phone,
                company: cf.company,
                address: cf.address,
                password: 'ChangeMe123!',
            });
            toast.success('Customer added successfully');
            loadCustomers();
            setCf({ name: '', email: '', phone: '', company: '', address: '' });
            setShowModal(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add customer');
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name: string, email: string) => {
        if (name && name.trim()) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        return email.slice(0, 2).toUpperCase();
    };

    const avatarColors = ['#ede9fe', '#dbeafe', '#dcfce7', '#fef9c3', '#fee2e2'];
    const avatarTextColors = ['#7c3aed', '#1d4ed8', '#15803d', '#a16207', '#b91c1c'];

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Customers</div>
                    <div className="page-subtitle">{loading ? '…' : `${customers.length} customer${customers.length !== 1 ? 's' : ''}`}</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={15} /> Add customer
                </button>
            </div>

            <div className="erp-content">
                <div className="card">
                    {loading ? <TableSkeleton /> : customers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
                            <User size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <p style={{ fontWeight: 500 }}>No customers yet</p>
                            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '1rem' }}><Plus size={14} /> Add first customer</button>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Email</th>
                                        <th>Company</th>
                                        <th>Phone</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((u, i) => {
                                        const ci = i % avatarColors.length;
                                        return (
                                            <tr key={u.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{
                                                            width: 32, height: 32, borderRadius: '50%',
                                                            background: avatarColors[ci], color: avatarTextColors[ci],
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                                                        }}>
                                                            {getInitials(u.name || '', u.email)}
                                                        </div>
                                                        <span style={{ fontWeight: 600 }}>{u.name || <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontWeight: 400 }}>No name</span>}</span>
                                                    </div>
                                                </td>
                                                <td style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{u.email}</td>
                                                <td>{u.customer?.company ? <span className="badge badge-purple">{u.customer.company}</span> : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                                                <td style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{u.customer?.phone || '—'}</td>
                                                <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Add customer</div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '0.25rem', borderRadius: 6 }}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={addCustomer}>
                            <div className="form-group"><label>Full name *</label><input required value={cf.name} onChange={e => setCf({ ...cf, name: e.target.value })} placeholder="Jane Smith" /></div>
                            <div className="form-group"><label>Email *</label><input type="email" required value={cf.email} onChange={e => setCf({ ...cf, email: e.target.value })} placeholder="jane@example.com" /></div>
                            <div className="form-group"><label>Phone</label><input value={cf.phone} onChange={e => setCf({ ...cf, phone: e.target.value })} placeholder="+1 555-0000" /></div>
                            <div className="form-group"><label>Company</label><input value={cf.company} onChange={e => setCf({ ...cf, company: e.target.value })} placeholder="Acme Corp" /></div>
                            <div className="form-group"><label>Address</label><input value={cf.address} onChange={e => setCf({ ...cf, address: e.target.value })} placeholder="123 Main St, City" /></div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: 8 }}>
                                A temporary password <strong>ChangeMe123!</strong> will be assigned. Customer should update it on first login.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add customer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
