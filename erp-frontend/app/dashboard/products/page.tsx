'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; editing?: any }>({ open: false });
    const [form, setForm] = useState({ name: '', description: '', sku: '', price: '', purchasePrice: '', wholesalePrice: '', imageUrl: '', initialStock: '0', categoryId: '' });
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [showAdvancedPricing, setShowAdvancedPricing] = useState(false);

    const load = () => {
        setLoading(true);
        Promise.all([
            api.get('/products?limit=100'),
            api.get('/categories')
        ]).then(([productsRes, catsRes]) => {
            setProducts(productsRes.data.data);
            setCategories(catsRes.data);
        }).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleImageUpload = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (file.size > 10 * 1024 * 1024) return reject('File too large (max 10MB)');
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height;
                    const MW = 1920, MH = 1080;
                    if (w > h) { if (w > MW) { h *= MW / w; w = MW; } } else { if (h > MH) { w *= MH / h; h = MH; } }
                    canvas.width = w; canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('Canvas error');
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const openCreate = () => { setForm({ name: '', description: '', sku: '', price: '', purchasePrice: '', wholesalePrice: '', imageUrl: '', initialStock: '0', categoryId: '' }); setNewCategoryName(''); setShowNewCategory(false); setShowAdvancedPricing(false); setModal({ open: true }); };
    const openEdit = (p: any) => { setForm({ name: p.name, description: p.description || '', sku: p.sku, price: String(p.price), purchasePrice: p.purchasePrice ? String(p.purchasePrice) : '', wholesalePrice: p.wholesalePrice ? String(p.wholesalePrice) : '', imageUrl: p.imageUrl || '', initialStock: '0', categoryId: p.categoryId || '' }); setNewCategoryName(''); setShowNewCategory(false); setShowAdvancedPricing(!!p.purchasePrice || !!p.wholesalePrice); setModal({ open: true, editing: p }); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let selectedCategoryId = form.categoryId;

            if (showNewCategory && newCategoryName.trim()) {
                const catRes = await api.post('/categories', { name: newCategoryName.trim() });
                selectedCategoryId = catRes.data.id;
            }

            if (modal.editing) {
                await api.put(`/products/${modal.editing.id}`, { name: form.name, description: form.description, price: +form.price, purchasePrice: form.purchasePrice ? +form.purchasePrice : null, wholesalePrice: form.wholesalePrice ? +form.wholesalePrice : null, imageUrl: form.imageUrl || undefined, isActive: true, categoryId: selectedCategoryId || undefined });
                toast.success('Product updated!');
            } else {
                await api.post('/products', { ...form, price: +form.price, purchasePrice: form.purchasePrice ? +form.purchasePrice : undefined, wholesalePrice: form.wholesalePrice ? +form.wholesalePrice : undefined, initialStock: +form.initialStock, categoryId: selectedCategoryId || undefined });
                toast.success('Product created!');
            }
            setModal({ open: false });
            load();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error saving product');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deactivate this product?')) return;
        await api.delete(`/products/${id}`);
        toast.success('Product deactivated');
        load();
    };

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Products</div>
                    <div className="page-subtitle">Manage your product catalog</div>
                </div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Product</button>
            </div>
            <div className="erp-content">
                <div className="card">
                    <div className="table-wrap">
                        {loading ? <div className="loading-spinner" /> : (
                            <table>
                                <thead><tr><th>Name</th><th>Category</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {products.map((p) => {
                                        const avail = (p.inventory?.quantityAvailable || 0) - (p.inventory?.reservedQuantity || 0);
                                        return (
                                            <tr key={p.id}>
                                                <td style={{ fontWeight: 600 }}>{p.name}</td>
                                                <td>{p.category ? <span className="badge badge-yellow">{p.category.name}</span> : <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No Category</span>}</td>
                                                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{p.sku}</td>
                                                <td>${Number(p.price).toFixed(2)}</td>
                                                <td>
                                                    <span className={`badge ${avail > 10 ? 'badge-green' : avail > 0 ? 'badge-yellow' : 'badge-red'}`}>
                                                        {avail} avail
                                                    </span>
                                                </td>
                                                <td><span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}><Edit size={13} /></button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={13} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {modal.open && (
                <div className="modal-overlay" onClick={() => setModal({ open: false })}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">{modal.editing ? 'Edit Product' : 'New Product'}</div>
                            <button onClick={() => setModal({ open: false })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label>Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                            <div className="form-group"><label>Category</label>
                                <select value={showNewCategory ? 'NEW' : form.categoryId} onChange={(e) => {
                                    if (e.target.value === 'NEW') {
                                        setShowNewCategory(true);
                                        setForm({ ...form, categoryId: '' });
                                    } else {
                                        setShowNewCategory(false);
                                        setForm({ ...form, categoryId: e.target.value });
                                    }
                                }}>
                                    <option value="">No Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    <option value="NEW">+ Create New Category...</option>
                                </select>
                            </div>
                            {showNewCategory && (
                                <div className="form-group" style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--primary)' }}>
                                    <label>New Category Name *</label>
                                    <input required value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Accessories" />
                                </div>
                            )}
                            <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
                            {!modal.editing && <div className="form-group"><label>SKU *</label><input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>}
                            <div className="form-group"><label>Price ($) *</label><input type="number" step="0.01" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>

                            <div style={{ marginBottom: '1rem' }}>
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAdvancedPricing(!showAdvancedPricing)} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    {showAdvancedPricing ? 'Hide Advanced Pricing' : 'Show Advanced Pricing Options'}
                                </button>
                            </div>

                            {showAdvancedPricing && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Purchase Price ($)</label>
                                        <input type="number" step="0.01" min="0" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} placeholder="e.g. 10.00" />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Wholesale Price ($)</label>
                                        <input type="number" step="0.01" min="0" value={form.wholesalePrice} onChange={(e) => setForm({ ...form, wholesalePrice: e.target.value })} placeholder="e.g. 15.00" />
                                    </div>
                                </div>
                            )}
                            {/* Image Upload UI */}
                            <div className="form-group">
                                <label>Image URL or Upload</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {form.imageUrl && (
                                        <div style={{ position: 'relative', width: '100px', height: '100px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                                            <img src={form.imageUrl} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, imageUrl: '' })}
                                                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 2 }}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input style={{ flex: 1 }} placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                                        <span>or</span>
                                        <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                                            Upload File
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={async (e) => {
                                                    const f = e.target.files?.[0];
                                                    if (!f) return;
                                                    try {
                                                        const b64 = await handleImageUpload(f);
                                                        setForm({ ...form, imageUrl: b64 });
                                                    } catch (err: any) {
                                                        toast.error(err);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {!modal.editing && <div className="form-group"><label>Initial Stock</label><input type="number" min="0" value={form.initialStock} onChange={(e) => setForm({ ...form, initialStock: e.target.value })} /></div>}
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setModal({ open: false })}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{modal.editing ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
