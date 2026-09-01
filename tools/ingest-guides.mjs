#!/usr/bin/env node
// M3 guide ingest — converts guides/*-guide.json into schema-valid
// setup/roadtrip/src/lib/data/cities/*.json.
//
// See design/m3-guide-ingest.md for the mapping rationale and open items.
// Every mapping decision below is documented there; this file is the
// executable form of that document, not a place to make new ones.
//
// Usage: node tools/ingest-guides.mjs [--dry-run]

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const GUIDES_DIR = join(ROOT, 'guides');
const CITY_INDEX_PATH = join(ROOT, 'setup/roadtrip/src/lib/data/cityIndex.json');
const CITIES_DIR = join(ROOT, 'setup/roadtrip/src/lib/data/cities');
const M3_DOC_PATH = join(ROOT, 'design/m3-guide-ingest.md');

const DRY_RUN = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// Static mappings

const SLUG_TO_CITY_ID = {
	albuquerque: 'albuquerque-nm',
	atlanta: 'atlanta-ga',
	birmingham: 'birmingham-al',
	boise: 'boise-id',
	charlotte: 'charlotte-nc',
	dallas: 'dallas-tx',
	jackson: 'jackson-ms',
	'las-vegas': 'las-vegas-nv',
	'oklahoma-city': 'oklahoma-city-ok',
	phoenix: 'phoenix-az',
	richmond: 'richmond-va',
	'salt-lake-city': 'salt-lake-city-ut',
	shreveport: 'shreveport-la',
	'washington-dc': 'washington-dc',
	// Pre-wired ahead of its guide (M4a); unused until guides/new-orleans-guide.json exists.
	'new-orleans': 'new-orleans-la'
};

// Verified 1:1 against registry.ts CATEGORIES — wording differs, mapping doesn't.
const CATEGORY_TO_NUM = {
	bookstores: 1,
	records: 2,
	coffee: 3,
	pastry: 4,
	dishes: 5,
	gifts: 6,
	sights: 7,
	venues: 8,
	souvenirs: 9,
	electronics: 10
};

const CLEAN_CITED_FROM = new Set(['web-search', 'atlasobscura', 'tasteatlas']);

// CLAUDE.md, non-negotiable: missing data renders as nothing, never a
// placeholder. estCost/bestTimeOfDay are plain strings (not nullable in
// types.ts), and RecommendationList's {#if r.bestTimeOfDay} guard only
// suppresses a falsy value — 'N/A'/'Varies' would render literally
// ("· best at N/A"). Normalize the guides' placeholder strings to '' so the
// guard actually fires.
const PLACEHOLDER_VALUES = new Set(['N/A', 'Varies', 'TBD', 'Unknown']);
function stripPlaceholder(value) {
	return !value || PLACEHOLDER_VALUES.has(value) ? '' : value;
}

// Reviewed corrections that must survive regeneration (data/city-overrides.json).
// A guide value a human already rejected must not silently come back on the next
// re-run — without this, that class of finding is lost every time the transform
// runs. Applied AFTER mapping, in transformCity.
let OVERRIDES = {};
try {
	OVERRIDES = JSON.parse(readFileSync(join(ROOT, 'data/city-overrides.json'), 'utf8')).cities ?? {};
} catch {
	console.warn('note: data/city-overrides.json not found — no reviewed corrections applied');
}
const appliedOverrides = [];

// Entries a reviewer restored by hand (D24). Shaped like guide recs minus the
// fields the transform owns: `status` comes from the join and `rating` is null,
// so a restored venue can never smuggle back an asserted outcome.
const ADDITIVE_REQUIRED = ['id', 'name', 'categoryNum', 'source', 'interestTags', 'estCost', 'bestTimeOfDay', 'durationMin', 'note', 'reason'];
const ADDITIVE_FORBIDDEN = ['status', 'rating', 'verifiedOpen'];

