export const CATEGORIES: Record<number, { emoji: string; name: string }> = {
	1: { emoji: '📚', name: 'Bookstores' },
	2: { emoji: '🎵', name: 'Record Stores' },
	3: { emoji: '☕', name: 'Coffee' },
	4: { emoji: '🥐', name: 'Pastry & Bakeries' },
	5: { emoji: '🍽️', name: 'Unique Dishes' },
	6: { emoji: '📦', name: 'Mailable Gifts' },
	7: { emoji: '👁️', name: 'Sights & Oddities' },
	8: { emoji: '🎸', name: 'Punk / Indie Venues' },
	9: { emoji: '🧲', name: 'Souvenirs' },
	10: { emoji: '🔌', name: 'DIY Electronics / Maker' }
};

export const SOURCE_LABELS: Record<string, string> = {
	atlasobscura: 'Atlas Obscura',
	tasteatlas: 'TasteAtlas',
	eater: 'Eater',
	timeout: 'Time Out',
	'web-search': 'Web',
	'local-tip': 'Local tip',
	self: 'Found it myself'
};

// Trip-2 (sourced-curated) and trip-1 (retro) statuses render distinctly — schema rule.
// Labels for the two trip-1 values and for `unverified` state PROVENANCE, never an
// outcome (D3 as redefined in M3.5): nothing here may imply "didn't go" where the
// data only says "no record either way". 'Hit by instinct' was retired with the
// framing it came from (D22 / R17).
export const STATUS_META: Record<string, { label: string; cls: string }> = {
	attended:                     { label: 'Attended',      cls: 'st-attended' },
	'planned-skipped':            { label: 'Skipped',       cls: 'st-skipped' },
	'off-guide-discovery':        { label: 'Off-guide find', cls: 'st-offguide' },
	'closed-on-arrival':          { label: 'Closed',        cls: 'st-closed' },
	unverified:                   { label: 'Visit unknown', cls: 'st-unknown' },
	'attended-anyway':            { label: 'Visited',       cls: 'st-visited' },
	'retroactive-recommendation': { label: 'Retro pick',    cls: 'st-retro' }
};
