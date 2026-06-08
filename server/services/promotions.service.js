const supabase = require('../config/supabase');
const { randomUUID } = require('crypto');

function isMissingPromotionsTable(error) {
  return /relation .*promotions.* does not exist/i.test(error?.message || '') ||
    /Could not find .*promotions/i.test(error?.message || '');
}

function isMissingPromoItemsTable(error) {
  return /relation .*promotion_signature_items.* does not exist/i.test(error?.message || '') ||
    /Could not find .*promotion_signature_items/i.test(error?.message || '');
}

async function ensureBucket(bucket) {
  const { error } = await supabase.storage.getBucket(bucket);
  if (!error) return;
  const { error: createError } = await supabase.storage.createBucket(bucket, { public: true });
  if (createError && !/already exists/i.test(createError.message || '')) throw createError;
}

function activeQuery() {
  const now = new Date().toISOString();
  return supabase
    .from('promotions')
    .select(`
      *,
      characters (
        id, name, bible_reference, scripture_quote,
        tagline, description, figure_image_url, lid_image_url
      ),
      promotion_signature_items (*)
    `)
    .eq('is_active', true)
    .lte('starts_at', now)
    .gte('ends_at', now);
}

exports.isMissingPromotionsTable = isMissingPromotionsTable;

exports.getActive = async () => {
  const { data, error } = await activeQuery().order('sort_order', { ascending: true });
  if (error) {
    if (isMissingPromotionsTable(error) || isMissingPromoItemsTable(error)) return [];
    throw error;
  }
  return data || [];
};

exports.getFeatured = async () => {
  const { data, error } = await activeQuery()
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingPromotionsTable(error) || isMissingPromoItemsTable(error)) return null;
    throw error;
  }
  return data || null;
};

exports.getBySlug = async (slug) => {
  const { data, error } = await activeQuery()
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    if (isMissingPromotionsTable(error) || isMissingPromoItemsTable(error)) return null;
    throw error;
  }
  return data || null;
};

exports.validateCode = async (code, promotionId) => {
  if (!code || !promotionId) return { valid: false, message: 'Promo code is required' };
  const normalised = String(code).trim().toUpperCase();

  const { data, error } = await supabase
    .from('promotions')
    .select('id, promo_code, promo_code_discount_pct, remaining_stock, ends_at')
    .eq('id', promotionId)
    .eq('promo_code', normalised)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    if (isMissingPromotionsTable(error)) return { valid: false, message: 'Promotions are not configured yet' };
    throw error;
  }
  if (!data) return { valid: false, message: 'Invalid promo code' };
  if (new Date(data.ends_at) < new Date()) return { valid: false, message: 'This promotion has ended' };
  if (data.remaining_stock < 1) return { valid: false, message: 'Sorry, sold out' };

  return {
    valid: true,
    discount_pct: data.promo_code_discount_pct || 0,
    message: `${data.promo_code_discount_pct || 0}% discount applied`,
  };
};

exports.getAll = async () => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*, characters(id, name, figure_image_url, lid_image_url), promotion_signature_items(*)')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
};

exports.create = async (payload) => {
  const { data, error } = await supabase
    .from('promotions')
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
};

exports.update = async (id, payload) => {
  const { data, error } = await supabase
    .from('promotions')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

exports.toggle = async (id) => {
  const { data: current, error: currentError } = await supabase
    .from('promotions')
    .select('is_active')
    .eq('id', id)
    .single();
  if (currentError) throw currentError;

  return exports.update(id, { is_active: !current.is_active });
};

exports.remove = async (id) => {
  const { error } = await supabase.from('promotions').delete().eq('id', id);
  if (error) throw error;
  return { deleted: true };
};

exports.uploadBanner = async (id, fileBuffer, mimetype) => {
  const ext = (mimetype.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '');
  const filename = `promotions/${id}-${randomUUID()}.${ext}`;

  await ensureBucket('character-images');

  const { error: uploadError } = await supabase.storage
    .from('character-images')
    .upload(filename, fileBuffer, { contentType: mimetype, upsert: true });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('character-images')
    .getPublicUrl(filename);

  return exports.update(id, { banner_image_url: publicUrl });
};

exports.getItems = async (promotionId) => {
  const { data, error } = await supabase
    .from('promotion_signature_items')
    .select('*')
    .eq('promotion_id', promotionId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
};

exports.createItem = async (promotionId, payload) => {
  const { data, error } = await supabase
    .from('promotion_signature_items')
    .insert([{ ...payload, promotion_id: promotionId }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

exports.updateItem = async (itemId, payload) => {
  const { data, error } = await supabase
    .from('promotion_signature_items')
    .update(payload)
    .eq('id', itemId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

exports.removeItem = async (itemId) => {
  const { error } = await supabase
    .from('promotion_signature_items')
    .delete()
    .eq('id', itemId);
  if (error) throw error;
  return { deleted: true };
};

exports.uploadItemImage = async (itemId, fileBuffer, mimetype) => {
  const ext = (mimetype.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '');
  const filename = `promotions/signature-items/${itemId}-${randomUUID()}.${ext}`;

  await ensureBucket('character-images');

  const { error: uploadError } = await supabase.storage
    .from('character-images')
    .upload(filename, fileBuffer, { contentType: mimetype, upsert: true });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('character-images')
    .getPublicUrl(filename);

  return exports.updateItem(itemId, { image_url: publicUrl });
};
