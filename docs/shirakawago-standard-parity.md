# Shirakawago 2027 -> TravelPilot Standard Feature Parity Matrix

Status: Round 2 inventory and migration contract.

Golden Reference: `shirakawago-shinhotaka-2027`.

Legend:

- **KEEP / STANDARD**: capability must exist in TravelPilot Standard.
- **MIGRATE DATA**: useful content exists today but is still owned by Japan HTML/legacy JS.
- **STANDARD GAP**: generic renderer/schema needs enhancement in Round 3.
- **REMOVE**: deliberately retired behaviour approved for this migration.

## Executive result

Only two behaviours are approved for removal:

1. D6-D8 automatic itinerary/day selection.
2. Weather-driven automatic selection/re-ordering of D6-D8.

Everything else below is retained and promoted to Standard where needed.

## Feature parity

| Capability | Current Japan 2027 ownership | Current generic support | Target |
|---|---|---|---|
| Trip identity, dates, timezone, country | trip.json | Yes | KEEP / STANDARD |
| Shared page routing | multi-trip context/nav | Yes | KEEP / STANDARD |
| Daily itinerary D1-Dn | itinerary.html + itinerary.json + patches | Partial | MIGRATE DATA + STANDARD |
| Day title/date/route | itinerary.json + HTML | Yes | KEEP / STANDARD |
| Timeline entries | HTML + itinerary.json + patches | Basic | MIGRATE DATA |
| Timeline descriptions | mostly HTML/legacy JS | Partial | STANDARD GAP |
| Price/ticket badges | legacy HTML/JS | Partial | STANDARD GAP |
| Duration badges | itinerary/attractions data | Yes | KEEP / STANDARD |
| Google Maps links | HTML/data | Yes | KEEP / STANDARD |
| Local/Japanese place name | legacy UI/data | Partial | STANDARD GAP |
| Day highlights / "今日重點" | legacy HTML/JS | Partial derivation | STANDARD GAP |
| Hard Cuts | itinerary/trip-info data | Yes | KEEP / STANDARD |
| Backup attractions | itinerary/attraction data | Yes | KEEP / STANDARD |
| Bonus attractions/events | legacy/data | Partial | STANDARD GAP |
| Constraints / safety notes | data + patches | Partial | STANDARD GAP |
| Day hero photo | HTML/patch JS | Limited CSS imagePlan | STANDARD GAP + MIGRATE DATA |
| Day photo gallery | HTML/patch JS | Trip-specific gallery CSS | STANDARD GAP + MIGRATE DATA |
| Photo caption | HTML/patch JS | Partial | STANDARD GAP |
| Photo credit/source | HTML/patch JS | Partial | STANDARD GAP |
| Photo zoom modal | itinerary legacy JS | No single Standard owner | STANDARD GAP |
| Attraction list/grouping | legacy catalogue + attractions.json | Yes | KEEP / STANDARD |
| Attraction score | attractions.json/legacy | Yes | KEEP / STANDARD |
| Score reason | legacy/trip config | Yes | MIGRATE DATA |
| Attraction info modal | legacy + shared renderer | Yes, but Japan content incomplete in JSON | MIGRATE DATA |
| Attraction background/history | trip-enhancement-data.js / v9 patches | Schema supported | MIGRATE DATA |
| "What to look for" / visit guidance | legacy JS | Schema supported | MIGRATE DATA |
| Winter notes | legacy JS | Schema supported | MIGRATE DATA |
| Access | legacy JS | Schema supported | MIGRATE DATA |
| Tips | legacy JS | Schema supported | MIGRATE DATA |
| Source links | legacy JS | Schema supported | MIGRATE DATA |
| Hotels list | hotels.json | Yes | KEEP / STANDARD |
| Room / meals / check-in/out | hotels.json | Yes | KEEP / STANDARD |
| Price / paid / arrival payment | hotels.json | Yes | KEEP / STANDARD |
| Cancellation | hotels.json | Yes | KEEP / STANDARD |
| Hotel parking | hotels.json | Yes | KEEP / STANDARD |
| Hotel start/end markers in itinerary | legacy patch JS | Partial | STANDARD GAP |
| Transport cards | trip-info.json | Yes | KEEP / STANDARD |
| Rental car cards | trip-info.json | Yes | KEEP / STANDARD |
| Parking cards + warnings | trip-info.json | Yes | KEEP / STANDARD |
| Train fare / budget information | legacy/Trip Info content | No reusable optional section | STANDARD GAP |
| Snow shrine / special-theme section | legacy JS | No reusable optional section | STANDARD GAP |
| Arbitrary future trip-info extra section | N/A | No | STANDARD GAP |
| Daily driving checklist | trip-info.json | Yes, state bridge still legacy | KEEP + CLEAN STATE |
| 96-item departure checklist | departure-checklist.json | Yes | KEEP / STANDARD |
| Stable checklist IDs | departure-checklist.json | Yes | KEEP / STANDARD |
| Trip-scoped checklist persistence | shared modules + Japan fallback | Partial | CLEAN STATE |
| Weather regions | weather.json | Yes | KEEP / STANDARD |
| Weather Activity Profiles | weather.json / attractions.json | Yes | KEEP / STANDARD |
| Experience + Access/Safety score | Standard weather profile | Yes | KEEP / STANDARD |
| Weather profile chips | shared weather-profile JS | Yes | KEEP / STANDARD |
| Live Cam per-day view | live.html + live-cams.json | Yes for generic trips | MIGRATE DATA |
| YouTube camera | legacy/generic | Yes | KEEP / STANDARD |
| Official source camera/link | legacy/generic | Yes | KEEP / STANDARD |
| Camera priority / "必睇" | legacy/generic data | Yes | KEEP / STANDARD |
| Day route/place links in Live Cam | legacy/generic | Yes | KEEP / STANDARD |
| Today Mode | legacy Japan overlay | Generic exists | SWITCH TO STANDARD |
| Driving Mode | legacy Japan overlay | Generic exists | SWITCH TO STANDARD |
| Per-day driving progress state | Japan keys / generic keys | Generic exists | SWITCH TO STANDARD |
| Wake lock | driving modes | Generic exists | KEEP / STANDARD |
| Winter driving capability flag | trip.json | Yes | KEEP / STANDARD |
| Offline/read-only trip data | service worker/data | Yes | KEEP / STANDARD |
| D6-D8 Shinhotaka manual selector | Japan-specific module | No | **REMOVE** |
| D6-D8 weather auto recommendation | Japan-specific module | No | **REMOVE** |
| Weather mutates/reorders itinerary | Japan-specific module | No | **REMOVE** |

