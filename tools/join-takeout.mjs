#!/usr/bin/env node
// M3.5 takeout join — matches guide recommendations against Google Takeout
// evidence to recover a confirmed-visit FLOOR and the saved-list overlap table.
//
// See design/m35-headline-metric.md for what these numbers can and cannot
// claim. The short version:
//
//   - topPlaces is truncated to the top ~8-14 places per city. A match proves
//     a visit; a non-match proves NOTHING. Output is a floor, never a rate.
//   - perCityAdherence (in the same source file) is the authoritative thesis
//     metric, computed from the full pre-sanitization corpus. Do not attempt
//     to recompute it here.
//
// Reads guides/*-guide.json (the ingest's INPUT, never its output — no cycle).
// Writes data/attendance-matches.json keyed on {citySlug, recId}, which
// tools/ingest-guides.mjs reads in assignStatus().
//
// Usage: node tools/join-takeout.mjs [--dry-run] [--naive]
//   --naive  re-runs the known-bad normalizer for regression comparison

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const GUIDES_DIR = join(ROOT, 'guides');
const MAPS_PATH = join(ROOT, 'data/maps-trip-analysis-public.json');
const SAVED_PATH = join(ROOT, 'data/saved-lists-corridor-public.json');
const MATCHES_PATH = join(ROOT, 'data/attendance-matches.json');
const ADHERENCE_PATH = join(ROOT, 'setup/roadtrip/src/lib/data/adherence.json');
const VISITED_PATH = join(ROOT, 'setup/roadtrip/src/lib/data/visited.json');
const REPORT_PATH = join(ROOT, 'tools/.takeout-join-report.md');

const DRY_RUN = process.argv.includes('--dry-run');
const RUN_NAIVE = process.argv.includes('--naive');

// Guide slug -> the display name used in maps-trip-analysis cities[]/perCityAdherence
const SLUG_TO_MAPS_NAME = {
	albuquerque: 'Albuquerque', atlanta: 'Atlanta', birmingham: 'Birmingham',
	boise: 'Boise', charlotte: 'Charlotte', dallas: 'Dallas', jackson: 'Jackson',
	'las-vegas': 'Las Vegas', 'oklahoma-city': 'Oklahoma City', phoenix: 'Phoenix',
	richmond: 'Richmond', 'salt-lake-city': 'Salt Lake City',
	shreveport: 'Shreveport', 'washington-dc': 'Washington DC',
	// The interlude. Pre-wired ahead of its guide: join-takeout iterates the
	// guides directory, so this entry is unused until that file exists — except
	// in the adherence loop below, which keys on this map and so picks NOLA up
	// immediately from perCityAdherence.
	'new-orleans': 'New Orleans'
};

const SLUG_TO_CITY_ID = {
	albuquerque: 'albuquerque-nm', atlanta: 'atlanta-ga', birmingham: 'birmingham-al',
	boise: 'boise-id', charlotte: 'charlotte-nc', dallas: 'dallas-tx', jackson: 'jackson-ms',
	'las-vegas': 'las-vegas-nv', 'oklahoma-city': 'oklahoma-city-ok', phoenix: 'phoenix-az',
	richmond: 'richmond-va', 'salt-lake-city': 'salt-lake-city-ut',
	shreveport: 'shreveport-la', 'washington-dc': 'washington-dc',
	'new-orleans': 'new-orleans-la'
};

// Hand-restored venues (D24) join exactly like guide recs — see the joinable
// list in main(). Optional: an absent file just means nothing was restored.
let OVERRIDES = {};
try {
	OVERRIDES = JSON.parse(readFileSync(join(ROOT, 'data/city-overrides.json'), 'utf8')).cities ?? {};
} catch { /* no restorations to join */ }

// Guide slug -> the saved-list key in saved-lists-corridor-public.json
const SLUG_TO_SAVED_LIST = {
	albuquerque: '2025 Albuquerque', boise: '2025 Boise', dallas: '2025 Dallas',
	'las-vegas': '2025 Las Vegas', 'oklahoma-city': '2025 Oklahoma City',
	phoenix: '2025 Phoenix', 'salt-lake-city': '2025 SLC',
	atlanta: '2026 Atlanta', birmingham: '2026 Birmingham', charlotte: '2026 Charlotte',
	jackson: '2026 Jackson', richmond: '2026 Richmond', shreveport: '2026 Shreveport',
	'washington-dc': '2026 Washington, DC',
	'new-orleans': '2026 New Orleans'
};

