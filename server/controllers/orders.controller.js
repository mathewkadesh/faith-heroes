const supabase      = require('../config/supabase');
const { emitToAdmins, emitToUser } = require('../services/socket.service');
const emailService  = require('../services/email.service');
const stripeService = require('../services/stripe.service');
const sigItemService = require('../services/signatureItems.service');

const ORDER_DETAIL_SELECT = `
  *,
  order_items (
    *,
    products (*, characters (*)),
    signature_item_orders (
      *,
      signature_items (
        id, name, slug, short_desc,
        image_url, price, is_included,
        material, dimensions
      )
    )
  )
`;

const ORDER_DETAIL_FALLBACK_SELECT = '*, order_items(*, products(*, characters(*)))';

function isMissingSignatureOrderTable(error) {
  return /relation .*signature_item_orders.* does not exist/i.test(error?.message || '') ||
    /Could not find a relationship.*signature_item_orders/i.test(error?.message || '');
}

async function orderQueryWithSignatureFallback(builder) {
  let result = await builder(ORDER_DETAIL_SELECT);
  if (result.error && isMissingSignatureOrderTable(result.error)) {
    result = await builder(ORDER_DETAIL_FALLBACK_SELECT);
  }
  return result;
}

exports.getAll = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    let q = supabase
      .from('orders')
      .select('*, profiles(full_name, email), order_items(*, products(name, characters(name)))')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (status) q = q.eq('status', status);
    if (search) q = q.or(`order_number.ilike.%${search}%,shipping_name.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const { data, error } = await orderQueryWithSignatureFallback((select) => supabase
      .from('orders')
      .select(select)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false }));
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const { data, error } = await orderQueryWithSignatureFallback((select) => supabase
      .from('orders')
      .select(select)
      .eq('id', req.params.id).single());
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });
    if (data.user_id !== req.user.id && req.profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.trackByNumber = async (req, res, next) => {
  try {
    const { data, error } = await orderQueryWithSignatureFallback((select) => supabase
      .from('orders')
      .select(select)
      .eq('order_number', req.params.orderNumber).single());
    if (error || !data) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.trackByEmail = async (req, res, next) => {
  try {
    const email = String(req.params.email || '').trim().toLowerCase();
    const { data, error } = await orderQueryWithSignatureFallback((select) => supabase
      .from('orders')
      .select(select)
      .ilike('shipping_email', email)
      .order('created_at', { ascending: false })
      .limit(10));
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { items, shipping_address, shipping_name, shipping_email,
            is_gift, gift_message, gift_wrap_style, recipient_name,
            payment_method, payment_intent_id } = req.body;

    const productIds = items.map(i => i.product_id);
    const { data: products } = await supabase
      .from('products').select('id, price, stock_qty, character_id').in('id', productIds);

    let total = 0;
    const addonsByProduct = {};
    for (const item of items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) throw Object.assign(new Error(`Product not found`), { status: 404 });
      if (product.stock_qty < item.quantity) throw Object.assign(new Error(`Insufficient stock`), { status: 400 });
      total += Number(product.price) * item.quantity;

      const addonIds = item.customisation?.signature_addons?.map(addon => addon.id) || [];
      const validatedAddons = await sigItemService.validateAddons(addonIds);
      addonsByProduct[item.product_id] = validatedAddons;
      total += validatedAddons.reduce((sum, addon) => sum + Number(addon.price || 0) * item.quantity, 0);

      if (item.customisation?.gift_wrap_style === 'premium') total += 3 * item.quantity;
      if (item.customisation?.name_tag) total += 2 * item.quantity;
    }

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert([{ user_id: req.user.id, total_amount: total, currency: 'GBP',
                 payment_method, payment_intent_id, is_gift, gift_message,
                 gift_wrap_style, recipient_name, shipping_name, shipping_email,
                 shipping_address, status: 'confirmed' }])
      .select().single();
    if (orderErr) throw orderErr;

    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return { order_id: order.id, product_id: item.product_id,
               quantity: item.quantity, unit_price: Number(product.price),
               customisation: item.customisation || {} };
    });
    const { data: insertedOrderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();
    if (orderItemsError) throw orderItemsError;

    try {
      for (const item of items) {
        const product = products.find(p => p.id === item.product_id);
        const orderItem = (insertedOrderItems || []).find(row => row.product_id === item.product_id);
        if (!product || !orderItem) continue;

        const { data: includedItems, error: includedError } = await supabase
          .from('signature_items')
          .select('id, price')
          .eq('character_id', product.character_id)
          .eq('is_included', true)
          .eq('is_active', true);

        if (includedError && !sigItemService.isMissingSignatureTable(includedError)) throw includedError;

        if (includedItems?.length > 0) {
          await supabase.from('signature_item_orders').insert(includedItems.map(si => ({
            order_item_id: orderItem.id,
            signature_item_id: si.id,
            quantity: item.quantity,
            unit_price: 0,
            is_included: true,
          })));
        }

        const addonItems = addonsByProduct[item.product_id] || [];
        if (addonItems.length > 0) {
          await supabase.from('signature_item_orders').insert(addonItems.map(si => ({
            order_item_id: orderItem.id,
            signature_item_id: si.id,
            quantity: item.quantity,
            unit_price: si.price,
            is_included: false,
          })));

          for (const addon of addonItems) {
            const { error: decrementError } = await supabase.rpc('decrement_sig_item_stock', {
              item_id: addon.id,
              qty: item.quantity,
            });
            if (decrementError) {
              const { data: current } = await supabase.from('signature_items').select('stock_qty').eq('id', addon.id).single();
              await supabase
                .from('signature_items')
                .update({ stock_qty: Math.max(0, Number(current?.stock_qty || 0) - item.quantity) })
                .eq('id', addon.id);
            }
          }
        }
      }
    } catch (signatureErr) {
      if (!/relation .*signature_/i.test(signatureErr.message || '')) throw signatureErr;
    }

    for (const item of items) {
      const product = products.find(p => p.id === item.product_id);
      await supabase.from('products')
        .update({ stock_qty: product.stock_qty - item.quantity }).eq('id', item.product_id);
    }

    try { await emailService.sendOrderConfirmation(order, orderItems, shipping_email); } catch {}

    emitToAdmins('order:new', order);
    emitToUser(req.user.id, 'order:confirmed', order);

    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, admin_notes } = req.body;
    const { data, error } = await supabase
      .from('orders').update({ status, admin_notes })
      .eq('id', req.params.id).select('*, profiles(email, full_name)').single();
    if (error) throw error;
    emitToUser(data.user_id, 'order:status_updated', { order_id: data.id, status });
    emitToAdmins('order:updated', data);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.addTracking = async (req, res, next) => {
  try {
    const { tracking_number, carrier, tracking_url, estimated_delivery } = req.body;
    const { data, error } = await supabase
      .from('orders')
      .update({ tracking_number, carrier, tracking_url, estimated_delivery, status: 'shipped' })
      .eq('id', req.params.id).select('*, profiles(email)').single();
    if (error) throw error;
    try { await emailService.sendShippingNotification(data); } catch {}
    emitToAdmins('order:updated', data);
    emitToUser(data.user_id, 'order:shipped', { tracking_number, tracking_url });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.refund = async (req, res, next) => {
  try {
    const { data: order } = await supabase
      .from('orders').select('*').eq('id', req.params.id).single();
    if (order.payment_intent_id) {
      await stripeService.refundPayment(order.payment_intent_id);
    }
    const { data } = await supabase
      .from('orders').update({ status: 'refunded' }).eq('id', req.params.id).select().single();
    emitToAdmins('order:updated', data);
    res.json({ success: true, message: 'Refund processed' });
  } catch (err) { next(err); }
};
