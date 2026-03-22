'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Mail, Smartphone, Share2, CalendarDays } from 'lucide-react';
import { campaignsStore, CrmCampaign, CampaignType, CampaignStatus, crmId } from '@/lib/crm-data';

const TYPE_ICON: Record<CampaignType, any> = { EMAIL: Mail, SMS: Smartphone, SOCIAL: Share2, EVENT: CalendarDays };
const STATUS_BADGE: Record<CampaignStatus, string> = { DRAFT: 'badge-yellow', ACTIVE: 'badge-green', PAUSED: 'badge-blue', COMPLETED: 'badge-purple' };

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<CrmCampaign[]>([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { setCampaigns(campaignsStore.getAll()); }, []);

    const [form, setForm] = useState({ name: '', type: 'EMAIL' as CampaignType, budget: '', startDate: '' });

    const addCampaign = () => {
        if (!form.name) return;
        const camp: CrmCampaign = {
            id: crmId(),
            name: form.name,
            type: form.type,
            status: 'DRAFT',
            budget: Number(form.budget) || 0,
            spent: 0, sent: 0, opened: 0, clicked: 0, converted: 0,
            startDate: form.startDate || new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString().slice(0, 10),
        };
        setCampaigns(campaignsStore.create(camp));
        setForm({ name: '', type: 'EMAIL', budget: '', startDate: '' });
        setShowModal(false);
    };

    const deleteCampaign = (id: string) => setCampaigns(campaignsStore.remove(id));

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Campaigns</div>
                    <div className="page-subtitle">Manage marketing campaigns and track ROI</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> New Campaign
                </button>
            </div>
            <div className="erp-content">
                <div className="campaign-grid">
                    {campaigns.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--muted)', padding: '3rem' }}>No campaigns yet. Create your first campaign!</div>
                    ) : campaigns.map(c => {
                        const Icon = TYPE_ICON[c.type];
                        const roi = c.spent > 0 ? ((c.converted * 50 - c.spent) / c.spent * 100).toFixed(0) : '—';
                        const budgetPct = c.budget > 0 ? Math.min((c.spent / c.budget) * 100, 100) : 0;
                        return (
                            <div key={c.id} className="campaign-card">
                                <div className="campaign-card-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon size={18} color="#6c63ff" />
                                        </div>
                                        <div>
                                            <div className="campaign-card-name">{c.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.type} · {c.startDate}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className={`badge ${STATUS_BADGE[c.status]}`}>{c.status}</span>
                                        <button className="btn btn-sm btn-outline" onClick={() => deleteCampaign(c.id)} style={{ padding: '0.3rem' }}><X size={14} /></button>
                                    </div>
                                </div>

                                {/* Budget progress */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)' }}>
                                    <span>Budget: ${c.budget.toLocaleString()}</span>
                                    <span>Spent: ${c.spent.toLocaleString()}</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${budgetPct}%`, background: budgetPct > 90 ? '#ef4444' : '#6c63ff' }} />
                                </div>

                                {/* Stats */}
                                <div className="campaign-stat-row">
                                    <div className="campaign-stat">
                                        <div className="campaign-stat-value">{c.sent.toLocaleString()}</div>
                                        <div className="campaign-stat-label">Sent</div>
                                    </div>
                                    <div className="campaign-stat">
                                        <div className="campaign-stat-value">{c.opened.toLocaleString()}</div>
                                        <div className="campaign-stat-label">Opened</div>
                                    </div>
                                    <div className="campaign-stat">
                                        <div className="campaign-stat-value">{c.clicked.toLocaleString()}</div>
                                        <div className="campaign-stat-label">Clicked</div>
                                    </div>
                                    <div className="campaign-stat">
                                        <div className="campaign-stat-value">{c.converted}</div>
                                        <div className="campaign-stat-label">Converted</div>
                                    </div>
                                </div>

                                {/* ROI */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>ROI</span>
                                    <span style={{ fontWeight: 800, fontSize: '1rem', color: Number(roi) > 0 ? '#16a34a' : roi === '—' ? 'var(--muted)' : '#ef4444' }}>
                                        {roi === '—' ? '—' : `${roi}%`}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">New Campaign</div>
                            <button className="btn btn-sm btn-outline" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <div className="form-group"><label>Campaign Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Spring Product Launch" /></div>
                        <div className="form-group">
                            <label>Type</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as CampaignType })}>
                                <option value="EMAIL">Email</option><option value="SMS">SMS</option><option value="SOCIAL">Social</option><option value="EVENT">Event</option>
                            </select>
                        </div>
                        <div className="form-group"><label>Budget ($)</label><input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="0" /></div>
                        <div className="form-group"><label>Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
                        <button className="btn btn-primary" onClick={addCampaign} style={{ width: '100%', marginTop: '0.5rem' }}>Create Campaign</button>
                    </div>
                </div>
            )}
        </>
    );
}
