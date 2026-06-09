import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { assetUrl } from '../lib/assets';

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: searchParams.get('subject') || '',
    message: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Contact Us - Faith Heroes';
  }, []);

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    const subject = encodeURIComponent(form.subject || 'Faith Heroes Enquiry');
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:hello@faithheroes.co.uk?subject=${subject}&body=${body}`;
    toast.success('Opening your email app');
  }

  return (
    <main className="min-h-screen bg-[#0A0505] pt-16 text-[#FDF5F0]">
      <section className="relative overflow-hidden border-b border-[#8B1A1A]/20 bg-[#180C0C] py-20">
        <img src={assetUrl('/Img/bible-candle-story-background.png')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0505]/80 to-[#0A0505]" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="mb-6 flex items-center justify-center gap-2 text-xs text-[#FDF5F0]/40">
            <Link to="/" className="hover:text-[#C9A84C]">Home</Link>
            <ChevronRight size={12} />
            <span>Contact Us</span>
          </div>
          <span className="inline-flex rounded-full border border-[#8B1A1A]/40 bg-[#8B1A1A]/20 px-4 py-1.5 text-[10px] uppercase tracking-widest text-[#E05555]">We are here to help</span>
          <h1 className="mt-5 font-display text-5xl font-black leading-tight md:text-7xl">Contact Faith Heroes</h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#FDF5F0]/60 md:text-base">
            Questions about orders, wholesale, partnerships, or custom gift boxes? Send us a message.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-16 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <ContactCard icon={Mail} title="Email" value="hello@faithheroes.co.uk" />
          <ContactCard icon={MapPin} title="Location" value="Bristol, United Kingdom" />
          <ContactCard icon={Phone} title="Support" value="Order help and wholesale enquiries" />
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-[#8B1A1A]/25 bg-[#180C0C] p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10">
              <MessageSquare size={20} className="text-[#C9A84C]" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">Send a Message</h2>
              <p className="text-xs text-[#FDF5F0]/45">This opens your email app with the message ready.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Name" value={form.name} onChange={value => update('name', value)} required />
            <Field label="Email" type="email" value={form.email} onChange={value => update('email', value)} required />
          </div>
          <Field label="Subject" value={form.subject} onChange={value => update('subject', value)} className="mt-4" required />
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#C9A84C]">Message</span>
            <textarea required value={form.message} onChange={event => update('message', event.target.value)} rows={7} className="w-full resize-none rounded-xl border border-[#8B1A1A]/30 bg-[#0A0505] px-4 py-3 text-sm text-[#FDF5F0] outline-none transition focus:border-[#C9A84C]" />
          </label>
          <button className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#8B1A1A] px-7 py-3 text-sm font-medium text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">
            <Send size={16} /> Send Message
          </button>
        </form>
      </section>
    </main>
  );
}

function ContactCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-[#8B1A1A]/25 bg-[#180C0C] p-6">
      <Icon size={26} className="text-[#C9A84C]" />
      <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm text-[#FDF5F0]/60">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#C9A84C]">{label}</span>
      <input required={required} type={type} value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-[#8B1A1A]/30 bg-[#0A0505] px-4 py-3 text-sm text-[#FDF5F0] outline-none transition focus:border-[#C9A84C]" />
    </label>
  );
}
