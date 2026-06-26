import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
  const { email, currency, amount } = await request.json();
  const baseUrl = env.PUBLIC_BASE_URL || url.origin;

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amount || 5000000,
      currency: currency || 'KES',
      callback_url: `${baseUrl}/payment/callback`,
    }),
  });

  const data = await res.json();
  return json(data);
};
