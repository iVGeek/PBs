export function getPaystackPublicKey(): string {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''
}

export function paystackInitializeUrl(): string {
  return '/api/paystack/initialize'
}

export function paystackVerifyUrl(): string {
  return '/api/paystack/verify'
}
