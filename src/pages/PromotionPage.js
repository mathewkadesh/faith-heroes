import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Crown, Loader2, Package, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentAPI, promotionAPI } from '../lib/api';
import { assetUrl } from '../lib/assets';
import socket from '../lib/socket';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const seasonEmoji = {
  summer: '🌞',
  christmas: '🎄',
  easter: '🌸',
  harvest: '🍂',
  custom: '✝',
};

function timeLeft(endsAt) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function scrollToPurchase() {
  document.getElementById('purchase')?.scrollIntoView({ behavior: 'smooth' });
}

export default function PromotionPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [promotion, setPromotion] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);
  const [code, setCode] = useState('');
  const [codeResult, setCodeResult] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function load() {
      setLoading(true);
      try {
        const [promoResponse, activeResponse] = await Promise.all([
          promotionAPI.getBySlug(slug),
          promotionAPI.getActive().catch(() => ({ data: [] })),
        ]);
        setPromotion(promoResponse.data);
        setRelated((activeResponse.data || []).filter(item => item.slug !== slug).slice(0, 3));
        document.title = `${promoResponse.data.name} - Faith Heroes`;
      } catch {
        setPromotion(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  useEffect(() => {
    const timer = setInterval(() => setTick(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!promotion?.id) return;
    if (!socket.connected) socket.connect();
    function onUpdated(update) {
      if (update.id === promotion.id) setPromotion(current => ({ ...current, ...update }));
    }
    socket.on('promotion:updated', onUpdated);
    return () => socket.off('promotion:updated', onUpdated);
  }, [promotion?.id]);

  const countdown = timeLeft(promotion?.ends_at);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#0A0505] pt-16"><Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" /></main>;
  }

  if (!promotion) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0505] px-6 pt-16 text-center text-[#FDF5F0]">
        <h1 className="font-display text-4xl">Promotion not found</h1>
        <button onClick={() => navigate('/promotions')} className="rounded-full border border-[#C9A84C]/40 px-6 py-3 text-sm text-[#C9A84C]">View Promotions</button>
      </main>
    );
  }

  const accent = promotion.theme_colour || '#C9A84C';
  const accentLt = promotion.theme_colour_lt || '#E8C97A';
  const bg = promotion.bg_colour || '#1A1000';
  const figure = promotion.characters?.figure_image_url || promotion.characters?.lid_image_url || promotion.banner_image_url;
  const figureUrl = assetUrl(figure);
  const bannerUrl = assetUrl(promotion.banner_image_url);
  const remaining = Number(promotion.remaining_stock || 0);
  const totalStock = Number(promotion.total_stock || 1);
  const stockPct = Math.max(0, Math.min(100, (remaining / totalStock) * 100));
  const items = promotion.promotion_signature_items || [];
  const included = items.filter(item => item.is_included);
  const addons = items.filter(item => item.is_addon);
  const discountPct = codeResult?.valid ? Number(codeResult.discount_pct || 0) : 0;
  const price = Number(promotion.promo_price || 0);
  const discountedPrice = price * (1 - discountPct / 100);

  async function validateCode() {
    try {
      const result = await promotionAPI.validateCode({ code, promotion_id: promotion.id });
      setCodeResult(result);
      if (result.valid) toast.success(result.message);
      else toast.error(result.message);
    } catch (err) {
      toast.error(err.message || 'Could not validate promo code');
    }
  }

  function addPromotionToCart() {
    addItem({
      product_id: `promotion-${promotion.id}`,
      promotion_id: promotion.id,
      name: promotion.name,
      unit_price: discountedPrice,
      quantity: 1,
      image_url: figureUrl,
      character_name: promotion.characters?.name || promotion.name,
      customisation: {
        promotion_id: promotion.id,
        promo_code: codeResult?.valid ? code.toUpperCase() : '',
      },
    });
    toast.success('Promotion added to cart');
  }

  async function buyNow() {
    setCheckoutLoading(true);
    try {
      const response = await paymentAPI.createStripeSession({
        items: [{
          promotion_id: promotion.id,
          quantity: 1,
          customisation: {
            promo_code: codeResult?.valid ? code.toUpperCase() : '',
          },
        }],
        customer_email: user?.email || '',
      });
      window.location.href = response.data.url;
    } catch (err) {
      toast.error(err.message || 'Checkout is not configured yet');
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0505] pt-16 text-[#FDF5F0]" style={{ '--promo-accent': accent, '--promo-accent-lt': accentLt, '--promo-bg': bg }}>
      <section className="relative min-h-[500px] overflow-hidden" style={{ backgroundColor: bg }}>
        {promotion.banner_image_url && <img src={bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />}
        <div className="landing-grain absolute inset-0 opacity-60" />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 40% 60%, ${accent}26 0%, transparent 65%)` }} />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0A0505] to-transparent" />

        <div className="absolute left-6 top-6 rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-widest" style={{ borderColor: `${accent}66`, backgroundColor: `${accent}22`, color: accent }}>
          {seasonEmoji[promotion.season] || '✝'} {promotion.season?.replaceAll('_', ' ')} Edition
        </div>

        {promotion.show_countdown && (
          <div className="absolute right-6 top-6 rounded-2xl border bg-[#0A0505]/80 px-5 py-3 text-center backdrop-blur-sm" style={{ borderColor: `${accent}44` }}>
            <p className="mb-2 text-[10px] uppercase text-[#FDF5F0]/50">Ends in</p>
            <div className="flex gap-3">
              {[
                [countdown.days, 'Days'],
                [countdown.hours, 'Hrs'],
                [countdown.minutes, 'Min'],
                [countdown.seconds, 'Sec'],
              ].map(([value, label]) => <div key={label}><p className="font-display text-2xl font-black" style={{ color: accent }}>{String(value).padStart(2, '0')}</p><p className="text-[9px] uppercase text-[#FDF5F0]/40">{label}</p></div>)}
            </div>
          </div>
        )}

        <div className="relative z-10 mx-auto grid min-h-[65vh] max-w-6xl grid-cols-1 items-end gap-10 px-6 pb-12 pt-28 lg:grid-cols-[1fr_320px]">
          <div>
            <span className="rounded-full px-3 py-1 text-[10px] font-bold text-[#0A0505]" style={{ backgroundColor: accent }}>★ {promotion.badge_text}</span>
            <h1 className="mt-4 font-display text-5xl font-black leading-[0.88] md:text-7xl">{promotion.name}</h1>
            {promotion.tagline && <p className="mt-3 font-display text-xl italic md:text-2xl" style={{ color: accent }}>{promotion.tagline}</p>}
            {promotion.show_stock_count && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="h-2 w-48 rounded-full bg-[#2A1010]"><div className="h-full rounded-full transition-all" style={{ width: `${stockPct}%`, backgroundColor: accent }} /></div>
                <p className="text-sm text-[#FDF5F0]/60">{remaining} of {totalStock} remaining</p>
                {remaining < Number(promotion.low_stock_threshold || 20) && <p className="animate-pulse text-xs text-[#E05555]">Almost Gone!</p>}
              </div>
            )}
            <div className="mt-6 flex flex-wrap items-end gap-3">
              <p className="text-lg text-[#FDF5F0]/40 line-through">£{Number(promotion.original_price || 0).toFixed(2)}</p>
              <p className="font-display text-5xl font-black" style={{ color: accent }}>£{Number(promotion.promo_price || 0).toFixed(2)}</p>
              <span className="rounded-full border border-green-500/20 bg-green-500/15 px-3 py-1 text-sm text-green-400">Save {promotion.saving_pct}%</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={scrollToPurchase} className="rounded-full px-8 py-4 text-lg font-bold text-[#0A0505] transition hover:scale-105" style={{ backgroundColor: accent }}>Get This Edition →</button>
              <Link to="/promotions" className="rounded-full border px-8 py-4" style={{ borderColor: `${accent}66`, color: accent }}>View All Promotions</Link>
            </div>
          </div>
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity }} className="hidden justify-center lg:flex">
            {figure ? <img src={figureUrl} alt={promotion.name} className="h-72 w-72 object-contain drop-shadow-2xl" /> : <Crown size={180} style={{ color: accent }} />}
          </motion.div>
        </div>
      </section>

      <section className="py-20" style={{ backgroundColor: bg }}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-6 lg:grid-cols-2">
          <div className="grid h-[420px] grid-cols-2 gap-3">
            <div className="row-span-2 overflow-hidden rounded-2xl border bg-[#180C0C]" style={{ borderColor: `${accent}33` }}>{figure ? <img src={figureUrl} alt="" className="h-full w-full object-contain p-6" /> : null}</div>
            <div className="overflow-hidden rounded-2xl border bg-[#180C0C]" style={{ borderColor: `${accent}33` }}>{promotion.banner_image_url ? <img src={bannerUrl} alt="" className="h-full w-full object-cover" /> : null}</div>
            <div className="flex items-center justify-center rounded-2xl border bg-[#180C0C]" style={{ borderColor: `${accent}33` }}><Package size={54} style={{ color: accent }} /></div>
          </div>
          <div>
            <span className="rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-widest" style={{ borderColor: `${accent}44`, color: accent }}>{promotion.season} story</span>
            <h2 className="mt-4 font-display text-4xl font-bold">{promotion.name}</h2>
            <p className="mt-6 whitespace-pre-line text-sm leading-[1.9] text-[#FDF5F0]/70">{promotion.description}</p>
            {promotion.characters?.tagline && <p className="mt-6 border-l-4 pl-4 font-display text-lg italic" style={{ borderColor: accent, color: accent }}>{promotion.characters.tagline}</p>}
          </div>
        </div>
      </section>

      <section className="bg-[#0D0808] py-20">
        <div className="mb-12 text-center">
          <span className="rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-widest" style={{ borderColor: `${accent}44`, color: accent }}>Exclusive to This Edition</span>
          <h2 className="mt-4 font-display text-4xl font-bold">Only in the {promotion.name}</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-[#FDF5F0]/60">These items cannot be bought anywhere else. When the edition sells out, they are gone forever.</p>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <article key={item.id} className="overflow-hidden rounded-2xl border bg-[#180C0C]" style={{ borderColor: `${accent}33` }}>
              <div className="flex h-40 items-center justify-center bg-[#0A0505]">
                {item.image_url ? <img src={assetUrl(item.image_url)} alt={item.name} className="h-full w-full object-contain p-5" /> : <Crown size={44} style={{ color: accent }} />}
              </div>
              <div className="p-5">
                <span className="rounded-full px-2 py-1 text-[9px] font-bold text-[#0A0505]" style={{ backgroundColor: accent }}>{item.is_included ? 'FREE with this edition' : 'EXCLUSIVE'}</span>
                <h3 className="mt-3 font-display text-xl font-bold">{item.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#FDF5F0]/60">{item.short_desc}</p>
                <p className="mt-4 font-display text-lg font-bold" style={{ color: accent }}>{item.is_included ? 'Included' : `+£${Number(item.price || 0).toFixed(2)}`}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="purchase" className="py-20" style={{ backgroundColor: bg }}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">What’s in this edition</h2>
            <ul className="mt-6 space-y-3">
              {['Chibi 3D vinyl collector figure', 'Illustrated story booklet', 'Engraved scripture keychain', 'Character bookmark', 'Voice narration NFC card'].map(item => <li key={item} className="flex items-center gap-3 text-sm"><CheckCircle size={16} style={{ color: accent }} />{item}</li>)}
              {included.map(item => <li key={item.id} className="flex items-center gap-3 text-sm font-medium" style={{ color: accent }}><Crown size={16} />Exclusive: {item.name}</li>)}
            </ul>
          </div>

          <div className="rounded-2xl border bg-[#180C0C] p-8" style={{ borderColor: `${accent}44` }}>
            <p className="font-display text-5xl font-black" style={{ color: accent }}>£{discountedPrice.toFixed(2)}</p>
            {discountPct > 0 && <p className="mt-1 text-sm text-green-400">{discountPct}% promo discount applied</p>}
            <div className="mt-5 flex gap-3">
              <input value={code} onChange={event => setCode(event.target.value)} placeholder={`Enter promo code e.g. ${promotion.promo_code || 'SHEPHERD10'}`} className="flex-1 rounded-xl border border-[#8B1A1A]/40 bg-[#0A0505] px-4 py-3 text-sm text-[#FDF5F0] outline-none focus:border-[#C9A84C]" />
              <button onClick={validateCode} className="rounded-xl px-4 py-3 text-sm font-bold text-[#0A0505]" style={{ backgroundColor: accent }}>Apply</button>
            </div>
            {codeResult && <p className={`mt-2 text-xs ${codeResult.valid ? 'text-green-400' : 'text-[#E05555]'}`}>{codeResult.message}</p>}
            <div className="mt-6 h-2 rounded-full bg-[#2A1010]"><div className="h-full rounded-full" style={{ width: `${stockPct}%`, backgroundColor: accent }} /></div>
            <p className="mt-2 text-xs text-[#FDF5F0]/50">{remaining} remaining</p>
            <div className="mt-6 space-y-3">
              <button onClick={addPromotionToCart} className="flex w-full items-center justify-center gap-2 rounded-full border py-4 font-medium" style={{ borderColor: `${accent}66`, color: accent }}><ShoppingCart size={18} /> Add to Cart</button>
              <button onClick={buyNow} disabled={checkoutLoading || remaining < 1} className="flex w-full items-center justify-center gap-2 rounded-full py-4 font-bold text-[#0A0505] disabled:opacity-50" style={{ backgroundColor: accent }}>
                {checkoutLoading ? <Loader2 size={18} className="animate-spin" /> : <Crown size={18} />} Buy Now
              </button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-[#FDF5F0]/50"><Clock size={14} /> This edition ends {new Date(promotion.ends_at).toLocaleDateString('en-GB')}</p>
            {addons.length > 0 && <p className="mt-3 text-xs text-[#FDF5F0]/40">Optional add-ons shown above can be added from the full box customiser soon.</p>}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-[#0A0505] py-16">
          <h2 className="mb-8 text-center font-display text-3xl font-bold">Also Running Now</h2>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-6 md:grid-cols-3">
            {related.map(item => <Link key={item.id} to={`/promotions/${item.slug}`} className="rounded-2xl border border-[#8B1A1A]/25 bg-[#180C0C] p-5 transition hover:border-[#C9A84C]/40"><p className="font-display text-xl font-bold">{item.name}</p><p className="mt-2 text-sm text-[#FDF5F0]/50">{item.tagline}</p></Link>)}
          </div>
        </section>
      )}
    </main>
  );
}
