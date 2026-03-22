'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Copy, FileText, Printer, FileDown, Share2 } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = { DRAFT: 'badge-gray', SENT: 'badge-blue', PAID: 'badge-green', OVERDUE: 'badge-red', CANCELLED: 'badge-gray' };
const emptyItem = () => ({ description: '', quantity: 1, unitPrice: 0, taxRate: 0 });
const defaultForm = () => ({
    senderName: '', senderAddress: '', senderPhone: '', senderEmail: '',
    clientName: '', clientCompany: '', clientAddress: '', clientEmail: '', clientPhone: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    discountType: 'FIXED' as 'FIXED' | 'PERCENT', discountValue: 0, taxRate: 0, shippingCost: 0,
    paymentTerms: 'Net 30', paymentMethods: '', bankDetails: '', lateFeePolicy: '', notes: '',
    items: [emptyItem()],
});

function calcTotals(items: any[], discountType: string, discountValue: number, shippingCost: number) {
    let subtotal = 0;
    let tax = 0;
    items.forEach(i => {
        const net = (i.quantity || 0) * (i.unitPrice || 0);
        const itemTax = net * ((i.taxRate || 0) / 100);
        subtotal += net;
        tax += itemTax;
    });
    const discount = discountType === 'PERCENT' ? subtotal * (discountValue / 100) : discountValue;
    const afterDiscount = Math.max(0, subtotal - discount);
    return { subtotal, discount, tax, grandTotal: Math.max(0, afterDiscount + tax + shippingCost) };
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; editing?: any }>({ open: false });
    const [form, setForm] = useState(defaultForm());
    const [tab, setTab] = useState<'details' | 'items' | 'payment'>('details');
    const [filterStatus, setFilterStatus] = useState('');

    // Autocomplete states
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        const url = filterStatus ? `/invoices?status=${filterStatus}` : '/invoices';
        api.get(url).then(r => setInvoices(r.data)).finally(() => setLoading(false));

        // Also fetch catalog
        api.get('/categories').then(r => setCategories(r.data)).catch(console.error);
        api.get('/products?limit=1000').then(r => setProducts(r.data.data)).catch(console.error);
    };
    useEffect(() => { load(); }, [filterStatus]);

    const openCreate = () => { setForm(defaultForm()); setTab('details'); setModal({ open: true }); };
    const openEdit = (inv: any) => {
        setForm({
            senderName: inv.senderName || '', senderAddress: inv.senderAddress || '', senderPhone: inv.senderPhone || '', senderEmail: inv.senderEmail || '',
            clientName: inv.clientName || '', clientCompany: inv.clientCompany || '', clientAddress: inv.clientAddress || '', clientEmail: inv.clientEmail || '', clientPhone: inv.clientPhone || '',
            issueDate: inv.issueDate?.split('T')[0] || '', dueDate: inv.dueDate?.split('T')[0] || '',
            discountType: inv.discountType || 'FIXED', discountValue: Number(inv.discountValue) || 0, taxRate: Number(inv.taxRate) || 0, shippingCost: Number(inv.shippingCost) || 0,
            paymentTerms: inv.paymentTerms || '', paymentMethods: inv.paymentMethods || '', bankDetails: inv.bankDetails || '', lateFeePolicy: inv.lateFeePolicy || '', notes: inv.notes || '',
            items: inv.items?.length ? inv.items.map((i: any) => ({ description: i.description, quantity: i.quantity, unitPrice: Number(i.unitPrice), taxRate: Number(i.taxRate) })) : [emptyItem()],
        });
        setTab('details'); setModal({ open: true, editing: inv });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.items.length === 0 || !form.items.some(i => i.description.trim())) { toast.error('Add at least one line item'); return; }
        try {
            const payload = { ...form, items: form.items.filter(i => i.description.trim()) };
            if (modal.editing) {
                await api.put(`/invoices/${modal.editing.id}`, payload);
                toast.success('Invoice updated!');
            } else {
                await api.post('/invoices', payload);
                toast.success('Invoice created!');
            }
            setModal({ open: false }); load();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Error saving invoice'); }
    };

    const handleDelete = async (id: string) => { if (!confirm('Delete this invoice?')) return; await api.delete(`/invoices/${id}`); toast.success('Invoice deleted'); load(); };
    const handleDuplicate = async (id: string) => { await api.post(`/invoices/${id}/duplicate`); toast.success('Invoice duplicated!'); load(); };
    const handleStatusChange = async (id: string, status: string) => { await api.put(`/invoices/${id}/status`, { status }); toast.success(`Status → ${status}`); load(); };

    const updateItem = (idx: number, field: string, value: any) => {
        const items = [...form.items];
        (items[idx] as any)[field] = value;
        setForm({ ...form, items });
    };
    const addItem = () => setForm({ ...form, items: [...form.items, emptyItem()] });
    const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

    const totals = calcTotals(form.items, form.discountType, form.discountValue, form.shippingCost);

    const generateInvoiceHtml = (inv: any) => {
        const items = inv.items || [];
        return `<!DOCTYPE html><html><head><title>Invoice ${inv.invoiceNumber}</title><style>
            body{font-family:Arial,sans-serif;margin:40px;color:#333}
            .header{display:flex;justify-content:space-between;border-bottom:3px solid #1a1a2e;padding-bottom:20px;margin-bottom:20px}
            .header h1{margin:0;color:#1a1a2e;font-size:28px}
            .meta{text-align:right;font-size:13px;line-height:1.8}
            .badge{display:inline-block;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:bold;color:white}
            .badge-DRAFT{background:#888} .badge-SENT{background:#2196f3} .badge-PAID{background:#4caf50} .badge-OVERDUE{background:#f44336} .badge-CANCELLED{background:#999}
            .parties{display:flex;gap:40px;margin-bottom:30px}
            .party{flex:1}
            .party h3{margin:0 0 8px;font-size:12px;text-transform:uppercase;color:#888;letter-spacing:1px}
            .party p{margin:2px 0;font-size:13px}
            table{width:100%;border-collapse:collapse;margin-bottom:20px}
            th{background:#1a1a2e;color:white;padding:10px;text-align:left;font-size:12px}
            td{padding:8px 10px;border-bottom:1px solid #eee;font-size:13px}
            tr:nth-child(even){background:#f9f9f9}
            .totals{text-align:right;margin-top:10px}
            .totals table{width:300px;margin-left:auto}
            .totals td{border:none;padding:5px 10px}
            .totals .grand{font-size:18px;font-weight:bold;color:#1a1a2e;border-top:2px solid #1a1a2e}
            .footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;font-size:12px;color:#888;text-align:center}
            @media print{body{margin:20px}}
        </style></head><body>
        <div class="header"><div><h1>${inv.senderName || 'Invoice'}</h1><p>${inv.senderAddress || ''}</p><p>${inv.senderEmail || ''} ${inv.senderPhone || ''}</p></div>
        <div class="meta"><div style="font-size:22px;font-weight:bold;color:#1a1a2e">${inv.invoiceNumber}</div>
        <div><span class="badge badge-${inv.status}">${inv.status}</span></div>
        <div><strong>Issue:</strong> ${new Date(inv.issueDate).toLocaleDateString()}</div>
        <div><strong>Due:</strong> ${new Date(inv.dueDate).toLocaleDateString()}</div></div></div>
        <div class="parties"><div class="party"><h3>Bill To</h3><p><strong>${inv.clientName || ''}</strong></p><p>${inv.clientCompany || ''}</p><p>${inv.clientAddress || ''}</p><p>${inv.clientEmail || ''}</p><p>${inv.clientPhone || ''}</p></div></div>
        <table><thead><tr><th>Product Name</th><th>Qty</th><th>Unit Price</th><th>Tax %</th><th>Total</th></tr></thead><tbody>
        ${items.map((i: any) => `<tr><td>${i.description}</td><td>${i.quantity}</td><td>$${Number(i.unitPrice).toFixed(2)}</td><td>${Number(i.taxRate)}%</td><td>$${Number(i.lineTotal).toFixed(2)}</td></tr>`).join('')}
        </tbody></table>
        <div class="totals"><table>
        <tr><td>Subtotal</td><td>$${Number(inv.subtotal).toFixed(2)}</td></tr>
        ${Number(inv.discountValue) > 0 ? `<tr><td>Discount (${inv.discountType === 'PERCENT' ? Number(inv.discountValue) + '%' : '$' + Number(inv.discountValue).toFixed(2)})</td><td>-</td></tr>` : ''}
        ${(() => {
                const t = items.reduce((s: number, i: any) => s + (i.quantity * i.unitPrice * (i.taxRate || 0) / 100), 0);
                return t > 0 ? `<tr><td>Tax</td><td>$${t.toFixed(2)}</td></tr>` : '';
            })()}
        ${Number(inv.shippingCost) > 0 ? `<tr><td>Shipping</td><td>$${Number(inv.shippingCost).toFixed(2)}</td></tr>` : ''}
        <tr class="grand"><td>Grand Total</td><td>$${Number(inv.grandTotal).toFixed(2)}</td></tr>
        </table></div>
        ${inv.paymentTerms || inv.bankDetails ? `<div style="margin-top:30px;font-size:13px"><strong>Payment Terms:</strong> ${inv.paymentTerms || 'N/A'}<br/>${inv.bankDetails ? `<strong>Bank Details:</strong> ${inv.bankDetails}` : ''}</div>` : ''}
        ${inv.notes ? `<div style="margin-top:20px;font-size:13px;color:#666"><strong>Notes:</strong> ${inv.notes}</div>` : ''}
        <div class="footer">Thank you for your business!</div>
        </body></html>`;
    };

    const printInvoice = (inv: any) => {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(generateInvoiceHtml(inv));
        w.document.close();
        setTimeout(() => w.print(), 300);
    };

    const getPdfOptions = (inv: any) => ({
        margin: 10,
        filename: `${inv.invoiceNumber}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    });

    const getHtml2PdfDiv = (inv: any) => {
        const div = document.createElement('div');
        const html = generateInvoiceHtml(inv);
        const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
        const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
        if (styleMatch && bodyMatch) {
            div.innerHTML = `<style>${styleMatch[1]}</style>${bodyMatch[1]}`;
        }
        return div;
    };

    const downloadPdf = async (inv: any) => {
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            await html2pdf().set(getPdfOptions(inv) as any).from(getHtml2PdfDiv(inv)).save();
            toast.success('PDF Downloaded');
        } catch (e) {
            console.error(e);
            toast.error('Failed to generate PDF');
        }
    };

    const sharePdf = async (inv: any) => {
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const pdfBlob = await html2pdf().set(getPdfOptions(inv) as any).from(getHtml2PdfDiv(inv)).outputPdf('blob');
            const file = new File([pdfBlob], `${inv.invoiceNumber}.pdf`, { type: 'application/pdf' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Invoice ${inv.invoiceNumber}`,
                    text: `Here is your invoice ${inv.invoiceNumber}.`,
                    files: [file]
                });
            } else {
                toast.error('File sharing is not supported on this device. Downloading PDF instead.');
                await downloadPdf(inv);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to share PDF');
        }
    };

    return (
        <>
            <div className="erp-topbar">
                <div>
                    <div className="page-title">Invoices</div>
                    <div className="page-subtitle">Create and manage business invoices</div>
                </div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Invoice</button>
            </div>
            <div className="erp-content">
                {/* Status Filter Pills */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {['', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].map(s => (
                        <button key={s} className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterStatus(s)}>
                            {s || 'All'}
                        </button>
                    ))}
                </div>
                <div className="card">
                    <div className="table-wrap">
                        {loading ? <div className="loading-spinner" /> : (
                            <table>
                                <thead><tr><th>Invoice #</th><th>Client</th><th>Issue Date</th><th>Due Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {invoices.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No invoices yet. Click "New Invoice" to create one.</td></tr>
                                    ) : invoices.map((inv) => (
                                        <tr key={inv.id}>
                                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                                            <td>{inv.clientName}{inv.clientCompany ? <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}> — {inv.clientCompany}</span> : ''}</td>
                                            <td style={{ fontSize: '0.85rem' }}>{new Date(inv.issueDate).toLocaleDateString()}</td>
                                            <td style={{ fontSize: '0.85rem' }}>{new Date(inv.dueDate).toLocaleDateString()}</td>
                                            <td style={{ fontWeight: 600 }}>${Number(inv.grandTotal).toFixed(2)}</td>
                                            <td>
                                                <select className={`badge ${STATUS_COLORS[inv.status] || ''}`}
                                                    value={inv.status}
                                                    onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                                                    style={{ border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    {['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                    <button className="btn btn-outline btn-sm" title="Edit" onClick={() => openEdit(inv)}><Edit size={13} /></button>
                                                    <button className="btn btn-outline btn-sm" title="Duplicate" onClick={() => handleDuplicate(inv.id)}><Copy size={13} /></button>
                                                    <button className="btn btn-outline btn-sm" title="Print" onClick={() => printInvoice(inv)}><Printer size={13} /></button>
                                                    <button className="btn btn-outline btn-sm" title="Download PDF" onClick={() => downloadPdf(inv)}><FileDown size={13} /></button>
                                                    <button className="btn btn-outline btn-sm" title="Share via WhatsApp" onClick={() => sharePdf(inv)}><Share2 size={13} /></button>
                                                    <button className="btn btn-danger btn-sm" title="Delete" onClick={() => handleDelete(inv.id)}><Trash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {modal.open && (
                <div className="modal-overlay" onClick={() => setModal({ open: false })}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', maxHeight: '85vh', overflow: 'auto' }}>
                        <div className="modal-header">
                            <div className="modal-title">{modal.editing ? `Edit ${modal.editing.invoiceNumber}` : 'New Invoice'}</div>
                            <button onClick={() => setModal({ open: false })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
                            {(['details', 'items', 'payment'] as const).map(t => (
                                <button key={t} type="button" onClick={() => setTab(t)}
                                    style={{ padding: '0.6rem 1.2rem', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent', fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize', color: tab === t ? 'var(--primary)' : 'var(--muted)' }}>
                                    {t}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Tab: Details */}
                            {tab === 'details' && (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>From (Sender)</h4>
                                            <div className="form-group"><label>Business Name *</label><input required value={form.senderName} onChange={e => setForm({ ...form, senderName: e.target.value })} /></div>
                                            <div className="form-group"><label>Address</label><input value={form.senderAddress} onChange={e => setForm({ ...form, senderAddress: e.target.value })} /></div>
                                            <div className="form-group"><label>Email</label><input value={form.senderEmail} onChange={e => setForm({ ...form, senderEmail: e.target.value })} /></div>
                                            <div className="form-group"><label>Phone</label><input value={form.senderPhone} onChange={e => setForm({ ...form, senderPhone: e.target.value })} /></div>
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Bill To (Client)</h4>
                                            <div className="form-group"><label>Client Name *</label><input required value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} /></div>
                                            <div className="form-group"><label>Company</label><input value={form.clientCompany} onChange={e => setForm({ ...form, clientCompany: e.target.value })} /></div>
                                            <div className="form-group"><label>Address</label><input value={form.clientAddress} onChange={e => setForm({ ...form, clientAddress: e.target.value })} /></div>
                                            <div className="form-group"><label>Email</label><input value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} /></div>
                                            <div className="form-group"><label>Phone</label><input value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} /></div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <div className="form-group"><label>Issue Date</label><input type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} /></div>
                                        <div className="form-group"><label>Due Date *</label><input type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
                                    </div>
                                </>
                            )}

                            {/* Tab: Items */}
                            {tab === 'items' && (
                                <>
                                    <div style={{ overflow: 'visible' }}>
                                        <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                            <thead><tr><th>Product Name</th><th style={{ width: 90 }}>Qty</th><th style={{ width: 110 }}>Unit Price</th><th style={{ width: 100 }}>Tax %</th><th style={{ width: 100 }}>Total</th><th style={{ width: 40 }}></th></tr></thead>
                                            <tbody>
                                                {form.items.map((item, idx) => {
                                                    const lineNet = (item.quantity || 0) * (item.unitPrice || 0);
                                                    const itemTax = lineNet * ((item.taxRate || 0) / 100);
                                                    const lt = lineNet + itemTax;
                                                    return (
                                                        <tr key={idx}>
                                                            <td style={{ position: 'relative', overflow: 'visible' }}>
                                                                <input style={{ width: '100%' }} placeholder="Search product..." value={item.description}
                                                                    onFocus={() => setActiveDropdown(idx)}
                                                                    onChange={e => { updateItem(idx, 'description', e.target.value); setActiveDropdown(idx); }}
                                                                    onBlur={() => { setTimeout(() => setActiveDropdown(null), 200); }}
                                                                />
                                                                {activeDropdown === idx && (
                                                                    <div className="product-dropdown" tabIndex={-1} style={{
                                                                        position: 'absolute', top: '100%', left: 0, width: '350px', zIndex: 100,
                                                                        background: 'var(--card)', border: '1px solid var(--border)',
                                                                        borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                                                        maxHeight: '350px', overflowY: 'auto'
                                                                    }}>
                                                                        {(() => {
                                                                            const term = item.description.toLowerCase();
                                                                            const matched = term ? products.filter(p => p.name.toLowerCase().includes(term) || p.sku?.toLowerCase().includes(term)) : [];

                                                                            const selectProduct = (p: any) => {
                                                                                updateItem(idx, 'description', p.name);
                                                                                updateItem(idx, 'unitPrice', Number(p.price));
                                                                                setActiveDropdown(null);
                                                                            };

                                                                            if (term) {
                                                                                return matched.length ? matched.map(p => (
                                                                                    <div key={p.id} onMouseDown={(e) => { e.preventDefault(); selectProduct(p); }} style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                        <div><div style={{ fontWeight: 500 }}>{p.name}</div>{p.sku && <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{p.sku}</div>}</div>
                                                                                        <div style={{ color: 'var(--primary)', fontWeight: 600 }}>${Number(p.price).toFixed(2)}</div>
                                                                                    </div>
                                                                                )) : <div style={{ padding: '1rem', color: 'var(--muted)', textAlign: 'center' }}>No products found matching "{item.description}"</div>;
                                                                            }

                                                                            return (
                                                                                <div>
                                                                                    {categories.map(cat => {
                                                                                        const catProds = products.filter(p => p.categoryId === cat.id);
                                                                                        if (!catProds.length) return null;
                                                                                        const isEx = expandedCategory === cat.id;
                                                                                        return (
                                                                                            <div key={cat.id}>
                                                                                                <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedCategory(isEx ? null : cat.id); }}>
                                                                                                    <span style={{ fontSize: '0.7rem', transition: 'transform 0.2s', transform: isEx ? 'rotate(90deg)' : 'rotate(0)' }}>▶</span> {cat.name} <span style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 400 }}>({catProds.length} items)</span>
                                                                                                </div>
                                                                                                {isEx && catProds.map(p => (
                                                                                                    <div key={p.id} onMouseDown={(e) => { e.preventDefault(); selectProduct(p); }} style={{ padding: '0.75rem 0.75rem 0.75rem 2rem', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                                        <div><div style={{ fontWeight: 500 }}>{p.name}</div>{p.sku && <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{p.sku}</div>}</div>
                                                                                                        <div style={{ color: 'var(--primary)', fontWeight: 600 }}>${Number(p.price).toFixed(2)}</div>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                    {(() => {
                                                                                        const uncat = products.filter(p => !p.categoryId);
                                                                                        if (!uncat.length) return null;
                                                                                        const isEx = expandedCategory === 'uncat';
                                                                                        return (
                                                                                            <div>
                                                                                                <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedCategory(isEx ? null : 'uncat'); }}>
                                                                                                    <span style={{ fontSize: '0.7rem', transition: 'transform 0.2s', transform: isEx ? 'rotate(90deg)' : 'rotate(0)' }}>▶</span> Uncategorized <span style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 400 }}>({uncat.length} items)</span>
                                                                                                </div>
                                                                                                {isEx && uncat.map(p => (
                                                                                                    <div key={p.id} onMouseDown={(e) => { e.preventDefault(); selectProduct(p); }} style={{ padding: '0.75rem 0.75rem 0.75rem 2rem', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                                        <div><div style={{ fontWeight: 500 }}>{p.name}</div>{p.sku && <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{p.sku}</div>}</div>
                                                                                                        <div style={{ color: 'var(--primary)', fontWeight: 600 }}>${Number(p.price).toFixed(2)}</div>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        );
                                                                                    })()}
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td><input type="number" min="1" style={{ width: '100%', padding: '0.5rem' }} value={item.quantity} onChange={e => updateItem(idx, 'quantity', +e.target.value)} /></td>
                                                            <td><input type="number" step="0.01" min="0" style={{ width: '100%', padding: '0.5rem' }} value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', +e.target.value)} /></td>
                                                            <td><input type="number" step="0.01" min="0" style={{ width: '100%', padding: '0.5rem' }} value={item.taxRate} onChange={e => updateItem(idx, 'taxRate', +e.target.value)} /></td>
                                                            <td style={{ fontWeight: 600 }}>${lt.toFixed(2)}</td>
                                                            <td><button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(idx)} disabled={form.items.length <= 1}><X size={12} /></button></td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <button type="button" className="btn btn-outline btn-sm" onClick={addItem} style={{ marginTop: '0.5rem' }}><Plus size={14} /> Add Line Item</button>

                                    {/* Financial Summary */}
                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label>Discount Type</label>
                                                <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })}>
                                                    <option value="FIXED">Fixed ($)</option>
                                                    <option value="PERCENT">Percentage (%)</option>
                                                </select>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}><label>Discount Value</label><input type="number" step="0.01" min="0" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: +e.target.value })} /></div>
                                            <div className="form-group" style={{ marginBottom: 0 }}><label>Shipping Cost ($)</label><input type="number" step="0.01" min="0" value={form.shippingCost} onChange={e => setForm({ ...form, shippingCost: +e.target.value })} /></div>
                                        </div>

                                        <div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '0.9rem', lineHeight: '1.8' }}>
                                            <div>Subtotal: <strong>${totals.subtotal.toFixed(2)}</strong></div>
                                            {totals.discount > 0 && <div style={{ color: 'var(--danger)' }}>Discount: -${totals.discount.toFixed(2)}</div>}
                                            {totals.tax > 0 && <div>Tax: +${totals.tax.toFixed(2)}</div>}
                                            {form.shippingCost > 0 && <div>Shipping: +${form.shippingCost.toFixed(2)}</div>}
                                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.5rem', borderTop: '2px solid var(--border)', paddingTop: '0.5rem' }}>
                                                Grand Total: ${totals.grandTotal.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Tab: Payment */}
                            {tab === 'payment' && (
                                <>
                                    <div className="form-group"><label>Payment Terms</label><input value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })} placeholder="e.g. Net 30" /></div>
                                    <div className="form-group"><label>Accepted Payment Methods</label><input value={form.paymentMethods} onChange={e => setForm({ ...form, paymentMethods: e.target.value })} placeholder="e.g. Bank Transfer, PayPal, Stripe" /></div>
                                    <div className="form-group"><label>Bank Details</label><textarea value={form.bankDetails} onChange={e => setForm({ ...form, bankDetails: e.target.value })} rows={3} placeholder="Account name, number, routing..." /></div>
                                    <div className="form-group"><label>Late Fee Policy</label><input value={form.lateFeePolicy} onChange={e => setForm({ ...form, lateFeePolicy: e.target.value })} placeholder="e.g. 1.5% per month after due date" /></div>
                                    <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Additional notes..." /></div>
                                </>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setModal({ open: false })}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{modal.editing ? 'Update Invoice' : 'Create Invoice'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
