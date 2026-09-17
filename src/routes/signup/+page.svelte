<script lang="ts">
  import { page } from '$app/stores';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let formError = $state('');
  let stravaError = $state($page.url.searchParams.get('error'));

  const errors: Record<string, string> = {
    no_code: 'Strava sign-in was cancelled. Please try again.',
    token_exchange_failed: 'Strava sign-in failed. Please try again.',
  };

  $effect(() => {
    stravaError = $page.url.searchParams.get('error');
  });

  async function signup() {
    formError = '';
    if (!email.trim() || !password || !name.trim()) {
      formError = 'Please fill in all fields.';
      return;
    }
    if (password.length < 8) {
      formError = 'Password must be at least 8 characters.';
      return;
    }
    loading = true;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      loading = false;
      if (data.success) {
        window.location.href = '/register';
        return;
      }
      formError = data.error || 'Sign up failed. Please try again.';
    } catch {
      loading = false;
      formError = 'Network error. Please try again.';
    }
  }
</script>

<div class="min-h-[80vh] flex items-center justify-center">
  <div class="card max-w-md w-full text-center card-interactive" style="padding: 3.5rem 2.5rem;">
    <div class="text-6xl mb-5">🏆</div>
    <h1 class="text-3xl font-extrabold mb-2 tracking-tight">RaceWall</h1>
    <p class="text-sm mb-8" style="color: var(--text-secondary);">Create your account. Track medals, bibs, and personal bests.</p>

    <!-- Email / Password -->
    <form
      class="space-y-3 mb-5 text-left"
      onsubmit={(e) => { e.preventDefault(); signup(); }}
    >
      <input class="input w-full" type="text" bind:value={name} placeholder="Your name" autocomplete="name" required />
      <input class="input w-full" type="email" bind:value={email} placeholder="Email" autocomplete="email" required />
      <input class="input w-full" type="password" bind:value={password} placeholder="Password (8+ characters)" autocomplete="new-password" required />
      {#if formError}
        <p class="text-xs font-medium" style="color: #f87171;">{formError}</p>
      {/if}
      <button class="btn btn-primary w-full" type="submit" disabled={loading || !email || !password || !name} style="padding: 0.75rem;">
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>

    <div class="flex items-center gap-3 mb-5">
      <div class="flex-1 h-px" style="background: var(--border);"></div>
      <span class="text-[11px] font-semibold uppercase" style="color: var(--text-secondary);">or</span>
      <div class="flex-1 h-px" style="background: var(--border);"></div>
    </div>

    <a href="/api/strava/auth" class="btn btn-secondary w-full" style="padding: 0.875rem; font-size: 1rem;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
      Continue with Strava
    </a>

    {#if stravaError}
      <p class="mt-3 text-xs font-medium" style="color: #f87171;">{errors[stravaError] || 'Strava sign-in failed. Please try again.'}</p>
    {/if}

    <p class="mt-6 text-sm" style="color: var(--text-secondary);">
      Already have an account?
      <a href="/login" style="color: var(--accent); font-weight: 600;">Log in</a>
    </p>
  </div>
</div>