import { error } from '@sveltejs/kit';
import type { City } from '$lib/types';
import type { PageLoad, EntryGenerator } from './$types';
import trips from '$lib/data/trips.json';

// Same shape as city/[slug]: the glob decides what is built, and `builtIds`
// lets the page render an unbuilt city as non-linked "data pending" (D10 — the
// prerender crawler hard-fails on a link to a page that doesn't exist).
const cityModules = import.meta.glob('$lib/data/cities/*.json', { eager: true });
const cities: Record<string, City> = {};
for (const path in cityModules) {
	const mod = cityModules[path] as { default: City };
	cities[mod.default.id] = mod.default;
}

export const entries: EntryGenerator = () => trips.trips.map((t) => ({ id: t.id }));

export const load: PageLoad = ({ params }) => {
	const trip = trips.trips.find((t) => t.id === params.id);
	if (!trip) error(404, `No chapter ${params.id}`);
	return { trip, cities, builtIds: Object.keys(cities) };
};
