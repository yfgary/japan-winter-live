# TravelPilot legacy loader inventory

Stage 5A records what `assets/attraction-info.js` currently owns. This is an audit map, not permission to delete files without runtime equivalence checks.

## Canonical shared layer

Loaded for both Japan 2027 and generic trips:

- `multi-trip-context-v1.js`
- `multi-trip-data-v1.js`
- `multi-trip-nav-v1.js`

Generic trips then stay on the `multi-trip-*` renderers/modes/weather/checklist stack. Stage 5A QA blocks Japan-only v8/v9 dependencies from leaking into generic trips.

## Japan 2027 legacy-active layer

These are still intentionally loaded for the Shirakawago / Shinhotaka 2027 itinerary or trip-info pages and must be treated as active until a later migration proves feature parity:

- base/shell: `trip-core-v1.js`, `site-shell-v7.js`
- weather/navigation: `weather-suitability-v1.js`, `d6-d8-weather-decision-v1.js`, `nav-enhancements-v1.js`
- enhancement data/content: `trip-enhancement-data.js`, `trip-user-overrides.js`, `trip-deep-info-d1-d4.js`, `trip-deep-info-d5-d9.js`, `trip-deep-info-backups.js`
- v8 chain: `trip-v8-data.js`, `trip-v8-1-overrides.js`, `trip-v8-ui.js`, `trip-v8-7-user-plan.js`, `trip-v8-8-d2-plan.js`, `trip-v8-9-user-fixes.js`
- v9 chain: `trip-v9-final-fixes.js`, `trip-v9-hotfix.js`, `trip-v9-1-routing.js`, `trip-v9-1-visit-fix.js`
- Japan-specific mode/navigation helpers: `travel-mode-v1.js`, `travel-mode-nav-fix-v1.js`, `driving-mode-v1.js`

## Stage 5A change

`itinerary.html` previously loaded `trip-v9-final-fixes.js` directly **and** `attraction-info.js` loaded the same file again. The JS file has an execution guard, but the second request and dual ownership were unnecessary. Stage 5A removes the direct HTML load; `attraction-info.js` is now the single owner.

## Stage 5B candidates for consolidation audit

These names reflect patch-era layering and are good candidates to inspect next, but they are **not declared dead code**:

- `trip-v9-hotfix.js`
- `trip-v9-1-visit-fix.js`
- `trip-v8-9-user-fixes.js`
- `trip-user-overrides.js`
- `nav-enhancements-v1.js`
- `site-shell-v7.js`
- `trip-v9-final-fixes.js`

For each candidate, Stage 5B should map exported globals / DOM mutations / storage keys / event listeners to the current canonical modules, add a regression test, and only then remove or merge it.

## Assets not loaded by the current `attraction-info.js` chain

Files such as `app-v8-7-data.js`, `app-v8-7-ui.js`, and `trip-enhancements-v2.js` exist in `assets/` but are not part of the current loader arrays. That alone does **not** prove they are repo-wide dead; a repository-wide reference check is required before deletion.
