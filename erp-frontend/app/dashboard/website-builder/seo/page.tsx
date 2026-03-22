'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Save, Globe, Search } from 'lucide-react';

interface SEOData {
    siteTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    gaTrackingId: string;
    metaPixelId: string;
    robotsTxt: string;
    autoSitemap: boolean;
    jsonLdEnabled: boolean;
}

const defaultSEO: SEOData = {
    siteTitle: 'Inner Cosmos Store',
    metaDescription: 'Premium curated products delivered to your door.',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    gaTrackingId: '',
    metaPixelId: '',
    robotsTxt: `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /checkout/\n\nSitemap: https://yourstore.com/sitemap.xml`,
    autoSitemap: true,
    jsonLdEnabled: true,
};

export default function SEOPage() {
    const [seo, setSeo] = useState<SEOData>(defaultSEO);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/content/seo').then(r => {
            if (r.data) setSeo({ ...defaultSEO, ...r.data });
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await api.put('/content/seo', { content: seo });
            toast.success('SEO settings saved!');
        } catch {
            toast.error('Failed to save SEO settings');
        } finally {
            setSaving(false);
        }
    };

    const inp: React.CSSProperties = { width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', background: 'white' };
    const lbl: React.CSSProperties = { display: 'block', fontWeight: 600, fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
    const section: React.CSSProperties = { background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.25rem' };

    if (loading) return <div className="loading-spinner" />;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={24} color="var(--primary)" /> SEO & Meta
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Optimize your store for search engines and social sharing</p>
                </div>
                <button className="btn btn-primary" onClick={save} disabled={saving} style={{ padding: '0.6rem 1.5rem' }}>
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            {/* General Meta */}
            <div style={section}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🔍 General Meta Tags</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={lbl}>Site Title</label>
                        <input style={inp} value={seo.siteTitle} onChange={e => setSeo({ ...seo, siteTitle: e.target.value })} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem', display: 'block' }}>
                            {seo.siteTitle.length}/60 characters recommended
                        </span>
                    </div>
                    <div>
                        <label style={lbl}>Meta Description</label>
                        <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} value={seo.metaDescription} onChange={e => setSeo({ ...seo, metaDescription: e.target.value })} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem', display: 'block' }}>
                            {seo.metaDescription.length}/160 characters recommended
                        </span>
                    </div>
                </div>
                {/* Google Search Preview */}
                <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8f9fa', borderRadius: 8 }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Google Search Preview</p>
                    <div>
                        <p style={{ color: '#1a0dab', fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.15rem', cursor: 'pointer' }}>{seo.siteTitle || 'Your Site Title'}</p>
                        <p style={{ color: '#006621', fontSize: '0.82rem', marginBottom: '0.25rem' }}>https://yourstore.com</p>
                        <p style={{ color: '#545454', fontSize: '0.85rem', lineHeight: 1.5 }}>{seo.metaDescription || 'Your meta description will appear here...'}</p>
                    </div>
                </div>
            </div>

            {/* Open Graph */}
            <div style={section}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>📱 Open Graph (Social Sharing)</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1rem' }}>Controls how your site appears when shared on Facebook, Twitter, WhatsApp, etc.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={lbl}>OG Title (leave empty to use Site Title)</label>
                        <input style={inp} value={seo.ogTitle} onChange={e => setSeo({ ...seo, ogTitle: e.target.value })} placeholder={seo.siteTitle} />
                    </div>
                    <div>
                        <label style={lbl}>OG Description</label>
                        <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }} value={seo.ogDescription} onChange={e => setSeo({ ...seo, ogDescription: e.target.value })} placeholder={seo.metaDescription} />
                    </div>
                    <div>
                        <label style={lbl}>OG Image URL</label>
                        <input style={inp} value={seo.ogImage} onChange={e => setSeo({ ...seo, ogImage: e.target.value })} placeholder="https://yourstore.com/og-image.jpg" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem', display: 'block' }}>Recommended: 1200×630 pixels</span>
                    </div>
                </div>
            </div>

            {/* Analytics */}
            <div style={section}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>📊 Analytics & Tracking</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={lbl}>Google Analytics Tracking ID</label>
                        <input style={inp} value={seo.gaTrackingId} onChange={e => setSeo({ ...seo, gaTrackingId: e.target.value })} placeholder="G-XXXXXXXXXX" />
                    </div>
                    <div>
                        <label style={lbl}>Meta Pixel ID</label>
                        <input style={inp} value={seo.metaPixelId} onChange={e => setSeo({ ...seo, metaPixelId: e.target.value })} placeholder="123456789" />
                    </div>
                </div>
            </div>

            {/* Toggles */}
            <div style={section}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>⚙️ Advanced</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => setSeo({ ...seo, autoSitemap: !seo.autoSitemap })} style={{
                            padding: '0.4rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                            background: seo.autoSitemap ? '#dcfce7' : '#fee2e2', color: seo.autoSitemap ? '#16a34a' : '#dc2626',
                        }}>
                            {seo.autoSitemap ? '✓ Auto-Sitemap ON' : '✗ Auto-Sitemap OFF'}
                        </button>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Automatically generate sitemap.xml for search engines</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => setSeo({ ...seo, jsonLdEnabled: !seo.jsonLdEnabled })} style={{
                            padding: '0.4rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                            background: seo.jsonLdEnabled ? '#dcfce7' : '#fee2e2', color: seo.jsonLdEnabled ? '#16a34a' : '#dc2626',
                        }}>
                            {seo.jsonLdEnabled ? '✓ JSON-LD ON' : '✗ JSON-LD OFF'}
                        </button>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Product structured data for rich search results</span>
                    </div>
                </div>
            </div>

            {/* Robots.txt */}
            <div style={section}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>🤖 Robots.txt</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1rem' }}>Control which parts of your site search engines can crawl</p>
                <textarea
                    style={{ ...inp, minHeight: 150, fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.6, resize: 'vertical' }}
                    value={seo.robotsTxt}
                    onChange={e => setSeo({ ...seo, robotsTxt: e.target.value })}
                />
            </div>
        </div>
    );
}
