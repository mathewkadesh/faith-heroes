import { useEffect, useState } from 'react';
import { Search, ChevronDown, X, Printer, RefreshCw, Truck } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { orderAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = { pending: 'yellow', confirmed: 'blue', printing: 'purple', shipped: 'orange', delivered: 'green', refunded: 'red', cancelled: 'muted' };
const STATUSES = ['pending', 'confirmed', 'printing', 'shipped', 'delivered', 'refunded', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const response = await orderAPI.getAll(statusFilter ? { status: statusFilter } : {});
      setOrders(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId, status) {
    try {
      await orderAPI.updateStatus(orderId, { status });
      toast.success('Status updated');
      fetchOrders();
      if (selected?.id === orderId) setSelected(s => ({ ...s, status }));
    } catch (error) {
      toast.error(error.message || 'Update failed');
    }
  }

  async function saveTracking(orderId) {
    try {
      await orderAPI.addTracking(orderId, { tracking_number: trackingInput });
      toast.success('Tracking saved, order marked as shipped');
      fetchOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to save tracking');
    }
  }

  const filtered = orders.filter(o => {
    const name = (o.profiles?.full_name || '').toLowerCase();
    const id = o.id.toLowerCase();
    return !search || name.includes(search.toLowerCase()) || id.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="w-full bg-card border border-gold/20 text-cream rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/50"
            placeholder="Search by name or order ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-44">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-gold/15 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10">
                {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted">Loading...</td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-cream">{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <p className="text-cream">{o.profiles?.full_name || '—'}</p>
                    <p className="text-muted text-xs">{o.profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{o.order_items?.length} item{o.order_items?.length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 text-gold font-semibold">£{Number(o.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted capitalize">{o.payment_method || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_BADGE[o.status] || 'muted'}>{o.status}</Badge></td>
                  <td className="px-4 py-3 text-muted">{new Date(o.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => { setSelected(o); setTrackingInput(o.tracking_number || ''); setInternalNotes(''); }}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative ml-auto w-full max-w-xl bg-card border-l border-gold/20 h-full overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-cream font-semibold">Order Details</h2>
              <button onClick={() => setSelected(null)} className="text-muted hover:text-cream"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted">Customer</p><p className="text-cream">{selected.profiles?.full_name}</p></div>
                <div><p className="text-xs text-muted">Email</p><p className="text-cream">{selected.profiles?.email}</p></div>
                <div><p className="text-xs text-muted">Payment</p><p className="text-cream capitalize">{selected.payment_method}</p></div>
                <div><p className="text-xs text-muted">Transaction ID</p><p className="text-cream font-mono text-xs">{selected.payment_intent_id?.slice(0, 16) || '—'}</p></div>
              </div>

              {selected.shipping_address && (
                <div className="bg-bg rounded-xl p-4 border border-gold/10">
                  <p className="text-xs text-muted mb-2">Shipping Address</p>
                  <p className="text-cream text-sm">{selected.shipping_name}</p>
                  <p className="text-muted text-xs">{typeof selected.shipping_address === 'object' ? Object.values(selected.shipping_address).filter(Boolean).join(', ') : selected.shipping_address}</p>
                </div>
              )}

              {selected.order_items?.map(item => (
                <div key={item.id} className="flex gap-3 bg-bg rounded-xl p-3 border border-gold/10">
                  <div className="flex-1">
                    <p className="text-cream text-sm">{item.products?.characters?.name || item.products?.name || 'Gift Box'}</p>
                    <p className="text-muted text-xs">Qty: {item.quantity} · £{Number(item.unit_price).toFixed(2)} each</p>
                    {item.customisation?.message && (
                      <p className="text-xs text-gold/70 mt-1 italic">Gift msg: "{item.customisation.message}"</p>
                    )}
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs text-muted block mb-1">Update Status</label>
                <select className="w-full bg-bg border border-gold/20 text-cream rounded-lg px-3 py-2 text-sm focus:outline-none"
                  value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <Input placeholder="Tracking number" value={trackingInput} onChange={e => setTrackingInput(e.target.value)} className="flex-1" />
                <Button variant="gold" size="sm" onClick={() => saveTracking(selected.id)}>
                  <Truck size={14} className="mr-1" /> Save
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => window.print()}>
                  <Printer size={14} className="mr-1.5" /> Print Slip
                </Button>
                <Button variant="danger" size="sm" className="flex-1">
                  <RefreshCw size={14} className="mr-1.5" /> Refund
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
