import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const { user } = locals;
  const path = url.pathname;
  const publicRoutes = ['/login'];
  const isPublic = publicRoutes.some((r) => path.startsWith(r));
  const isApi = path.startsWith('/api');

  if (!user && !isPublic && !isApi) {
    redirect(302, '/login');
  }

  if (user && !user.onboardingComplete && path !== '/register') {
    redirect(302, '/register');
  }

  if (user && user.onboardingComplete && !user.paid && !path.startsWith('/payment')) {
    redirect(302, '/payment');
  }

  return { user };
};
