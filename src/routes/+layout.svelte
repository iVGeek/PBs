<script lang="ts">
  import './layout.css';
  import { page } from '$app/stores';
  import { applyTheme, applyFont } from '$lib/theme';
  let { children, data } = $props();
  $effect(() => {
    applyTheme();
    applyFont();
  });
</script>

<svelte:head>
  <title>Medal Holder</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏅</text></svg>" />
  <meta name="description" content="Your personal race medal portfolio" />
</svelte:head>

<nav class="flex items-center justify-between px-4 md:px-6 py-3 border-b" style="border-color: var(--border); background: var(--surface); position: sticky; top: 0; z-index: 50;">
  <div class="flex items-center gap-6">
    <a href="/" class="text-lg font-bold" style="color: var(--accent); text-decoration: none;">MH</a>
    {#if data.user}
      <div class="hidden md:flex items-center gap-1">
        <a href="/" class="nav-link" class:active={$page.url.pathname === '/'}>Medals</a>
        <a href="/pbs" class="nav-link" class:active={$page.url.pathname === '/pbs'}>PBs</a>
        <a href="/bibs" class="nav-link" class:active={$page.url.pathname === '/bibs'}>Bibs</a>
        <a href="/theme" class="nav-link" class:active={$page.url.pathname === '/theme'}>Theme</a>
      </div>
    {/if}
  </div>
  <div class="flex items-center gap-3">
    {#if data.user}
      <span class="text-sm" style="color: var(--text-secondary);">{data.user.name}</span>
      <form action="/login" method="get">
        <button class="btn btn-secondary text-xs" type="submit">Logout</button>
      </form>
    {/if}
  </div>
</nav>

<main class="max-w-5xl mx-auto px-4 md:px-6 py-6">
  {@render children()}
</main>
