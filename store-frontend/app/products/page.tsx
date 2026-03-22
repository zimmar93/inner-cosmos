'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useCart } from '@/store/cart';
import toast from 'react-hot-toast';
import { ShoppingCart, Star } from 'lucide-react';

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
                <h1>Our Products</h1>
                <p>Discover our premium collection of Inner Cosmos products</p>
            </div>
            <div className="container" style={{ padding: '3rem 1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        className={`btn ${selectedCategory === '' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ borderRadius: '2rem', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                        onClick={() => setSelectedCategory('')}
                    >
                        All Products
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
                            style={{ borderRadius: '2rem', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-spinner" />
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '4rem' }}>
                        <p style={{ fontSize: '1.25rem' }}>No products available yet.</p>
                    </div>
                ) : (
                    <div className="grid-products">
                        {products.map((p) => {
                            const available = (p.inventory?.quantityAvailable || 0) - (p.inventory?.reservedQuantity || 0);
                            return (
                                <div key={p.id} className="card">
                                    <Link href={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                                        <div className="product-image" style={{ background: p.imageUrl ? undefined : 'linear-gradient(135deg,#e0e0ff,#c0c0f0)' }}>
                                            {p.imageUrl ? (
                                                <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span>🌌</span>
                                            )}
                                        </div>
                                    </Link>
                                    <div style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                                                    <Link href={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{p.name}</Link>
                                                </h3>
                                                {p.category && (
                                                    <span className="badge badge-primary" style={{ fontSize: '0.7rem', marginBottom: '0.5rem', display: 'inline-block' }}>{p.category.name}</span>
                                                )}
                                                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>SKU: {p.sku}</p>
                                            </div>
                                            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)' }}>
                                                ${Number(p.price).toFixed(2)}
                                            </span>
                                        </div>
                                        {p.description && (
                                            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '0.5rem', marginBottom: '1rem', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {p.description}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                                            <span className={`badge ${available > 10 ? 'badge-green' : available > 0 ? 'badge-yellow' : 'badge-red'}`}>
                                                {available > 0 ? `${available} in stock` : 'Out of stock'}
                                            </span>
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
                                                onClick={() => handleAddToCart(p)}
                                                disabled={available <= 0}
                                            >
                                                <ShoppingCart size={15} /> Add
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
