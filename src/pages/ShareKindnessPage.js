import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Crown,
  Gift,
  Handshake,
  Heart,
  Lock,
  Mail,
  MessageCircle,
  PenLine,
  Share2,
  ShoppingBag,
  Star,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { storyAPI, uploadAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const ease = [0.16, 1, 0.3, 1];

function WordsPullUp({ text, className = '', delay = 0 }) {
  return (
    <span className={className}>
      {text.split(' ').map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="mr-[0.18em] inline-block"
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.78, delay: delay + index * 0.08, ease }}
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

function CrossIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path fill="currentColor" d="M13.6 3h4.8v8.8H26v4.8h-7.6V29h-4.8V16.6H6v-4.8h7.6V3Z" />
    </svg>
  );
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const gospelCards = [
  {
    icon: Heart,
    title: 'God Loves You',
    body: 'Before the world began, God knew you by name. Every Bible story begins with His unconditional love for every person He has created.',
    ref: 'John 3:16',
  },
  {
    icon: AlertCircle,
    title: 'We All Fell Short',
    body: 'Every hero in our collection faced failure, fear, and imperfection. Like them, all of us have fallen short of the glory of God.',
    ref: 'Romans 3:23',
  },
  {
    icon: Star,
    title: 'Jesus Made a Way',
    body: 'God did not leave us there. He sent His Son Jesus, the greatest story ever told, to take our place and restore what was broken.',
    ref: 'Romans 5:8',
  },
  {
    icon: ArrowRight,
    title: 'Respond & Live',
    body: 'Like David, Noah, and Moses, we are invited to trust God and step into the story He has written for each of our lives.',
    ref: 'Romans 10:9',
  },
];

const ways = [
  {
    icon: BookOpen,
    title: 'Share a Story',
    body: 'Write about a Bible character that changed your life. Tell us what you learned, how it moved you, and what it means to you today.',
    cta: 'Write Your Story',
    action: 'submit-story',
  },
  {
    icon: Gift,
    title: 'Give a Box',
    body: 'Buy a Faith Heroes gift box for someone who needs encouragement. Every box is a message of hope that someone will treasure forever.',
    cta: 'Shop Gift Boxes',
    href: '/shop',
  },
  {
    icon: Share2,
    title: 'Spread the Word',
    body: "Share our mission on social media. Tell your church. Recommend us to a Sunday school teacher. The simplest act of sharing could change someone's faith journey.",
    cta: 'Share on Social',
    modal: 'share',
  },
];

const helpCards = [
  {
    icon: Heart,
    title: 'Pray for Us',
    body: 'Prayer is the foundation of everything we do. Join us in praying for our community, our team, and the families we serve.',
    cta: 'Join the Prayer List',
    modal: 'prayer-list',
  },
  {
    icon: Handshake,
    title: 'Partner with Us',
    body: 'Churches, schools, and organisations - we offer wholesale pricing and custom boxes for community and educational use.',
    cta: 'Enquire Now',
    href: '/contact?subject=Partnership',
  },
  {
    icon: Users,
    title: 'Volunteer',
    body: 'Help us review stories, translate content, or support our growing community. Every skill has a place in this mission.',
    cta: 'Get Involved',
    href: '/contact?subject=Volunteer',
  },
];

const fallbackStories = [
  {
    id: 'placeholder-noah',
    character_name: 'Noah',
    story_title: 'God Keeps His Promises',
    story_content: 'This story reminds me that no matter how big the task God calls us to, He equips us with everything we need. Noah obeyed before he understood everything, and that kind of faith still challenges me today.',
    bible_reference: 'Genesis 6:22',
    placeholder: true,
  },
  {
    id: 'placeholder-david',
    character_name: 'David',
    story_title: 'Facing My Goliath',
    story_content: 'I was going through the hardest season of my life when I read this story. It gave me courage to stand, pray, and believe that the battle belongs to the Lord.',
    bible_reference: '1 Samuel 17:45',
    placeholder: true,
  },
  {
    id: 'placeholder-moses',
    character_name: 'Moses',
    story_title: 'He Will Fight For You',
    story_content: 'When I felt completely overwhelmed, this scripture became my anchor. The Lord will fight for you; you need only to be still.',
    bible_reference: 'Exodus 14:14',
    placeholder: true,
  },
];

function relativeDate(value) {
  if (!value) return 'Recently';
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.max(0, Math.floor(diff / 86400000));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

function StatCard({ number, suffix = '', label, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const duration = 2000;
    const started = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min(1, (Date.now() - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(number * eased));
      if (progress >= 1) clearInterval(timer);
    }, 32);
    return () => clearInterval(timer);
  }, [inView, number]);

  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="relative text-center">
      <p className="font-display text-5xl font-black leading-none text-[#C9A84C] md:text-6xl">
        {count.toLocaleString()}<span className="text-[#E05555]">{suffix}</span>
      </p>
      <p className="mt-3 text-sm leading-tight text-[#FDF5F0]/60">{label}</p>
      {index < 3 && <span className="absolute right-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-[#8B1A1A]/30 lg:block" />}
    </motion.div>
  );
}

