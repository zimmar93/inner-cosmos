'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { BLOCK_DEFS, BLOCK_CATEGORIES, getBlockDef, genId, normalizeBlock } from '@/components/builder-blocks';
import { BuilderHistory, type BuilderBlock } from '@/lib/builder-history';
import {
    Save, Undo2, Redo2, Monitor, Tablet, Smartphone,
    GripVertical, Trash2, Copy, ChevronUp, ChevronDown, X,
    Plus, ArrowLeft, Globe, Eye, LayoutTemplate, Download,
} from 'lucide-react';

// normalizeBlock is now imported from @/components/builder-blocks

/* ── Shared form helpers ── */
const inp: React.CSSProperties = { width: '100%', padding: '0.55rem 0.75rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit', background: 'white' };
const lbl: React.CSSProperties = { display: 'block', fontWeight: 600, fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' };

function colorField(label: string, value: string, onChange: (v: string) => void) {
    return (
        <div className="field-group">
            <label style={lbl}>{label}</label>
            <div className="color-field">
                <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} />
                <input style={inp} value={value} onChange={e => onChange(e.target.value)} />
            </div>
        </div>
    );
}

function textField(label: string, value: string, onChange: (v: string) => void, placeholder?: string) {
    return (
        <div className="field-group">
            <label style={lbl}>{label}</label>
            <input style={inp} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        </div>
    );
}

function textArea(label: string, value: string, onChange: (v: string) => void, rows = 3) {
    return (
        <div className="field-group">
            <label style={lbl}>{label}</label>
            <textarea style={{ ...inp, minHeight: rows * 24, resize: 'vertical' }} value={value || ''} onChange={e => onChange(e.target.value)} />
        </div>
    );
}

function numberField(label: string, value: number, onChange: (v: number) => void) {
    return (
        <div className="field-group">
            <label style={lbl}>{label}</label>
            <input type="number" style={inp} value={value} onChange={e => onChange(Number(e.target.value))} />
        </div>
    );
}

