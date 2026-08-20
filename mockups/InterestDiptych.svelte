<script lang="ts">
  /**
   * InterestDiptych — mirrored category-bar comparison for the landing page.
   *
   * Answers a different question than Fingerprint: Fingerprint asks "what shape
   * is this city's character?" (per-city, 6-axis). This asks "what did the
   * CURATION SOURCE select for?" (aggregate across a trip, one axis: interest
   * category). Trip 1 = self-curated (own Maps lists, no external sources);
   * Trip 2 = source-curated (10-category guides from Atlas Obscura / Eater /
   * Timeout / TasteAtlas). Lives once, on the landing page's verdict section.
   *
   * Data contract: pass the aggregate `comparison.trip1` / `comparison.trip2`
   * slices from the analysis JSON, plus a `places` lookup for the hover reveal
   * (top direction-targets per category, per trip — see category_places.json).
   */
  type CategoryKey =
    | "books" | "records_music" | "food" | "museums_history"
    | "coffee" | "outdoors" | "horror_occult" | "film";

  type PlaceHit = { name: string; count: number };

  type TripSide = {
    label: string;
    cityDays: number;
    uniqueTargets: number;
    perDay: number;
    mix: Partial<Record<CategoryKey, number>>;
  };

  let {
    trip1,
    trip2,
    places,
    verdict,
    disclosure = "Categories are keyword-tagged from direction-request names, not hand-curated — a rough instrument, not a precise one. Counts are a reasonable proxy for where interest went, not an exact tally.",
  }: {
    trip1: TripSide;
    trip2: TripSide;
    places: Record<"trip1" | "trip2", Partial<Record<CategoryKey, PlaceHit[]>>>;
    verdict: string;
    disclosure?: string;
  } = $props();

  const CATEGORY_ORDER: CategoryKey[] = [
    "books", "records_music", "food", "museums_history",
    "coffee", "outdoors", "horror_occult", "film",
  ];

  const CATEGORY_LABEL: Record<CategoryKey, string> = {
    books: "books",
    records_music: "records / music",
    food: "food & drink",
    museums_history: "museums & history",
    coffee: "coffee",
    outdoors: "outdoors",
    horror_occult: "horror / occult",
    film: "film",
  };

  const maxValue = $derived(
    Math.max(
      1,
      ...CATEGORY_ORDER.map((k) => trip1.mix[k] ?? 0),
      ...CATEGORY_ORDER.map((k) => trip2.mix[k] ?? 0)
    )
  );

  // hoverKey encodes both which side and which category, so the two panels
  // never cross-highlight — each stays a read of its own trip.
  let hoverKey = $state<string | null>(null);
  const hoverSide = $derived(hoverKey?.split(":")[0] as "trip1" | "trip2" | undefined);
  const hoverCat = $derived(hoverKey?.split(":")[1] as CategoryKey | undefined);

  function setHover(side: "trip1" | "trip2", cat: CategoryKey) {
    hoverKey = `${side}:${cat}`;
  }
  function clearHover() {
    hoverKey = null;
  }

  function topPlacesFor(side: "trip1" | "trip2", cat: CategoryKey): PlaceHit[] {
    return places[side]?.[cat] ?? [];
  }
</script>

