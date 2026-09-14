<script lang="ts">
	import { INTEREST_TAGS } from '$lib/registry';
	import type { Recommendation } from '$lib/types';

	// What a city's guide is MADE OF, along the cross-cutting interest axis.
	// This describes the guide's composition — not the city, and not where the
	// days went. A tag count is the number of picks the guide filed under an
	// interest, nothing more (D27: the label names exactly what it counts).
	//
	// WITHIN-CITY ONLY, deliberately. Multi-tagging density varies by guide —
	// Oklahoma City averages 2.27 tags per tagged recommendation against Boise's
	// 1.12 — so raw counts are a fact about tagging style as much as about the
	// city. Shares inside one city are comparable; the same bar against another
	// city's is not, and nothing here invites that comparison.
	let { recommendations }: { recommendations: Recommendation[] } = $props();

	const rows = $derived.by(() => {
		const counts = new Map<string, number>(Object.keys(INTEREST_TAGS).map((k) => [k, 0]));
		let total = 0;
		for (const r of recommendations) {
			for (const t of r.interestTags ?? []) {
				if (!counts.has(t)) continue;
				counts.set(t, (counts.get(t) as number) + 1);
				total++;
			}
		}
		// Registry order is the vocabulary's own; sort by count so the shape of
		// this city reads at a glance. Zeros are kept and labelled rather than
		// dropped — "no drinks picks at all" is a fact about the guide, and
		// hiding it would make every city's list look equally full.
		return {
			total,
			items: [...counts.entries()]
				.map(([key, n]) => ({ key, label: INTEREST_TAGS[key], n, pct: total ? (n / total) * 100 : 0 }))
				.sort((a, b) => b.n - a.n || a.label.localeCompare(b.label))
		};
	});
	const max = $derived(Math.max(...rows.items.map((i) => i.n), 1));
	const tagged = $derived(recommendations.filter((r) => (r.interestTags ?? []).length).length);
</script>

{#if rows.total}
	<div class="comp">
		{#each rows.items as i}
			<div class="row" class:zero={i.n === 0}>
				<span class="label">{i.label}</span>
				<div class="track">
					<div class="fill" style="width: {(i.n / max) * 100}%"></div>
				</div>
				<span class="n">{i.n}</span>
				<span class="pct">{i.n ? `${i.pct.toFixed(0)}%` : '—'}</span>
			</div>
		{/each}
	</div>
	<p class="note">
		{rows.total} interest tags across {tagged} of {recommendations.length} recommendations —
		a pick can carry more than one. Shares are of tags, not of recommendations, and describe
		what this guide surfaced rather than where the days went.
	</p>
{/if}

<style>
	.comp { display: flex; flex-direction: column; gap: 0.55rem; }
	/* Tags are NOMINAL — one hue for every bar. Colouring by value would
	   double-encode length and spend the only free channel for nothing. */
	.row { display: grid; grid-template-columns: 8.5rem 1fr 2.2rem 2.4rem; align-items: center; gap: 0.7rem; }
	.label { font-size: 12.5px; color: var(--cream); }
	.track { height: 8px; background: var(--dark2); border-radius: 2px; }
	.fill { height: 100%; background: var(--gold); border-radius: 2px; }
	.n { font-family: var(--font-mono); font-size: 11.5px; color: var(--cream); text-align: right; font-variant-numeric: tabular-nums; }
	.pct { font-family: var(--font-mono); font-size: 10px; color: var(--muted); text-align: right; font-variant-numeric: tabular-nums; }
	/* An absent interest keeps its row and its label, but loses the ink — the
	   gap is the information, so it is shown rather than dropped. */
	.zero .label, .zero .n { color: var(--muted); opacity: 0.6; }
	.note { font-family: var(--font-mono); font-size: 9.5px; line-height: 1.75; letter-spacing: 0.03em; color: var(--muted); margin-top: 1.1rem; }
	@media (max-width: 600px) {
		.row { grid-template-columns: 6.6rem 1fr 2rem 2.2rem; gap: 0.5rem; }
		.label { font-size: 11.5px; }
	}
</style>
