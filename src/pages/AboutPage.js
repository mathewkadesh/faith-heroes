import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  Crown,
  Eye,
  Gift,
  Globe,
  Hammer,
  Heart,
  Image,
  ShoppingBag,
  Target,
  Users,
} from 'lucide-react';
import { assetUrl } from '../lib/assets';

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

function CrossWatermark({ className = '' }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <path fill="currentColor" d="M86 20h28v54h46v28h-46v78H86v-78H40V74h46V20Z" />
    </svg>
  );
}

function ImageSlot({ title, note, src, tall = false, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.15 }}
      className={`overflow-hidden rounded-2xl border border-[#8B1A1A]/30 bg-[#180C0C] ${tall ? 'row-span-2 h-full' : ''}`}
    >
      {src ? (
        <img src={assetUrl(src)} alt={title} className="h-full min-h-[250px] w-full object-cover" />
      ) : (
        <div className="flex h-full min-h-[250px] flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#2A1010] to-[#180C0C] px-4 text-center">
          <Image size={40} className="text-[#C9A84C]/30" />
          <p className="text-xs text-[#FDF5F0]/25">{title}</p>
          <p className="max-w-[180px] text-[10px] leading-relaxed text-[#FDF5F0]/15">{note}</p>
        </div>
      )}
    </motion.div>
  );
}

const missionBullets = [
  'Make every Bible story a treasured memory',
  'Build a global community of faith-driven storytellers',
  'Craft products that honour both God and the recipient',
];

const visionBullets = [
  'Faith Heroes boxes in homes across all 7 continents',
  'A community of 100,000+ story sharers by 2027',
  'The most trusted name in faith-based gift experiences',
];

const values = [
  {
    icon: Heart,
    title: 'Faith First',
    desc: 'Everything we create begins with prayer and purpose. Faith is not a feature - it is our foundation.',
  },
  {
    icon: Hammer,
    title: 'Authentic Craft',
    desc: "Every item in every box is chosen for quality, meaning, and longevity. We refuse to cut corners on anything that carries God's word.",
  },
  {
    icon: Users,
    title: 'Community',
    desc: 'We are stronger together. Our community of story sharers, buyers, and believers is the heartbeat of everything we do.',
  },
  {
    icon: Globe,
    title: 'Accessibility',
    desc: 'Faith should know no borders. We work to make our boxes available and affordable to families from all walks of life, in every nation.',
  },
  {
    icon: BookOpen,
    title: 'Storytelling',
    desc: 'Stories shape souls. We believe that a well-told story, whether written, spoken, or held in the hands, can change a life forever.',
  },
  {
    icon: Gift,
    title: 'Generosity',
    desc: 'A portion of every box sold goes toward funding Bible story resources for communities that cannot afford them.',
    badge: 'COMING SOON',
  },
];

const timeline = [
  ['2024 - Q4', 'The Idea Is Born', 'A conversation in a Bristol coffee shop sparked the question: what if a child could hold their favourite Bible story in their hands?'],
  ['2025 - Q1', 'First Prototypes', 'The first Noah and David gift boxes were hand-assembled at the kitchen table. Every item sourced, tested, and refined.'],
  ['2025 - Q2', 'Faith Heroes Launches', 'faithheroes.co.uk goes live. The first 50 boxes sell out in under a week. The movement begins.', 'KEY MILESTONE'],
  ['2025 - Q3', 'Community Grows', 'Over 500 stories submitted by the community. Families from 12 countries reach out. The Share Kindness programme launches.'],
  ['2025 - Q4', "What's Next", 'New characters, wholesale partnerships, and a giving programme to fund Bible resources for communities worldwide.', 'COMING SOON', true],
];

const team = [
  ['F', 'Founder & CEO', 'Founder & CEO', 'The vision behind Faith Heroes. A passionate believer and creative entrepreneur based in Bristol.'],
  ['D', 'Lead Designer', 'Creative Director', 'Responsible for the visual identity, character design, and every detail inside the gift boxes.'],
  ['C', 'Community Lead', 'Community & Stories', 'Curates the community stories and manages our growing network of faith-driven storytellers worldwide.'],
];

