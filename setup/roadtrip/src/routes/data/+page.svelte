<script lang="ts">
	import FragmentationCompare from '$lib/components/FragmentationCompare.svelte';
	import CurationSlope from '$lib/components/CurationSlope.svelte';
	import AdherenceCompare from '$lib/components/AdherenceCompare.svelte';
	import ImprovisationShift from '$lib/components/ImprovisationShift.svelte';
	import cityIndex from '$lib/data/cityIndex.json';
	import adherence from '$lib/data/adherence.json';
	import fragNotes from '$lib/data/fragmentation-notes.json';
	import visited from '$lib/data/visited.json';

	// This page never touches a recommendation — it needs identity and population
	// per city and nothing else, so it reads the derived rollup rather than the
	// corpus.
	import citySummary from '$lib/data/citySummary.json';
	const cities = citySummary.cities;

	const notes = fragNotes.cities as Record<string, { kind: string; mechanism: string | null }>;

	// Sorted by ratio: the spread is the argument, so the order carries it.
	const fragRows = $derived(
		cities
			.filter((c) => c.population.cityProper && c.population.metro)
			.map((c) => ({
				id: c.id, name: c.name, state: c.state,
				cityProper: c.population.cityProper as number,
				metro: c.population.metro as number,
				pct: Math.round(((c.population.cityProper as number) / (c.population.metro as number)) * 100),
				mechanism: notes[c.id]?.mechanism ?? null,
				kind: notes[c.id]?.kind ?? 'none'
			}))
			.sort((a, b) => a.pct - b.pct)
	);
	// Absence is the D10 "data pending" state, not a silent omission.
	const fragPending = $derived(
		cityIndex.filter((c) => !fragRows.some((r) => r.id === c.id)).map((c) => ({ name: c.name, state: c.state }))
	);

	// Prefer the city file's name over cityIndex's, which is abbreviated to fit the
	// constellation map ("Okla. City") and is not the display name.
	const nameOf = (id: string) =>
		cities.find((c) => c.id === id)?.name ?? cityIndex.find((c) => c.id === id)?.name ?? id;

	const adhRows = $derived(
		Object.entries(adherence.cities as Record<string, { trip: string; listConversionPct: number; visitsThatWereOnListPct: number }>)
			.map(([id, a]) => ({ id, name: nameOf(id), ...a }))
			.sort((a, b) => b.visitsThatWereOnListPct - a.visitsThatWereOnListPct)
	);

	// D22: the corpus-wide comparison is authoritative and read verbatim. An
	// average over the per-city rows above is a DIFFERENT statistic and would
	// misreport the site's central finding.
	type ComparisonSide = {
		visitsThatWereOnListPct: number;
		savedListPlaces: number;
		interestMix?: Record<string, number>;
		searchToDirectionsRatio: number | null;
		uniquePlacesPerCityDay: number | null;
	};
	const cmp = adherence.comparison as { trip1: ComparisonSide; trip2: ComparisonSide };
	const mix = { trip1: cmp.trip1?.interestMix ?? {}, trip2: cmp.trip2?.interestMix ?? {} };

	const provTotal = Object.values(visited.totals as Record<string, number>).reduce((a, b) => a + b, 0);
	// Corpus scale, carried in adherence.json rather than typed into the prose.
	const [windowFrom, windowTo] = adherence.windowAnalyzed as [string, string];
	const entries = (adherence.entriesInWindow as number).toLocaleString('en-US');
</script>

<svelte:head><title>The Data — The Long Way Home</title></svelte:head>

