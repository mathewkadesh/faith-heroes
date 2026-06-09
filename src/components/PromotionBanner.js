import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
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

function countdownParts(endsAt) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { days, hours, minutes };
}

export default function PromotionBanner({ promotion }) {
  const [closed, setClosed] = useState(() => sessionStorage.getItem(`promotion-banner-closed-${promotion?.id}`) === 'true');
  const [livePromotion, setLivePromotion] = useState(promotion);
  const [, setTick] = useState(0);

  useEffect(() => setLivePromotion(promotion), [promotion]);

  useEffect(() => {
    const timer = setInterval(() => setTick(value => value + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!promotion?.id) return;
    if (!socket.connected) socket.connect();
    function onUpdated(update) {
      if (update.id === promotion.id) setLivePromotion(current => ({ ...current, ...update }));
    }
    socket.on('promotion:updated', onUpdated);
    return () => socket.off('promotion:updated', onUpdated);
  }, [promotion?.id]);

  const countdown = countdownParts(livePromotion?.ends_at);

  if (!livePromotion || closed) return null;

  const accent = livePromotion.theme_colour || '#C9A84C';
  const bg = livePromotion.bg_colour || '#180C0C';
  const remaining = Number(livePromotion.remaining_stock || 0);
  const total = Number(livePromotion.total_stock || 1);
  const stockPct = Math.max(0, Math.min(100, (remaining / total) * 100));

  function close() {
    sessionStorage.setItem(`promotion-banner-closed-${livePromotion.id}`, 'true');
    setClosed(true);
  }

  return (
    <section
      className="relative overflow-hidden border-y py-5"
      style={{
        background: `linear-gradient(135deg, ${bg}, ${accent}22, ${bg})`,
        borderColor: `${accent}33`,
      }}
    >
      <div className="landing-grain absolute inset-0 opacity-50" />
      <motion.div
        className="absolute left-0 top-0 h-px w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}99, transparent)` }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{seasonEmoji[livePromotion.season] || '✝'}</span>
          <div>
            <span className="rounded-full border px-2 py-0.5 text-[9px] uppercase" style={{ borderColor: `${accent}66`, color: accent, backgroundColor: `${accent}22` }}>
              {livePromotion.badge_text || 'Limited Edition'}
            </span>
            <h2 className="mt-1 font-display text-xl font-bold text-[#FDF5F0]">{livePromotion.name}</h2>
            {livePromotion.tagline && <p className="text-sm italic" style={{ color: accent }}>{livePromotion.tagline}</p>}
          </div>
        </div>

        {livePromotion.show_countdown && (
          <div className="flex gap-3">
            {[
              [countdown.days, 'D'],
              [countdown.hours, 'H'],
              [countdown.minutes, 'M'],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <p className="font-display text-xl font-black" style={{ color: accent }}>{String(value).padStart(2, '0')}</p>
                <p className="text-[9px] uppercase text-[#FDF5F0]/40">{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          {livePromotion.show_stock_count && (
            <div>
              <p className="text-xs text-[#FDF5F0]/60">{remaining} left</p>
              <div className="mt-1 h-1.5 w-24 rounded-full bg-[#2A1010]">
                <div className="h-full rounded-full" style={{ width: `${stockPct}%`, backgroundColor: accent }} />
              </div>
            </div>
          )}
          <Link to={`/promotions/${livePromotion.slug}`} className="rounded-full px-6 py-2.5 text-sm font-bold text-[#0A0505] transition hover:scale-105" style={{ backgroundColor: accent }}>
            Shop Now →
          </Link>
        </div>
      </div>
      <button onClick={close} className="absolute right-4 top-3 text-[#FDF5F0]/30 transition hover:text-[#FDF5F0]/60">
        <X size={16} />
      </button>
    </section>
  );
}
