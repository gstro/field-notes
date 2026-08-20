<script lang="ts">
	let { stats }: { stats: { n: string; l: string; wry?: boolean }[] } = $props();
</script>

<section class="stats">
	{#each stats as s}
		<div class="stat" class:wry={s.wry}><span class="n">{s.n}</span><span class="l">{s.l}</span></div>
	{/each}
</section>

<style>
	.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1px; background: var(--border); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
	.stat { background: var(--dark); padding: 1.75rem 1rem; text-align: center; }
	.n { font-family: var(--font-display); font-size: 2.4rem; font-weight: 700; color: var(--gold); line-height: 1; display: block; }
	.wry .n { color: var(--burnt-light); }
	.l { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-top: 8px; display: block; }
</style>
