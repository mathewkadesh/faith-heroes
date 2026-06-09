import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, Settings, LogOut, Edit2, Check, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending: 'yellow', confirmed: 'blue', printing: 'purple', shipped: 'orange', delivered: 'green',
};

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AccountPage() {
  const { user, profile, signOut } = useAuth();
  const { orders, loading } = useOrders();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  async function handleSaveName() {
    setSaving(true);
    try {
      await authAPI.updateMe({ full_name: editName });
      toast.success('Name updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update name');
    }
    setSaving(false);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-cream mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === t.id ? 'bg-accent/20 text-cream' : 'text-muted hover:bg-card hover:text-cream'}`}>
                <t.icon size={16} /> {t.label}
              </button>
            ))}
            <button onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-accent-light hover:bg-accent/10 transition-colors">
              <LogOut size={16} /> Sign Out
            </button>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {tab === 'profile' && (
              <div className="bg-card border border-gold/15 rounded-2xl p-6 space-y-6">
                <h2 className="font-display text-xl text-cream font-semibold">Profile Information</h2>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                    <User size={28} className="text-gold" />
                  </div>
                  <div>
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <input value={editName} onChange={e => setEditName(e.target.value)}
                          className="bg-bg border border-gold/30 text-cream rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gold/60" />
                        <button onClick={handleSaveName} disabled={saving} className="text-green-400 hover:text-green-300">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditing(false)} className="text-muted hover:text-cream">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-cream font-semibold">{profile?.full_name || 'Set your name'}</p>
                        <button onClick={() => { setEditing(true); setEditName(profile?.full_name || ''); }}
                          className="text-muted hover:text-gold transition-colors">
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                    <p className="text-muted text-sm mt-0.5">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gold/10">
                  <div>
                    <p className="text-xs text-muted">Member Since</p>
                    <p className="text-cream text-sm mt-1">
                      {new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Total Orders</p>
                    <p className="text-cream text-sm mt-1">{orders.length}</p>
                  </div>
                </div>
              </div>
            )}

            {tab === 'orders' && (
              <div className="space-y-4">
                <h2 className="font-display text-xl text-cream font-semibold">Order History</h2>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-card border border-gold/15 rounded-2xl p-12 text-center">
                    <Package size={40} className="text-gold/20 mx-auto mb-3" />
                    <p className="text-cream font-medium">No orders yet</p>
                    <p className="text-muted text-sm mt-1 mb-4">Explore our collection and place your first order</p>
                    <Button variant="gold" onClick={() => navigate('/shop')}>Shop Now</Button>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-card border border-gold/15 rounded-2xl p-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-muted">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-cream font-medium mt-0.5">
                          {order.order_items?.[0]?.products?.characters?.name || 'Faith Heroes Box'}
                          {order.order_items?.length > 1 && ` + ${order.order_items.length - 1} more`}
                        </p>
                        <p className="text-muted text-xs mt-1">{new Date(order.created_at).toLocaleDateString('en-GB')}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-gold font-display font-bold">£{Number(order.total_amount).toFixed(2)}</p>
                        <Badge variant={STATUS_BADGE[order.status] || 'muted'}>{order.status}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/track-order?order=${order.order_number || order.id}`)}>Track</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'settings' && (
              <div className="bg-card border border-gold/15 rounded-2xl p-6 space-y-5">
                <h2 className="font-display text-xl text-cream font-semibold">Account Settings</h2>
                <div className="space-y-4">
                  <Input label="Email Address" type="email" value={user.email} disabled className="opacity-60" />
                  <p className="text-xs text-muted">Email changes require re-verification. Contact support to update.</p>
                  <Button variant="danger" size="sm" onClick={handleSignOut}>
                    <LogOut size={14} className="mr-2" /> Sign Out of All Devices
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
