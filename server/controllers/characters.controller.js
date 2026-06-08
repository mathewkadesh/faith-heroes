const supabase = require('../config/supabase');
const { emitToAdmins } = require('../services/socket.service');
const fallbackShop = require('../data/fallbackShop');
const { isSupabaseReachable } = require('../services/supabaseAvailability.service');

function isNetworkFailure(error) {
  return String(error?.message || error).includes('fetch failed');
}

exports.getAll = async (req, res, next) => {
  try {
    if (!(await isSupabaseReachable())) {
      return res.json({ success: true, data: fallbackShop.charactersWithProducts, source: 'fallback' });
    }

    const showAll = req.query.all === 'true';
    let query = supabase.from('characters').select('*, products(*)').order('created_at', { ascending: false });
    if (!showAll) query = query.eq('is_published', true);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    if (isNetworkFailure(err)) {
      return res.json({ success: true, data: fallbackShop.charactersWithProducts, source: 'fallback' });
    }
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    if (!(await isSupabaseReachable())) {
      const data = fallbackShop.charactersWithProducts.find(character => character.id === req.params.id);
      if (!data) return res.status(404).json({ error: 'Character not found' });
      return res.json({ success: true, data, source: 'fallback' });
    }

    const { data, error } = await supabase
      .from('characters').select('*, products(*)').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Character not found' });
    res.json({ success: true, data });
  } catch (err) {
    if (isNetworkFailure(err)) {
      const data = fallbackShop.charactersWithProducts.find(character => character.id === req.params.id);
      if (!data) return res.status(404).json({ error: 'Character not found' });
      return res.json({ success: true, data, source: 'fallback' });
    }
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('characters').insert([req.body]).select().single();
    if (error) throw error;
    emitToAdmins('character:created', data);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('characters').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    emitToAdmins('character:updated', data);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { error } = await supabase.from('characters').delete().eq('id', req.params.id);
    if (error) throw error;
    emitToAdmins('character:deleted', { id: req.params.id });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.togglePublish = async (req, res, next) => {
  try {
    const { data: current } = await supabase
      .from('characters').select('is_published').eq('id', req.params.id).single();
    const { data, error } = await supabase
      .from('characters').update({ is_published: !current.is_published })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    emitToAdmins('character:updated', data);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
