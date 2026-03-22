'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Phone, Mail, Calendar, StickyNote, CheckSquare } from 'lucide-react';
import { activitiesStore, CrmActivity, ActivityType, crmId } from '@/lib/crm-data';

const TYPE_CONFIG: Record<ActivityType, { icon: any; className: string; label: string }> = {
    CALL: { icon: Phone, className: 'call', label: 'Call' },
    EMAIL: { icon: Mail, className: 'email', label: 'Email' },
    MEETING: { icon: Calendar, className: 'meeting', label: 'Meeting' },
    NOTE: { icon: StickyNote, className: 'note', label: 'Note' },
    TASK: { icon: CheckSquare, className: 'task', label: 'Task' },
};

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<CrmActivity[]>([]);
    const [filter, setFilter] = useState<string>('ALL');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { setActivities(activitiesStore.getAll()); }, []);

    const filtered = filter === 'ALL' ? activities : activities.filter(a => a.type === filter);

    const [form, setForm] = useState({ type: 'CALL' as ActivityType, subject: '', contactName: '', dealTitle: '', notes: '', duration: '', outcome: '' });

    const addActivity = () => {
        if (!form.subject) return;
        const act: CrmActivity = {
            id: crmId(),
            type: form.type,
            subject: form.subject,
            contactName: form.contactName || undefined,
            dealTitle: form.dealTitle || undefined,
            notes: form.notes || undefined,
            duration: form.duration ? Number(form.duration) : undefined,
            outcome: form.outcome || undefined,
            timestamp: new Date().toISOString(),
        };
        setActivities(activitiesStore.create(act));
        setForm({ type: 'CALL', subject: '', contactName: '', dealTitle: '', notes: '', duration: '', outcome: '' });
        setShowModal(false);
    };

    const deleteActivity = (id: string) => setActivities(activitiesStore.remove(id));

    const formatTime = (ts: string) => {
        const d = new Date(ts);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Activities</div>
                    <div className="page-subtitle">Track calls, emails, meetings, notes, and tasks</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> Log Activity
                </button>
            </div>
            <div className="erp-content">
                <div className="crm-tabs">
                    {['ALL', 'CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK'].map(t => (
                        <button key={t} className={`crm-tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
                            {t === 'ALL' ? 'All' : TYPE_CONFIG[t as ActivityType].label}
                        </button>
                    ))}
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div className="activity-timeline">
                        {filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No activities found</div>
                        ) : filtered.map(a => {
                            const config = TYPE_CONFIG[a.type];
                            const Icon = config.icon;
                            return (
                                <div key={a.id} className="activity-item">
                                    <div className={`activity-icon ${config.className}`}>
                                        <Icon size={14} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div className="activity-subject">{a.subject}</div>
                                            <div className="activity-detail">
                                                {a.contactName && <span>{a.contactName}</span>}
                                                {a.contactName && a.dealTitle && <span> · </span>}
                                                {a.dealTitle && <span>{a.dealTitle}</span>}
                                                {a.duration && <span> · {a.duration} min</span>}
                                                {a.outcome && <span> · {a.outcome}</span>}
                                            </div>
                                            {a.notes && <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.3rem', fontStyle: 'italic' }}>{a.notes}</div>}
                                            <div className="activity-time">{formatTime(a.timestamp)}</div>
                                        </div>
                                        <button className="btn btn-sm btn-outline" onClick={() => deleteActivity(a.id)} style={{ marginLeft: '1rem', flexShrink: 0 }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Log Activity</div>
                            <button className="btn btn-sm btn-outline" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as ActivityType })}>
                                <option value="CALL">Call</option><option value="EMAIL">Email</option><option value="MEETING">Meeting</option>
                                <option value="NOTE">Note</option><option value="TASK">Task</option>
                            </select>
                        </div>
                        <div className="form-group"><label>Subject *</label><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Activity subject" /></div>
                        <div className="form-group"><label>Contact</label><input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} placeholder="Contact name" /></div>
                        <div className="form-group"><label>Related Deal</label><input value={form.dealTitle} onChange={e => setForm({ ...form, dealTitle: e.target.value })} placeholder="Deal title" /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group"><label>Duration (min)</label><input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="0" /></div>
                            <div className="form-group"><label>Outcome</label><input value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })} placeholder="e.g. Positive" /></div>
                        </div>
                        <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={3} /></div>
                        <button className="btn btn-primary" onClick={addActivity} style={{ width: '100%', marginTop: '0.5rem' }}>Log Activity</button>
                    </div>
                </div>
            )}
        </>
    );
}