function StoryCard({ story, index }) {
  const [expanded, setExpanded] = useState(false);
  const content = story.story_content || '';
  const shouldTrim = content.length > 200;
  const shown = expanded || !shouldTrim ? content : `${content.slice(0, 200)}...`;
  const author = story.anonymous ? 'Anonymous' : story.profiles?.full_name || 'Anonymous';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-[#8B1A1A]/20 bg-[#180C0C] transition duration-300 hover:border-[#C9A84C]/25"
    >
      <div className="h-1 bg-gradient-to-r from-[#8B1A1A] to-[#C9A84C]" />
      {story.submitted_image_url && <img src={story.submitted_image_url} alt={story.story_title} className="h-40 w-full object-cover" />}
      <div className="p-5">
        <span className="inline-block rounded-full border border-[#E05555]/20 bg-[#8B1A1A]/20 px-2 py-1 text-[9px] text-[#E05555]">{story.character_name || 'Bible Story'}</span>
        <h3 className="mt-3 font-display text-lg font-bold leading-tight text-[#FDF5F0]">{story.story_title}</h3>
        <p className="mt-3 text-xs leading-relaxed text-[#FDF5F0]/65">{shown}</p>
        {shouldTrim && (
          <button onClick={() => setExpanded(value => !value)} className="mt-2 text-xs text-[#C9A84C] underline-offset-4 hover:underline">
            {expanded ? 'Show Less' : 'Read More'}
          </button>
        )}
        <p className="mt-4 flex items-center gap-1.5 text-[10px] text-[#C9A84C]">
          <BookOpen size={11} /> {story.bible_reference || 'Scripture'}
        </p>
        {story.placeholder && <p className="mt-3 text-right text-[9px] text-[#FDF5F0]/15">Placeholder - real stories load from database</p>}
        <div className="mt-4 flex items-center justify-between border-t border-[#8B1A1A]/15 pt-4">
          <span className="text-[9px] text-[#FDF5F0]/40">{author}</span>
          <span className="text-[9px] text-[#FDF5F0]/30">{relativeDate(story.created_at)}</span>
        </div>
      </div>
    </motion.article>
  );
}