function transformAdditive(entry, cityId) {
	const where = `city-overrides.json: ${cityId} additionalRecommendations "${entry.name ?? entry.id ?? '(unnamed)'}"`;
	for (const f of ADDITIVE_REQUIRED) {
		if (!(f in entry)) throw new Error(`${where}: missing required field "${f}".`);
	}
	for (const f of ADDITIVE_FORBIDDEN) {
		if (f in entry) {
			throw new Error(
				`${where}: must not set "${f}". The transform owns it — status comes from the ` +
				`takeout join and rating is null, so a restored entry cannot assert an outcome.`
			);
		}
	}
	const unknown = Object.keys(entry).filter((k) => !ADDITIVE_REQUIRED.includes(k));
	if (unknown.length) throw new Error(`${where}: unrecognized field(s) ${unknown.join(', ')}.`);

	const visited = Boolean(ATTENDANCE[cityId]?.[entry.id]);
	return {
		name: entry.name,
		categoryNum: entry.categoryNum,
		source: entry.source,
		status: visited ? 'attended' : 'unverified',
		interestTags: entry.interestTags,
		estCost: stripPlaceholder(entry.estCost),
		bestTimeOfDay: stripPlaceholder(entry.bestTimeOfDay),
		durationMin: entry.durationMin,
		rating: null,
		note: entry.note,
		verifiedOpen: null
	};
}

function applyOverrides(city) {
	const patch = OVERRIDES[city.id];
	if (!patch) return city;
	for (const [field, spec] of Object.entries(patch)) {
		if (field === 'additionalRecommendations') {
			for (const entry of spec) city.recommendations.push(transformAdditive(entry, city.id));
			appliedOverrides.push(`${city.id}.+${spec.length}recs`);
			continue;
		}
		if (!(field in city)) {
			throw new Error(
				`city-overrides.json: "${city.id}.${field}" is not a field in the City schema. ` +
				`Overrides patch existing fields only — they are not a way to extend types.ts.`
			);
		}
		city[field] = spec.value;
		appliedOverrides.push(`${city.id}.${field}`);
	}
	return city;
}

// Confirmed-visit evidence from tools/join-takeout.mjs, keyed {citySlug: {recId}}.
// Optional: absent file just means no upgrades (the M3 behaviour).
let ATTENDANCE = {};
try {
	ATTENDANCE = JSON.parse(readFileSync(join(ROOT, 'data/attendance-matches.json'), 'utf8')).matches ?? {};
} catch {
	console.warn('note: data/attendance-matches.json not found — no visit upgrades applied');
}

// D21 (provisional) + D3 as redefined in M3.5. guide status -> site RecStatus.
// Isolated here as the one thing that gets re-run when more attendance
// evidence lands.
//
// Both unmatched outcomes are UNKNOWN, not negative:
//   retroactive-recommendation = "retro guide picked this; visit status unknown"
//   unverified                 = "guide listed this; outcome not established"
// A match upgrades to the visited value for that trip. Because topPlaces is
// truncated to ~top-10 per city, matches are a FLOOR — a non-match is not
// evidence of absence, and nothing downstream may render these as a rate.
function assignStatus(rec, guide) {
	const visited = Boolean(ATTENDANCE[guide.slug]?.[rec.id]);
	if (guide.tripStatus === 'retroactive-guide') {
		return visited ? 'attended-anyway' : 'retroactive-recommendation';
	}
	return visited ? 'attended' : 'unverified';
}

// ---------------------------------------------------------------------------
// Field-level transforms

function deriveStay(guide, cityIndexEntry) {
	// Guides are consistently 1 night low (they compute departure as last full
	// day, not checkout) — cityIndex.nights is the ground truth (verified
	// against M2's hand-transcribed DC: arrive 05-24 + nights 7 -> depart 05-31,
	// matching the reviewed washington-dc.json exactly).
	const nights = cityIndexEntry.nights;
	const arrive = guide.visitWindow.arrival;
	const [y, m, d] = arrive.split('-').map(Number);
	const departDate = new Date(Date.UTC(y, m - 1, d + nights));
	const depart = departDate.toISOString().slice(0, 10);
	return { arrive, depart, nights };
}

