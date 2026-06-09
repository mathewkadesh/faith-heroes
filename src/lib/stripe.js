import { loadStripe } from '@stripe/stripe-js';
import { paymentAPI } from './api';

export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export async function createStripeSession(items, customerEmail, shippingAddress, isGift, giftMessage) {
  const { data } = await paymentAPI.createStripeSession({
    items,
    customer_email: customerEmail,
    shipping_address: shippingAddress,
    is_gift: isGift,
    gift_message: giftMessage,
  });
  return data;
}