export default function ShareKindnessPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [activeFilter, setActiveFilter] = useState('All Stories');
  const [expandedModal, setExpandedModal] = useState(null);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState({
    character_name: '',
    bible_reference: '',
    story_title: '',
    story_content: '',
    submitted_image_url: '',
    anonymous: true,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Share Kindness - Faith Heroes';

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = 'Share your Bible story with the world. Join a growing community of faith-driven storytellers spreading the Gospel one story at a time.';

    storyAPI.getApproved()
      .then(response => setStories(response.data || []))
      .catch(error => {
        console.error('Stories failed:', error);
        setStories([]);
      });
  }, []);

  const storySource = stories.length ? stories : fallbackStories;
  const filters = useMemo(() => {
    const names = Array.from(new Set(storySource.map(story => story.character_name).filter(Boolean)));
    return ['All Stories', ...names.filter(name => ['Noah', 'David', 'Moses', 'Esther'].includes(name)), ...names.filter(name => !['Noah', 'David', 'Moses', 'Esther'].includes(name))].slice(0, 8);
  }, [storySource]);

  const filteredStories = useMemo(() => {
    if (activeFilter === 'All Stories') return storySource;
    return storySource.filter(story => (story.character_name || '').toLowerCase() === activeFilter.toLowerCase());
  }, [activeFilter, storySource]);

  const visibleStories = filteredStories.slice(0, visibleCount);

  function updateForm(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  async function handleImage(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setUploading(true);
    setImagePreview(URL.createObjectURL(file));
    try {
      const response = await uploadAPI.uploadStoryImage(file);
      updateForm('submitted_image_url', response.url || response.data?.url || '');
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.message || 'Image upload failed');
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.character_name || !form.bible_reference || !form.story_title || !form.story_content) {
      toast.error('Please complete the required fields');
      return;
    }
    setSubmitting(true);
    try {
      await storyAPI.submit(form);
      setSuccess(true);
      setForm({ character_name: '', bible_reference: '', story_title: '', story_content: '', submitted_image_url: '', anonymous: true });
      setImagePreview('');
      toast.success('Thank you. Your story has been submitted for review.');
    } catch (error) {
      toast.error(error.message || 'Story submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  function copyShareMessage() {
    const message = 'I just discovered Faith Heroes - handcrafted Bible story gift boxes that bring Scripture to life. Check it out: faithheroes.co.uk #FaithHeroes';
    navigator.clipboard?.writeText(message);
    toast.success('Share message copied');
  }

  return (
    <main className="overflow-hidden bg-[#0A0505] text-[#FDF5F0]">
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden bg-gradient-to-br from-[#1A0505] via-[#0A0505] to-[#0D0808]">
        <div className="landing-grain absolute inset-0 opacity-[0.06]" />
        <Heart className="pointer-events-none absolute -right-10 -top-10 h-96 w-96 text-[#C9A84C] opacity-[0.04]" />
        <CrossIcon className="pointer-events-none absolute -bottom-10 -left-10 h-64 w-64 text-[#FDF5F0] opacity-[0.03]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0505] to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6 flex items-center gap-2 text-xs text-[#FDF5F0]/40">
            <Link to="/" className="transition hover:text-[#C9A84C]">Home</Link>
            <ChevronRight size={12} />
            <span>Share Kindness</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Label><Heart size={13} /> Community - Faith - Kindness</Label>
          </motion.div>
          <h1 className="mt-5 font-display text-5xl font-black leading-[0.88] tracking-[-0.03em] text-[#FDF5F0] sm:text-6xl md:text-7xl lg:text-8xl">
            <WordsPullUp text="Spread the Good News." delay={0.3} />
            <br />
            <WordsPullUp text="One Story at a Time." delay={0.5} className="text-[#C9A84C]" />
          </h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, ease }} className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[#FDF5F0]/70 md:text-base">
            FaithConnect is more than a shop. It is a movement. Share a Bible story, teach the Gospel, inspire a life, and help carry the Good News to every corner of the world.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, ease }} className="mt-8 flex flex-wrap justify-center gap-4">
            <button onClick={() => scrollToId('submit-story')} className="inline-flex items-center gap-2 rounded-full bg-[#8B1A1A] px-7 py-3.5 font-medium text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">
              <PenLine size={18} /> Share Your Story
            </button>
            <button onClick={() => scrollToId('stories-feed')} className="rounded-full border border-[#C9A84C]/50 px-7 py-3.5 text-[#C9A84C] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">
              Read Community Stories
            </button>
          </motion.div>
          <ChevronDown className="absolute bottom-8 h-6 w-6 animate-bounce text-[#C9A84C]" />
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0D0606] py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(201,168,76,0.06)_0%,transparent_65%)]" />
        <div className="relative mb-16 px-6 text-center">
          <Label gold>The Gospel</Label>
          <h2 className="mt-4 font-display text-4xl font-bold text-[#FDF5F0] md:text-5xl"><WordsPullUp text="What Is the Good News?" /></h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#FDF5F0]/70 md:text-base">
            The Gospel, the Good News, is the message at the heart of every Bible story we tell. It is the story of a God who loves the world so much that He sent His Son to redeem it.
          </p>
        </div>
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 md:grid-cols-2 lg:grid-cols-4">
          {gospelCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article key={card.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.12 }} className="rounded-2xl border border-[#8B1A1A]/20 bg-[#180C0C] p-7 text-center transition duration-300 hover:border-[#C9A84C]/30">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#8B1A1A]/40 bg-[#8B1A1A]/20"><Icon size={22} className="text-[#C9A84C]" /></div>
                <p className="mt-4 font-display text-5xl font-black leading-none text-[#C9A84C]/30">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-3 font-display text-lg font-bold text-[#FDF5F0]">{card.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-[#FDF5F0]/60">{card.body}</p>
                <p className="mt-4 text-[10px] text-[#C9A84C]">{card.ref}</p>
              </motion.article>
            );
          })}
        </div>
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-[#8B1A1A]/30 bg-[#8B1A1A]/10 p-8 text-center">
          <div className="font-display text-7xl leading-none text-[#C9A84C]/20">"</div>
          <p className="font-display text-xl italic leading-relaxed text-[#FDF5F0] md:text-2xl">For God so loved the world that He gave His one and only Son, that whoever believes in Him shall not perish but have eternal life.</p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-[#C9A84C]"><CrossIcon className="h-3 w-3" /> John 3:16</p>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-[#FDF5F0]/60">Would you like to know more about the Gospel?</p>
          <button onClick={() => setPrayerOpen(true)} className="mt-2 text-sm text-[#C9A84C] underline-offset-4 hover:underline">Start Here -&gt;</button>
        </div>
      </section>

      <section className="bg-[#0A0505] py-24">
        <div className="mb-16 px-6 text-center">
          <Label>Get Involved</Label>
          <h2 className="mt-4 font-display text-4xl font-bold text-[#FDF5F0] md:text-5xl"><WordsPullUp text="Three Ways to Share" /></h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-[#FDF5F0]/60">You do not have to be a theologian or a writer. You just have to be willing.</p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
          {ways.map((way, index) => {
            const Icon = way.icon;
            return (
              <motion.article key={way.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: index * 0.15 }} className="overflow-hidden rounded-2xl border border-[#8B1A1A]/20 bg-[#180C0C] transition duration-500 hover:border-[#C9A84C]/30">
                <div className="h-1 bg-gradient-to-r from-[#8B1A1A] to-[#C9A84C]" />
                <div className="p-7">
                  <p className="font-display text-6xl font-black leading-none text-[#C9A84C]/15">{String(index + 1).padStart(2, '0')}</p>
                  <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#8B1A1A]/40 bg-[#8B1A1A]/20"><Icon size={24} className="text-[#E05555]" /></div>
                  <h3 className="mt-5 font-display text-xl font-bold text-[#FDF5F0]">{way.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#FDF5F0]/60">{way.body}</p>
                  <button onClick={() => way.href ? navigate(way.href) : way.modal ? setExpandedModal(way.modal) : scrollToId(way.action)} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#C9A84C] transition-all hover:gap-3">
                    {way.cta} <ArrowRight size={14} />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="submit-story" className="relative bg-[#0D0606] py-24">
        <div className="landing-grain absolute inset-0 opacity-[0.05]" />
        <div className="relative mb-14 px-6 text-center">
          <Label>Your Story Matters</Label>
          <h2 className="mt-4 font-display text-4xl font-bold text-[#FDF5F0] md:text-5xl"><WordsPullUp text="Share Your Bible Story" /></h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-[#FDF5F0]/60">Every story submitted is reviewed by our team and shared with the community. You can submit anonymously.</p>
        </div>

        {!user ? (
          <div className="relative mx-auto max-w-lg rounded-2xl border border-[#8B1A1A]/30 bg-[#180C0C] p-10 text-center">
            <Lock size={32} className="mx-auto text-[#C9A84C]" />
            <h3 className="mt-4 font-display text-2xl font-bold text-[#FDF5F0]">Sign In to Share</h3>
            <p className="mt-3 text-sm text-[#FDF5F0]/60">Create a free account to submit your story and join our growing community of faith.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate('/auth?redirect=/share-kindness')} className="rounded-full bg-[#8B1A1A] px-8 py-3 text-sm text-[#FDF5F0]">Sign In</button>
              <button onClick={() => navigate('/auth?redirect=/share-kindness')} className="rounded-full border border-[#C9A84C]/40 px-8 py-3 text-sm text-[#C9A84C]">Create Account</button>
            </div>
          </div>
        ) : success ? (
          <div className="relative mx-auto max-w-lg rounded-2xl border border-[#8B1A1A]/30 bg-[#180C0C] p-10 text-center">
            <CheckCircle size={48} className="mx-auto text-[#C9A84C]" />
            <h3 className="mt-4 font-display text-3xl font-bold text-[#FDF5F0]">Story Submitted</h3>
            <p className="mt-3 text-sm text-[#FDF5F0]/60">Thank you for sharing. Our team will review your story and publish it to the community shortly.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={() => setSuccess(false)} className="rounded-full border border-[#C9A84C]/40 px-6 py-3 text-sm text-[#C9A84C]">Submit Another Story</button>
              <button onClick={() => scrollToId('stories-feed')} className="rounded-full bg-[#8B1A1A] px-6 py-3 text-sm text-[#FDF5F0]">View Community Stories</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative mx-auto max-w-2xl rounded-2xl border border-[#8B1A1A]/30 bg-[#180C0C] p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Bible Character *" value={form.character_name} onChange={value => updateForm('character_name', value)} placeholder="e.g. Noah, David, Moses, Esther" />
              <Field label="Bible Reference *" value={form.bible_reference} onChange={value => updateForm('bible_reference', value)} placeholder="e.g. Genesis 6:22" />
            </div>
            <div className="mt-4"><Field label="Story Title *" value={form.story_title} onChange={value => updateForm('story_title', value)} placeholder="Give your story a meaningful title" /></div>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs text-[#FDF5F0]/70">Your Story *</span>
              <textarea rows={8} maxLength={2000} value={form.story_content} onChange={event => updateForm('story_content', event.target.value)} placeholder="Tell us how this Bible story or character has impacted your life. What did you learn? How did it change you? How does it point to the Gospel?" className="w-full resize-none rounded-xl border border-[#8B1A1A]/40 bg-[#0A0505] px-4 py-3 text-sm text-[#FDF5F0] placeholder:text-[#FDF5F0]/25 transition focus:border-[#C9A84C] focus:outline-none" />
              <span className="mt-1 block text-right text-xs text-[#FDF5F0]/30">{form.story_content.length} / 2000 characters</span>
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs text-[#FDF5F0]/70">Upload an Image (optional)</span>
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={event => handleImage(event.target.files?.[0])} />
              <div className="cursor-pointer rounded-xl border-2 border-dashed border-[#8B1A1A]/40 bg-[#0A0505] p-8 text-center transition hover:border-[#C9A84C]/40">
                {imagePreview ? (
                  <div>
                    <img src={imagePreview} alt="Story preview" className="mx-auto h-32 rounded-xl object-cover" />
                    <button type="button" onClick={event => { event.preventDefault(); setImagePreview(''); updateForm('submitted_image_url', ''); }} className="mt-3 text-xs text-[#E05555]">Remove</button>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="mx-auto text-[#C9A84C]/40" />
                    <p className="mt-2 text-xs text-[#FDF5F0]/40">{uploading ? 'Uploading...' : 'Drop an image here or click to browse'}</p>
                    <p className="mt-1 text-[10px] text-[#FDF5F0]/20">JPG, PNG up to 5MB</p>
                  </>
                )}
              </div>
            </label>
            <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <button type="button" onClick={() => updateForm('anonymous', !form.anonymous)} className="flex items-center gap-3 text-left">
                <span className={`flex h-6 w-11 items-center rounded-full p-1 transition ${form.anonymous ? 'bg-[#8B1A1A]' : 'bg-[#0A0505] border border-[#8B1A1A]/40'}`}>
                  <span className={`h-4 w-4 rounded-full bg-[#FDF5F0] transition ${form.anonymous ? 'translate-x-5' : ''}`} />
                </span>
                <span><span className="block text-sm text-[#FDF5F0]/60">Submit anonymously</span><span className="block text-[10px] text-[#FDF5F0]/30">Your name will not be shown publicly</span></span>
              </button>
              <button type="button" onClick={() => setGuidelinesOpen(true)} className="text-xs text-[#C9A84C] underline-offset-4 hover:underline">Read our community guidelines -&gt;</button>
            </div>
            <button disabled={submitting || uploading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#8B1A1A] py-4 font-medium text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505] disabled:opacity-60">
              <PenLine size={18} /> {submitting ? 'Submitting...' : 'Submit Your Story'}
            </button>
          </form>
        )}
      </section>

      <section id="stories-feed" className="bg-[#0A0505] py-24">
        <div className="mb-14 px-6 text-center">
          <Label>The Community</Label>
          <h2 className="mt-4 font-display text-4xl font-bold text-[#FDF5F0] md:text-5xl"><WordsPullUp text="Stories from Around the World" /></h2>
          <p className="mt-4 text-sm text-[#FDF5F0]/60">Real stories, real lives, real faith.</p>
        </div>
        <div className="mb-10 flex flex-wrap justify-center gap-3 px-6">
          {filters.map(filter => (
            <button key={filter} onClick={() => { setActiveFilter(filter); setVisibleCount(6); }} className={`rounded-full px-4 py-2 text-sm transition ${activeFilter === filter ? 'bg-[#8B1A1A] text-[#FDF5F0]' : 'border border-[#8B1A1A]/30 text-[#FDF5F0]/50 hover:border-[#8B1A1A]/60 hover:text-[#FDF5F0]/70'}`}>
              {filter}
            </button>
          ))}
        </div>
        {visibleStories.length ? (
          <>
            <div className="mx-auto max-w-6xl columns-1 gap-5 px-6 md:columns-2 lg:columns-3">
              {visibleStories.map((story, index) => <StoryCard key={story.id || index} story={story} index={index} />)}
            </div>
            {visibleCount < filteredStories.length && (
              <div className="mt-10 text-center">
                <button onClick={() => setVisibleCount(count => count + 6)} className="rounded-full border border-[#8B1A1A]/40 px-8 py-3 text-sm text-[#FDF5F0]/60 transition hover:border-[#C9A84C]/40 hover:text-[#C9A84C]">Load More Stories</button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <BookOpen size={48} className="mx-auto text-[#C9A84C]/30" />
            <p className="mt-4 text-sm text-[#FDF5F0]/40">No stories yet - be the first!</p>
            <button onClick={() => scrollToId('submit-story')} className="mt-5 rounded-full bg-[#8B1A1A] px-6 py-3 text-sm text-[#FDF5F0]">Share Your Story</button>
          </div>
        )}
      </section>

      <section className="relative bg-[#0D0606] bg-gradient-to-r from-[#8B1A1A]/5 via-transparent to-[#8B1A1A]/5 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-12 text-center text-[10px] uppercase tracking-widest text-[#C9A84C]">Our Growing Impact</p>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <StatCard number={2400} suffix="+" label="Stories Shared Worldwide" index={0} />
            <StatCard number={48} label="Countries Reached" index={1} />
            <StatCard number={100} suffix="%" label="Community Driven" index={2} />
            <StatCard number={3} label="Bible Heroes Available Now" index={3} />
          </div>
          <p className="mt-8 text-center text-[9px] text-[#FDF5F0]/20">* Some figures represent projected targets. Real data will replace these as the community grows.</p>
          <div className="mt-12 border-y border-[#8B1A1A]/20 py-8 text-center">
            <p className="font-display text-lg italic text-[#FDF5F0]/70 md:text-xl">How beautiful are the feet of those who bring good news!</p>
            <p className="mt-2 text-sm text-[#C9A84C]">- Romans 10:15</p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0A0505] py-24">
        <div className="landing-grain absolute inset-0 opacity-[0.05]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,26,26,0.12)_0%,transparent_65%)]" />
        <div className="relative mb-20">
          <div className="mb-12 px-6 text-center">
            <Label>Beyond Stories</Label>
            <h2 className="mt-4 font-display text-3xl font-bold text-[#FDF5F0] md:text-4xl">Other Ways to Help</h2>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 px-6 sm:grid-cols-3">
            {helpCards.map(card => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="rounded-2xl border border-[#8B1A1A]/20 bg-[#180C0C] p-6 text-center transition hover:border-[#C9A84C]/25">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#8B1A1A]/30 bg-[#8B1A1A]/20"><Icon size={20} className="text-[#E05555]" /></div>
                  <h3 className="mt-4 font-display text-lg font-bold text-[#FDF5F0]">{card.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-[#FDF5F0]/60">{card.body}</p>
                  <button onClick={() => card.href ? navigate(card.href) : setExpandedModal(card.modal)} className="mt-4 inline-flex items-center justify-center gap-1 text-xs text-[#C9A84C] transition-all hover:gap-2">
                    {card.cta} <ArrowRight size={12} />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Crown size={36} className="mx-auto mb-6 text-[#C9A84C]" />
          <h2 className="font-display text-5xl font-black leading-[0.88] tracking-[-0.02em] text-[#FDF5F0] md:text-7xl">
            <WordsPullUp text="Every Story Changes" />
            <br />
            <WordsPullUp text="Everything." className="text-[#C9A84C]" />
          </h2>
          <div className="mx-auto mt-6 h-0.5 w-20 bg-[#C9A84C]" />
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#FDF5F0]/70">You do not need a platform. You do not need a theology degree. You just need a story and the courage to share it.</p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <button onClick={() => scrollToId('submit-story')} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8B1A1A] px-8 py-4 font-medium text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505]"><PenLine size={18} /> Share Your Story Now</button>
            <button onClick={() => navigate('/shop')} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#C9A84C]/50 px-8 py-4 text-[#C9A84C] transition hover:bg-[#C9A84C] hover:text-[#0A0505]"><ShoppingBag size={18} /> Explore the Shop</button>
          </div>
          <div className="mt-16 text-center text-xs text-[#FDF5F0]/20">
            <p>Therefore go and make disciples of all nations</p>
            <p className="mt-1">- Matthew 28:19</p>
          </div>
        </div>
      </section>

      {prayerOpen && <PrayerModal onClose={() => setPrayerOpen(false)} onShare={() => { setPrayerOpen(false); scrollToId('submit-story'); }} />}
      {guidelinesOpen && <GuidelinesModal onClose={() => setGuidelinesOpen(false)} />}
      {expandedModal === 'share' && <ShareModal onClose={() => setExpandedModal(null)} onCopy={copyShareMessage} />}
      {expandedModal === 'prayer-list' && <SimpleModal title="Join the Prayer List" onClose={() => setExpandedModal(null)}>Prayer list signup will connect to the newsletter service. For now, use the footer newsletter form to stay connected.</SimpleModal>}
    </main>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-[#FDF5F0]/70">{label}</span>
      <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-[#8B1A1A]/40 bg-[#0A0505] px-4 py-3 text-sm text-[#FDF5F0] placeholder:text-[#FDF5F0]/25 transition focus:border-[#C9A84C] focus:outline-none" />
    </label>
  );
}

function ModalFrame({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0A0505]/95 px-4 backdrop-blur">
      <div className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#8B1A1A]/40 bg-[#180C0C] p-8">
        <button onClick={onClose} className="absolute right-4 top-4 text-[#FDF5F0]/50 hover:text-[#FDF5F0]"><X size={20} /></button>
        {children}
      </div>
    </div>
  );
}

function PrayerModal({ onClose, onShare }) {
  return (
    <ModalFrame onClose={onClose}>
      <h3 className="font-display text-2xl font-bold text-[#FDF5F0]">A Simple Prayer</h3>
      <p className="mt-4 rounded-xl border border-[#8B1A1A]/20 bg-[#0A0505] p-5 text-sm italic leading-relaxed text-[#FDF5F0]/80">
        Lord Jesus, I believe You are the Son of God. I believe You died for my sins and rose again. I turn from my sins and I invite You into my life. Thank You for forgiving me. I choose to follow You. Amen.
      </p>
      <p className="mt-4 text-xs leading-relaxed text-[#FDF5F0]/50">If you prayed this prayer, we would love to celebrate with you. Share your story with our community or reach out to us directly.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={onShare} className="rounded-full bg-[#C9A84C] px-5 py-3 text-sm font-medium text-[#0A0505]">Share My Story</button>
        <button onClick={onClose} className="rounded-full border border-[#FDF5F0]/20 px-5 py-3 text-sm text-[#FDF5F0]/70">Close</button>
      </div>
    </ModalFrame>
  );
}

function GuidelinesModal({ onClose }) {
  const rules = [
    'Stories must be based on real Bible characters or scriptures',
    'Keep content encouraging, truthful, and faith-building',
    'No spam, promotional content, or off-topic posts',
    'Stories may be edited slightly for grammar before publishing',
    'Submitting means you agree to our Terms of Service',
    'You can request removal of your story at any time',
  ];
  return (
    <ModalFrame onClose={onClose}>
      <h3 className="font-display text-2xl font-bold text-[#FDF5F0]">Community Guidelines</h3>
      <ul className="mt-5 space-y-3">
        {rules.map(rule => <li key={rule} className="flex items-start gap-3 text-sm text-[#FDF5F0]/70"><CrossIcon className="mt-1 h-3 w-3 flex-shrink-0 text-[#C9A84C]" /> {rule}</li>)}
      </ul>
    </ModalFrame>
  );
}

function ShareModal({ onClose, onCopy }) {
  const message = encodeURIComponent('I just discovered Faith Heroes - handcrafted Bible story gift boxes that bring Scripture to life. Check it out: faithheroes.co.uk #FaithHeroes');
  const url = encodeURIComponent('https://faithheroes.co.uk');
  const buttons = [
    ['WhatsApp', MessageCircle, `https://wa.me/?text=${message}`],
    ['Email', Mail, `mailto:?subject=Faith Heroes&body=${message}`],
    ['Copy Link', Copy, null],
  ];
  return (
    <ModalFrame onClose={onClose}>
      <h3 className="font-display text-2xl font-bold text-[#FDF5F0]">Share Faith Heroes</h3>
      <p className="mt-3 text-sm text-[#FDF5F0]/60">Send the mission to someone who might love it.</p>
      <div className="mt-6 grid gap-3">
        {buttons.map(([label, Icon, href]) => href ? (
          <a key={label} href={href.includes('mailto') ? href : `${href}&url=${url}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-[#8B1A1A]/30 px-4 py-3 text-sm text-[#FDF5F0]/75 transition hover:border-[#C9A84C]/40 hover:text-[#C9A84C]"><Icon size={17} /> {label}</a>
        ) : (
          <button key={label} onClick={onCopy} className="flex items-center justify-center gap-2 rounded-xl border border-[#8B1A1A]/30 px-4 py-3 text-sm text-[#FDF5F0]/75 transition hover:border-[#C9A84C]/40 hover:text-[#C9A84C]"><Icon size={17} /> {label}</button>
        ))}
      </div>
    </ModalFrame>
  );
}

function SimpleModal({ title, children, onClose }) {
  return (
    <ModalFrame onClose={onClose}>
      <h3 className="font-display text-2xl font-bold text-[#FDF5F0]">{title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-[#FDF5F0]/65">{children}</p>
    </ModalFrame>
  );
}
