import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useCart } from '../context/CartContext';
import { assetUrl } from '../lib/assets';
import { useAuth } from '../context/AuthContext';
import { stripePromise } from '../lib/stripe';
import { paymentAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: user?.email || '', address: '', city: '', postcode: '', country: 'GB' });
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    navigate('/shop');
    return null;
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleStripe(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await paymentAPI.createStripeSession({
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity, customisation: i.customisation })),
        customer_email: form.email,
        shipping_address: { name: form.name, address: form.address, city: form.city, postcode: form.postcode, country: form.country },
      });
      const stripe = await stripePromise;
      if (data?.url) window.location.href = data.url;
      else if (data?.sessionId) await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch {
      toast.error('Payment failed. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-gold text-sm mb-8">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <h1 className="font-display text-3xl font-bold text-cream mb-8">Checkout</h1>
            <form onSubmit={handleStripe} className="space-y-5">
              <h2 className="text-cream font-semibold">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
                <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <h2 className="text-cream font-semibold pt-2">Shipping Address</h2>
              <Input label="Street Address" name="address" value={form.address} onChange={handleChange} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" name="city" value={form.city} onChange={handleChange} required />
                <Input label="Postcode" name="postcode" value={form.postcode} onChange={handleChange} required />
              </div>
              <Button type="submit" variant="gold" size="xl" className="w-full mt-4" disabled={loading}>
                <CreditCard size={18} className="mr-2" />
                {loading ? 'Redirecting...' : `Pay with Stripe — £${subtotal.toFixed(2)}`}
              </Button>
              <div className="flex items-center justify-center gap-2 text-muted text-xs">
                <Shield size={12} /> Secured by Stripe. We never store your card details.
              </div>
            </form>
          </div>

          {/* Order summary */}
          <div>
            <h2 className="font-display text-xl text-cream font-semibold mb-5">Order Summary</h2>
            <div className="bg-card border border-gold/15 rounded-2xl p-5 space-y-4">
              {items.map(item => (
                <div key={item.product_id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg flex-shrink-0">
                    {item.image_url && <img src={assetUrl(item.image_url)} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-cream text-sm font-medium truncate">{item.character_name || item.name}</p>
                    <p className="text-muted text-xs">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-gold text-sm font-semibold">£{(item.unit_price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="border-t border-gold/10 pt-4 flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="text-gold font-display font-bold text-xl">£{subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted">Shipping calculated at next step</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
