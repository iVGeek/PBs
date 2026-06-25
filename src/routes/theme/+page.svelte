<script lang="ts">
  import { applyTheme, setTheme, getTheme, themes, fonts, setFont, getFont, applyFont } from '$lib/theme';

  let currentTheme = $state(getTheme());
  let currentFont = $state(getFont());
  let customColor = $state('');

  function selectTheme(t: typeof themes[number]) {
    currentTheme = t;
    setTheme(t);
  }

  function selectFont(f: typeof fonts[number]) {
    currentFont = f;
    setFont(f);
  }

  function applyCustomColor() {
    if (customColor) {
      document.body.style.setProperty('--accent', customColor);
      document.body.style.setProperty('--accent-hover', customColor + 'dd');
      document.body.style.setProperty('--accent-light', customColor + '1f');
    }
  }
</script>

<div class="mb-6">
  <h1 class="text-2xl font-bold">Theme Studio</h1>
  <p class="text-sm" style="color: var(--text-secondary);">Customize your experience</p>
</div>

<div class="grid md:grid-cols-2 gap-6">
  <div class="card">
    <h2 class="font-bold mb-4">Themes</h2>
    <div class="grid grid-cols-3 gap-2">
      {#each themes as t}
        <button class="rounded-lg p-3 text-xs font-medium transition-all text-center" style="background: {t.bodyClass === currentTheme.bodyClass ? 'var(--accent)' : 'var(--surface-3)'}; color: {t.bodyClass === currentTheme.bodyClass ? '#000' : 'var(--text-primary)'}; border: 2px solid {t.bodyClass === currentTheme.bodyClass ? 'var(--accent)' : 'var(--border)'}; cursor: pointer;" onclick={() => selectTheme(t)}>
          <div class="w-full h-1 rounded-full mb-1" style="background: {t.accent};"></div>
          {t.name}
        </button>
      {/each}
    </div>
  </div>

  <div class="card">
    <h2 class="font-bold mb-4">Fonts</h2>
    <div class="space-y-2">
      {#each fonts as f}
        <button class="w-full text-left p-3 rounded-lg transition-all" style="background: {f.value === currentFont.value ? 'var(--accent-light)' : 'var(--surface-3)'}; border: 1px solid {f.value === currentFont.value ? 'var(--accent)' : 'var(--border)'}; cursor: pointer; font-family: {f.value};" onclick={() => selectFont(f)}>
          <span class="font-bold">{f.name}</span>
          <p class="text-xs mt-1" style="color: var(--text-secondary); font-family: {f.value};">The quick brown fox jumps over the lazy dog</p>
        </button>
      {/each}
    </div>
  </div>
</div>

<div class="card mt-6">
  <h2 class="font-bold mb-4">Custom Accent Color</h2>
  <div class="flex gap-3 items-end">
    <div class="flex-1">
      <label class="label">Hex color (e.g. #ff6b6b)</label>
      <input class="input" bind:value={customColor} placeholder="#a78bfa" />
    </div>
    <button class="btn btn-primary" onclick={applyCustomColor}>Apply</button>
  </div>
  <div class="flex gap-2 mt-3">
    {#each ['#ff6b6b', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0', '#ee5a24'] as color}
      <button class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110" style="background: {color}; border-color: {color === currentTheme.accent ? 'var(--accent)' : 'transparent'}; cursor: pointer;" onclick={() => { customColor = color; applyCustomColor(); }}></button>
    {/each}
  </div>
</div>
