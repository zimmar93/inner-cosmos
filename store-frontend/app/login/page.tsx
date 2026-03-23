'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handle = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', form);
            Cookies.set('access_token', res.data.accessToken, { expires: 7, secure: true, sameSite: 'strict' });
            toast.success('Welcome back!');
            router.push('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                {/* Brand mark */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="4" fill="white" />
                            <circle cx="12" cy="12" r="9.5" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
                            <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="0.8" fill="none" opacity="0.3" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '1.7rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>Welcome back</h1>
                    <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>Sign in to your Inner Cosmos account</p>
                </div>

                <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow)' }}>
                    <form onSubmit={handle}>
                        <div className="float-group">
                            <input
                                type="email"
                                placeholder=" "
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                autoComplete="email"
                            />
                            <label>Email address</label>
                        </div>
                        <div className="float-group">
                            <input
                                type="password"
                                placeholder=" "
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                autoComplete="current-password"
                            />
                            <label>Password</label>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    New to Inner Cosmos?{' '}
                    <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Create an account</Link>
                </p>
            </div>
        </div>
    );
}
