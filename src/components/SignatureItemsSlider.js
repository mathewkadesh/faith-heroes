import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, CheckCircle, ChevronLeft, ChevronRight, Crown, Info, Plus, X } from 'lucide-react';
import { useSignatureItems } from '../hooks/useSignatureItems';
import { emojiForSignatureItem } from '../lib/signatureItemVisuals';
import { assetUrl } from '../lib/assets';
import { SignatureItemDrawer } from './SignatureItemDrawer';

export function SignatureItemsSlider({ characterId, onSelectionChange }) {
  const { data, loading, error, refetch } = useSignatureItems(characterId);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [drawerItem, setDrawerItem] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const scrollRef = useRef(null);

  const items = useMemo(() => [...(data.included || []), ...(data.addons || [])], [data]);
  const selectedAddons = useMemo(() => items.filter(item => selectedIds.has(item.id) && item.is_addon), [items, selectedIds]);
  const addonTotal = selectedAddons.reduce((sum, item) => sum + Number(item.price || 0), 0);

  useEffect(() => {
    onSelectionChange?.(selectedAddons, addonTotal);
  }, [selectedAddons, addonTotal, onSelectionChange]);

  useEffect(() => {
    updateScrollState();
  }, [items.length]);

  function updateScrollState() {
    const node = scrollRef.current;
    if (!node) return;
    setCanLeft(node.scrollLeft > 8);
    setCanRight(node.scrollLeft + node.clientWidth < node.scrollWidth - 8);
    const cardWidth = node.firstElementChild?.clientWidth || 1;
    setActiveIndex(Math.round(node.scrollLeft / (cardWidth + 12)));
  }

  function toggleAddon(item) {
    if (!item.is_addon) return;
    setSelectedIds(current => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }

  if (loading) return <SignatureSkeleton />;

  if (error) {
    return (
      <div className="mt-8 rounded-2xl border border-[#8B1A1A]/20 bg-[#180C0C] p-6 text-center">
        <AlertCircle size={24} className="mx-auto text-[#E05555]" />
        <p className="mt-3 text-sm text-[#FDF5F0]/50">Could not load signature items</p>
        <button onClick={refetch} className="mt-4 rounded-full border border-[#8B1A1A]/40 px-5 py-2 text-xs text-[#FDF5F0]/60">Retry</button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-[#8B1A1A]/20 bg-[#180C0C] p-6 text-center">
        <Crown size={28} className="mx-auto text-[#C9A84C]/30" />
        <p className="mt-3 text-sm text-[#FDF5F0]/40">Signature items coming soon</p>
      </div>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold text-[#FDF5F0]"><Crown size={16} className="mr-2 inline text-[#C9A84C]" />Signature Items</h2>
        <p className="text-xs text-[#FDF5F0]/50">{data.included.length} included free · {data.addons.length} add-ons available</p>
      </div>
      <p className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#4CAF7D]"><CheckCircle size={12} /> Always included in your box - free</p>

      <div className="relative">
        {canLeft && <ArrowButton side="left" onClick={() => scrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' })} />}
        {canRight && <ArrowButton side="right" onClick={() => scrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' })} />}

        <div ref={scrollRef} onScroll={updateScrollState} className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
          {items.map((item, index) => (
            <SignatureItemCard
              key={item.id}
              item={item}
              index={index}
              selected={selectedIds.has(item.id)}
              onToggle={() => toggleAddon(item)}
              onInfo={() => setDrawerItem(item)}
            />
          ))}
        </div>
      </div>

      {selectedAddons.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#C9A84C]/20 bg-[#0A0505] p-4">
          <div className="flex flex-wrap gap-2">
            {selectedAddons.map(item => (
              <button key={item.id} onClick={() => toggleAddon(item)} className="rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/10 px-2 py-1 text-[10px] text-[#C9A84C]">
                {item.name} +£{Number(item.price || 0).toFixed(2)} <X size={10} className="ml-1 inline text-[#C9A84C]/60" />
              </button>
            ))}
          </div>
          <motion.p key={addonTotal} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-display text-sm font-bold text-[#C9A84C]">Add-ons: +£{addonTotal.toFixed(2)}</motion.p>
        </div>
      )}

      <div className="mt-3 flex justify-center gap-1.5">
        {items.map((item, index) => (
          <motion.span layout key={item.id} className={`h-1.5 rounded-full transition-colors ${index === activeIndex ? 'w-4 bg-[#C9A84C]' : 'w-1.5 bg-[#FDF5F0]/20'}`} />
        ))}
      </div>

      <SignatureItemDrawer
        item={drawerItem}
        isOpen={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        isSelected={drawerItem ? selectedIds.has(drawerItem.id) : false}
        onToggle={toggleAddon}
      />
    </section>
  );
}

function ArrowButton({ side, onClick }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button onClick={onClick} className={`absolute top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#8B1A1A]/40 bg-[#180C0C] text-[#FDF5F0] md:flex ${side === 'left' ? '-left-3' : '-right-3'}`}>
      <Icon size={16} />
    </button>
  );
}

function SignatureItemCard({ item, index, selected, onToggle, onInfo }) {
  const included = item.is_included;
  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      animate={selected ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      className={`relative flex-shrink-0 snap-start overflow-hidden rounded-2xl border bg-[#180C0C] transition-all duration-300 w-[85%] sm:w-[calc(33.333%-8px)] ${included ? 'border-[#4CAF7D]/30' : selected ? 'border-[#C9A84C]' : 'border-[#8B1A1A]/25 hover:border-[#C9A84C]/50'}`}
    >
      <div className={`h-1 ${included ? 'bg-[#4CAF7D]' : 'bg-gradient-to-r from-[#8B1A1A] to-[#C9A84C]'}`} />
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-[#2A1010] to-[#0A0505]">
        {item.image_url ? <img src={assetUrl(item.image_url)} alt={item.name} className="h-full w-full object-contain p-3" /> : <span className="text-5xl">{emojiForSignatureItem(item)}</span>}
        <span className={`absolute left-2 top-2 rounded-full border px-1.5 py-0.5 text-[8px] font-medium ${included ? 'border-[#4CAF7D]/30 bg-[#4CAF7D]/20 text-[#4CAF7D]' : 'border-[#C9A84C]/25 bg-[#C9A84C]/15 text-[#C9A84C]'}`}>
          {included ? '✓ Included' : item.badge_text || 'Add-on'}
        </span>
        {item.glow_in_dark && <span className="absolute right-2 top-2 rounded-full border border-purple-500/30 bg-[#8B00FF]/20 px-1.5 py-0.5 text-[8px] text-purple-400">✦ Glows</span>}
        {!item.glow_in_dark && item.is_wearable && <span className="absolute right-2 top-2 rounded-full border border-blue-500/30 bg-[#0066FF]/20 px-1.5 py-0.5 text-[8px] text-blue-400">↑ Wearable</span>}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 font-display text-sm font-bold leading-tight text-[#FDF5F0]">{item.name}</h3>
        <p className="mt-0.5 line-clamp-1 text-[9px] text-[#FDF5F0]/40">{item.material || 'Collector item'}</p>
        <div className="mt-3 flex items-center justify-between">
          {included ? <p className="flex items-center gap-1 text-xs font-bold text-[#4CAF7D]"><Check size={10} /> FREE</p> : <p className="font-display text-sm font-bold text-[#C9A84C]">+£{Number(item.price || 0).toFixed(2)}</p>}
          <div className="flex gap-2">
            <button onClick={onInfo} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#8B1A1A]/30 bg-[#0A0505] text-[#FDF5F0]/50 transition hover:border-[#C9A84C]/50 hover:text-[#C9A84C]"><Info size={12} /></button>
            <button disabled={included} onClick={onToggle} className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${included ? 'border-[#4CAF7D]/40 bg-[#4CAF7D]/20 text-[#4CAF7D]' : selected ? 'border-[#C9A84C] bg-[#C9A84C] text-[#0A0505]' : 'border-[#8B1A1A]/40 bg-[#8B1A1A]/20 text-[#FDF5F0]/50 hover:bg-[#8B1A1A] hover:text-[#FDF5F0]'}`}>
              {included || selected ? <Check size={12} /> : <Plus size={12} />}
            </button>
          </div>
        </div>
      </div>
      {selected && <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-[#C9A84C] bg-[#C9A84C]/5" />}
    </motion.article>
  );
}

function SignatureSkeleton() {
  return (
    <div className="mt-8 flex gap-3 overflow-hidden">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="w-[calc(33.333%-8px)] flex-shrink-0 animate-pulse overflow-hidden rounded-2xl border border-[#8B1A1A]/15 bg-[#180C0C]">
          <div className="h-28 rounded-t-2xl bg-[#2A1010]" />
          <div className="p-3">
            <div className="h-3 w-3/4 rounded-full bg-[#2A1010]" />
            <div className="mt-2 h-2 w-1/2 rounded-full bg-[#2A1010]" />
            <div className="mt-4 flex justify-between">
              <div className="h-4 w-1/4 rounded-full bg-[#2A1010]" />
              <div className="h-6 w-6 rounded-full bg-[#2A1010]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
