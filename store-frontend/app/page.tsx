'use client';
import { useState, useEffect } from 'react';
import { getBlockRenderer } from '@/components/blocks/BlockRenderers';
import api from '@/lib/api';

/* ── Block normalizer (shared logic with builder) ── */
function normalizeBlock(raw: any): any {
    if (!raw) return null;
    let type: string = raw.type || raw.section || raw.blockType || '';
    const id: string = raw.id || Math.random().toString(36).slice(2, 10);
    let data: Record<string, any> = raw.data || raw.content || raw.settings || {};

    if (Object.keys(data).length === 0) {
        const systemKeys = ['id', 'type', 'section', 'blockType', 'createdAt', 'updatedAt'];
        const legacyData: Record<string, any> = {};
        for (const key in raw) {
            if (!systemKeys.includes(key)) legacyData[key] = raw[key];
        }
        if (Object.keys(legacyData).length > 0) data = legacyData;
    }

    // Fuzzy type matching for store-frontend too
    const typeLower = type.toLowerCase().replace(/\s+/g, '');
    const typeMap: Record<string, string> = {
        'hero': 'hero', 'banner': 'hero', 'announcement': 'announcement', 'navbar': 'navbar', 'footer': 'footer',
        'richtext': 'richtext', 'text': 'richtext', 'content': 'richtext', 'imagegallery': 'image-gallery', 'gallery': 'image-gallery',
        'video': 'video', 'cta': 'cta', 'featuredproducts': 'featured-products', 'categorygrid': 'category-grid',
        'testimonials': 'testimonials', 'faq': 'faq', 'badges': 'badges', 'shippinginfo': 'shipping-info',
        'productpicker': 'product-picker', 'categorycarousel': 'category-carousel', 'promotionbanner': 'promotion-banner',
        'contactform': 'contact-form', 'newsletter': 'newsletter'
    };
    const mappedType = typeMap[typeLower] || typeLower;
    return { id, type: mappedType, data };
}

function parseBlocks(raw: any): any[] {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw);
        } catch {
            return [];
        }
    }
    return [];
}

export default function HomePage() {
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchBlocks() {
            try {
                // First try to get the designated homepage
                const r = await api.get('/pages/homepage');
                if (!cancelled && r.data?.blocks) {
                    const b = parseBlocks(r.data.blocks);
                    setBlocks(b.map(normalizeBlock).filter(Boolean));
                    return;
                }
            } catch {
                // Homepage endpoint failed, continue to fallback
            }

            // Fallback to old content system
            try {
                if (!cancelled) {
                    const res = await api.get('/content');
                    if (!cancelled) {
                        const b = res.data?.['page-blocks'] || [];
                        setBlocks(b.map(normalizeBlock).filter(Boolean));
                    }
                }
            } catch {
                // Both endpoints failed, blocks stays empty
            }
        }

        fetchBlocks().finally(() => {
            if (!cancelled) setLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <section style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
                <div className="loading-spinner" style={{ margin: '0 auto' }} />
            </section>
        );
    }

    return (
        <>
            {blocks.map((block: any) => {
                const Renderer = getBlockRenderer(block.type);
                if (!Renderer) {
                    console.warn(`No renderer for block type: ${block.type}`);
                    return null;
                }
                return <Renderer key={block.id} data={block.data} />;
            })}
        </>
    );
}
