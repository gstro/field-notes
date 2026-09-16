<script lang="ts">
	import cityIndex from '$lib/data/cityIndex.json';
	import trips from '$lib/data/trips.json';

	// Equirectangular-ish projection tuned for the lower 48 corridor
	const px = (lng: number) => ((lng + 125) / 53) * 920 + 40;
	const py = (lat: number) => ((47 - lat) / 19) * 520 + 40;

	const byId = Object.fromEntries(cityIndex.map((c) => [c.id, c]));
	const path = (ids: string[]) =>
		ids.map((id, i) => `${i ? 'L' : 'M'} ${px(byId[id].coords.lng).toFixed(0)} ${py(byId[id].coords.lat).toFixed(0)}`).join(' ');

	const westPath = path(trips.trips.find((t) => t.id === 'west')!.cityIds);
	const southPath = path(['austin-tx', ...trips.trips.find((t) => t.id === 'south')!.cityIds]);
	const a = byId['austin-tx'], n = byId['new-orleans-la'];
	const nolaPath = `M ${px(a.coords.lng).toFixed(0)} ${py(a.coords.lat).toFixed(0)} Q ${((px(a.coords.lng) + px(n.coords.lng)) / 2).toFixed(0)} ${(py(a.coords.lat) + 35).toFixed(0)} ${px(n.coords.lng).toFixed(0)} ${py(n.coords.lat).toFixed(0)}`;

	const r = (nights: number, role?: string) =>
		role === 'home' ? 11 : Math.min(4 + 2 * Math.sqrt(Math.max(nights, 1)), 20);
</script>

<svg viewBox="0 0 1000 600" role="img" aria-label="Route map: dot size shows nights per city; gold line is the western trip, orange the southern corridor, dashed the New Orleans spur.">
	<path class="route west" d={westPath} />
	<path class="route nola" d={nolaPath} />
	<path class="route south" d={southPath} />
	{#each cityIndex as c}
		<circle class="dot" class:anchor={c.role === 'anchor'} class:home={c.role === 'home'}
			cx={px(c.coords.lng)} cy={py(c.coords.lat)} r={r(c.nights, c.role)} />
		<text class="label" class:major={c.role != null}
			x={px(c.coords.lng) + (c.label?.dx ?? 12)} y={py(c.coords.lat) + (c.label?.dy ?? -8)}
			text-anchor={c.label?.anchor ?? 'start'}>{c.name}</text>
	{/each}
</svg>

<style>
	svg { width: 100%; height: auto; display: block; }
	.route { fill: none; stroke-width: 1.5; stroke-dasharray: 2200; stroke-dashoffset: 2200; animation: draw 3s ease-out forwards; }
	.west { stroke: var(--gold); animation-delay: 0.4s; }
	/* --burnt, not --burnt-light: the west and south routes cross the same space,
	   so they are the pair that most needs to be distinguishable. Against --gold,
	   --burnt-light separates by only ΔE 12.5 (normal vision) / 6.9 (deutan);
	   --burnt clears both at 18.4 / 15.3. */
	.south { stroke: var(--burnt); animation-delay: 2s; }
	.nola { stroke: var(--gold); stroke-dasharray: 5 5; stroke-dashoffset: 0; opacity: 0; animation: fade 1s ease-out 3.2s forwards; }
	@keyframes draw { to { stroke-dashoffset: 0; } }
	@keyframes fade { to { opacity: 0.55; } }
	@media (prefers-reduced-motion: reduce) {
		.route { animation: none; stroke-dashoffset: 0; }
		/* `animation: none` is belt-and-braces. Overriding opacity alone already
		   neutralises the fade, because `@keyframes fade` declares only a `to`
		   and its implicit `from` resolves to whatever opacity is in force —
		   0.55 here, so it animates to itself. That is correct but load-bearing
		   on an implicit value: adding a `from` to the keyframe later would
		   silently reintroduce motion. Killing the animation outright removes
		   the dependency. Opacity must stay set, or the spur renders invisible. */
		.nola { animation: none; opacity: 0.55; }
	}
	.dot { fill: var(--dark3); stroke: var(--gold); stroke-width: 1.5; }
	.dot.anchor { fill: rgba(200,90,0,0.25); stroke: var(--burnt); stroke-width: 2; }
	.dot.home { fill: rgba(212,168,67,0.3); stroke: var(--gold); stroke-width: 2.5; }
	.label { font-family: var(--font-mono); font-size: 10px; fill: var(--muted); letter-spacing: 0.05em; }
	.label.major { fill: var(--cream); font-size: 11px; }
	@media (max-width: 600px) { .label { font-size: 8px; } }
</style>
