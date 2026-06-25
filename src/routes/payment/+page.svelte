<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let loading = $state(false);
  let paid = $state($page.data.user?.paid || false);
  let user = $state($page.data.user);

  $effect(() => {
    user = $page.data.user;
    paid = user?.paid || false;
  });

  async function initPayment() {
    loading = true;
    const res = await fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user?.email || 'runner@example.com' }),
    });
    const data = await res.json();
    loading = false;
    if (data.status && data.data?.authorization_url) {
      window.location.href = data.data.authorization_url;
    }
  }
</script>

<div class="min-h-[70vh] flex items-center justify-center">
  <div class="card max-w-md w-full text-center" style="padding: 3rem 2rem;">
    {#if paid}
      <div class="text-5xl mb-4">✅</div>
      <h1 class="text-2xl font-bold mb-2">Already Paid!</h1>
      <p class="mb-6" style="color: var(--text-secondary);">You have full access to Medal Holder.</p>
      <button class="btn btn-primary" onclick={() => goto('/')}>Go to Medal Wall</button>
    {:else}
      <div class="text-5xl mb-4">🔓</div>
      <h1 class="text-2xl font-bold mb-2">Unlock Full Access</h1>
      <p class="mb-2" style="color: var(--text-secondary);">One-time payment of</p>
      <p class="text-3xl font-bold mb-6" style="color: var(--accent);">R5,000</p>
      <ul class="text-left mb-6 space-y-2 text-sm" style="color: var(--text-secondary);">
        <li>✓ Unlimited medal storage</li>
        <li>✓ Strava activity import</li>
        <li>✓ Premium themes & fonts</li>
        <li>✓ Personal best tracking</li>
        <li>✓ Bib number collection</li>
      </ul>
      <button class="btn btn-primary w-full" onclick={initPayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay with Paystack'}
      </button>
      <p class="mt-3 text-xs" style="color: var(--text-secondary);">Secure payment via Paystack</p>
    {/if}
  </div>
</div>
