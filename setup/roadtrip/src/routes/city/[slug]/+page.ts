import { error } from '@sveltejs/kit';
import type { City } from '$lib/types';
import type { PageLoad, EntryGenerator } from './$types';

const cityModules = import.meta.glob('$lib/data/cities/*.json', { eager: true });
const cities: Record<string, City> = {};
for (const path in cityModules) {
	const mod = cityModules[path] as { default: City };
	cities[mod.default.id] = mod.default;
}

export const entries: EntryGenerator = () => Object.keys(cities).map((slug) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const city = cities[params.slug];
	if (!city) error(404, `No data file for ${params.slug} yet`);
	return { city, builtIds: Object.keys(cities) };
};
