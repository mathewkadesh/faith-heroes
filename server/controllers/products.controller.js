const db = require('../config/database');
const { emitToAdmins } = require('../services/socket.service');
const fallbackShop = require('../data/fallbackShop');
const { withProductImageOverrides } = require('../data/imageOverrides');

exports.getAll = async (req, res, next) => {
  try {
    const showAll = req.query.all === 'true';
    let query = db.from('products').select('*, characters(*)').order('created_at', { ascending: false });
    if (!showAll) query = query.eq('is_active', true);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: (data || []).map(withProductImageOverrides) });
  } catch (err) {
    res.json({ success: true, data: fallbackShop.products, source: 'fallback' });
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const { data, error } = await db.from('products').select('*, characters(*)').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, data: withProductImageOverrides(data) });
  } catch (err) {
    const data = fallbackShop.products.find(product => product.id === req.params.id);
    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, data, source: 'fallback' });
  }
};

exports.create = async (req, res, next) => {
  try {
    const { data, error } = await db.from('products').insert([req.body]).select().single();
    if (error) throw error;
    emitToAdmins('product:created', data);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { data, error } = await db.from('products').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    emitToAdmins('product:updated', data);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { error } = await db.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { stock_qty } = req.body;
    const { data, error } = await db.from('products').update({ stock_qty }).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (data.stock_qty < 5) emitToAdmins('product:low_stock', data);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
