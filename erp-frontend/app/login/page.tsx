'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { Package } from 'lucide-react';

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
            Cookies.set('erp_token', accessToken, { expires: 7 });
            Cookies.set('erp_user', JSON.stringify({ id: user.id, email: user.email, role: user.role }), { expires: 7 });
            toast.success('Welcome to ERP Dashboard!');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a1a2e,#16213e)', padding: '2rem' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'linear-gradient(135deg,#6c63ff,#4a42d4)', width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <Package size={30} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900 }}>ERP Dashboard</h1>
                    <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Inner Cosmos Administration</p>
                </div>
                <form onSubmit={handle}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" placeholder="admin@example.com" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="Your password" value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
