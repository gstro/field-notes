<script lang="ts">
	import type { City } from '$lib/types';
	let { popCulture }: { popCulture: City['popCulture'] } = $props();
	const has = $derived(popCulture.filmedHere.length + popCulture.bornHere.length > 0);
</script>

{#if has}
	{#each popCulture.filmedHere as f}
		<div class="item" class:dim={!f.locationVisited}>
			<!-- {' '} — Svelte trims a bare leading space inside the block -->
			<p class="title">{f.title}{#if f.year}{' '}({f.year}){/if}{#if f.locationVisited}<span class="pilgrim">Visited</span>{/if}</p>
			{#if f.visitNote}<p class="note">{f.visitNote}</p>{/if}
		</div>
	{/each}
	{#each popCulture.bornHere as b}
		<div class="item">
			<p class="title">Born here: {b.name}</p>
			<p class="note">{b.relevance}{#if b.note}{' '}· {b.note}{/if}</p>
		</div>
	{/each}
{/if}

<style>
	.item { margin-bottom: 1rem; font-size: 14px; }
	.item.dim { opacity: 0.65; }
	.title { font-weight: 500; }
	.note { font-size: 12.5px; color: var(--muted); }
	.pilgrim { font-family: var(--font-mono); font-size: 8.5px; letter-spacing: 0.1em; text-transform: uppercase; padding: 1px 6px; border-radius: 2px; color: var(--green); border: 1px solid rgba(93,191,130,0.4); background: rgba(93,191,130,0.08); margin-left: 8px; vertical-align: middle; }
</style>
