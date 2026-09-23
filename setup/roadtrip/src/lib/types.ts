export type TripId = 'west' | 'nola' | 'south';

export type RecStatus =
	| 'attended' | 'planned-skipped' | 'off-guide-discovery'
	| 'closed-on-arrival' | 'unverified'
	// trip-1 retroactive semantics — never visually conflate with the above
	| 'attended-anyway' | 'retroactive-recommendation';

export type CitedSource =
	| 'atlasobscura' | 'tasteatlas' | 'eater' | 'timeout'
	| 'web-search' | 'local-tip' | 'self';

// The guides' cross-cutting interest axis, orthogonal to the 10 categories.
// Typed as a union rather than `string[]` so a guide inventing a ninth value
// fails `npm run check` instead of silently rendering as an unlabelled tag —
// the failure mode M3 hit when DC's vocabulary diverged unnoticed. Display
// labels live in registry.ts (INTEREST_TAGS).
export type InterestTag =
	| 'i-food' | 'i-drinks' | 'i-books' | 'i-punk'
	| 'i-diy' | 'i-political' | 'i-horror' | 'i-bees';

export interface Citation {
	source: CitedSource;
	label: string | null; // real-world publication/site name when known, e.g. "nps.gov"; falls back to SOURCE_LABELS[source]
	url: string | null;
}

// M38: the guides' own methodology notes — what a category came up short on,
// scoped to the 10-category system like a Recommendation. `citedFrom` is a raw
// provenance string, not Citation[]: this isn't a place being recommended, so
// the structured source enum doesn't apply — same fallback shape D19 already
// uses for the 'general knowledge' rec bucket.
export interface GuideGap {
	id: string;
	categoryNum: number;
	text: string;
	citedFrom: string | null;
}

// A guide's self-recorded caveat — a closure, a relocation, an unconfirmed
// detail, a popular misattribution. 'warning' is a live-status risk (may be
// closed/moved/wrong by the time this is read); 'info' is background. Not
// color-coded per D11 — that law reserves color for RecStatus, not note severity.
export interface GuideNote {
	id: string;
	severity: 'info' | 'warning';
	text: string;
}

export interface Recommendation {
	name: string;
	categoryNum: number;
	// D19: one URL per citation, not one shared url for the whole array — a rec can carry two
	// sources (e.g. Atlas Obscura + a local paper) linking to two different places.
	source: { type: 'guide' | 'retro-guide'; citedFrom: Citation[] };
	status: RecStatus;
	interestTags: InterestTag[];
	estCost: string;
	bestTimeOfDay: string;
	durationMin: number | null;
	rating: boolean | null; // binary would-return signal (D18); null = unrated
	note: string;
	verifiedOpen: boolean | null;
}

export interface City {
	id: string;
	name: string;
	state: string;
	tripId: TripId;
	stay: { arrive: string; depart: string; nights: number };
	coords: { lat: number; lng: number };
	elevationFt: number | null;
	// D23: `note` carries the guide's caveat on how these figures were derived and,
	// for ~11 of 15 cities, either the city-specific mechanism behind the
	// fragmentation gap (OKC annexed aggressively; Atlanta fragmented via the
	// cityhood movement; DC cannot annex at all) or a population trend that
	// qualifies it (e.g. New Orleans's post-Katrina volatility). Stored, deliberately NOT rendered — the notes are
	// authoring notes that mix real D8 content with self-reference ("consistent
	// with the caveat practice established in the … JSON files"). Rendering needs
	// an editorial pass. See design/m37-colophon.md.
	population: { cityProper: number | null; metro: number | null; note: string | null };
	vibeWord: string;
	tagline: string;
	wouldILiveHere: { verdict: string | null; note: string };
	fingerprint: Record<string, number | null>;
	recommendations: Recommendation[];
	popCulture: {
		filmedHere: { title: string; year: number | null; locationVisited: boolean | null; visitNote: string; photoId: string | null }[];
		bornHere: { name: string; relevance: string; note: string }[];
		// M38: the guide's own flag on the single most commonly assumed pop-culture
		// tie that turned out to be wrong (e.g. Napoleon Dynamite ~ Boise). Distinct
		// from statusNotes below — this one is always specifically about a popular
		// misattribution, not a general caveat.
		correctionNote: { text: string; citedFrom: string | null } | null;
	};
	favorites: Record<string, unknown>;
	fieldNotes: Record<string, unknown>;
	// D20: spend/lodging go straight into the city JSON (D16, fully public); null until the
	// card-statement CSVs (M0) land.
	spend: {
		total: number | null;
		byCategory: Record<string, number | null>;
		lodging: { name: string | null; cost: number | null; nights: number | null; note: string } | null;
	} | null;
	photos: { hero: string | null; gallery: string[]; serialSubjects: Record<string, string | null> };
	// M38: three of the guide fields M3 inventoried as unmapped (design/m3-guide-ingest.md),
	// added once judged safe to render — each describes the GUIDE's own method rather
	// than asserting anything new about the world, unlike `framing`/`analyticalThread`
	// (rejected, R20) or `district`/`address` (deferred, M5f precedent on unverified
	// neighbourhoods). See design/m38-guide-provenance-fields.md.
	sources: string[]; // guide-level bibliography (Atlas Obscura, TasteAtlas, local press, …)
	scopeDecision: string | null; // city-proper vs. metro reasoning
	honestGaps: GuideGap[]; // explicit "looked and didn't find X" entries
	statusNotes: GuideNote[]; // corrections and live-status caveats the guide records about itself
}
