<script lang="ts">
  import { onMount } from 'svelte';
  import { distanceOptions, distMap, distEmoji } from '$lib/utils';

  let bibs = $state<any[]>([]);
  let showForm = $state(false);
  let lightboxPhoto = $state('');
  let loaded = $state(false);

  let bibNumber = $state('');
  let eventName = $state('');
  let eventDate = $state('');
  let distance = $state('');
  let notes = $state('');
  let photoUrl = $state('');
  let photoPreview = $state('');
  let editingId = $state<string | null>(null);

  async function loadBibs() {
    const res = await fetch('/api/bibs');
    if (res.ok) { bibs = await res.json(); loaded = true; }
  }

  onMount(loadBibs);

  function handlePhoto(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    readImage(file).then((r) => { photoUrl = r; photoPreview = r; });
  }

  function readImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const MAX = 1200;
          let { width, height } = img;
          const scale = Math.min(1, MAX / Math.max(width, height));
          width = Math.round(width * scale);
          height = Math.round(height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(reader.result as string); return; }
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            resolve(dataUrl);
          } catch {
            resolve(reader.result as string);
          }
        };
        img.onerror = () => resolve(reader.result as string);
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  async function addBib() {
    if (!bibNumber.trim() || !eventName.trim() || !eventDate) return;
    if (editingId) {
      const res = await fetch('/api/bibs', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, bibNumber: bibNumber.trim(), eventName: eventName.trim(), eventDate, distance: distance || null, photoUrl: photoUrl || null, notes: notes || null }),
      });
      if (res.ok) { showForm = false; editingId = null; photoPreview = ''; photoUrl = ''; await loadBibs(); }
      return;
    }
    const res = await fetch('/api/bibs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bibNumber: bibNumber.trim(), eventName: eventName.trim(), eventDate, distance: distance || undefined, photoUrl: photoUrl || undefined, notes: notes || undefined }),
    });
    if (res.ok) {
      showForm = false;
      bibNumber = ''; eventName = ''; eventDate = ''; distance = ''; notes = ''; photoUrl = ''; photoPreview = '';
      await loadBibs();
    }
  }

  function openEdit(bib: any) {
    editingId = bib.id;
    bibNumber = bib.bibNumber;
    eventName = bib.eventName;
    eventDate = new Date(bib.eventDate).toISOString().slice(0, 10);
    distance = bib.distance || '';
    notes = bib.notes || '';
    photoUrl = bib.photoUrl || '';
    photoPreview = bib.photoUrl || '';
    showForm = true;
  }

  async function deleteBib(id: string) {
    if (!confirm('Remove this bib? This cannot be undone.')) return;
    await fetch(`/api/bibs?id=${id}`, { method: 'DELETE' });
    await loadBibs();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { showForm = false; lightboxPhoto = ''; editingId = null; }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if lightboxPhoto}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="lightbox-overlay" onclick={() => lightboxPhoto = ''}>
    <img src={lightboxPhoto} alt="Full size" />
  </div>
{/if}

<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-2xl font-extrabold tracking-tight">Bib Collection</h1>
    <p class="text-sm mt-0.5" style="color: var(--text-secondary);">{bibs.length} bib{bibs.length !== 1 ? 's' : ''}</p>
  </div>
  <button class="btn btn-primary btn-sm" onclick={() => showForm = true}>+ Add Bib</button>
</div>

