<script lang="ts">
  import { onMount } from 'svelte';
  import { secondsToTime, secondsToPace, distMap, distEmoji, distanceKm, distanceOptions, computeAchievements } from '$lib/utils';

  let medals = $state<any[]>([]);
  let loaded = $state(false);
  let activeTab = $state<'pbs' | 'achievements' | 'progression' | 'compare'>('pbs');

  let achievements = $derived(computeAchievements(medals));
  let unlockedCount = $derived(achievements.filter(a => a.unlocked).length);

  let bestMap = $derived(() => {
    const map = new Map<string, any>();
    for (const m of medals) {
      const existing = map.get(m.distance);
      if (!existing || m.timeSeconds < existing.timeSeconds) map.set(m.distance, m);
    }
    return map;
  });

  let pbs = $derived(bestMap());

  let progressionData = $derived(() => {
    const byDist = new Map<string, { time: number; date: string }[]>();
    for (const m of medals) {
      if (!byDist.has(m.distance)) byDist.set(m.distance, []);
      byDist.get(m.distance)!.push({ time: m.timeSeconds, date: m.eventDate });
    }
    const result: { distance: string; entries: { time: number; date: string }[] }[] = [];
    for (const [dist, entries] of byDist) {
      if (entries.length >= 2) {
        result.push({ distance: dist, entries: entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) });
      }
    }
    return result;
  });

  let progression = $derived(progressionData());

  let compareLeft = $state('');
  let compareRight = $state('');

  let compareMedals = $derived(() => {
    const left = medals.find((m: any) => m.id === compareLeft);
    const right = medals.find((m: any) => m.id === compareRight);
    return { left, right };
  });

  let compareResult = $derived(compareMedals());

  async function loadAll() {
    const res = await fetch('/api/medals');
    if (res.ok) medals = await res.json();
    loaded = true;
  }

  onMount(loadAll);

  function maxTime(entries: { time: number }[]): number {
    return Math.max(...entries.map(e => e.time));
  }

  function minTime(entries: { time: number }[]): number {
    return Math.min(...entries.map(e => e.time));
  }
</script>

<div class="mb-6">
  <h1 class="text-2xl font-extrabold tracking-tight">Trophy Room</h1>
  <p class="text-sm mt-0.5" style="color: var(--text-secondary);">Your personal bests, achievements, and progress</p>
</div>

