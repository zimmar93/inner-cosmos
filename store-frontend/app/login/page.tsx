'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handle = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', form);
            Cookies.set('access_token', res.data.accessToken, { expires: 7 });
            toast.success('Welcome back!');
            router.push('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: 420, padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <LogIn size={40} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h1>
                    <p style={{ color: 'var(--muted)' }}>Sign in to continue shopping</p>
                </div>
                <form onSubmit={handle}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="you@example.com" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="Your password" value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--muted)' }}>
                    Don't have an account?{' '}
                    <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register</Link>
                </p>
            </div>
        </div>
    );
}