function citationsFromSource(source) {
	const { citedFrom, detail } = source;
	if (CLEAN_CITED_FROM.has(citedFrom)) {
		// D19: split multi-source detail into separate citations rather than
		// collapsing to one shared URL/label.
		return detail
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
			.map((label) => ({ source: citedFrom, label, url: null }));
	}
	// Fallback bucket: 'general/local knowledge' (+ confidence-suffix variants),
	// 'general-knowledge', and 'direct fetch, X'. None of these are a real
	// CitedSource enum member. detail here is editorial commentary ("long-running
	// RVA indie institution"), not a source name — do not fold it into the
	// citation. Per D19's corollary: never invent a URL, never invent an
	// attribution; label carries the real provenance string as recorded.
	const label = citedFrom.startsWith('direct fetch,')
		? citedFrom.slice('direct fetch,'.length).trim()
		: citedFrom;
	return [{ source: 'web-search', label, url: null }];
}

// Both en-dash and hyphen ranges appear ('30–45 min', '30-45 min'). Upper
// bound is the defensible default per design/m2-first-city.md's precedent
// (mechanical duration parsing is expect-some-off, documented not fixed).
function parseDurationMin(duration) {
	if (!duration || duration === 'N/A' || duration === 'Varies') return null;
	const hrMatch = duration.match(/(\d+(?:\.\d+)?)(?:\s*[–-]\s*(\d+(?:\.\d+)?))?\s*hr/);
	if (hrMatch) {
		const upper = hrMatch[2] ?? hrMatch[1];
		return Math.round(parseFloat(upper) * 60);
	}
	const minMatch = duration.match(/(\d+)(?:\s*[–-]\s*(\d+))?\s*min/);
	if (minMatch) {
		const upper = minMatch[2] ?? minMatch[1];
		return parseInt(upper, 10);
	}
	return null;
}

function transformRecommendation(rec, guide) {
	const categoryNum = CATEGORY_TO_NUM[rec.category];
	if (!categoryNum) {
		throw new Error(`${guide.slug}/${rec.id}: unknown category "${rec.category}"`);
	}
	return {
		name: rec.name,
		categoryNum,
		source: {
			type: guide.tripStatus === 'retroactive-guide' ? 'retro-guide' : 'guide',
			citedFrom: citationsFromSource(rec.source)
		},
		status: assignStatus(rec, guide),
		interestTags: rec.interestTags ?? [],
		estCost: stripPlaceholder(rec.cost),
		bestTimeOfDay: stripPlaceholder(rec.bestTime),
		durationMin: parseDurationMin(rec.duration),
		rating: null, // D18 — nothing in the guides records a would-return signal
		note: rec.note ?? '',
		verifiedOpen: null // do NOT infer from verificationFlag (source confidence, not open/closed)
	};
}

function transformFilmedHere(films) {
	const out = [];
	for (const film of films ?? []) {
		out.push({
			title: film.title,
			year: film.year ?? null,
			// guides record venue state (extant/unconfirmed/demolished), not visit
			// state — D9, do not conflate.
			locationVisited: null,
			visitNote: (film.locations ?? []).map((l) => l.note).filter(Boolean).join(' '),
			photoId: null // M7
		});
	}
	return out;
}

function transformBornHere(notablePeople) {
	const out = [];
	for (const p of notablePeople ?? []) {
		// Gate on a confirmed birthplace. Some guides explicitly disclaim
		// nativity in statusNotes (e.g. Boise's Martsch/Pushead: "described here
		// by association, not nativity") — putting them in bornHere would assert
		// what the source disclaims.
		if (!p.birthplace) continue;
		out.push({
			name: p.name,
			relevance: p.relevance ?? '',
			note: p.note ?? ''
		});
	}
	return out;
}

