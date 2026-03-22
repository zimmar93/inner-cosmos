'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    useEffect(() => {
        if (!Cookies.get('erp_token')) router.push('/login');
    }, []);

    return (
        <div className="erp-layout">
            <Sidebar />
            <div className="erp-main">
                {children}
            </div>
        </div>
    );
}
