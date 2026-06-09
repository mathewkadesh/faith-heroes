import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  Anchor,
  Calendar,
  Check,
  CheckCircle,
  ChevronRight,
  Clipboard,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  Flame,
  MessageSquare,
  Package,
  Printer,
  Search,
  Shirt,
  ShoppingCart,
  Sprout,
  Target,
  Truck,
  Zap,
  Loader2,
} from 'lucide-react';
import { characterAPI, orderAPI } from '../lib/api';
import { assetUrl } from '../lib/assets';
import { useAuth } from '../context/AuthContext';

const signatureItems = {
  noah: ['Rainbow Bookmark', 'A keepsake reminder of God keeping His promises.', Anchor],
  david: ['Five Smooth Stones Keychain', 'A tactile reminder that courage begins with faith.', Target],
  moses: ['Burning Bush Miniature', 'A miniature symbol of holy calling and obedience.', Flame],
  esther: ['Royal Sceptre Keychain', 'A royal reminder of courage for such a time as this.', Crown],
  joseph: ['Coat of Many Colours Bookmark', 'A bright marker of favour, faithfulness, and forgiveness.', Shirt],
  ruth: ['Golden Wheat Sheaf Keychain', 'A small harvest symbol of loyalty and provision.', Sprout],
  elijah: ['Glow-in-Dark Flame Keychain', 'A fire-lit reminder that God answers with power.', Zap],
};

const statusStyles = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  printing: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  shipped: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  delivered: 'bg-green-500/15 text-green-400 border-green-500/30',
  refunded: 'bg-[#FDF5F0]/10 text-[#FDF5F0]/50 border-[#FDF5F0]/20',
  cancelled: 'bg-[#E05555]/10 text-[#E05555] border-[#E05555]/30',
};

