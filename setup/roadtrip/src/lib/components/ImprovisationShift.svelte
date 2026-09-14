<script lang="ts">
	// Two measures, two trips — four numbers. Deliberately NOT a fourth chart:
	// a handful of headline numbers is a stat row, not a grouped bar. The two
	// measures are on incompatible scales (a ratio and a per-day count), so they
	// can never share a value axis; percentage change is the one common base they
	// legitimately share, and that is what the bars encode.
	//
	// Raw before/after values are the truth and are always direct-labelled from
	// the verbatim figures. The bars carry only the comparison — magnitude of
	// change — so they are ONE hue (D25 sequential-for-magnitude), never a
	// second categorical pair. Trip identity stays with the gold/burnt dots,
	// the validated pair CurationSlope already uses.
	type Side = { searchToDirectionsRatio: number | null; uniquePlacesPerCityDay: number | null };
	let { trip1, trip2 }: { trip1: Side; trip2: Side } = $props();

	const MEASURES = [
		{
			key: 'searchToDirectionsRatio' as const,
			label: 'Searches per direction request',
			gloss: 'How much looking-around it took to get moving'
		},
		{
			key: 'uniquePlacesPerCityDay' as const,
			label: 'Distinct places per city-day',
			gloss: 'How much ground a day actually covered'
		}
	];

	const rows = $derived(
		MEASURES.map((m) => {
			const a = trip1[m.key];
			const b = trip2[m.key];
			// Every field is nullable (D9): a measure missing on either side
			// renders nothing rather than a zero or a dash.
			const pct = a != null && b != null && a !== 0 ? ((b - a) / a) * 100 : null;
			return { ...m, a, b, pct };
		}).filter((r) => r.a != null && r.b != null && r.pct != null)
	);
	// Shared axis across both bars, so their lengths are comparable — that
	// comparability IS the finding.
	const max = $derived(Math.max(...rows.map((r) => Math.abs(r.pct as number)), 1));
	// Rendered as stored — 1.19, 0.99, 5.4, 5.2 already carry the source's own
	// precision, and String() gives the shortest round-trip form. Formatting
	// them would be the first step toward restating them.
	const fmt = (n: number) => String(n);
	const pctLabel = (n: number) => `${n > 0 ? '+' : '−'}${Math.abs(n).toFixed(1)}%`;
</script>

{#if rows.length}
	<div class="legend">
		<span><i class="key t1"></i>Trip 1 · self-curated</span>
		<span><i class="key t2"></i>Trip 2 · sourced guides</span>
	</div>

	<div class="rows">
		{#each rows as r}
			<div class="row">
				<div class="head">
					<p class="label">{r.label}</p>
					<p class="vals">
						<i class="dot d1" aria-hidden="true"></i><span>{fmt(r.a as number)}</span>
						<span class="arrow" aria-hidden="true">→</span>
						<i class="dot d2" aria-hidden="true"></i><span>{fmt(r.b as number)}</span>
					</p>
				</div>
				<div
					class="bar-row"
					role="img"
					aria-label="{r.label}: {fmt(r.a as number)} on trip one, {fmt(r.b as number)} on trip two, {pctLabel(r.pct as number)}"
				>
					<div class="track">
						<div class="fill" style="width: {(Math.abs(r.pct as number) / max) * 100}%"></div>
					</div>
					<span class="delta">{pctLabel(r.pct as number)}</span>
				</div>
				<p class="gloss">{r.gloss}</p>
			</div>
		{/each}
	</div>
{/if}

<style>
	.legend { display: flex; flex-wrap: wrap; gap: 1.2rem; font-family: var(--font-mono); font-size: 10px; color: var(--muted); margin-bottom: 1.5rem; }
	.legend span { display: inline-flex; align-items: center; gap: 6px; }
	.key { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
	.t1 { background: var(--gold); }
	.t2 { background: var(--burnt); }
	.rows { display: flex; flex-direction: column; gap: 1.9rem; }
	.head { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; flex-wrap: wrap; margin-bottom: 9px; }
	.label { font-size: 14px; color: var(--cream); }
	/* Text wears text tokens; the coloured dot beside each value carries trip
	   identity, so nothing here is reachable by colour alone. */
	.vals { font-family: var(--font-mono); font-size: 12px; color: var(--cream); display: inline-flex; align-items: center; gap: 5px; font-variant-numeric: tabular-nums; }
	.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
	.d1 { background: var(--gold); }
	.d2 { background: var(--burnt); }
	.arrow { color: var(--muted); opacity: 0.6; font-size: 10px; margin: 0 2px; }
	/* The track is its own flex child so the fill is always an exact percentage
	   of a FULL-width track. Letting the fill and the label share one flex
	   context made the longest bar shrink to make room for its label, which
	   silently broke the shared axis the two bars are compared on. The label
	   is fixed-width for the same reason: both tracks must measure the same. */
	.bar-row { display: flex; align-items: center; gap: 9px; }
	.track { flex: 1; height: 9px; background: var(--dark2); border-radius: 2px; }
	.fill { height: 100%; background: var(--burnt); border-radius: 2px; }
	.delta { flex: none; width: 4.6em; text-align: right; font-family: var(--font-mono); font-size: 10.5px; color: var(--cream); font-variant-numeric: tabular-nums; white-space: nowrap; }
	.gloss { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.05em; color: var(--muted); margin-top: 8px; }
</style>