<!-- Tabs -->
<div class="flex gap-1 mb-8 p-1 rounded-xl" style="background: var(--surface-2); border: 1px solid var(--border);">
  {#each [{ id: 'pbs', label: 'Personal Bests', icon: '🏆' }, { id: 'achievements', label: 'Achievements', icon: '🎖️' }, { id: 'progression', label: 'Progression', icon: '📈' }, { id: 'compare', label: 'Compare', icon: '⚖️' }] as tab}
    <button class="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all" style="background: {activeTab === tab.id ? 'var(--accent)' : 'transparent'}; color: {activeTab === tab.id ? '#000' : 'var(--text-secondary)'}; cursor: pointer; border: none;" onclick={() => activeTab = tab.id as any}>
      {tab.icon} {tab.label}
    </button>
  {/each}
</div>

{#if activeTab === 'pbs'}
  {#if pbs.size > 0}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 stagger">
      {#each Array.from(pbs.entries()).sort(([,a],[,b]) => parseFloat(a[0]) - parseFloat(b[0])) as [dist, pb] (dist)}
        <div class="trophy-card">
          <div class="text-[10px] font-bold uppercase tracking-widest mb-2" style="color: var(--accent);">{distEmoji[dist] || '🏅'} {distMap[dist] || dist}</div>
          <div class="text-2xl font-extrabold tabular-nums tracking-tight">{secondsToTime(pb.timeSeconds)}</div>
          <div class="text-xs mt-1" style="color: var(--text-secondary);">{secondsToPace(Math.round(pb.timeSeconds / (distanceKm[dist] || 21.097)))}/km</div>
          <div class="text-[11px] mt-2 truncate" style="color: var(--text-secondary);">{pb.raceName}</div>
          <div class="text-[10px] mt-0.5" style="color: var(--text-secondary); opacity: 0.6;">{new Date(pb.eventDate).toLocaleDateString()}</div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="card text-center" style="padding: 3rem;">
      <div class="text-4xl mb-3">🏆</div>
      <p class="text-sm" style="color: var(--text-secondary);">Add some medals to see your personal bests</p>
    </div>
  {/if}

{:else if activeTab === 'achievements'}
  <div class="mb-4">
    <span class="text-sm font-semibold" style="color: var(--accent);">{unlockedCount}/{achievements.length} Unlocked</span>
    <div class="w-full h-2 rounded-full mt-2" style="background: var(--surface-3);">
      <div class="h-full rounded-full transition-all duration-500" style="width: {(unlockedCount / achievements.length) * 100}%; background: linear-gradient(90deg, var(--accent), var(--accent-hover));"></div>
    </div>
  </div>
  <div class="grid gap-2 stagger">
    {#each achievements as a (a.id)}
      <div class="achievement" class:unlocked={a.unlocked} class:locked={!a.unlocked}>
        <span class="text-2xl">{a.icon}</span>
        <div class="flex-1">
          <div class="text-sm font-bold">{a.label}</div>
          <div class="text-xs" style="color: var(--text-secondary);">{a.description}</div>
        </div>
        {#if a.unlocked}
          <span class="badge" style="font-size: 0.625rem;">Unlocked</span>
        {:else}
          <span class="text-[10px] font-medium" style="color: var(--text-secondary); opacity: 0.5;">Locked</span>
        {/if}
      </div>
    {/each}
  </div>

{:else if activeTab === 'progression'}
  {#if progression.length > 0}
    <div class="space-y-6 stagger">
      {#each progression as p (p.distance)}
        {@const maxT = maxTime(p.entries)}
        {@const minT = minTime(p.entries)}
        {@const range = maxT - minT || 1}
        <div class="card">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">{distEmoji[p.distance] || '🏅'}</span>
            <h3 class="font-bold">{distMap[p.distance] || p.distance}</h3>
            <span class="badge text-[10px]">{p.entries.length} races</span>
          </div>
          <div class="space-y-1.5">
            {#each p.entries as e, i (i)}
              {@const pct = range > 0 ? ((maxT - e.time) / range) * 100 : 50}
              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 text-right tabular-nums" style="color: var(--text-secondary);">{secondsToTime(e.time)}</span>
                <div class="flex-1 h-5 rounded-md overflow-hidden" style="background: var(--surface-3);">
                  <div class="h-full rounded-md transition-all duration-500" style="width: {Math.max(pct, 8)}%; background: {i === p.entries.length - 1 ? 'var(--accent)' : 'var(--accent-light)'}; border: 1px solid {i === p.entries.length - 1 ? 'var(--accent)' : 'transparent'};"></div>
                </div>
                <span class="w-16 truncate" style="color: var(--text-secondary); font-size: 0.625rem;">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</span>
              </div>
            {/each}
          </div>
          <div class="flex justify-between mt-2 text-[10px]" style="color: var(--text-secondary);">
            <span>Slowest: {secondsToTime(maxT)}</span>
            <span style="color: var(--accent);">Best: {secondsToTime(minT)}</span>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="card text-center" style="padding: 3rem;">
      <div class="text-4xl mb-3">📈</div>
      <p class="text-sm" style="color: var(--text-secondary);">Run the same distance twice to see your progression</p>
    </div>
  {/if}

{:else if activeTab === 'compare'}
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <div>
      <label class="label">First Race</label>
      <select class="input" bind:value={compareLeft}>
        <option value="">Select a race</option>
        {#each medals as m (m.id)}
          <option value={m.id}>{m.raceName} ({distMap[m.distance] || m.distance} - {secondsToTime(m.timeSeconds)})</option>
        {/each}
      </select>
    </div>
    <div>
      <label class="label">Second Race</label>
      <select class="input" bind:value={compareRight}>
        <option value="">Select a race</option>
        {#each medals as m (m.id)}
          <option value={m.id}>{m.raceName} ({distMap[m.distance] || m.distance} - {secondsToTime(m.timeSeconds)})</option>
        {/each}
      </select>
    </div>
  </div>

  {#if compareResult.left && compareResult.right}
    {@const l = compareResult.left}
    {@const r = compareResult.right}
    {@const diff = r.timeSeconds - l.timeSeconds}
    <div class="grid grid-cols-3 gap-3">
      <div class="card text-center">
        <div class="text-xs font-bold mb-2" style="color: var(--accent);">Left</div>
        <div class="font-bold text-sm">{l.raceName}</div>
        <div class="badge text-[10px] mt-1">{distMap[l.distance] || l.distance}</div>
        <div class="text-xl font-extrabold mt-2">{secondsToTime(l.timeSeconds)}</div>
        <div class="text-xs" style="color: var(--text-secondary);">{secondsToPace(Math.round(l.timeSeconds / (distanceKm[l.distance] || 21.097)))}/km</div>
        <div class="text-[10px] mt-1" style="color: var(--text-secondary);">{new Date(l.eventDate).toLocaleDateString()}</div>
        {#if l.place != null}<div class="text-xs mt-1" style="color: var(--accent);">#{l.place}</div>{/if}
      </div>
      <div class="card text-center flex flex-col items-center justify-center">
        <div class="text-2xl mb-1">{diff < 0 ? '🏎️' : diff > 0 ? '🐌' : '🤝'}</div>
        <div class="text-xs font-bold" style="color: {diff < 0 ? '#34d399' : diff > 0 ? '#f87171' : 'var(--text-secondary)'};">
          {diff === 0 ? 'Same time!' : (diff < 0 ? 'Faster by ' : 'Slower by ') + secondsToTime(Math.abs(diff))}
        </div>
      </div>
      <div class="card text-center">
        <div class="text-xs font-bold mb-2" style="color: var(--accent);">Right</div>
        <div class="font-bold text-sm">{r.raceName}</div>
        <div class="badge text-[10px] mt-1">{distMap[r.distance] || r.distance}</div>
        <div class="text-xl font-extrabold mt-2">{secondsToTime(r.timeSeconds)}</div>
        <div class="text-xs" style="color: var(--text-secondary);">{secondsToPace(Math.round(r.timeSeconds / (distanceKm[r.distance] || 21.097)))}/km</div>
        <div class="text-[10px] mt-1" style="color: var(--text-secondary);">{new Date(r.eventDate).toLocaleDateString()}</div>
        {#if r.place != null}<div class="text-xs mt-1" style="color: var(--accent);">#{r.place}</div>{/if}
      </div>
    </div>
  {:else}
    <div class="card text-center" style="padding: 3rem;">
      <div class="text-4xl mb-3">⚖️</div>
      <p class="text-sm" style="color: var(--text-secondary);">Select two races to compare</p>
    </div>
  {/if}
{/if}
