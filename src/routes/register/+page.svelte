<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { applyTheme, themes, fonts } from '$lib/theme';
  import { goto } from '$app/navigation';

  let step = $state(1);
  let name = $state($page.data.user?.name || '');
  let avatar = $state($page.data.user?.avatar || '');
  let bio = $state($page.data.user?.bio || '');
  let units = $state($page.data.user?.units || 'km');
  let selectedTheme = $state(themes[0]);

  function next() {
    if (step < 5) step++;
    if (step === 5) {
      applyTheme();
    }
  }

  function prev() {
    if (step > 1) step--;
  }

  async function finish() {
    const res = await fetch('/api/user/onboard', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, avatar, bio, units, theme: selectedTheme.bodyClass }),
    });
    if (res.ok) {
      goto('/payment');
    }
  }
</script>

<div class="min-h-[70vh] flex items-center justify-center">
  <div class="card max-w-lg w-full" style="padding: 2.5rem 2rem;">
    <div class="flex gap-1 mb-8 justify-center">
      {#each Array(5) as _, i}
        <div class="h-1 rounded-full transition-all duration-300" style="width: {i + 1 === step ? '2rem' : '1rem'}; background: {i < step ? 'var(--accent)' : 'var(--border)'};"></div>
      {/each}
    </div>

    {#if step === 1}
      <div class="text-center">
        <div class="text-4xl mb-4">👋</div>
        <h2 class="text-xl font-bold mb-4">What's your name?</h2>
        <input class="input text-center text-lg" bind:value={name} placeholder="Your name" />
      </div>
    {:else if step === 2}
      <div class="text-center">
        <div class="text-4xl mb-4">📸</div>
        <h2 class="text-xl font-bold mb-4">Profile photo</h2>
        {#if avatar}
          <img src={avatar} alt="" class="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
        {/if}
        <input class="input text-center" bind:value={avatar} placeholder="Avatar URL (optional)" />
      </div>
    {:else if step === 3}
      <div class="text-center">
        <div class="text-4xl mb-4">✍️</div>
        <h2 class="text-xl font-bold mb-4">About you</h2>
        <textarea class="input text-center min-h-[100px] resize-none" bind:value={bio} placeholder="Tell us about yourself as a runner..."></textarea>
      </div>
    {:else if step === 4}
      <div class="text-center">
        <div class="text-4xl mb-4">📏</div>
        <h2 class="text-xl font-bold mb-4">Preferred units</h2>
        <div class="flex gap-3 justify-center mt-4">
          {#each ['km', 'miles'] as u}
            <button class="btn {units === u ? 'btn-primary' : 'btn-secondary'}" onclick={() => units = u}>
              {u === 'km' ? 'Kilometers' : 'Miles'}
            </button>
          {/each}
        </div>
      </div>
    {:else if step === 5}
      <div class="text-center">
        <div class="text-4xl mb-4">🎨</div>
        <h2 class="text-xl font-bold mb-4">Choose your theme</h2>
        <div class="grid grid-cols-3 gap-2 mt-4">
          {#each themes as t}
            <button class="rounded-lg p-3 text-xs font-medium transition-all" style="background: {t.bodyClass === selectedTheme.bodyClass ? 'var(--accent)' : 'var(--surface-3)'}; color: {t.bodyClass === selectedTheme.bodyClass ? '#000' : 'var(--text-primary)'}; border: 1px solid var(--border); cursor: pointer;" onclick={() => { selectedTheme = t; localStorage.setItem('mh_theme', JSON.stringify(t)); applyTheme(); }}>
              {t.name}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <div class="flex justify-between mt-8">
      <button class="btn btn-secondary" onclick={prev} disabled={step === 1}>Back</button>
      {#if step < 5}
        <button class="btn btn-primary" onclick={next} disabled={step === 1 && !name.trim()}>Next</button>
      {:else}
        <button class="btn btn-primary" onclick={finish}>Finish</button>
      {/if}
    </div>
  </div>
</div>
