const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// Obtenir un token d'accès PayPal
async function getPaypalAccessToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  if (!data.access_token) throw new Error('PayPal auth failed');
  return data.access_token;
}

// Créer une commande PayPal
// shippingCost = 0 si livraison offerte
async function createPaypalOrder(subtotal, description, referenceId, shippingCost = 0) {
  const token = await getPaypalAccessToken();

  const itemTotal    = parseFloat(subtotal).toFixed(2);
  const shipping     = parseFloat(shippingCost).toFixed(2);
  const grandTotal   = (parseFloat(itemTotal) + parseFloat(shipping)).toFixed(2);

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: referenceId,
          description,
          amount: {
            currency_code: 'EUR',
            value: grandTotal,
            breakdown: {
              item_total: { currency_code: 'EUR', value: itemTotal },
              shipping:   { currency_code: 'EUR', value: shipping },
            },
          },
        },
      ],
      application_context: {
        brand_name: 'FaStyle',
        locale: 'fr-FR',
        return_url: `${process.env.CLIENT_URL}/payment/success`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      },
    }),
  });

  const data = await response.json();
  if (!data.id) throw new Error('PayPal order creation failed');
  return data;
}

// Capturer un paiement PayPal
async function capturePaypalOrder(orderId) {
  const token = await getPaypalAccessToken();

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  if (data.status !== 'COMPLETED') throw new Error('PayPal capture failed');

  // Extraire l'ID de capture pour les remboursements futurs
  const captureId =
    data.purchase_units?.[0]?.payments?.captures?.[0]?.id;

  return { data, captureId };
}

// Rembourser un paiement PayPal
async function refundPaypalCapture(captureId, amount, note) {
  const token = await getPaypalAccessToken();

  const body = note ? { note_to_payer: note } : {};
  if (amount) {
    body.amount = { currency_code: 'EUR', value: parseFloat(amount).toFixed(2) };
  }

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/payments/captures/${captureId}/refund`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  if (data.status !== 'COMPLETED') throw new Error('PayPal refund failed');
  return data;
}

module.exports = {
  createPaypalOrder,
  capturePaypalOrder,
  refundPaypalCapture,
};
