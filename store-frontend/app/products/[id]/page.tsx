'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/store/cart';
import toast from 'react-hot-toast';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

    if (loading) return <div className="loading-spinner" style={{ marginTop: '6rem' }} />;
    if (!product) return null;

    const available = (product.inventory?.quantityAvailable || 0) - (product.inventory?.reservedQuantity || 0);

    const handleAddToCart = () => {
        for (let i = 0; i < qty; i++) {
            addItem({ productId: product.id, name: product.name, price: Number(product.price), imageUrl: product.imageUrl });
        }
        toast.success(`${qty}× ${product.name} added to cart!`);
    };

    return (
        <div className="container" style={{ padding: '2rem 1.5rem' }}>
            <Link href="/products" className="btn btn-outline" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
                <ArrowLeft size={16} /> Back to Products
            </Link>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
                <div className="card" style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: '6rem' }}>🌌</span>
                    )}
                </div>
                <div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>SKU: {product.sku}</p>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>{product.name}</h1>
                    <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>{product.description}</p>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.5rem' }}>
                        ${Number(product.price).toFixed(2)}
                    </div>
                    <span className={`badge ${available > 10 ? 'badge-green' : available > 0 ? 'badge-yellow' : 'badge-red'}`} style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
                        {available > 0 ? `${available} in stock` : 'Out of stock'}
                    </span>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Quantity</label>
                            <input type="number" min={1} max={available} value={qty}
                                onChange={(e) => setQty(Math.min(Math.max(1, +e.target.value), available))}
                                style={{ width: 100 }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-primary" onClick={handleAddToCart} disabled={available <= 0} style={{ flex: 1 }}>
                            <ShoppingCart size={18} /> Add to Cart
                        </button>
                        <Link href="/cart" className="btn btn-outline">View Cart</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
