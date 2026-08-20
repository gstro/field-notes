<script lang="ts">
	let { fingerprint }: { fingerprint: Record<string, number | null> } = $props();

	const AXES = [
		{ key: 'food', label: 'Food' },
		{ key: 'musicScene', label: 'Music' },
		{ key: 'weirdness', label: 'Weird' },
		{ key: 'politicalEnergy', label: 'Political' },
		{ key: 'cost', label: 'Afford' },
		{ key: 'interestCoverage', label: 'Coverage' }
	];
	const CX = 170, CY = 160, R = 110;

	const pt = (i: number, r: number) => {
		const a = (Math.PI / 180) * (-90 + i * 60);
		return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
	};
	const ring = (frac: number) =>
		AXES.map((_, i) => pt(i, R * frac).map((n) => n.toFixed(1)).join(',')).join(' ');

	const shape = $derived(
		AXES.map((ax, i) => {
			const v = fingerprint[ax.key] ?? 0;
			return pt(i, (v / 5) * R).map((n) => n.toFixed(1)).join(',');
		}).join(' ')
	);
	const labels = $derived(
		AXES.map((ax, i) => {
			const [x, y] = pt(i, R + 22);
			const anchor = x < CX - 5 ? 'end' : x > CX + 5 ? 'start' : 'middle';
			return { x, y, anchor, text: `${ax.label} · ${fingerprint[ax.key] ?? '—'}` };
		})
	);
	const hasData = $derived(AXES.some((ax) => fingerprint[ax.key] != null));
</script>

{#if hasData}
	<!-- viewBox extends past the ring so end-anchored side labels aren't clipped -->
	<svg viewBox="-55 0 450 320" role="img" aria-label="Six-axis city fingerprint">
		{#each [1, 0.6, 0.2] as f}
			<polygon class="grid-line" points={ring(f)} />
		{/each}
		{#each AXES as _, i}
			<line class="axis-line" x1={CX} y1={CY} x2={pt(i, R)[0]} y2={pt(i, R)[1]} />
		{/each}
		<polygon class="shape" points={shape} />
		{#each labels as l}
			<text class="axis-label" x={l.x} y={l.y} text-anchor={l.anchor}>{l.text}</text>
		{/each}
	</svg>
{/if}

<style>
	svg { width: 100%; height: auto; max-width: 420px; }
	.grid-line { fill: none; stroke: var(--border); stroke-width: 1; }
	.axis-line { stroke: var(--border); stroke-width: 1; }
	.shape { fill: rgba(200, 90, 0, 0.18); stroke: var(--burnt-light); stroke-width: 1.5; }
	.axis-label { font-family: var(--font-mono); font-size: 9px; fill: var(--muted); letter-spacing: 0.05em; text-transform: uppercase; }
</style>
