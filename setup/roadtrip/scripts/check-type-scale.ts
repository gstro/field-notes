// Type-scale guard (D32), run by `npm run lint`. Fails when a component or
// stylesheet under src/:
//   1. sets a px font-size below the D31 floor (10px), or
//   2. hard-codes a px font-size that a --text-* token in tokens.css already
//      covers (so the next scale change stays a one-line edit).
// px sizes with no matching token (e.g. 12.5px) are allowed until a token
// exists for them. rem/clamp() display sizes are out of scope.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');
const TOKENS = join(SRC, 'lib', 'tokens.css');
const FLOOR_PX = 10;

const tokens = new Map<number, string>();
for (const m of readFileSync(TOKENS, 'utf8').matchAll(/(--text-[\w-]+):\s*([\d.]+)px/g)) {
	tokens.set(Number(m[2]), m[1]);
}

function* files(dir: string): Generator<string> {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) yield* files(path);
		else if (/\.(svelte|css)$/.test(name) && path !== TOKENS) yield path;
	}
}

const problems: string[] = [];
for (const file of files(SRC)) {
	readFileSync(file, 'utf8')
		.split('\n')
		.forEach((line, i) => {
			for (const m of line.matchAll(/font-size:\s*([\d.]+)px/g)) {
				const px = Number(m[1]);
				const where = `${relative(ROOT, file)}:${i + 1}`;
				if (px < FLOOR_PX)
					problems.push(`${where}  ${px}px is below the ${FLOOR_PX}px floor (D31)`);
				else if (tokens.has(px)) problems.push(`${where}  ${px}px → use var(${tokens.get(px)})`);
			}
		});
}

if (problems.length) {
	console.error(`Type-scale check failed (D32):\n  ${problems.join('\n  ')}`);
	process.exit(1);
}
console.log(`Type-scale check passed (${tokens.size} tokens, floor ${FLOOR_PX}px).`);
