<script lang="ts">
	import VisitedPlaces from '$lib/components/VisitedPlaces.svelte';
	import cityIndex from '$lib/data/cityIndex.json';
	import adherence from '$lib/data/adherence.json';
	import visited from '$lib/data/visited.json';
	import mapsMeta from '$lib/data/chapterMeta.json';

	let { data } = $props();
	const trip = $derived(data.trip);
	const meta = $derived((mapsMeta.chapters as Record<string, { num: string; blurb: string; curation: string; mixSource: string }>)[trip.id]);
	const byId = Object.fromEntries(cityIndex.map((c) => [c.id, c]));

	type Place = { name: string; count: number; categories: string[]; provenance: string };

	const stops = $derived(
		trip.cityIds.map((id: string) => {
			const idx = byId[id];
			const city = data.cities[id];
			return {
				id, name: idx.name, state: idx.state, nights: idx.nights,
				role: idx.role ?? null,
				built: data.builtIds.includes(id),
				recs: city ? city.recCount : 0,
				confirmed: city ? city.confirmedCount : 0
			};
		})
	);

	// "Nights on the road" excludes origin/anchor/home. Summing every city's
	// nights for Chapter I gives 200, because Austin's 177-night anchor stay is
	// in that list — a number a reader would take for the drive. The chapter's
	// own date span is shown separately, as a span.
	const roadNights = $derived(stops.filter((s) => !s.role).reduce((a, s) => a + s.nights, 0));
	const days = $derived(Math.round((Date.parse(trip.dates.end) - Date.parse(trip.dates.start)) / 86_400_000) + 1);

	const recs = $derived(stops.reduce((a, s) => a + s.recs, 0));
	const confirmed = $derived(stops.reduce((a, s) => a + s.confirmed, 0));

	const places = $derived(trip.cityIds.flatMap((id: string) => (visited.cities as Record<string, Place[]>)[id] ?? []));
	const prov = $derived({
		guide: places.filter((p) => p.provenance === 'guide').length,
		own: places.filter((p) => p.provenance === 'own-list').length,
		found: places.filter((p) => p.provenance === 'found').length
	});

	const adh = $derived(
		trip.cityIds
			.map((id: string) => ({ id, name: byId[id].name, a: (adherence.cities as Record<string, { listConversionPct: number; visitsThatWereOnListPct: number }>)[id] }))
			.filter((x: { a: unknown }) => x.a)
	);

	// D27: read verbatim, never summed. Summing per-city interestTagCounts gives
	// west food 44 / coffee 44 where the authoritative comparison says 51 / 50.
	const cmp = adherence.comparison as Record<string, { interestMix?: Record<string, number> }>;
	const LABELS: Record<string, string> = {
		books: 'Books', museums_history: 'Museums & history', records_music: 'Record stores',
		food: 'Food', coffee: 'Coffee', outdoors: 'Outdoors', horror_occult: 'Horror & occult', film: 'Film'
	};
	const mix = $derived(
		Object.entries(
			(meta.mixSource === 'city'
				? ((visited.interestTagCounts as Record<string, Record<string, number>> | undefined)?.[trip.cityIds[0]] ?? {})
				: (cmp[meta.mixSource]?.interestMix ?? {})) as Record<string, number>
		).sort((a, b) => b[1] - a[1])
	);

	const greensboro = $derived(trip.id === 'south' ? mapsMeta.sideTrip : null);
	const pendingNote = $derived(stops.filter((s) => s.role && !s.built));
</script>

<svelte:head><title>{meta.num} · {trip.title} — The Long Way Home</title></svelte:head>