function transformCity(guide, cityIndexEntry) {
	const stay = deriveStay(guide, cityIndexEntry);
	return {
		id: cityIndexEntry.id,
		// cityIndex.name is a map-label abbreviation ("Okla. City", "Washington
		// DC") — deliberately not the city-page name. Guide city/state matches
		// DC's M2 file exactly ("Washington", "DC").
		name: guide.city,
		state: guide.state,
		tripId: cityIndexEntry.tripId,
		stay,
		coords: { lat: guide.coordinates.lat, lng: guide.coordinates.lng },
		elevationFt: guide.elevationFt ?? null,
		population: {
			cityProper: guide.population?.cityProper ?? null,
			metro: guide.population?.metro ?? null,
			// D23 — carried but not rendered; see types.ts. `fragmentationRatio` is
			// null in all 14 guides and has no schema home, so it is not carried.
			note: guide.population?.note ?? null
		},
		vibeWord: '',
		tagline: '',
		wouldILiveHere: { verdict: null, note: '' },
		fingerprint: {
			food: null,
			musicScene: null,
			weirdness: null,
			politicalEnergy: null,
			cost: null,
			interestCoverage: null
		},
		recommendations: guide.recommendations.map((r) => transformRecommendation(r, guide)),
		popCulture: {
			filmedHere: transformFilmedHere(guide.popCulture?.films),
			bornHere: transformBornHere(guide.popCulture?.notablePeople)
		},
		favorites: {
			meal: { what: '', where: '', note: '' },
			coffee: { what: '', where: '' },
			site: { what: '', note: '' },
			newFood: '',
			bestStranger: '',
			weirdestThing: ''
		},
		fieldNotes: {
			coffeePriceUsd: null,
			eggsDozenUsd: null,
			parkingEase: null,
			tapWater: null,
			strangerFriendliness: null,
			bartenderAskedWhereFrom: null,
			firstUnpromptedConversation: '',
			accentNote: '',
			roadQuality: null,
			yardSignRatio: ''
		},
		spend: null, // D20 — card-statement CSVs (M0) haven't landed
		photos: { hero: null, gallery: [], serialSubjects: {} }
	};
}

// ---------------------------------------------------------------------------
// Validation

function validateCity(city, guideSlug) {
	const errors = [];
	const req = (cond, msg) => { if (!cond) errors.push(msg); };
	req(typeof city.id === 'string' && city.id, 'missing id');
	req(typeof city.name === 'string' && city.name, 'missing name');
	req(typeof city.state === 'string' && city.state, 'missing state');
	req(['west', 'nola', 'south'].includes(city.tripId), `bad tripId "${city.tripId}"`);
	req(typeof city.stay.nights === 'number', 'stay.nights not a number');
	req(typeof city.coords.lat === 'number' && typeof city.coords.lng === 'number', 'bad coords');
	for (const rec of city.recommendations) {
		req(typeof rec.categoryNum === 'number' && rec.categoryNum >= 1 && rec.categoryNum <= 10,
			`rec "${rec.name}": bad categoryNum ${rec.categoryNum}`);
		req(['attended', 'planned-skipped', 'off-guide-discovery', 'closed-on-arrival', 'unverified',
			'attended-anyway', 'retroactive-recommendation'].includes(rec.status),
			`rec "${rec.name}": bad status "${rec.status}"`);
		req(Array.isArray(rec.source.citedFrom) && rec.source.citedFrom.length > 0,
			`rec "${rec.name}": empty citedFrom`);
		for (const c of rec.source.citedFrom) {
			req(['atlasobscura', 'tasteatlas', 'eater', 'timeout', 'web-search', 'local-tip', 'self'].includes(c.source),
				`rec "${rec.name}": bad citation source "${c.source}"`);
			req(c.url === null, `rec "${rec.name}": citation url should be null, got "${c.url}" (never synthesize)`);
		}
	}
	if (errors.length) {
		throw new Error(`Validation failed for ${guideSlug}:\n  ${errors.join('\n  ')}`);
	}
}

