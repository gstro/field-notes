<script lang="ts">
	// M38: renders the guide's own methodology — what it decided was in scope,
	// what it looked for and couldn't find, and what it flags as possibly stale.
	// All three describe the GUIDE's method, not a new claim about the world, so
	// they render unconditionally per-field (D9) rather than needing the kind of
	// editorial pass D23 held `population.note` back for.
	import type { City } from '$lib/types';
	import { CATEGORIES } from '$lib/registry';

	let {
		sources,
		scopeDecision,
		honestGaps,
		statusNotes
	}: {
		sources: City['sources'];
		scopeDecision: City['scopeDecision'];
		honestGaps: City['honestGaps'];
		statusNotes: City['statusNotes'];
	} = $props();

	const has = $derived(
		Boolean(scopeDecision) || honestGaps.length > 0 || statusNotes.length > 0 || sources.length > 0
	);
</script>

{#if has}
	<div class="guide-notes">
		{#if scopeDecision}<p class="scope">{scopeDecision}</p>{/if}

		{#if honestGaps.length}
			<div class="group">
				<p class="group-label">What the Guide Looked For and Didn't Find</p>
				{#each honestGaps as g (g.id)}
					<div class="entry">
						<span class="cat">{CATEGORIES[g.categoryNum]?.name}</span>
						<p class="text">{g.text}</p>
					</div>
				{/each}
			</div>
		{/if}

		{#if statusNotes.length}
			<div class="group">
				<p class="group-label">Corrections &amp; Live-Status Caveats</p>
				{#each statusNotes as n (n.id)}
					<p class="caveat">{n.text}</p>
				{/each}
			</div>
		{/if}

		{#if sources.length}
			<p class="sources"><span class="sources-label">Sourced from</span> {sources.join(', ')}</p>
		{/if}
	</div>
{/if}

<style>
	.guide-notes {
		font-size: 13px;
	}
	.scope {
		color: var(--muted);
		margin-bottom: 1.25rem;
	}
	.group {
		margin-bottom: 1.5rem;
	}
	.group-label {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--burnt-light);
		margin-bottom: 0.75rem;
	}
	.entry {
		margin-bottom: 0.85rem;
	}
	.cat {
		font-family: var(--font-mono);
		font-size: 9px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--gold);
		display: block;
		margin-bottom: 0.15rem;
	}
	.text {
		color: var(--cream);
		opacity: 0.9;
	}
	.caveat {
		color: var(--cream);
		opacity: 0.9;
		margin-bottom: 0.6rem;
	}
	.sources {
		font-size: 12px;
		color: var(--muted);
		margin-top: 0.5rem;
	}
	.sources-label {
		font-family: var(--font-mono);
		font-size: 9px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--burnt-light);
		margin-right: 0.4em;
	}
</style>
