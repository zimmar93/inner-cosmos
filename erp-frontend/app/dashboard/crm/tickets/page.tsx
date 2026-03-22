'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, X, AlertTriangle, Clock } from 'lucide-react';
import { ticketsStore, CrmTicket, TicketPriority, TicketStatus, crmId } from '@/lib/crm-data';

const PRIORITY_BADGE: Record<TicketPriority, string> = { CRITICAL: 'badge-red', HIGH: 'badge-yellow', MEDIUM: 'badge-blue', LOW: 'badge-green' };
const STATUS_BADGE: Record<TicketStatus, string> = { OPEN: 'badge-blue', IN_PROGRESS: 'badge-yellow', RESOLVED: 'badge-green', CLOSED: 'badge-purple' };

export default function TicketsPage() {
    const [tickets, setTickets] = useState<CrmTicket[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { setTickets(ticketsStore.getAll()); }, []);

    const filtered = tickets.filter(t => {
        const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.customerName.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const [form, setForm] = useState({ subject: '', description: '', customerName: '', customerEmail: '', priority: 'MEDIUM' as TicketPriority, assignedTo: '' });

    const addTicket = () => {
        if (!form.subject || !form.customerName) return;
        const ticket: CrmTicket = {
            id: crmId(),
            ...form,
            status: 'OPEN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setTickets(ticketsStore.create(ticket));
        setForm({ subject: '', description: '', customerName: '', customerEmail: '', priority: 'MEDIUM', assignedTo: '' });
        setShowModal(false);
    };

    const updateStatus = (id: string, status: TicketStatus) => {
        setTickets(ticketsStore.update(id, { status, updatedAt: new Date().toISOString() }));
    };

    const deleteTicket = (id: string) => setTickets(ticketsStore.remove(id));

    const openCount = tickets.filter(t => t.status === 'OPEN').length;
    const criticalCount = tickets.filter(t => t.priority === 'CRITICAL' && t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Tickets</div>
                    <div className="page-subtitle">Customer support and case management</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {criticalCount > 0 && (
                        <span className="badge badge-red" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={12} /> {criticalCount} Critical
                        </span>
                    )}
                    <span className="badge badge-blue">{openCount} Open</span>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={16} /> New Ticket
                    </button>
                </div>
            </div>
            <div className="erp-content">
                <div className="crm-filter-bar">
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                        <input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2rem' }} />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="ALL">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>

                <div className="card">
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr><th>ID</th><th>Subject</th><th>Customer</th><th>Priority</th><th>Status</th><th>Assigned To</th><th>SLA</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No tickets found</td></tr>
                                ) : filtered.map(t => {
                                    const slaExpired = t.slaDeadline && new Date(t.slaDeadline) < new Date() && t.status !== 'RESOLVED' && t.status !== 'CLOSED';
                                    return (
                                        <tr key={t.id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>{t.id.slice(-6).toUpperCase()}</td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{t.subject}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{t.customerName}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{t.customerEmail}</div>
                                            </td>
                                            <td><span className={`badge ${PRIORITY_BADGE[t.priority]}`}>{t.priority}</span></td>
                                            <td>
                                                <select
                                                    value={t.status}
                                                    onChange={e => updateStatus(t.id, e.target.value as TicketStatus)}
                                                    style={{ width: 'auto', fontSize: '0.8rem', padding: '0.3rem 0.5rem', borderRadius: 6 }}
                                                >
                                                    <option value="OPEN">Open</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="RESOLVED">Resolved</option>
                                                    <option value="CLOSED">Closed</option>
                                                </select>
                                            </td>
                                            <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{t.assignedTo || '—'}</td>
                                            <td>
                                                {t.slaDeadline ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: slaExpired ? '#ef4444' : 'var(--muted)' }}>
                                                        <Clock size={12} />
                                                        {new Date(t.slaDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        {slaExpired && <span style={{ fontWeight: 700, color: '#ef4444' }}> BREACHED</span>}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-danger" onClick={() => deleteTicket(t.id)}>
                                                    <X size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">New Ticket</div>
                            <button className="btn btn-sm btn-outline" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <div className="form-group"><label>Subject *</label><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of the issue" /></div>
                        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed description..." rows={3} /></div>
                        <div className="form-group"><label>Customer Name *</label><input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Customer name" /></div>
                        <div className="form-group"><label>Customer Email</label><input value={form.customerEmail} onChange={e => setForm({ ...form, customerEmail: e.target.value })} placeholder="email@example.com" /></div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TicketPriority })}>
                                <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
                            </select>
                        </div>
                        <div className="form-group"><label>Assign To</label><input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} placeholder="Team or person" /></div>
                        <button className="btn btn-primary" onClick={addTicket} style={{ width: '100%', marginTop: '0.5rem' }}>Create Ticket</button>
                    </div>
                </div>
            )}
        </>
    );
}
