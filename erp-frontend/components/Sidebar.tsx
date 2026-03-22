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
            <div className="sidebar-logo">
                <Package size={24} color="#6c63ff" />
                Inner Cosmos
                <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400, marginLeft: '0.25rem', marginTop: '2px' }}>ERP</span>
            </div>
            <div className="sidebar-section">
                <div className="sidebar-title">Navigation</div>
                {navItems.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`sidebar-link ${pathname === href ? 'active' : ''}`}
                    >
                        <Icon size={17} />
                        {label}
                    </Link>
                ))}
            </div>
            <div className="sidebar-section">
                <div className="sidebar-title">CRM</div>
                <div
                    className={`sidebar-section-header ${isCrmActive ? 'active' : ''} ${crmOpen ? 'open' : ''}`}
                    onClick={() => setCrmOpen(!crmOpen)}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Target size={17} />
                        CRM
                    </span>
                    <ChevronDown size={14} />
                </div>
                <div className={`sidebar-sub-links ${crmOpen ? 'open' : ''}`}>
                    {crmItems.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`sidebar-link ${pathname === href ? 'active' : ''}`}
                        >
                            <Icon size={15} />
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
            <div className="sidebar-section">
                <div className="sidebar-title">Website</div>
                <div
                    className={`sidebar-section-header ${isBuilderActive ? 'active' : ''} ${builderOpen ? 'open' : ''}`}
                    onClick={() => setBuilderOpen(!builderOpen)}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Globe size={17} />
                        Website Builder
                    </span>
                    <ChevronDown size={14} />
                </div>
                <div className={`sidebar-sub-links ${builderOpen ? 'open' : ''}`}>
                    {builderItems.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`sidebar-link ${pathname === href ? 'active' : ''}`}
                        >
                            <Icon size={15} />
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
            <div style={{ marginTop: 'auto', padding: '1.5rem 0 1rem' }}>
                <button onClick={logout} className="sidebar-link" style={{ display: 'flex', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <LogOut size={17} />
                    Sign Out
                </button>
            </div>
        </nav>
    );
}

