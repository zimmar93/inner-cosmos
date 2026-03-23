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
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            borderRadius: '10px',
                            background: '#1a1827',
                            color: '#eceaf5',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            border: '1px solid #3d3470',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        },
                        success: {
                            iconTheme: { primary: '#a78bfa', secondary: '#1a1827' },
                        },
                        error: {
                            iconTheme: { primary: '#f87171', secondary: '#1a1827' },
                        },
                    }}
                />
            </body>
        </html>
    );
}
