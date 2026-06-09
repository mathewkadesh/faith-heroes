import { Link } from 'react-router-dom';
import { BookOpen, Crown, Mail, ShoppingBag, User } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#8B1A1A]/25 bg-[#0A0505] pb-8 pt-16 text-[#FDF5F0]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="text-[#C9A84C]" size={24} />
              <span className="font-display text-xl font-bold text-[#C9A84C]">Faith Heroes</span>
            </div>
            <p className="mt-3 max-w-[180px] text-sm leading-relaxed text-[#FDF5F0]/50">One story. Many lives inspired.</p>
            <div className="mt-5 flex gap-3">
              {[Mail, User, BookOpen, ShoppingBag].map((Icon, index) => (
                <button key={index} type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#8B1A1A]/40 text-[#FDF5F0]/50 transition hover:border-[#C9A84C] hover:text-[#C9A84C]">
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[10px] uppercase tracking-widest text-[#FDF5F0]/40">Explore</h3>
            <div className="flex flex-col gap-2.5">
              {[
                ['Home', '/'],
                ['About Us', '/about'],
                ['Shop', '/shop'],
                ['Share Kindness', '/share-kindness'],
                ['Contact Us', '/contact'],
              ].map(([label, href]) => <Link key={href} to={href} className="text-sm text-[#FDF5F0]/60 transition hover:text-[#C9A84C]">{label}</Link>)}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[10px] uppercase tracking-widest text-[#FDF5F0]/40">Support</h3>
            <div className="flex flex-col gap-2.5">
              {[
                ['Track My Order', '/track-order'],
                ['FAQ', '/faq'],
                ['Returns & Refunds', '/returns'],
                ['Wholesale Enquiries', '/contact'],
              ].map(([label, href]) => <Link key={href} to={href} className="text-sm text-[#FDF5F0]/60 transition hover:text-[#C9A84C]">{label}</Link>)}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[10px] uppercase tracking-widest text-[#FDF5F0]/40">Stay Connected</h3>
            <p className="mt-2 text-sm text-[#FDF5F0]/50">Get updates on new Bible hero releases and community stories.</p>
            <form className="mt-4">
              <input placeholder="Email address" className="w-full rounded-xl border border-[#8B1A1A]/30 bg-[#180C0C] px-4 py-2.5 text-xs text-[#FDF5F0] placeholder:text-[#FDF5F0]/30 focus:border-[#C9A84C] focus:outline-none" />
              <button type="button" className="mt-2 w-full rounded-xl bg-[#8B1A1A] px-4 py-2.5 text-xs text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#8B1A1A]/20 pt-6 text-xs text-[#FDF5F0]/30 sm:flex-row">
          <p>© 2025 Faith Heroes Ltd. All rights reserved.</p>
          <p>Made with love in Bristol, UK</p>
          <div className="flex gap-4">
            <button type="button" className="hover:text-[#C9A84C]">Privacy Policy</button>
            <button type="button" className="hover:text-[#C9A84C]">Terms of Service</button>
            <button type="button" className="hover:text-[#C9A84C]">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