function selectField(label: string, value: string, options: string[], onChange: (v: string) => void) {
    return (
        <div className="field-group">
            <label style={lbl}>{label}</label>
            <select style={inp} value={value || options[0] || ''} onChange={e => onChange(e.target.value)}>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

function checkboxField(label: string, value: boolean, onChange: (v: boolean) => void) {
    return (
        <div className="field-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => onChange(!value)}>
            <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} style={{ cursor: 'pointer' }} />
            <label style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>{label}</label>
        </div>
    );
}

/* ── Import all settings components (same as main builder) ── */
// These are inline for now — reuses exact same pattern as website-builder/page.tsx
/* ── Generic settings renderer ── */
function GenericSettings({ data, update, fields }: { data: any; update: (d: any) => void; fields: any[] }) {
    if (!data) return null;
    return (
        <>
            {fields.map(f => {
                const val = data[f.key];
                switch (f.type) {
                    case 'text': return <div key={f.key}>{textField(f.label, val, v => update({ ...data, [f.key]: v }), f.placeholder)}</div>;
                    case 'textarea': return <div key={f.key}>{textArea(f.label, val, v => update({ ...data, [f.key]: v }))}</div>;
                    case 'color': return <div key={f.key}>{colorField(f.label, val, v => update({ ...data, [f.key]: v }))}</div>;
                    case 'number': return <div key={f.key}>{numberField(f.label, val || 0, v => update({ ...data, [f.key]: v }))}</div>;
                    case 'select': return <div key={f.key}>{selectField(f.label, val, f.options || [], v => update({ ...data, [f.key]: v }))}</div>;
                    case 'checkbox': return <div key={f.key}>{checkboxField(f.label, val, v => update({ ...data, [f.key]: v }))}</div>;
                    default: return null;
                }
            })}
        </>
    );
}

/* ── Block preview snippet ── */
function blockPreview(block: BuilderBlock): string {
    if (!block) return 'Empty block';
    const def = getBlockDef(block.type);
    if (!def) return `[${block.type || 'Unknown Type'}] Block data found but definition missing.`;
    try {
        return def.preview(block.data || {});
    } catch {
        return def.label || 'Block Preview';
    }
}

function catColor(cat: string): { bg: string; text: string } {
    switch (cat) {
        case 'layout': return { bg: '#ede9fe', text: '#6c63ff' };
        case 'content': return { bg: '#dcfce7', text: '#16a34a' };
        case 'commerce': return { bg: '#fef9c3', text: '#ca8a04' };
        case 'trust': return { bg: '#fee2e2', text: '#dc2626' };
        case 'slides': return { bg: '#ede9fe', text: '#8b5cf6' };
        default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
}

/* ══════════════════════════════════════════════════════════
   PER-PAGE BUILDER
   ══════════════════════════════════════════════════════════ */

interface PageData {
    id: string;
    title: string;
    slug: string;
    status: string;
    isHomepage: boolean;
    seo: any;
}

export default function PageBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const pageId = params.id as string;

    const [page, setPage] = useState<PageData | null>(null);
    const [blocks, setBlocks] = useState<BuilderBlock[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
    const [showPageSettings, setShowPageSettings] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);

    const historyRef = useRef<BuilderHistory | null>(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    /* ── Load page ── */
    useEffect(() => {
        api.get(`/pages/id/${pageId}`).then(r => {
            const data = r.data;
            if (!data) { toast.error('Page not found'); router.push('/dashboard/website-builder/pages'); return; }
            
            // Defensive parsing for SEO and Blocks (handles various DB response formats)
            let seo = data.seo || {};
            if (typeof seo === 'string') { try { seo = JSON.parse(seo); } catch { seo = {}; } }
            
            let rawBlocks = data.blocks || [];
            if (typeof rawBlocks === 'string') { try { rawBlocks = JSON.parse(rawBlocks); } catch { rawBlocks = []; } }
            if (!Array.isArray(rawBlocks)) rawBlocks = [];

            setPage({ 
                id: data.id, 
                title: data.title, 
                slug: data.slug, 
                status: data.status, 
                isHomepage: data.isHomepage, 
                seo: seo 
            });

            const loaded = rawBlocks.map(normalizeBlock);
            setBlocks(loaded);
            historyRef.current = new BuilderHistory(loaded);
            updateHistoryState();
        }).catch(() => { toast.error('Failed to load page'); router.push('/dashboard/website-builder/pages'); }).finally(() => setLoading(false));
    }, [pageId, router]);

    const updateHistoryState = () => {
        if (!historyRef.current) return;
        setCanUndo(historyRef.current.canUndo);
        setCanRedo(historyRef.current.canRedo);
    };

    const pushHistory = (newBlocks: BuilderBlock[]) => {
        setBlocks(newBlocks);
        historyRef.current?.push(newBlocks);
        updateHistoryState();
    };

    const handleUndo = () => { const s = historyRef.current?.undo(); if (s) { setBlocks(s); updateHistoryState(); } };
    const handleRedo = () => { const s = historyRef.current?.redo(); if (s) { setBlocks(s); updateHistoryState(); } };

    /* ── Save ── */
    const handleSave = async () => {
        if (!page) return;
        setSaving(true);
        try {
            await api.put(`/pages/${page.id}`, {
                blocks,
                title: page.title,
                slug: page.slug,
                seo: page.seo,
                status: page.status,
            });

            // If homepage, also save individual sections for backward compat with store-frontend
            if (page.isHomepage) {
                for (const block of blocks) {
                    let section = block.type;
                    let content = block.data;
                    if (block.type === 'featured-products') { section = 'productsSection'; }
                    else if (block.type === 'banner-slides') { section = 'slides'; content = block.data.slides || []; }
                    else if (block.type === 'feature-cards') { section = 'features'; }
                    await api.put(`/content/${section}`, { content });
                }
                await api.put('/content/page-blocks', { content: blocks });
            }

            toast.success('Page saved!');
        } catch {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    /* ── Block operations ── */
    const addBlock = (type: string, index?: number) => {
        const def = getBlockDef(type);
        if (!def) return;
        const newBlock: BuilderBlock = { id: genId(), type, data: JSON.parse(JSON.stringify(def.defaultData)) };
        const nb = [...blocks];
        if (index !== undefined) nb.splice(index, 0, newBlock); else nb.push(newBlock);
        pushHistory(nb);
        setSelectedId(newBlock.id);
    };

    const updateBlock = (id: string, data: any) => { setBlocks(prev => prev.map(b => b.id === id ? { ...b, data } : b)); };
    const commitBlockUpdate = () => { historyRef.current?.push(blocks); updateHistoryState(); };
    const deleteBlock = (id: string) => { if (selectedId === id) setSelectedId(null); pushHistory(blocks.filter(b => b.id !== id)); };

    const duplicateBlock = (id: string) => {
        const idx = blocks.findIndex(b => b.id === id);
        if (idx === -1) return;
        const clone: BuilderBlock = { id: genId(), type: blocks[idx].type, data: JSON.parse(JSON.stringify(blocks[idx].data)) };
        const nb = [...blocks]; nb.splice(idx + 1, 0, clone);
        pushHistory(nb);
        setSelectedId(clone.id);
    };

    const moveBlock = (id: string, dir: -1 | 1) => {
        const idx = blocks.findIndex(b => b.id === id);
        const target = idx + dir;
        if (target < 0 || target >= blocks.length) return;
        const nb = [...blocks]; [nb[idx], nb[target]] = [nb[target], nb[idx]];
        pushHistory(nb);
    };

    /* ── Drag & Drop ── */
    const handlePaletteDragStart = (e: React.DragEvent, type: string) => { e.dataTransfer.setData('blockType', type); };
    const handleBlockDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('blockId', id); setDraggingBlockId(id); };
    const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); setDragOverIndex(index); };
    const handleDragLeave = () => { setDragOverIndex(null); };
    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(null);
        setDraggingBlockId(null);
        const paletteType = e.dataTransfer.getData('blockType');
        const blockId = e.dataTransfer.getData('blockId');
        if (paletteType) { addBlock(paletteType, index); }
        else if (blockId) {
            const from = blocks.findIndex(b => b.id === blockId);
            if (from === -1) return;
            const nb = [...blocks]; const [moved] = nb.splice(from, 1);
            const adj = index > from ? index - 1 : index;
            nb.splice(adj, 0, moved);
            pushHistory(nb);
        }
    };
    const handleDragEnd = () => { setDragOverIndex(null); setDraggingBlockId(null); };

    /* ── Render ── */
    const selectedBlock = blocks.find(b => b.id === selectedId);

    if (loading || !page) return <div className="loading-spinner" />;

    return (
        <div className={`builder-layout ${!selectedBlock && !showPageSettings ? 'settings-closed' : ''}`}>
            {/* Toolbar */}
            <div className="builder-toolbar">
                <div className="builder-toolbar-left">
                    <div style={{ fontSize: '0.65rem', opacity: 0.6, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, marginRight: '0.5rem', fontWeight: 700 }}>Z_FIX_V4</div>
                    <button className="icon-btn" onClick={() => router.push('/dashboard/website-builder/pages')} title="Back to pages"><ArrowLeft size={16} /></button>
                    <div>
                        <h2 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>{page.title}</h2>
                        <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>/{page.slug} • {blocks.length} blocks</span>
                    </div>
                    <span style={{
                        padding: '0.15rem 0.5rem', borderRadius: 12, fontWeight: 600, fontSize: '0.68rem',
                        background: page.status === 'published' ? '#dcfce7' : '#fef3c7',
                        color: page.status === 'published' ? '#16a34a' : '#ca8a04',
                    }}>
                        {page.status === 'published' ? '● Published' : '○ Draft'}
                    </span>
                </div>
                <div className="builder-toolbar-center">
                    <button className="icon-btn" onClick={handleUndo} disabled={!canUndo} title="Undo"><Undo2 size={16} /></button>
                    <button className="icon-btn" onClick={handleRedo} disabled={!canRedo} title="Redo"><Redo2 size={16} /></button>
                    <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 0.25rem' }} />
                    <button className={`icon-btn ${viewport === 'desktop' ? 'active' : ''}`} onClick={() => setViewport('desktop')} title="Desktop"><Monitor size={16} /></button>
                    <button className={`icon-btn ${viewport === 'tablet' ? 'active' : ''}`} onClick={() => setViewport('tablet')} title="Tablet"><Tablet size={16} /></button>
                    <button className={`icon-btn ${viewport === 'mobile' ? 'active' : ''}`} onClick={() => setViewport('mobile')} title="Mobile"><Smartphone size={16} /></button>
                </div>
                <div className="builder-toolbar-right">
                    <button className="icon-btn" onClick={() => {
                        const name = prompt('Template name:');
                        if (!name) return;
                        api.post('/templates', { name, blocks, category: 'custom' }).then(() => toast.success('Saved as template!')).catch(() => toast.error('Failed to save'));
                    }} title="Save as Template"><LayoutTemplate size={16} /></button>
                    <button className="icon-btn" onClick={() => {
                        api.get('/templates').then(r => { setTemplates(r.data || []); setShowTemplateModal(true); }).catch(() => toast.error('Failed to load templates'));
                    }} title="Load Template"><Download size={16} /></button>
                    <button className={`icon-btn ${showPageSettings ? 'active' : ''}`} onClick={() => { setShowPageSettings(!showPageSettings); setSelectedId(null); }} title="Page settings"><Globe size={16} /></button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.5rem 1.25rem' }}>
                        <Save size={15} /> {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Block Palette */}
            <div className="builder-palette">
                {BLOCK_CATEGORIES.map(cat => {
                    const catBlocks = BLOCK_DEFS.filter(b => b.category === cat.key);
                    if (!catBlocks.length) return null;
                    return (
                        <div key={cat.key}>
                            <div className="builder-palette-title">{cat.label}</div>
                            {catBlocks.map(def => (
                                <div key={def.type} className="builder-palette-item" draggable
                                    onDragStart={e => handlePaletteDragStart(e, def.type)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => addBlock(def.type)}>
                                    <div className="builder-palette-icon" style={{ background: `${cat.color}15`, color: cat.color }}>{def.icon}</div>
                                    {def.label}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Canvas */}
            <div className="builder-canvas">
                <div className={`builder-canvas-inner builder-preview-frame ${viewport}`}>
                    {blocks.length === 0 ? (
                        <div className="builder-empty"
                            style={{ border: '2px dashed #e5e7eb', padding: '4rem', margin: '2rem', borderRadius: 16, textAlign: 'center' }}
                            onDragOver={e => { e.preventDefault(); setDragOverIndex(0); }}
                            onDragLeave={handleDragLeave}
                            onDrop={e => handleDrop(e, 0)}>
                            <div className="builder-empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
                            <h3 style={{ margin: 0, fontWeight: 800 }}>Start Building</h3>
                            <p style={{ color: '#6b7280', margin: '0.5rem 0 1.5rem' }}>Drag blocks from the palette or click to add</p>
                            <div style={{ fontSize: '0.7rem', opacity: 0.4 }}>Page ID: {pageId} | Version: Z_FIX_V4</div>
                        </div>
                    ) : (
                        <>
                            {blocks.map((block, i) => {
                                const def = getBlockDef(block.type);
                                const cc = catColor(def?.category || '');
                                return (
                                    <div key={block.id}>
                                        <div className={`builder-dropzone ${dragOverIndex === i ? 'active' : ''}`}
                                            onDragOver={e => handleDragOver(e, i)} onDragLeave={handleDragLeave} onDrop={e => handleDrop(e, i)} />
                                        <div className={`builder-block ${selectedId === block.id ? 'selected' : ''} ${draggingBlockId === block.id ? 'dragging' : ''}`}
                                            onClick={() => { setSelectedId(block.id); setShowPageSettings(false); }}>
                                            <div className="builder-block-header">
                                                <div className="builder-block-header-left">
                                                    <div className="builder-block-drag" draggable onDragStart={e => { e.stopPropagation(); handleBlockDragStart(e, block.id); }} onDragEnd={handleDragEnd}>
                                                        <GripVertical size={16} />
                                                    </div>
                                                    <span className="builder-block-label">{def?.label || block.type || 'Unnamed Block'}</span>
                                                    <span className="builder-block-type-badge" style={{ background: cc.bg, color: cc.text }}>{def?.category || 'Legacy'}</span>
                                                </div>
                                                <div className="builder-block-actions">
                                                    <button onClick={e => { e.stopPropagation(); moveBlock(block.id, -1); }} disabled={i === 0} title="Move up"><ChevronUp size={14} /></button>
                                                    <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 1); }} disabled={i === blocks.length - 1} title="Move down"><ChevronDown size={14} /></button>
                                                    <button onClick={e => { e.stopPropagation(); duplicateBlock(block.id); }} title="Duplicate"><Copy size={14} /></button>
                                                    <button className="danger" onClick={e => { e.stopPropagation(); deleteBlock(block.id); }} title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="builder-block-preview">{blockPreview(block)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className={`builder-dropzone ${dragOverIndex === blocks.length ? 'active' : ''}`}
                                onDragOver={e => handleDragOver(e, blocks.length)} onDragLeave={handleDragLeave} onDrop={e => handleDrop(e, blocks.length)} />
                        </>
                    )}
                </div>
            </div>

            {/* Settings Panel */}
            {(selectedBlock || showPageSettings) && (
                <div className="builder-settings">
                    {showPageSettings ? (
                        <>
                            <div className="builder-settings-header">
                                <span className="builder-settings-title">Page Settings</span>
                                <button onClick={() => setShowPageSettings(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}><X size={16} /></button>
                            </div>
                            <div className="builder-settings-body">
                                {textField('Page Title', page.title, v => setPage({ ...page, title: v }))}
                                {textField('URL Slug', page.slug, v => setPage({ ...page, slug: v }))}
                                {selectField('Status', page.status, ['draft', 'published'], v => setPage({ ...page, status: v }))}
                                <div className="builder-settings-divider" />
                                <label style={{ ...lbl, fontSize: '0.8rem', marginBottom: '0.5rem' }}>SEO Settings</label>
                                {textField('SEO Title', page.seo?.title || '', v => setPage({ ...page, seo: { ...page.seo, title: v } }))}
                                {textArea('Meta Description', page.seo?.description || '', v => setPage({ ...page, seo: { ...page.seo, description: v } }))}
                                {textField('OG Image', page.seo?.ogImage || '', v => setPage({ ...page, seo: { ...page.seo, ogImage: v } }), 'https://...')}
                            </div>
                        </>
                            ) : selectedBlock && (
                        <>
                            <div className="builder-settings-header">
                                <span className="builder-settings-title">{getBlockDef(selectedBlock.type)?.label || 'Block'} Settings</span>
                                <button onClick={() => setSelectedId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}><X size={16} /></button>
                            </div>
                            <div className="builder-settings-body">
                                {getBlockDef(selectedBlock.type)?.fields.length === 0 ? (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>
                                        No settings available for this block type.
                                    </p>
                                ) : (
                                    <GenericSettings
                                        data={selectedBlock.data}
                                        update={(newData) => updateBlock(selectedBlock.id, newData)}
                                        fields={getBlockDef(selectedBlock.type)?.fields || []}
                                    />
                                )}
                                <button className="btn btn-primary" onClick={commitBlockUpdate} style={{ marginTop: '0.5rem', width: '100%' }}>Apply Changes</button>
                            </div>
                        </>
                    )}
                </div>
            )}
            {/* Template Modal */}
            {showTemplateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setShowTemplateModal(false)}>
                    <div style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 600, width: '90%', maxHeight: '70vh', overflow: 'auto' }}
                        onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Load Template</h3>
                        {templates.length === 0 ? (
                            <p style={{ color: 'var(--muted)' }}>No templates saved yet. Save a page as a template first.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {templates.map((t: any) => (
                                    <button key={t.id} onClick={() => {
                                        if (confirm(`Replace all blocks with template "${t.name}"?`)) {
                                            pushHistory(t.blocks || []);
                                            setShowTemplateModal(false);
                                            toast.success(`Template "${t.name}" applied!`);
                                        }
                                    }} style={{
                                        padding: '1rem', borderRadius: 12, border: '1px solid var(--border)',
                                        background: 'white', cursor: 'pointer', textAlign: 'left',
                                    }}>
                                        <strong>{t.name}</strong>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{(t.blocks || []).length} blocks</p>
                                    </button>
                                ))}
                            </div>
                        )}
                        <button className="btn btn-outline btn-sm" onClick={() => setShowTemplateModal(false)} style={{ marginTop: '1rem' }}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

