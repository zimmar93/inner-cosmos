'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
            const { user, accessToken } = res.data;
            if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
                toast.error('Access denied. Admin or Staff role required.');
                return;
            }
            Cookies.set('erp_token', accessToken, { expires: 7, secure: true, sameSite: 'strict' });
            Cookies.set('erp_user', JSON.stringify({ id: user.id, email: user.email, role: user.role }), { expires: 7, secure: true, sameSite: 'strict' });
            toast.success('Welcome to ERP Dashboard!');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: '#0f0e1a',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background orbs */}
            <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', top: -200, left: -200, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)', bottom: -100, right: -100, pointerEvents: 'none' }} />

            {/* Left panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', position: 'relative' }}>
                <div style={{ maxWidth: 400 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="3.5" fill="white" />
                                <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.2" fill="none" opacity="0.5" />
                                <circle cx="10" cy="10" r="5.5" stroke="white" strokeWidth="0.7" fill="none" opacity="0.3" />
                            </svg>
                        </div>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>Inner Cosmos</span>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#a78bfa', marginBottom: '0.6rem' }}>ERP Dashboard</div>
                        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', fontWeight: 700, color: 'white', letterSpacing: '-0.03em', marginBottom: '0.5rem', lineHeight: 1.15 }}>
                            Sign in to your<br />workspace
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.92rem' }}>Admin and staff access only</p>
                    </div>

                    <form onSubmit={handle}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                placeholder="admin@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                autoComplete="email"
                                style={{
                                    width: '100%', padding: '0.85rem 1rem',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1.5px solid rgba(255,255,255,0.1)',
                                    borderRadius: 10, color: 'white', fontSize: '0.92rem',
                                    outline: 'none', transition: 'border-color 0.18s',
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                                onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.5)')}
                                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                            />
                        </div>
                        <div style={{ marginBottom: '1.75rem' }}>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Your password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                autoComplete="current-password"
                                style={{
                                    width: '100%', padding: '0.85rem 1rem',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1.5px solid rgba(255,255,255,0.1)',
                                    borderRadius: 10, color: 'white', fontSize: '0.92rem',
                                    outline: 'none', transition: 'border-color 0.18s',
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                                onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.5)')}
                                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '0.9rem',
                                background: loading ? 'rgba(124,58,237,0.5)' : '#7c3aed',
                                color: 'white', border: 'none', borderRadius: 10,
                                fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                                fontFamily: 'DM Sans, sans-serif', transition: 'all 0.18s',
                                boxShadow: loading ? 'none' : '0 4px 16px rgba(124,58,237,0.4)',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6d28d9'; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#7c3aed'; }}
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right decorative panel */}
            <div style={{ width: 420, background: 'rgba(124,58,237,0.06)', borderLeft: '1px solid rgba(124,58,237,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', position: 'relative' }}>
                {[
                    { label: 'Total Revenue', value: '$124,580', trend: '+12%' },
                    { label: 'Orders Today', value: '47', trend: '+8%' },
                    { label: 'Active Products', value: '213', trend: '+3%' },
                    { label: 'Open Leads', value: '38', trend: '+22%' },
                ].map((stat, i) => (
                    <div key={i} style={{ marginBottom: '1.25rem', padding: '1.1rem 1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.4rem' }}>{stat.label}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: 'white', letterSpacing: '-0.04em' }}>{stat.value}</span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#86efac' }}>{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
