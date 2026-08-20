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
	population: { cityProper: number | null; metro: number | null };
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
