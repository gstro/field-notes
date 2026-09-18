<script lang="ts">
	import ConstellationMap from '$lib/components/ConstellationMap.svelte';
	import StatStrip from '$lib/components/StatStrip.svelte';
	import trips from '$lib/data/trips.json';
	import cityIndex from '$lib/data/cityIndex.json';
	// Shared with /chapter/[id] so the blurbs cannot drift between the two.
	import chapterMetaFile from '$lib/data/chapterMeta.json';
	const chapterMeta = chapterMetaFile.chapters as Record<string, { num: string; blurb: string }>;

	// Ids only — this page needs to know WHICH cities are built (D10: unbuilt
	// ones render as non-linked "data pending"), never their contents. Reading
	// the summary instead of globbing the corpus keeps ~670KB of recommendation
	// prose out of the bundle a first-time visitor downloads.
	import citySummary from '$lib/data/citySummary.json';
	const built = new Set(citySummary.cities.map((c) => c.id));
	const byId = Object.fromEntries(cityIndex.map((c) => [c.id, c]));

	// Derived, so they cannot drift from the data: the arc's span from trips.json
	// and the city count from cityIndex.
	const arcStart = trips.trips[0].dates.start;
	const arcEnd = trips.trips[trips.trips.length - 1].dates.end;
	const totalDays =
		Math.round((Date.parse(arcEnd) - Date.parse(arcStart)) / 86_400_000) + 1; // inclusive

	// `pending: true` = not reconstructed from any source. Miles needs retroactive
	// Maps routing (M0); records and books have no source at all and would be
	// memory. They keep their slots but must not read as measured — see D9 and
	// design/m36-purge-invented-data.md. Replacements once M0 lands: 101 city-days,
	// 550 places navigated to, 641 places saved (all in maps-trip-analysis-public.json).
	const stats = [
		{ n: '4,812', l: 'Miles Driven', pending: true },
		{ n: String(totalDays), l: 'Days' },
		{ n: String(cityIndex.length), l: 'Cities' },
		{ n: '61', l: 'Records Bought', pending: true },
		{ n: '38 lbs', l: 'Of Books', pending: true },
		{ n: '243', l: 'CPAP Setups', wry: true }
	];
</script>

<svelte:head><title>The Long Way Home — Portland → Austin → Philadelphia</title></svelte:head>

<section class="hero">
	<p class="eyebrow">Oct 2025 — May 2026 · One Arc, Two Migrations</p>
	<h1>The Long Way <em>Home</em></h1>
	<p class="sub">
		Portland → Austin → Philadelphia<br>
		18 cities · 242 days · ~4,800 miles · 21 state lines<br>
		The interstate West, a Mardi Gras interlude, and the civil rights corridor
	</p>
	<div class="map-wrap">
		<ConstellationMap />
		<div class="map-legend">
			<span><i class="swatch sw-gold"></i>Trip 1 · The West (Oct 2025)</span>
			<span><i class="swatch sw-dash"></i>Mardi Gras spur (Feb 2026)</span>
			<span><i class="swatch sw-burnt"></i>Trip 2 · The Corridor (May 2026)</span>
			<span>◉ dot size = nights</span>
		</div>
	</div>
</section>

<StatStrip {stats} />

