<script lang="ts">
  import { onMount } from 'svelte';
  import { distanceOptions, distMap } from '$lib/utils';

  let bibs = $state<any[]>([]);
  let showForm = $state(false);
  let bibNumber = $state('');
  let eventName = $state('');
  let eventDate = $state('');
  let distance = $state('');
  let notes = $state('');

  async function loadBibs() {
    const res = await fetch('/api/bibs');
    if (res.ok) bibs = await res.json();
  }

  onMount(loadBibs);

  async function addBib() {
    if (!bibNumber.trim() || !eventName.trim() || !eventDate) return;
    const res = await fetch('/api/bibs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bibNumber: bibNumber.trim(), eventName: eventName.trim(), eventDate, distance: distance || undefined, notes: notes || undefined }),
    });
    if (res.ok) {
      showForm = false;
      bibNumber = ''; eventName = ''; eventDate = ''; distance = ''; notes = '';
      await loadBibs();
    }
  }

  async function deleteBib(id: string) {
    await fetch(`/api/bibs?id=${id}`, { method: 'DELETE' });
    await loadBibs();
  }
</script>

<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-2xl font-bold">Bib Numbers</h1>
    <p class="text-sm" style="color: var(--text-secondary);">Your race bib collection · {bibs.length} bibs</p>
  </div>
  <button class="btn btn-primary text-sm" onclick={() => showForm = true}>+ Add Bib</button>
</div>

{#if bibs.length === 0}
  <div class="card text-center" style="padding: 3rem 2rem;">
    <div class="text-4xl mb-4">🎫</div>
    <h3 class="text-lg font-bold mb-2">No bibs yet</h3>
    <p class="text-sm" style="color: var(--text-secondary);">Add the bib numbers from your races</p>
    <button class="btn btn-primary mt-4" onclick={() => showForm = true}>Add Your First Bib</button>
  </div>
{/if}

<div class="grid gap-3">
  {#each bibs as bib (bib.id)}
    <div class="card">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-16 rounded-lg flex items-center justify-center text-lg font-bold" style="background: var(--accent-light); color: var(--accent);">
            {bib.bibNumber}
          </div>
          <div>
            <h3 class="font-bold">{bib.eventName}</h3>
            <p class="text-xs" style="color: var(--text-secondary);">
              {new Date(bib.eventDate).toLocaleDateString()}
              {#if bib.distance} · {distMap[bib.distance] || bib.distance}{/if}
            </p>
            {#if bib.notes}
              <p class="text-xs mt-1" style="color: var(--text-secondary);">{bib.notes}</p>
            {/if}
          </div>
        </div>
        <button class="text-xs btn btn-secondary" style="padding: 0.25rem 0.5rem;" onclick={() => deleteBib(bib.id)}>✕</button>
      </div>
    </div>
  {/each}
</div>

{#if showForm}
  <div class="modal-overlay" onclick={() => showForm = false}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <h2 class="text-lg font-bold mb-4">Add Bib</h2>
      <div class="space-y-3">
        <div>
          <label class="label">Bib Number</label>
          <input class="input" bind:value={bibNumber} placeholder="12345" />
        </div>
        <div>
          <label class="label">Event Name</label>
          <input class="input" bind:value={eventName} placeholder="Two Oceans Marathon" />
        </div>
        <div>
          <label class="label">Date</label>
          <input class="input" type="date" bind:value={eventDate} />
        </div>
        <div>
          <label class="label">Distance (optional)</label>
          <select class="input" bind:value={distance}>
            <option value="">Any</option>
            {#each distanceOptions as d}
              <option value={d}>{distMap[d] || d}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="label">Notes (optional)</label>
          <textarea class="input min-h-[60px]" bind:value={notes} placeholder="Race details..."></textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-6">
        <button class="btn btn-secondary flex-1" onclick={() => showForm = false}>Cancel</button>
        <button class="btn btn-primary flex-1" onclick={addBib} disabled={!bibNumber.trim() || !eventName.trim() || !eventDate}>Save</button>
      </div>
    </div>
  </div>
{/if}