// Cross-listed venue report (see design/m3-guide-ingest.md). crossListedIn
// holds category ids the same physical venue also belongs to, not venue ids —
// this can't be auto-paired reliably (needs fuzzy name matching), so it's
// emitted as a human-readable list for the review that happens alongside
// attendance reconciliation, per M2's cross-entry consistency rule.
function collectCrossListedReport(guide) {
	const rows = [];
	for (const rec of guide.recommendations) {
		if (rec.crossListedIn?.length) {
			rows.push(`  - **${rec.name}** (${guide.slug}, ${rec.category}) also listed in: ${rec.crossListedIn.join(', ')}`);
		}
	}
	return rows;
}

// ---------------------------------------------------------------------------
// Main

function main() {
	const cityIndex = JSON.parse(readFileSync(CITY_INDEX_PATH, 'utf8'));
	const cityIndexById = Object.fromEntries(cityIndex.map((c) => [c.id, c]));

	const guideFiles = readdirSync(GUIDES_DIR).filter((f) => f.endsWith('-guide.json'));
	const crossListedReport = [];
	const results = [];

	for (const file of guideFiles) {
		const guide = JSON.parse(readFileSync(join(GUIDES_DIR, file), 'utf8'));
		const cityId = SLUG_TO_CITY_ID[guide.slug];
		if (!cityId) throw new Error(`${file}: no cityIndex mapping for slug "${guide.slug}"`);
		const cityIndexEntry = cityIndexById[cityId];
		if (!cityIndexEntry) throw new Error(`${file}: cityIndex has no entry for "${cityId}"`);

		const city = applyOverrides(transformCity(guide, cityIndexEntry));
		validateCity(city, guide.slug);
		crossListedReport.push(...collectCrossListedReport(guide));
		results.push({ cityId, city, guideSlug: guide.slug });
	}

	// Ground-truth check before writing anything. DC is now transform-built like
	// every other city (M3.6), so this no longer compares against a separate
	// hand-transcription — it stays as a regression guard on the nights rule
	// (cityIndex nights + guide arrival -> depart), pinned to the one stay that
	// was verified by hand against the real itinerary.
	const dcResult = results.find((r) => r.cityId === 'washington-dc');
	const expectedDcStay = { arrive: '2026-05-24', depart: '2026-05-31', nights: 7 };
	if (JSON.stringify(dcResult.city.stay) !== JSON.stringify(expectedDcStay)) {
		throw new Error(
			`Ground-truth check failed: derived DC stay ${JSON.stringify(dcResult.city.stay)} ` +
			`does not match the hand-verified record ${JSON.stringify(expectedDcStay)}`
		);
	}
	console.log('Ground-truth check passed: derived DC stay matches the hand-verified record.');

	if (DRY_RUN) {
		console.log(`Dry run: would write ${results.length} city files.`);
		console.log(`Overrides applied: ${appliedOverrides.length ? appliedOverrides.join(', ') : 'none'}`);
		console.log(`Cross-listed groups found: ${crossListedReport.length}`);
		return;
	}

	for (const { cityId, city } of results) {
		const path = join(CITIES_DIR, `${cityId}.json`);
		writeFileSync(path, JSON.stringify(city, null, 2) + '\n');
		console.log(`wrote ${path}`);
	}
	console.log(`overrides applied: ${appliedOverrides.length ? appliedOverrides.join(', ') : 'none'}`);

	// Emit the cross-listed report as a fenced block the M3 doc can quote.
	const reportPath = join(ROOT, 'tools/.cross-listed-report.md');
	writeFileSync(reportPath, `Cross-listed venue groups (${crossListedReport.length}):\n\n${crossListedReport.join('\n')}\n`);
	console.log(`wrote ${reportPath} (${crossListedReport.length} groups) — fold into design/m3-guide-ingest.md`);
}

main();
