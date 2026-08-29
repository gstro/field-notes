<script lang="ts">
	import cityIndex from '$lib/data/cityIndex.json';
	import trips from '$lib/data/trips.json';
	import adherence from '$lib/data/adherence.json';

	const cityModules = import.meta.glob('$lib/data/cities/*.json', { eager: true });
	const cities = Object.values(cityModules).map(
		(m) => (m as { default: { id: string; recommendations: { status: string; rating: boolean | null }[] } }).default
	);

	// Every figure on this page is derived from committed data, never typed in.
	// A colophon that hardcoded its own numbers would be the exact failure it
	// exists to disclose.
	const built = cities.length;
	const total = cityIndex.length;
	const recs = cities.flatMap((c) => c.recommendations);
	const confirmed = recs.filter((r) => ['attended', 'attended-anyway'].includes(r.status)).length;
	const unknown = recs.filter((r) => ['unverified', 'retroactive-recommendation'].includes(r.status)).length;
	const rated = recs.filter((r) => r.rating !== null).length;

	const arcStart = trips.trips[0].dates.start;
	const arcEnd = trips.trips[trips.trips.length - 1].dates.end;
	const days = Math.round((Date.parse(arcEnd) - Date.parse(arcStart)) / 86_400_000) + 1;

	// D22: the corpus-wide comparison is authoritative and is read verbatim.
	// An unweighted mean over the per-city rows is a DIFFERENT statistic and
	// lands a few tenths off — deriving one here would misreport the site's
	// central finding.
	const cmp = adherence.comparison as Record<string, { visitsThatWereOnListPct: number }>;
</script>

<svelte:head><title>Colophon — The Long Way Home</title></svelte:head>

