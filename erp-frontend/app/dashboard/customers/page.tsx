'use client';
import { useEffect, useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import api from '@/lib/api';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [cf, setCf] = useState({ name: '', email: '', phone: '', company: '', address: '' });

    const loadCustomers = () => {
        setLoading(true);
        api.get('/users?limit=100').then((r) => {
            setCustomers(r.data.data.filter((u: any) => u.role === 'CUSTOMER'));
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const addCustomer = async () => {
        if (!cf.name || !cf.email) return;
        try {
            await api.post('/auth/register', {
                name: cf.name,
                email: cf.email,
                phone: cf.phone,
                company: cf.company,
                address: cf.address,
                password: 'password123',
                role: 'CUSTOMER'
            });
            loadCustomers();
            setCf({ name: '', email: '', phone: '', company: '', address: '' });
            setShowModal(false);
        } catch (e) {
            console.error(e);
            alert('Failed to add customer');
        }
    };

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Customers</div>
                    <div className="page-subtitle">Manage customer accounts and profiles</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> Add Customer
                </button>
            </div>
            <div className="erp-content">
                <div className="card">
                    <div className="table-wrap">
                        {loading ? <div className="loading-spinner" /> : (
                            <table>
                                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Company</th><th>Phone</th><th>Joined</th></tr></thead>
                                <tbody>
                                    {customers.length === 0 ? (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No customers yet</td></tr>
                                    ) : customers.map((u) => (
                                        <tr key={u.id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>{u.id.slice(-8)}</td>
                                            <td style={{ fontWeight: 600 }}>{u.name || 'Unnamed'}</td>
                                            <td>{u.email}</td>
                                            <td><span className="badge badge-purple">{u.customer?.company || 'None'}</span></td>
                                            <td style={{ color: 'var(--muted)' }}>{u.customer?.phone || '—'}</td>
                                            <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Add Customer</div>
                            <button className="btn btn-sm btn-outline" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <div className="form-group"><label>Name *</label><input value={cf.name} onChange={e => setCf({ ...cf, name: e.target.value })} placeholder="Full name" /></div>
                        <div className="form-group"><label>Email *</label><input value={cf.email} onChange={e => setCf({ ...cf, email: e.target.value })} placeholder="email@example.com" /></div>
                        <div className="form-group"><label>Phone</label><input value={cf.phone} onChange={e => setCf({ ...cf, phone: e.target.value })} placeholder="+1 555-0000" /></div>
                        <div className="form-group"><label>Company</label><input value={cf.company} onChange={e => setCf({ ...cf, company: e.target.value })} placeholder="Company name" /></div>
                        <div className="form-group"><label>Address</label><input value={cf.address} onChange={e => setCf({ ...cf, address: e.target.value })} placeholder="Full address" /></div>
                        <button className="btn btn-primary" onClick={addCustomer} style={{ width: '100%', marginTop: '0.5rem' }}>Add Customer</button>
                    </div>
                </div>
            )}
        </>
    );
}
