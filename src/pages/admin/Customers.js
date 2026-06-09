import { useEffect, useState } from 'react';
import { Search, User } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchCustomers(); }, []);

  async function fetchCustomers() {
    try {
      const response = await adminAPI.getCustomers();
      setCustomers(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = customers.filter(c =>
    !search || (c.full_name || '').toLowerCase().includes(search.toLowerCase()) || (c.email || '').includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-cream font-semibold">Customers</h2>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="bg-card border border-gold/20 text-cream rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gold/50"
            placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-card border border-gold/15 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10">
              {['Customer', 'Email', 'Role', 'Orders', 'Total Spent', 'Joined'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-10 text-muted">Loading...</td></tr>
              : filtered.map(c => (
              <tr key={c.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                <td className="px-4 py-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    {c.avatar_url ? <img src={c.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <User size={14} className="text-gold" />}
                  </div>
                  <span className="text-cream">{c.full_name || '—'}</span>
                </td>
                <td className="px-4 py-3 text-muted">{c.email || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${c.role === 'admin' ? 'text-gold' : 'text-muted'}`}>{c.role}</span>
                </td>
                <td className="px-4 py-3 text-cream">{c.orders?.length || 0}</td>
                <td className="px-4 py-3 text-gold font-semibold">
                  £{(c.orders?.reduce((s, o) => s + Number(o.total_amount || 0), 0) || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-muted">{new Date(c.created_at).toLocaleDateString('en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
