<script lang="ts">
  import { onMount } from 'svelte';
  import { distanceOptions, secondsToTime, secondsToPace, distMap } from '$lib/utils';
  import { goto } from '$app/navigation';

  let medals = $state<any[]>([]);
  let showForm = $state(false);
  let raceName = $state('');
  let eventDate = $state('');
  let distance = $state('5K');
  let hours = $state(0);
  let minutes = $state(0);
  let seconds = $state(0);
  let place = $state<number | null>(null);
  let photoUrl = $state('');
  let notes = $state('');

  let totalMedals = $derived(medals.length);
  let uniqueDistances = $derived(new Set(medals.map(m => m.distance)).size);
  let totalDistance = $derived(medals.reduce((sum: number, m: any) => {
    const d = parseFloat(m.distance);
    return sum + (isNaN(d) ? 0 : d);
  }, 0).toFixed(1));

  async function loadMedals() {
    const res = await fetch('/api/medals');
    if (res.ok) medals = await res.json();
  }

  onMount(loadMedals);

  async function addMedal() {
    if (!raceName.trim() || !eventDate) return;
    const timeSeconds = hours * 3600 + minutes * 60 + seconds;
    const res = await fetch('/api/medals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raceName: raceName.trim(), eventDate, distance, timeSeconds, place, photoUrl: photoUrl || undefined, notes: notes || undefined }),
    });
    if (res.ok) {
      showForm = false;
      raceName = ''; eventDate = ''; distance = '5K'; hours = 0; minutes = 0; seconds = 0; place = null; photoUrl = ''; notes = '';
      await loadMedals();
    }
  }

  async function deleteMedal(id: string) {
    await fetch(`/api/medals?id=${id}`, { method: 'DELETE' });
    await loadMedals();
  }

  async function importFromStrava() {
    const res = await fetch('/api/strava/import');
    const data = await res.json();
    if (data.activities) {
      const running = data.activities.filter((a: any) => a.type === 'Run');
      for (const act of running) {
        const d = (act.distance / 1000).toFixed(3);
        const dist = d === '5.000' ? '5K' : d === '10.000' ? '10K' : d === '21.097' ? '21.097' : d === '42.195' ? '42.195' : null;
        if (!dist || medals.some((m: any) => m.raceName === act.name)) continue;
        await fetch('/api/medals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raceName: act.name, eventDate: act.start_date, distance: dist, timeSeconds: Math.round(act.moving_time), place: null }),
        });
      }
      await loadMedals();
    }
  }
</script>

<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-2xl font-bold">Medal Wall</h1>
    <p class="text-sm" style="color: var(--text-secondary);">{totalMedals} medals · {uniqueDistances} distances</p>
  </div>
  <div class="flex gap-2">
    <button class="btn btn-secondary text-sm" onclick={importFromStrava}>Import Strava</button>
    <button class="btn btn-primary text-sm" onclick={() => showForm = true}>+ Add Medal</button>
  </div>
</div>

<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
  <div class="card text-center" style="padding: 1rem;">
    <div class="stat-value">{totalMedals}</div>
    <div class="stat-label">Medals</div>
  </div>
  <div class="card text-center" style="padding: 1rem;">
    <div class="stat-value">{uniqueDistances}</div>
    <div class="stat-label">Distances</div>
  </div>
  <div class="card text-center" style="padding: 1rem;">
    <div class="stat-value">{totalDistance}km</div>
    <div class="stat-label">Total</div>
  </div>
</div>

{#if medals.length === 0}
  <div class="card text-center" style="padding: 3rem 2rem;">
    <div class="text-4xl mb-4">🏅</div>
    <h3 class="text-lg font-bold mb-2">No medals yet</h3>
    <p class="text-sm mb-4" style="color: var(--text-secondary);">Add your first race medal or import from Strava</p>
    <button class="btn btn-primary" onclick={() => showForm = true}>Add Your First Medal</button>
  </div>
{/if}

<div class="grid gap-4">
  {#each medals as medal (medal.id)}
    <div class="card">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-bold text-lg">{medal.raceName}</h3>
            <span class="badge">{distMap[medal.distance] || medal.distance}</span>
          </div>
          <div class="flex flex-wrap gap-4 text-sm" style="color: var(--text-secondary);">
            <span>{new Date(medal.eventDate).toLocaleDateString()}</span>
            <span>Time: {secondsToTime(medal.timeSeconds)}</span>
            <span>Pace: {secondsToPace(Math.round(medal.timeSeconds / parseFloat(medal.distance)))}</span>
            {#if medal.place != null}
              <span>Place: #{medal.place}</span>
            {/if}
          </div>
        </div>
        <button class="text-xs btn btn-secondary" style="padding: 0.25rem 0.5rem;" onclick={() => deleteMedal(medal.id)}>✕</button>
      </div>
    </div>
  {/each}
</div>

{#if showForm}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={() => showForm = false}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <h2 class="text-lg font-bold mb-4">Add Medal</h2>
      <div class="space-y-3">
        <div>
          <label class="label">Race Name</label>
          <input class="input" bind:value={raceName} placeholder="Cape Town Marathon" />
        </div>
        <div>
          <label class="label">Date</label>
          <input class="input" type="date" bind:value={eventDate} />
        </div>
        <div>
          <label class="label">Distance</label>
          <select class="input" bind:value={distance}>
            {#each distanceOptions as d}
              <option value={d}>{distMap[d] || d}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="label">Time</label>
          <div class="flex gap-2">
            <input class="input" type="number" bind:value={hours} min="0" placeholder="hrs" style="width: 33%;" />
            <input class="input" type="number" bind:value={minutes} min="0" max="59" placeholder="min" style="width: 33%;" />
            <input class="input" type="number" bind:value={seconds} min="0" max="59" placeholder="sec" style="width: 33%;" />
          </div>
        </div>
        <div>
          <label class="label">Place (optional)</label>
          <input class="input" type="number" bind:value={place} min="0" placeholder="Overall position" />
        </div>
        <div>
          <label class="label">Photo URL (optional)</label>
          <input class="input" bind:value={photoUrl} placeholder="https://..." />
        </div>
        <div>
          <label class="label">Notes (optional)</label>
          <textarea class="input min-h-[60px]" bind:value={notes} placeholder="Race details..."></textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-6">
        <button class="btn btn-secondary flex-1" onclick={() => showForm = false}>Cancel</button>
        <button class="btn btn-primary flex-1" onclick={addMedal} disabled={!raceName.trim() || !eventDate}>Save</button>
      </div>
    </div>
  </div>
{/if}
