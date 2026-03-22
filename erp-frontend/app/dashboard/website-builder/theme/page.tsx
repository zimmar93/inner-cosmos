'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Save, Palette } from 'lucide-react';

const FONT_OPTIONS = ['Inter', 'Roboto', 'Outfit', 'Poppins', 'Open Sans', 'Lato', 'Montserrat', 'Nunito', 'DM Sans', 'Plus Jakarta Sans'];

interface ThemeData {
    primaryColor: string;
    accentColor: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    borderRadius: number;
    fontFamily: string;
    headingSize: string;
    bodySize: string;
    fontWeight: string;
    letterSpacing: string;
    customCSS: string;
    faviconUrl: string;
}

const defaultTheme: ThemeData = {
    primaryColor: '#6c63ff',
    accentColor: '#ff6584',
    bgColor: '#f9f9fb',
    textColor: '#1a1a2e',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    fontFamily: 'Inter',
    headingSize: '2rem',
    bodySize: '1rem',
    fontWeight: '400',
    letterSpacing: '0',
    customCSS: '',
    faviconUrl: '',
};

const THEME_PRESETS: { name: string; emoji: string; theme: Partial<ThemeData> }[] = [
    { name: 'Minimal Light', emoji: '☀️', theme: { primaryColor: '#111827', accentColor: '#6366f1', bgColor: '#ffffff', textColor: '#1f2937', borderColor: '#e5e7eb', borderRadius: 8, fontFamily: 'Inter' } },
    { name: 'Bold Dark', emoji: '🌙', theme: { primaryColor: '#a78bfa', accentColor: '#f472b6', bgColor: '#0f172a', textColor: '#e2e8f0', borderColor: '#334155', borderRadius: 16, fontFamily: 'Plus Jakarta Sans' } },
    { name: 'Ocean Blue', emoji: '🌊', theme: { primaryColor: '#0ea5e9', accentColor: '#06b6d4', bgColor: '#f0f9ff', textColor: '#0c4a6e', borderColor: '#bae6fd', borderRadius: 12, fontFamily: 'DM Sans' } },
    { name: 'Warm Earth', emoji: '🌿', theme: { primaryColor: '#b45309', accentColor: '#d97706', bgColor: '#fffbeb', textColor: '#451a03', borderColor: '#fde68a', borderRadius: 10, fontFamily: 'Lato' } },
    { name: 'Neon Glow', emoji: '⚡', theme: { primaryColor: '#8b5cf6', accentColor: '#ec4899', bgColor: '#1a1a2e', textColor: '#e0e7ff', borderColor: '#312e81', borderRadius: 20, fontFamily: 'Outfit' } },
    { name: 'Forest Green', emoji: '🌲', theme: { primaryColor: '#059669', accentColor: '#10b981', bgColor: '#ecfdf5', textColor: '#064e3b', borderColor: '#a7f3d0', borderRadius: 8, fontFamily: 'Nunito' } },
];

