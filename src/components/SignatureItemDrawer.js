import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookMarked, BookOpen, CheckCircle, Crown, Plus, User, X } from 'lucide-react';
import { emojiForSignatureItem, humaniseSlug } from '../lib/signatureItemVisuals';
import { assetUrl } from '../lib/assets';

function useDesktop() {
  const [desktop, setDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

  useEffect(() => {
    function onResize() {
      setDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return desktop;
}

const positions = {
  'top-left': 0,
  'top-centre': 1,
  'top-center': 1,
  'top-right': 2,
  left: 3,
  centre: 4,
  center: 4,
  figure: 4,
  right: 5,
  'bottom-left': 6,
  'bottom-centre': 7,
  'bottom-center': 7,
  'bottom-right': 8,
};

export function SignatureItemDrawer({ item, isOpen, onClose, isSelected, onToggle }) {
  const desktop = useDesktop();
  if (!item) return null;

  const panelMotion = desktop
    ? { initial: { x: '100%', opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: '100%', opacity: 0 } }
    : { initial: { y: '100%', opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: '100%', opacity: 0 } };
  const activeCell = positions[item.scene_position] ?? 4;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#0A0505]/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            {...panelMotion}
            transition={{ type: 'spring', damping: desktop ? 30 : 32, stiffness: desktop ? 300 : 320 }}
            className="fixed bottom-0 left-0 right-0 z-50 h-[85vh] overflow-y-auto rounded-t-3xl border-t border-[#8B1A1A]/30 bg-[#0D0808] lg:bottom-auto lg:left-auto lg:top-0 lg:h-screen lg:w-[420px] lg:rounded-none lg:border-l lg:border-t-0"
          >
            <div className="mx-auto mb-2 mt-4 h-1 w-10 rounded-full bg-[#FDF5F0]/20 lg:hidden" />
            <header className="flex items-start justify-between p-6 pb-0">
              <div>
                {item.character_name && <span className="mb-2 inline-block rounded-full border border-[#E05555]/20 bg-[#8B1A1A]/20 px-2 py-0.5 text-[9px] text-[#E05555]">{item.character_name}</span>}
                <h3 className="font-display text-2xl font-bold leading-tight text-[#FDF5F0]">{item.name}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.is_included && <Badge className="border-[#4CAF7D]/30 bg-[#4CAF7D]/15 text-[#4CAF7D]">✓ Always Included Free</Badge>}
                  {item.badge_text && <Badge className="border-[#C9A84C]/25 bg-[#C9A84C]/10 text-[#C9A84C]">★ {item.badge_text}</Badge>}
                  {item.glow_in_dark && <Badge className="border-purple-500/20 bg-purple-500/10 text-purple-400">✦ Glows in the Dark</Badge>}
                  {item.is_wearable && <Badge className="border-blue-500/20 bg-blue-500/10 text-blue-400">↑ Fits on Figure</Badge>}
                </div>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#8B1A1A]/30 bg-[#180C0C] text-[#FDF5F0]/60">
                <X size={14} />
              </button>
            </header>

            <motion.div initial={{ scale: 1.05 }} animate={{ scale: 1 }} className="mx-6 mt-5 flex h-52 items-center justify-center overflow-hidden rounded-2xl border border-[#8B1A1A]/20 bg-gradient-to-br from-[#2A1010] to-[#0A0505]">
              {item.image_url ? <img src={assetUrl(item.image_url)} alt={item.name} className="h-full w-full object-contain p-4" /> : <span className="text-6xl">{emojiForSignatureItem(item)}</span>}
            </motion.div>

            <div className="space-y-6 p-6">
              <section>
                <p className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#FDF5F0]/40"><BookOpen size={12} className="text-[#C9A84C]/60" /> The Story Behind This Item</p>
                <p className="font-serif text-sm leading-[1.8] text-[#FDF5F0]/80">{item.story || item.short_desc || 'The full story for this signature item is coming soon.'}</p>
              </section>

              <section className="rounded-xl border-l-4 border-[#C9A84C] bg-[#0A0505] p-5">
                <p className="mb-2 flex items-center gap-2 text-xs font-medium text-[#C9A84C]"><BookMarked size={12} /> {item.scripture || 'Scripture'}</p>
                <p className="font-display text-sm italic leading-relaxed text-[#FDF5F0]/80">"{item.scripture_quote || 'Scripture quote coming soon.'}"</p>
              </section>

              <section>
                <p className="mb-3 text-[10px] uppercase tracking-widest text-[#FDF5F0]/40">Item Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <Detail label="Material" value={item.material || 'Collector resin'} />
                  <Detail label="Size" value={item.dimensions || 'Miniature'} />
                  {item.connects_to && <Detail label="Connects to" value={humaniseSlug(item.connects_to)} />}
                  {item.is_wearable && <Detail label="Wearable" value="Fits over figure" />}
                  {item.glow_in_dark && <Detail label="Special Feature" value="Glows in the dark" />}
                </div>
              </section>

              <section>
                <p className="mb-3 text-[10px] uppercase tracking-wider text-[#FDF5F0]/40">Scene Position</p>
                <div className="grid h-20 w-20 grid-cols-3 gap-1 rounded-xl border border-[#8B1A1A]/20 bg-[#0A0505] p-1">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} className={`flex items-center justify-center rounded ${activeCell === index ? 'border border-[#C9A84C]/60 bg-[#C9A84C]/30' : 'bg-[#180C0C]'}`}>
                      {activeCell === index ? <Crown size={10} className="text-[#C9A84C]" /> : index === 4 ? <User size={9} className="text-[#FDF5F0]/25" /> : null}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <footer className="sticky bottom-0 border-t border-[#8B1A1A]/20 bg-[#0D0808] p-5">
              {item.is_included ? (
                <div className="flex items-center gap-3 rounded-xl border border-[#4CAF7D]/20 bg-[#4CAF7D]/10 p-4">
                  <CheckCircle size={20} className="text-[#4CAF7D]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#4CAF7D]">Included in every box</p>
                    <p className="mt-0.5 text-xs text-[#4CAF7D]/60">No extra cost</p>
                  </div>
                  <p className="font-display text-2xl font-black text-[#4CAF7D]">FREE</p>
                </div>
              ) : isSelected ? (
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-[#C9A84C]" />
                  <p className="flex-1 text-sm font-medium text-[#C9A84C]">Added to your box!</p>
                  <button onClick={() => onToggle(item)} className="rounded-full border border-[#8B1A1A]/40 px-5 py-3 text-xs text-[#FDF5F0]/50">Remove</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="font-display text-2xl font-black text-[#C9A84C]">+£{Number(item.price || 0).toFixed(2)}</p>
                  <button onClick={() => { onToggle(item); onClose(); }} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#8B1A1A] py-3.5 text-sm font-medium text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">
                    <Plus size={15} /> Add to My Box
                  </button>
                </div>
              )}
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Badge({ className, children }) {
  return <span className={`rounded-full border px-2 py-0.5 text-[9px] ${className}`}>{children}</span>;
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-[#8B1A1A]/15 bg-[#0A0505] p-3">
      <p className="mb-1 text-[9px] uppercase tracking-wider text-[#FDF5F0]/40">{label}</p>
      <p className="text-xs font-medium text-[#FDF5F0]">{value}</p>
    </div>
  );
}
