<script lang="ts">
	// D8's through-line as a cross-city spread rather than 14 isolated bars.
	// Cities are NOMINAL, so every bar carries the same hue — colouring by value
	// would double-encode bar length and burn the only free channel.
	type Row = { id: string; name: string; state: string; pct: number; cityProper: number; metro: number; mechanism: string | null; kind: string };
	let { rows, pending = [] }: { rows: Row[]; pending?: { name: string; state: string }[] } = $props();

	const fmt = (n: number) => n.toLocaleString('en-US');
	const max = $derived(Math.max(...rows.map((r) => r.pct), 1));
</script>

<div class="chart">
	{#each rows as r}
		<div class="row">
			<div class="head">
				<span class="city">{r.name}<span class="st">{r.state}</span></span>
				<span class="pct">{r.pct}%</span>
			</div>
			<div class="track">
				<div class="fill" style="width: {(r.pct / max) * 100}%"></div>
			</div>
			<p class="pop">{fmt(r.cityProper)} in the city · {fmt(r.metro)} in the metro</p>
			{#if r.mechanism}
				<p class="mech" class:trend={r.kind === 'trend'}>{r.mechanism}</p>
			{/if}
		</div>
	{/each}

	{#if pending.length}
		<div class="pending">
			<p class="p-label">Data pending</p>
			<p class="p-list">{pending.map((p) => `${p.name}, ${p.state}`).join(' · ')}</p>
		</div>
	{/if}
</div>

<style>
	.chart { display: flex; flex-direction: column; gap: 1.6rem; }
	.row { display: flex; flex-direction: column; }
	.head { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; margin-bottom: 6px; }
	.city { font-size: 14px; color: var(--cream); }
	.st { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; color: var(--muted); margin-left: 7px; }
	/* tabular-nums: these align vertically down the right edge */
	.pct { font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--gold); font-variant-numeric: tabular-nums; }
	.track { height: 7px; background: var(--dark3); border-radius: 2px; overflow: hidden; }
	.fill { height: 100%; background: var(--gold); border-radius: 2px; }
	.pop { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.05em; color: var(--muted); margin-top: 7px; }
	.mech { font-size: 12.5px; line-height: 1.6; color: var(--cream); opacity: 0.82; margin-top: 7px; padding-left: 0.8rem; border-left: 2px solid var(--gold); }
	/* A population trend qualifies the number; a structural mechanism explains it.
	   Different claim, so it is marked as different — muted rule, not gold. */
	.mech.trend { border-left-color: var(--border); opacity: 0.7; }
	.pending { border-top: 1px solid var(--border); padding-top: 1rem; }
	.p-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); }
	.p-list { font-size: 12.5px; color: var(--muted); opacity: 0.75; margin-top: 5px; }
</style>
