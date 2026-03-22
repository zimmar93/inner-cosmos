'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, X, Users2, Building2 } from 'lucide-react';
import { accountsStore, CrmAccount, crmId } from '@/lib/crm-data';
import api from '@/lib/api';

export default function ContactsPage() {
    const [tab, setTab] = useState<'contacts' | 'accounts'>('contacts');
    const [contacts, setContacts] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<CrmAccount[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    const loadContacts = () => {
        api.get('/users?limit=100').then((r) => {
            setContacts(r.data.data.filter((u: any) => u.role === 'CUSTOMER'));
        });
    };

    useEffect(() => {
        loadContacts();
        setAccounts(accountsStore.getAll());
    }, []);

    const filteredContacts = contacts.filter(c =>
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.customer?.company || '').toLowerCase().includes(search.toLowerCase())
    );
    const filteredAccounts = accounts.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.industry.toLowerCase().includes(search.toLowerCase())
    );

    // Contact form state
    const [cf, setCf] = useState({ name: '', email: '', phone: '', role: '', company: '' });
    // Account form state
    const [af, setAf] = useState({ name: '', industry: '', size: '', revenue: '', website: '' });

    const addContact = async () => {
        if (!cf.name || !cf.email) return;
        try {
            await api.post('/auth/register', {
                name: cf.name,
                email: cf.email,
                phone: cf.phone,
                company: cf.company,
                password: 'password123',
                role: 'CUSTOMER'
            });
            loadContacts();
            setCf({ name: '', email: '', phone: '', role: '', company: '' });
            setShowModal(false);
        } catch (e) {
            console.error(e);
            alert('Failed to add contact/customer');
        }
    };
    const addAccount = () => {
        if (!af.name) return;
        const a: CrmAccount = { id: crmId(), ...af, contactIds: [], createdAt: new Date().toISOString().slice(0, 10) };
        setAccounts(accountsStore.create(a));
        setAf({ name: '', industry: '', size: '', revenue: '', website: '' });
        setShowModal(false);
    };
    const deleteContact = async (id: string) => {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        try {
            await api.delete(`/users/${id}`);
            loadContacts();
        } catch (e) {
            console.error(e);
            alert('Failed to delete customer');
        }
    };
    const deleteAccount = (id: string) => setAccounts(accountsStore.remove(id));

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Contacts & Accounts</div>
                    <div className="page-subtitle">Manage your contacts and company accounts</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> Add {tab === 'contacts' ? 'Contact' : 'Account'}
                </button>
            </div>
            <div className="erp-content">
                <div className="crm-tabs">
                    <button className={`crm-tab ${tab === 'contacts' ? 'active' : ''}`} onClick={() => setTab('contacts')}>
                        <Users2 size={15} style={{ marginRight: 6, verticalAlign: -2 }} /> Contacts ({contacts.length})
                    </button>
                    <button className={`crm-tab ${tab === 'accounts' ? 'active' : ''}`} onClick={() => setTab('accounts')}>
                        <Building2 size={15} style={{ marginRight: 6, verticalAlign: -2 }} /> Accounts ({accounts.length})
                    </button>
                </div>

                <div className="crm-filter-bar">
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                        <input
                            placeholder={`Search ${tab}...`}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '2rem' }}
                        />
                    </div>
                </div>

                <div className="card">
                    <div className="table-wrap">
                        {tab === 'contacts' ? (
                            <table>
                                <thead>
                                    <tr><th>Name</th><th>Email</th><th>Phone</th><th>Company</th><th>Role</th><th>Last Activity</th><th></th></tr>
                                </thead>
                                <tbody>
                                    {filteredContacts.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No contacts found</td></tr>
                                    ) : filteredContacts.map(c => (
                                        <tr key={c.id}>
                                            <td style={{ fontWeight: 600 }}>{c.name || 'Unnamed'}</td>
                                            <td>{c.email}</td>
                                            <td style={{ color: 'var(--muted)' }}>{c.customer?.phone || '—'}</td>
                                            <td><span className="badge badge-purple">{c.customer?.company || 'None'}</span></td>
                                            <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{c.role}</td>
                                            <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button className="btn btn-sm btn-danger" onClick={() => deleteContact(c.id)}>
                                                    <X size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table>
                                <thead>
                                    <tr><th>Company</th><th>Industry</th><th>Size</th><th>Revenue</th><th>Contacts</th><th></th></tr>
                                </thead>
                                <tbody>
                                    {filteredAccounts.length === 0 ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No accounts found</td></tr>
                                    ) : filteredAccounts.map(a => (
                                        <tr key={a.id}>
                                            <td style={{ fontWeight: 600 }}>{a.name}</td>
                                            <td><span className="badge badge-blue">{a.industry}</span></td>
                                            <td style={{ color: 'var(--muted)' }}>{a.size}</td>
                                            <td style={{ fontWeight: 600 }}>{a.revenue}</td>
                                            <td style={{ color: 'var(--muted)' }}>{a.contactIds.length}</td>
                                            <td>
                                                <button className="btn btn-sm btn-danger" onClick={() => deleteAccount(a.id)}>
                                                    <X size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Add {tab === 'contacts' ? 'Contact' : 'Account'}</div>
                            <button className="btn btn-sm btn-outline" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        {tab === 'contacts' ? (
                            <>
                                <div className="form-group"><label>Name *</label><input value={cf.name} onChange={e => setCf({ ...cf, name: e.target.value })} placeholder="Full name" /></div>
                                <div className="form-group"><label>Email *</label><input value={cf.email} onChange={e => setCf({ ...cf, email: e.target.value })} placeholder="email@example.com" /></div>
                                <div className="form-group"><label>Phone</label><input value={cf.phone} onChange={e => setCf({ ...cf, phone: e.target.value })} placeholder="+1 555-0000" /></div>
                                <div className="form-group"><label>Company</label><input value={cf.company} onChange={e => setCf({ ...cf, company: e.target.value })} placeholder="Company name" /></div>
                                <div className="form-group"><label>Role</label><input value={cf.role} onChange={e => setCf({ ...cf, role: e.target.value })} placeholder="Job title" /></div>
                                <button className="btn btn-primary" onClick={addContact} style={{ width: '100%', marginTop: '0.5rem' }}>Add Contact</button>
                            </>
                        ) : (
                            <>
                                <div className="form-group"><label>Company Name *</label><input value={af.name} onChange={e => setAf({ ...af, name: e.target.value })} placeholder="Company name" /></div>
                                <div className="form-group"><label>Industry</label><input value={af.industry} onChange={e => setAf({ ...af, industry: e.target.value })} placeholder="e.g. Technology" /></div>
                                <div className="form-group">
                                    <label>Company Size</label>
                                    <select value={af.size} onChange={e => setAf({ ...af, size: e.target.value })}>
                                        <option value="">Select size</option>
                                        <option>1-10</option><option>11-50</option><option>51-200</option><option>201-500</option><option>501-1000</option><option>1000+</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Revenue</label><input value={af.revenue} onChange={e => setAf({ ...af, revenue: e.target.value })} placeholder="e.g. $5M" /></div>
                                <div className="form-group"><label>Website</label><input value={af.website} onChange={e => setAf({ ...af, website: e.target.value })} placeholder="https://..." /></div>
                                <button className="btn btn-primary" onClick={addAccount} style={{ width: '100%', marginTop: '0.5rem' }}>Add Account</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
