'use client';
import {
    Type, Image, Play, MousePointerClick, Star, HelpCircle,
    Shield, Truck, Package, Grid3X3, LayoutGrid, Megaphone,
    Sparkles, Palette, SlidersHorizontal, Quote, Layers,
    ShoppingBag, Mail, MessageSquare, Tag, Rows3,
} from 'lucide-react';

/* ───────── Block Definition Types ───────── */
export interface BlockField {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'color' | 'number' | 'select' | 'checkbox';
    options?: string[];
    placeholder?: string;
}

export interface BlockDef {
    type: string;
    label: string;
    icon: React.ReactNode;
    category: 'layout' | 'content' | 'commerce' | 'trust' | 'slides' | 'forms';
    defaultData: Record<string, any>;
    fields: BlockField[];
    preview: (data: any) => string;
}

export const BLOCK_CATEGORIES = [
    { key: 'layout', label: 'Layout', color: '#6c63ff' },
    { key: 'content', label: 'Content', color: '#22c55e' },
    { key: 'commerce', label: 'Commerce', color: '#f59e0b' },
    { key: 'trust', label: 'Trust', color: '#ef4444' },
    { key: 'slides', label: 'Slides', color: '#8b5cf6' },
    { key: 'forms', label: 'Forms', color: '#0ea5e9' },
] as const;

