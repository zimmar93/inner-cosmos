'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { TrendingUp, ShoppingBag, AlertTriangle, Clock } from 'lucide-react';

function StatSkeleton() {
    return (
        <div className="card stat-card">
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 28, width: '55%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 13, width: '70%' }} />
            </div>
        </div>
    );
}

export default function DashboardMetricsPage() {
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        api.get('/orders/dashboard').then((r) => setMetrics(r.data)).catch(() => { });
    }, []);

    const stats = metrics
        ? [
            { label: 'Total Revenue', value: `$${Number(metrics.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: '#7c3aed', bg: '#ede9fe', trend: null },
            { label: 'Orders Today', value: metrics.ordersToday, icon: ShoppingBag, color: '#16a34a', bg: '#dcfce7', trend: null },
            { label: 'Pending Orders', value: metrics.pendingOrders, icon: Clock, color: '#d97706', bg: '#fef9c3', trend: null },
            { label: 'Low Stock Items', value: metrics.lowStockCount, icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2', trend: null },
        ]
        : [];

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Dashboard</div>
                    <div className="page-subtitle">Welcome to Inner Cosmos ERP</div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 500 }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
            <div className="erp-content">
                {!metrics ? (
                    <div className="stats-grid">
                        {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                        <div className="stats-grid">
                            {stats.map((s) => (
                                <div key={s.label} className="card stat-card">
                                    <div className="stat-icon" style={{ background: s.bg }}>
                                        <s.icon size={20} color={s.color} />
                                    </div>
                                    <div>
                                        <div className="stat-value">{s.value}</div>
                                        <div className="stat-label">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Quick links</h3>
                                {[
                                    { label: 'Manage Products', href: '/dashboard/products' },
                                    { label: 'Inventory Control', href: '/dashboard/inventory' },
                                    { label: 'View Orders', href: '/dashboard/orders' },
                                    { label: 'Customer List', href: '/dashboard/customers' },
                                    { label: 'Invoices', href: '/dashboard/invoices' },
                                    { label: 'CRM Dashboard', href: '/dashboard/crm' },
                                ].map((l) => (
                                    <a key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)', fontWeight: 500, fontSize: '0.875rem', transition: 'color 0.15s' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}>
                                        {l.label}
                                        <span style={{ color: 'var(--primary)', opacity: 0.6 }}>→</span>
                                    </a>
                                ))}
                            </div>
                            <div className="card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>System overview</h3>
                                {[
                                    { label: 'Total Orders', value: metrics.totalOrders },
                                    { label: 'Revenue (Paid + Shipped)', value: `$${Number(metrics.totalRevenue).toFixed(2)}` },
                                    { label: 'Pending Orders', value: metrics.pendingOrders },
                                    { label: 'Low Stock Alerts', value: metrics.lowStockCount },
                                ].map((m) => (
                                    <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                                        <span style={{ color: 'var(--muted)' }}>{m.label}</span>
                                        <span style={{ fontWeight: 700 }}>{m.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
