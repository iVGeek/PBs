<script lang="ts">
  import { onMount } from 'svelte';
  import { secondsToTime, secondsToPace, distMap } from '$lib/utils';

  let pbs = $state<any[]>([]);
  let medals = $state<any[]>([]);

  onMount(async () => {
    const res = await fetch('/api/medals');
    if (!res.ok) return;
    medals = await res.json();
    const bestMap = new Map<string, any>();
    for (const m of medals) {
      const existing = bestMap.get(m.distance);
      if (!existing || m.timeSeconds < existing.timeSeconds) {
        bestMap.set(m.distance, m);
      }
    }
    pbs = Array.from(bestMap.entries())
      .sort(([, a], [, b]) => parseFloat(a.distance) - parseFloat(b.distance))
      .map(([, v]) => v);
  });
</script>

<div class="mb-6">
  <h1 class="text-2xl font-bold">Personal Bests</h1>
  <p class="text-sm" style="color: var(--text-secondary);">Fastest times across all distances</p>
</div>

{#if pbs.length === 0}
  <div class="card text-center" style="padding: 3rem 2rem;">
    <div class="text-4xl mb-4">⏱️</div>
    <h3 class="text-lg font-bold mb-2">No PBs yet</h3>
    <p class="text-sm" style="color: var(--text-secondary);">Add medals on the home page and your fastest times will appear here</p>
  </div>
{/if}

<div class="grid gap-3">
  {#each pbs as pb (pb.distance)}
    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-lg" style="color: var(--accent);">{distMap[pb.distance] || pb.distance}</h3>
          <p class="text-xs" style="color: var(--text-secondary);">{pb.raceName} · {new Date(pb.eventDate).toLocaleDateString()}</p>
        </div>
        <div class="text-right">
          <div class="stat-value">{secondsToTime(pb.timeSeconds)}</div>
          <div class="stat-label">{secondsToPace(Math.round(pb.timeSeconds / parseFloat(pb.distance)))}</div>
        </div>
      </div>
    </div>
  {/each}
</div>
