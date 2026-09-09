export type TripId = 'west' | 'nola' | 'south';

export type RecStatus =
	| 'attended' | 'planned-skipped' | 'off-guide-discovery'
	| 'closed-on-arrival' | 'unverified'
	// trip-1 retroactive semantics — never visually conflate with the above
	| 'attended-anyway' | 'retroactive-recommendation';

export type CitedSource =
	| 'atlasobscura' | 'tasteatlas' | 'eater' | 'timeout'
	| 'web-search' | 'local-tip' | 'self';

export interface Citation {
	source: CitedSource;
	label: string | null; // real-world publication/site name when known, e.g. "nps.gov"; falls back to SOURCE_LABELS[source]
	url: string | null;
}

export interface Recommendation {
	name: string;
	categoryNum: number;
	// D19: one URL per citation, not one shared url for the whole array — a rec can carry two
	// sources (e.g. Atlas Obscura + a local paper) linking to two different places.
	source: { type: 'guide' | 'retro-guide'; citedFrom: Citation[] };
	status: RecStatus;
	interestTags: string[];
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
}
