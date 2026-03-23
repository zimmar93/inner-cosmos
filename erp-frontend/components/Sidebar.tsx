'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import Cookies from 'js-cookie';
import {
    LayoutDashboard, Package, Archive, ShoppingBag,
    Users, FileText, LogOut, Palette, Target,
    Users2, Megaphone, Kanban, Activity, Headphones, ChevronDown,
    Globe, Search, Blocks, LayoutTemplate,
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/products', label: 'Products', icon: Package },
    { href: '/dashboard/inventory', label: 'Inventory', icon: Archive },
    { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/dashboard/customers', label: 'Customers', icon: Users },
    { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
];

const crmItems = [
    { href: '/dashboard/crm', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/crm/contacts', label: 'Contacts', icon: Users2 },
    { href: '/dashboard/crm/leads', label: 'Leads', icon: Target },
    { href: '/dashboard/crm/pipeline', label: 'Pipeline', icon: Kanban },
    { href: '/dashboard/crm/activities', label: 'Activities', icon: Activity },
    { href: '/dashboard/crm/campaigns', label: 'Campaigns', icon: Megaphone },
    { href: '/dashboard/crm/tickets', label: 'Tickets', icon: Headphones },
];

const builderItems = [
    { href: '/dashboard/website-builder', label: 'Page Builder', icon: Blocks },
    { href: '/dashboard/website-builder/pages', label: 'Pages', icon: FileText },
    { href: '/dashboard/website-builder/templates', label: 'Templates', icon: LayoutTemplate },
    { href: '/dashboard/website-builder/theme', label: 'Theme Settings', icon: Palette },
    { href: '/dashboard/website-builder/seo', label: 'SEO & Meta', icon: Search },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [crmOpen, setCrmOpen] = useState(pathname.startsWith('/dashboard/crm'));
    const [builderOpen, setBuilderOpen] = useState(pathname.startsWith('/dashboard/website-builder'));

    const logout = () => {
        Cookies.remove('erp_token');
        Cookies.remove('erp_user');
        router.push('/login');
    };

    const isCrmActive = pathname.startsWith('/dashboard/crm');
    const isBuilderActive = pathname.startsWith('/dashboard/website-builder');

    return (
        <nav className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="2.5" fill="white" />
                        <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
                    </svg>
                </div>
                <span>Inner Cosmos</span>
                <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', fontWeight: 500, marginLeft: '0.15rem', marginTop: '2px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>ERP</span>
            </div>

            {/* Main nav */}
            <div className="sidebar-section">
                <div className="sidebar-title">Navigation</div>
                {navItems.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`sidebar-link ${pathname === href ? 'active' : ''}`}
                    >
                        <Icon size={16} />
                        {label}
                    </Link>
                ))}
            </div>

            {/* CRM */}
            <div className="sidebar-section">
                <div className="sidebar-title">CRM</div>
                <div
                    className={`sidebar-section-header ${isCrmActive ? 'active' : ''} ${crmOpen ? 'open' : ''}`}
                    onClick={() => setCrmOpen(!crmOpen)}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <Target size={16} />
                        CRM
                    </span>
                    <ChevronDown size={13} />
                </div>
                <div className={`sidebar-sub-links ${crmOpen ? 'open' : ''}`}>
                    {crmItems.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`sidebar-link ${pathname === href ? 'active' : ''}`}
                        >
                            <Icon size={14} />
                            {label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Website Builder */}
            <div className="sidebar-section">
                <div className="sidebar-title">Website</div>
                <div
                    className={`sidebar-section-header ${isBuilderActive ? 'active' : ''} ${builderOpen ? 'open' : ''}`}
                    onClick={() => setBuilderOpen(!builderOpen)}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <Globe size={16} />
                        Website Builder
                    </span>
                    <ChevronDown size={13} />
                </div>
                <div className={`sidebar-sub-links ${builderOpen ? 'open' : ''}`}>
                    {builderItems.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`sidebar-link ${pathname === href ? 'active' : ''}`}
                        >
                            <Icon size={14} />
                            {label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Sign out */}
            <div style={{ marginTop: 'auto', padding: '1rem 0 0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                    onClick={logout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.7rem',
                        width: 'calc(100% - 1rem)', margin: '0 0.5rem',
                        padding: '0.65rem 0.75rem',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', fontWeight: 500,
                        borderRadius: 8, transition: 'all 0.15s',
                        fontFamily: 'DM Sans, sans-serif',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#fca5a5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
                >
                    <LogOut size={16} />
                    Sign out
                </button>
            </div>
        </nav>
    );
}