// ---------------------------------------------------------------------------
// Normalization
//
// The naive version of this stripped category words (coffee/books/records/bar/
// shop/store) as "noise". That is wrong: they are identity-bearing parts of
// venue names, and stripping them collapsed "Coffee Garden" to "garden", which
// then substring-matched "Gilgal Sculpture Garden". Confirmed false positive.
//
// Here only true structural noise is removed: punctuation, leading articles,
// and corporate suffixes. Everything that names the place is kept.

const CORPORATE_SUFFIX = /\b(inc|llc|ltd|co|corp)\b/g;
const LEADING_ARTICLE = /^(the|a|an)\s+/;

function normalize(s) {
	if (!s) return '';
	let out = s.normalize('NFKD').toLowerCase();
	out = out.replace(/[‘’']/g, '');        // possessives: joe's -> joes
	out = out.replace(/&/g, ' and ');
	out = out.replace(/[^a-z0-9]+/g, ' ');
	out = out.replace(CORPORATE_SUFFIX, ' ');
	out = out.replace(/\s+/g, ' ').trim();
	out = out.replace(LEADING_ARTICLE, '');
	return out;
}

// The naive normalizer, kept ONLY so --naive can demonstrate the regression.
function normalizeNaive(s) {
	if (!s) return '';
	let out = s.normalize('NFKD').toLowerCase();
	out = out.replace(/[^a-z0-9 ]/g, ' ');
	out = out.replace(
		/\b(the|a|an|and|of|at|in|on|co|inc|llc|company|cafe|coffee|shop|store|books|bookstore|records|bar|restaurant)\b/g,
		' '
	);
	return out.replace(/\s+/g, ' ').trim();
}

// Venue-type words appear as morphological variants across the two corpora
// ("Books" / "Bookshop" / "Book Store"), so fold them to one stem. NOTE the
// difference from the original bug: these tokens are KEPT, just unified — the
// naive version deleted them, which is what let "Coffee Garden" collapse to
// "garden". Folding preserves them as evidence; deleting destroyed the name.
const STEMS = [
	[/^(books?|bookshop|bookstore|booksellers?)$/, 'book'],
	[/^(records?|vinyl)$/, 'record'],
	[/^(roasters?|roasting|roastery)$/, 'roast'],
	[/^(bakery|bakeshop|baking|bakehouse)$/, 'bake'],
	[/^(cafes?|coffeehouse|coffeeshop)$/, 'cafe'],
	[/^(brewing|brewery|brewers?)$/, 'brew'],
	[/^(distillery|distilling)$/, 'distill'],
	[/^(shops?|stores?)$/, 'shop']
];

// Words that name a KIND of place, not a place. They stay in the token set —
// a shared 'book' is weak corroboration — but their IDF is capped so they can
// neither carry a match alone nor break one by being absent.
const GENERIC = new Set([
	'book', 'record', 'roast', 'bake', 'cafe', 'coffee', 'brew', 'distill', 'shop',
	'bar', 'restaurant', 'kitchen', 'market', 'museum', 'gallery', 'house', 'room',
	'grill', 'tavern', 'lounge', 'club', 'centre', 'center', 'gift', 'venue'
]);
const GENERIC_IDF_CAP = 0.35;

function stem(t) {
	for (const [re, s] of STEMS) if (re.test(t)) return s;
	// Plain plural / stripped-possessive fold, so "Grapevine" matches
	// "Grapevine's" (the apostrophe is removed earlier, leaving "grapevines").
	// Guarded against -ss/-us/-is endings and short words.
	if (t.length > 4 && t.endsWith('s') && !/(ss|us|is)$/.test(t)) return t.slice(0, -1);
	return t;
}

const tokens = (s) => new Set(normalize(s).split(' ').filter((t) => t.length > 2).map(stem));

// Guide rec names often carry a dish/product prefix before the venue:
//   'Pig Ear Sliders & "Smokes" -- Big Apple Inn'  -> venue is after the dash
//   'Whole-Bean Coffee — Blanchard's / Lamplighter'
// Split on em/en dash or double-hyphen and return all candidate segments, so
// the venue half can match even when the full string can't.
function candidateStrings(name) {
	const parts = String(name).split(/\s+(?:--|—|–)\s+|\s+\/\s+/).map((p) => p.trim()).filter(Boolean);
	return [...new Set([name, ...parts])];
}

// ---------------------------------------------------------------------------
// Matching
//
// Three tiers, most-confident first. Every match records its tier and both
// source strings so the whole table is reviewable by eye — that hand review,
// not an automated threshold, is the gate on this data becoming site content.

// The discriminator is token DISTINCTIVENESS, not string length. Compare the
// misses a naive length/Jaccard rule produces:
//
//   TRUE  "Lemuria Books"    ~ "Lemuria Book Store"     shared: {lemuria}
//   TRUE  "Summum Pyramid"   ~ "Summum"                 shared: {summum}
//   TRUE  "Deep Vellum Books"~ "Deep Vellum Bookstore"  shared: {deep, vellum}
//   FALSE "Coffee Garden"    ~ "Gilgal Sculpture Garden" shared: {garden}
//   FALSE "Noble Records"    ~ "Noble Smoke"            shared: {noble}
//   FALSE "Virginia Peanuts" ~ "The Virginia Shop"      shared: {virginia}
//
// All six are one- or two-token overlaps, so no threshold on count or length
// separates them. What does: "lemuria"/"summum"/"vellum" occur once in the
// city's name pool, while "garden"/"noble"/"virginia" recur. So weight each
// shared token by inverse document frequency over that city's pool and
// require the shared mass to clear a floor.

// Counting shared tokens is the wrong instrument in both directions:
//
//   "Rediscovered Books" ~ "Rediscovered Bookshop"  1/2 shared -> too LOW
//   "Publik Coffee Roasters" ~ "Kings Peak Coffee Roasters"  2/3 -> too HIGH
//
// The first shares the only token that identifies the place; the second shares
// only the generic ones and disagrees on the identifying token. So score by
// IDF *mass*: what fraction of the shorter name's distinctiveness is shared.
// Generic tokens (books, coffee, roasters) carry almost no mass, so dropping
// or gaining them barely moves the score, while a unique token (publik,
// gilgal, lemuria) dominates and must be shared for a match to stand.

// Venue names are head-initial: the identifying word comes first and
// qualifiers accrete to the right. That single fact separates every labeled
// case cleanly, where no threshold on token count, length, or IDF mass could:
//
//   MATCH   summum pyramid       ~ summum                    (prefix)
//   MATCH   deep vellum book     ~ deep vellum book publishing
//   MATCH   meow wolf grapevine  ~ meow wolf grapevine real unreal
//   MATCH   lemuria book         ~ lemuria book shop
//   REJECT  coffee garden        ~ gilgal sculpture garden    (shares only a tail)
//   REJECT  noble record         ~ noble smoke                (diverges at 1)
//   REJECT  publik cafe roast    ~ kings peak cafe roast      (diverges at 0)
//   REJECT  virginia peanuts     ~ virginia shop              (diverges at 1)
//
// So: one name's token sequence must be a PREFIX of the other's, and the
// shared prefix must carry real identifying weight (IDF floor) so that a
// generic head like "the market" can't match everything in the pool.
const MIN_SHARED_IDF = 1.0;

// `cityTokens` are capped alongside GENERIC: within one city's name pool the
// city's OWN name identifies nothing. Found by hand-reviewing the saved-list
// table — "Boise Co-op" reduces to just ["boise"] (both "co" and "op" are 2
// chars and drop out), which then prefix-matched "Boise Whitewater Park". Same
// failure shape as the original "Coffee Garden" -> "garden" bug: a name whose
// identifying part is gone matches on a word that was never identifying.
function buildIdf(names, cityTokens = new Set()) {
	const df = new Map();
	for (const n of names) {
		for (const t of new Set(tokens(n))) df.set(t, (df.get(t) ?? 0) + 1);
	}
	const N = Math.max(names.length, 1);
	return (t) => {
		const raw = Math.log((N + 1) / ((df.get(t) ?? 0) + 1));
		return GENERIC.has(t) || cityTokens.has(t) ? Math.min(raw, GENERIC_IDF_CAP) : raw;
	};
}

const idfMass = (list, idf) => list.reduce((s, t) => s + idf(t), 0);

// Ordered, de-duplicated token sequence — order carries the head/tail signal.
function tokenSeq(s) {
	const seen = new Set();
	return normalize(s).split(' ')
		.filter((t) => t.length > 2)
		.map(stem)
		.filter((t) => (seen.has(t) ? false : (seen.add(t), true)));
}

const isPrefix = (short, long) => short.length <= long.length && short.every((t, i) => long[i] === t);

function matchOne(recName, candidates, idf) {
	let best = null;
	for (const recCand of candidateStrings(recName)) {
		const rSeq = tokenSeq(recCand);
		if (!rSeq.length) continue;
		const rn = normalize(recCand);

		for (const cand of candidates) {
			const cSeq = tokenSeq(cand);
			if (!cSeq.length) continue;
			if (rn === normalize(cand)) return { kind: 'exact', score: 1, matched: cand, via: recCand };

			const fwd = isPrefix(rSeq, cSeq);
			const rev = isPrefix(cSeq, rSeq);
			if (!fwd && !rev) continue;

			// The shared prefix is the shorter sequence entirely.
			const prefix = fwd ? rSeq : cSeq;
			const shared = idfMass(prefix, idf);
			if (shared < MIN_SHARED_IDF) continue;

			// Longer prefix + rarer tokens = more confident.
			const extra = Math.abs(rSeq.length - cSeq.length);
			const score = +Math.min(0.99, 0.6 + shared / 20 - extra * 0.02).toFixed(2);
			if (!best || score > best.score) {
				best = {
					kind: extra === 0 ? 'same-tokens' : 'prefix',
					score, matched: cand, via: recCand, idf: +shared.toFixed(2)
				};
			}
		}
	}
	return best;
}

// ---------------------------------------------------------------------------

function main() {
	const maps = JSON.parse(readFileSync(MAPS_PATH, 'utf8'));
	const saved = JSON.parse(readFileSync(SAVED_PATH, 'utf8')).lists;
	const topByCity = Object.fromEntries(
		maps.cities.map((c) => [c.name, (c.topPlaces ?? []).map((p) => p.name)])
	);
	// Full records (name + count + categories), for the visited-places module.
	const topPlacesFull = Object.fromEntries(maps.cities.map((c) => [c.name, c.topPlaces ?? []]));

	const visited = {};         // cityId -> [{ name, count, categories, provenance }]
	const attendance = {};      // citySlug -> { recId: {kind, score, matched, via} }
	const visitRows = [];
	const savedRows = [];
	const summary = [];
	let naiveFalsePositives = 0;

	for (const file of readdirSync(GUIDES_DIR).filter((f) => f.endsWith('-guide.json'))) {
		const guide = JSON.parse(readFileSync(join(GUIDES_DIR, file), 'utf8'));
		const slug = guide.slug;
		const topPlaces = topByCity[SLUG_TO_MAPS_NAME[slug]] ?? [];
		const savedPlaces = (saved[SLUG_TO_SAVED_LIST[slug]] ?? []).map((i) => i.title);

		// Hand-restored venues (D24) are matched exactly like guide recs — one
		// matcher, one code path. Without this a restored venue could only ever be
		// "visit unknown": DC's topPlaces contains Library of Congress and Bridge
		// Street Books, both of which were restored, and both of which the
		// location data confirms were visited.
		const additive = (OVERRIDES[SLUG_TO_CITY_ID[slug]]?.additionalRecommendations ?? [])
			.map((e) => ({ id: e.id, name: e.name }));
		const joinable = [...guide.recommendations.map((r) => ({ id: r.id, name: r.name })), ...additive];

		// IDF is computed per city over that city's whole name pool — the
		// distinctiveness of "virginia" is a property of the Richmond corpus,
		// not of English.
		const idf = buildIdf(
			[...topPlaces, ...savedPlaces, ...joinable.map((r) => r.name)],
			tokens(guide.city)
		);

		const hits = {};
		const visitVenues = new Set();
		const savedVenues = new Set();
		let savedRecCount = 0;

		for (const rec of joinable) {
			const v = matchOne(rec.name, topPlaces, idf);
			if (v) {
				hits[rec.id] = { kind: v.kind, score: v.score, matched: v.matched };
				visitVenues.add(normalize(v.matched));
				visitRows.push(`| ${slug} | ${rec.id} | ${rec.name} | ${v.matched} | ${v.kind} ${v.score} |`);
			}
			const s = matchOne(rec.name, savedPlaces, idf);
			if (s) {
				savedRecCount++;
				savedVenues.add(normalize(s.matched));
				savedRows.push(`| ${slug} | ${rec.name} | ${s.matched} | ${s.kind} ${s.score} |`);
			}
			if (RUN_NAIVE) {
				// Regression probe: does the old normalizer fire where the new one doesn't?
				const rnN = normalizeNaive(rec.name);
				for (const cand of savedPlaces) {
					const cnN = normalizeNaive(cand);
					if (rnN.length > 3 && cnN.length > 3 && (rnN.includes(cnN) || cnN.includes(rnN))) {
						if (!s || normalize(s.matched) !== normalize(cand)) {
							naiveFalsePositives++;
							console.log(`  NAIVE-ONLY  ${slug}: "${rec.name}" <- "${cand}"  (normalized: "${rnN}" ~ "${cnN}")`);
						}
					}
				}
			}
		}

		if (Object.keys(hits).length) attendance[slug] = hits;

		// Provenance of what was actually navigated to (D26). Guide first, then the
		// self-made list, then neither. Same matcher, same idf, opposite direction:
		// here each VISITED place is matched against the two lists, rather than each
		// recommendation being matched against the visits.
		//
		// The 'own-list' bucket is an UPPER bound and 'found' a floor: per
		// methodNotes the export carries no per-item save timestamps and the lists
		// were edited mid-trip, so a place saved while standing in it cannot be
		// separated from one saved before leaving.
		// matchOne only splits dish/product prefixes on its FIRST argument, and this
		// call runs in the opposite direction from the attendance join — a visited
		// place is matched against the rec list, not the reverse. So expand the recs
		// into their venue segments up front, or "Bar Gernika" fails to match the
		// guide's "Beef Tongue & Croquetas -- Bar Gernika" and lands in the wrong
		// bucket. (Caught by hand-checking Boise against its guide and saved list.)
		const recNames = guide.recommendations.flatMap((r) => candidateStrings(r.name));
		visited[SLUG_TO_CITY_ID[slug]] = topPlacesFull[SLUG_TO_MAPS_NAME[slug]].map((p) => ({
			name: p.name,
			count: p.count,
			categories: p.categories ?? [],
			provenance: matchOne(p.name, recNames, idf) ? 'guide'
				: matchOne(p.name, savedPlaces, idf) ? 'own-list'
				: 'found'
		}));

		summary.push({
			slug, recs: guide.recommendations.length,
			topPlaces: topPlaces.length, visitRecs: Object.keys(hits).length, visitVenues: visitVenues.size,
			saved: savedPlaces.length, savedRecs: savedRecCount, savedVenues: savedVenues.size
		});
	}

	console.log(`\n${'city'.padEnd(16)} ${'recs'.padStart(5)} ${'top'.padStart(4)} ${'vRec'.padStart(5)} ${'vVenue'.padStart(7)} ${'saved'.padStart(6)} ${'sRec'.padStart(5)} ${'sVenue'.padStart(7)}`);
	for (const s of summary) {
		console.log(`${s.slug.padEnd(16)} ${String(s.recs).padStart(5)} ${String(s.topPlaces).padStart(4)} ${String(s.visitRecs).padStart(5)} ${String(s.visitVenues).padStart(7)} ${String(s.saved).padStart(6)} ${String(s.savedRecs).padStart(5)} ${String(s.savedVenues).padStart(7)}`);
	}
	const tot = summary.reduce((a, s) => ({
		recs: a.recs + s.recs, visitRecs: a.visitRecs + s.visitRecs, visitVenues: a.visitVenues + s.visitVenues,
		savedRecs: a.savedRecs + s.savedRecs, savedVenues: a.savedVenues + s.savedVenues
	}), { recs: 0, visitRecs: 0, visitVenues: 0, savedRecs: 0, savedVenues: 0 });
	console.log(`\nconfirmed-visit floor: ${tot.visitRecs} recs / ${tot.visitVenues} distinct venues (of ${tot.recs} recs)`);
	console.log(`saved-list overlap:    ${tot.savedRecs} recs / ${tot.savedVenues} distinct venues`);
	if (RUN_NAIVE) console.log(`\nnaive-only matches (regressions the fixed matcher avoids): ${naiveFalsePositives}`);

	if (DRY_RUN) { console.log('\nDry run — nothing written.'); return; }

	writeFileSync(MATCHES_PATH, JSON.stringify({
		generated: maps.generated,
		source: 'data/maps-trip-analysis-public.json topPlaces (top ~8-14 per city)',
		caveat: 'FLOOR ONLY. topPlaces is truncated; a non-match proves nothing. Never render as a rate.',
		matches: attendance
	}, null, 2) + '\n');
	console.log(`\nwrote ${MATCHES_PATH}`);

	// The authoritative thesis metric (D22), re-keyed from display name to city
	// id for the site. These figures come from the FULL pre-sanitization corpus
	// and are copied verbatim — never recomputed from the public file.
	const adherence = {};
	for (const [slug, mapsName] of Object.entries(SLUG_TO_MAPS_NAME)) {
		const a = maps.perCityAdherence[mapsName];
		if (!a) continue;
		adherence[SLUG_TO_CITY_ID[slug]] = {
			trip: a.trip,
			saved: a.saved,
			navigatedFromList: a.navigatedFromList,
			listConversionPct: a.listConversionPct,
			uniqueDirTargets: a.uniqueDirTargets,
			visitsThatWereOnListPct: a.visitsThatWereOnListPct
		};
	}
	// Corpus-wide comparison, copied verbatim. These are the figures D22 calls
	// authoritative; anything deriving a headline rate must use THESE, not an
	// average over the per-city rows below (an unweighted per-city mean is a
	// different statistic and lands a few tenths off).
	const pick = (o) => o && {
		cities: o.cities, cityDays: o.cityDays, savedListPlaces: o.savedListPlaces,
		uniqueDirectionTargets: o.uniqueDirectionTargets, listConversionPct: o.listConversionPct,
		visitsThatWereOnListPct: o.visitsThatWereOnListPct,
		// The interest mix is the D22 content inversion — the site's central
		// finding. Carried verbatim so the chart never re-derives it.
		interestMix: o.interestMix
	};
	writeFileSync(ADHERENCE_PATH, JSON.stringify({
		generated: maps.generated,
		source: 'Google Takeout Maps activity; computed pre-sanitization over the full corpus',
		note: 'Authoritative per D22. Copied verbatim from maps-trip-analysis-public.json — do not recompute.',
		comparison: { trip1: pick(maps.comparison.trip1), trip2: pick(maps.comparison.trip2) },
		cities: adherence
	}, null, 2) + '\n');
	console.log(`wrote ${ADHERENCE_PATH} (${Object.keys(adherence).length} cities)`);

	const provTotals = Object.values(visited).flat().reduce((a, p) => ({ ...a, [p.provenance]: (a[p.provenance] ?? 0) + 1 }), {});

	// Per-city interest tags, carried for the cities this file already covers plus
	// New Orleans. Used only where a chapter is a SINGLE city, so it is that
	// city's own record rather than an aggregate — summing these across a chapter
	// would re-derive comparison.interestMix and disagree with it (D27).
	const tagCities = new Set([...Object.keys(visited), 'new-orleans-la']);
	const interestTagCounts = {};
	for (const c of maps.cities) {
		const cid = Object.entries(SLUG_TO_MAPS_NAME).find(([, n]) => n === c.name)?.[0];
		const id = cid && SLUG_TO_CITY_ID[cid];
		if (id && tagCities.has(id) && c.interestTagCounts) interestTagCounts[id] = c.interestTagCounts;
	}

	writeFileSync(VISITED_PATH, JSON.stringify({
		generated: maps.generated,
		source: 'data/maps-trip-analysis-public.json topPlaces — the most-navigated places per city',
		caveat: 'Provenance is matched, not recorded. "own-list" is an UPPER bound and "found" a FLOOR: the export has no per-item save timestamps and the lists were edited during the trips, so a place saved on the ground cannot be separated from one saved before leaving. topPlaces is also truncated to roughly the top 8-14 per city, so this is what was navigated to MOST, not everything.',
		totals: provTotals,
		interestTagCounts,
		cities: visited
	}, null, 2) + '\n');
	console.log(`wrote ${VISITED_PATH} — provenance ${JSON.stringify(provTotals)}`);

	const report = [
		`# Takeout join report`, '',
		`Confirmed-visit floor: **${tot.visitRecs} recs / ${tot.visitVenues} distinct venues** of ${tot.recs}.`,
		`Saved-list overlap: **${tot.savedRecs} recs / ${tot.savedVenues} distinct venues**.`, '',
		`## Confirmed visits (topPlaces matches) — review every row`, '',
		`| city | recId | guide rec | topPlaces entry | match |`, `|---|---|---|---|---|`,
		...visitRows, '',
		`## Saved-list overlap — review before this renders anywhere`, '',
		`| city | guide rec | saved place | match |`, `|---|---|---|---|`,
		...savedRows, ''
	].join('\n');
	writeFileSync(REPORT_PATH, report);
	console.log(`wrote ${REPORT_PATH} — fold into design/m35-headline-metric.md after review`);
}

main();