<section class="diptych" aria-label="Instinct versus curation, by interest category">
  <div class="diptych-head">
    <h2>Self-curation vs. sourced curation</h2>
    <p class="sub">
      Trip 1 ran on self-made Google Maps lists. Trip 2 ran on ten-category
      guides built from external sources. Same person, same interests —
      different source of judgment. Here's what each one found.
    </p>
  </div>

  <div class="panels">
    {#each [["trip1", trip1] as const, ["trip2", trip2] as const] as [side, data]}
      <div class="panel" class:is-retro={side === "trip1"}>
        <header class="panel-head">
          <h3>{data.label}</h3>
          <p class="meta">
            {data.cityDays} city-days · {data.uniqueTargets} unique destinations · {data.perDay.toFixed(1)}/day
          </p>
        </header>

        <ul class="bars" role="list">
          {#each CATEGORY_ORDER as cat}
            {@const value = data.mix[cat] ?? 0}
            {@const pct = (value / maxValue) * 100}
            {@const active = hoverSide === side && hoverCat === cat}
            <li>
              <button
                type="button"
                class="bar-row"
                class:active
                onmouseenter={() => setHover(side, cat)}
                onmouseleave={clearHover}
                onfocus={() => setHover(side, cat)}
                onblur={clearHover}
                aria-expanded={active}
              >
                <span class="bar-label">{CATEGORY_LABEL[cat]}</span>
                <span class="bar-track">
                  <span class="bar-fill" style="width:{pct}%"></span>
                </span>
                <span class="bar-value">{value}</span>
              </button>

              {#if active}
                {@const hits = topPlacesFor(side, cat)}
                <div class="reveal" role="note">
                  {#if hits.length}
                    {#each hits as hit}
                      <span class="reveal-item">{hit.name} <b>×{hit.count}</b></span>
                    {/each}
                  {:else}
                    <span class="reveal-empty">No direction requests tagged in this category.</span>
                  {/if}
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>

  <p class="verdict"><strong>Verdict —</strong> {verdict}</p>

  <p class="disclosure">{disclosure}</p>
</section>

<style>
  .diptych {
    --t1: var(--color-muted, #8a8270);
    --t2: var(--color-burnt, #c85a00);
    max-width: 880px;
    margin-inline: auto;
  }

  .diptych-head h2 {
    font-family: var(--font-display, "Playfair Display", serif);
    font-weight: 700;
    font-size: clamp(1.6rem, 3.5vw, 2.2rem);
    margin: 0 0 0.4rem;
  }

  .diptych-head .sub {
    color: var(--color-muted, #8a8270);
    max-width: 62ch;
    margin: 0 0 1.5rem;
  }

  .panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 700px) {
    .panels {
      grid-template-columns: 1fr;
    }
  }

  .panel {
    background: var(--color-surface, #1c1a12);
    border: 1px solid var(--color-hairline, #2c2818);
    padding: 1.25rem;
  }

  .panel-head h3 {
    font-family: var(--font-display, "Playfair Display", serif);
    font-weight: 700;
    font-size: 1.25rem;
    margin: 0 0 0.15rem;
  }

  /* Trip-1 (instinct) panels take the retro treatment — same law as Waffle's
     isRetro: distinct palette, never visually conflated with trip-2 status. */
  .panel.is-retro .panel-head h3::after {
    content: " · self-curated";
    font-family: var(--font-mono, "IBM Plex Mono", monospace);
    font-size: 0.7rem;
    font-weight: 400;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--t1);
  }
  .panel:not(.is-retro) .panel-head h3::after {
    content: " · source-curated";
    font-family: var(--font-mono, "IBM Plex Mono", monospace);
    font-size: 0.7rem;
    font-weight: 400;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--t2);
  }

  .meta {
    font-family: var(--font-mono, "IBM Plex Mono", monospace);
    font-size: 0.75rem;
    color: var(--color-muted, #8a8270);
    margin: 0 0 1rem;
  }

  .bars {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bar-row {
    all: unset;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 7.5rem 1fr 2.25rem;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.4rem 0.25rem;
    cursor: pointer;
    border-radius: 2px;
  }

  .bar-row:hover,
  .bar-row.active,
  .bar-row:focus-visible {
    background: rgba(212, 168, 78, 0.08);
  }

  .bar-row:focus-visible {
    outline: 2px solid var(--color-gold, #d4a843);
    outline-offset: 2px;
  }

  .bar-label {
    font-size: 0.8rem;
    color: var(--color-muted, #8a8270);
  }

  .bar-row.active .bar-label {
    color: var(--color-ink, #e8e2d4);
  }

  .bar-track {
    background: #221e12;
    height: 0.75rem;
    display: block;
  }

  .bar-fill {
    display: block;
    height: 100%;
    background: var(--t1);
    transition: width 0.3s ease;
  }

  .panel:not(.is-retro) .bar-fill {
    background: var(--t2);
  }

  .bar-value {
    font-family: var(--font-mono, "IBM Plex Mono", monospace);
    font-size: 0.8rem;
    text-align: right;
  }

  .reveal {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 0.6rem;
    padding: 0.4rem 0.25rem 0.6rem 7.5rem;
    font-size: 0.75rem;
    color: var(--color-muted, #8a8270);
  }

  .reveal-item b {
    color: var(--color-gold, #d4a843);
    font-weight: 500;
  }

  .reveal-empty {
    font-style: italic;
  }

  .verdict {
    border: 1px solid var(--color-gold, #d4a843);
    padding: 1.1rem 1.25rem;
    margin: 1.5rem 0 0.75rem;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .verdict strong {
    color: var(--color-gold, #d4a843);
  }

  .disclosure {
    font-size: 0.75rem;
    color: var(--color-muted, #8a8270);
    max-width: 68ch;
  }

  @media (prefers-reduced-motion: reduce) {
    .bar-fill {
      transition: none;
    }
  }
</style>
