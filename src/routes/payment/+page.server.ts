import type { PageServerLoad } from './$types';
import { getPaymentData } from '$lib/server/currency';

export const load: PageServerLoad = async ({ request }) => {
  return getPaymentData(request);
};
