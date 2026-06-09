const db = require('../config/database');
const { saveBuffer } = require('./localUpload.service');

function isMissingSignatureTable(error) {
  return /relation .*signature_items.* does not exist/i.test(error?.message || '');
}

function groupItems(items) {
  return {
    included: items.filter(i => i.is_included),
    addons: items.filter(i => i.is_addon),
    all: items,
  };
}

exports.isMissingSignatureTable = isMissingSignatureTable;

exports.getByCharacter = async (characterId) => {
  const { data, error } = await db
    .from('signature_items')
    .select('*')
    .eq('character_id', characterId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    if (isMissingSignatureTable(error)) return groupItems([]);
    throw error;
  }

  return groupItems(data || []);
};

exports.getOne = async (itemId) => {
  const { data, error } = await db
    .from('signature_items')
    .select(`
      *,
      characters (
        id,
        name,
        bible_reference,
        tagline
      )
    `)
    .eq('id', itemId)
    .single();

  if (error) {
    if (isMissingSignatureTable(error)) return null;
    throw error;
  }
  return data;
};

exports.getByCharacterAdmin = async (characterId) => {
  const { data, error } = await db
    .from('signature_items')
    .select('*')
    .eq('character_id', characterId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

exports.create = async (payload) => {
  const { data, error } = await db
    .from('signature_items')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

exports.update = async (itemId, payload) => {
  const { data, error } = await db
    .from('signature_items')
    .update(payload)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

exports.remove = async (itemId) => {
  const { data: item } = await db
    .from('signature_items')
    .select('image_url')
    .eq('id', itemId)
    .single();

  const { error } = await db
    .from('signature_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
  return { deleted: true };
};

exports.toggleActive = async (itemId) => {
  const { data: current, error: currentError } = await db
    .from('signature_items')
    .select('is_active')
    .eq('id', itemId)
    .single();
  if (currentError) throw currentError;

  const { data, error } = await db
    .from('signature_items')
    .update({ is_active: !current.is_active })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

exports.reorder = async (items) => {
  const updates = items.map(({ id, sort_order }) =>
    db.from('signature_items').update({ sort_order }).eq('id', id)
  );
  await Promise.all(updates);
  return { reordered: true };
};

exports.uploadImage = async (itemId, fileBuffer, mimetype) => {
  const publicUrl = await saveBuffer('signature-items', fileBuffer, mimetype);

  const { data, error } = await db
    .from('signature_items')
    .update({ image_url: publicUrl })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

exports.updateStock = async (itemId, stock_qty) => {
  const { data, error } = await db
    .from('signature_items')
    .update({ stock_qty })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

exports.validateAddons = async (addonIds) => {
  if (!addonIds || addonIds.length === 0) return [];

  const { data, error } = await db
    .from('signature_items')
    .select('id, name, price, stock_qty, is_addon, is_active, image_url')
    .in('id', addonIds)
    .eq('is_addon', true)
    .eq('is_active', true);

  if (error) throw error;

  for (const item of data || []) {
    if (item.stock_qty < 1) throw new Error(`${item.name} is currently out of stock`);
  }

  return data || [];
};