<main>
	<a class="back" href="/">← The Long Way Home</a>

	<header>
		<p class="eyebrow">Analysis</p>
		<h1>The Data</h1>
		<p class="lede">
			Four things the reconstruction can actually answer: what the two curation methods
			changed, what they displaced, how closely either list was followed, and how much of
			each metro sits inside its own city limits.
		</p>
	</header>

	<section>
		<h2>What curation changed</h2>
		<p class="framing">
			Both trips ran on lists — the first self-made, the second built from published guides.
			The share of places visited that were already on the list barely moved{#if cmp?.trip1 && cmp?.trip2}:
			{cmp.trip1.visitsThatWereOnListPct}% against {cmp.trip2.visitsThatWereOnListPct}%{/if}. What
			inverted was the <i>content</i>. Counts are direction requests tagged by interest.
		</p>
		{#if mix.trip1 && mix.trip2}<CurationSlope {mix} />{/if}

		<div class="prov">
			<p class="p-head">The same argument from the other end — where the days actually went</p>
			<div class="p-row">
				{#each [['guide', 'On the sourced guide'], ['own-list', 'On the self-made list'], ['found', 'Found on the ground']] as [k, label]}
					<div class="p-cell">
						<span class="p-n">{visited.totals[k as keyof typeof visited.totals] ?? 0}</span>
						<span class="p-l">{label}</span>
					</div>
				{/each}
			</div>
			<p class="p-note">
				Of the {provTotal} places navigated to most across the {Object.keys(visited.cities).length} cities.
				Published guides account for the smallest share. “On the self-made list” is an upper
				bound and “found on the ground” a floor — saves cannot be dated, so a place saved
				while standing in it counts as listed.
			</p>
		</div>

		<p class="caveat">
			Interest tags are keyword-matched on destination names — a rough instrument, and
			places with uninformative names tag as nothing. Source: Google Takeout Maps activity.
		</p>
	</section>

	<section>
		<h2>What curation displaced</h2>
		<p class="framing">
			The content inverted, but the <i>behaviour</i> changed too — and in one direction only.
			Searching while already on the ground fell by roughly a sixth, while the number of
			distinct places a day actually reached stayed near flat. The guides answered the
			question that searching used to answer; they did not add stops.
		</p>
		<ImprovisationShift trip1={cmp.trip1} trip2={cmp.trip2} />
		<p class="caveat">
			A ratio below 1 means more places were navigated to than searched for on the ground.
			Both figures are corpus-wide and read verbatim. Drawn from {entries} Maps entries
			between {windowFrom} and {windowTo}. That searching fell alongside a steady place
			count is consistent with the list pre-answering it — but this is observational: no
			part of the export records why a search did or didn't happen.
		</p>
	</section>

	<section>
		<h2>How closely each list was followed</h2>
		<p class="framing">
			Two different questions per city: how much of the saved list was actually navigated to,
			and how much of what was navigated to came off the list. Directions only — map views
			were excluded as circular.
		</p>
		<AdherenceCompare rows={adhRows} />
	</section>

	<section>
		<h2>The fragmentation gap</h2>
		<p class="framing">
			The share of each metro living inside city limits — a proxy for how a region drew its
			municipal boundaries, and one of the few measures that spans the whole route.
			{fragRows.length} of {cityIndex.length} cities have population data. The spread is the
			point: the same outcome is reached by opposite mechanisms.
		</p>
		<FragmentationCompare rows={fragRows} pending={fragPending} />
		<p class="caveat">
			Figures are approximate estimates pending reconciliation against a single census
			vintage. Annotations are drawn from each city guide's own note on how its boundary
			came to be.
		</p>
	</section>

	<section class="absent">
		<h2>Not yet here</h2>
		<p>
			<b>Prices and spend.</b> The card-statement export has not been run, so there is no
			reconstructed cost figure anywhere on this site — no prices time capsule, no spend by
			city. <b>Driving distances and times.</b> Location-history tracking was off during the
			trips, so there are no GPS traces to measure. Both sections land here when the exports do.
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
	h1 { font-family: var(--font-display); font-size: clamp(2.6rem, 8vw, 4rem); font-weight: 700; line-height: 1; margin: 0.6rem 0 1.4rem; }
	.lede { font-size: 1.05rem; line-height: 1.7; color: var(--cream); opacity: 0.92; }
	section { margin-bottom: 3.5rem; }
	h2 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; margin-bottom: 0.9rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
	.framing { line-height: 1.7; opacity: 0.9; margin-bottom: 1.8rem; }
	.caveat { font-family: var(--font-mono); font-size: 10px; line-height: 1.7; letter-spacing: 0.04em; color: var(--muted); margin-top: 1.6rem; padding-top: 0.9rem; border-top: 1px solid var(--border); }
	.prov { margin-top: 2rem; padding-top: 1.4rem; border-top: 1px solid var(--border); }
	.p-head { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.13em; text-transform: uppercase; color: var(--muted); margin-bottom: 1.1rem; }
	.p-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1.4rem; }
	.p-cell { display: flex; flex-direction: column; }
	.p-n { font-family: var(--font-display); font-size: 2.1rem; font-weight: 700; color: var(--gold); line-height: 1; }
	.p-l { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.09em; text-transform: uppercase; color: var(--muted); margin-top: 7px; }
	.p-note { font-size: 12.5px; line-height: 1.7; color: var(--muted); margin-top: 1.2rem; }
	.absent p { line-height: 1.7; opacity: 0.82; }
	b { color: var(--cream); font-weight: 500; }
	i { opacity: 0.85; }
	@media (max-width: 600px) { main { padding: 2rem 1.15rem 3.5rem; } }
</style>
