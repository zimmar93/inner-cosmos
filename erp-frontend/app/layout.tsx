import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
    title: 'Inner Cosmos ERP',
    description: 'Internal ERP Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            borderRadius: '10px',
                            background: '#16132a',
                            color: '#eceaf5',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            border: '1px solid #3d3470',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                        },
                        success: {
                            iconTheme: { primary: '#a78bfa', secondary: '#16132a' },
                        },
                        error: {
                            iconTheme: { primary: '#f87171', secondary: '#16132a' },
                        },
                    }}
                />
            </body>
        </html>
    );
}
