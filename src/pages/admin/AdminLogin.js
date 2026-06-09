import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Crown, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({
    email: process.env.REACT_APP_ADMIN_EMAIL || 'admin@faithheroes.local',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAdmin, signInAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin';

  if (isAdmin) {
    return <Navigate to={from} replace />;
  }

  function handleChange(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await signInAdmin(form.email, form.password);
      toast.success('Admin access granted');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Admin login failed');
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4 py-12 grain-overlay">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0505] via-[#180C0C] to-[#0A0505]" />
      <section className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-5">
            <Crown className="text-gold" size={30} />
            <span className="font-display text-2xl text-gold font-semibold">Faith Heroes</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5 text-xs text-gold uppercase tracking-widest">
            <LockKeyhole size={13} /> Admin Access
          </div>
          <h1 className="font-display text-4xl text-cream font-bold mt-5">Admin Login</h1>
          <p className="text-muted text-sm mt-2">
            Separate access for store management, orders, products, and moderation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-gold/20 rounded-2xl p-8 shadow-2xl shadow-black/30 space-y-5">
          <Input
            label="Admin Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="username"
            required
          />
          <div className="relative">
            <Input
              label="Admin Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(value => !value)}
              className="absolute right-3 top-8 text-muted hover:text-cream transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Checking access...' : 'Enter Admin Dashboard'}
          </Button>
        </form>
      </section>
    </main>
  );
}
