<script lang="ts">
	import type { Recommendation } from '$lib/types';
	import { CATEGORIES, SOURCE_LABELS, STATUS_META } from '$lib/registry';
	let { recommendations }: { recommendations: Recommendation[] } = $props();

	const grouped = $derived(
		Object.entries(
			recommendations.reduce<Record<number, Recommendation[]>>((acc, r) => {
				(acc[r.categoryNum] ??= []).push(r);
				return acc;
			}, {})
		).sort(([a], [b]) => Number(a) - Number(b))
	);
	const dur = (m: number | null) => (m == null ? null : m >= 60 ? `${(m / 60).toFixed(m % 60 ? 1 : 0)} hr` : `${m} min`);
</script>

{#each grouped as [catNum, recs]}
	<section class="cat">
		<h3>{CATEGORIES[Number(catNum)]?.emoji} {CATEGORIES[Number(catNum)]?.name}</h3>
		<ul>
			{#each recs as r}
				<li class="rec">
					<div class="rec-head">
						<span class="name">{r.name}</span>
						<span class="status {STATUS_META[r.status]?.cls}">{STATUS_META[r.status]?.label ?? r.status}</span>
					</div>
					<p class="meta">
						{#if r.estCost}{r.estCost}{/if}
						{#if dur(r.durationMin)} · {dur(r.durationMin)}{/if}
						{#if r.bestTimeOfDay} · best at {r.bestTimeOfDay}{/if}
					</p>
					{#if r.note}<p class="note">{r.note}</p>{/if}
					<p class="sources">
						{#each r.source.citedFrom as c}
							{#if c.url && c.source !== 'local-tip' && c.source !== 'self'}
								<a class="src" href={c.url} rel="noopener">{c.label ?? SOURCE_LABELS[c.source] ?? c.source}</a>
							{:else}
								<span class="src">{c.label ?? SOURCE_LABELS[c.source] ?? c.source}</span>
							{/if}
						{/each}
						{#if r.verifiedOpen === false}<span class="src warn">⚠ closure reported</span>{/if}
					</p>
				</li>
			{/each}
		</ul>
	</section>
{/each}

<style>
	.cat { margin-bottom: 2rem; }
	h3 { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; padding-bottom: 0.4rem; border-bottom: 1px solid var(--border); }
	ul { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
	.rec { background: var(--dark2); border: 1px solid var(--border); border-radius: 4px; padding: 0.9rem 1.1rem; }
	.rec-head { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; flex-wrap: wrap; }
	.name { font-weight: 500; font-size: 15px; }
	.status { font-family: var(--font-mono); font-size: 8.5px; letter-spacing: 0.12em; text-transform: uppercase; padding: 2px 7px; border-radius: 2px; border: 1px solid; white-space: nowrap; }
	.st-attended { color: var(--green); border-color: rgba(93,191,130,0.4); background: rgba(93,191,130,0.08); }
	.st-skipped { color: var(--muted); border-color: var(--border); }
	/* Visit unknown — fainter than `skipped`, which asserts a decision not to go. */
	.st-unknown { color: var(--muted); border-color: var(--border); border-style: dotted; opacity: 0.8; }
	.st-offguide { color: var(--blue); border-color: rgba(90,175,224,0.4); background: rgba(90,175,224,0.08); }
	.st-closed { color: var(--burnt-light); border-color: rgba(200,90,0,0.45); background: rgba(200,90,0,0.08); }
	.st-visited { color: var(--gold); border-color: rgba(212,168,67,0.45); background: rgba(212,168,67,0.08); }
	.st-retro { color: var(--gold); border-color: var(--gold); border-style: dashed; }
	.meta { font-family: var(--font-mono); font-size: 10.5px; color: var(--muted); margin-top: 3px; }
	.note { font-size: 13px; opacity: 0.9; margin-top: 5px; }
	.sources { margin-top: 7px; display: flex; flex-wrap: wrap; gap: 6px; }
	.src { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--border); border-radius: 2px; padding: 1px 6px; text-decoration: none; }
	a.src:hover { color: var(--gold); border-color: var(--gold); }
	.warn { color: var(--burnt-light); border-color: rgba(200,90,0,0.45); }
</style>
