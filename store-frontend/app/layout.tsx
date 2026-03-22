import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import ClientLayout from '@/components/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
    title: 'Inner Cosmos Store',
    description: 'Premium products from Inner Cosmos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <ClientLayout>{children}</ClientLayout>
                <Toaster position="top-right" />
            </body>
        </html>
    );
}
