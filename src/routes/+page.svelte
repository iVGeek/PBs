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
  let photoPreview = $state('');
  let notes = $state('');
  let importing = $state(false);
  let errorMsg = $state('');

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
      raceName = ''; eventDate = ''; distance = '5K'; hours = 0; minutes = 0; seconds = 0; place = null; photoUrl = ''; photoPreview = ''; notes = '';
      await loadMedals();
    }
  }

  async function deleteMedal(id: string) {
    await fetch(`/api/medals?id=${id}`, { method: 'DELETE' });
    await loadMedals();
  }

  function categorizeDistance(km: number): string {
    if (km >= 4.8 && km <= 5.2) return '5K';
    if (km >= 9.8 && km <= 10.2) return '10K';
    if (km >= 14.8 && km <= 15.2) return '15K';
    if (km >= 20.8 && km <= 21.3) return '21K';
    if (km >= 29.8 && km <= 30.3) return '30K';
    if (km >= 34.8 && km <= 35.3) return '35K';
    if (km >= 41.8 && km <= 42.6) return '42K';
    return km.toFixed(2) + ' km';
  }

  async function importFromStrava() {
    importing = true;
    errorMsg = '';
    try {
      const res = await fetch('/api/strava/import');
      const data = await res.json();
      if (data.error) {
        errorMsg = typeof data.error === 'string' ? data.error : 'Import failed. Try reconnecting Strava.';
        importing = false;
        return;
      }
      if (!data.activities) {
        errorMsg = 'No activities found from Strava.';
        importing = false;
        return;
      }
      const runTypes = ['Run', 'TrailRun', 'VirtualRun'];
      const running = data.activities.filter((a: any) => runTypes.includes(a.type));
      if (running.length === 0) {
        errorMsg = 'No running activities found.';
        importing = false;
        return;
      }
      let imported = 0;
      for (const act of running) {
        const km = act.distance / 1000;
        const dist = categorizeDistance(km);
        if (medals.some((m: any) => m.raceName === act.name)) continue;
        const res2 = await fetch('/api/medals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raceName: act.name, eventDate: act.start_date, distance: dist, timeSeconds: Math.round(act.moving_time), place: null }),
        });
        if (res2.ok) imported++;
      }
      await loadMedals();
      importing = false;
      if (imported > 0) errorMsg = ''; else errorMsg = 'No new races to import.';
    } catch (e) {
      importing = false;
      errorMsg = 'Network error. Please try again.';
    }
  }
</script>

<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-2xl font-bold">Medal Wall</h1>
    <p class="text-sm" style="color: var(--text-secondary);">{totalMedals} medals · {uniqueDistances} distances</p>
  </div>
  <div class="flex gap-2">
    <button class="btn btn-secondary text-sm" onclick={importFromStrava} disabled={importing}>{importing ? 'Importing...' : 'Import Strava'}</button>
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

{#if errorMsg}
  <div class="card mb-4" style="padding: 0.75rem 1rem; color: #ef4444; font-size: 0.875rem; border-color: #ef4444;">
    {errorMsg}
  </div>
{/if}

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
      <div class="flex items-start gap-3">
        {#if medal.photoUrl}
          <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img src={medal.photoUrl} alt={medal.raceName} style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        {/if}
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-bold text-lg truncate">{medal.raceName}</h3>
            <span class="badge shrink-0">{distMap[medal.distance] || medal.distance}</span>
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
        <button class="text-xs btn btn-secondary shrink-0" style="padding: 0.25rem 0.5rem;" onclick={() => deleteMedal(medal.id)}>✕</button>
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
          <label class="label">Photo (optional)</label>
          <input class="input" type="file" accept="image/*" onchange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => { photoUrl = reader.result; photoPreview = reader.result; }; reader.readAsDataURL(file); } }} />
          {#if photoPreview}
            <div class="mt-2 w-20 h-20 rounded-lg overflow-hidden border" style="border-color: var(--border);">
              <img src={photoPreview} alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          {/if}
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
