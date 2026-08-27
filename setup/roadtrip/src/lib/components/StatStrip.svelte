<script lang="ts">
	// `pending` marks a figure that has NOT been reconstructed from a source —
	// it keeps its slot and its number, but must never read as measured. The
	// marker text is deliberately "not yet reconstructed" and not "pending",
	// which a stranger could read as "pending publication".
	let { stats }: { stats: { n: string; l: string; wry?: boolean; pending?: boolean }[] } = $props();
</script>

<section class="stats">
	{#each stats as s}
		<div class="stat" class:wry={s.wry} class:pending={s.pending}>
			<span class="n">{s.n}</span>
			<span class="l">{s.l}</span>
			{#if s.pending}<span class="flag">not yet reconstructed</span>{/if}
		</div>
	{/each}
</section>

<style>
	.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1px; background: var(--border); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
	.stat { background: var(--dark); padding: 1.75rem 1rem; text-align: center; }
	.n { font-family: var(--font-display); font-size: 2.4rem; font-weight: 700; color: var(--gold); line-height: 1; display: block; }
	.wry .n { color: var(--burnt-light); }
	/* Unreconstructed figures lose the gold entirely — the colour is what makes a
	   number read as a finding, so it is withheld until the number is earned. */
	.pending .n { color: var(--muted); opacity: 0.55; }
	.l { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-top: 8px; display: block; }
	.flag { font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); opacity: 0.75; margin-top: 5px; display: block; border-top: 1px dotted var(--border); padding-top: 4px; }
</style>