function MissionVisionCard({ icon: Icon, title, body, bullets, direction = 'left', delay = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, x: direction === 'left' ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease }}
      className="rounded-2xl border border-[#8B1A1A]/30 bg-[#180C0C] p-8 transition duration-500 hover:border-[#C9A84C]/30 md:p-10"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10">
        <Icon size={24} className="text-[#C9A84C]" />
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold text-[#FDF5F0]">{title}</h3>
      <div className="mt-3 h-0.5 w-10 bg-[#C9A84C]" />
      <p className="mt-5 text-sm leading-relaxed text-[#FDF5F0]/70">{body}</p>
      <div className="mt-6 space-y-3">
        {bullets.map(item => (
          <div key={item} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#8B1A1A]/60">
              <Check size={12} className="text-[#FDF5F0]" />
            </span>
            <p className="text-sm text-[#FDF5F0]/60">{item}</p>
          </div>
        ))}
      </div>
    </motion.article>
  );
}

export default function AboutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'About Us - Faith Heroes';

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = 'Learn the story behind Faith Heroes - a Bristol-based team creating handcrafted Bible story gift boxes for families and communities worldwide.';
  }, []);

  return (
    <main className="overflow-hidden bg-[#0A0505] text-[#FDF5F0]">
      <section className="relative h-[55vh] min-h-[420px] overflow-hidden bg-gradient-to-br from-[#1A0505] via-[#0A0505] to-[#150808]">
        <img src={assetUrl('/Img/bible-candle-story-background.png')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-[#0A0505]/55" />
        <div className="landing-grain absolute inset-0 opacity-[0.06]" />
        <CrossWatermark className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 text-[#FDF5F0] opacity-[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0505] to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6 flex items-center gap-2 text-xs text-[#FDF5F0]/40">
            <Link to="/" className="transition hover:text-[#C9A84C]">Home</Link>
            <ChevronRight size={12} />
            <span>About Us</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Label>Our Story</Label>
          </motion.div>
          <h1 className="mt-5 font-display text-5xl font-black leading-[0.88] tracking-[-0.03em] text-[#FDF5F0] sm:text-6xl md:text-7xl lg:text-8xl">
            <WordsPullUp text="Built on Faith." delay={0.3} />
            <br />
            <WordsPullUp text="Crafted with Love." delay={0.5} className="text-[#C9A84C]" />
          </h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, ease }} className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#FDF5F0]/70 md:text-base">
            We exist to bring Bible stories to life - not just as words on a page, but as treasured objects that families keep, share, and pass down through generations.
          </motion.p>
          <ChevronDown className="absolute bottom-8 h-6 w-6 animate-bounce text-[#C9A84C]" />
        </div>
      </section>

      <section className="bg-[#0A0505] py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
          <div className="grid h-auto grid-cols-2 gap-3 lg:h-[520px]">
            <ImageSlot title="Founder portrait" src="/Img/founder-portrait.png" tall index={0} />
            <ImageSlot title="Faith Heroes workshop desk" src="/Img/faith-heroes-workshop-desk.png" index={1} />
            <ImageSlot title="Handcrafted with love workshop" src="/Img/handcrafted-with-love-workshop.png" index={2} />
          </div>

          <div>
            <Label>Our Story</Label>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-[#FDF5F0] md:text-5xl">
              <WordsPullUp text="Where It All Began" />
            </h2>
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-[#FDF5F0]/70 md:text-base">
              <p>Faith Heroes was born from a simple but powerful question: what if a child could hold their favourite Bible story in their hands? Not just read it - but touch it, keep it, and carry it with them.</p>
              <p>We started in Bristol, UK, with a dream to create something the world had not seen before - handcrafted Bible story gift boxes that combine faith, art, and community into one meaningful experience.</p>
              <p>Every character we choose, every item we craft, every story we tell is chosen with prayer and intention. This is not just a product. It is a calling.</p>
            </div>
            <div className="mt-6 rounded-xl border border-[#8B1A1A]/20 bg-[#180C0C] p-4 text-xs leading-relaxed text-[#FDF5F0]/40">
              TODO: Replace placeholder story with your real founder story - how did you start this? What was the moment of inspiration? Add 2-3 personal paragraphs here.
            </div>
            <p className="mt-6 flex items-center gap-2 font-display text-sm italic text-[#C9A84C]">
              <Crown size={14} /> - The Faith Heroes Team, Bristol UK
            </p>
          </div>
        </div>
      </section>

      <section className="relative bg-[#0D0606] py-24">
        <div className="pointer-events-none absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,26,26,0.1)_0%,transparent_70%)]" />
        <div className="relative mx-auto mb-16 max-w-3xl px-6 text-center">
          <Label>Why We Exist</Label>
          <h2 className="mt-4 font-display text-4xl font-bold text-[#FDF5F0] md:text-5xl">
            <WordsPullUp text="Mission & Vision" />
          </h2>
        </div>
        <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 md:grid-cols-2">
          <MissionVisionCard
            icon={Target}
            title="Our Mission"
            body="To bring the Bible to life through beautifully crafted gift experiences - making Scripture tangible, personal, and unforgettable for children and families around the world."
            bullets={missionBullets}
            direction="left"
            delay={0.1}
          />
          <MissionVisionCard
            icon={Eye}
            title="Our Vision"
            body="A world where every child knows they are part of a greater story - and carries that truth with them, not just in their heart, but in their hands."
            bullets={visionBullets}
            direction="right"
            delay={0.2}
          />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[#8B1A1A]/30 bg-[#8B1A1A]/10 p-8 text-center">
          <div className="font-display text-6xl leading-none text-[#C9A84C]/25">"</div>
          <p className="font-display text-xl italic leading-relaxed text-[#FDF5F0] md:text-2xl">Go therefore and make disciples of all nations</p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#C9A84C]">
            <CrossWatermark className="h-3 w-3" /> Matthew 28:19
          </p>
        </motion.div>
      </section>

      <section className="bg-[#0A0505] py-24">
        <div className="mb-16 px-6 text-center">
          <Label>What We Stand For</Label>
          <h2 className="mt-4 font-display text-4xl font-bold text-[#FDF5F0] md:text-5xl">
            <WordsPullUp text="Our Core Values" />
          </h2>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.article
                key={value.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl border border-[#8B1A1A]/20 bg-[#180C0C] p-7 transition duration-300 hover:border-[#C9A84C]/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#8B1A1A]/30 bg-[#8B1A1A]/20">
                  <Icon size={22} className="text-[#C9A84C]" />
                </div>
                <p className="mt-4 font-display text-4xl font-black text-[#C9A84C]/30">{String(index + 1).padStart(2, '0')}</p>
                <div className="mt-2 flex items-center gap-2">
                  <h3 className="font-display text-xl font-bold text-[#FDF5F0]">{value.title}</h3>
                  {value.badge && <span className="rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/10 px-2 py-0.5 text-[9px] text-[#C9A84C]">{value.badge}</span>}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#FDF5F0]/60">{value.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0D0606] py-24">
        <div className="pointer-events-none absolute bottom-0 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#8B1A1A]/30 to-transparent md:left-1/2 md:block" />
        <div className="mb-20 px-6 text-center">
          <Label>The Journey</Label>
          <h2 className="mt-4 font-display text-4xl font-bold text-[#FDF5F0] md:text-5xl">
            <WordsPullUp text="How We Got Here" />
          </h2>
        </div>
        <div className="mx-auto max-w-4xl space-y-12 px-6">
          {timeline.map(([year, title, desc, badge, future], index) => {
            const content = (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: index * 0.15 }}
                className={`rounded-2xl bg-[#180C0C] p-6 transition hover:border-[#C9A84C]/30 ${future ? 'border border-dashed border-[#8B1A1A]/30' : 'border border-[#8B1A1A]/25'}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-full border border-[#E05555]/20 bg-[#8B1A1A]/20 px-3 py-1 text-[10px] text-[#E05555]">{year}</span>
                  {badge && <span className="inline-block rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/10 px-3 py-1 text-[10px] text-[#C9A84C]">{badge}</span>}
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-[#FDF5F0]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#FDF5F0]/60">{desc}</p>
              </motion.article>
            );

            return (
              <div key={title} className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
                <div>{index % 2 === 0 ? content : null}</div>
                <div className={`mx-auto h-4 w-4 flex-shrink-0 rounded-full border-4 border-[#0D0606] ${future ? 'bg-[#8B1A1A]/50 shadow-[0_0_0_1px_rgba(139,26,26,0.5)]' : 'bg-[#C9A84C] shadow-[0_0_0_1px_#C9A84C]'}`} />
                <div>{index % 2 === 1 ? content : null}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[#0A0505] py-24">
        <div className="mb-16 px-6 text-center">
          <Label>The People Behind It</Label>
          <h2 className="mt-4 font-display text-4xl font-bold text-[#FDF5F0] md:text-5xl">
            <WordsPullUp text="Meet the Team" />
          </h2>
          <p className="mt-4 text-sm text-[#FDF5F0]/60">A small team with a big calling.</p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map(([initial, name, role, bio], index) => (
            <motion.article
              key={name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.15 }}
              className="rounded-2xl border border-[#8B1A1A]/20 bg-[#180C0C] p-7 text-center transition duration-300 hover:border-[#C9A84C]/30"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#8B1A1A]/40 bg-gradient-to-br from-[#2A1010] to-[#180C0C] font-display text-3xl font-bold text-[#C9A84C] transition hover:border-[#C9A84C]">
                {initial}
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-[#FDF5F0]">{name}</h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-[#C9A84C]">{role}</p>
              <p className="mx-auto mt-3 max-w-[200px] text-xs leading-relaxed text-[#FDF5F0]/60">{bio}</p>
              <div className="mt-5 flex justify-center gap-3">
                {[Users, MailIconFallback].map((Icon, iconIndex) => (
                  <span key={iconIndex} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#8B1A1A]/40 text-[#FDF5F0]/50 transition hover:border-[#C9A84C]/40 hover:text-[#C9A84C]">
                    <Icon size={13} />
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-dashed border-[#8B1A1A]/30 bg-[#180C0C] p-8 text-center">
          <Briefcase size={28} className="mx-auto text-[#C9A84C]" />
          <h3 className="mt-3 font-display text-2xl font-bold text-[#FDF5F0]">We're Growing</h3>
          <p className="mt-2 text-sm text-[#FDF5F0]/60">Passionate about faith, storytelling, or craft? We'd love to hear from you.</p>
          <Link to="/contact" className="mt-5 inline-block rounded-full bg-[#8B1A1A] px-6 py-3 text-sm text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">
            Get in Touch <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0D0606] py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,26,26,0.15)_0%,transparent_65%)]" />
        <div className="landing-grain absolute inset-0 opacity-[0.05]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1, ease }}>
            <Crown size={36} className="mx-auto mb-6 text-[#C9A84C]" />
          </motion.div>
          <h2 className="font-display text-5xl font-black leading-[0.88] tracking-[-0.02em] text-[#FDF5F0] md:text-7xl">
            <WordsPullUp text="Be Part of the Story" />
          </h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.7, ease }} className="mx-auto mt-6 h-0.5 w-20 bg-[#C9A84C]" />
          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.8, ease }} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#FDF5F0]/70">
            Whether you buy a box, share a story, or simply spread the word - you are part of something eternal. Every act of kindness echoes through generations.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 1, ease }} className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <button onClick={() => navigate('/shop')} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8B1A1A] px-8 py-4 font-medium text-[#FDF5F0] transition duration-300 hover:bg-[#C9A84C] hover:text-[#0A0505]">
              <ShoppingBag size={18} /> Explore the Shop
            </button>
            <button onClick={() => navigate('/share-kindness')} className="rounded-full border border-[#C9A84C]/50 px-8 py-4 text-[#C9A84C] transition duration-300 hover:bg-[#C9A84C] hover:text-[#0A0505]">
              Share Your Story
            </button>
            <button onClick={() => navigate('/contact')} className="rounded-full border border-[#FDF5F0]/20 px-8 py-4 text-[#FDF5F0]/60 transition duration-300 hover:border-[#FDF5F0]/40 hover:text-[#FDF5F0]">
              Contact Us
            </button>
          </motion.div>
          <div className="mt-16 text-center text-xs leading-relaxed text-[#FDF5F0]/25">
            <p>And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus</p>
            <p className="mt-1">- Colossians 3:17</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function MailIconFallback(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
