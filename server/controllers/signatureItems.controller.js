const service = require('../services/signatureItems.service');
const { emitToAdmins } = require('../services/socket.service');

exports.getByCharacter = async (req, res, next) => {
  try {
    const { characterId } = req.params;
    if (!characterId) return res.status(400).json({ error: 'characterId is required' });
    const data = await service.getByCharacter(characterId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const data = await service.getOne(req.params.itemId);
    if (!data) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getByCharacterAdmin = async (req, res, next) => {
  try {
    const data = await service.getByCharacterAdmin(req.params.characterId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const {
      character_id, name, slug, short_desc, story,
      scripture, scripture_quote, price, is_included, is_addon,
      scene_position, material, dimensions, connects_to,
      is_wearable, glow_in_dark, stock_qty, sort_order, badge_text,
    } = req.body;

    if (!character_id || !name) {
      return res.status(400).json({ error: 'character_id and name are required' });
    }

    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const data = await service.create({
      character_id,
      name,
      slug: finalSlug,
      short_desc,
      story,
      scripture,
      scripture_quote,
      price: Number(price) || 0,
      is_included: Boolean(is_included),
      is_addon: Boolean(is_addon),
      scene_position,
      material,
      dimensions,
      connects_to,
      is_wearable: Boolean(is_wearable),
      glow_in_dark: Boolean(glow_in_dark),
      stock_qty: Number(stock_qty) || 50,
      sort_order: Number(sort_order) || 99,
      badge_text,
      is_active: true,
    });

    emitToAdmins('signature_item:created', data);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.itemId, req.body);
    emitToAdmins('signature_item:updated', data);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.itemId);
    emitToAdmins('signature_item:deleted', { id: req.params.itemId });
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) { next(err); }
};

exports.toggleActive = async (req, res, next) => {
  try {
    const data = await service.toggleActive(req.params.itemId);
    emitToAdmins('signature_item:updated', data);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.reorder = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body.items)) {
      return res.status(400).json({ error: 'items array is required' });
    }
    const data = await service.reorder(req.body.items);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const data = await service.uploadImage(req.params.itemId, req.file.buffer, req.file.mimetype);
    emitToAdmins('signature_item:updated', data);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.updateStock = async (req, res, next) => {
  try {
    const stockQty = Number(req.body.stock_qty);
    if (Number.isNaN(stockQty)) return res.status(400).json({ error: 'stock_qty must be a number' });
    const data = await service.updateStock(req.params.itemId, stockQty);
    if (data.stock_qty < 5) {
      emitToAdmins('signature_item:low_stock', {
        id: data.id,
        name: data.name,
        stock_qty: data.stock_qty,
      });
    }
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
