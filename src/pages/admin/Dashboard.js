import { useEffect, useState } from 'react';
import { ShoppingBag, Users, BookOpen, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge } from '../../components/ui/Badge';
import { adminAPI, orderAPI } from '../../lib/api';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, sub, color = 'gold' }) {
  const colors = { gold: 'text-gold bg-gold/10', accent: 'text-accent-light bg-accent/10', green: 'text-green-400 bg-green-900/20', yellow: 'text-yellow-400 bg-yellow-900/20' };
  return (
    <div className="bg-card border border-gold/15 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted text-xs uppercase tracking-wider">{label}</p>
          <p className="font-display text-3xl font-bold text-cream mt-1">{value}</p>
          {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

const STATUS_BADGE = { pending: 'yellow', confirmed: 'blue', printing: 'purple', shipped: 'orange', delivered: 'green' };

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, pending: 0, stories: 0, customers: 0, lowStock: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    try {
      const [statsResponse, revenueResponse, ordersResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getRevenue(30),
        orderAPI.getAll({ limit: 10 }),
      ]);

      const data = statsResponse.data || {};
      setStats({
        orders: data.orders || 0,
        revenue: data.revenue || 0,
        pending: data.pendingOrders || 0,
        stories: data.pendingStories || 0,
        customers: data.customers || 0,
        lowStock: data.lowStockProducts?.length || 0,
      });
      setRecentOrders(ordersResponse.data || []);
      setChartData((revenueResponse.data || []).map(row => ({
        date: new Date(row.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        revenue: row.revenue,
      })));
    } catch (error) {
      toast.error(error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.orders} />
        <StatCard icon={TrendingUp} label="Total Revenue" value={`£${stats.revenue.toFixed(0)}`} color="green" />
        <StatCard icon={AlertTriangle} label="Pending Orders" value={stats.pending} color={stats.pending > 0 ? 'accent' : 'gold'} />
        <StatCard icon={BookOpen} label="Stories Pending" value={stats.stories} color="yellow" />
        <StatCard icon={Users} label="Customers" value={stats.customers} />
        <StatCard icon={Package} label="Low Stock" value={stats.lowStock} color={stats.lowStock > 0 ? 'accent' : 'gold'} />
      </div>

      {/* Chart */}
      <div className="bg-card border border-gold/15 rounded-2xl p-6">
        <h2 className="font-display text-lg text-cream font-semibold mb-6">Revenue — Last 30 Days</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fill: '#9E7070', fontSize: 11 }} tickLine={false} axisLine={false}
              interval={6} />
            <YAxis tick={{ fill: '#9E7070', fontSize: 11 }} tickLine={false} axisLine={false}
              tickFormatter={v => `£${v}`} />
            <Tooltip contentStyle={{ background: '#180C0C', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8 }}
              labelStyle={{ color: '#FDF5F0' }} itemStyle={{ color: '#C9A84C' }} />
            <Line type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent orders */}
      <div className="bg-card border border-gold/15 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gold/10">
          <h2 className="font-display text-lg text-cream font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10">
                {['Order ID', 'Customer', 'Character', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                  <td className="px-4 py-3 text-cream font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-cream">{o.profiles?.full_name || '—'}</td>
                  <td className="px-4 py-3 text-muted">{o.order_items?.[0]?.products?.characters?.name || '—'}</td>
                  <td className="px-4 py-3 text-gold font-semibold">£{Number(o.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_BADGE[o.status] || 'muted'}>{o.status}</Badge></td>
                  <td className="px-4 py-3 text-muted">{new Date(o.created_at).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
