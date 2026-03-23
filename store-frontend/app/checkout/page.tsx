'use client';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/store/cart';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ orderId, onSuccess }: { orderId: string; onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setProcessing(true);
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: `${window.location.origin}/orders` },
            redirect: 'if_required',
        });
        if (error) {
            toast.error(error.message || 'Payment failed');
        } else {
            toast.success('Payment successful! Order confirmed.');
            onSuccess();
        }
        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button type="submit" className="btn btn-primary" disabled={!stripe || processing} style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }}>
                {processing ? 'Processing…' : 'Pay now'}
            </button>
        </form>
    );
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, total, clearCart } = useCart();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'COD'>('STRIPE');
    const [loading, setLoading] = useState(false);
    const submittingRef = useRef(false);

    useEffect(() => {
        if (!Cookies.get('access_token')) { router.push('/login'); return; }
        if (items.length === 0) router.push('/products');
    }, []);

    const placeOrder = async () => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setLoading(true);
        try {
            const orderRes = await api.post('/orders', {
                items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
                paymentMethod,
            });
            const order = orderRes.data;
            setOrderId(order.id);

            if (paymentMethod === 'COD') {
                toast.success('Order placed! You will pay on delivery.');
                clearCart();
                router.push('/orders');
                return;
            }

            const intentRes = await api.post(`/payments/intent/${order.id}`);
            setClientSecret(intentRes.data.clientSecret);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to place order');
            submittingRef.current = false;
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) return null;

    return (
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '2rem' }}>Checkout</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
                <div>
                    {!clientSecret ? (
                        <div className="card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.05rem' }}>Payment method</h2>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                {(['STRIPE', 'COD'] as const).map((m) => (
                                    <label key={m} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.1rem', cursor: 'pointer', border: '1.5px solid', borderColor: paymentMethod === m ? 'var(--primary)' : 'var(--border)', borderRadius: 10, background: paymentMethod === m ? 'var(--primary-50)' : 'transparent', transition: 'all 0.15s' }}>
                                        <input type="radio" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} style={{ width: 'auto', accentColor: 'var(--primary)' }} />
                                        <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{m === 'STRIPE' ? '💳 Card payment' : '💵 Cash on delivery'}</span>
                                    </label>
                                ))}
                            </div>
                            <button className="btn btn-primary" onClick={placeOrder} disabled={loading} style={{ width: '100%', padding: '0.85rem' }}>
                                {loading ? 'Placing order…' : paymentMethod === 'COD' ? 'Place order' : 'Continue to payment'}
                            </button>
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.05rem' }}>Payment details</h2>
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <CheckoutForm orderId={orderId!} onSuccess={() => { clearCart(); router.push('/orders'); }} />
                            </Elements>
                        </div>
                    )}
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1.05rem' }}>Order summary</h2>
                    {items.map((item) => (
                        <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.88rem' }}>
                            <span style={{ color: 'var(--muted)' }}>{item.name} ×{item.quantity}</span>
                            <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--primary)' }}>${total().toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
