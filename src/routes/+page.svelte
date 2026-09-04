<script lang="ts">
  import { onMount } from 'svelte';
  import {
    secondsToTime, secondsToPace, distMap, distEmoji, distanceKm,
    distanceOptions, totalDistanceKm, racesByYear, timelineGroups,
    filterMedals, getYears, computePBs
  } from '$lib/utils';

  let medals = $state<any[]>([]);
  let bibs = $state<any[]>([]);
  let pbs = $derived(computePBs(medals));

  let searchQuery = $state('');
  let distFilter = $state('');
  let yearFilter = $state('');
  let showMedalForm = $state(false);
  let showBibForm = $state(false);
  let lightboxPhoto = $state('');
  let importing = $state(false);
  let errorMsg = $state('');
  let loaded = $state(false);

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

  let bibNumber = $state('');
  let bibEventName = $state('');
  let bibEventDate = $state('');
  let bibDistance = $state('');
  let bibNotes = $state('');
  let bibPhotoUrl = $state('');
  let bibPhotoPreview = $state('');

  let editingMedalId = $state<string | null>(null);
  let editingBibId = $state<string | null>(null);

  let years = $derived(getYears(medals));
  let filtered = $derived(filterMedals(medals, searchQuery, distFilter, yearFilter));
  let timeline = $derived(timelineGroups(filtered));
  let totalDist = $derived(totalDistanceKm(medals));
  let yearStats = $derived(racesByYear(medals));
  let uniqueDistances = $derived(new Set(medals.map(m => m.distance)).size);

  async function loadAll() {
    const [mRes, bRes] = await Promise.all([fetch('/api/medals'), fetch('/api/bibs')]);
    if (mRes.ok) medals = await mRes.json();
    if (bRes.ok) bibs = await bRes.json();
    loaded = true;
  }

  onMount(loadAll);

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

  function handleMedalPhoto(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    readImage(file).then((r) => { photoUrl = r; photoPreview = r; });
  }

  function handleBibPhoto(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    readImage(file).then((r) => { bibPhotoUrl = r; bibPhotoPreview = r; });
  }

  async function addMedal() {
    if (!raceName.trim() || !eventDate) return;
    const timeSeconds = hours * 3600 + minutes * 60 + seconds;
    if (editingMedalId) {
      const res = await fetch('/api/medals', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingMedalId, raceName: raceName.trim(), eventDate, distance, timeSeconds, place, photoUrl: photoUrl || null, notes: notes || null }),
      });
      if (res.ok) {
        showMedalForm = false; editingMedalId = null;
        photoPreview = ''; photoUrl = '';
        await loadAll();
      }
      return;
    }
    const res = await fetch('/api/medals', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raceName: raceName.trim(), eventDate, distance, timeSeconds, place, photoUrl: photoUrl || undefined, notes: notes || undefined }),
    });
    if (res.ok) {
      showMedalForm = false;
      raceName = ''; eventDate = ''; distance = '5K'; hours = 0; minutes = 0; seconds = 0; place = null; photoUrl = ''; photoPreview = ''; notes = '';
      await loadAll();
    }
  }

  function openEditMedal(m: any) {
    editingMedalId = m.id;
    raceName = m.raceName;
    eventDate = new Date(m.eventDate).toISOString().slice(0, 10);
    distance = m.distance;
    const secs = Number(m.timeSeconds) || 0;
    hours = Math.floor(secs / 3600);
    minutes = Math.floor((secs % 3600) / 60);
    seconds = secs % 60;
    place = m.place ?? null;
    photoUrl = m.photoUrl || '';
    photoPreview = m.photoUrl || '';
    notes = m.notes || '';
    showMedalForm = true;
  }

  async function addBib() {
    if (!bibNumber.trim() || !bibEventName.trim() || !bibEventDate) return;
    if (editingBibId) {
      const res = await fetch('/api/bibs', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingBibId, bibNumber: bibNumber.trim(), eventName: bibEventName.trim(), eventDate: bibEventDate, distance: bibDistance || null, photoUrl: bibPhotoUrl || null, notes: bibNotes || null }),
      });
      if (res.ok) { showBibForm = false; editingBibId = null; bibPhotoPreview = ''; bibPhotoUrl = ''; await loadAll(); }
      return;
    }
    const res = await fetch('/api/bibs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bibNumber: bibNumber.trim(), eventName: bibEventName.trim(), eventDate: bibEventDate, distance: bibDistance || undefined, photoUrl: bibPhotoUrl || undefined, notes: bibNotes || undefined }),
    });
    if (res.ok) {
      showBibForm = false;
      bibNumber = ''; bibEventName = ''; bibEventDate = ''; bibDistance = ''; bibNotes = ''; bibPhotoUrl = ''; bibPhotoPreview = '';
      await loadAll();
    }
  }

  function openEditBib(b: any) {
    editingBibId = b.id;
    bibNumber = b.bibNumber;
    bibEventName = b.eventName;
    bibEventDate = new Date(b.eventDate).toISOString().slice(0, 10);
    bibDistance = b.distance || '';
    bibNotes = b.notes || '';
    bibPhotoUrl = b.photoUrl || '';
    bibPhotoPreview = b.photoUrl || '';
    showBibForm = true;
  }

  async function deleteMedal(id: string) {
    if (!confirm('Delete this medal? This cannot be undone.')) return;
    await fetch(`/api/medals?id=${id}`, { method: 'DELETE' });
    await loadAll();
  }

  async function deleteBib(id: string) {
    if (!confirm('Remove this bib? This cannot be undone.')) return;
    await fetch(`/api/bibs?id=${id}`, { method: 'DELETE' });
    await loadAll();
  }

  function exportData() {
    const rows = medals.map((m: any) => ({
      type: 'medal',
      name: m.raceName,
      date: m.eventDate,
      distance: m.distance,
      time_seconds: m.timeSeconds,
      place: m.place ?? '',
      notes: m.notes ?? '',
    }));
    for (const b of bibs) {
      rows.push({ type: 'bib', name: b.eventName, date: b.eventDate, distance: b.distance ?? '', time_seconds: '', place: `#${b.bibNumber}`, notes: b.notes ?? '' });
    }
    if (rows.length === 0) { errorMsg = 'Nothing to export yet.'; return; }
    const json = JSON.stringify(rows, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `racewall-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    importSuccess = `Exported ${rows.length} record${rows.length !== 1 ? 's' : ''}.`;
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

  let importProgress = $state(0);
  let importTotal = $state(0);
  let importSuccess = $state('');

  async function importFromStrava() {
    importing = true; errorMsg = ''; importProgress = 0; importTotal = 0;
    try {
      const res = await fetch('/api/strava/import');
      const data = await res.json();
      if (data.error) { errorMsg = typeof data.error === 'string' ? data.error : 'Import failed.'; importing = false; return; }
      if (!data.activities) { errorMsg = 'No activities found.'; importing = false; return; }
      const runTypes = ['Run', 'TrailRun', 'VirtualRun'];
      const running = data.activities.filter((a: any) => runTypes.includes(a.type));
      if (running.length === 0) { errorMsg = 'No running activities found.'; importing = false; return; }
      // Skip anything already imported (by Strava activity id, with name fallback for legacy rows)
      const existingById = new Set(medals.map((m: any) => m.stravaActivityId).filter(Boolean));
      const existingByName = new Set(medals.map((m: any) => m.raceName));
      const toImport = running.filter((a: any) => !existingById.has(String(a.id)));
      if (toImport.length === 0) { importing = false; errorMsg = 'Nothing new to import — your Strava races are already on the wall.'; await loadAll(); return; }
      importTotal = toImport.length;
      let imported = 0;
      let skipped = 0;
      for (const act of toImport) {
        const km = act.distance / 1000;
        const dist = categorizeDistance(km);
        if (existingByName.has(act.name)) { skipped++; importProgress++; continue; }
        const res2 = await fetch('/api/medals', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raceName: act.name, eventDate: act.start_date, distance: dist, timeSeconds: Math.round(act.moving_time), place: null, stravaActivityId: String(act.id) }),
        });
        if (res2.ok) imported++; else skipped++;
        importProgress++;
      }
      await loadAll();
      importing = false;
      errorMsg = '';
      if (imported > 0) importSuccess = `Imported ${imported} race${imported !== 1 ? 's' : ''}${skipped ? ` · ${skipped} skipped` : ''}.`;
    } catch { importing = false; errorMsg = 'Network error. Please try again.'; }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { showMedalForm = false; showBibForm = false; lightboxPhoto = ''; editingMedalId = null; editingBibId = null; }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Lightbox -->
{#if lightboxPhoto}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="lightbox-overlay" onclick={() => lightboxPhoto = ''}>
    <img src={lightboxPhoto} alt="Full size" />
  </div>
{/if}

<!-- Error -->
{#if errorMsg}
  <div class="rounded-xl mb-6 px-4 py-3 text-sm font-medium" style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #f87171;">
    {errorMsg}
  </div>
{/if}

<!-- Success -->
{#if importSuccess}
  <div class="rounded-xl mb-6 px-4 py-3 text-sm font-medium" style="background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25); color: #4ade80;">
    {importSuccess}
  </div>
{/if}

<!-- Import progress -->
{#if importing && importTotal > 0}
  <div class="rounded-xl mb-6 px-4 py-3 text-sm font-medium" style="background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); color: #60a5fa;">
    <div class="flex items-center justify-between mb-2">
      <span>Importing races from Strava…</span>
      <span class="tabular-nums">{importProgress} / {importTotal}</span>
    </div>
    <div class="h-1.5 rounded-full overflow-hidden" style="background: rgba(59,130,246,0.15);">
      <div class="h-full transition-all duration-200" style="width: {importTotal ? (importProgress / importTotal) * 100 : 0}%; background: #3b82f6;"></div>
    </div>
  </div>
{/if}

<!-- Hero Stats -->
{#if loaded}
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 stagger">
    <div class="card text-center" style="padding: 1.5rem 1rem;">
      <div class="text-2xl mb-1">🏅</div>
      <div class="stat-value">{medals.length}</div>
      <div class="stat-label mt-1">Medals</div>
    </div>
    <div class="card text-center" style="padding: 1.5rem 1rem;">
      <div class="text-2xl mb-1">📏</div>
      <div class="stat-value">{totalDist >= 1000 ? (totalDist / 1000).toFixed(1) + 'K' : totalDist.toFixed(1)}</div>
      <div class="stat-label mt-1">Kilometers Raced</div>
    </div>
    <div class="card text-center" style="padding: 1.5rem 1rem;">
      <div class="text-2xl mb-1">🏆</div>
      <div class="stat-value">{pbs.size}</div>
      <div class="stat-label mt-1">Personal Bests</div>
    </div>
    <div class="card text-center" style="padding: 1.5rem 1rem;">
      <div class="text-2xl mb-1">🎫</div>
      <div class="stat-value">{bibs.length}</div>
      <div class="stat-label mt-1">Bibs</div>
    </div>
  </div>
{:else}
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 stagger">
    {#each [1, 2, 3, 4] as n (n)}
      <div class="card" style="padding: 1.5rem 1rem;">
        <div class="w-8 h-8 rounded-full mb-3 animate-pulse" style="background: var(--surface-3);"></div>
        <div class="h-6 w-16 rounded mb-2 animate-pulse" style="background: var(--surface-3);"></div>
        <div class="h-3 w-20 rounded animate-pulse" style="background: var(--surface-3);"></div>
      </div>
    {/each}
  </div>
{/if}

<!-- Search + Filters + Actions -->
<div class="flex flex-col sm:flex-row gap-3 mb-6">
  <div class="search-bar flex-1">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <input bind:value={searchQuery} placeholder="Search races..." />
  </div>
  <select class="input" style="width: auto; min-width: 120px;" bind:value={distFilter}>
    <option value="">All Distances</option>
    {#each distanceOptions as d}
      <option value={d}>{distMap[d] || d}</option>
    {/each}
  </select>
  {#if years.length > 1}
    <select class="input" style="width: auto; min-width: 100px;" bind:value={yearFilter}>
      <option value="">All Years</option>
      {#each years as y}
        <option value={y}>{y}</option>
      {/each}
    </select>
  {/if}
  <div class="flex gap-2">
    <button class="btn btn-ghost btn-sm" onclick={importFromStrava} disabled={importing}>
      {#if importing}
        <svg class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Importing
      {:else}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Import
      {/if}
    </button>
    <button class="btn btn-ghost btn-sm" onclick={exportData}>Export</button>
    <button class="btn btn-secondary btn-sm" onclick={() => showBibForm = true}>+ Bib</button>
    <button class="btn btn-primary btn-sm" onclick={() => showMedalForm = true}>+ Medal</button>
  </div>
</div>

<!-- Personal Bests Strip -->
{#if pbs.size > 0 && !searchQuery && !distFilter && !yearFilter}
  <div class="section-header">
    <span style="font-size: 1.2rem;">🏆</span>
    <h2 style="color: var(--accent);">Personal Bests</h2>
    <span class="line"></span>
  </div>
  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-8 stagger">
    {#each Array.from(pbs.entries()).sort(([,a],[,b]) => parseFloat(a[0]) - parseFloat(b[0])) as [dist, pb] (dist)}
      <a href="/pbs" class="trophy-card no-underline" style="text-decoration: none; color: inherit;">
        <div class="text-[10px] font-bold uppercase tracking-widest mb-1" style="color: var(--accent);">{distEmoji[dist] || '🏅'} {distMap[dist] || dist}</div>
        <div class="text-lg font-extrabold tabular-nums tracking-tight">{secondsToTime(pb.timeSeconds)}</div>
        <div class="text-[11px] mt-0.5" style="color: var(--text-secondary);">{secondsToPace(Math.round(pb.timeSeconds / (distanceKm[dist] || 21.097)))}/km</div>
      </a>
    {/each}
  </div>
{/if}

<!-- Medal Timeline Wall -->
{#if filtered.length > 0}
  <div class="section-header">
    <span style="font-size: 1.2rem;">🏅</span>
    <h2>{searchQuery || distFilter || yearFilter ? 'Search Results' : 'Race History'}</h2>
    <span class="line"></span>
    <span class="text-xs font-medium" style="color: var(--text-secondary);">{filtered.length} race{filtered.length !== 1 ? 's' : ''}</span>
  </div>

  {#each timeline as group (group.year)}
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-lg font-extrabold" style="color: var(--accent);">{group.year}</span>
        <span class="text-xs font-medium" style="color: var(--text-secondary);">{group.races.length} race{group.races.length !== 1 ? 's' : ''}</span>
        <span class="line flex-1" style="height: 1px; background: var(--border);"></span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 stagger">
        {#each group.races as medal (medal.id)}
          <div class="wall-card" onclick={() => medal.photoUrl && (lightboxPhoto = medal.photoUrl)}>
            {#if medal.photoUrl}
              <img src={medal.photoUrl} alt={medal.raceName} loading="lazy" />
            {:else}
              <div class="wall-placeholder">{distEmoji[medal.distance] || '🏅'}</div>
            {/if}
            <div class="wall-overlay" style="opacity: 1;">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="font-bold text-sm text-white truncate">{medal.raceName}</span>
                <span class="badge shrink-0 text-[9px] px-1.5 py-0.5" style="background: rgba(255,255,255,0.15); color: #fff;">{distMap[medal.distance] || medal.distance}</span>
              </div>
              <div class="flex items-center gap-1.5 text-[11px] text-white/70">
                <span>{secondsToTime(medal.timeSeconds)}</span>
                <span>·</span>
                <span>{secondsToPace(Math.round(medal.timeSeconds / (distanceKm[medal.distance] || 21.097)))}/km</span>
                {#if medal.place != null}
                  <span>·</span>
                  <span>#{medal.place}</span>
                {/if}
              </div>
              <div class="flex items-center justify-between mt-0.5">
                <span class="text-[10px] text-white/40">{new Date(medal.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <div class="flex items-center gap-1.5">
                  <button class="text-white/30 hover:text-white transition-colors text-xs" onclick={(e) => { e.stopPropagation(); openEditMedal(medal); }} style="background: none; border: none; cursor: pointer; padding: 2px;" aria-label="Edit medal">✎</button>
                  <button class="text-white/30 hover:text-red-400 transition-colors text-xs" onclick={(e) => { e.stopPropagation(); deleteMedal(medal.id); }} style="background: none; border: none; cursor: pointer; padding: 2px;" aria-label="Delete medal">✕</button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
{:else if loaded}
  <!-- Empty State -->
  <div class="card text-center" style="padding: 5rem 2rem;">
    <div class="text-6xl mb-5">🏃</div>
    <h3 class="text-xl font-bold mb-2">{searchQuery ? 'No races found' : 'Your wall awaits'}</h3>
    <p class="text-sm mb-8" style="color: var(--text-secondary); max-width: 360px; margin: 0 auto;">
      {searchQuery ? 'Try adjusting your search or filters' : 'Add your first race medal, import from Strava, or start your bib collection'}
    </p>
    {#if !searchQuery}
      <div class="flex flex-wrap gap-3 justify-center">
        <button class="btn btn-primary" onclick={() => showMedalForm = true}>Add Medal</button>
        <button class="btn btn-secondary" onclick={() => showBibForm = true}>Add Bib</button>
        <button class="btn btn-secondary" onclick={importFromStrava} disabled={importing}>{importing ? 'Importing...' : 'Import from Strava'}</button>
      </div>
    {/if}
  </div>
{/if}

<!-- Add Medal Modal -->
{#if showMedalForm}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={() => { showMedalForm = false; editingMedalId = null; }}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold">{editingMedalId ? 'Edit Medal' : 'Add Medal'}</h2>
        <button class="btn-ghost" onclick={() => { showMedalForm = false; editingMedalId = null; }} style="border: none; background: none; cursor: pointer; color: var(--text-secondary);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="space-y-3">
        <div>
          <label class="label" for="m-name">Race Name</label>
          <input id="m-name" class="input" bind:value={raceName} placeholder="Cape Town Marathon" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="m-date">Date</label>
            <input id="m-date" class="input" type="date" bind:value={eventDate} />
          </div>
          <div>
            <label class="label" for="m-dist">Distance</label>
            <select id="m-dist" class="input" bind:value={distance}>
              {#each distanceOptions as d}
                <option value={d}>{distMap[d] || d}</option>
              {/each}
            </select>
          </div>
        </div>
        <div>
          <label class="label">Time</label>
          <div class="flex gap-2">
            <input class="input" type="number" bind:value={hours} min="0" placeholder="hrs" style="width: 33%;" />
            <input class="input" type="number" bind:value={minutes} min="0" max="59" placeholder="min" style="width: 33%;" />
            <input class="input" type="number" bind:value={seconds} min="0" max="59" placeholder="sec" style="width: 33%;" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="m-place">Place (optional)</label>
            <input id="m-place" class="input" type="number" bind:value={place} min="0" placeholder="Position" />
          </div>
          <div>
            <label class="label" for="m-photo">Photo (optional)</label>
            <input id="m-photo" class="input" type="file" accept="image/*" onchange={handleMedalPhoto} style="padding: 0.5rem;" />
          </div>
        </div>
        {#if photoPreview}
          <div class="w-full h-28 rounded-xl overflow-hidden" style="border: 1px solid var(--border);">
            <img src={photoPreview} alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        {/if}
        <div>
          <label class="label" for="m-notes">Notes (optional)</label>
          <textarea id="m-notes" class="input" style="min-height: 60px; resize: vertical;" bind:value={notes} placeholder="Race details..."></textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-6">
        <button class="btn btn-secondary flex-1" onclick={() => { showMedalForm = false; editingMedalId = null; }}>Cancel</button>
        <button class="btn btn-primary flex-1" onclick={addMedal} disabled={!raceName.trim() || !eventDate}>{editingMedalId ? 'Save Changes' : 'Save Medal'}</button>
      </div>
    </div>
  </div>
{/if}

<!-- Add Bib Modal -->
{#if showBibForm}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={() => { showBibForm = false; editingBibId = null; }}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold">{editingBibId ? 'Edit Bib' : 'Add Bib'}</h2>
        <button class="btn-ghost" onclick={() => { showBibForm = false; editingBibId = null; }} style="border: none; background: none; cursor: pointer; color: var(--text-secondary);">
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
            <input id="b-date" class="input" type="date" bind:value={bibEventDate} />
          </div>
        </div>
        <div>
          <label class="label" for="b-event">Event Name</label>
          <input id="b-event" class="input" bind:value={bibEventName} placeholder="Two Oceans Marathon" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="b-dist">Distance (optional)</label>
            <select id="b-dist" class="input" bind:value={bibDistance}>
              <option value="">Any</option>
              {#each distanceOptions as d}
                <option value={d}>{distMap[d] || d}</option>
              {/each}
            </select>
          </div>
          <div>
            <label class="label" for="b-photo">Photo (optional)</label>
            <input id="b-photo" class="input" type="file" accept="image/*" onchange={handleBibPhoto} style="padding: 0.5rem;" />
          </div>
        </div>
        {#if bibPhotoPreview}
          <div class="w-full h-28 rounded-xl overflow-hidden" style="border: 1px solid var(--border);">
            <img src={bibPhotoPreview} alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        {/if}
        <div>
          <label class="label" for="b-notes">Notes (optional)</label>
          <textarea id="b-notes" class="input" style="min-height: 60px; resize: vertical;" bind:value={bibNotes} placeholder="Race details..."></textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-6">
        <button class="btn btn-secondary flex-1" onclick={() => { showBibForm = false; editingBibId = null; }}>Cancel</button>
        <button class="btn btn-primary flex-1" onclick={addBib} disabled={!bibNumber.trim() || !bibEventName.trim() || !bibEventDate}>{editingBibId ? 'Save Changes' : 'Save Bib'}</button>
      </div>
    </div>
  </div>
{/if}
