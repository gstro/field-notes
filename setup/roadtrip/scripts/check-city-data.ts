// City-data schema guard, run by `npm run check`. Validates every
// src/lib/data/cities/*.json against schemas/city.schema.json (generated from
// types.ts by `npm run schemas`; CI's drift check keeps the two in step).
//
// svelte-check alone can't do this: /city/[slug] loads cities through a lazy
// import.meta.glob cast `as { default: City }` (M1.1), so TypeScript never sees
// the JSON's shape. Found in M41, when a new required Recommendation field was
// absent from all 787 recs and `check` still passed.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import Ajv from 'ajv';

const ROOT = new URL('..', import.meta.url).pathname;
const CITIES = join(ROOT, 'src', 'lib', 'data', 'cities');
const schema = JSON.parse(readFileSync(join(ROOT, 'schemas', 'city.schema.json'), 'utf8'));

const validate = new Ajv({ allErrors: true }).compile(schema);
const files = readdirSync(CITIES).filter((f) => f.endsWith('.json'));
let failures = 0;
for (const file of files) {
	if (validate(JSON.parse(readFileSync(join(CITIES, file), 'utf8')))) continue;
	failures++;
	for (const e of (validate.errors ?? []).slice(0, 5)) {
		console.error(`${file}: ${e.instancePath || '/'} ${e.message}`);
	}
}
if (failures) {
	console.error(`\n${failures} of ${files.length} city files fail schemas/city.schema.json.`);
	process.exit(1);
}
console.log(`City data check passed (${files.length} files).`);
