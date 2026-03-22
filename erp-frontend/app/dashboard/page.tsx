'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { TrendingUp, ShoppingBag, AlertTriangle, Clock } from 'lucide-react';

export default function DashboardMetricsPage() {
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        api.get('/orders/dashboard').then((r) => setMetrics(r.data)).catch(() => { });
    }, []);

    const stats = metrics
        ? [
            { label: 'Total Revenue', value: `$${Number(metrics.totalRevenue).toFixed(2)}`, icon: TrendingUp, color: '#6c63ff', bg: '#ede9fe' },
            { label: 'Orders Today', value: metrics.ordersToday, icon: ShoppingBag, color: '#22c55e', bg: '#dcfce7' },
            { label: 'Pending Orders', value: metrics.pendingOrders, icon: Clock, color: '#f59e0b', bg: '#fef9c3' },
            { label: 'Low Stock Items', value: metrics.lowStockCount, icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2' },
        ]
        : [];

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Dashboard</div>
                    <div className="page-subtitle">Welcome to Inner Cosmos ERP</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
            <div className="erp-content">
                {!metrics ? (
                    <div className="loading-spinner" />
                ) : (
                    <>
                        <div className="stats-grid">
                            {stats.map((s) => (
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Quick Links</h3>
                                {[
                                    { label: 'Manage Products', href: '/dashboard/products' },
                                    { label: 'Inventory Control', href: '/dashboard/inventory' },
                                    { label: 'View Orders', href: '/dashboard/orders' },
                                    { label: 'Customer List', href: '/dashboard/customers' },
                                    { label: 'Download Invoices', href: '/dashboard/invoices' },
                                    { label: 'CRM Dashboard', href: '/dashboard/crm' },
                                ].map((l) => (
                                    <a key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)', fontWeight: 500, fontSize: '0.9rem' }}>
                                        {l.label}
                                        <span style={{ color: 'var(--primary)' }}>→</span>
                                    </a>
                                ))}
                            </div>
                            <div className="card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>System Overview</h3>
                                {[
                                    { label: 'Total Orders', value: metrics.totalOrders },
                                    { label: 'Revenue (Paid+Shipped)', value: `$${Number(metrics.totalRevenue).toFixed(2)}` },
                                    { label: 'Pending Orders', value: metrics.pendingOrders },
                                    { label: 'Low Stock Alerts', value: metrics.lowStockCount },
                                ].map((m) => (
                                    <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
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
