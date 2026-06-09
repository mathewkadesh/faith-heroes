const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export async function createPayPalOrder(items) {
  const response = await fetch(`${BASE_URL}/payments/paypal/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not create PayPal order');
  return data.orderId;
}

export async function capturePayPalOrder(orderId) {
  const response = await fetch(`${BASE_URL}/payments/paypal/capture-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not capture PayPal order');
  return data;
}
