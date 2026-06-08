const service = require('../services/promotions.service');
const { emitToAll, emitToAdmins } = require('../services/socket.service');

exports.getActive = async (_req, res, next) => {
  try {
    const data = await service.getActive();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getFeatured = async (_req, res, next) => {
  try {
    const data = await service.getFeatured();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const data = await service.getBySlug(req.params.slug);
    if (!data) return res.status(404).json({ error: 'Promotion not found or has ended' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.validateCode = async (req, res, next) => {
  try {
    const { code, promotion_id } = req.body;
    const result = await service.validateCode(code, promotion_id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getAll = async (_req, res, next) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.create(req.body);
    emitToAdmins('promotion:created', data);
    emitToAll('promotion:new', {
      id: data.id,
      name: data.name,
      slug: data.slug,
      badge_text: data.badge_text,
    });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.id, req.body);
    emitToAdmins('promotion:updated', data);
    emitToAll('promotion:updated', {
      id: data.id,
      remaining_stock: data.remaining_stock,
      is_active: data.is_active,
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.toggle = async (req, res, next) => {
  try {
    const data = await service.toggle(req.params.id);
    emitToAdmins('promotion:updated', data);
    emitToAll('promotion:updated', {
      id: data.id,
      remaining_stock: data.remaining_stock,
      is_active: data.is_active,
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.uploadBanner = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const data = await service.uploadBanner(req.params.id, req.file.buffer, req.file.mimetype);
    emitToAdmins('promotion:updated', data);
    emitToAll('promotion:updated', {
      id: data.id,
      remaining_stock: data.remaining_stock,
      banner_image_url: data.banner_image_url,
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    emitToAdmins('promotion:deleted', { id: req.params.id });
    emitToAll('promotion:updated', { id: req.params.id, is_active: false });
    res.json({ success: true, message: 'Promotion deleted' });
  } catch (err) { next(err); }
};

exports.getItems = async (req, res, next) => {
  try {
    const data = await service.getItems(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.createItem = async (req, res, next) => {
  try {
    const data = await service.createItem(req.params.id, req.body);
    emitToAdmins('promotion:item_created', data);
    emitToAll('promotion:updated', { id: data.promotion_id });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const data = await service.updateItem(req.params.itemId, req.body);
    emitToAdmins('promotion:item_updated', data);
    emitToAll('promotion:updated', { id: data.promotion_id });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.removeItem = async (req, res, next) => {
  try {
    await service.removeItem(req.params.itemId);
    emitToAdmins('promotion:item_deleted', { id: req.params.itemId });
    res.json({ success: true, message: 'Promotion item deleted' });
  } catch (err) { next(err); }
};

exports.uploadItemImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const data = await service.uploadItemImage(req.params.itemId, req.file.buffer, req.file.mimetype);
    emitToAdmins('promotion:item_updated', data);
    emitToAll('promotion:updated', { id: data.promotion_id });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