<section class="chapters">
	<p class="section-label">Three Chapters</p>
	<div class="chapter-grid">
		{#each trips.trips as trip}
			<div class="chapter" class:interlude={trip.type === 'interlude'}>
				<span class="ch-num">{chapterMeta[trip.id].num}</span>
				<h3><a href="/chapter/{trip.id}">{trip.title}</a></h3>
				<p class="ch-sub">{trip.dates.start} → {trip.dates.end}</p>
				<p class="blurb">{chapterMeta[trip.id].blurb}</p>
				<p class="ch-cities">
					{#each trip.cityIds as id, i}
						{#if i > 0}·{/if}
						{#if built.has(id)}
							<a href="/city/{id}">{byId[id].name}</a>
						{:else}
							<span class="pending">{byId[id].name}</span>
						{/if}
					{/each}
				</p>
				<a class="ch-more" href="/chapter/{trip.id}">Read this chapter →</a>
			</div>
		{/each}
	</div>
</section>

<section class="teasers">
	<p class="section-label">Deep Dives</p>
	<div class="teaser-grid">
		<a class="teaser" href="/data"><p class="t-title">The Data</p><p>What curation changed, how closely each list was followed, and the fragmentation gap.</p></a>
		<a class="teaser" href="/superlatives"><p class="t-title">Superlatives</p><p>Best meal. Worst meal. The weirdest thing encountered anywhere.</p></a>
		<a class="teaser" href="/colophon"><p class="t-title">Colophon</p><p>How this was reconstructed, what the numbers can bear, and what is missing.</p></a>
	</div>
</section>

<footer>
	Built in Philadelphia · Data reconstructed &amp; logged Oct 2025 – Jun 2026 · SvelteKit / Vercel / ImageKit
</footer>

<style>
	.hero { min-height: 90vh; display: flex; flex-direction: column; justify-content: center; padding: 4rem 2rem 2rem; max-width: 1100px; margin: 0 auto; }
	.eyebrow { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--burnt-light); margin-bottom: 1rem; }
	h1 { font-family: var(--font-display); font-size: clamp(2.6rem, 7vw, 5rem); font-weight: 700; line-height: 1.02; margin-bottom: 1.25rem; }
	h1 em { font-style: italic; color: var(--gold); }
	.sub { font-family: var(--font-mono); font-size: 12px; color: var(--muted); letter-spacing: 0.08em; line-height: 2; max-width: 560px; }
	.map-wrap { margin: 2.5rem 0 1rem; }
	.map-legend { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 0.75rem; font-family: var(--font-mono); font-size: 10px; color: var(--muted); letter-spacing: 0.06em; }
	.map-legend span { display: inline-flex; align-items: center; gap: 6px; }
	.swatch { width: 18px; height: 2px; display: inline-block; }
	.sw-gold { background: var(--gold); }
	/* --burnt, not --burnt-light: against --gold the lighter orange separates by
	   only ΔE 12.5 in normal vision (6.9 deutan), which is below the legibility
	   floor for two marks that must be told apart. --burnt clears it at 18.4 /
	   15.3. Same swap on the route lines in ConstellationMap. */
	.sw-burnt { background: var(--burnt); }
	.sw-dash { background: repeating-linear-gradient(90deg, var(--gold) 0 4px, transparent 4px 8px); opacity: 0.6; }
	:global(.stats) { max-width: 1100px; margin: 0 auto; }
	.chapters, .teasers { max-width: 1100px; margin: 0 auto; padding: 4rem 2rem 0; }
	.teasers { padding-bottom: 4rem; }
	.section-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--burnt-light); margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
	.chapter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
	.chapter { background: var(--dark2); border: 1px solid var(--border); border-radius: 4px; padding: 2rem 1.75rem; }
	.chapter.interlude { border-style: dashed; }
	.ch-num { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; color: var(--muted); text-transform: uppercase; }
	h3 { font-family: var(--font-display); font-size: 1.7rem; font-weight: 700; margin: 0.5rem 0 0.25rem; }
	.ch-sub { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing: 0.06em; margin-bottom: 1rem; }
	.blurb { font-size: 14px; opacity: 0.85; }
	.ch-cities { margin-top: 1.25rem; font-family: var(--font-mono); font-size: 10px; color: var(--muted); line-height: 1.9; letter-spacing: 0.04em; }
	.ch-cities a { color: var(--gold); text-decoration: none; }
	.ch-cities a:hover { color: var(--burnt-light); }
	.chapter h3 a { color: inherit; text-decoration: none; }
	.chapter h3 a:hover { color: var(--gold); }
	.ch-more { display: inline-block; margin-top: 1rem; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); text-decoration: none; border-bottom: 1px solid var(--border); }
	.ch-more:hover { border-color: var(--gold); }
	.pending { opacity: 0.5; }
	.teaser-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
	.teaser { background: var(--dark2); border: 1px solid var(--border); border-radius: 4px; padding: 1.5rem; text-decoration: none; display: block; transition: border-color 0.2s; }
	.teaser:hover { border-color: rgba(196,160,80,0.45); }
	.t-title { font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--cream); margin-bottom: 0.4rem; }
	.teaser p { font-size: 13px; color: var(--muted); }
	footer { max-width: 1100px; margin: 0 auto; padding: 2rem; border-top: 1px solid var(--border); font-family: var(--font-mono); font-size: 10px; color: var(--muted); letter-spacing: 0.05em; line-height: 2; }
</style>