## Legacy sources that must be harvested before deletion

The following are content sources, not automatically disposable code. Round 4 must migrate useful content out of them before Round 6 retirement:

- `itinerary.html`
- `trip-info.html`
- `live.html`
- `assets/trip-enhancement-data.js`
- `assets/trip-deep-info-d1-d4.js`
- `assets/trip-deep-info-d5-d9.js`
- `assets/trip-deep-info-backups.js`
- `assets/trip-enhancements-v3.js`
- `assets/trip-user-overrides.js`
- `assets/trip-v8-data.js`
- `assets/trip-v8-7-user-plan.js`
- `assets/trip-v8-8-d2-plan.js`
- `assets/trip-v8-9-user-fixes.js`
- `assets/trip-v9-final-fixes.js`
- `assets/trip-v9-1-routing.js`
- `assets/attractions-catalog.js`
- `assets/attractions-group-fix.js`
- Japan camera definitions/media templates in `live.html`

Files may also contain obsolete behaviour. Migration must copy useful data, not preserve patch mechanics.

## D6-D8 migration contract

The following fields are migration-only and must disappear from the Japan target data:

- `features.shinhotakaPlanner`
- `modules[].type = weather-day-selector`
- `moduleRefs: ["shinhotaka-weather-day-selector"]`
- `weatherRegion: "dynamic"` where it exists only for D6-D8 swapping
- `flexibleRules`
- `japanWinter2027_shinhotakaDay`
- D6-D8 choice UI
- D6-D8 weather comparison/recommendation UI

D6, D7 and D8 will become ordinary fixed days with normal `items[]`, `weatherRegion`, `hotelId`, `hardCuts`, backups and bonus data.

The exact fixed D6/D7/D8 order is itinerary content and will be locked during the data migration round; architecture must not depend on which of the three destinations is assigned to which day.

## Standard gaps to implement in Round 3

Round 3 must add reusable renderer support for these gaps before Japan switches to `generate`:

1. Rich itinerary item description, local name, price, badges and optional links.
2. Explicit day highlights/bonus/constraints without bespoke JavaScript.
3. Standard day media: hero, gallery, caption, credit and zoom.
4. Standard hotel start/end rendering from itinerary/hotel data.
5. Generic Trip Info custom sections (`cards`, `list`, `notice`, `links`).
6. Full rich-attraction fields rendered consistently from JSON.
7. Live Cam parity using `cameras[] + days[]` only.
8. Today/Driving consuming Standard itinerary/attraction/hotel/weather data only.
9. Trip-scoped state ownership with no Japan key in shared logic.
10. Standard typography ownership will be handled later; Round 3 must avoid adding new component-local fixed typography where shared tokens can be used.

## Round 4 migration completeness checks

Before any Japan legacy runtime is deleted, the migration must compare old and new content for:

- D1-D9 timeline stops
- day route and highlights
- hard cuts
- backup/bonus items
- attraction detail text and source links
- maps
- prices/durations
- hotels and payment details
- parking warnings
- Trip Info sections
- daily and departure checklists
- day photos/captions/credits
- Live Cam camera definitions/day grouping/official links
- weather regions/profiles/notes
- Today/Driving inputs

Any discrepancy other than the two approved removed behaviours blocks legacy deletion.

## Final QA contract

The final architecture QA must fail when any of the following is true:

- a shared renderer contains a concrete trip id branch
- shared HTML contains Japan trip content
- Japan 2027 uses `hydrate`
- a normal trip needs a destination-specific runtime JS file
- Japan D6-D8 selector/auto recommendation remains
- shared runtime reads/writes `japan2027*` or `japanWinter2027*`
- a generic trip requires a "remove Japan leftovers" patch
- a retained Golden Reference capability is absent from the Standard renderer/data model

