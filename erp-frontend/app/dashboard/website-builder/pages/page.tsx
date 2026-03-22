'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Globe, Copy, FileText, Home, ExternalLink } from 'lucide-react';

interface Page {
    id: string;
    title: string;
    slug: string;
    status: string;
    isHomepage: boolean;
    updatedAt: string;
    createdAt: string;
}

export default function PagesListPage() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newSlug, setNewSlug] = useState('');
    const router = useRouter();

    const load = () => {
        api.get('/pages').then(r => setPages(r.data || [])).catch(() => {}).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const autoSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return toast.error('Title required');
        const slug = newSlug.trim() || autoSlug(newTitle);
        try {
            const r = await api.post('/pages', { 
                title: newTitle.trim(), 
                slug, 
                status: 'draft',
                blocks: [],
                seo: {}
            });
            toast.success('Page created!');
            setShowCreate(false);
            setNewTitle('');
            setNewSlug('');
            load();
            router.push(`/dashboard/website-builder/pages/${r.data.id}`);
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to create page');
        }
    };

    const handleDelete = async (page: Page) => {
        if (page.isHomepage) return toast.error('Cannot delete the homepage');
        if (!confirm(`Delete "${page.title}"?`)) return;
        try {
            await api.delete(`/pages/${page.id}`);
            toast.success('Page deleted');
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to delete');
        }
    };

    const togglePublish = async (page: Page) => {
        const newStatus = page.status === 'published' ? 'draft' : 'published';
        try {
            await api.put(`/pages/${page.id}`, { status: newStatus });
            toast.success(newStatus === 'published' ? 'Page published!' : 'Page unpublished');
            load();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const duplicatePage = async (page: Page) => {
        try {
            await api.post('/pages', {
                title: `${page.title} (Copy)`,
                slug: `${page.slug}-copy-${Date.now().toString(36)}`,
                blocks: page.id ? (await api.get(`/pages/${page.slug}`)).data?.blocks || [] : [],
                status: 'draft',
            });
            toast.success('Page duplicated!');
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to duplicate');
        }
    };

    const setAsHomepage = async (page: Page) => {
        try {
            await api.put(`/pages/${page.id}`, { isHomepage: true });
            toast.success(`"${page.title}" is now the homepage`);
            load();
        } catch {
            toast.error('Failed to set homepage');
        }
    };

    const inp: React.CSSProperties = { width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', background: 'white' };
    const lbl: React.CSSProperties = { display: 'block', fontWeight: 600, fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' };

    if (loading) return <div className="loading-spinner" />;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={24} color="var(--primary)" /> Pages
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Manage your store pages — Home, About, Contact, and more
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ padding: '0.6rem 1.25rem' }}>
                    <Plus size={16} /> New Page
                </button>
            </div>

            {/* Create modal */}
            {showCreate && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 450, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Create New Page</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={lbl}>Page Title</label>
                                <input style={inp} value={newTitle} onChange={e => { 
                                    const val = e.target.value;
                                    setNewTitle(val); 
                                    if (!newSlug) setNewSlug(''); // Keep using autoSlug placeholder
                                }} placeholder="e.g. About Us" autoFocus />
                            </div>
                            <div>
                                <label style={lbl}>URL Slug</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>/</span>
                                    <input style={inp} value={newSlug || autoSlug(newTitle)} onChange={e => setNewSlug(e.target.value)} placeholder="about-us" />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-outline" onClick={() => { setShowCreate(false); setNewTitle(''); setNewSlug(''); }}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate}>Create Page</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pages table */}
            {pages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📄</div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.5rem' }}>No pages yet</h3>
                    <p style={{ fontSize: '0.9rem' }}>Create your first page to get started</p>
                </div>
            ) : (
                <div className="table-container" style={{ borderRadius: 12, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Page</th>
                                <th>Slug</th>
                                <th>Status</th>
                                <th>Updated</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map(page => (
                                <tr key={page.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {page.isHomepage && <Home size={14} color="var(--primary)" />}
                                            <strong>{page.title}</strong>
                                            {page.isHomepage && <span style={{ fontSize: '0.65rem', background: '#ede9fe', color: 'var(--primary)', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>HOME</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <code style={{ fontSize: '0.8rem', background: 'var(--bg)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>/{page.slug}</code>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => togglePublish(page)}
                                            style={{
                                                padding: '0.25rem 0.75rem', borderRadius: 20, border: 'none', cursor: 'pointer',
                                                fontWeight: 600, fontSize: '0.75rem',
                                                background: page.status === 'published' ? '#dcfce7' : '#fef3c7',
                                                color: page.status === 'published' ? '#16a34a' : '#ca8a04',
                                            }}
                                        >
                                            {page.status === 'published' ? '● Published' : '○ Draft'}
                                        </button>
                                    </td>
                                    <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                                        {new Date(page.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                            <button
                                                onClick={() => router.push(`/dashboard/website-builder/pages/${page.id}`)}
                                                className="btn btn-outline btn-sm"
                                                title="Edit page"
                                                style={{ padding: '0.35rem 0.6rem' }}
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            {!page.isHomepage && (
                                                <button
                                                    onClick={() => setAsHomepage(page)}
                                                    className="btn btn-outline btn-sm"
                                                    title="Set as homepage"
                                                    style={{ padding: '0.35rem 0.6rem' }}
                                                >
                                                    <Home size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => duplicatePage(page)}
                                                className="btn btn-outline btn-sm"
                                                title="Duplicate"
                                                style={{ padding: '0.35rem 0.6rem' }}
                                            >
                                                <Copy size={14} />
                                            </button>
                                            {!page.isHomepage && (
                                                <button
                                                    onClick={() => handleDelete(page)}
                                                    className="btn btn-outline btn-sm"
                                                    title="Delete"
                                                    style={{ padding: '0.35rem 0.6rem', color: '#dc2626' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
