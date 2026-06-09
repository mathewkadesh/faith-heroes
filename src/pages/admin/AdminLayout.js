import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, BookOpen, ShoppingBag, Users, MessageSquare, Settings, ChevronLeft, ChevronRight, Crown, LogOut, Bell, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/admin/characters', label: 'Characters', icon: BookOpen },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/promotions', label: 'Promotions', icon: Tag },
  { path: '/admin/stories', label: 'Community Stories', icon: MessageSquare },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  function isActive(nav) {
    if (nav.exact) return location.pathname === nav.path;
    return location.pathname.startsWith(nav.path);
  }

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out');
    navigate('/');
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-[#0F1A38] border-r border-white/5 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-white/5">
          <Crown className="text-gold flex-shrink-0" size={22} />
          {!collapsed && <span className="font-display text-gold font-semibold text-sm">Admin Panel</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {NAV.map(nav => (
            <Link key={nav.path} to={nav.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive(nav) ? 'bg-gold/10 text-gold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <nav.icon size={17} className="flex-shrink-0" />
              {!collapsed && <span>{nav.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/5 p-3">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-1 mb-2">
              <div className="w-7 h-7 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-gold font-bold">{profile?.full_name?.[0] || 'A'}</span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{profile?.full_name}</p>
                <p className="text-white/40 text-xs">Admin</p>
              </div>
            </div>
          )}
          <button onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:text-red-400 transition-colors rounded-lg">
            <LogOut size={14} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c => !c)}
          className="flex justify-center py-3 text-white/30 hover:text-white/60 transition-colors border-t border-white/5">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-card border-b border-gold/10 flex items-center justify-between px-6 py-3">
          <h1 className="text-cream font-semibold text-sm capitalize">
            {NAV.find(n => isActive(n))?.label || 'Admin'}
          </h1>
          <div className="flex items-center gap-4">
            <button className="text-muted hover:text-gold transition-colors">
              <Bell size={18} />
            </button>
            <Link to="/" className="text-xs text-muted hover:text-gold transition-colors">
              ← View Site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
