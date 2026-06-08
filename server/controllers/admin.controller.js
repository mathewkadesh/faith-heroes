const supabase = require('../config/supabase');

exports.getStats = async (req, res, next) => {
  try {
    const now   = new Date();
    const month = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      { count: orders },
      { data: revenue },
      { count: pending },
      { count: stories },
      { count: customers },
      { count: unread },
      { data: lowStock },
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', month),
      supabase.from('orders').select('total_amount').gte('created_at', month).eq('status', 'delivered'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('community_stories').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
      supabase.from('products').select('id, name, stock_qty').lt('stock_qty', 5).eq('is_active', true),
    ]);

    const totalRevenue = revenue?.reduce((s, o) => s + Number(o.total_amount), 0) || 0;

    res.json({
      success: true,
      data: {
        orders: orders || 0, revenue: totalRevenue, pendingOrders: pending || 0,
        pendingStories: stories || 0, customers: customers || 0,
        unreadMessages: unread || 0, lowStockProducts: lowStock || [],
      },
    });
  } catch (err) { next(err); }
};

exports.getRevenue = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const from = new Date(); from.setDate(from.getDate() - days);

    const { data, error } = await supabase
      .from('orders').select('created_at, total_amount')
      .gte('created_at', from.toISOString()).eq('status', 'delivered');
    if (error) throw error;

    const byDay = {};
    (data || []).forEach(o => {
      const day = o.created_at.split('T')[0];
      byDay[day] = (byDay[day] || 0) + Number(o.total_amount);
    });

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      result.push({ date: key, revenue: byDay[key] || 0 });
    }
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('profiles').select('*, orders(id, total_amount)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { data, error } = await supabase
      .from('profiles').update({ role }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages').update({ is_read: true }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
