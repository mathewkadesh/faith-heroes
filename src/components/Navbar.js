import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Crown, LogOut, Menu, ShoppingBag, User, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Share Kindness', href: '/share-kindness' },
  { label: 'Shop', href: '/shop' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { itemCount, toggleDrawer } = useCart();
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location]);

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  }

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-[#8B1A1A]/25 bg-[#0A0505]/[0.92] backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Crown className="text-[#C9A84C]" size={20} />
            <span className="font-display text-xl font-bold text-[#C9A84C]">Faith Heroes</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(link => {
              const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(`${link.href}/`));
              return (
                <Link key={link.href} to={link.href} className={`group relative text-sm transition ${isActive ? 'text-[#FDF5F0]' : 'text-[#FDF5F0]/70 hover:text-[#FDF5F0]'}`}>
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#C9A84C] transition-all ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button onClick={toggleDrawer} className="relative text-[#FDF5F0]/80 transition hover:text-[#C9A84C]">
              <ShoppingBag size={21} />
              {itemCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E05555] text-[9px] text-white">{itemCount}</span>}
            </button>
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(value => !value)} className="inline-flex items-center gap-2 text-sm text-[#FDF5F0]/75 hover:text-[#C9A84C]">
                  <User size={17} /> {profile?.full_name?.split(' ')[0] || 'Faith'}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-48 overflow-hidden rounded-xl border border-[#8B1A1A]/30 bg-[#180C0C] shadow-2xl">
                    <Link to="/account" className="block px-4 py-3 text-sm text-[#FDF5F0]/75 hover:bg-[#8B1A1A]/20">My Account</Link>
                    {isAdmin && <Link to="/admin" className="block px-4 py-3 text-sm text-[#C9A84C] hover:bg-[#8B1A1A]/20">Admin Dashboard</Link>}
                    <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-[#E05555] hover:bg-[#8B1A1A]/20"><LogOut size={15} /> Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => navigate('/auth')} className="rounded-full border border-[#8B1A1A]/50 px-4 py-1.5 text-sm text-[#FDF5F0] transition hover:border-[#E05555]">Sign In</button>
                <button onClick={() => navigate('/shop')} className="rounded-full bg-[#8B1A1A] px-5 py-1.5 text-sm text-[#FDF5F0] transition hover:bg-[#C9A84C] hover:text-[#0A0505]">Shop Now</button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button onClick={toggleDrawer} className="relative text-[#FDF5F0]/80">
              <ShoppingBag size={20} />
              {itemCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E05555] text-[9px] text-white">{itemCount}</span>}
            </button>
            <button onClick={() => setMobileOpen(true)} className="text-[#FDF5F0]"><Menu size={23} /></button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#0A0505]/[0.98] px-6 py-5">
          <button onClick={() => setMobileOpen(false)} className="ml-auto text-[#FDF5F0]"><X size={28} /></button>
          <div className="mt-12 flex flex-col">
            {navLinks.map(link => {
              const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(`${link.href}/`));
              return (
                <Link key={link.href} to={link.href} className={`border-b border-[#8B1A1A]/20 py-6 font-display text-2xl ${isActive ? 'text-[#C9A84C]' : 'text-[#FDF5F0]'}`}>{link.label}</Link>
              );
            })}
            <button onClick={() => navigate(user ? '/account' : '/auth')} className="border-b border-[#8B1A1A]/20 py-6 text-left font-display text-2xl text-[#C9A84C]">
              {user ? 'My Account' : 'Sign In'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
