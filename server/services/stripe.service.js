const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.refundPayment = async (paymentIntentId) => {
  return stripe.refunds.create({ payment_intent: paymentIntentId });
};
