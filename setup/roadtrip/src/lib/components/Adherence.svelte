<script lang="ts">
	import adherenceData from '$lib/data/adherence.json';

	let { cityId }: { cityId: string } = $props();

	type Row = {
		trip: string;
		saved: number;
		navigatedFromList: number;
		listConversionPct: number;
		uniqueDirTargets: number;
		visitsThatWereOnListPct: number;
	};

	const a = $derived((adherenceData.cities as Record<string, Row>)[cityId] ?? null);
	// D22: trip 1 curated its own lists, trip 2 followed sourced guides. The
	// comparison is between curation *sources*, not guided vs unguided.
	const method = $derived(a?.trip === 'trip1' ? 'self-curated' : 'sourced-curated');
</script>

{#if a}
	<div class="adh">
		<div class="figs">
			<div class="fig">
				<span class="n">{a.listConversionPct}%</span>
				<span class="l">of the list was navigated to</span>
				<span class="d">{a.navigatedFromList} of {a.saved} saved places</span>
			</div>
			<div class="fig">
				<span class="n">{a.visitsThatWereOnListPct}%</span>
				<span class="l">of places gone to were on it</span>
				<span class="d">of {a.uniqueDirTargets} distinct destinations</span>
			</div>
		</div>
		<p class="note">
			This city was <b>{method}</b>. Figures are from Google Maps activity over the
			full trip window — independent of the guide data above, and the authoritative
			measure of how closely the list was followed.
		</p>
	</div>
{/if}

<style>
	.adh { display: flex; flex-direction: column; gap: 0.9rem; }
	.figs { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.25rem; }
	.fig { display: flex; flex-direction: column; }
	.n { font-family: var(--font-display); font-size: 2.1rem; font-weight: 700; color: var(--gold); line-height: 1; }
	.l { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.11em; text-transform: uppercase; color: var(--muted); margin-top: 7px; }
	.d { font-family: var(--font-mono); font-size: 9.5px; color: var(--muted); opacity: 0.7; margin-top: 3px; }
	.note { font-size: 12px; color: var(--muted); line-height: 1.5; border-top: 1px solid var(--border); padding-top: 0.7rem; }
	.note b { color: var(--cream); font-weight: 500; }
</style>
