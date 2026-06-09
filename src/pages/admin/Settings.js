import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

function StatusRow({ label, connected }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gold/10 last:border-0">
      <span className="text-cream text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {connected
          ? <><CheckCircle size={15} className="text-green-400" /><span className="text-green-400 text-xs">Connected</span></>
          : <><XCircle size={15} className="text-accent-light" /><span className="text-accent-light text-xs">Not connected</span></>
        }
      </div>
    </div>
  );
}

const REGIONS = ['United Kingdom', 'European Union', 'United States', 'Global'];

export default function AdminSettings() {
  const [storeName, setStoreName] = useState('Faith Heroes');
  const [contactEmail, setContactEmail] = useState('hello@faithheroes.co.uk');
  const [regions, setRegions] = useState({ 'United Kingdom': true, 'European Union': true, 'United States': false, Global: false });
  const [notifications, setNotifications] = useState({ order: true, shipped: true, delivered: true });

  function toggleRegion(r) { setRegions(s => ({ ...s, [r]: !s[r] })); }
  function toggleNotif(k) { setNotifications(s => ({ ...s, [k]: !s[k] })); }

  function handleSave() { toast.success('Settings saved!'); }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-display text-xl text-cream font-semibold">Store Settings</h2>

      <div className="bg-card border border-gold/15 rounded-2xl p-6 space-y-5">
        <h3 className="text-cream font-medium">General</h3>
        <Input label="Store Name" value={storeName} onChange={e => setStoreName(e.target.value)} />
        <Input label="Contact Email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
      </div>

      <div className="bg-card border border-gold/15 rounded-2xl p-6 space-y-2">
        <h3 className="text-cream font-medium mb-4">Integrations</h3>
        <StatusRow label="Stripe Payments" connected={!!process.env.REACT_APP_STRIPE_PUBLIC_KEY} />
        <StatusRow label="PayPal Payments" connected={!!process.env.REACT_APP_PAYPAL_CLIENT_ID} />
        <StatusRow label="Supabase Database" connected={true} />
        <StatusRow label="Resend Email" connected={false} />
        <StatusRow label="Shippo Tracking" connected={false} />
      </div>

      <div className="bg-card border border-gold/15 rounded-2xl p-6">
        <h3 className="text-cream font-medium mb-4">Shipping Regions</h3>
        <div className="space-y-3">
          {REGIONS.map(r => (
            <label key={r} className="flex items-center justify-between cursor-pointer">
              <span className="text-cream text-sm">{r}</span>
              <input type="checkbox" checked={regions[r]} onChange={() => toggleRegion(r)} className="w-4 h-4 accent-gold" />
            </label>
          ))}
        </div>
      </div>

      <div className="bg-card border border-gold/15 rounded-2xl p-6">
        <h3 className="text-cream font-medium mb-4">Email Notifications</h3>
        <div className="space-y-3">
          {[['order', 'Order confirmed'], ['shipped', 'Order shipped'], ['delivered', 'Order delivered']].map(([k, label]) => (
            <label key={k} className="flex items-center justify-between cursor-pointer">
              <span className="text-cream text-sm">{label}</span>
              <input type="checkbox" checked={notifications[k]} onChange={() => toggleNotif(k)} className="w-4 h-4 accent-gold" />
            </label>
          ))}
        </div>
      </div>

      <Button variant="gold" size="lg" onClick={handleSave}>Save Settings</Button>
    </div>
  );
}
