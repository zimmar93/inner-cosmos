'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';

interface CmsData {
    hero?: any;
    announcement?: any;
    slides?: any[];
    features?: any;
    navbar?: any;
    footer?: any;
    productsSection?: any;
    theme?: any;
    seo?: any;
    'page-blocks'?: any[];
}

const CmsContext = createContext<CmsData>({});

export function CmsProvider({ children }: { children: ReactNode }) {
    const [cms, setCms] = useState<CmsData>({});

    useEffect(() => {
        api.get('/content').then((r) => setCms(r.data || {})).catch(() => { });
    }, []);

    // Apply theme CSS variables dynamically
    useEffect(() => {
        const t = cms.theme;
        if (!t) return;
        const root = document.documentElement;
        if (t.primaryColor) root.style.setProperty('--primary', t.primaryColor);
        if (t.accentColor) root.style.setProperty('--accent', t.accentColor);
        if (t.bgColor) root.style.setProperty('--bg', t.bgColor);
        if (t.borderRadius !== undefined) root.style.setProperty('--radius', `${t.borderRadius}px`);
        if (t.fontFamily) {
            root.style.setProperty('--font', t.fontFamily);
            document.body.style.fontFamily = `'${t.fontFamily}', sans-serif`;
            // Load Google Font dynamically
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${t.fontFamily.replace(/ /g, '+')}:wght@400;500;600;700;800;900&display=swap`;
            document.head.appendChild(link);
        }
    }, [cms.theme]);

    return <CmsContext.Provider value={cms}>{children}</CmsContext.Provider>;
}

export function useCms() {
    return useContext(CmsContext);
}