/* ───────── Block Definitions ───────── */
export const BLOCK_DEFS: BlockDef[] = [
    /* ── Layout ── */
    {
        type: 'hero', label: 'Hero Banner', icon: <Sparkles size={18} />, category: 'layout',
        defaultData: {
            subtitle: '✦ Premium Products', title: 'Explore the', titleHighlight: 'Inner Cosmos',
            description: 'Curated premium products delivered to your door.',
            ctaText: 'Shop Now', ctaLink: '/products',
            cta2Text: 'Create Account', cta2Link: '/register',
            bgImages: [], slideInterval: 5000,
            overlayColor: 'rgba(26,26,46,0.85)', textColor: '#ffffff', padding: '6rem',
        },
        preview: (d) => `${d.title || ''} ${d.titleHighlight || ''}`.trim() || 'Hero Banner',
        fields: [
            { key: 'subtitle', label: 'Subtitle', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'titleHighlight', label: 'Highlight Text', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'ctaText', label: 'CTA Text', type: 'text' },
            { key: 'ctaLink', label: 'CTA Link', type: 'text' },
            { key: 'overlayColor', label: 'Overlay Color', type: 'color' },
            { key: 'textColor', label: 'Text Color', type: 'color' },
            { key: 'padding', label: 'Padding', type: 'text', placeholder: '6rem' },
        ],
    },
    {
        type: 'announcement', label: 'Announcement Bar', icon: <Megaphone size={18} />, category: 'layout',
        defaultData: {
            enabled: true, text: 'Free shipping on orders over $100!',
            bgColor: '#6c63ff', textColor: '#ffffff', link: '/products',
        },
        preview: (d) => d.text || 'Announcement...',
        fields: [
            { key: 'text', label: 'Text', type: 'text' },
            { key: 'link', label: 'Link', type: 'text' },
            { key: 'bgColor', label: 'Background', type: 'color' },
            { key: 'textColor', label: 'Text Color', type: 'color' },
        ],
    },
    {
        type: 'navbar', label: 'Navbar Config', icon: <SlidersHorizontal size={18} />, category: 'layout',
        defaultData: {
            storeName: 'Inner Cosmos', logoUrl: '', bgColor: '#1a1a2e', linkColor: 'rgba(255,255,255,0.8)',
        },
        preview: (d) => `Store: ${d.storeName || ''}`,
        fields: [
            { key: 'storeName', label: 'Store Name', type: 'text' },
            { key: 'logoUrl', label: 'Logo URL', type: 'text' },
            { key: 'bgColor', label: 'Background', type: 'color' },
            { key: 'linkColor', label: 'Link Color', type: 'color' },
        ],
    },
    {
        type: 'footer', label: 'Footer Config', icon: <Layers size={18} />, category: 'layout',
        defaultData: {
            text: `© ${new Date().getFullYear()} Inner Cosmos. All rights reserved.`,
            bgColor: '#111827', textColor: '#9ca3af', links: [],
        },
        preview: (d) => d.text || 'Footer...',
        fields: [
            { key: 'text', label: 'Footer Text', type: 'text' },
            { key: 'bgColor', label: 'Background', type: 'color' },
            { key: 'textColor', label: 'Text Color', type: 'color' },
        ],
    },

    /* ── Content ── */
    {
        type: 'richtext', label: 'Rich Text', icon: <Type size={18} />, category: 'content',
        defaultData: {
            heading: 'Section Heading',
            body: 'Write your content here. Supports **bold**, *italic*, and line breaks.',
            bgColor: '#ffffff', textColor: '#1a1a2e', alignment: 'left', padding: '3rem',
        },
        preview: (d) => d.heading || 'Rich text block',
        fields: [
            { key: 'heading', label: 'Heading', type: 'text' },
            { key: 'body', label: 'Body', type: 'textarea' },
            { key: 'alignment', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'] },
            { key: 'bgColor', label: 'Background', type: 'color' },
            { key: 'textColor', label: 'Text Color', type: 'color' },
            { key: 'padding', label: 'Padding', type: 'text', placeholder: '3rem' },
        ],
    },
    {
        type: 'image-gallery', label: 'Image Gallery', icon: <Image size={18} />, category: 'content',
        defaultData: {
            title: 'Our Gallery', images: [], columns: 3, gap: '1rem', bgColor: '#ffffff', padding: '3rem',
        },
        preview: (d) => `${(d.images || []).length} images`,
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'columns', label: 'Columns', type: 'number' },
            { key: 'bgColor', label: 'Background', type: 'color' },
        ],
    },
    {
        type: 'video', label: 'Video Embed', icon: <Play size={18} />, category: 'content',
        defaultData: {
            title: '', url: '', aspectRatio: '16/9', bgColor: '#000000', padding: '3rem',
        },
        preview: (d) => d.url ? 'Video embed' : 'No video URL',
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'url', label: 'Video URL', type: 'text', placeholder: 'https://youtube.com/embed/...' },
            { key: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['16/9', '4/3', '1/1'] },
            { key: 'bgColor', label: 'Background', type: 'color' },
        ],
    },
    {
        type: 'cta', label: 'CTA Section', icon: <MousePointerClick size={18} />, category: 'content',
        defaultData: {
            heading: 'Ready to Get Started?', subheading: 'Join thousands of happy customers today.',
            buttonText: 'Get Started', buttonLink: '/register',
            bgColor: '#6c63ff', textColor: '#ffffff', buttonBgColor: '#ffffff', buttonTextColor: '#6c63ff',
            padding: '4rem',
        },
        preview: (d) => d.heading || 'Call to action',
        fields: [
            { key: 'heading', label: 'Heading', type: 'text' },
            { key: 'subheading', label: 'Subheading', type: 'text' },
            { key: 'buttonText', label: 'Button Text', type: 'text' },
            { key: 'buttonLink', label: 'Button Link', type: 'text' },
            { key: 'bgColor', label: 'BG Color', type: 'color' },
            { key: 'textColor', label: 'Text Color', type: 'color' },
            { key: 'buttonBgColor', label: 'Button BG', type: 'color' },
            { key: 'buttonTextColor', label: 'Button Text', type: 'color' },
        ],
    },

    /* ── Commerce ── */
    {
        type: 'featured-products', label: 'Featured Products', icon: <Package size={18} />, category: 'commerce',
        defaultData: { title: 'Featured Products', count: 6, visible: true, bgColor: '#ffffff', padding: '3rem', showStockBadge: true },
        preview: (d) => `${d.count || 6} products`,
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'count', label: 'Product Count', type: 'number' },
            { key: 'bgColor', label: 'Background', type: 'color' },
        ],
    },
    {
        type: 'product-picker', label: 'Product Showcase', icon: <ShoppingBag size={18} />, category: 'commerce',
        defaultData: {
            title: 'Hand-Picked Favourites', productIds: [],
            bgColor: '#ffffff', padding: '3rem', showStockBadge: true, columns: 3,
        },
        preview: (d) => d.title || 'Product Showcase',
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'columns', label: 'Columns', type: 'number' },
            { key: 'bgColor', label: 'Background', type: 'color' },
        ],
    },
    {
        type: 'category-grid', label: 'Category Grid', icon: <Grid3X3 size={18} />, category: 'commerce',
        defaultData: { title: 'Shop by Category', columns: 3, bgColor: '#f9f9fb', padding: '3rem' },
        preview: (d) => `${d.columns || 3} columns`,
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'columns', label: 'Columns', type: 'number' },
            { key: 'bgColor', label: 'Background', type: 'color' },
        ],
    },
    {
        type: 'category-carousel', label: 'Category Carousel', icon: <Rows3 size={18} />, category: 'commerce',
        defaultData: { title: 'Browse Categories', bgColor: '#ffffff', padding: '2.5rem', pillBg: '#f3f4f6', pillColor: '#1a1a2e' },
        preview: (d) => d.title || 'Category Carousel',
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'bgColor', label: 'Background', type: 'color' },
            { key: 'pillBg', label: 'Pill Background', type: 'color' },
            { key: 'pillColor', label: 'Pill Text', type: 'color' },
        ],
    },
    {
        type: 'promotion-banner', label: 'Promotion Banner', icon: <Tag size={18} />, category: 'commerce',
        defaultData: {
            title: '🔥 Flash Sale', subtitle: 'Ends in:',
            endsAt: new Date(Date.now() + 86400000 * 3).toISOString(),
            ctaText: 'Grab the Deal', ctaLink: '/products',
            bgColor: '#1a1a2e', textColor: '#ffffff', accentColor: '#f59e0b', padding: '3rem',
        },
        preview: (d) => d.title || 'Promotion Banner',
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'subtitle', label: 'Subtitle', type: 'text' },
            { key: 'ctaText', label: 'CTA Text', type: 'text' },
            { key: 'ctaLink', label: 'CTA Link', type: 'text' },
            { key: 'endsAt', label: 'Ends At (ISO date)', type: 'text', placeholder: new Date(Date.now() + 86400000 * 3).toISOString() },
            { key: 'bgColor', label: 'Background', type: 'color' },
            { key: 'textColor', label: 'Text Color', type: 'color' },
            { key: 'accentColor', label: 'Accent Color', type: 'color' },
        ],
    },
    {
        type: 'recently-viewed', label: 'Recently Viewed', icon: <LayoutGrid size={18} />, category: 'commerce',
        defaultData: { title: 'Recently Viewed', count: 4, bgColor: '#ffffff', padding: '3rem' },
        preview: (d) => `${d.count || 4} items`,
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'count', label: 'Count', type: 'number' },
            { key: 'bgColor', label: 'Background', type: 'color' },
        ],
    },

    /* ── Trust ── */
    {
        type: 'testimonials', label: 'Testimonials', icon: <Quote size={18} />, category: 'trust',
        defaultData: {
            title: 'What Our Customers Say', bgColor: '#f9f9fb', padding: '3rem',
            items: [
                { id: '1', name: 'John Doe', role: 'Customer', text: 'Amazing products and fast delivery!', rating: 5 },
            ],
        },
        preview: (d) => `${(d.items || []).length} testimonials`,
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'bgColor', label: 'Background', type: 'color' },
        ],
    },
    {
        type: 'faq', label: 'FAQ Accordion', icon: <HelpCircle size={18} />, category: 'trust',
        defaultData: {
            title: 'Frequently Asked Questions', bgColor: '#ffffff', padding: '3rem',
            items: [
                { id: '1', question: 'How long does shipping take?', answer: 'Orders are typically delivered within 3-5 business days.' },
            ],
        },
        preview: (d) => `${(d.items || []).length} questions`,
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'bgColor', label: 'Background', type: 'color' },
        ],
    },
    {
        type: 'badges', label: 'Trust Badges', icon: <Shield size={18} />, category: 'trust',
        defaultData: {
            title: '', bgColor: '#ffffff', padding: '2rem',
            items: [
                { id: '1', icon: '🔒', label: 'Secure Checkout' },
                { id: '2', icon: '📦', label: 'Free Shipping' },
                { id: '3', icon: '↩️', label: '30-Day Returns' },
                { id: '4', icon: '⭐', label: '5-Star Rated' },
            ],
        },
        preview: (d) => `${(d.items || []).length} badges`,
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'bgColor', label: 'Background', type: 'color' },
        ],
    },
    {
        type: 'shipping-info', label: 'Shipping Info', icon: <Truck size={18} />, category: 'trust',
        defaultData: {
            title: 'Shipping & Returns', bgColor: '#f9f9fb', textColor: '#1a1a2e', padding: '3rem',
            sections: [
                { heading: 'Delivery', text: 'Free standard shipping on orders over $100. Express shipping available.' },
                { heading: 'Returns', text: '30-day hassle-free returns on all items.' },
            ],
        },
        preview: (d) => `${(d.sections || []).length} sections`,
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'bgColor', label: 'Background', type: 'color' },
            { key: 'textColor', label: 'Text Color', type: 'color' },
        ],
    },

    /* ── Slides ── */
    {
        type: 'banner-slides', label: 'Banner Carousel', icon: <Palette size={18} />, category: 'slides',
        defaultData: {
            slides: [{ id: '1', imageUrl: '', title: 'Slide Title', subtitle: 'Subtitle text', link: '' }],
        },
        preview: (d) => `${(d.slides || []).length} slides`,
        fields: [],
    },
    {
        type: 'feature-cards', label: 'Feature Cards', icon: <Star size={18} />, category: 'slides',
        defaultData: {
            sectionTitle: 'Why Choose Us', bgColor: '#ffffff',
            items: [
                { id: '1', icon: '⚡', title: 'Fast Shipping', description: 'Same-day dispatch on all orders placed before 3pm' },
                { id: '2', icon: '🛡️', title: 'Secure Payments', description: 'Stripe-powered checkout with full encryption' },
                { id: '3', icon: '📦', title: 'Quality Products', description: 'Every item curated for exceptional quality' },
            ],
        },
        preview: (d) => `${(d.items || []).length} cards`,
        fields: [
            { key: 'sectionTitle', label: 'Section Title', type: 'text' },
            { key: 'bgColor', label: 'Background', type: 'color' },
        ],
    },

    /* ── Forms ── */
    {
        type: 'contact-form', label: 'Contact Form', icon: <MessageSquare size={18} />, category: 'forms',
        defaultData: {
            title: 'Get in Touch',
            subtitle: "We'd love to hear from you. Fill out the form and we'll get back to you shortly.",
            fields: ['name', 'email', 'phone', 'message'],
            submitText: 'Send Message',
            bgColor: '#f9f9fb', textColor: '#1a1a2e', accentColor: '#6c63ff', padding: '4rem',
            successMessage: "Thank you! We'll be in touch soon.",
        },
        preview: (d) => d.title || 'Contact Form',
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
            { key: 'submitText', label: 'Submit Button Text', type: 'text' },
            { key: 'bgColor', label: 'Background', type: 'color' },
            { key: 'textColor', label: 'Text Color', type: 'color' },
            { key: 'accentColor', label: 'Accent Color', type: 'color' },
        ],
    },
    {
        type: 'newsletter', label: 'Newsletter Signup', icon: <Mail size={18} />, category: 'forms',
        defaultData: {
            title: 'Stay in the Loop',
            subtitle: 'Subscribe for exclusive deals, new arrivals, and insider tips.',
            placeholder: 'Enter your email address',
            submitText: 'Subscribe',
            bgColor: '#6c63ff', textColor: '#ffffff', padding: '4rem',
            successMessage: "🎉 You're subscribed! Check your inbox.",
        },
        preview: (d) => d.title || 'Newsletter Signup',
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
            { key: 'placeholder', label: 'Input Placeholder', type: 'text' },
            { key: 'submitText', label: 'Submit Button Text', type: 'text' },
            { key: 'bgColor', label: 'Background', type: 'color' },
            { key: 'textColor', label: 'Text Color', type: 'color' },
        ],
    },
];

