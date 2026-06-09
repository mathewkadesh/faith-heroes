import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { promotionAPI } from '../lib/api';
import { assetUrl } from '../lib/assets';
import socket from '../lib/socket';

const seasonEmoji = {
  summer: '🌞',
  christmas: '🎄',
  easter: '🌸',
  harvest: '🍂',
  valentines: '❤',
  mothers_day: '💐',
  fathers_day: '⭐',
  back_to_school: '📚',
  custom: '✝',
};

function daysLeft(endsAt) {
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000));
}

export default function PromotionsSection() {
  const [promotions, setPromotions] = useState([]);

  async function fetchPromotions() {
    try {
      const response = await promotionAPI.getActive();
      setPromotions(response.data || []);
    } catch {
      setPromotions([]);
    }
  }

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    function onUpdated(update) {
      setPromotions(current => current.map(item => item.id === update.id ? { ...item, ...update } : item).filter(item => item.is_active !== false));
    }
    function onNew() {
      fetchPromotions();
    }
    socket.on('promotion:updated', onUpdated);
    socket.on('promotion:new', onNew);
    return () => {
      socket.off('promotion:updated', onUpdated);
      socket.off('promotion:new', onNew);
    };
  }, []);

  const visible = useMemo(() => promotions.slice(0, 3), [promotions]);
  if (!visible.length) return null;

  return (
    <section className="relative bg-[#0A0505] py-20">
      <div className="mb-14 text-center">
        <span className="rounded-full border border-[#E05555]/30 bg-[#E05555]/10 px-4 py-1.5 text-[10px] uppercase tracking-widest text-[#E05555]">Limited Time</span>
        <h2 className="mt-4 font-display text-4xl font-bold text-[#FDF5F0] md:text-5xl">Seasonal Editions</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-[#FDF5F0]/60">Exclusive signature items. Limited stock. Gone when the season ends.</p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((promotion, index) => {
          const accent = promotion.theme_colour || '#C9A84C';
          const bg = promotion.bg_colour || '#180C0C';
          const image = assetUrl(promotion.card_image_url || promotion.banner_image_url || promotion.characters?.figure_image_url || promotion.characters?.lid_image_url);
          const remaining = Number(promotion.remaining_stock || 0);
          const total = Number(promotion.total_stock || 1);
          const stockPct = Math.max(0, Math.min(100, (remaining / total) * 100));
          const items = (promotion.promotion_signature_items || []).slice(0, 3);

          return (
            <motion.article
              key={promotion.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="group overflow-hidden rounded-2xl border transition-all duration-500 hover:shadow-[0_0_40px_rgba(201,168,76,0.12)]"
              style={{ backgroundColor: bg, borderColor: `${accent}44` }}
            >
              <div className="relative h-48 overflow-hidden bg-[#120907]">
                {image ? (
                  <img src={image} alt={promotion.name} className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.03]" />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl">{seasonEmoji[promotion.season] || '✝'}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#180C0C] via-transparent to-transparent" />
                <span className="absolute left-3 top-3 rounded-full border bg-[#0A0505]/80 px-2 py-1 text-[9px] backdrop-blur-sm" style={{ borderColor: `${accent}44`, color: accent }}>
                  {seasonEmoji[promotion.season] || '✝'} {promotion.season?.replaceAll('_', ' ') || 'seasonal'}
                </span>
                <span className="absolute right-3 top-3 animate-pulse rounded-full bg-[#E05555] px-2 py-1 text-[9px] font-bold text-white">Limited</span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-[#FDF5F0]">{promotion.name}</h3>
                {promotion.tagline && <p className="mt-1 text-sm italic" style={{ color: accent }}>{promotion.tagline}</p>}
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[#FDF5F0]/60">{promotion.description}</p>
                {items.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[9px] uppercase tracking-wider text-[#FDF5F0]/40">Exclusive items:</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {items.map(item => <span key={item.id} className="rounded-full border px-2 py-0.5 text-[9px]" style={{ borderColor: `${accent}33`, backgroundColor: `${accent}18`, color: accent }}>{item.name}</span>)}
                    </div>
                  </div>
                )}
                <div className="my-4 border-t" style={{ borderColor: `${accent}22` }} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#FDF5F0]/30 line-through">£{Number(promotion.original_price || 0).toFixed(2)}</p>
                    <p className="font-display text-2xl font-black" style={{ color: accent }}>£{Number(promotion.promo_price || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#FDF5F0]/50">{daysLeft(promotion.ends_at)} days left</p>
                    <div className="mt-1 h-1 w-20 rounded-full bg-[#2A1010]">
                      <div className="h-full rounded-full" style={{ width: `${stockPct}%`, backgroundColor: accent }} />
                    </div>
                  </div>
                </div>
                <Link to={`/promotions/${promotion.slug}`} className="mt-4 block w-full rounded-full py-3 text-center text-sm font-bold text-[#0A0505] transition hover:scale-105" style={{ backgroundColor: accent }}>
                  Shop This Edition →
                </Link>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
