<script lang="ts">
	// Where the days actually went — the most-navigated places in a city, from
	// location history rather than from any guide. Deliberately NOT part of
	// `recommendations`: the hit-rate floor means "of the guide's N picks, how
	// many are confirmed", and folding in places no guide named would corrupt
	// that denominator.
	type Place = { name: string; count: number; categories: string[]; provenance: string };
	let { places }: { places: Place[] } = $props();

	const META: Record<string, { label: string; cls: string }> = {
		guide: { label: 'On the guide', cls: 'p-guide' },
		'own-list': { label: 'On my own list', cls: 'p-own' },
		found: { label: 'Found there', cls: 'p-found' }
	};
	const ORDER = ['found', 'own-list', 'guide'];
	const n = (p: string) => places.filter((x) => x.provenance === p).length;
</script>

{#if places.length}
	<div class="legend">
		{#each ORDER as p}
			{#if n(p)}<span><i class="key {META[p].cls}"></i>{META[p].label} · {n(p)}</span>{/if}
		{/each}
	</div>

	<ul class="places">
		{#each places as p}
			<li class="place">
				<span class="dot {META[p.provenance]?.cls}" aria-hidden="true"></span>
				<span class="name">{p.name}</span>
				<!-- Text label, so provenance is never carried by colour alone. -->
				<span class="prov">{META[p.provenance]?.label ?? p.provenance}</span>
				<span class="count">×{p.count}</span>
			</li>
		{/each}
	</ul>

	<p class="caveat">
		Ranked by direction requests — the only measure of emphasis the export carries, and
		truncated to roughly the top ten per city, so this is where the days went <em>most</em>,
		not everywhere. Provenance is matched after the fact, not recorded at the time: the
		export has no per-item save timestamps and the lists were edited during the trips, so a
		place saved while standing in it cannot be told from one saved before leaving.
		<b>“On my own list” is therefore an upper bound, and “found there” a floor.</b>
	</p>
{/if}

<style>
	.legend { display: flex; flex-wrap: wrap; gap: 1.1rem; font-family: var(--font-mono); font-size: 10px; color: var(--muted); margin-bottom: 1.1rem; }
	.legend span { display: inline-flex; align-items: center; gap: 6px; }
	.key { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
	.places { list-style: none; display: flex; flex-direction: column; gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
	.place { background: var(--dark2); display: grid; grid-template-columns: 10px 1fr auto auto; gap: 0.7rem; align-items: baseline; padding: 0.62rem 0.9rem; }
	.dot { width: 8px; height: 8px; border-radius: 50%; align-self: center; }
	/* D11's status colours: the off-guide blue finally carries something. */
	.p-guide { background: var(--gold); }
	.p-own { background: var(--muted); }
	.p-found { background: var(--blue); }
	.name { font-size: 13.5px; color: var(--cream); }
	.prov { font-family: var(--font-mono); font-size: 8.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
	.count { font-family: var(--font-mono); font-size: 10px; color: var(--muted); font-variant-numeric: tabular-nums; }
	.caveat { font-family: var(--font-mono); font-size: 10px; line-height: 1.75; letter-spacing: 0.03em; color: var(--muted); margin-top: 1rem; }
	.caveat b { color: var(--cream); font-weight: 400; }
	.caveat em { font-style: normal; color: var(--cream); }
	@media (max-width: 560px) {
		.place { grid-template-columns: 10px 1fr auto; }
		.prov { grid-column: 2 / -1; }
	}
</style>
