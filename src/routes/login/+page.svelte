<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="min-h-[80vh] flex items-center justify-center">
  <div class="card max-w-md w-full text-center" style="padding: 3rem 2rem;">
    <div class="text-5xl mb-4">🏅</div>
    <h1 class="text-2xl font-bold mb-2">Medal Holder</h1>
    <p class="mb-8" style="color: var(--text-secondary);">Your personal race medal portfolio</p>
    <a href="/api/strava/auth" class="btn btn-primary w-full" style="padding: 0.75rem;">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      Continue with Strava
    </a>
    <p class="mt-4 text-xs" style="color: var(--text-secondary);">Connect your Strava account to get started</p>
  </div>
</div>
