<script lang="ts">
	import type { Recommendation } from '$lib/types';
	let { recommendations, isRetro = false }: { recommendations: Recommendation[]; isRetro?: boolean } = $props();

	// Trip-2 semantics vs trip-1 retro semantics never share colors — schema rule.
	const cellClass = (s: string) =>
		({
			attended: 'attended', 'off-guide-discovery': 'offguide', 'closed-on-arrival': 'closed',
			'attended-anyway': 'instinct', 'retroactive-recommendation': 'retro'
		})[s] ?? 'skipped';

	const cells = $derived(
		[...recommendations].sort((a, b) => cellClass(a.status).localeCompare(cellClass(b.status))).map((r) => cellClass(r.status))
	);
	const hit = $derived(recommendations.filter((r) => ['attended', 'attended-anyway'].includes(r.status)).length);
</script>

<p class="hit-big">{hit} / {recommendations.length}</p>
<div class="waffle" role="img" aria-label="Hit-rate waffle: {hit} of {recommendations.length} recommendations attended">
	{#each cells as c}<div class="cell {c}"></div>{/each}
</div>
<div class="legend">
	{#if isRetro}
		<span><i class="key instinct"></i>Hit by instinct</span>
		<span><i class="key retro"></i>Retro pick (no chance to act)</span>
	{:else}
		<span><i class="key attended"></i>Attended</span>
		<span><i class="key offguide"></i>Off-guide</span>
		<span><i class="key skipped"></i>Skipped</span>
		<span><i class="key closed"></i>Closed</span>
	{/if}
</div>

<style>
	.hit-big { font-family: var(--font-display); font-size: 2.6rem; font-weight: 700; color: var(--gold); line-height: 1; margin-bottom: 0.6rem; }
	.waffle { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; max-width: 340px; }
	.cell, .key { aspect-ratio: 1; border-radius: 2px; background: var(--dark3); border: 1px solid var(--border); }
	.attended { background: rgba(93,191,130,0.35); border-color: var(--green); }
	.offguide { background: rgba(90,175,224,0.35); border-color: var(--blue); }
	.closed { background: rgba(200,90,0,0.3); border-color: var(--burnt); }
	.instinct { background: rgba(212,168,67,0.35); border-color: var(--gold); }
	.retro { background: transparent; border-style: dashed; border-color: var(--gold); }
	.legend { margin-top: 0.9rem; display: flex; flex-wrap: wrap; gap: 1rem; font-family: var(--font-mono); font-size: 10px; color: var(--muted); }
	.legend span { display: inline-flex; align-items: center; gap: 5px; }
	.key { width: 10px; height: 10px; display: inline-block; aspect-ratio: auto; }
</style>
