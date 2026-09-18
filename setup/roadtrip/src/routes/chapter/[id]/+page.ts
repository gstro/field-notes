import { error } from '@sveltejs/kit';
import type { PageLoad, EntryGenerator } from './$types';
import trips from '$lib/data/trips.json';
import citySummary from '$lib/data/citySummary.json';

// The page renders each stop's rec count and confirmed count — totals, never a
// recommendation. It used to glob every city's full JSON to reach two numbers
// per stop. `builtIds` still lets an unbuilt city render as non-linked "data
// pending" (D10 — the prerender crawler hard-fails on a link to a page that
// doesn't exist).
const cities = Object.fromEntries(citySummary.cities.map((c) => [c.id, c]));
const builtIds = citySummary.cities.map((c) => c.id);

export const entries: EntryGenerator = () => trips.trips.map((t) => ({ id: t.id }));

export const load: PageLoad = ({ params }) => {
	const trip = trips.trips.find((t) => t.id === params.id);
	if (!trip) error(404, `No chapter ${params.id}`);
	return { trip, cities, builtIds };
};
