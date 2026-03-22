'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);

    const handle = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { ...form, role: 'CUSTOMER' });
            Cookies.set('access_token', res.data.accessToken, { expires: 7 });
            toast.success('Account created! Welcome to Inner Cosmos!');
            router.push('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: 460, padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <UserPlus size={40} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Account</h1>
                    <p style={{ color: 'var(--muted)' }}>Join Inner Cosmos today</p>
                </div>
                <form onSubmit={handle}>
                    <div className="form-group">
                        <label>Email *</label>
                        <input type="email" placeholder="you@example.com" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Password *</label>
                        <input type="password" placeholder="Minimum 8 characters" value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input type="tel" placeholder="+1 555 000 0000" value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <textarea placeholder="Your shipping address" value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--muted)' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
