'use client';
import { useState, useEffect } from 'react';
import { Plus, X, List, Kanban, GripVertical } from 'lucide-react';
import { opportunitiesStore, CrmOpportunity, OpportunityStage, crmId } from '@/lib/crm-data';

const STAGES: { key: OpportunityStage; label: string; color: string }[] = [
    { key: 'PROSPECTING', label: 'Prospecting', color: '#94a3b8' },
    { key: 'QUALIFICATION', label: 'Qualification', color: '#6366f1' },
    { key: 'PROPOSAL', label: 'Proposal', color: '#f59e0b' },
    { key: 'NEGOTIATION', label: 'Negotiation', color: '#22c55e' },
    { key: 'CLOSED_WON', label: 'Closed Won', color: '#16a34a' },
    { key: 'CLOSED_LOST', label: 'Closed Lost', color: '#ef4444' },
];

export default function PipelinePage() {
    const [opps, setOpps] = useState<CrmOpportunity[]>([]);
    const [view, setView] = useState<'kanban' | 'list'>('kanban');
    const [showModal, setShowModal] = useState(false);
    const [dragging, setDragging] = useState<string | null>(null);

    useEffect(() => { setOpps(opportunitiesStore.getAll()); }, []);

    const [form, setForm] = useState({ title: '', company: '', contactName: '', value: '', probability: '50', expectedCloseDate: '', stage: 'PROSPECTING' as OpportunityStage });

    const addDeal = () => {
        if (!form.title || !form.company) return;
        const opp: CrmOpportunity = {
            id: crmId(),
            title: form.title,
            company: form.company,
            contactName: form.contactName,
            value: Number(form.value) || 0,
            probability: Number(form.probability) || 50,
            stage: form.stage,
            expectedCloseDate: form.expectedCloseDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
            createdAt: new Date().toISOString().slice(0, 10),
        };
        setOpps(opportunitiesStore.create(opp));
        setForm({ title: '', company: '', contactName: '', value: '', probability: '50', expectedCloseDate: '', stage: 'PROSPECTING' });
        setShowModal(false);
    };

    const moveToStage = (id: string, stage: OpportunityStage) => {
        setOpps(opportunitiesStore.update(id, { stage, probability: stage === 'CLOSED_WON' ? 100 : stage === 'CLOSED_LOST' ? 0 : undefined }));
    };

    const deleteDeal = (id: string) => setOpps(opportunitiesStore.remove(id));

    const handleDragStart = (id: string) => setDragging(id);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (stage: OpportunityStage) => {
        if (dragging) moveToStage(dragging, stage);
        setDragging(null);
    };

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Pipeline</div>
                    <div className="page-subtitle">Track and manage your sales opportunities</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="view-toggle">
                        <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}><Kanban size={14} /> Kanban</button>
                        <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={14} /> List</button>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Deal</button>
                </div>
            </div>
            <div className="erp-content">
                {view === 'kanban' ? (
                    <div className="kanban-board">
                        {STAGES.map(stage => {
                            const stageOpps = opps.filter(o => o.stage === stage.key);
                            const total = stageOpps.reduce((s, o) => s + o.value, 0);
                            return (
                                <div
                                    key={stage.key}
                                    className="kanban-column"
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(stage.key)}
                                >
                                    <div className="kanban-column-header">
                                        <div className="kanban-column-title">
                                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color, display: 'inline-block' }} />
                                            {stage.label}
                                            <span className="kanban-column-count">{stageOpps.length}</span>
                                        </div>
                                        <div className="kanban-column-total">${(total / 1000).toFixed(0)}K</div>
                                    </div>
                                    <div className="kanban-cards">
                                        {stageOpps.map(opp => (
                                            <div
                                                key={opp.id}
                                                className="kanban-card"
                                                draggable
                                                onDragStart={() => handleDragStart(opp.id)}
                                            >
                                                <div className="kanban-card-title">{opp.title}</div>
                                                <div className="kanban-card-company">{opp.company} · {opp.contactName}</div>
                                                <div className="kanban-card-meta">
                                                    <span className="kanban-card-value">${opp.value.toLocaleString()}</span>
                                                    <span className="kanban-card-prob" style={{
                                                        background: opp.probability >= 70 ? '#dcfce7' : opp.probability >= 40 ? '#fef9c3' : '#fee2e2',
                                                        color: opp.probability >= 70 ? '#16a34a' : opp.probability >= 40 ? '#ca8a04' : '#dc2626',
                                                    }}>
                                                        {opp.probability}%
                                                    </span>
                                                    <span className="kanban-card-date">{new Date(opp.expectedCloseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card">
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr><th>Deal</th><th>Company</th><th>Value</th><th>Probability</th><th>Stage</th><th>Close Date</th><th></th></tr>
                                </thead>
                                <tbody>
                                    {opps.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No deals yet</td></tr>
                                    ) : opps.map(o => {
                                        const stageInfo = STAGES.find(s => s.key === o.stage)!;
                                        return (
                                            <tr key={o.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{o.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{o.contactName}</div>
                                                </td>
                                                <td>{o.company}</td>
                                                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${o.value.toLocaleString()}</td>
                                                <td><span className={`badge ${o.probability >= 70 ? 'badge-green' : o.probability >= 40 ? 'badge-yellow' : 'badge-red'}`}>{o.probability}%</span></td>
                                                <td>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: stageInfo.color }} />
                                                        {stageInfo.label}
                                                    </span>
                                                </td>
                                                <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{new Date(o.expectedCloseDate).toLocaleDateString()}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-danger" onClick={() => deleteDeal(o.id)}><X size={14} /></button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Add Deal</div>
                            <button className="btn btn-sm btn-outline" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <div className="form-group"><label>Deal Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Platform License" /></div>
                        <div className="form-group"><label>Company *</label><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></div>
                        <div className="form-group"><label>Contact Name</label><input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} placeholder="Primary contact" /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group"><label>Value ($)</label><input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="0" /></div>
                            <div className="form-group"><label>Probability (%)</label><input type="number" value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })} min="0" max="100" /></div>
                        </div>
                        <div className="form-group">
                            <label>Stage</label>
                            <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as OpportunityStage })}>
                                {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label>Expected Close Date</label><input type="date" value={form.expectedCloseDate} onChange={e => setForm({ ...form, expectedCloseDate: e.target.value })} /></div>
                        <button className="btn btn-primary" onClick={addDeal} style={{ width: '100%', marginTop: '0.5rem' }}>Add Deal</button>
                    </div>
                </div>
            )}
        </>
    );
}
