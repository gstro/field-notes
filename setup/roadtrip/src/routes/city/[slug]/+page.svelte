<script lang="ts">
	import Fingerprint from '$lib/components/Fingerprint.svelte';
	import Waffle from '$lib/components/Waffle.svelte';
	import RecommendationList from '$lib/components/RecommendationList.svelte';
	import FragmentationBar from '$lib/components/FragmentationBar.svelte';
	import FieldNotes from '$lib/components/FieldNotes.svelte';
	import PopCulture from '$lib/components/PopCulture.svelte';
	import Adherence from '$lib/components/Adherence.svelte';
	import cityIndex from '$lib/data/cityIndex.json';

	let { data } = $props();
	const c = $derived(data.city);
	// "Was this city covered by a retro guide (trip 1) or a sourced guide (trip 2)?"
	// Assumption made explicit: NOLA (`nola`) falls to the trip-2 branch. Moot
	// today — no NOLA city file exists — but revisit here if one lands, since
	// NOLA was an interlude with its own saved list and no sourced guide.
	const isRetro = $derived(c.tripId === 'west');

	// Prev/next from the index order; only link built cities (data.builtIds from load)
	const order = cityIndex.map((x) => x.id);
	const pos = $derived(order.indexOf(c.id));
	const prev = $derived(pos > 0 ? cityIndex[pos - 1] : null);
	const next = $derived(pos < order.length - 1 ? cityIndex[pos + 1] : null);
	const chapterName = $derived(
		{ west: 'Chapter I · The Interstate West', nola: 'Interlude · Mardi Gras', south: 'Chapter II · The Civil Rights Corridor' }[c.tripId]
	);
	const fav = $derived(c.favorites as Record<string, { what?: string; where?: string; note?: string } | string>);
</script>

<svelte:head><title>{c.name}, {c.state} — The Long Way Home</title></svelte:head>

