import { error } from '@sveltejs/kit';
import type { City } from '$lib/types';
import type { PageLoad, EntryGenerator } from './$types';
import citySummary from '$lib/data/citySummary.json';

// NOT eager. An eager glob pulls all 15 cities into one shared chunk, so every
// city page shipped the whole corpus to read one city. Lazily, each city file
// becomes its own chunk and a visitor downloads only the city they opened.
// `import.meta.glob` still resolves the key set at build time, so the path
// lookup below costs nothing — only the awaited import loads data.
const cityModules = import.meta.glob('$lib/data/cities/*.json');
const pathOf = (slug: string) => `/src/lib/data/cities/${slug}.json`;

// Ids come from the summary, which the same transform writes from the same
// files — so "which cities are built" has one source, not a glob here and a
// summary there that could disagree.
const builtIds = citySummary.cities.map((c) => c.id);

export const entries: EntryGenerator = () => builtIds.map((slug) => ({ slug }));

export const load: PageLoad = async ({ params }) => {
	const loader = cityModules[pathOf(params.slug)];
	if (!loader) error(404, `No data file for ${params.slug} yet`);
	const mod = (await loader()) as { default: City };
	return { city: mod.default, builtIds };
};
