'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/store/cart';
import toast from 'react-hot-toast';
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import Link from 'next/link';

function ProductDetailSkeleton() {
    return (
        <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
            <div className="skeleton" style={{ height: 36, width: 140, marginBottom: '2rem', borderRadius: 8 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
                <div className="skeleton" style={{ height: 420, borderRadius: 'var(--radius)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="skeleton" style={{ height: 13, width: '30%' }} />
                    <div className="skeleton" style={{ height: 36, width: '80%' }} />
                    <div className="skeleton" style={{ height: 14, width: '100%' }} />
                    <div className="skeleton" style={{ height: 14, width: '90%' }} />
                    <div className="skeleton" style={{ height: 14, width: '70%' }} />
                    <div className="skeleton" style={{ height: 44, width: '40%', marginTop: 8 }} />
                </div>
            </div>
        </div>
    );
}

export default function ProductDetailPage() {
    const { id } = useParams() as { id: string };
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const addItem = useCart((s) => s.addItem);
    const router = useRouter();

    useEffect(() => {
        api.get(`/products/${id}`)
            .then((r) => setProduct(r.data))
            .catch(() => { toast.error('Product not found'); router.push('/products'); })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <ProductDetailSkeleton />;
    if (!product) return null;

    const available = (product.inventory?.quantityAvailable || 0) - (product.inventory?.reservedQuantity || 0);

    const handleAddToCart = () => {
        for (let i = 0; i < qty; i++) {
            addItem({ productId: product.id, name: product.name, price: Number(product.price), imageUrl: product.imageUrl });
        }
        toast.success(`${qty}× ${product.name} added to cart!`);
    };

    return (
        <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
            <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, marginBottom: '2rem', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                <ArrowLeft size={15} /> Back to products
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', alignItems: 'start' }}>
                <div className="card" style={{ height: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: product.imageUrl ? undefined : 'linear-gradient(160deg, var(--primary-50), var(--primary-100))' }}>
                    {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '6rem' }}>🌌</span>}
                </div>

                <div>
                    {product.category && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', display: 'block', marginBottom: '0.6rem' }}>
                            {product.category.name}
                        </span>
                    )}
                    <h1 style={{ fontSize: '2.1rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: 1.2 }}>{product.name}</h1>
                    {product.description && (
                        <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1.75rem', fontSize: '0.95rem' }}>{product.description}</p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text)' }}>
                            ${Number(product.price).toFixed(2)}
                        </span>
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.3rem 0.85rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600,
                            background: available > 10 ? '#dcfce7' : available > 0 ? '#fef9c3' : '#fee2e2',
                            color: available > 10 ? '#15803d' : available > 0 ? '#a16207' : '#b91c1c',
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                            {available > 0 ? `${available} in stock` : 'Out of stock'}
                        </span>
                    </div>

                    {available > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 500 }}>Qty</span>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'background 0.15s' }}>
                                    <Minus size={13} />
                                </button>
                                <span style={{ width: 36, textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>{qty}</span>
                                <button onClick={() => setQty(Math.min(available, qty + 1))} style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'background 0.15s' }}>
                                    <Plus size={13} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-primary" onClick={handleAddToCart} disabled={available <= 0} style={{ flex: 1, padding: '0.85rem' }}>
                            <ShoppingCart size={17} /> Add to cart
                        </button>
                        <Link href="/cart" className="btn btn-outline" style={{ padding: '0.85rem 1.25rem' }}>View cart</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