export default function ThemeSettingsPage() {
    const [theme, setTheme] = useState<ThemeData>(defaultTheme);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/content/theme').then(r => {
            if (r.data) setTheme({ ...defaultTheme, ...r.data });
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await api.put('/content/theme', { content: theme });
            toast.success('Theme saved!');
        } catch {
            toast.error('Failed to save theme');
        } finally {
            setSaving(false);
        }
    };

    const inp: React.CSSProperties = { width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', background: 'white' };
    const lbl: React.CSSProperties = { display: 'block', fontWeight: 600, fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
    const section: React.CSSProperties = { background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.25rem' };

    const colorField = (label: string, value: string, onChange: (v: string) => void) => (
        <div>
            <label style={lbl}>{label}</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
                    style={{ width: 40, height: 36, border: 'none', cursor: 'pointer', borderRadius: 6 }} />
                <input style={inp} value={value} onChange={e => onChange(e.target.value)} />
            </div>
        </div>
    );

    if (loading) return <div className="loading-spinner" />;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Palette size={24} color="var(--primary)" /> Theme Settings
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Customize your storefront's look and feel</p>
                </div>
                <button className="btn btn-primary" onClick={save} disabled={saving} style={{ padding: '0.6rem 1.5rem' }}>
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Theme'}
                </button>
            </div>

            {/* Theme Presets */}
            <div style={section}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🎯 Quick Presets</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {THEME_PRESETS.map(p => (
                        <button key={p.name} onClick={() => setTheme({ ...theme, ...p.theme })} style={{
                            padding: '0.75rem', borderRadius: 10, border: '1.5px solid var(--border)',
                            background: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>{p.emoji}</span>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', marginTop: '0.25rem' }}>{p.name}</div>
                            <div style={{ display: 'flex', gap: '3px', marginTop: '0.35rem' }}>
                                {[p.theme.primaryColor, p.theme.accentColor, p.theme.bgColor, p.theme.textColor].map((c, i) => (
                                    <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: c, border: '1px solid #0001' }} />
                                ))}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Colors */}
            <div style={section}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🎨 Colors</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    {colorField('Primary Color', theme.primaryColor, v => setTheme({ ...theme, primaryColor: v }))}
                    {colorField('Accent Color', theme.accentColor, v => setTheme({ ...theme, accentColor: v }))}
                    {colorField('Background', theme.bgColor, v => setTheme({ ...theme, bgColor: v }))}
                    {colorField('Text Color', theme.textColor, v => setTheme({ ...theme, textColor: v }))}
                    {colorField('Border Color', theme.borderColor, v => setTheme({ ...theme, borderColor: v }))}
                </div>
            </div>

            {/* Typography */}
            <div style={section}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>✏️ Typography</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={lbl}>Font Family</label>
                        <select style={inp} value={theme.fontFamily} onChange={e => setTheme({ ...theme, fontFamily: e.target.value })}>
                            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={lbl}>Heading Size</label>
                        <input style={inp} value={theme.headingSize} onChange={e => setTheme({ ...theme, headingSize: e.target.value })} placeholder="2rem" />
                    </div>
                    <div>
                        <label style={lbl}>Body Size</label>
                        <input style={inp} value={theme.bodySize} onChange={e => setTheme({ ...theme, bodySize: e.target.value })} placeholder="1rem" />
                    </div>
                    <div>
                        <label style={lbl}>Font Weight</label>
                        <select style={inp} value={theme.fontWeight} onChange={e => setTheme({ ...theme, fontWeight: e.target.value })}>
                            {['300', '400', '500', '600', '700', '800'].map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={lbl}>Letter Spacing</label>
                        <input style={inp} value={theme.letterSpacing} onChange={e => setTheme({ ...theme, letterSpacing: e.target.value })} placeholder="0" />
                    </div>
                </div>
            </div>

            {/* Spacing */}
            <div style={section}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>📐 Spacing & Shape</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={lbl}>Border Radius (px)</label>
                        <input type="number" style={inp} value={theme.borderRadius} onChange={e => setTheme({ ...theme, borderRadius: Number(e.target.value) })} />
                    </div>
                    <div>
                        <label style={lbl}>Favicon URL</label>
                        <input style={inp} value={theme.faviconUrl} onChange={e => setTheme({ ...theme, faviconUrl: e.target.value })} placeholder="https://..." />
                    </div>
                </div>
            </div>

            {/* Custom CSS */}
            <div style={section}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🔧 Custom CSS</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                    Advanced: Inject custom CSS into your storefront. This will be loaded after the default styles.
                </p>
                <textarea
                    style={{ ...inp, minHeight: 150, fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.6, resize: 'vertical' }}
                    value={theme.customCSS}
                    onChange={e => setTheme({ ...theme, customCSS: e.target.value })}
                    placeholder={`/* Custom CSS */\n.my-class {\n  color: red;\n}`}
                />
            </div>

            {/* Live Preview */}
            <div style={section}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>👁️ Live Preview</h3>
                <div style={{
                    padding: '2rem', borderRadius: theme.borderRadius, background: theme.bgColor,
                    border: `1px solid ${theme.borderColor}`, fontFamily: `'${theme.fontFamily}', sans-serif`,
                }}>
                    <h2 style={{ color: theme.primaryColor, fontWeight: 800, fontSize: theme.headingSize, marginBottom: '0.5rem' }}>
                        Heading Preview
                    </h2>
                    <p style={{ color: theme.textColor, fontSize: theme.bodySize, marginBottom: '1rem', lineHeight: 1.6 }}>
                        This is how your body text will look on the storefront. The quick brown fox jumps over the lazy dog.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button style={{
                            padding: '0.6rem 1.5rem', borderRadius: theme.borderRadius, border: 'none',
                            background: theme.primaryColor, color: 'white', fontWeight: 700, cursor: 'pointer',
                            fontFamily: `'${theme.fontFamily}', sans-serif`,
                        }}>
                            Primary Button
                        </button>
                        <button style={{
                            padding: '0.6rem 1.5rem', borderRadius: theme.borderRadius,
                            border: `2px solid ${theme.accentColor}`, background: 'transparent',
                            color: theme.accentColor, fontWeight: 700, cursor: 'pointer',
                            fontFamily: `'${theme.fontFamily}', sans-serif`,
                        }}>
                            Accent Button
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
