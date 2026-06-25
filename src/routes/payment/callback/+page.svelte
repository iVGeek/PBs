<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let status = $state('Verifying payment...');

  onMount(async () => {
    const ref = $page.url.searchParams.get('reference');
    if (!ref) {
      status = 'No payment reference found.';
      return;
    }
    const res = await fetch(`/api/paystack/verify?reference=${ref}`);
    const data = await res.json();
    if (data.status && data.data?.status === 'success') {
      const userRes = await fetch('/api/user/paid', { method: 'PUT' });
      if (userRes.ok) {
        status = 'Payment verified! Redirecting...';
        setTimeout(() => goto('/'), 1500);
        return;
      }
    }
    status = 'Payment verification failed. Please contact support.';
  });
</script>

<div class="min-h-[70vh] flex items-center justify-center">
  <div class="card max-w-md w-full text-center" style="padding: 3rem 2rem;">
    <div class="text-5xl mb-4">{status.includes('failed') ? '❌' : status.includes('Redirecting') ? '✅' : '⏳'}</div>
    <h1 class="text-xl font-bold mb-2">Payment {status.includes('failed') ? 'Failed' : status.includes('Redirecting') ? 'Successful' : 'Processing'}</h1>
    <p style="color: var(--text-secondary);">{status}</p>
  </div>
</div>