function WordsPullUp({ text }) {
  return (
    <span>
      {text.split(' ').map((word, index) => (
        <motion.span key={`${word}-${index}`} className="mr-[0.18em] inline-block" initial={{ opacity: 0, y: 44 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.78, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}>
          {word}
        </motion.span>
      ))}
    </span>
  );
}

function formatDate(value) {
  if (!value) return 'Pending';
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(value) {
  if (!value) return 'Pending';
  return new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function firstItem(order) {
  return order?.order_items?.[0] || {};
}

function characterFromOrder(order) {
  return firstItem(order)?.products?.characters || {};
}

function signatureFor(character) {
  const key = String(character?.name || '').toLowerCase();
  return signatureItems[key] || [`${character?.name || 'Hero'} Signature Collectible`, 'A unique collectible found only in this Faith Heroes box.', Crown];
}

function statusIndex(status) {
  if (status === 'pending') return 0;
  if (status === 'confirmed') return 1;
  if (status === 'printing') return 2;
  if (status === 'shipped') return 3;
  if (status === 'delivered') return 5;
  return 0;
}

export default function OrderTrackingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('order') || orderId || '');
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUserOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await orderAPI.getMyOrders();
      const list = response.data || [];
      setOrders(list);
      const requested = params.get('order') || orderId;
      const match = requested ? list.find(order => order.order_number === requested || order.id === requested) : null;
      setSelectedOrder(match || list[0] || null);
    } catch (err) {
      console.error('User orders failed:', err);
      setError('Could not load your orders.');
    } finally {
      setLoading(false);
    }
  }, [orderId, params, user]);

  const fetchOrder = useCallback(async function fetchOrder(number = orderNumber) {
    if (!number.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await orderAPI.track(number.trim());
      setSelectedOrder(response.data);
      setOrders([response.data]);
    } catch (err) {
      setSelectedOrder(null);
      setError('Order not found. Please check your order number or email address.');
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Track My Order - Faith Heroes';
    characterAPI.getAll().then(response => setCharacters(response.data || [])).catch(() => setCharacters([]));

    const requested = params.get('order') || orderId;
    if (requested && requested.startsWith('FC-')) {
      fetchOrder(requested);
    } else if (user) {
      loadUserOrders();
    }
  }, [orderId, params, user, loadUserOrders, fetchOrder]);

  async function fetchOrdersByEmail() {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await orderAPI.trackByEmail(email.trim());
      const list = response.data || [];
      setOrders(list);
      setSelectedOrder(list[0] || null);
      if (!list.length) setError('Order not found. Please check your order number or email address.');
    } catch {
      setError('Order not found. Please check your order number or email address.');
    } finally {
      setLoading(false);
    }
  }

  const selectedCharacter = characterFromOrder(selectedOrder);
  const otherCharacters = useMemo(() => {
    return characters.filter(character => character.id !== selectedCharacter?.id).slice(0, 12);
  }, [characters, selectedCharacter]);

  return (
    <main className="min-h-screen bg-[#0A0505] text-[#FDF5F0]">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#180C0C] to-[#0A0505] py-20">
        <div className="landing-grain absolute inset-0 opacity-[0.05]" />
        <Package className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 text-[#FDF5F0] opacity-[0.03]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="mb-6 flex items-center justify-center gap-2 text-xs text-[#FDF5F0]/40">
            <Link to="/" className="hover:text-[#C9A84C]">Home</Link>
            <ChevronRight size={12} />
            <span>Track My Order</span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#8B1A1A]/40 bg-[#8B1A1A]/20 px-4 py-1.5 text-[10px] uppercase tracking-widest text-[#E05555]">
            <Truck size={13} /> Order Tracking
          </span>
          <h1 className="mt-5 font-display text-5xl font-black leading-[0.88] tracking-[-0.03em] text-[#FDF5F0] sm:text-6xl md:text-7xl">
            <WordsPullUp text="Where Is My Box?" />
          </h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mx-auto mt-5 max-w-md text-sm text-[#FDF5F0]/60">
            Enter your order number to see real-time updates on your Faith Heroes gift box.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mx-auto mt-10 max-w-lg rounded-2xl border border-[#8B1A1A]/30 bg-[#180C0C] p-6 text-left">
            {user ? (
              <div className="flex items-center justify-center gap-2 text-xs text-[#FDF5F0]/50">
                <CheckCircle size={14} className="text-[#C9A84C]" />
                Showing orders for {user.email}
              </div>
            ) : (
              <>
                <label className="mb-2 block text-xs text-[#FDF5F0]/60">Order Number</label>
                <div className="flex gap-3">
                  <input value={orderNumber} onChange={event => setOrderNumber(event.target.value)} placeholder="FC-2025-0001" className="flex-1 rounded-xl border border-[#8B1A1A]/40 bg-[#0A0505] px-4 py-3.5 text-sm text-[#FDF5F0] placeholder:text-[#FDF5F0]/25 focus:border-[#C9A84C] focus:outline-none" />
                  <button onClick={() => fetchOrder()} disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#8B1A1A] px-6 py-3.5 text-sm font-medium text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Track
                  </button>
                </div>
                <div className="my-4 text-center text-xs text-[#FDF5F0]/30">- or -</div>
                <div className="flex gap-3">
                  <input value={email} onChange={event => setEmail(event.target.value)} type="email" placeholder="your@email.com" className="flex-1 rounded-xl border border-[#8B1A1A]/40 bg-[#0A0505] px-4 py-3.5 text-sm text-[#FDF5F0] placeholder:text-[#FDF5F0]/25 focus:border-[#C9A84C] focus:outline-none" />
                  <button onClick={fetchOrdersByEmail} className="rounded-xl border border-[#8B1A1A]/40 px-5 py-3.5 text-sm text-[#FDF5F0]/60 transition hover:border-[#C9A84C]">Find Orders</button>
                </div>
              </>
            )}
            {error && <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#E05555]/30 bg-[#2A1010] p-4 text-sm text-[#E05555]"><AlertCircle size={16} /> {error}</div>}
          </motion.div>
        </div>
      </section>

      {user && orders.length > 1 && (
        <div className="mx-auto max-w-5xl px-6 pt-8">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {orders.map(order => (
              <button key={order.id} onClick={() => setSelectedOrder(order)} className={`flex-shrink-0 rounded-full border px-4 py-2 text-xs ${selectedOrder?.id === order.id ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]' : 'border-[#8B1A1A]/30 text-[#FDF5F0]/50'}`}>
                {order.order_number || order.id.slice(0, 8)}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && !selectedOrder && <div className="py-20 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-[#C9A84C]" /></div>}

      {selectedOrder && (
        <>
          <section className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-[1fr_340px]">
            <div>
              <OrderHeader order={selectedOrder} />
              <Timeline order={selectedOrder} />
              {(selectedOrder.status === 'shipped' || selectedOrder.tracking_number) && <TrackingDetails order={selectedOrder} />}
            </div>
            <OrderSummary order={selectedOrder} />
          </section>
          <SignatureUpsell orderedCharacter={selectedCharacter} characters={otherCharacters} navigate={navigate} />
        </>
      )}
    </main>
  );
}

function OrderHeader({ order }) {
  const character = characterFromOrder(order);
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#8B1A1A]/30 bg-[#180C0C] p-6">
      <div>
        <p className="font-display text-2xl font-bold text-[#C9A84C]">{order.order_number || order.id}</p>
        <p className="mt-1 text-sm text-[#FDF5F0]/70">{character.name || 'Faith Heroes'} Gift Box</p>
        <p className="mt-1 text-xs text-[#FDF5F0]/40">Ordered {formatDate(order.created_at)}</p>
      </div>
      <div className="text-right">
        <span className={`inline-block rounded-full border px-4 py-1.5 text-sm font-medium ${statusStyles[order.status] || statusStyles.pending}`}>{order.status}</span>
        <p className="mt-2 font-display text-xl font-bold text-[#FDF5F0]">£{Number(order.total_amount || 0).toFixed(2)}</p>
      </div>
    </div>
  );
}

function Timeline({ order }) {
  const character = characterFromOrder(order);
  const index = statusIndex(order.status);
  const steps = [
    [ShoppingCart, 'Order Confirmed', order.created_at, `Your order ${order.order_number || ''} has been received and payment confirmed. Thank you.`],
    [CreditCard, 'Payment Verified', order.created_at, `Payment of £${Number(order.total_amount || 0).toFixed(2)} successfully processed via ${order.payment_method || 'secure checkout'}.`],
    [Printer, 'Being Crafted', order.status === 'printing' || index > 2 ? order.updated_at : null, `Our team are handcrafting your ${character.name || 'Faith Heroes'} gift box with love in Bristol, UK.`],
    [Package, 'Packed & Dispatched', order.tracking_number ? order.updated_at : null, `Your box has been carefully packed and collected by ${order.carrier || 'our courier'}.`],
    [Truck, 'Out for Delivery', order.status === 'delivered' ? order.updated_at : null, `Your Faith Heroes box is on its way${order.shipping_address?.city ? ` to ${order.shipping_address.city}` : ''}!`],
    [CheckCircle, 'Delivered', order.status === 'delivered' ? order.updated_at : null, 'Your box has arrived! We hope it brings joy and faith to your home.'],
  ];

  return (
    <div className="relative">
      <div className="absolute bottom-5 left-[19px] top-5 w-px bg-gradient-to-b from-[#C9A84C] via-[#8B1A1A]/50 to-[#8B1A1A]/20" />
      {steps.map(([Icon, name, timestamp, desc], step) => {
        const completed = step < index || (order.status === 'delivered' && step <= index);
        const active = step === index && !completed;
        return (
          <div key={name} className="relative flex items-start gap-5 pb-8 last:pb-0">
            <div className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${completed ? 'border-2 border-[#E05555] bg-[#8B1A1A]' : active ? 'border-2 border-[#C9A84C] bg-[#180C0C]' : 'border border-[#8B1A1A]/30 bg-[#180C0C]'}`}>
              {active && <span className="absolute inset-0 animate-ping rounded-full border-2 border-[#C9A84C]/40" />}
              {completed ? <Check size={16} className="text-[#FDF5F0]" /> : <Icon size={16} className={active ? 'text-[#C9A84C]' : 'text-[#FDF5F0]/20'} />}
            </div>
            <div className="flex-1 pt-1.5">
              <p className={`text-sm font-medium ${completed || active ? 'text-[#FDF5F0]' : 'text-[#FDF5F0]/30'}`}>{name}</p>
              <p className="mt-0.5 text-xs text-[#FDF5F0]/50">{completed || active ? formatDateTime(timestamp || order.created_at) : 'Pending'}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#FDF5F0]/50">{desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrackingDetails({ order }) {
  function copy() {
    navigator.clipboard?.writeText(order.tracking_number || '');
    toast.success('Tracking number copied');
  }
  return (
    <div className="mt-6 rounded-2xl border border-[#C9A84C]/20 bg-[#180C0C] p-6">
      <h3 className="mb-4 font-display text-lg font-bold text-[#FDF5F0]">Tracking Details</h3>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-[#FDF5F0]/60">{order.carrier || 'Carrier'}: <span className="font-mono text-[#FDF5F0]">{order.tracking_number || 'Pending'}</span></span>
        {order.tracking_number && <button onClick={copy} className="text-[#C9A84C]"><Clipboard size={15} /></button>}
      </div>
      {order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#8B1A1A]/40 bg-[#8B1A1A]/20 px-5 py-2.5 text-sm text-[#FDF5F0]"><ExternalLink size={14} /> Track on {order.carrier || 'Courier'} Website</a>}
      {order.estimated_delivery && <p className="mt-4 flex items-center gap-2 text-sm font-medium text-[#FDF5F0]"><Calendar size={16} className="text-[#C9A84C]" /> Estimated delivery: {formatDate(order.estimated_delivery)}</p>}
    </div>
  );
}

function OrderSummary({ order }) {
  const character = characterFromOrder(order);
  const product = firstItem(order)?.products || {};
  const [signature, signatureDesc] = signatureFor(character);
  const contents = Array.isArray(product.includes) && product.includes.length ? product.includes.slice(0, 5) : ['3D vinyl collector figure', 'Story card booklet', 'Scripture keychain', 'Character bookmark', 'Voice narration NFC card'];

  return (
    <aside className="sticky top-24 rounded-2xl border border-[#8B1A1A]/30 bg-[#180C0C] p-6">
      <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#2A1010] to-[#180C0C]">
        {character.figure_image_url ? <img src={assetUrl(character.figure_image_url)} alt={character.name} className="h-full w-full object-contain p-3" /> : <div className="text-center"><Crown size={40} className="mx-auto text-[#C9A84C]/25" /><p className="mt-2 font-display text-2xl font-black text-[#C9A84C]/40">{character.name}</p></div>}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold text-[#FDF5F0]">{character.name || 'Faith Heroes'}</h3>
      <p className="mt-1 text-xs text-[#C9A84C]">{character.bible_reference}</p>
      <p className="mt-1 text-[9px] uppercase tracking-widest text-[#FDF5F0]/40">{character.tagline}</p>

      <div className="mt-4 rounded-xl border border-[#C9A84C]/20 bg-[#0A0505] p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#C9A84C]"><Crown size={14} className="mr-2 inline" /> Signature Item:</p>
        <p className="mt-1 text-sm font-medium text-[#FDF5F0]">{signature}</p>
        <p className="mt-1 text-xs leading-relaxed text-[#FDF5F0]/50">{signatureDesc}</p>
      </div>

      <div className="mt-4 space-y-2">
        {contents.map(item => <p key={item} className="flex items-center gap-2 text-xs text-[#FDF5F0]/60"><CheckCircle size={12} className="text-[#C9A84C]/60" /> {item}</p>)}
      </div>
      <div className="mt-4 border-t border-[#8B1A1A]/20 pt-4">
        <Summary label="Subtotal" value={`£${Number(order.total_amount || 0).toFixed(2)}`} />
        <Summary label="Shipping" value="Included at checkout" />
        <Summary label="Total" value={`£${Number(order.total_amount || 0).toFixed(2)}`} total />
      </div>
      <div className="mt-5 space-y-2">
        <button onClick={() => window.print()} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#8B1A1A]/40 py-2.5 text-xs text-[#FDF5F0]/60"><Download size={13} /> Download Receipt</button>
        <button onClick={() => window.location.href = '/contact?subject=Order+Help'} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#8B1A1A]/40 py-2.5 text-xs text-[#FDF5F0]/60"><MessageSquare size={13} /> Contact Support</button>
        <Link to="/share-kindness" className="block text-center text-xs text-[#C9A84C] hover:underline">Share Your Story</Link>
      </div>
    </aside>
  );
}

function Summary({ label, value, total }) {
  return <div className={`flex justify-between py-1 ${total ? 'text-base font-bold text-[#C9A84C]' : 'text-xs text-[#FDF5F0]/60'}`}><span>{label}</span><span>{value}</span></div>;
}

function SignatureUpsell({ orderedCharacter, characters, navigate }) {
  const allCards = characters.length ? characters : ['Noah', 'David', 'Moses', 'Esther', 'Joseph', 'Daniel', 'Ruth', 'Jonah', 'Elijah', 'Mary', 'Peter', 'Paul'].map(name => ({ id: name.toLowerCase(), name }));
  return (
    <section className="border-t border-[#8B1A1A]/20 bg-[#0D0606] py-16">
      <div className="mb-10 text-center">
        <span className="inline-block rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-1.5 text-[10px] uppercase tracking-widest text-[#C9A84C]">Only in Their Box</span>
        <h2 className="mt-4 font-display text-3xl font-bold text-[#FDF5F0] md:text-4xl">Meet the Other Heroes</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[#FDF5F0]/60">While your box is on its way, discover more heroes. Every character has one signature item found only in their box.</p>
      </div>
      <div className="overflow-x-auto px-6 scrollbar-hide">
        <div className="flex w-max gap-4">
          {allCards.map((character, index) => {
            const [item, desc, Icon] = signatureFor(character);
            const already = orderedCharacter?.name === character.name;
            return (
              <motion.button key={character.id || character.name} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }} onClick={() => !already && navigate(`/shop/${character.id}`)} className="group w-56 flex-shrink-0 rounded-2xl border border-[#8B1A1A]/20 bg-[#180C0C] p-5 text-left transition hover:border-[#C9A84C]/35">
                <div className="relative mb-4 flex h-28 items-center justify-center rounded-xl border border-[#8B1A1A]/20 bg-gradient-to-br from-[#2A1010] to-[#0A0505] transition group-hover:border-[#C9A84C]/30">
                  <Icon size={40} className="text-[#C9A84C]/40" />
                  <span className="absolute right-2 top-2 rounded-full bg-[#C9A84C] px-1.5 py-0.5 text-[8px] font-bold text-[#0A0505]">{already ? 'OWNED' : 'EXCLUSIVE'}</span>
                </div>
                <p className="text-[9px] uppercase tracking-widest text-[#FDF5F0]/50">{character.name}</p>
                <p className="mt-1 font-display text-sm font-bold leading-tight text-[#FDF5F0]">{item}</p>
                <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-[#FDF5F0]/50">{desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-[#C9A84C]">£24.99</span>
                  <span className="rounded-full bg-[#8B1A1A]/80 px-3 py-1.5 text-[10px] text-[#FDF5F0]">{already ? 'In Collection' : 'Get It'}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#C9A84C]/20 bg-[#180C0C] p-8 text-center">
        <Crown size={28} className="mx-auto text-[#C9A84C]" />
        <h3 className="mt-3 font-display text-2xl font-bold text-[#FDF5F0]">Collect All 12 Heroes</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm text-[#FDF5F0]/60">Buy 3 boxes and get free premium gift wrapping. Buy the complete set of 12 and save 20%.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => navigate('/shop?bundle=3')} className="rounded-full bg-[#8B1A1A] px-6 py-3 text-sm text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">Bundle of 3</button>
          <button onClick={() => navigate('/shop?bundle=all')} className="rounded-full border border-[#C9A84C]/50 px-6 py-3 text-sm text-[#C9A84C] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">Full Collection</button>
        </div>
      </div>
    </section>
  );
}
