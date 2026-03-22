'use client';
import { CmsProvider } from '@/lib/cms';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <CmsProvider>
            <Navbar />
            <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>{children}</main>
            <Footer />
        </CmsProvider>
    );
}
