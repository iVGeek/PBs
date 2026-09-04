<script lang="ts">
  import { onMount } from 'svelte';
  import { distanceOptions, distMap, secondsToTime } from '$lib/utils';

  let goals = $state<any[]>([]);
  let loaded = $state(false);
  let showForm = $state(false);
  let errorMsg = $state('');
  let successMsg = $state('');
  let editingId = $state<string | null>(null);

  let name = $state('');
  let targetDistance = $state('');
  let hasTime = $state(false);
  let targetTimeSeconds = $state(0);
  let th = $state(0);
  let tm = $state(0);
  let ts = $state(0);
  let hasDate = $state(false);
  let targetDate = $state('');
  let targetRaces = $state<number | null>(null);
  let note = $state('');
  let completed = $state(false);

  async function loadGoals() {
    const res = await fetch('/api/goals');
    if (res.ok) { goals = await res.json(); loaded = true; }
  }

  onMount(loadGoals);

  async function saveGoal() {
    if (!name.trim()) return;
    targetTimeSeconds = th * 3600 + tm * 60 + ts;
    const payload = {
      id: editingId || undefined,
      name: name.trim(),
      targetDistance: targetDistance || null,
      targetTimeSeconds: hasTime ? targetTimeSeconds : null,
      targetDate: hasDate ? targetDate : null,
      targetRaces: targetRaces || null,
      note: note || null,
      completed,
    };
    const res = await fetch('/api/goals', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      showForm = false; editingId = null;
      resetForm();
      await loadGoals();
    } else {
      errorMsg = 'Could not save goal.';
    }
  }

  function resetForm() {
    name = ''; targetDistance = ''; hasTime = false; th = 0; tm = 0; ts = 0; targetTimeSeconds = 0;
    hasDate = false; targetDate = ''; targetRaces = null; note = ''; completed = false;
  }

  function openEdit(g: any) {
    editingId = g.id;
    name = g.name;
    targetDistance = g.targetDistance || '';
    hasTime = !!g.targetTimeSeconds;
    targetTimeSeconds = g.targetTimeSeconds || 0;
    th = Math.floor(targetTimeSeconds / 3600);
    tm = Math.floor((targetTimeSeconds % 3600) / 60);
    ts = targetTimeSeconds % 60;
    hasDate = !!g.targetDate;
    targetDate = g.targetDate ? new Date(g.targetDate).toISOString().slice(0, 10) : '';
    targetRaces = g.targetRaces || null;
    note = g.note || '';
    completed = !!g.completed;
    showForm = true;
  }

  async function toggleCompleted(g: any) {
    const res = await fetch('/api/goals', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...g, completed: !g.completed }),
    });
    if (res.ok) await loadGoals();
  }

  async function deleteGoal(id: string) {
    if (!confirm('Delete this goal?')) return;
    await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
    await loadGoals();
  }

  function formatTarget(g: any): string {
    const parts: string[] = [];
    if (g.targetDistance) parts.push(distMap[g.targetDistance] || g.targetDistance);
    if (g.targetTimeSeconds) parts.push(`sub ${secondsToTime(g.targetTimeSeconds)}`);
    if (g.targetRaces) parts.push(`${g.targetRaces} races`);
    if (g.targetDate) parts.push(`by ${new Date(g.targetDate).toLocaleDateString()}`);
    return parts.length ? parts.join(' · ') : 'Complete a goal';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { showForm = false; editingId = null; }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-2xl font-extrabold tracking-tight">Race Goals</h1>
    <p class="text-sm mt-0.5" style="color: var(--text-secondary);">Set targets and track them as you go</p>
  </div>
  <button class="btn btn-primary btn-sm" onclick={() => { resetForm(); editingId = null; showForm = true; }}>+ Add Goal</button>
</div>

{#if errorMsg}
  <div class="rounded-xl mb-6 px-4 py-3 text-sm font-medium" style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #f87171;">{errorMsg}</div>
{/if}

{#if loaded && goals.length === 0}
  <div class="card text-center" style="padding: 5rem 2rem;">
    <div class="text-6xl mb-5">🎯</div>
    <h3 class="text-xl font-bold mb-2">No goals yet</h3>
    <p class="text-sm mb-6" style="color: var(--text-secondary); max-width: 320px; margin: 0 auto;">
      Set a target — a sub-40 10K, your first marathon, or 10 races this year
    </p>
    <button class="btn btn-primary" onclick={() => { resetForm(); showForm = true; }}>Set Your First Goal</button>
  </div>
{:else if loaded}
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
    {#each goals as g (g.id)}
      <div class="card" style="padding: 1.25rem 1.5rem; {g.completed ? 'opacity: 0.6;' : ''}">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <button
              onclick={() => toggleCompleted(g)}
              class="w-6 h-6 rounded-full shrink-0 transition-colors"
              style="border: 2px solid var(--accent); background: {g.completed ? 'var(--accent)' : 'transparent'}; cursor: pointer;"
              aria-label="Toggle completed"
            >
              {#if g.completed}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>
              {/if}
            </button>
            <div>
              <h3 class="font-bold" class:line-through={g.completed}>{g.name}</h3>
              <p class="text-xs mt-0.5" style="color: var(--text-secondary);">{formatTarget(g)}</p>
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            <button class="btn-ghost" onclick={() => openEdit(g)} style="border: none; background: none; cursor: pointer; color: var(--text-secondary); font-size: 0.8rem;">✎</button>
            <button class="btn-ghost" onclick={() => deleteGoal(g.id)} style="border: none; background: none; cursor: pointer; color: var(--text-secondary); font-size: 0.8rem;">✕</button>
          </div>
        </div>
        {#if g.note}
          <p class="text-xs mt-3" style="color: var(--text-secondary);">{g.note}</p>
        {/if}
        {#if g.completed}
          <div class="text-[11px] font-bold mt-3" style="color: var(--accent);">✓ Completed</div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

{#if showForm}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={() => { showForm = false; editingId = null; }}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold">{editingId ? 'Edit Goal' : 'Add Goal'}</h2>
        <button onclick={() => { showForm = false; editingId = null; }} style="border: none; background: none; cursor: pointer; color: var(--text-secondary);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="space-y-3">
        <div>
          <label class="label" for="g-name">Goal Name</label>
          <input id="g-name" class="input" bind:value={name} placeholder="e.g. Sub-40 10K, First Marathon" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="g-dist">Target Distance</label>
            <select id="g-dist" class="input" bind:value={targetDistance}>
              <option value="">Any</option>
              {#each distanceOptions as d}
                <option value={d}>{distMap[d] || d}</option>
              {/each}
            </select>
          </div>
          <div>
            <label class="label" for="g-races">Target Races</label>
            <input id="g-races" class="input" type="number" min="1" bind:value={targetRaces} placeholder="e.g. 10" />
          </div>
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium" style="color: var(--text-secondary);">Target Time</label>
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" bind:checked={hasTime} />
            <span>Set a time target</span>
          </label>
        </div>
        {#if hasTime}
          <div class="flex gap-2">
            <input class="input" type="number" bind:value={th} min="0" placeholder="hrs" style="width: 33%;" />
            <input class="input" type="number" bind:value={tm} min="0" max="59" placeholder="min" style="width: 33%;" />
            <input class="input" type="number" bind:value={ts} min="0" max="59" placeholder="sec" style="width: 33%;" />
          </div>
        {/if}
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium" style="color: var(--text-secondary);">Deadline</label>
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" bind:checked={hasDate} />
            <span>Set a date</span>
          </label>
        </div>
        {#if hasDate}
          <input class="input" type="date" bind:value={targetDate} />
        {/if}
        <div>
          <label class="label" for="g-note">Notes (optional)</label>
          <textarea id="g-note" class="input" style="min-height: 60px; resize: vertical;" bind:value={note} placeholder="Motivation or plan..."></textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-6">
        <button class="btn btn-secondary flex-1" onclick={() => { showForm = false; editingId = null; }}>Cancel</button>
        <button class="btn btn-primary flex-1" onclick={saveGoal} disabled={!name.trim()}>{editingId ? 'Save Changes' : 'Add Goal'}</button>
      </div>
    </div>
  </div>
{/if}