export function getBlockDef(type: string): BlockDef | undefined {
    if (!type) return undefined;
    const item = BLOCK_DEFS.find(b => b.type === type);
    if (item) return item;
    
    // Fuzzy match by type or label (case insensitive, slugified)
    const typeLower = type.toLowerCase().replace(/\s+/g, '');
    return BLOCK_DEFS.find(b => 
        b.type.toLowerCase() === typeLower || 
        b.label.toLowerCase() === type.toLowerCase() ||
        b.type === typeLower
    );
}

/** Robustly converts raw data from DB into a valid BuilderBlock */
export function normalizeBlock(raw: any): any {
    if (!raw || typeof raw !== 'object') return { id: genId(), type: 'richtext', data: {} };

    // 1. Identify type
    let type: string = raw.type || raw.section || raw.blockType || '';
    const def = getBlockDef(type);
    if (def) type = def.type;

    // 2. Identify ID
    const id: string = raw.id || genId();
    
    // 3. Identify Data
    let data: Record<string, any> = raw.data || raw.content || raw.settings || {};
    
    // If we have a flat structure (legacy), collect non-system keys into data
    if (Object.keys(data).length === 0) {
        const systemKeys = ['id', 'type', 'section', 'blockType', 'createdAt', 'updatedAt'];
        const legacyData: Record<string, any> = {};
        for (const key in raw) {
            if (!systemKeys.includes(key)) legacyData[key] = raw[key];
        }
        if (Object.keys(legacyData).length > 0) data = legacyData;
    }
    
    // 4. Merge with defaults
    if (def) {
        data = { ...JSON.parse(JSON.stringify(def.defaultData)), ...data };
    }

    return { id, type, data };
}

export function genId(): string {
    return Math.random().toString(36).slice(2, 10);
}
