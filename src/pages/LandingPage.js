import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  ChevronDown,
  Gift,
  Heart,
  Key,
  Mail,
  Package,
  PlayCircle,
  Shield,
  ShoppingBag,
  Star,
  Truck,
  Volume2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { characterAPI, promotionAPI, storyAPI } from '../lib/api';
import { assetUrl } from '../lib/assets';
import PromotionBanner from '../components/PromotionBanner';
import PromotionsSection from '../components/PromotionsSection';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

function WordsPullUp({ text, className = '' }) {
  return (
    <span className={className}>
      {text.split(' ').map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block mr-[0.18em]"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

function Label({ children, gold = false }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-widest ${gold ? 'border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C]' : 'border border-[#8B1A1A]/40 bg-[#8B1A1A]/20 text-[#E05555]'}`}>
      {children}
    </span>
  );
}

function PlaceholderImage({ text = 'Image coming soon' }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#2A1010] to-[#180C0C]">
      <BookOpen size={64} className="text-[#C9A84C]/30" />
      <p className="mt-2 text-xs text-[#FDF5F0]/20">{text}</p>
    </div>
  );
}

function CharacterGiftCard({ character, index }) {
  const navigate = useNavigate();
  const imageUrl = assetUrl(character.figure_image_url || character.lid_image_url || character.box_image_url);

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.15 }}
      onClick={() => navigate(`/shop/${character.id}`)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#8B1A1A]/25 bg-[#180C0C] transition-all duration-500 hover:border-[#C9A84C]/40 hover:shadow-[0_0_40px_rgba(139,26,26,0.2)]"
    >
      <div className="relative h-56 overflow-hidden bg-[#120907]">
        {imageUrl ? (
          <img src={imageUrl} alt={character.name} className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <PlaceholderImage />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#180C0C] via-transparent to-transparent" />
        {character.bible_reference && (
          <span className="absolute left-3 top-3 rounded-full border border-[#C9A84C]/30 bg-[#0A0505]/80 px-2 py-1 text-[9px] text-[#C9A84C] backdrop-blur-sm">
            {character.bible_reference}
          </span>
        )}
        {index === 0 && <span className="absolute right-3 top-3 rounded-full bg-[#8B1A1A] px-2 py-1 text-[9px] text-[#FDF5F0]">New</span>}
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-bold text-[#FDF5F0]">{character.name}</h3>
        <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-[#C9A84C]">{character.tagline || 'FAITH. COURAGE. HOPE.'}</p>
        <p className="mt-2 line-clamp-2 border-l-2 border-[#8B1A1A]/50 pl-3 text-xs italic text-[#FDF5F0]/50">
          {character.scripture_quote || 'A story of faith, courage, and God’s promise.'}
        </p>
        <div className="my-4 border-t border-[#8B1A1A]/20" />
        <div className="flex items-center justify-between">
          <p className="font-display text-xl font-bold text-[#C9A84C]">£24.99</p>
          <button className="rounded-full bg-[#8B1A1A]/80 px-4 py-2 text-xs font-medium text-[#FDF5F0] transition hover:bg-[#8B1A1A]">
            View Box
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 rounded-full bg-[#8B1A1A] px-4 py-2 text-center text-sm text-[#FDF5F0] transition hover:bg-[#E05555]">
            View Gift Box
          </button>
          <button className="inline-flex items-center gap-1 rounded-full border border-[#8B1A1A]/60 px-4 py-2 text-sm text-[#E05555] transition hover:bg-[#8B1A1A]/30">
            <Package size={14} /> 3D
          </button>
        </div>
      </div>
    </motion.article>
  );
}

const showcaseItems = [
  { icon: BookOpen, title: 'Story Booklet', desc: 'Illustrated 12-page story card with full narrative' },
  { icon: Key, title: 'Scripture Keychain', desc: 'Engraved with a key verse from the story' },
  { icon: Bookmark, title: 'Character Bookmark', desc: 'Premium leather tassel bookmark, story art printed' },
  { icon: Volume2, title: 'Voice Narration Card', desc: 'Tap to phone and hear the story in cinematic audio', badge: 'NEW' },
];

const steps = [
  { icon: ShoppingBag, title: 'Choose a Story', desc: 'Browse our Bible heroes and pick the story that moves you' },
  { icon: Gift, title: 'Customise Your Box', desc: 'Add a gift message, recipient name and wrap style' },
  { icon: Package, title: 'We Craft It', desc: 'Every item handcrafted and packed with love in Bristol' },
  { icon: Truck, title: 'Track Your Order', desc: 'Real-time updates from our hands to your door' },
];

const testimonials = [
  ['Sarah M.', 'Bristol, UK', "We ordered the Noah box for our son's birthday and he hasn't put the figure down since. The quality is incredible — it feels like a real collector's piece."],
  ['Pastor James O.', 'Birmingham, UK', 'Our Sunday school class uses these boxes as teaching tools. The children love the voice card — hearing the story narrated brings it completely to life.'],
  ['Rachel T.', 'London, UK', "I bought the David & Goliath box for my nephew who struggles with confidence. The tagline 'The battle is the Lord's' has become his personal motto."],
];

const videoShowcaseItems = [
  ['Unboxing', 'Noah’s Ark Collection', '/Img/noah-unboxing-gift-box.png'],
  ['Character Story', 'David & Goliath Box', '/Img/david-and-goliath-character-story.png'],
  ['Behind the Scenes', 'Handcrafted with Love', '/Img/handcrafted-with-love-workshop.png'],
  ['Collector Box', 'Moses Gift Box', '/Img/moses-collector-gift-box.png'],
  ['Signature Item', 'Scripture Keychain', '/Img/cross-keychain-signature-item.png'],
  ['Workshop', 'Faith Heroes Studio', '/Img/faith-heroes-workshop-desk.png'],
];

const fallbackStories = [
  ['Noah', 'God Keeps His Promises', 'This story reminds me that no matter how big the task God calls us to, He equips us with everything we need.', 'Genesis 6:22'],
  ['David', 'Facing My Goliath', 'I was going through the hardest season of my life when I read this story. It gave me courage to stand.', '1 Samuel 17:45'],
  ['Moses', 'He Will Fight For You', 'When I felt completely overwhelmed, this scripture became my anchor. The Lord will fight for you.', 'Exodus 14:14'],
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [stories, setStories] = useState([]);
  const [featuredPromotion, setFeaturedPromotion] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [charactersResponse, storiesResponse, promotionResponse] = await Promise.all([
          characterAPI.getAll(),
          storyAPI.getApproved(),
          promotionAPI.getFeatured().catch(() => ({ data: null })),
        ]);
        setCharacters((charactersResponse.data || []).slice(0, 3));
        setStories((storiesResponse.data || []).slice(0, 3));
        setFeaturedPromotion(promotionResponse.data || null);
      } catch (error) {
        console.error('Landing data failed:', error);
      }
    }
    load();
  }, []);

  const storyCards = useMemo(() => {
    if (stories.length) return stories;
    return fallbackStories.map(([character_name, story_title, story_content, bible_reference], index) => ({
      id: `fallback-${index}`,
      character_name,
      story_title,
      story_content,
      bible_reference,
      profiles: null,
      placeholder: true,
    }));
  }, [stories]);

  function handleNewsletter(event) {
    event.preventDefault();
    setEmail('');
    toast.success("Thank you! You're on the list. ✝");
  }

  return (
    <main className="overflow-hidden bg-[#0A0505] text-[#FDF5F0]">
      <section className="relative flex h-screen items-center overflow-hidden">
        <img src={assetUrl('/Img/faith-heroes-brand-hero.png')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0505]/95 via-[#0A0505]/70 to-[#0A0505]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0505] via-transparent to-[#0A0505]/30" />
        <div className="landing-grain absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0A0505] to-transparent" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#0A0505]/80 to-transparent" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl items-center px-6 text-center md:text-left">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 rounded-full border border-[#E05555]/40 bg-[#8B1A1A]/30 px-4 py-1.5 text-xs text-[#E05555]">
              ✝ Bible Stories · Real Lives · Lasting Faith
            </motion.div>
            <h1 className="mt-6 font-display text-[15vw] font-black leading-[0.85] tracking-[-0.03em] text-[#FDF5F0] sm:text-[12vw] md:text-[10vw] lg:text-[8.5vw]">
              <WordsPullUp text="Every Story." />
              <br />
              <WordsPullUp text="A Sacred Gift." className="text-[#C9A84C]" />
            </h1>
            <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.8 }} className="mt-5 max-w-lg text-sm leading-relaxed text-[#FDF5F0]/70 sm:text-base md:text-lg">
              Handcrafted Bible story gift boxes that bring Scripture to life — for children, families, and communities across the world.
            </motion.p>
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 1 }} className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              <button onClick={() => navigate('/shop')} className="group inline-flex items-center gap-2 rounded-full bg-[#8B1A1A] px-7 py-3.5 font-medium text-[#FDF5F0] transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#0A0505]">
                Explore the Shop <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </button>
              <button onClick={() => navigate('/share-kindness')} className="rounded-full border border-[#C9A84C]/50 px-7 py-3.5 text-[#C9A84C] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">
                Share a Story
              </button>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="text-[9px] tracking-widest text-[#FDF5F0]/30">SCROLL</span>
          <ChevronDown className="h-5 w-5 animate-bounce text-[#C9A84C]" />
        </div>
        <div className="landing-rotate absolute bottom-8 right-8 hidden h-20 w-20 items-center justify-center rounded-full border border-[#C9A84C]/20 text-[9px] uppercase tracking-widest text-[#C9A84C]/70 md:flex">
          ✝
        </div>
      </section>

      <PromotionBanner promotion={featuredPromotion} />

      <section className="relative overflow-hidden bg-[#0A0505] py-24">
        <BookOpen className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 text-[#FDF5F0] opacity-[0.02]" />
        <div className="mb-16 text-center">
          <Label>Heroes of Scripture</Label>
          <h2 className="mt-4 font-display text-4xl font-bold text-[#FDF5F0] md:text-6xl"><WordsPullUp text="Meet the Heroes of Faith" /></h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[#FDF5F0]/60 md:text-base">Each gift box tells the story of a Bible hero — beautifully crafted, biblically grounded.</p>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
          {characters.length ? characters.map((character, index) => <CharacterGiftCard key={character.id} character={character} index={index} />) : [0, 1, 2].map(i => <div key={i} className="h-[420px] animate-pulse rounded-2xl border border-[#8B1A1A]/20 bg-[#180C0C]" />)}
        </div>
        <div className="mt-12 text-center">
          <button onClick={() => navigate('/shop')} className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/40 px-8 py-3 font-medium text-[#C9A84C] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">
            View Full Collection <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <PromotionsSection />

      <section className="bg-[#0D0606] py-24">
        <div className="mb-16 text-center">
          <Label gold>What's Inside Every Box</Label>
          <h2 className="mt-4 font-display text-4xl font-bold text-[#FDF5F0] md:text-6xl"><WordsPullUp text="Five Pieces of Living Faith" /></h2>
          <p className="mx-auto mt-4 max-w-md text-center text-sm text-[#FDF5F0]/60">Every box is a complete world — handcrafted, meaningful, and built to be treasured.</p>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="flex min-h-[520px] flex-col justify-between rounded-2xl border border-[#8B1A1A]/30 bg-[#180C0C] p-8 transition duration-500 hover:border-[#C9A84C]/40 lg:col-span-2">
            <span className="inline-block w-fit rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-2 py-1 text-[9px] text-[#C9A84C]">Signature Piece</span>
            <div className="flex flex-1 items-center justify-center py-5">
              <img src={assetUrl('/Img/cross-keychain-signature-item.png')} alt="Cross keychain signature item" className="landing-float h-full max-h-[390px] w-full rounded-xl object-contain" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-[#FDF5F0]">Chibi 3D Vinyl Figure</h3>
              <p className="mt-2 text-sm text-[#FDF5F0]/60">Hand-painted collector figure. Each character unique.</p>
              <div className="mt-4 h-0.5 w-8 bg-[#C9A84C]" />
            </div>
          </motion.div>
          <div className="grid grid-cols-2 gap-4">
            {showcaseItems.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="rounded-xl border border-[#8B1A1A]/20 bg-[#180C0C] p-5 transition hover:border-[#C9A84C]/30">
                <item.icon size={32} className="text-[#C9A84C]" />
                <h3 className="mt-4 text-sm font-semibold text-[#FDF5F0]">{item.title} {item.badge && <span className="rounded-full bg-[#E05555] px-1.5 py-0.5 text-[8px] text-white">{item.badge}</span>}</h3>
                <p className="mt-1 text-xs text-[#FDF5F0]/50">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-center gap-8 border-t border-[#8B1A1A]/20 px-6 pt-8 text-xs text-[#FDF5F0]/50">
          <span className="inline-flex items-center gap-2"><Shield size={15} />100% Handcrafted</span>
          <span className="inline-flex items-center gap-2"><Heart size={15} />Faith-Driven</span>
          <span className="inline-flex items-center gap-2"><Package size={15} />UK Shipped</span>
        </div>
      </section>

      <section className="overflow-hidden bg-[#0A0505] py-20">
        <p className="mb-10 text-center text-[10px] uppercase tracking-widest text-[#C9A84C]">See It Come to Life</p>
        <div className="overflow-x-hidden">
          <div className="landing-scroll-strip flex w-max gap-4 px-6">
            {videoShowcaseItems.map(([badge, title, image], index) => (
              <div key={`${title}-${index}`} className="group relative h-[420px] w-72 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-[#8B1A1A]/30 bg-gradient-to-b from-[#2A1010] to-[#0A0505] transition hover:border-[#C9A84C]/40 sm:w-80">
                <img src={assetUrl(image)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0505] via-[#0A0505]/35 to-[#180C0C]/15" />
                <div className="relative z-10 flex h-full flex-col items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#FDF5F0]/40 bg-[#8B1A1A]/75 text-[#FDF5F0] shadow-[0_0_30px_rgba(139,26,26,0.45)] backdrop-blur-sm"><PlayCircle size={28} /></div>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="rounded-full bg-[#8B1A1A]/85 px-2 py-1 text-[9px] text-[#FDF5F0] backdrop-blur-sm">{badge}</span>
                  <h3 className="mt-2 font-display text-lg font-bold text-[#FDF5F0]">{title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-radial bg-[#0D0606] py-24">
        <div className="mb-16 text-center">
          <Label>The Journey</Label>
          <h2 className="mt-4 font-display text-4xl font-bold text-[#FDF5F0] md:text-5xl"><WordsPullUp text="From Story to Doorstep" /></h2>
        </div>
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-[25%] right-[25%] top-8 hidden h-px bg-gradient-to-r from-transparent via-[#8B1A1A]/40 to-transparent lg:block" />
          {steps.map((step, index) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }} className="relative text-center">
              <span className="absolute right-1/3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#C9A84C] text-[10px] font-bold text-[#0A0505]">{index + 1}</span>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#8B1A1A]/50 bg-[#180C0C] transition hover:border-[#C9A84C]/50">
                <step.icon size={26} className="text-[#E05555]" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-[160px] text-xs leading-relaxed text-[#FDF5F0]/60">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-[#0A0505] py-24">
        <div className="mb-16 text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#C9A84C]">Families Are Saying</p>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Stories That Move Hearts</h2>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
          {testimonials.map(([name, location, quote], index) => (
            <motion.article key={name} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }} className="rounded-2xl border border-[#8B1A1A]/25 bg-[#180C0C] p-7 transition hover:border-[#C9A84C]/30">
              <p className="font-display text-6xl leading-none text-[#C9A84C]/30">"</p>
              <p className="font-display text-sm italic leading-relaxed text-[#FDF5F0]/80">{quote}</p>
              <div className="mt-4 flex gap-0.5">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={14} className="fill-[#C9A84C] text-[#C9A84C]" />)}</div>
              <div className="mt-5 flex items-center gap-3 border-t border-[#8B1A1A]/20 pt-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#8B1A1A] to-[#2A1010] text-sm font-bold text-[#C9A84C]">{name[0]}</div>
                <div><p className="text-sm font-medium">{name}</p><p className="text-xs text-[#FDF5F0]/50">{location}</p></div>
              </div>
            </motion.article>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-[#FDF5F0]/30">Testimonials are placeholders — real reviews will appear here after launch.</p>
      </section>

      <section className="relative overflow-hidden bg-[#0D0606] py-24">
        <div className="pointer-events-none absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,26,26,0.12)_0%,transparent_70%)]" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
          <div>
            <Label><Heart size={12} /> Share Kindness</Label>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl"><WordsPullUp text="Spread the Good News." /></h2>
            <p className="font-display text-4xl font-bold text-[#C9A84C] md:text-5xl">One Story at a Time.</p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[#FDF5F0]/70">FaithConnect is more than a shop. It's a movement. Share a Bible story, inspire a life, and help teach the Gospel to the world — one story at a time.</p>
            <div className="mt-8 flex gap-8">
              {['2,400+|Stories Shared', '48|Countries Reached', '100%|Community Driven'].map(item => {
                const [value, label] = item.split('|');
                return <div key={label}><p className="font-display text-3xl font-bold text-[#C9A84C]">{value}</p><p className="mt-1 text-xs text-[#FDF5F0]/50">{label}</p></div>;
              })}
            </div>
            <p className="mt-2 text-[9px] text-[#FDF5F0]/20">*Projected targets — community growing daily</p>
            <button onClick={() => navigate('/share-kindness')} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8B1A1A] px-7 py-3.5 font-medium text-[#FDF5F0] transition hover:bg-[#E05555]">
              Join the Movement <ArrowRight size={16} />
            </button>
          </div>
          <div>
            {storyCards.slice(0, 2).map(story => (
              <div key={story.id} className="mb-3 rounded-xl border border-[#8B1A1A]/20 bg-[#180C0C] p-5 transition hover:border-[#C9A84C]/20">
                <p className="text-xs text-[#C9A84C]">{story.character_name}</p>
                <h3 className="mt-1 font-display text-lg font-bold">{story.story_title}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#FDF5F0]/60">{story.story_content}</p>
              </div>
            ))}
            <button onClick={() => navigate('/share-kindness')} className="mt-4 w-full text-center text-sm text-[#C9A84C] underline-offset-4 hover:underline">Read All Stories</button>
          </div>
        </div>
      </section>

      <section className="bg-[#0A0505] py-20">
        <div className="mb-12 text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#C9A84C]">Community</p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Latest from the Community</h2>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 md:grid-cols-3">
          {storyCards.slice(0, 3).map((story, index) => (
            <motion.article key={story.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }} className="overflow-hidden rounded-2xl border border-[#8B1A1A]/20 bg-[#180C0C] transition hover:border-[#C9A84C]/25">
              <div className="h-1.5 bg-gradient-to-r from-[#8B1A1A] to-[#C9A84C]" />
              <div className="p-5">
                <span className="rounded-full border border-[#E05555]/20 bg-[#8B1A1A]/20 px-2 py-1 text-[9px] text-[#E05555]">{story.character_name}</span>
                <h3 className="mt-3 font-display text-base font-bold">{story.story_title}</h3>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#FDF5F0]/60">{story.story_content}</p>
                <p className="mt-3 inline-flex items-center gap-1 text-[9px] text-[#C9A84C]"><BookOpen size={10} />{story.bible_reference}</p>
                <div className="mt-4 flex items-center justify-between border-t border-[#8B1A1A]/15 pt-4 text-[9px] text-[#FDF5F0]/35"><span>Anonymous</span><span>{story.placeholder ? 'Placeholder story' : 'Community story'}</span></div>
              </div>
            </motion.article>
          ))}
        </div>
        <div className="mt-10 text-center"><button onClick={() => navigate('/share-kindness')} className="rounded-full border border-[#8B1A1A]/50 px-6 py-3 text-sm text-[#FDF5F0]/70 transition hover:border-[#C9A84C] hover:text-[#C9A84C]">Share Your Story</button></div>
      </section>

      <section className="border-y border-[#8B1A1A]/25 bg-[#180C0C] py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ShoppingBag size={28} className="mx-auto mb-4 text-[#C9A84C]" />
          <h2 className="font-display text-3xl font-bold md:text-4xl">Be First to Know</h2>
          <p className="mt-3 text-sm text-[#FDF5F0]/60">New characters, community stories, and exclusive offers — delivered straight to your inbox.</p>
          <form onSubmit={handleNewsletter} className="mx-auto mt-8 flex max-w-md gap-3">
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="Your email address" className="flex-1 rounded-full border border-[#8B1A1A]/40 bg-[#0A0505] px-5 py-3.5 text-sm text-[#FDF5F0] placeholder:text-[#FDF5F0]/30 focus:border-[#C9A84C] focus:outline-none" />
            <button className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#C9A84C] px-6 py-3.5 text-sm font-medium text-[#0A0505] transition hover:bg-[#E8C97A]">Join Us <Mail size={15} /></button>
          </form>
          <p className="mt-4 text-[10px] text-[#FDF5F0]/30">No spam. Unsubscribe anytime. We respect your inbox.</p>
        </div>
      </section>
    </main>
  );
}