<main>
	<a class="back" href="/">← The Long Way Home</a>

	<header>
		<p class="eyebrow">{meta.num}{#if trip.type === 'interlude'} · Interlude{/if}</p>
		<h1>{trip.title}</h1>
		<p class="sub">{trip.subtitle}</p>
		<p class="lede">{meta.blurb}</p>
		<p class="span">{trip.dates.start} → {trip.dates.end} · {days} days{#if roadNights} · <b>{roadNights} nights on the road</b>{/if}</p>
	</header>

	<section>
		<h2>The route</h2>
		<ol class="stops">
			{#each stops as s}
				<li class="stop" class:way={!!s.role}>
					<span class="marker" aria-hidden="true"></span>
					<div class="s-body">
						<p class="s-name">
							{#if s.built}<a href="/city/{s.id}">{s.name}</a>{:else}<span class="pend">{s.name}</span>{/if}<span class="s-state">{s.state}</span>
						</p>
						<p class="s-meta">
							{#if s.role}<span class="role">{s.role}</span>{/if}
							{#if s.nights}{s.nights} {s.nights === 1 ? 'night' : 'nights'}{/if}
							{#if s.recs} · {s.recs} recommendations{#if s.confirmed}, ≥{s.confirmed} confirmed{/if}{/if}
							{#if !s.built && !s.role} · data pending{/if}
						</p>
					</div>
				</li>
			{/each}
		</ol>
		{#if pendingNote.length}
			<p class="note">
				{pendingNote.map((s) => s.name).join(' and ')}
				{pendingNote.length === 1 ? 'is a waypoint, not a stop' : 'are waypoints, not stops'} — where life happened
				rather than where the trip went. Their location history is deliberately not carried here.
			</p>
		{/if}
	</section>

	{#if recs || places.length}
		<section>
			<h2>What this chapter holds</h2>
			<div class="figs">
				<div class="fig"><span class="n">{stops.length}</span><span class="l">Stops</span></div>
				{#if recs}<div class="fig"><span class="n">{recs}</span><span class="l">Recommendations</span></div>{/if}
				<!-- "—" rather than "≥0" when nothing is confirmed, matching the city
				     page: a floor of zero is not a measurement worth printing as one. -->
				{#if recs}<div class="fig"><span class="n">{#if confirmed}≥{confirmed}{:else}—{/if}</span><span class="l">Confirmed visited</span></div>{/if}
				{#if places.length}<div class="fig"><span class="n">{places.length}</span><span class="l">Places navigated to</span></div>{/if}
			</div>
			{#if places.length}
				<p class="note">
					Of those places, {prov.guide} were on the sourced guide, {prov.own} on the self-made
					list, and {prov.found} on neither. “On the self-made list” is an upper bound and
					“found” a floor — saves cannot be dated.
				</p>
			{/if}
		</section>
	{/if}

	{#if mix.length}
		<section>
			<h2>What it was about</h2>
			<p class="framing">
				{meta.curation}
				{#if meta.mixSource === 'city'}
					Interest counts are New Orleans's own — one city, so this is its record rather than a chapter aggregate.
				{:else}
					Counts are the whole trip's, read from the corpus-wide comparison rather than summed per city.
				{/if}
			</p>
			<ul class="mix">
				{#each mix as [k, v]}
					<li><span class="m-l">{LABELS[k] ?? k}</span><span class="m-bar" style="width:{(v / mix[0][1]) * 100}%"></span><span class="m-v">{v}</span></li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if greensboro}
		<section>
			<h2>Off the route</h2>
			<div class="side">
				<p class="side-where">{greensboro.where}</p>
				<p class="side-note">{greensboro.note}</p>
				<p class="side-ev">{greensboro.evidence} · {greensboro.window}</p>
			</div>
		</section>
	{/if}

	{#if adh.length}
		<section>
			<h2>How closely the list was followed</h2>
			<ul class="adh">
				{#each adh as x}
					<li><span class="a-city">{x.name}</span><span class="a-v">{x.a.listConversionPct.toFixed(1)}% of the list</span><span class="a-v">{x.a.visitsThatWereOnListPct.toFixed(1)}% of visits</span></li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if places.length}
		<section>
			<h2>Where the days actually went</h2>
			<VisitedPlaces {places} />
		</section>
	{/if}

	<section class="absent">
		<h2>Not yet here</h2>
		<p>
			<b>The leg ledger.</b> Distances and drive times between these stops are not
			reconstructed — location-history tracking was off during the trips, so there are no
			GPS traces to measure, and the routing pull that would supply canonical mileage
			hasn't been run. Until it is, this chapter shows where the days went but not how far
			they travelled.
		</p>
	</section>

	<a class="back bottom" href="/">← The Long Way Home</a>
</main>

<style>
	main { max-width: 820px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
	.back { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); text-decoration: none; }
	.back:hover { color: var(--gold); }
	.bottom { display: block; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--border); }
	header { margin: 2.5rem 0 3.5rem; }
	.eyebrow { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--burnt-light); }
	h1 { font-family: var(--font-display); font-size: clamp(2.4rem, 7vw, 3.6rem); font-weight: 700; line-height: 1.05; margin: 0.6rem 0 0.5rem; }
	.sub { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold); }
	.lede { font-size: 1.02rem; line-height: 1.7; color: var(--cream); opacity: 0.92; margin-top: 1.3rem; }
	.span { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.06em; color: var(--muted); margin-top: 1rem; }
	.span b { color: var(--cream); font-weight: 400; }
	section { margin-bottom: 3.2rem; }
	h2 { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; margin-bottom: 1.1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
	.framing { line-height: 1.7; opacity: 0.9; margin-bottom: 1.5rem; }
	.note { font-size: 12.5px; line-height: 1.7; color: var(--muted); margin-top: 1.2rem; }

	.stops { list-style: none; display: flex; flex-direction: column; }
	.stop { display: grid; grid-template-columns: 22px 1fr; gap: 0.8rem; padding-bottom: 1.1rem; position: relative; }
	.stop:not(:last-child) .marker::after { content: ''; position: absolute; left: 5px; top: 13px; bottom: -4px; width: 1px; background: var(--border); }
	.marker { width: 11px; height: 11px; border-radius: 50%; border: 2px solid var(--gold); margin-top: 4px; position: relative; }
	.way .marker { border-color: var(--muted); background: var(--dark3); }
	.s-name a { color: var(--cream); text-decoration: none; border-bottom: 1px solid var(--border); }
	.s-name a:hover { color: var(--gold); border-color: var(--gold); }
	.pend { color: var(--muted); }
	.s-state { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; color: var(--muted); margin-left: 8px; }
	.s-meta { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.04em; color: var(--muted); margin-top: 4px; }
	.role { text-transform: uppercase; letter-spacing: 0.12em; color: var(--burnt-light); margin-right: 7px; }

	.figs { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1.3rem; }
	.fig { display: flex; flex-direction: column; }
	.n { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--gold); line-height: 1; }
	.l { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 7px; }

	.mix { list-style: none; display: flex; flex-direction: column; gap: 0.55rem; }
	.mix li { display: grid; grid-template-columns: 132px 1fr 34px; gap: 0.7rem; align-items: center; }
	.m-l { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
	.m-bar { height: 7px; background: var(--gold); border-radius: 2px; min-width: 2px; }
	.m-v { font-family: var(--font-mono); font-size: 10px; color: var(--muted); text-align: right; font-variant-numeric: tabular-nums; }

	.side { border-left: 2px solid var(--blue); padding-left: 1.1rem; }
	.side-where { font-size: 14px; color: var(--cream); }
	.side-note { font-size: 13px; line-height: 1.7; opacity: 0.88; margin-top: 6px; }
	.side-ev { font-family: var(--font-mono); font-size: 9.5px; color: var(--muted); margin-top: 8px; }

	.adh { list-style: none; display: flex; flex-direction: column; gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
	.adh li { background: var(--dark2); display: grid; grid-template-columns: 1fr auto auto; gap: 1rem; padding: 0.55rem 0.9rem; align-items: baseline; }
	.a-city { font-size: 13px; color: var(--cream); }
	.a-v { font-family: var(--font-mono); font-size: 9.5px; color: var(--muted); font-variant-numeric: tabular-nums; }

	.absent p { line-height: 1.7; opacity: 0.82; }
	b { color: var(--cream); font-weight: 500; }
	@media (max-width: 600px) {
		main { padding: 2rem 1.15rem 3.5rem; }
		.mix li { grid-template-columns: 108px 1fr 30px; }
		.adh li { grid-template-columns: 1fr; gap: 0.2rem; }
	}
</style>
