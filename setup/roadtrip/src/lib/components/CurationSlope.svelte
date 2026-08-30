<script lang="ts">
	// The D22 finding: what got curated inverted between methods. A slope carries
	// change-between-two-states better than paired bars — direction is the point.
	// Trip 1 = gold, Trip 2 = burnt (validated pair: normal-vision ΔE 18.4,
	// deutan 15.3). Never burnt-light, which fails against gold at ΔE 12.5.
	let { mix }: { mix: { trip1: Record<string, number>; trip2: Record<string, number> } } = $props();

	const LABELS: Record<string, string> = {
		books: 'Books', museums_history: 'Museums & history', records_music: 'Record stores',
		food: 'Food', coffee: 'Coffee', outdoors: 'Outdoors', horror_occult: 'Horror & occult', film: 'Film'
	};

	// The two trips' category sets don't align — trip 1 has `film` and no
	// `records_music`, trip 2 the reverse. Render the UNION with explicit zeros:
	// "film 7 → 0" and "records 0 → 24" are the inversion, not gaps to hide.
	const rows = $derived(
		[...new Set([...Object.keys(mix.trip1), ...Object.keys(mix.trip2)])]
			.map((k) => {
				const a = mix.trip1[k] ?? 0;
				const b = mix.trip2[k] ?? 0;
				return { key: k, label: LABELS[k] ?? k, a, b, delta: b - a };
			})
			.sort((x, y) => y.delta - x.delta)
	);
	const max = $derived(Math.max(...rows.flatMap((r) => [r.a, r.b]), 1));
	const y = (v: number) => 100 - (v / max) * 100;
</script>

<div class="legend">
	<span><i class="key t1"></i>Trip 1 · self-curated</span>
	<span><i class="key t2"></i>Trip 2 · sourced guides</span>
</div>

<div class="slopes">
	{#each rows as r}
		<div class="slope">
			<p class="label">{r.label}</p>
			<!-- The connector stretches with the column, so it is the one SVG; the
			     dots are CSS so they stay circular at any width (a non-uniform
			     viewBox would render them as ellipses). -->
			<div class="plot" role="img" aria-label="{r.label}: {r.a} on trip one, {r.b} on trip two">
				<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
					<line class="conn" x1="0" y1={y(r.a)} x2="100" y2={y(r.b)} />
				</svg>
				<i class="dot d1" style="top: {y(r.a)}%"></i>
				<i class="dot d2" style="top: {y(r.b)}%"></i>
			</div>
			<p class="vals">
				<span>{r.a}</span>
				<span class="arrow" aria-hidden="true">→</span>
				<span>{r.b}</span>
			</p>
		</div>
	{/each}
</div>

<style>
	.legend { display: flex; flex-wrap: wrap; gap: 1.2rem; font-family: var(--font-mono); font-size: 10px; color: var(--muted); margin-bottom: 1.5rem; }
	.legend span { display: inline-flex; align-items: center; gap: 6px; }
	.key { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
	.t1 { background: var(--gold); }
	.t2 { background: var(--burnt); }
	.slopes { display: grid; grid-template-columns: repeat(auto-fit, minmax(104px, 1fr)); gap: 1.1rem; }
	.slope { display: flex; flex-direction: column; align-items: center; }
	.label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); text-align: center; min-height: 2.1em; }
	.plot { position: relative; width: 100%; height: 78px; margin: 8px 0; }
	svg { width: 100%; height: 100%; display: block; }
	.conn { stroke: var(--muted); stroke-width: 2; opacity: 0.35; vector-effect: non-scaling-stroke; }
	.dot { position: absolute; width: 9px; height: 9px; border-radius: 50%; margin-top: -4.5px; }
	.d1 { left: 0; margin-left: -4.5px; background: var(--gold); }
	.d2 { right: 0; margin-right: -4.5px; background: var(--burnt); }
	/* Every value is direct-labelled, so nothing is reachable by colour alone.
	   Text wears text tokens — the coloured dot beside it carries identity. */
	.vals { font-family: var(--font-mono); font-size: 11px; color: var(--cream); display: flex; align-items: baseline; gap: 5px; font-variant-numeric: tabular-nums; }
	.arrow { color: var(--muted); opacity: 0.6; font-size: 9px; }
</style>
