import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Box,
  CheckCircle,
  ChevronDown,
  CreditCard,
  Crown,
  Loader2,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Settings2,
  Shield,
  ShoppingCart,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react';
import { characterAPI, paymentAPI, productAPI } from '../lib/api';
import { assetUrl } from '../lib/assets';
import { stripePromise } from '../lib/stripe';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ThreeViewerModal from '../components/ThreeViewerModal';
import { SignatureItemsSlider } from '../components/SignatureItemsSlider';

const defaultContents = [
  'Chibi 3D vinyl collector figure',
  'Illustrated story card booklet (12 pages)',
  'Engraved scripture keychain',
  'Character bookmark with leather tassel',
  'Voice narration NFC card',
  'Thank you card + crown sticker sheet',
];

function deliveryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function ProductPage() {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [character, setCharacter] = useState(null);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [threeOpen, setThreeOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(true);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [wrapStyle, setWrapStyle] = useState('standard');
  const [nameTag, setNameTag] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [addonTotal, setAddonTotal] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchProduct = useCallback(async function fetchProduct() {
    setLoading(true);
    try {
      const [characterResponse, productsResponse, charactersResponse] = await Promise.all([
        characterAPI.getOne(characterId),
        productAPI.getAll(),
        characterAPI.getAll(),
      ]);
      const char = characterResponse.data;
      const prod = (productsResponse.data || []).find(item => item.character_id === characterId || item.characters?.id === characterId) || char.products?.find(item => item.is_active);
      setCharacter(char);
      setProduct(prod || null);
      setRelated((charactersResponse.data || []).filter(item => item.id !== characterId).slice(0, 3));
      const firstImage = char.figure_image_url || char.lid_image_url || char.box_image_url || '';
      setSelectedImage(firstImage);
      document.title = `${char.name} Gift Box - Faith Heroes`;
    } catch (error) {
      console.error('Product detail failed:', error);
      setCharacter(null);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [fetchProduct]);

  const gallery = useMemo(() => {
    if (!character) return [];
    return [
      { label: 'Lid', url: character.lid_image_url },
      { label: 'Figure', url: character.figure_image_url },
      { label: 'Box', url: character.box_image_url },
    ].filter(item => item.url);
  }, [character]);

  const price = Number(product?.price || 24.99);
  const premiumWrap = isGift && wrapStyle === 'premium' ? 3 : 0;
  const nameTagPrice = nameTag ? 2 : 0;
  const total = price * quantity + premiumWrap + nameTagPrice + addonTotal;
  const stock = Number(product?.stock_qty || 0);
  const contents = Array.isArray(product?.includes) && product.includes.length ? product.includes : defaultContents;

  function customisation() {
    return {
      is_gift: isGift,
      gift_message: giftMessage,
      recipient_name: recipientName,
      gift_wrap_style: wrapStyle,
      name_tag: nameTag,
      signature_addons: selectedAddons.map(addon => ({
        id: addon.id,
        name: addon.name,
        price: Number(addon.price || 0),
      })),
    };
  }

  function handleAddToCart() {
    if (!product || stock === 0) {
      toast.error('This box is not available yet');
      return;
    }
    addItem({
      product_id: product.id,
      name: product.name || `${character.name} Collector Gift Box`,
      unit_price: total / quantity,
      quantity,
      image_url: assetUrl(character.figure_image_url || character.lid_image_url || character.box_image_url),
      character_name: character.name,
      customisation: customisation(),
    });
    toast.success('Added to cart');
  }

  async function handleStripeCheckout() {
    if (!product || stock === 0) return;
    setPaymentLoading(true);
    try {
      const body = {
        items: [{ product_id: product.id, quantity, customisation: customisation() }],
        customer_email: user?.email || '',
      };

      const { data } = await paymentAPI.createStripeSession(body);
      const stripe = await stripePromise;
      if (data?.url) window.location.href = data.url;
      else if (data?.sessionId) await stripe.redirectToCheckout({ sessionId: data.sessionId });
      else throw new Error('No checkout URL returned');
    } catch (error) {
      toast.error(error.message || 'Checkout is not configured yet');
    } finally {
      setPaymentLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0A0505] pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
      </main>
    );
  }

  if (!character) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0505] px-6 pt-20 text-center">
        <p className="font-display text-3xl text-[#FDF5F0]">Character not found</p>
        <button onClick={() => navigate('/shop')} className="rounded-full border border-[#C9A84C]/40 px-6 py-3 text-sm text-[#C9A84C]">Back to Shop</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0505] pt-16 text-[#FDF5F0]">
      <div className="mx-auto max-w-7xl px-6 pt-8 text-xs text-[#FDF5F0]/40">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-[#C9A84C]">Home</Link>
          <span className="text-[#8B1A1A]/50">/</span>
          <Link to="/shop" className="hover:text-[#C9A84C]">Shop</Link>
          <span className="text-[#8B1A1A]/50">/</span>
          <span>{character.name}</span>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 py-8 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24">
          <div className="relative mb-4 h-[460px] overflow-hidden rounded-2xl border border-[#8B1A1A]/30 bg-[#180C0C] md:h-[520px]">
            {selectedImage ? (
              <img src={assetUrl(selectedImage)} alt={character.name} className="h-full w-full object-contain p-5" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#2A1010] to-[#180C0C]">
                <Crown size={72} className="text-[#C9A84C]/20" />
                <p className="font-display text-4xl font-black text-[#C9A84C]/30">{character.name}</p>
                <p className="text-xs text-[#FDF5F0]/15">Product image coming soon</p>
              </div>
            )}
            {selectedImage && <button onClick={() => setLightboxOpen(true)} className="absolute right-4 top-4 rounded-full bg-[#0A0505]/80 p-2 text-[#FDF5F0] backdrop-blur-sm"><ZoomIn size={16} /></button>}
          </div>

          <div className="mb-4 flex gap-3">
            {gallery.map(item => (
              <button key={item.label} onClick={() => setSelectedImage(item.url)} className={`h-20 w-20 overflow-hidden rounded-xl border transition hover:border-[#C9A84C]/60 ${selectedImage === item.url ? 'border-2 border-[#C9A84C]' : 'border-[#8B1A1A]/30'}`}>
                <img src={assetUrl(item.url)} alt={item.label} className="h-full w-full object-contain p-1" />
              </button>
            ))}
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-[#8B1A1A]/30 bg-[#180C0C] text-[9px] text-[#FDF5F0]/20">
              <Package size={20} />
            </div>
          </div>

          <button onClick={() => setThreeOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E05555]/40 bg-[#180C0C] py-3 text-sm font-medium text-[#E05555] transition hover:border-[#E05555]/70 hover:bg-[#8B1A1A]/30">
            <Box size={16} /> Preview 3D Figure
          </button>

          <div className="mt-5 flex flex-wrap justify-center gap-4">
            <TrustBadge icon={Shield} text="Secure" />
            <TrustBadge icon={Package} text="Handcrafted" />
            <TrustBadge icon={Truck} text="UK Shipped" />
            <TrustBadge icon={RotateCcw} text="14-Day Returns" />
          </div>
        </div>

        <div>
          {character.bible_reference && <span className="inline-block rounded-full border border-[#E05555]/30 bg-[#8B1A1A]/20 px-3 py-1 text-[10px] text-[#E05555]">{character.bible_reference}</span>}
          <h1 className="mt-3 font-display text-4xl font-black leading-tight text-[#FDF5F0] md:text-5xl">{character.name}</h1>
          {character.tagline && <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]">{character.tagline}</p>}
          {character.scripture_quote && <p className="mt-4 border-l-2 border-[#C9A84C] pl-4 font-display text-base italic leading-relaxed text-[#FDF5F0]/65">"{character.scripture_quote}"</p>}
          {character.description && <p className="mt-5 text-sm leading-relaxed text-[#FDF5F0]/70">{character.description}</p>}

          <div className="mt-6 flex items-baseline gap-3">
            <p className="font-display text-4xl font-black text-[#C9A84C]">£{price.toFixed(2)}</p>
            <p className="text-sm text-[#FDF5F0]/40">per box</p>
          </div>
          <p className={`mt-2 text-xs ${stock > 5 ? 'text-green-400' : stock > 0 ? 'text-[#E05555]' : 'text-[#FDF5F0]/40'}`}>
            ● {stock > 5 ? 'In Stock' : stock > 0 ? `Only ${stock} left` : 'Out of Stock'}
          </p>

          <section className="mt-6">
            <h2 className="mb-4 text-[10px] uppercase tracking-widest text-[#FDF5F0]/50">What's Inside Your Box</h2>
            <ul className="space-y-3">
              {contents.map(item => <li key={item} className="flex items-center gap-3 text-sm text-[#FDF5F0]"><CheckCircle size={16} className="flex-shrink-0 text-[#C9A84C]" /> {item}</li>)}
            </ul>
          </section>

          <SignatureItemsSlider
            characterId={character.id}
            onSelectionChange={(selected, totalValue) => {
              setSelectedAddons(selected);
              setAddonTotal(totalValue);
            }}
          />

          <section className="mt-6 overflow-hidden rounded-2xl border border-[#8B1A1A]/30">
            <button onClick={() => setCustomOpen(open => !open)} className={`flex w-full items-center justify-between bg-[#180C0C] p-5 ${customOpen ? 'border-b border-[#8B1A1A]/20' : ''}`}>
              <span className="flex items-center gap-2 text-sm font-medium text-[#FDF5F0]"><Settings2 size={16} className="text-[#C9A84C]" /> Customise Your Box</span>
              <ChevronDown size={17} className={`text-[#C9A84C] transition ${customOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {customOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-[#0A0505]">
                  <div className="space-y-5 p-5">
                    <Toggle label="This is a gift" icon={Package} checked={isGift} onClick={() => setIsGift(!isGift)} />
                    {isGift && (
                      <div className="space-y-4">
                        <Field label="Recipient Name" value={recipientName} onChange={setRecipientName} placeholder="Who is this for?" />
                        <label className="block">
                          <span className="mb-1 block text-xs text-[#FDF5F0]/70">Gift Message</span>
                          <textarea rows={3} maxLength={150} value={giftMessage} onChange={event => setGiftMessage(event.target.value)} placeholder="Write a personal message..." className="w-full resize-none rounded-xl border border-[#8B1A1A]/40 bg-[#180C0C] px-4 py-2.5 text-sm text-[#FDF5F0] placeholder:text-[#FDF5F0]/25 focus:border-[#C9A84C] focus:outline-none" />
                          <span className="block text-right text-[10px] text-[#FDF5F0]/30">{giftMessage.length}/150</span>
                        </label>
                        <div>
                          <p className="mb-2 text-xs text-[#FDF5F0]/70">Wrap Style</p>
                          <div className="grid grid-cols-2 gap-3">
                            <WrapCard active={wrapStyle === 'standard'} icon={Package} title="Standard" sub="Free" onClick={() => setWrapStyle('standard')} />
                            <WrapCard active={wrapStyle === 'premium'} icon={Crown} title="Premium Ribbon" sub="+£3.00" onClick={() => setWrapStyle('premium')} />
                          </div>
                        </div>
                      </div>
                    )}
                    <button onClick={() => setNameTag(!nameTag)} className="flex w-full items-center gap-3">
                      <span className={`flex h-5 w-5 items-center justify-center rounded border ${nameTag ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-[#8B1A1A]/40 bg-[#180C0C]'}`}>{nameTag && <CheckCircle size={13} className="text-[#0A0505]" />}</span>
                      <span className="text-sm text-[#FDF5F0]">Add personalised name tag</span>
                      <span className="ml-auto text-xs text-[#C9A84C]">+£2.00</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="mt-6">
            <p className="mb-3 text-xs uppercase tracking-wider text-[#FDF5F0]/50">Quantity</p>
            <div className="flex items-center gap-4">
              <QtyButton disabled={quantity === 1} onClick={() => setQuantity(value => Math.max(1, value - 1))} icon={Minus} />
              <span className="w-8 text-center font-display text-2xl font-bold text-[#FDF5F0]">{quantity}</span>
              <QtyButton disabled={stock > 0 && quantity >= stock} onClick={() => setQuantity(value => Math.min(stock || 10, value + 1))} icon={Plus} />
            </div>
          </section>

          <section className="mt-4 rounded-xl border border-[#8B1A1A]/20 bg-[#180C0C] p-4">
            <SummaryRow label={`Box x ${quantity}`} value={`£${(price * quantity).toFixed(2)}`} />
            {premiumWrap > 0 && <SummaryRow label="Premium wrap" value="+£3.00" />}
            {nameTagPrice > 0 && <SummaryRow label="Name tag" value="+£2.00" />}
            {addonTotal > 0 && <SummaryRow label={`Signature add-ons (${selectedAddons.length})`} value={`+£${addonTotal.toFixed(2)}`} />}
            <SummaryRow label="Shipping" value="Calculated at checkout" muted />
            <div className="my-3 border-t border-[#8B1A1A]/20" />
            <div className="flex justify-between">
              <span className="font-display text-xl font-bold text-[#FDF5F0]">Total</span>
              <span className="font-display text-xl font-bold text-[#C9A84C]">£{total.toFixed(2)}</span>
            </div>
          </section>

          <section className="mt-6 space-y-3">
            <button onClick={handleAddToCart} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#8B1A1A]/50 bg-[#2A1010] py-4 font-medium text-[#FDF5F0] transition hover:border-[#C9A84C]/40 hover:text-[#C9A84C]">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button onClick={handleStripeCheckout} disabled={paymentLoading || !product || stock === 0} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8B1A1A] py-4 font-medium text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505] disabled:opacity-50">
              {paymentLoading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
              {paymentLoading ? 'Processing...' : 'Buy Now - Secure Checkout'}
            </button>
            <button className="flex w-full items-center justify-center rounded-full bg-[#003087] py-4 font-medium text-white transition hover:bg-[#002070]">PayPal</button>
          </section>

          <p className="mt-4 flex items-center gap-2 text-xs text-[#FDF5F0]/40"><Truck size={14} className="text-[#FDF5F0]/30" /> Estimated delivery: {deliveryDate()}</p>
        </div>
      </section>

      <section className="border-t border-[#8B1A1A]/20 bg-[#0A0505] py-16">
        <h2 className="mx-auto mb-8 max-w-7xl px-6 font-display text-2xl font-bold text-[#FDF5F0]">You May Also Like</h2>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-6 sm:grid-cols-3">
          {related.map(item => (
            <button key={item.id} onClick={() => navigate(`/shop/${item.id}`)} className="overflow-hidden rounded-2xl border border-[#8B1A1A]/20 bg-[#180C0C] text-left transition hover:border-[#C9A84C]/30">
              <div className="h-40 bg-[#120907]">{item.figure_image_url ? <img src={assetUrl(item.figure_image_url)} alt={item.name} className="h-full w-full object-contain p-4" /> : <div className="flex h-full items-center justify-center"><Crown className="text-[#C9A84C]/25" /></div>}</div>
              <div className="p-4">
                <p className="font-display text-lg font-bold text-[#FDF5F0]">{item.name}</p>
                <p className="mt-1 text-[10px] text-[#C9A84C]">{item.bible_reference}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <ThreeViewerModal isOpen={threeOpen} onClose={() => setThreeOpen(false)} character={character} onAddToCart={handleAddToCart} />
      {lightboxOpen && (
        <div onClick={() => setLightboxOpen(false)} className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0A0505]/98 p-6">
          <button className="absolute right-6 top-6 text-[#FDF5F0]"><X size={28} /></button>
          <img src={assetUrl(selectedImage)} alt={character.name} className="max-h-[90vh] max-w-[90vw] object-contain" />
        </div>
      )}
    </main>
  );
}

function TrustBadge({ icon: Icon, text }) {
  return <span className="flex items-center gap-1.5 text-[10px] text-[#FDF5F0]/40"><Icon size={13} /> {text}</span>;
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[#FDF5F0]/70">{label}</span>
      <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-[#8B1A1A]/40 bg-[#180C0C] px-4 py-2.5 text-sm text-[#FDF5F0] placeholder:text-[#FDF5F0]/25 focus:border-[#C9A84C] focus:outline-none" />
    </label>
  );
}

function Toggle({ label, icon: Icon, checked, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-[#FDF5F0]"><Icon size={16} className="text-[#C9A84C]" /> {label}</span>
      <span className={`flex h-6 w-11 items-center rounded-full p-1 transition ${checked ? 'bg-[#8B1A1A]' : 'border border-[#8B1A1A]/40 bg-[#2A1010]'}`}>
        <span className={`h-4 w-4 rounded-full bg-[#FDF5F0] transition ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}

function WrapCard({ active, icon: Icon, title, sub, onClick }) {
  return (
    <button onClick={onClick} className={`rounded-xl border p-3 text-center transition ${active ? 'border-[#C9A84C] bg-[#C9A84C]/10' : 'border-[#8B1A1A]/30 bg-[#180C0C]'}`}>
      <Icon size={18} className="mx-auto text-[#C9A84C]" />
      <p className="mt-2 text-xs font-medium text-[#FDF5F0]">{title}</p>
      <p className={`text-[10px] ${sub.includes('£') ? 'text-[#C9A84C]' : 'text-[#FDF5F0]/50'}`}>{sub}</p>
    </button>
  );
}

function QtyButton({ disabled, onClick, icon: Icon }) {
  return (
    <button disabled={disabled} onClick={onClick} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8B1A1A]/40 bg-[#180C0C] text-[#FDF5F0] transition hover:border-[#C9A84C] hover:text-[#C9A84C] disabled:opacity-50">
      <Icon size={16} />
    </button>
  );
}

function SummaryRow({ label, value, muted }) {
  return (
    <div className={`flex justify-between py-1 text-sm ${muted ? 'text-xs text-[#FDF5F0]/40' : 'text-[#FDF5F0]/70'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
