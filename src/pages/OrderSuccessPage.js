import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export default function OrderSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const sessionId = params.get('session_id');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Order Confirmed - Faith Heroes';
    clearCart();

    if (!sessionId) return;
    fetch(`${API_URL}/payments/verify-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then(response => response.ok ? response.json() : null)
      .then(data => setOrder(data?.data || data?.order || null))
      .catch(() => setOrder(null));
  }, [sessionId, clearCart]);

  const fallbackNumber = sessionId ? `FC-${new Date().getFullYear()}-${sessionId.slice(-4).toUpperCase()}` : `FC-${new Date().getFullYear()}-0001`;
  const orderNumber = order?.order_number || fallbackNumber;
  const email = order?.shipping_email || order?.customer_email || 'your email address';

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0505] px-4 py-24 text-[#FDF5F0]">
      <motion.section initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-lg rounded-2xl border border-[#8B1A1A]/30 bg-[#180C0C] p-10 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.6, delay: 0.2 }} className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-green-500/30 bg-green-500/10">
          <CheckCircle size={42} className="text-green-400" />
        </motion.div>

        <h1 className="mt-6 font-display text-3xl font-bold text-[#FDF5F0]">Order Confirmed</h1>
        <p className="mt-3 text-sm text-[#FDF5F0]/60">Thank you for your order. We will begin crafting your Faith Heroes box right away.</p>

        <div className="mt-6 rounded-xl border border-[#8B1A1A]/20 bg-[#0A0505] p-5 text-left">
          <Detail label="Order number" value={orderNumber} mono />
          <Detail label="Character" value={order?.character_name || order?.product_name || 'Faith Heroes Gift Box'} />
          <Detail label="Amount" value={order?.total_amount ? `£${Number(order.total_amount).toFixed(2)}` : 'Confirmed'} />
          <Detail label="Email" value={email} />
          <Detail label="Est delivery" value={order?.estimated_delivery || '5-7 working days'} />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/[0.08] p-4 text-left">
          <Mail size={16} className="mt-0.5 flex-shrink-0 text-[#C9A84C]" />
          <p className="text-xs leading-relaxed text-[#FDF5F0]/60">A confirmation email has been sent to {email} with your order details and tracking information.</p>
        </div>

        <div className="mt-8 space-y-3">
          <button onClick={() => navigate(`/track-order?order=${orderNumber}`)} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8B1A1A] py-3.5 text-sm font-medium text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">
            <Truck size={16} /> Track My Order
          </button>
          <button onClick={() => navigate('/shop')} className="w-full rounded-full border border-[#8B1A1A]/40 py-3.5 text-sm text-[#FDF5F0]/70 transition hover:border-[#C9A84C]/40 hover:text-[#C9A84C]">
            Continue Shopping
          </button>
          <button onClick={() => navigate('/share-kindness')} className="pt-2 text-xs text-[#C9A84C] underline-offset-4 hover:underline">
            Inspired by your box? Share it with the community -&gt;
          </button>
        </div>

        <div className="mt-8 border-t border-[#8B1A1A]/20 pt-6 text-center text-xs italic text-[#FDF5F0]/25">
          <p>Every good and perfect gift is from above</p>
          <p className="mt-1">- James 1:17</p>
        </div>
      </motion.section>
    </main>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div className="flex justify-between border-b border-[#8B1A1A]/10 py-2 text-sm last:border-0">
      <span className="text-[#FDF5F0]/50">{label}</span>
      <span className={`${mono ? 'font-mono font-bold text-[#C9A84C]' : 'text-[#FDF5F0]'}`}>{value}</span>
    </div>
  );
}