<div class="wrap">
	<header class="city-head">
		<div>
			<p class="crumb"><a href="/">← Home</a> · {chapterName} · City {pos + 1} of {order.length}</p>
			{#if c.vibeWord}<p class="vibe">"{c.vibeWord}"</p>{/if}
			<h1>{c.name}</h1>
			{#if c.tagline}<p class="tagline">{c.tagline}</p>{/if}
		</div>
		<div class="head-meta">
			{c.stay.arrive} → {c.stay.depart} · <b>{c.stay.nights} nights</b><br>
			{#if c.elevationFt != null}Elevation <b>{c.elevationFt} ft</b>{/if}
		</div>
	</header>

	<section class="row fp-row">
		<div>
			<p class="panel-label">City Fingerprint</p>
			<Fingerprint fingerprint={c.fingerprint} />
		</div>
		<div>
			<p class="panel-label">Favorites</p>
			<div class="fav-grid">
				{#each [['Meal', fav.meal], ['Coffee', fav.coffee], ['Site', fav.site]] as [label, f]}
					{#if f && typeof f === 'object' && (f.what || f.where)}
						<div class="fav">
							<p class="f-cat">{label}</p>
							{#if f.what}<p class="f-what">{f.what}</p>{/if}
							{#if f.where}<p class="f-where">{f.where}</p>{/if}
							{#if f.note}<p class="f-note">{f.note}</p>{/if}
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</section>

	<!-- Two questions, two sources, two panels. Conflating them is what produced
	     the `0 / N` defect: the guide hit rate is a floor derived from a
	     truncated visit log, while the curation comparison (D22) comes from the
	     full Maps corpus and is authoritative. -->
	<section class="row">
		<div>
			<p class="panel-label">{isRetro ? 'Retro Guide vs. What Happened' : 'Guide Hit Rate'}</p>
			<Waffle recommendations={c.recommendations} {isRetro} />
		</div>
		<div>
			<p class="panel-label">How Closely the List Was Followed</p>
			<Adherence cityId={c.id} />
		</div>
	</section>

	<section class="row">
		<div>
			<p class="panel-label">The Fragmentation Gap</p>
			<FragmentationBar population={c.population} />
		</div>
	</section>

	<section class="single">
		<p class="panel-label">The Full List — Sourced &amp; Cited</p>
		<RecommendationList recommendations={c.recommendations} />
	</section>

	<section class="row">
		<div>
			<p class="panel-label">Pop Culture &amp; Pilgrimage</p>
			<PopCulture popCulture={c.popCulture} />
		</div>
		{#if c.wouldILiveHere.verdict}
			<div>
				<p class="panel-label">The Verdict</p>
				<div class="verdict">
					<p class="v-q">Would I live here?</p>
					<p class="v-a">"{c.wouldILiveHere.verdict}"</p>
					{#if c.wouldILiveHere.note}<p>{c.wouldILiveHere.note}</p>{/if}
				</div>
			</div>
		{/if}
	</section>

	<section class="single">
		<FieldNotes fieldNotes={c.fieldNotes} />
	</section>

	<nav class="city-nav">
		{#if prev && data.builtIds.includes(prev.id)}<a href="/city/{prev.id}">← {prev.name}, {prev.state}</a>
		{:else if prev}<span class="pending">← {prev.name} · data pending</span>{:else}<span></span>{/if}
		{#if next && data.builtIds.includes(next.id)}<a href="/city/{next.id}">{next.name}, {next.state} →</a>
		{:else if next}<span class="pending">{next.name} · data pending →</span>{/if}
	</nav>
</div>

<style>
	.wrap { max-width: 1000px; margin: 0 auto; padding: 0 2rem; }
	.city-head { padding: 4rem 0 2.5rem; border-bottom: 1px solid var(--border); display: grid; grid-template-columns: 1fr 300px; gap: 2rem; align-items: end; }
	.crumb { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--burnt-light); margin-bottom: 1rem; }
	.crumb a { color: inherit; text-decoration: none; }
	.vibe { font-family: var(--font-display); font-style: italic; font-size: 1.1rem; color: var(--gold); margin-bottom: 0.25rem; }
	h1 { font-family: var(--font-display); font-size: clamp(2.6rem, 6vw, 4.4rem); font-weight: 700; line-height: 1; margin-bottom: 0.75rem; }
	.tagline { font-size: 15px; max-width: 480px; opacity: 0.9; }
	.head-meta { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing: 0.06em; line-height: 2.1; text-align: right; }
	.head-meta b { color: var(--cream); font-weight: 500; }
	.row { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; padding: 2.5rem 0; border-bottom: 1px solid var(--border); }
	.fp-row { grid-template-columns: 340px 1fr; }
	.single { padding: 2.5rem 0; border-bottom: 1px solid var(--border); }
	.panel-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--burnt-light); margin-bottom: 1rem; }
	.fav-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
	.fav { background: var(--dark2); border: 1px solid var(--border); border-radius: 4px; padding: 1.1rem 1.25rem; }
	.f-cat { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.35rem; }
	.f-what { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
	.f-where { font-size: 12.5px; color: var(--gold); }
	.f-note { font-size: 12.5px; color: var(--muted); margin-top: 0.3rem; }
	.verdict { background: var(--dark2); border: 1px solid var(--border); border-radius: 4px; padding: 1.75rem; }
	.v-q { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); }
	.v-a { font-family: var(--font-display); font-style: italic; font-size: 2rem; font-weight: 700; color: var(--gold); margin: 0.5rem 0; }
	.city-nav { display: flex; justify-content: space-between; padding: 1.5rem 0 3rem; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; }
	.city-nav a { color: var(--gold); text-decoration: none; }
	.city-nav a:hover { color: var(--burnt-light); }
	.pending { color: var(--muted); opacity: 0.55; }
	@media (max-width: 720px) {
		.city-head, .row, .fp-row { grid-template-columns: 1fr; }
		.head-meta { text-align: left; }
		.fav-grid { grid-template-columns: 1fr; }
	}
</style>
