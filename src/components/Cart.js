import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Lock, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { assetUrl } from '../lib/assets';

export default function Cart() {
  const { items, isOpen, closeDrawer, removeItem, updateQty, subtotal } = useCart();
  const navigate = useNavigate();

  function goToShop() {
    closeDrawer();
    navigate('/shop');
  }

  function checkout() {
    closeDrawer();
    navigate('/checkout');
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#0A0505]/60"
            onClick={closeDrawer}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-screen w-full flex-col border-l border-[#8B1A1A]/30 bg-[#0A0505] shadow-[-20px_0_60px_rgba(0,0,0,0.5)] sm:w-96"
          >
            <header className="flex flex-shrink-0 items-center justify-between border-b border-[#8B1A1A]/20 p-5">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-[#C9A84C]" />
                <h2 className="font-display text-xl font-bold text-[#FDF5F0]">Your Cart</h2>
                {items.length > 0 && <span className="rounded-full bg-[#8B1A1A] px-2 py-0.5 text-[10px] text-[#FDF5F0]">{items.length}</span>}
              </div>
              <button onClick={closeDrawer} className="text-[#FDF5F0]/45 transition hover:text-[#FDF5F0]">
                <X size={20} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <ShoppingBag size={48} className="text-[#C9A84C]/30" />
                <p className="mt-4 text-sm text-[#FDF5F0]/50">Your cart is empty</p>
                <button onClick={goToShop} className="mt-5 rounded-full bg-[#8B1A1A] px-6 py-3 text-sm text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">
                  Browse Gift Boxes
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  {items.map(item => (
                    <div key={item.product_id} className="flex items-start gap-4 rounded-xl border border-[#8B1A1A]/15 bg-[#180C0C] p-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#2A1010]">
                        {item.image_url ? (
                          <img src={assetUrl(item.image_url)} alt={item.character_name || item.name} className="h-full w-full object-contain p-1" />
                        ) : (
                          <Crown size={20} className="text-[#C9A84C]/30" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#FDF5F0]">{item.character_name || item.name} Gift Box</p>
                        {item.customisation?.is_gift && <span className="mt-1 inline-block rounded-full bg-[#8B1A1A]/20 px-2 py-0.5 text-[9px] text-[#E05555]">Gift</span>}
                        <p className="mt-1 text-sm font-bold text-[#C9A84C]">£{(Number(item.unit_price || 0) * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#8B1A1A]/40 text-[#FDF5F0]/70 transition hover:border-[#C9A84C] hover:text-[#C9A84C]">
                            <Minus size={12} />
                          </button>
                          <span className="w-4 text-center text-xs text-[#FDF5F0]">{item.quantity}</span>
                          <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#8B1A1A]/40 text-[#FDF5F0]/70 transition hover:border-[#C9A84C] hover:text-[#C9A84C]">
                            <Plus size={12} />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.product_id)} className="text-[#FDF5F0]/30 transition hover:text-[#E05555]">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <footer className="flex-shrink-0 border-t border-[#8B1A1A]/20 p-5">
                  <div className="mb-4 flex gap-2">
                    <input placeholder="Promo code" className="flex-1 rounded-full border border-[#8B1A1A]/30 bg-[#180C0C] px-4 py-2 text-xs text-[#FDF5F0] placeholder:text-[#FDF5F0]/25 focus:border-[#C9A84C] focus:outline-none" />
                    <button className="rounded-full border border-[#C9A84C]/40 px-4 py-2 text-xs text-[#C9A84C]">Apply</button>
                  </div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-[#FDF5F0]/60">Subtotal</span>
                    <span className="text-[#FDF5F0]">£{subtotal.toFixed(2)}</span>
                  </div>
                  <p className="text-right text-xs text-[#FDF5F0]/30">Shipping calculated at checkout</p>
                  <button onClick={checkout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#8B1A1A] py-4 font-medium text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">
                    <Lock size={14} /> Secure Checkout
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
