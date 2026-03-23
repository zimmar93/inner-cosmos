'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useCart } from '@/store/cart';
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description: string;
    sku: string;
    price: string;
    isActive: boolean;
    imageUrl?: string;
    categoryId?: string;
    category?: { id: string; name: string };
    inventory?: { quantityAvailable: number; reservedQuantity: number };
}

function ProductSkeleton() {
    return (
        <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--card)' }}>
            <div className="skeleton" style={{ height: 220 }} />
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="skeleton" style={{ height: 13, width: '40%' }} />
                <div className="skeleton" style={{ height: 18, width: '75%' }} />
                <div className="skeleton" style={{ height: 13, width: '90%' }} />
                <div className="skeleton" style={{ height: 13, width: '60%' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <div className="skeleton" style={{ height: 22, width: 70 }} />
                    <div className="skeleton" style={{ height: 36, width: 90, borderRadius: 8 }} />
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const addItem = useCart((s) => s.addItem);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(`/products?activeOnly=true&limit=50${selectedCategory ? `&categoryId=${selectedCategory}` : ''}`),
            api.get('/categories')
        ]).then(([prodRes, catRes]) => {
            setProducts(prodRes.data.data);
            setCategories(catRes.data);
        })
            .catch(() => toast.error('Failed to load products'))
            .finally(() => setLoading(false));
    }, [selectedCategory]);

    const handleAddToCart = (p: Product) => {
        addItem({ productId: p.id, name: p.name, price: Number(p.price), imageUrl: p.imageUrl });
        toast.success(`${p.name} added to cart!`);
    };

    return (
        <>
            <div className="page-header">
                <span className="eyebrow">Collection</span>
                <h1>Our <span>Products</span></h1>
                <p>Discover our premium collection of Inner Cosmos products</p>
            </div>

            <div className="container" style={{ padding: '3rem 1.5rem' }}>
                {/* Category filter */}
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className={`cat-pill${selectedCategory === '' ? ' active' : ''}`} onClick={() => setSelectedCategory('')}>
                        All
                    </button>
                    {categories.map(cat => (
                        <button key={cat.id} className={`cat-pill${selectedCategory === cat.id ? ' active' : ''}`} onClick={() => setSelectedCategory(cat.id)}>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid-products">
                        {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '5rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>🔭</div>
                        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No products found</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try a different category</p>
                    </div>
                ) : (
                    <div className="grid-products">
                        {products.map((p) => {
                            const available = (p.inventory?.quantityAvailable || 0) - (p.inventory?.reservedQuantity || 0);
                            return (
                                <div key={p.id} className="card">
                                    <Link href={`/products/${p.id}`} style={{ textDecoration: 'none', display: 'block', position: 'relative' }}>
                                        <div className="product-image">
                                            {p.imageUrl ? (
                                                <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span>🌌</span>
                                            )}
                                        </div>
                                        {/* Stock badge overlaid on image */}
                                        <div style={{
                                            position: 'absolute', top: 10, left: 10,
                                            background: 'rgba(255,255,255,0.92)',
                                            backdropFilter: 'blur(6px)',
                                            borderRadius: 50, padding: '3px 10px',
                                            fontSize: '0.7rem', fontWeight: 600,
                                            color: available > 10 ? '#15803d' : available > 0 ? '#a16207' : '#b91c1c',
                                            border: '1px solid',
                                            borderColor: available > 10 ? '#dcfce7' : available > 0 ? '#fef9c3' : '#fee2e2',
                                        }}>
                                            {available > 0 ? (available <= 5 ? `Only ${available} left` : 'In stock') : 'Sold out'}
                                        </div>
                                    </Link>
                                    <div style={{ padding: '1.1rem 1.25rem 1.25rem' }}>
                                        {p.category && (
                                            <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                                                {p.category.name}
                                            </div>
                                        )}
                                        <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.3rem', lineHeight: 1.35 }}>
                                            <Link href={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{p.name}</Link>
                                        </h3>
                                        {p.description && (
                                            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '0.75rem' }}>
                                                {p.description}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.9rem' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
                                                ${Number(p.price).toFixed(2)}
                                            </span>
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', gap: '0.35rem' }}
                                                onClick={() => handleAddToCart(p)}
                                                disabled={available <= 0}
                                            >
                                                <ShoppingCart size={14} /> Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