{#if bibs.length > 0}
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
    {#each bibs as bib (bib.id)}
      <div class="card overflow-hidden group" style="padding: 0; cursor: pointer;" onclick={() => bib.photoUrl && (lightboxPhoto = bib.photoUrl)}>
        {#if bib.photoUrl}
          <div class="relative" style="height: 180px;">
            <img src={bib.photoUrl} alt={bib.eventName} loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" />
            <div class="absolute inset-0" style="background: linear-gradient(transparent 50%, rgba(0,0,0,0.8));"></div>
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <div class="text-lg font-extrabold text-white">{bib.bibNumber}</div>
              <div class="text-xs text-white/70">{bib.eventName}</div>
            </div>
          </div>
        {:else}
          <div class="flex items-center justify-center" style="height: 140px; background: linear-gradient(135deg, var(--surface-3), var(--surface));">
            <div class="text-center">
              <div class="text-4xl font-extrabold" style="color: var(--accent);">{bib.bibNumber}</div>
              <div class="text-xs mt-1" style="color: var(--text-secondary);">Bib Number</div>
            </div>
          </div>
        {/if}
        <div class="p-4">
          <h3 class="font-bold text-sm">{bib.eventName}</h3>
          <div class="flex items-center gap-2 text-xs mt-1" style="color: var(--text-secondary);">
            <span>{new Date(bib.eventDate).toLocaleDateString()}</span>
            {#if bib.distance}
              <span class="badge text-[9px]">{distEmoji[bib.distance] || ''} {distMap[bib.distance] || bib.distance}</span>
            {/if}
          </div>
          {#if bib.notes}
            <p class="text-xs mt-2" style="color: var(--text-secondary);">{bib.notes}</p>
          {/if}
          <div class="flex justify-end mt-2 gap-2">
            <button class="btn btn-secondary btn-xs" onclick={(e) => { e.stopPropagation(); openEdit(bib); }}>Edit</button>
            <button class="btn btn-danger btn-xs" onclick={(e) => { e.stopPropagation(); deleteBib(bib.id); }}>Remove</button>
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else if loaded}
  <div class="card text-center" style="padding: 5rem 2rem;">
    <div class="text-6xl mb-5">🎫</div>
    <h3 class="text-xl font-bold mb-2">No bibs yet</h3>
    <p class="text-sm mb-6" style="color: var(--text-secondary); max-width: 320px; margin: 0 auto;">
      Add the race bibs from your events to build your collection
    </p>
    <button class="btn btn-primary" onclick={() => showForm = true}>Add Your First Bib</button>
  </div>
{/if}

{#if showForm}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={() => { showForm = false; editingId = null; }}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold">{editingId ? 'Edit Bib' : 'Add Bib'}</h2>
        <button onclick={() => { showForm = false; editingId = null; }} style="border: none; background: none; cursor: pointer; color: var(--text-secondary);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="b-num">Bib Number</label>
            <input id="b-num" class="input" bind:value={bibNumber} placeholder="12345" />
          </div>
          <div>
            <label class="label" for="b-date">Date</label>
            <input id="b-date" class="input" type="date" bind:value={eventDate} />
          </div>
        </div>
        <div>
          <label class="label" for="b-event">Event Name</label>
          <input id="b-event" class="input" bind:value={eventName} placeholder="Two Oceans Marathon" />
        </div>
        <div>
          <label class="label" for="b-dist">Distance (optional)</label>
          <select id="b-dist" class="input" bind:value={distance}>
            <option value="">Any</option>
            {#each distanceOptions as d}
              <option value={d}>{distMap[d] || d}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="label" for="b-photo">Photo (optional)</label>
          <input id="b-photo" class="input" type="file" accept="image/*" onchange={handlePhoto} style="padding: 0.5rem;" />
        </div>
        {#if photoPreview}
          <div class="w-full h-28 rounded-xl overflow-hidden" style="border: 1px solid var(--border);">
            <img src={photoPreview} alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        {/if}
        <div>
          <label class="label" for="b-notes">Notes (optional)</label>
          <textarea id="b-notes" class="input" style="min-height: 60px; resize: vertical;" bind:value={notes} placeholder="Race details..."></textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-6">
        <button class="btn btn-secondary flex-1" onclick={() => { showForm = false; editingId = null; }}>Cancel</button>
        <button class="btn btn-primary flex-1" onclick={addBib} disabled={!bibNumber.trim() || !eventName.trim() || !eventDate}>{editingId ? 'Save Changes' : 'Save Bib'}</button>
      </div>
    </div>
  </div>
{/if}
