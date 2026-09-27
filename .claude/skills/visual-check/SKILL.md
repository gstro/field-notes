---
name: visual-check
description: Verify a UI change in a real browser via the chrome-devtools MCP (screenshots, 390px mobile layout, horizontal-overflow measurement, reduced-motion, dark mode, console errors). Use after changing components, CSS, charts, or layout.
---

# Visual check

1. In `setup/roadtrip/`, run `npm run build`, then start `npm run preview -- --port 4173` in the background. Use `npm run dev` only when checking hot-reload behaviour.
2. With the `chrome-devtools` MCP, `new_page` → `http://localhost:4173/<route>`. Use clean URLs (`/city/boise-id`), never `.html` paths, which 404 after hydration.
3. **Layout at mobile width:** `resize_page` to 390×844, then `evaluate_script`:
   `() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })`.
   `sw > cw` means horizontal overflow. A screenshot alone is **not** evidence about layout (M1.1 lesson).
4. **Motion:** the MCP's `emulate` tool can't set `prefers-reduced-motion` (it only handles colour scheme, viewport, CPU/network and geolocation), so audit the stylesheets instead. The house pattern is an `@media (prefers-reduced-motion: reduce) { … animation: none }` override for every animated selector. `evaluate_script`:
   ```js
   () => {
     const animated = [], guarded = [];
     const walk = (rules, inReduce) => { for (const r of rules) {
       if (r instanceof CSSMediaRule) walk(r.cssRules, inReduce || /prefers-reduced-motion:\s*reduce/.test(r.conditionText));
       else if (r instanceof CSSStyleRule) {
         const name = r.style.animationName;
         if (inReduce && name === 'none') guarded.push(r.selectorText);
         else if (!inReduce && name && name !== 'none') animated.push(r.selectorText);
       } } };
     for (const s of document.styleSheets) try { walk(s.cssRules, false); } catch {}
     return { animated, guarded };
   }
   ```
   Every selector in `animated` needs a matching entry in `guarded`. Short colour or border `transition`s on hover aren't motion and don't need a guard.
5. **Theme:** if tokens changed, also run `emulate` with a `colorScheme` of `dark` and then `light`.
6. `take_screenshot` for the user when the change is visual, and check the console messages for errors.
7. **Charts:** confirm status colours follow the colour law in CLAUDE.md. Trip-1 gold never shares a hue with trip-2 statuses.

Stop the preview server when done.
