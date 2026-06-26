import type { PageServerLoad } from './$types';
import { getCurrencyFromIP, getClientIP, currencyInfo, DEFAULT_CURRENCY, DEFAULT_AMOUNT, formatAmount } from '$lib/server/currency';

export const load: PageServerLoad = async ({ request }) => {
  const ip = getClientIP(request);
  const currency = getCurrencyFromIP(ip);
  return {
    currency: currencyInfo[currency] || currencyInfo[DEFAULT_CURRENCY],
    amount: DEFAULT_AMOUNT,
    displayAmount: formatAmount(DEFAULT_AMOUNT, currency),
  };
};
