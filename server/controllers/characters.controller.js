const db = require('../config/database');
const { emitToAdmins } = require('../services/socket.service');
const fallbackShop = require('../data/fallbackShop');
const { withCharacterImageOverrides } = require('../data/imageOverrides');

exports.getAll = async (req, res, next) => {
  try {
    const showAll = req.query.all === 'true';
    let query = db.from('characters').select('*, products(*)').order('created_at', { ascending: false });
    if (!showAll) query = query.eq('is_published', true);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: (data || []).map(withCharacterImageOverrides) });
  } catch (err) {
    res.json({ success: true, data: fallbackShop.charactersWithProducts, source: 'fallback' });
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const { data, error } = await db.from('characters').select('*, products(*)').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Character not found' });
    res.json({ success: true, data: withCharacterImageOverrides(data) });
  } catch (err) {
    const data = fallbackShop.charactersWithProducts.find(character => character.id === req.params.id);
    if (!data) return res.status(404).json({ error: 'Character not found' });
    res.json({ success: true, data, source: 'fallback' });
  }
};

exports.create = async (req, res, next) => {
  try {
    const { data, error } = await db.from('characters').insert([req.body]).select().single();
    if (error) throw error;
    emitToAdmins('character:created', data);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { data, error } = await db.from('characters').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    emitToAdmins('character:updated', data);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { error } = await db.from('characters').delete().eq('id', req.params.id);
    if (error) throw error;
    emitToAdmins('character:deleted', { id: req.params.id });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.togglePublish = async (req, res, next) => {
  try {
    const { data: current } = await db.from('characters').select('is_published').eq('id', req.params.id).single();
    const { data, error } = await db
      .from('characters')
      .update({ is_published: !current.is_published })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    emitToAdmins('character:updated', data);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