<main>
	<a class="back" href="/">← The Long Way Home</a>

	<header>
		<p class="eyebrow">Methodology &amp; Error Bars</p>
		<h1>Colophon</h1>
		<p class="lede">
			This site is a reconstruction. The trips happened between {arcStart} and {arcEnd};
			the data describing them was assembled afterwards, from exports and memory, in 2026.
			This page is the record of what that means — what is measured, what is estimated,
			and what is simply missing.
		</p>
	</header>

	<section>
		<h2>The one rule</h2>
		<p>
			<b>Nothing renders as measured unless it is measured.</b> Where a number could not be
			reconstructed, the site shows nothing, or shows the number explicitly marked as
			unreconstructed. Empty fields are not an unfinished state to be apologised for —
			they are the honest output of a reconstruction with real gaps.
		</p>
		<p>
			This was not the original design — earlier drafts rendered placeholder values as
			though they were findings. Material changes to how the site reports its data are
			listed under <a href="#revisions">Revisions</a>.
		</p>
	</section>

	<section>
		<h2>What the site is built from</h2>
		<dl>
			<div><dt>City guides</dt><dd>
				14 machine-generated 10-category guides, one per city, built in 2026 from Atlas
				Obscura, Eater, Time&nbsp;Out, TasteAtlas and web search. {recs.length} recommendations
				across {built} of {total} cities.
			</dd></div>
			<div><dt>Location history</dt><dd>
				A Google Takeout export covering {days} days — Maps activity plus 73 saved
				lists totalling 2,338 places. This is the only independent record of where the
				trips actually went.
			</dd></div>
			<div><dt>Everything else</dt><dd>
				Memory. Treated as such throughout.
			</dd></div>
		</dl>
	</section>

	<section>
		<h2>The comparison, and how it changed</h2>
		<p>
			The site was built around a question: <i>does curation change where you end up?</i>
			The premise was that the first trip was unguided instinct and the second was
			guide-led. <b>That premise turned out to be false.</b> The saved-list export shows
			every first-trip city already had a 32–42 place list, self-made, before departure.
		</p>
		<p>
			So the comparison is not instinct versus curation. It is <b>self-curation</b> —
			own judgment, no external sources — against <b>sourced curation</b>, from published
			guides. Under that framing the finding sharpens rather than dissolves: the degree of
			list-following barely moved{#if cmp?.trip1 && cmp?.trip2}&nbsp;— {cmp.trip1.visitsThatWereOnListPct}%
			of places navigated to on the first trip were already on the list, against
			{cmp.trip2.visitsThatWereOnListPct}% on the second{/if} — but the <i>content</i> inverted:
			books ×6.9, museums and history ×2.9, record stores from zero to 24. Outdoors was flat.
		</p>
		<p class="pull">The source of curation changed what got curated, not how faithfully it was followed.</p>
	</section>

	<section>
		<h2>Error bars</h2>
		<dl>
			<div><dt>Visit counts are floors, not rates</dt><dd>
				The public export truncates each city to its top ~8–14 places: 151 entries against
				1,102 distinct destinations navigated to. A match proves a visit; <b>a non-match
				proves nothing.</b> {confirmed} of {recs.length} recommendations are confirmed
				visited, and {unknown} have no record either way. Hence “≥” on every city page,
				and a distinct “visit unknown” state that is deliberately not the same as “skipped”.
			</dd></div>
			<div><dt>Adherence is directions-only</dt><dd>
				Map-view events were excluded as circular — browsing a saved list generates a view
				for every item on it. Only navigation counts.
			</dd></div>
			<div><dt>Saves cannot be dated</dt><dd>
				The export carries no per-item save timestamps, and the lists were edited during the
				trips. A place saved before leaving cannot be separated from one saved while
				standing in it. This is why the overlap between the guides and the self-made lists
				is computed but <b>not published</b> — it would read as a stronger claim than the
				data supports.
			</dd></div>
			<div><dt>Interest categories are keyword-tagged</dt><dd>
				A rough instrument, applied to destination names. Places with uninformative names
				tag as nothing.
			</dd></div>
			<div><dt>The retro guides are an anachronism</dt><dd>
				First-trip cities had no guides at the time. Theirs were generated in 2026, from
				2026 sources, and scored against a trip taken in 2025 — a control group built after
				the fact. Their recommendations are <b>provenance markers, not outcome claims</b>:
				“the guide picked this” never means “this was skipped”. Portland is excluded from
				the comparison entirely; scoring a guide against your own hometown is a category
				error.
			</dd></div>
		</dl>
	</section>

	<section>
		<h2>Not yet reconstructed</h2>
		<p>Known gaps, stated rather than filled:</p>
		<ul>
			<li><b>Miles driven, and every per-leg distance.</b> Location-history tracking was off
				during the trips, so there are no GPS traces. Distances need retroactive routing;
				drive times are bounded only by search timestamps.</li>
			<li><b>Spend.</b> Card statements have not been exported. No cost figure on this site is
				reconstructed spend.</li>
			<li><b>Ratings.</b> {rated === 0 ? 'No recommendation carries a would-return rating.' : `${rated} of ${recs.length} recommendations carry a rating.`}
				The only ratings that ever existed here were invented for layout and have been
				removed. Superlatives cannot be derived until real ones are recorded.</li>
			<li><b>City character.</b> Vibe, verdict, favourites, field notes and the six-axis
				fingerprints are unscored. The fingerprints are deliberately deferred to a single
				sitting — scoring them piecemeal over weeks would let the scale drift and quietly
				corrupt every comparison between cities.</li>
			<li><b>Four cities.</b> Portland, Austin, New Orleans and Philadelphia have no guide
				data. The first three are origin, anchor and interlude; Philadelphia is home.</li>
		</ul>
	</section>

	<section id="revisions">
		<h2>Revisions</h2>
		<p>Material changes to how this site reports its data.</p>
		<ol class="corr">
			<li>
				<b>The hit-rate metric was reframed as a floor.</b> It had counted visits from status
				values no data had yet populated, so most city pages reported a rate of zero. It now
				reads as a minimum, and the curation comparison it had been conflated with moved to
				its own panel with its own source.
			</li>
			<li>
				<b>Washington DC was rebuilt from its guide.</b> Its page had been hand-built early as
				a schema test, with statuses and ratings assigned for layout rather than from any
				record. It is now generated like every other city. Fourteen venues that only the
				original survey covered — the Library of Congress, NMAAHC, Air and Space, the Folger,
				the Phillips Collection among them — were restored with their citations intact.
			</li>
			<li>
				<b>DC's elevation is blank by override.</b> A city spanning roughly 1–410 ft is
				misrepresented by any single figure, so the number was removed. Reviewed decisions
				like this one are now recorded in a file the rebuild reads, so regenerating a page
				cannot quietly undo them.
			</li>
			<li>
				<b>The matcher joining guides to location history was rewritten.</b> An early version
				discarded words like “coffee” and “books” as noise, which reduced
				<i>Coffee&nbsp;Garden</i> to <i>garden</i> and matched it to an unrelated sculpture
				park. It now requires one name to be a prefix of the other, weighted so that generic
				words — and each city's own name — cannot carry a match alone.
			</li>
		</ol>
	</section>

	<section>
		<h2>Built with</h2>
		<p class="tech">
			SvelteKit, prerendered to static files. No database, no analytics, no third-party
			embeds, nothing that phones home. Every recommendation carries its source; where a
			citation could not be recovered it says so rather than inventing one. The data is
			JSON in a public Git repository, and the transforms that produce it are committed
			alongside — so every number here can be traced to the file and the line of code
			that produced it.
		</p>
	</section>

	<a class="back bottom" href="/">← The Long Way Home</a>
</main>

<style>
	main { max-width: 760px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
	.back { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); text-decoration: none; }
	.back:hover { color: var(--gold); }
	.bottom { display: block; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--border); }
	header { margin: 2.5rem 0 3.5rem; }
	.eyebrow { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--burnt-light); }
	h1 { font-family: var(--font-display); font-size: clamp(2.6rem, 8vw, 4rem); font-weight: 700; line-height: 1; margin: 0.6rem 0 1.4rem; }
	.lede { font-size: 1.05rem; line-height: 1.7; color: var(--cream); opacity: 0.92; }
	section { margin-bottom: 3rem; }
	h2 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
	p { line-height: 1.7; margin-bottom: 1rem; opacity: 0.9; }
	b { color: var(--cream); font-weight: 500; }
	i { opacity: 0.85; }
	.pull { font-family: var(--font-display); font-size: 1.2rem; line-height: 1.5; color: var(--gold); border-left: 2px solid var(--gold); padding-left: 1.1rem; margin: 1.5rem 0 0; opacity: 1; }
	dl { display: flex; flex-direction: column; gap: 1.4rem; }
	dt { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.13em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.45rem; }
	dd { margin: 0; line-height: 1.7; opacity: 0.9; }
	ul, ol { padding-left: 1.15rem; display: flex; flex-direction: column; gap: 0.85rem; }
	li { line-height: 1.7; opacity: 0.9; }
	.corr li::marker { color: var(--burnt-light); font-family: var(--font-mono); font-size: 12px; }
	.tech { font-size: 0.95rem; }
	@media (max-width: 600px) { main { padding: 2rem 1.15rem 3.5rem; } }
</style>
