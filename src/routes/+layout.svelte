<script lang="ts">
  import './layout.css';
  import { page } from '$app/stores';
  import { applyTheme, applyFont } from '$lib/theme';
  let { children, data } = $props();
  $effect(() => { applyTheme(); applyFont(); });
</script>

<svelte:head>
  <title>RaceWall</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏆</text></svg>" />
</svelte:head>

{#if data.user}
  <nav class="sticky top-0 z-50 border-b" style="border-color: var(--border); background: var(--surface); backdrop-filter: blur(12px);">
    <div class="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">
      <div class="flex items-center gap-8">
        <a href="/" class="flex items-center gap-2 no-underline">
          <span style="font-size: 1.5rem;">🏆</span>
          <span class="text-lg font-extrabold tracking-tight" style="color: var(--accent);">RaceWall</span>
        </a>
        <div class="hidden md:flex items-center gap-1">
          <a href="/" class="nav-link" class:active={$page.url.pathname === '/'}>Dashboard</a>
          <a href="/pbs" class="nav-link" class:active={$page.url.pathname === '/pbs'}>Trophy Room</a>
          <a href="/bibs" class="nav-link" class:active={$page.url.pathname === '/bibs'}>Bibs</a>
          <a href="/theme" class="nav-link" class:active={$page.url.pathname === '/theme'}>Theme</a>
        </div>
      </div>
      <div class="flex items-center gap-3">
        {#if data.user.avatar}
          <img src={data.user.avatar} alt="" class="w-8 h-8 rounded-full object-cover border" style="border-color: var(--border);" />
        {/if}
        <span class="text-sm font-medium hidden sm:inline" style="color: var(--text-secondary);">{data.user.name}</span>
        <form action="/login" method="get">
          <button class="btn btn-ghost btn-xs" type="submit">Logout</button>
        </form>
      </div>
    </div>
  </nav>
{/if}

<main class="max-w-6xl mx-auto px-4 md:px-6 py-6" style="min-height: calc(100vh - 4rem);">
  {@render children()}
</main>

{#if data.user}
  <div class="bottom-nav">
    <a href="/" class:active={$page.url.pathname === '/'}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
      Home
    </a>
    <a href="/pbs" class:active={$page.url.pathname === '/pbs'}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
      Trophies
    </a>
    <a href="/bibs" class:active={$page.url.pathname === '/bibs'}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
      Bibs
    </a>
    <a href="/theme" class:active={$page.url.pathname === '/theme'}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
      Theme
    </a>
  </div>
{/if}
