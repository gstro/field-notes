<script lang="ts">
	// Per-city list-following, grouped by curation method. Both measures are
	// percentages on one scale — never a second axis.
	// Trip 1 = gold, Trip 2 = burnt (validated pair; see CurationSlope).
	type Row = { id: string; name: string; trip: string; listConversionPct: number; visitsThatWereOnListPct: number };
	let { rows }: { rows: Row[] } = $props();

	// Fixed to 1dp: the values align vertically, and mixing "46%" with "68.4%"
	// makes a tabular column read ragged. Presentation only — the number is
	// unchanged.
	const pct = (n: number) => n.toFixed(1);

	const groups = $derived([
		{ trip: 'trip1', label: 'Trip 1 · self-curated', rows: rows.filter((r) => r.trip === 'trip1') },
		{ trip: 'trip2', label: 'Trip 2 · sourced guides', rows: rows.filter((r) => r.trip === 'trip2') }
	].filter((g) => g.rows.length));
</script>

<div class="legend">
	<span><i class="key solid"></i>Of the list, navigated to</span>
	<span><i class="key hatch"></i>Of places gone to, on the list</span>
</div>

<div class="groups">
	{#each groups as g}
		<section class="group" class:t2={g.trip === 'trip2'}>
			<p class="g-label">{g.label}</p>
			{#each g.rows as r}
				<div class="row">
					<span class="city">{r.name}</span>
					<div class="bars">
						<div class="bar-wrap">
							<div class="bar solid" style="width: {r.listConversionPct}%"></div>
							<span class="v">{pct(r.listConversionPct)}%</span>
						</div>
						<div class="bar-wrap">
							<div class="bar hatch" style="width: {r.visitsThatWereOnListPct}%"></div>
							<span class="v">{pct(r.visitsThatWereOnListPct)}%</span>
						</div>
					</div>
				</div>
			{/each}
		</section>
	{/each}
</div>

<style>
	.legend { display: flex; flex-wrap: wrap; gap: 1.2rem; font-family: var(--font-mono); font-size: 10px; color: var(--muted); margin-bottom: 1.5rem; }
	.legend span { display: inline-flex; align-items: center; gap: 6px; }
	.key { width: 14px; height: 8px; border-radius: 2px; display: inline-block; background: var(--muted); }
	/* Measure is distinguished by fill texture, not by a second hue — the hue
	   slot is spent on trip identity, and texture keeps the two readable when
	   the group colour changes. */
	.key.hatch { background: repeating-linear-gradient(135deg, var(--muted) 0 2px, transparent 2px 5px); }
	.groups { display: flex; flex-direction: column; gap: 2rem; }
	.g-label { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.9rem; }
	.t2 .g-label { color: var(--burnt-light); }
	.row { display: grid; grid-template-columns: 108px 1fr; gap: 0.9rem; align-items: center; margin-bottom: 0.65rem; }
	.city { font-size: 12.5px; color: var(--cream); }
	.bars { display: flex; flex-direction: column; gap: 3px; }
	.bar-wrap { display: flex; align-items: center; gap: 7px; }
	.bar { height: 7px; border-radius: 2px; background: var(--gold); min-width: 2px; }
	.bar.hatch { background: repeating-linear-gradient(135deg, var(--gold) 0 2px, transparent 2px 5px); }
	.t2 .bar { background: var(--burnt); }
	.t2 .bar.hatch { background: repeating-linear-gradient(135deg, var(--burnt) 0 2px, transparent 2px 5px); }
	.v { font-family: var(--font-mono); font-size: 9.5px; color: var(--muted); font-variant-numeric: tabular-nums; }
	@media (max-width: 520px) { .row { grid-template-columns: 1fr; gap: 0.3rem; } }
</style>
