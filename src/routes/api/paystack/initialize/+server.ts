import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { KES_FALLBACK_AMOUNT } from '$lib/server/currency';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, url, locals }) => {
  const { email, currency, amount } = await request.json();
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return json({ status: false, message: 'A valid email is required for payment.' }, { status: 400 });
  }
  const baseUrl = env.PUBLIC_BASE_URL || url.origin;

  if (locals.user && locals.user.email !== cleanEmail) {
    await db.update(userTable).set({ email: cleanEmail }).where(eq(userTable.id, locals.user.id));
  }

  async function tryPaystack(cur: string, amt: number) {
    return fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: cleanEmail, amount: amt, currency: cur, callback_url: `${baseUrl}/payment/callback` }),
    }).then(r => r.json());
  }

  let data = await tryPaystack(currency || 'KES', amount || KES_FALLBACK_AMOUNT);

  if (!data.status && data.code === 'unsupported_currency' && currency !== 'KES') {
    data = await tryPaystack('KES', KES_FALLBACK_AMOUNT);
    data._fallbackFrom = currency;
  }

  return json(data);
};