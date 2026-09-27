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
4. **Motion:** `emulate` with `prefers-reduced-motion: reduce` and confirm no animation runs. All motion must sit behind that media query.
5. **Theme:** also emulate `prefers-color-scheme: dark` if tokens changed.
6. `take_screenshot` for the user when the change is visual, and check the console messages for errors.
7. **Charts:** confirm status colours follow the colour law in CLAUDE.md. Trip-1 gold never shares a hue with trip-2 statuses.

Stop the preview server when done.
