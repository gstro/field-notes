<script lang="ts">
	import citySummary from '$lib/data/citySummary.json';

	// Same rule as the colophon: the figures stating why this page is empty are
	// derived from the data, never typed. If ratings ever land, these move on
	// their own and the page stops claiming there are none.
	const sum = (f: (c: (typeof citySummary.cities)[number]) => number) =>
		citySummary.cities.reduce((a, c) => a + f(c), 0);
	const recCount = sum((c) => c.recCount);
	const rated = sum((c) => c.ratedCount);
</script>

<svelte:head><title>Superlatives — The Long Way Home</title></svelte:head>

<main>
	<a class="back" href="/">← The Long Way Home</a>

	<header>
		<p class="eyebrow">Awards</p>
		<h1>Superlatives</h1>
		<p class="lede">
			The best meal, the worst one, the weirdest thing encountered anywhere. This page has
			nothing on it yet, and the reason is the point.
		</p>
	</header>

	<section>
		<h2>Why it is empty</h2>
		<p>
			Superlatives here are meant to come from a <b>binary would-return rating</b> on each
			recommendation — keepers rather than rankings.
			<b>{rated === 0
				? `None of the ${recCount} recommendations carries one.`
				: `${rated} of ${recCount} recommendations carry one.`}</b>
		</p>
		<p>
			Ratings are the one field on this site no export can supply. Location history proves
			where the days went; it cannot say whether a place was worth returning to. That is a
			memory pass over the whole corpus, and it has not happened.
		</p>
		<p>
			Earlier drafts did carry ratings. They had been invented to fill the layout, and were
			removed once it became clear they were rendering as findings — the same correction
			logged on the <a href="/colophon#revisions">colophon</a>.
		</p>
		<p class="pull">An empty page is the honest output of a reconstruction with a real gap.</p>
	</section>

	<section>
		<h2>What is here instead</h2>
		<p>
			The parts of the trips that <i>are</i> reconstructed have their own pages: the
			<a href="/data">curation comparison</a> built from location history, the
			<a href="/colophon">colophon's</a> account of what the numbers can bear, and every
			city's sourced recommendation list, reachable from the <a href="/">route map</a>.
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
	a:not(.back) { color: var(--gold); }
	.pull { font-family: var(--font-display); font-size: 1.2rem; line-height: 1.5; color: var(--gold); border-left: 2px solid var(--gold); padding-left: 1.1rem; margin: 1.5rem 0 0; opacity: 1; }
	@media (max-width: 600px) { main { padding: 2rem 1.15rem 3.5rem; } }
</style>
