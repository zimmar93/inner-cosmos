'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function WebsiteBuilderPage() {
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // Find the homepage and redirect to its editor, or redirect to pages list
        api.get('/pages/homepage').then(r => {
            if (r.data?.id) {
                router.replace(`/dashboard/website-builder/pages/${r.data.id}`);
            } else {
                // No homepage exists yet — create one from legacy content
                api.get('/content').then(async contentRes => {
                    const content = contentRes.data || {};
                    const blocks = content['page-blocks'] || [];
                    try {
                        const page = await api.post('/pages', {
                            title: 'Home',
                            slug: 'home',
                            blocks,
                            status: 'published',
                            isHomepage: true,
                        });
                        router.replace(`/dashboard/website-builder/pages/${page.data.id}`);
                    } catch {
                        router.replace('/dashboard/website-builder/pages');
                    }
                }).catch(() => {
                    router.replace('/dashboard/website-builder/pages');
                });
            }
        }).catch(() => {
            router.replace('/dashboard/website-builder/pages');
        }).finally(() => setChecked(true));
    }, [router]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="loading-spinner" />
        </div>
    );
}
