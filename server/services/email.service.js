const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = 'Faith Heroes <orders@faithheroes.co.uk>';

exports.sendOrderConfirmation = async (order, items, toEmail) => {
  const itemLines = items.map(i => `<li>${i.quantity}× item — £${Number(i.unit_price).toFixed(2)}</li>`).join('');

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `Order Confirmed — ${order.order_number || order.id}`,
    html: `
      <h2 style="color:#8B1A1A">Thank you for your order!</h2>
      <p>Your Faith Heroes gift box is being prepared with love.</p>
      <p><strong>Order reference:</strong> ${order.order_number || order.id}</p>
      <p><strong>Total:</strong> £${Number(order.total_amount).toFixed(2)}</p>
      <ul>${itemLines}</ul>
      <p>We'll email you again when your order ships.</p>
      <p style="color:#C9A84C">— The Faith Heroes Team</p>
    `,
  });
};

exports.sendShippingNotification = async (order) => {
  const toEmail = order.shipping_email || order.profiles?.email;
  if (!toEmail) return;

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `Your Faith Heroes order has shipped!`,
    html: `
      <h2 style="color:#8B1A1A">Your order is on its way!</h2>
      <p><strong>Order:</strong> ${order.order_number || order.id}</p>
      ${order.carrier ? `<p><strong>Carrier:</strong> ${order.carrier}</p>` : ''}
      ${order.tracking_number ? `<p><strong>Tracking number:</strong> ${order.tracking_number}</p>` : ''}
      ${order.tracking_url ? `<p><a href="${order.tracking_url}" style="color:#C9A84C">Track your parcel</a></p>` : ''}
      ${order.estimated_delivery ? `<p><strong>Estimated delivery:</strong> ${order.estimated_delivery}</p>` : ''}
      <p style="color:#C9A84C">— The Faith Heroes Team</p>
    `,
  });
};
