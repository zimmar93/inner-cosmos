'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, X, ArrowRight } from 'lucide-react';
import { leadsStore, opportunitiesStore, CrmLead, crmId, LeadStatus, LeadSource, LeadScore } from '@/lib/crm-data';

const STATUS_BADGE: Record<LeadStatus, string> = { NEW: 'badge-blue', CONTACTED: 'badge-purple', QUALIFIED: 'badge-green', UNQUALIFIED: 'badge-red' };
const SOURCE_LABELS: Record<LeadSource, string> = { WEB: 'Web', REFERRAL: 'Referral', SOCIAL: 'Social', EMAIL: 'Email', EVENT: 'Event', COLD_CALL: 'Cold Call', OTHER: 'Other' };

export default function LeadsPage() {
    const [leads, setLeads] = useState<CrmLead[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { setLeads(leadsStore.getAll()); }, []);

    const filtered = leads.filter(l => {
        const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: 'WEB' as LeadSource, score: 'WARM' as LeadScore, notes: '' });

    const addLead = () => {
        if (!form.name || !form.email) return;
        const lead: CrmLead = { id: crmId(), ...form, status: 'NEW', createdAt: new Date().toISOString().slice(0, 10) };
        setLeads(leadsStore.create(lead));
        setForm({ name: '', email: '', phone: '', company: '', source: 'WEB', score: 'WARM', notes: '' });
        setShowModal(false);
    };

    const convertToOpportunity = (lead: CrmLead) => {
        const opp = {
            id: crmId(),
            title: `${lead.company} — New Opportunity`,
            company: lead.company,
            contactName: lead.name,
            value: 10000,
            probability: 20,
            stage: 'PROSPECTING' as const,
            expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
            createdAt: new Date().toISOString().slice(0, 10),
        };
        opportunitiesStore.create(opp);
        setLeads(leadsStore.update(lead.id, { status: 'QUALIFIED' }));
    };

    const deleteLead = (id: string) => setLeads(leadsStore.remove(id));

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Leads</div>
                    <div className="page-subtitle">Capture, score, and qualify leads</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> Add Lead
                </button>
            </div>
            <div className="erp-content">
                <div className="crm-filter-bar">
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                        <input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2rem' }} />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="ALL">All Statuses</option>
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="QUALIFIED">Qualified</option>
                        <option value="UNQUALIFIED">Unqualified</option>
                    </select>
                </div>

                <div className="card">
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr><th>Name</th><th>Company</th><th>Source</th><th>Score</th><th>Status</th><th>Created</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No leads found</td></tr>
                                ) : filtered.map(l => (
                                    <tr key={l.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{l.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{l.email}</div>
                                        </td>
                                        <td>{l.company}</td>
                                        <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{SOURCE_LABELS[l.source]}</td>
                                        <td>
                                            <span className="score-dot" style={{ display: 'inline-block' }}>
                                                <span className={`score-dot ${l.score.toLowerCase()}`} />
                                            </span>
                                            {l.score}
                                        </td>
                                        <td><span className={`badge ${STATUS_BADGE[l.status]}`}>{l.status}</span></td>
                                        <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{l.createdAt}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                {l.status !== 'QUALIFIED' && l.status !== 'UNQUALIFIED' && (
                                                    <button className="btn btn-sm btn-primary" onClick={() => convertToOpportunity(l)} title="Convert to opportunity">
                                                        <ArrowRight size={14} />
                                                    </button>
                                                )}
                                                <button className="btn btn-sm btn-danger" onClick={() => deleteLead(l.id)}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Add Lead</div>
                            <button className="btn btn-sm btn-outline" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <div className="form-group"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
                        <div className="form-group"><label>Email *</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></div>
                        <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 555-0000" /></div>
                        <div className="form-group"><label>Company</label><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></div>
                        <div className="form-group">
                            <label>Source</label>
                            <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value as LeadSource })}>
                                <option value="WEB">Web</option><option value="REFERRAL">Referral</option><option value="SOCIAL">Social</option>
                                <option value="EMAIL">Email</option><option value="EVENT">Event</option><option value="COLD_CALL">Cold Call</option><option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Score</label>
                            <select value={form.score} onChange={e => setForm({ ...form, score: e.target.value as LeadScore })}>
                                <option value="HOT">Hot</option><option value="WARM">Warm</option><option value="COLD">Cold</option>
                            </select>
                        </div>
                        <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={3} /></div>
                        <button className="btn btn-primary" onClick={addLead} style={{ width: '100%', marginTop: '0.5rem' }}>Add Lead</button>
                    </div>
                </div>
            )}
        </>
    );
}
