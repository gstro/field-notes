<script lang="ts">
	import type { Recommendation } from '$lib/types';
	let { recommendations, isRetro = false }: { recommendations: Recommendation[]; isRetro?: boolean } = $props();

	// Trip-2 semantics vs trip-1 retro semantics never share colors — schema rule.
	// `unverified` and `retroactive-recommendation` both mean VISIT UNKNOWN (D3,
	// redefined M3.5) and must not render as `skipped`, which asserts a decision
	// not to go.
	const cellClass = (s: string) =>
		({
			attended: 'attended', 'off-guide-discovery': 'offguide', 'closed-on-arrival': 'closed',
			'planned-skipped': 'skipped',
			'attended-anyway': 'visited', 'retroactive-recommendation': 'retro', unverified: 'unknown'
		})[s] ?? 'unknown';

	const cells = $derived(
		[...recommendations].sort((a, b) => cellClass(a.status).localeCompare(cellClass(b.status))).map((r) => cellClass(r.status))
	);
	const hit = $derived(recommendations.filter((r) => ['attended', 'attended-anyway'].includes(r.status)).length);
	// Confirmed visits come from a truncated source (top ~10 places per city),
	// so this is a floor: a non-match is not evidence of absence. Never render
	// it as a bare rate — that was the M3 `0 / N` defect.
	const unknown = $derived(recommendations.filter((r) => ['unverified', 'retroactive-recommendation'].includes(r.status)).length);
</script>

<p class="hit-big">{#if hit}≥{hit}{:else}—{/if}<span class="of">&nbsp;of {recommendations.length}</span></p>
<p class="hit-sub">{#if hit}confirmed visited{:else}none confirmed{/if}{#if unknown}&nbsp;· {unknown} unknown{/if}</p>
<div
	class="waffle"
	role="img"
	aria-label="{hit} of {recommendations.length} recommendations confirmed visited (a floor — {unknown} have no visit record either way)"
>
	{#each cells as c}<div class="cell {c}"></div>{/each}
</div>
<div class="legend">
	{#if isRetro}
		<span><i class="key visited"></i>Visited</span>
		<span><i class="key retro"></i>Retro pick (visit unknown)</span>
	{:else}
		<span><i class="key attended"></i>Attended</span>
		<span><i class="key offguide"></i>Off-guide</span>
		<span><i class="key unknown"></i>Visit unknown</span>
		<span><i class="key skipped"></i>Skipped</span>
		<span><i class="key closed"></i>Closed</span>
	{/if}
</div>

<style>
	.hit-big { font-family: var(--font-display); font-size: 2.6rem; font-weight: 700; color: var(--gold); line-height: 1; }
	.of { font-size: 1.1rem; font-weight: 400; color: var(--muted); margin-left: 0.45rem; }
	.hit-sub { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin: 5px 0 0.7rem; }
	.waffle { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; max-width: 340px; }
	.cell, .key { aspect-ratio: 1; border-radius: 2px; background: var(--dark3); border: 1px solid var(--border); }
	/* Visit unknown — deliberately fainter than `skipped`, which asserts a
	   decision not to go. Absence of evidence must not read as a finding. */
	.unknown { background: transparent; border-color: var(--border); border-style: dotted; }
	.attended { background: rgba(93,191,130,0.35); border-color: var(--green); }
	.offguide { background: rgba(90,175,224,0.35); border-color: var(--blue); }
	.closed { background: rgba(200,90,0,0.3); border-color: var(--burnt); }
	.visited { background: rgba(212,168,67,0.35); border-color: var(--gold); }
	.retro { background: transparent; border-style: dashed; border-color: var(--gold); }
	.legend { margin-top: 0.9rem; display: flex; flex-wrap: wrap; gap: 1rem; font-family: var(--font-mono); font-size: 10px; color: var(--muted); }
	.legend span { display: inline-flex; align-items: center; gap: 5px; }
	.key { width: 10px; height: 10px; display: inline-block; aspect-ratio: auto; }
</style>
