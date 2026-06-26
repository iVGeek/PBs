import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const geoip = require('geoip-lite');

const countryCurrency: Record<string, string> = {
  NG: 'NGN',
  GH: 'GHS',
  ZA: 'ZAR',
  KE: 'KES',
  US: 'USD',
  GB: 'USD',
  CA: 'USD',
  AU: 'USD',
  DE: 'USD',
  FR: 'USD',
};

export const currencyInfo: Record<string, { symbol: string; label: string; code: string }> = {
  NGN: { symbol: '₦', label: 'Nigerian Naira', code: 'NGN' },
  GHS: { symbol: 'GH₵', label: 'Ghanaian Cedi', code: 'GHS' },
  ZAR: { symbol: 'R', label: 'South African Rand', code: 'ZAR' },
  KES: { symbol: 'Ksh', label: 'Kenyan Shilling', code: 'KES' },
  USD: { symbol: '$', label: 'US Dollar', code: 'USD' },
};

export const DEFAULT_CURRENCY = 'NGN';
export const DEFAULT_AMOUNT = 500000;

export function getCurrencyFromIP(ip: string): string {
  const lookup = geoip.lookup(ip);
  if (lookup?.country && countryCurrency[lookup.country]) {
    return countryCurrency[lookup.country];
  }
  return DEFAULT_CURRENCY;
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    if (ip && ip !== '::1' && ip !== '127.0.0.1') return ip;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp !== '::1' && realIp !== '127.0.0.1') return realIp;
  return '127.0.0.1';
}

export function formatAmount(amount: number, currency: string): string {
  const info = currencyInfo[currency] || currencyInfo[DEFAULT_CURRENCY];
  return `${info.symbol}${(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
