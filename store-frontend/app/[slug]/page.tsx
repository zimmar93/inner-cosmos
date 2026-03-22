'use client';
import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Head from 'next/head';
import api from '@/lib/api';
import { getBlockRenderer } from '@/components/blocks/BlockRenderers';

export default function DynamicPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFoundState, setNotFoundState] = useState(false);

    useEffect(() => {
        if (!slug) return;
        api.get(`/pages/${slug}`)
            .then(r => {
                if (!r.data || r.data.status !== 'published') {
                    setNotFoundState(true);
                } else {
                    setPage(r.data);
                }
            })
            .catch(() => setNotFoundState(true))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loading-spinner" /></div>;
    if (notFoundState) return <NotFoundPage />;

    const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
    const seo = page?.seo || {};

    return (
        <>
            {seo.title && <title>{seo.title}</title>}
            {blocks.map((block: any) => {
                const Renderer = getBlockRenderer(block.type);
                if (!Renderer) return null;
                return <Renderer key={block.id} data={block.data} />;
            })}
            {blocks.length === 0 && (
                <section style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{page?.title || 'Page'}</h1>
                    <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>This page is currently empty.</p>
                </section>
            )}
        </>
    );
}

function NotFoundPage() {
    return (
        <section style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Page Not Found</h2>
            <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '2rem' }}>The page you're looking for doesn't exist or has been unpublished.</p>
            <a href="/" className="btn btn-primary" style={{ display: 'inline-block', padding: '0.75rem 2rem', textDecoration: 'none' }}>Back to Home</a>
        </section>
    );
}
