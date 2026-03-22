'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, Users, Target, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { opportunitiesStore, activitiesStore, leadsStore, CrmOpportunity, CrmActivity } from '@/lib/crm-data';

const STAGE_COLORS: Record<string, string> = {
    PROSPECTING: '#94a3b8',
    QUALIFICATION: '#6366f1',
    PROPOSAL: '#f59e0b',
    NEGOTIATION: '#22c55e',
    CLOSED_WON: '#16a34a',
    CLOSED_LOST: '#ef4444',
};
const STAGE_LABELS: Record<string, string> = {
    PROSPECTING: 'Prospecting',
    QUALIFICATION: 'Qualification',
    PROPOSAL: 'Proposal',
    NEGOTIATION: 'Negotiation',
    CLOSED_WON: 'Closed Won',
    CLOSED_LOST: 'Closed Lost',
};

export default function CrmDashboardPage() {
    const [opps, setOpps] = useState<CrmOpportunity[]>([]);
    const [activities, setActivities] = useState<CrmActivity[]>([]);
    const [leadCount, setLeadCount] = useState(0);

    useEffect(() => {
        setOpps(opportunitiesStore.getAll());
        setActivities(activitiesStore.getAll());
        setLeadCount(leadsStore.getAll().length);
    }, []);

    const openDeals = opps.filter(o => !['CLOSED_WON', 'CLOSED_LOST'].includes(o.stage));
    const pipelineValue = openDeals.reduce((s, o) => s + o.value, 0);
    const weightedValue = openDeals.reduce((s, o) => s + o.value * o.probability / 100, 0);
    const wonDeals = opps.filter(o => o.stage === 'CLOSED_WON');
    const totalDeals = opps.filter(o => ['CLOSED_WON', 'CLOSED_LOST'].includes(o.stage));
    const conversionRate = totalDeals.length > 0 ? Math.round(wonDeals.length / totalDeals.length * 100) : 0;
    const avgDealSize = wonDeals.length > 0 ? Math.round(wonDeals.reduce((s, o) => s + o.value, 0) / wonDeals.length) : 0;

    const stats = [
        { label: 'Open Deals', value: openDeals.length, icon: Target, color: '#6c63ff', bg: '#ede9fe' },
        { label: 'Pipeline Value', value: `$${(pipelineValue / 1000).toFixed(0)}K`, icon: DollarSign, color: '#22c55e', bg: '#dcfce7' },
        { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: '#f59e0b', bg: '#fef9c3' },
        { label: 'Avg Deal Size', value: `$${(avgDealSize / 1000).toFixed(1)}K`, icon: DollarSign, color: '#6366f1', bg: '#e0e7ff' },
    ];

    // Funnel data
    const stages = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'] as const;
    const funnelData = stages.map(stage => ({
        stage: STAGE_LABELS[stage],
        count: opps.filter(o => o.stage === stage).length,
        value: opps.filter(o => o.stage === stage).reduce((s, o) => s + o.value, 0),
        color: STAGE_COLORS[stage],
    }));

    // Revenue trend (mock monthly data)
    const monthlyData = [
        { month: 'Oct', revenue: 32000 },
        { month: 'Nov', revenue: 41000 },
        { month: 'Dec', revenue: 28000 },
        { month: 'Jan', revenue: 52000 },
        { month: 'Feb', revenue: 48000 },
        { month: 'Mar', revenue: wonDeals.reduce((s, o) => s + o.value, 0) || 9500 },
    ];

    // Deals closing soon (within 30 days)
    const closingSoon = openDeals
        .filter(o => new Date(o.expectedCloseDate).getTime() - Date.now() < 30 * 86400000)
        .sort((a, b) => new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime())
        .slice(0, 5);

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">CRM Dashboard</div>
                    <div className="page-subtitle">Sales pipeline overview & performance metrics</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge badge-purple">{leadCount} Active Leads</span>
                </div>
            </div>
            <div className="erp-content">
                {/* Stats */}
                <div className="stats-grid">
                    {stats.map(s => (
                        <div key={s.label} className="card stat-card">
                            <div className="stat-icon" style={{ background: s.bg }}>
                                <s.icon size={24} color={s.color} />
                            </div>
                            <div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Pipeline Funnel */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Pipeline Funnel</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="stage" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                                    {funnelData.map((d, i) => (
                                        <Cell key={i} fill={d.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Revenue Trend */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Revenue Trend</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(v) => `$${v / 1000}K`} />
                                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                                <Line type="monotone" dataKey="revenue" stroke="#6c63ff" strokeWidth={3} dot={{ r: 5, fill: '#6c63ff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bottom row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Deals Closing Soon */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Deals Closing Soon</h3>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr><th>Deal</th><th>Value</th><th>Close Date</th><th>Prob</th></tr>
                                </thead>
                                <tbody>
                                    {closingSoon.length === 0 ? (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No upcoming deals</td></tr>
                                    ) : closingSoon.map(d => (
                                        <tr key={d.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{d.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{d.company}</div>
                                            </td>
                                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${d.value.toLocaleString()}</td>
                                            <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{new Date(d.expectedCloseDate).toLocaleDateString()}</td>
                                            <td><span className="badge badge-blue">{d.probability}%</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Recent Activities</h3>
                        {activities.slice(0, 5).map(a => (
                            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
                                    background: a.type === 'CALL' ? '#dbeafe' : a.type === 'EMAIL' ? '#dcfce7' : a.type === 'MEETING' ? '#ede9fe' : a.type === 'NOTE' ? '#fef9c3' : '#fee2e2',
                                    color: a.type === 'CALL' ? '#2563eb' : a.type === 'EMAIL' ? '#16a34a' : a.type === 'MEETING' ? '#7c3aed' : a.type === 'NOTE' ? '#ca8a04' : '#dc2626',
                                }}>
                                    {a.type.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.subject}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{a.contactName || a.dealTitle} · {new Date(a.timestamp).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Weighted Forecast */}
                    <div className="card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontWeight: 700 }}>Weighted Forecast</h3>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>${(weightedValue / 1000).toFixed(1)}K</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {stages.filter(s => s !== 'CLOSED_WON').map(stage => {
                                const stageOpps = openDeals.filter(o => o.stage === stage);
                                const stageWeighted = stageOpps.reduce((s, o) => s + o.value * o.probability / 100, 0);
                                const pct = weightedValue > 0 ? (stageWeighted / weightedValue * 100) : 0;
                                return (
                                    <div key={stage} style={{ flex: pct || 1, textAlign: 'center' }}>
                                        <div style={{ height: 8, background: STAGE_COLORS[stage], borderRadius: 4, marginBottom: '0.4rem' }} />
                                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{STAGE_LABELS[stage]}</div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>${(stageWeighted / 1000).toFixed(1)}K</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
