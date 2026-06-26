export const BASE_AMOUNT_KES = 50000;

const acceptLanguageCountry: Record<string, string> = {
  sw: 'KE', en: 'KE', om: 'KE', luo: 'KE', kam: 'KE',
  ha: 'NG', ig: 'NG', yo: 'NG', ff: 'NG',
  ak: 'GH', ee: 'GH', ga: 'GH',
  af: 'ZA', st: 'ZA', tn: 'ZA', ts: 'ZA', ve: 'ZA', xh: 'ZA', zu: 'ZA', nr: 'ZA', ss: 'ZA', nso: 'ZA',
  ar: 'EG',
  wo: 'SN',
  sg: 'CF',
};

const langRegion: Record<string, string> = {
  'en-US': 'US', 'en-GB': 'GB', 'en-CA': 'CA', 'en-AU': 'AU', 'en-NZ': 'NZ',
  'en-ZA': 'ZA', 'en-NG': 'NG', 'en-GH': 'GH', 'en-KE': 'KE',
  'fr-FR': 'FR', 'fr-CA': 'CA', 'fr-CH': 'CH', 'fr-BE': 'BE',
  'de-DE': 'DE', 'de-CH': 'CH', 'de-AT': 'AT',
  'es-ES': 'ES', 'es-MX': 'MX', 'es-AR': 'AR',
  'pt-PT': 'PT', 'pt-BR': 'BR',
  'it-IT': 'IT', 'it-CH': 'CH',
  'nl-NL': 'NL', 'nl-BE': 'BE',
  'sv-SE': 'SE', 'da-DK': 'DK', 'fi-FI': 'FI', 'nb-NO': 'NO',
  'pl-PL': 'PL', 'cs-CZ': 'CZ', 'hu-HU': 'HU',
  'ja-JP': 'JP', 'ko-KR': 'KR', 'zh-CN': 'CN', 'zh-TW': 'TW',
  'ar-SA': 'SA', 'ar-AE': 'AE', 'ar-EG': 'EG',
  'hi-IN': 'IN', 'ta-IN': 'IN', 'te-IN': 'IN', 'mr-IN': 'IN',
  'th-TH': 'TH', 'vi-VN': 'VN', 'id-ID': 'ID',
  'tr-TR': 'TR', 'ru-RU': 'RU',
  'sw-KE': 'KE', 'ha-NG': 'NG', 'yo-NG': 'NG', 'ig-NG': 'NG',
  'af-ZA': 'ZA', 'zu-ZA': 'ZA', 'xh-ZA': 'ZA',
};

const regionCurrency: Record<string, string> = {
  KE: 'KES', UG: 'KES', TZ: 'KES', RW: 'KES', BI: 'KES', SS: 'KES', ET: 'KES',
  NG: 'NGN',
  GH: 'GHS',
  ZA: 'ZAR', NA: 'ZAR', LS: 'ZAR', SZ: 'ZAR',
  BW: 'ZAR', ZM: 'ZAR', ZW: 'ZAR',
  EG: 'EGP',
  SN: 'XOF', CI: 'XOF', BJ: 'XOF', BF: 'XOF', ML: 'XOF', NE: 'XOF', TG: 'XOF',
  CM: 'XAF', CF: 'XAF', TD: 'XAF', CG: 'XAF', GQ: 'XAF', GA: 'XAF',
};

export const currencyInfo: Record<string, { symbol: string; label: string; code: string }> = {
  KES: { symbol: 'Ksh', label: 'Kenyan Shilling', code: 'KES' },
  NGN: { symbol: '₦', label: 'Nigerian Naira', code: 'NGN' },
  GHS: { symbol: 'GH₵', label: 'Ghanaian Cedi', code: 'GHS' },
  ZAR: { symbol: 'R', label: 'South African Rand', code: 'ZAR' },
  USD: { symbol: '$', label: 'US Dollar', code: 'USD' },
  EGP: { symbol: 'E£', label: 'Egyptian Pound', code: 'EGP' },
  XOF: { symbol: 'CFA', label: 'West African CFA', code: 'XOF' },
  XAF: { symbol: 'FCFA', label: 'Central African CFA', code: 'XAF' },
};

let ratesCache: { rates: Record<string, number>; expires: number } | null = null;

export async function getExchangeRates(): Promise<Record<string, number>> {
  if (ratesCache && ratesCache.expires > Date.now()) {
    return ratesCache.rates;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://open.er-api.com/v6/latest/KES', { signal: controller.signal });
    clearTimeout(timeout);
    const data = await res.json();
    if (data.result === 'success' && data.rates) {
      ratesCache = { rates: data.rates, expires: Date.now() + 3600000 };
      return data.rates;
    }
  } catch {
    if (ratesCache) return ratesCache.rates;
  }
  return { KES: 1, NGN: 10.5, GHS: 0.087, ZAR: 0.128, USD: 0.0077, EGP: 0.38, XOF: 4.45, XAF: 4.45 };
}

export async function convertAmount(currency: string): Promise<{ amount: number; display: string }> {
  const rates = await getExchangeRates();
  const rate = rates[currency];
  if (!rate) return { amount: BASE_AMOUNT_KES * 100, display: `Ksh${BASE_AMOUNT_KES.toLocaleString()}.00` };
  const amountInSmallestUnit = Math.round(BASE_AMOUNT_KES * rate * 100);
  const info = currencyInfo[currency] || currencyInfo.KES;
  const display = `${info.symbol}${(amountInSmallestUnit / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return { amount: amountInSmallestUnit, display };
}

function parseAcceptLanguage(header: string): string | null {
  if (!header) return null;
  const langs = header.split(',').map(s => s.trim().split(';')[0].trim());
  for (const lang of langs) {
    if (!lang) continue;
    if (langRegion[lang]) return langRegion[lang];
    const parts = lang.split('-');
    if (parts.length >= 2) return parts[1].toUpperCase();
    if (acceptLanguageCountry[parts[0]]) return acceptLanguageCountry[parts[0]];
  }
  return null;
}

export function getCurrencyFromRequest(request: Request): string {
  const acceptLanguage = request.headers.get('accept-language') || '';
  const region = parseAcceptLanguage(acceptLanguage);
  if (region && regionCurrency[region]) return regionCurrency[region];
  return 'KES';
}

export async function getPaymentData(request: Request): Promise<{
  currency: { symbol: string; label: string; code: string };
  amount: number;
  displayAmount: string;
}> {
  const currencyCode = getCurrencyFromRequest(request);
  const info = currencyInfo[currencyCode] || currencyInfo.KES;
  const { amount, display } = await convertAmount(currencyCode);
  return { currency: info, amount, displayAmount: display };
}
