const stripe    = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db  = require('../config/database');
const emailService = require('../services/email.service');
const { emitToAdmins, emitToAll } = require('../services/socket.service');
const sigItemService = require('../services/signatureItems.service');
const promotionService = require('../services/promotions.service');

exports.createStripeSession = async (req, res, next) => {
  try {
    const { items, customer_email, is_gift, gift_message } = req.body;
    const lineItems = [];

    for (const item of items || []) {
      const promotionId = item.promotion_id || (String(item.product_id || '').startsWith('promotion-') ? String(item.product_id).replace('promotion-', '') : '');
      if (promotionId) {
        const { data: promotion, error: promotionError } = await db
          .from('promotions')
          .select('*, characters(name, figure_image_url, lid_image_url)')
          .eq('id', promotionId)
          .eq('is_active', true)
          .single();
        if (promotionError || !promotion) throw new Error(`Promotion ${promotionId} not found`);
        if (Number(promotion.remaining_stock || 0) < Number(item.quantity || 1)) throw new Error(`${promotion.name} is sold out`);

        let unitPrice = Number(promotion.promo_price || 0);
        const promoCode = item.customisation?.promo_code;
        if (promoCode) {
          const validation = await promotionService.validateCode(promoCode, promotion.id);
          if (validation.valid) unitPrice = unitPrice * (1 - Number(validation.discount_pct || 0) / 100);
        }

        lineItems.push({
          price_data: {
            currency: (promotion.currency || 'GBP').toLowerCase(),
            product_data: {
              name: promotion.name,
              description: promotion.tagline || promotion.badge_text || 'Faith Heroes limited edition',
              images: promotion.banner_image_url ? [promotion.banner_image_url] : promotion.characters?.figure_image_url ? [promotion.characters.figure_image_url] : [],
              metadata: {
                type: 'promotion',
                promotion_id: promotion.id,
                slug: promotion.slug,
              },
            },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity: item.quantity || 1,
        });
        continue;
      }

      const { data: product, error } = await db
        .from('products')
        .select('*, characters(name, lid_image_url)')
        .eq('id', item.product_id)
        .single();
      if (error || !product) throw new Error(`Product ${item.product_id} not found`);

      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `${product.characters?.name || product.name} Gift Box`,
            description: 'Includes 3D figure, story booklet, keychain, bookmark and NFC card',
            images: product.characters?.lid_image_url ? [product.characters.lid_image_url] : [],
          },
          unit_amount: Math.round(Number(product.price || 0) * 100),
        },
        quantity: item.quantity,
      });

      const addonIds = item.customisation?.signature_addons?.map(addon => addon.id) || [];
      const validatedAddons = await sigItemService.validateAddons(addonIds);

      for (const addon of validatedAddons) {
        lineItems.push({
          price_data: {
            currency: 'gbp',
            product_data: {
              name: addon.name,
              description: `Signature add-on for ${product.characters?.name || product.name} box`,
              images: addon.image_url ? [addon.image_url] : [],
              metadata: {
                type: 'signature_addon',
                addon_id: addon.id,
                character: product.characters?.name || '',
              },
            },
            unit_amount: Math.round(Number(addon.price || 0) * 100),
          },
          quantity: item.quantity,
        });
      }

      if (item.customisation?.gift_wrap_style === 'premium') {
        lineItems.push({
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Premium Gift Wrap',
              description: 'Ribbon bow and luxury tissue paper',
            },
            unit_amount: 300,
          },
          quantity: item.quantity,
        });
      }

      if (item.customisation?.name_tag) {
        lineItems.push({
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Personalised Name Tag',
              description: 'Gold engraved tag with recipient name',
            },
            unit_amount: 200,
          },
          quantity: item.quantity,
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email,
      shipping_address_collection: {
        allowed_countries: ['GB', 'US', 'IE', 'AU', 'CA'],
      },
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/shop`,
      metadata: {
        user_id: req.user?.id || '',
        is_gift: String(is_gift || false),
        gift_message: gift_message || '',
        items_json: JSON.stringify((items || []).map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          customisation: i.customisation,
        }))),
      },
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (err) { next(err); }
};

exports.stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const parsedItems = JSON.parse(session.metadata?.items_json || '[]');
      const firstPromotion = parsedItems.find(item => item.promotion_id || String(item.product_id || '').startsWith('promotion-'));
      const promotionId = firstPromotion?.promotion_id || (firstPromotion ? String(firstPromotion.product_id).replace('promotion-', '') : null);
      const { data: order } = await db.from('orders').insert([{
        payment_intent_id: session.payment_intent,
        payment_method: 'stripe',
        status: 'confirmed',
        total_amount: session.amount_total / 100,
        currency: 'GBP',
        shipping_email: session.customer_email,
        promotion_id: promotionId,
        promo_code_used: firstPromotion?.customisation?.promo_code || null,
        is_gift: session.metadata?.is_gift === 'true',
        gift_message: session.metadata?.gift_message || null,
      }]).select().single();

      for (const item of parsedItems) {
        const itemPromotionId = item.promotion_id || (String(item.product_id || '').startsWith('promotion-') ? String(item.product_id).replace('promotion-', '') : null);
        if (!itemPromotionId) continue;
        const qty = Number(item.quantity || 1);
        const { error: decrementError } = await db.rpc('decrement_promo_stock', {
          promo_id: itemPromotionId,
          qty,
        });
        if (decrementError) {
          const { data: current } = await db.from('promotions').select('remaining_stock').eq('id', itemPromotionId).single();
          const remaining = Math.max(0, Number(current?.remaining_stock || 0) - qty);
          await db.from('promotions').update({ remaining_stock: remaining }).eq('id', itemPromotionId);
          emitToAll('promotion:updated', { id: itemPromotionId, remaining_stock: remaining });
        } else {
          const { data: current } = await db.from('promotions').select('remaining_stock').eq('id', itemPromotionId).single();
          emitToAll('promotion:updated', { id: itemPromotionId, remaining_stock: current?.remaining_stock });
        }
      }
      emitToAdmins('order:new', order);
    } catch {}
  }

  res.json({ received: true });
};
