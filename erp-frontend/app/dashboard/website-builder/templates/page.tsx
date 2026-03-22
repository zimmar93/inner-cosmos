'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { LayoutTemplate, Trash2, Copy, Plus } from 'lucide-react';

interface Template {
    id: string;
    name: string;
    category: string;
    blocks: any[];
    thumbnail?: string;
    createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    landing: '#6c63ff',
    ecommerce: '#f59e0b',
    blog: '#22c55e',
    portfolio: '#ec4899',
    custom: '#6b7280',
};

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        api.get('/templates').then(r => setTemplates(r.data || [])).catch(() => toast.error('Failed to load templates')).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const deleteTemplate = async (id: string) => {
        if (!confirm('Delete this template?')) return;
        try {
            await api.delete(`/templates/${id}`);
            toast.success('Template deleted');
            load();
        } catch {
            toast.error('Failed to delete');
        }
    };

    if (loading) return <div className="loading-spinner" />;

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LayoutTemplate size={24} color="var(--primary)" /> Page Templates
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Save and reuse page layouts across your store
                    </p>
                </div>
            </div>

            {templates.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '4rem 2rem', background: 'white',
                    border: '2px dashed var(--border)', borderRadius: 16,
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No Templates Yet</h3>
                    <p style={{ color: 'var(--muted)', maxWidth: 400, margin: '0 auto' }}>
                        Save any page as a template from the page builder.
                        Open a page → click "Save as Template" in the toolbar.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    {templates.map(t => {
                        const catColor = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.custom;
                        return (
                            <div key={t.id} style={{
                                background: 'white', borderRadius: 14, border: '1px solid var(--border)',
                                overflow: 'hidden', transition: 'all 0.2s',
                            }}>
                                {/* Thumbnail / Preview */}
                                <div style={{
                                    height: 160, background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '3rem', position: 'relative',
                                }}>
                                    {t.thumbnail ? (
                                        <img src={t.thumbnail} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span>🏗️</span>
                                    )}
                                    <span style={{
                                        position: 'absolute', top: 10, right: 10,
                                        padding: '0.2rem 0.6rem', borderRadius: 20,
                                        fontSize: '0.68rem', fontWeight: 700,
                                        background: `${catColor}20`, color: catColor,
                                        textTransform: 'capitalize',
                                    }}>{t.category}</span>
                                </div>

                                {/* Info */}
                                <div style={{ padding: '1rem 1.25rem' }}>
                                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{t.name}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                                        {(t.blocks || []).length} blocks • {new Date(t.createdAt).toLocaleDateString()}
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                        <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
                                            onClick={() => {
                                                navigator.clipboard.writeText(JSON.stringify(t.blocks));
                                                toast.success('Blocks copied to clipboard!');
                                            }}>
                                            <Copy size={13} /> Copy Blocks
                                        </button>
                                        <button className="btn btn-sm" onClick={() => deleteTemplate(t.id)}
                                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.4rem 0.75rem' }}>
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
