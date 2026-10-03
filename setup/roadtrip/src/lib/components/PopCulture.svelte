<script lang="ts">
	import type { City } from '$lib/types';
	let { popCulture }: { popCulture: City['popCulture'] } = $props();
	const has = $derived(
		popCulture.filmedHere.length + popCulture.bornHere.length > 0 || !!popCulture.correctionNote
	);
</script>

{#if has}
	{#if popCulture.correctionNote}
		<!-- The guide's own flag on the most commonly assumed pop-culture tie that
		     turned out to be wrong — shown first since it reframes what follows. -->
		<div class="item correction">
			<p class="title">Not what it seems</p>
			<p class="note">{popCulture.correctionNote.text}</p>
		</div>
	{/if}
	{#each popCulture.filmedHere as f}
		<div class="item">
			<!-- {' '} — Svelte trims a bare leading space inside the block -->
			<p class="title">
				{f.title}{#if f.year}{' '}({f.year}){/if}{#if f.locationVisited}<span class="pilgrim"
						>Visited</span
					>{/if}
			</p>
			{#if f.visitNote}<p class="note">{f.visitNote}</p>{/if}
		</div>
	{/each}
	{#each popCulture.bornHere as b}
		<div class="item">
			<p class="title">Born here: {b.name}</p>
			<p class="note">
				{b.relevance}{#if b.note}{' '}· {b.note}{/if}
			</p>
		</div>
	{/each}
{/if}

<style>
	.item {
		margin-bottom: 1rem;
		font-size: var(--text-md);
	}
	/* No opacity dim for un-visited locations — it dropped the already-muted
	   .note text below WCAG AA. The "Visited" pilgrim badge is the signal. */
	.title {
		font-weight: 500;
	}
	.note {
		font-size: 12.5px;
		color: var(--muted);
	}
	.correction {
		padding-bottom: 0.85rem;
		margin-bottom: 1.15rem;
		border-bottom: 1px dashed var(--border);
	}
	.correction .title {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--burnt-light);
	}
	.pilgrim {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 1px 6px;
		border-radius: 2px;
		color: var(--green);
		border: 1px solid rgba(93, 191, 130, 0.4);
		background: rgba(93, 191, 130, 0.08);
		margin-left: 8px;
		vertical-align: middle;
	}
</style>
