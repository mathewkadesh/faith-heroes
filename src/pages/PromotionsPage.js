import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { promotionAPI } from '../lib/api';
import { assetUrl } from '../lib/assets';

const seasonEmoji = {
  summer: '🌞',
  christmas: '🎄',
  easter: '🌸',
  harvest: '🍂',
  custom: '✝',
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Promotions - Faith Heroes';
    promotionAPI.getActive().then(res => setPromotions(res.data || [])).catch(() => setPromotions([]));
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0505] pt-16 text-[#FDF5F0]">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#180C0C] to-[#0A0505] py-24 text-center">
        <div className="landing-grain absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-4xl px-6">
          <span className="rounded-full border border-[#E05555]/30 bg-[#E05555]/10 px-4 py-1.5 text-[10px] uppercase tracking-widest text-[#E05555]">Limited Time</span>
          <h1 className="mt-5 font-display text-5xl font-black leading-[0.9] md:text-7xl">Seasonal Editions</h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#FDF5F0]/60">Exclusive signature items, seasonal storytelling, and limited stock releases for collectors and families.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promotion, index) => {
            const accent = promotion.theme_colour || '#C9A84C';
            const bg = promotion.bg_colour || '#180C0C';
            const image = assetUrl(promotion.card_image_url || promotion.banner_image_url || promotion.characters?.figure_image_url || promotion.characters?.lid_image_url);
            return (
              <motion.article key={promotion.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="overflow-hidden rounded-2xl border" style={{ backgroundColor: bg, borderColor: `${accent}44` }}>
                <div className="flex h-52 items-center justify-center bg-[#120907]">
                  {image ? <img src={image} alt={promotion.name} className="h-full w-full object-contain p-5" /> : <span className="text-6xl">{seasonEmoji[promotion.season] || '✝'}</span>}
                </div>
                <div className="p-6">
                  <span className="rounded-full border px-2 py-1 text-[9px] uppercase" style={{ borderColor: `${accent}44`, color: accent }}>{promotion.badge_text || 'Limited Edition'}</span>
                  <h2 className="mt-3 font-display text-2xl font-bold">{promotion.name}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-[#FDF5F0]/60">{promotion.description}</p>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-sm text-[#FDF5F0]/30 line-through">£{Number(promotion.original_price || 0).toFixed(2)}</p>
                      <p className="font-display text-3xl font-black" style={{ color: accent }}>£{Number(promotion.promo_price || 0).toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-[#FDF5F0]/50">{promotion.remaining_stock} left</p>
                  </div>
                  <Link to={`/promotions/${promotion.slug}`} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-[#0A0505]" style={{ backgroundColor: accent }}>
                    <Crown size={15} /> View Edition
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
        {promotions.length === 0 && (
          <div className="py-20 text-center">
            <Crown className="mx-auto text-[#C9A84C]/30" size={48} />
            <p className="mt-4 text-sm text-[#FDF5F0]/50">No active promotions right now.</p>
          </div>
        )}
      </section>
    </main>
  );
}
