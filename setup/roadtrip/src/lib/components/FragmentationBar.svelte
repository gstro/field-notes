<script lang="ts">
	let { population }: { population: { cityProper: number | null; metro: number | null } } = $props();
	const fmt = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1e3)}k`);
	const pct = $derived(
		population.cityProper && population.metro
			? Math.round((population.cityProper / population.metro) * 100) : null
	);
</script>

{#if pct != null && population.cityProper && population.metro}
	<div class="bars">
		<div class="bar">
			<div class="lbl"><span>City proper</span><span>{fmt(population.cityProper)}</span></div>
			<div class="track"><div class="fill" style="width:{pct}%"></div></div>
		</div>
		<div class="bar">
			<div class="lbl"><span>Metro</span><span>{fmt(population.metro)}</span></div>
			<div class="track"><div class="fill metro" style="width:100%"></div></div>
		</div>
	</div>
	<p class="note"><b>{pct}%</b> of the metro lives inside city limits.</p>
{/if}

<style>
	.bars { display: flex; flex-direction: column; gap: 1.1rem; }
	.lbl { font-family: var(--font-mono); font-size: 10px; color: var(--muted); display: flex; justify-content: space-between; margin-bottom: 5px; }
	.track { height: 14px; background: var(--dark3); border: 1px solid var(--border); border-radius: 2px; overflow: hidden; }
	.fill { height: 100%; background: var(--burnt); }
	.fill.metro { background: rgba(212,168,67,0.4); }
	.note { font-size: 13px; color: var(--muted); margin-top: 1rem; }
	.note b { color: var(--burnt-light); font-weight: 500; }
</style>
