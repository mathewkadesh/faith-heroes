import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Crown, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await signUp(form.email, form.password, form.full_name);
        toast.success('Account created! Check your email to verify.');
      }
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <Crown className="text-gold" size={28} />
            <span className="font-display text-2xl text-gold font-semibold">Faith Heroes</span>
          </div>
          <h1 className="font-display text-3xl text-cream font-bold">
            {mode === 'signin' ? 'Welcome Back' : 'Join the Community'}
          </h1>
          <p className="text-muted mt-2 text-sm">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your Faith Heroes account'}
          </p>
        </div>

        <div className="bg-card border border-gold/20 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {mode === 'signup' && (
              <Input label="Full Name" name="full_name" placeholder="John Smith"
                value={form.full_name} onChange={handleChange} required />
            )}
            <Input label="Email Address" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
            <div className="relative">
              <Input label="Password" type={showPwd ? 'text' : 'password'} name="password"
                placeholder="••••••••" value={form.password} onChange={handleChange} required />
              <button type="button" onClick={() => setShowPwd(s => !s)}
                className="absolute right-3 top-8 text-muted hover:text-cream transition-colors">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button type="submit" variant="gold" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}
              className="text-gold hover:text-gold-light transition-colors font-medium">
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
