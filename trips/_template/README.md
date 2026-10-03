# Multi Trip Template

Create a new folder under `trips/<trip-id>/` and copy the example files in this folder.

The shared app uses one set of HTML pages. A new trip does **not** need another `itinerary.html`, `trip-info.html`, `attractions.html` or `live.html`.

## Itinerary

Set `renderers.itinerary.mode` to `generate` in `trip.json`. The shared `itinerary.html` page will build D1–Dn directly from `itinerary.json`.

Core itinerary fields:

- `id`: `d1`, `d2`, ...
- `day`: day number
- `date`: `YYYY-MM-DD`
- `title`: day title
- `route`: summary route
- `weatherRegion`: region id used by the weather layer
- `driving`: whether the day is a driving day
- `items[]`: timeline entries with `time`, `type`, `title`, optional `map`, `note`, and `durationMinutes`
- `hardCuts[]`: optional non-negotiable times

## Trip Info

Set `renderers.tripInfo.mode` to `generate` and add `tripInfo: "trip-info.json"` under `dataFiles`.

The shared `trip-info.html` page can then build these sections from JSON:

- Overview / quick navigation
- Transport
- Car / driving notes
- Hotels (resolved from `hotels.json` by `hotelId`)
- Important parking points
- Hard Cuts
- Weather / trip-specific decision notes
- Checklist
- Emergency information

Only include sections that the trip needs. Missing sections are hidden automatically.

## Attractions

Set `renderers.attractions.mode` to `generate` and add `attractions: "attractions.json"` under `dataFiles`.

The shared `attractions.html` page can then build attraction groups and cards from JSON. Core fields:

- `id`: stable attraction id
- `name`: display name
- `location`: grouping / area name
- `day`: D1, D2, D6–D8, etc.
- `dayNote`: optional small day note
- `status`: `main` or `backup`
- `score`: optional 0–10 score
- `map`: Google Maps query
- `duration`: optional visit duration
- `weatherProfiles`: one or more Weather Activity Profile ids
- `summary`: short card text
- `info`, `history`, `winter`, `tips`: optional content shown by the shared ⓘ modal

For the 2027 Japan trip, attractions run in `hydrate` mode: `attractions.json` controls day/status/score/map metadata while the existing rich Japan-specific attraction cards and full ⓘ descriptions are preserved during migration.

## Live Cam

Set `renderers.liveCam.mode` to `generate` and add `liveCams: "live-cams.json"` under `dataFiles`.

The shared `live.html` page can then generate D1–Dn Live Cam sections from JSON. `live-cams.json` supports:

- `cameras[]`: reusable camera definitions
- `type`: `youtube`, `image`, or `link`
- `videoId` / `imageUrl` / `sourceUrl`
- `priority`: `must`, `ref`, or `backup`
- `tags`: e.g. road, attraction, snow
- `days[]`: per-day title, route, places, camera ids and official links

For the 2027 Japan trip, Live Cam runs in `hydrate` mode. Existing tested media templates are kept, but D2 and D6–D8 camera-group selection now comes from `live-cams.json` and follows the same flexible Shinhotaka-day rules as `itinerary.json`. A future trip in `generate` mode does not load the Japan-only Shinhotaka logic.

## Weather

Set `renderers.weather.mode` to `generate`, `renderers.weather.profileStandard` to `v1`, and add `weather: "weather.json"` under `dataFiles`.

The shared weather engine reads `weather.json` and builds the same 5-day forecast panel for every trip. Core fields:

- `regions`: region id → name, label, type, latitude and longitude
- `dayRegions`: D1–Dn → region id
- `dynamicRegionRules`: optional mapping for flexible-day modules
- `activityProfiles`: one or more activity-specific weather profiles for each region; optional `weight` controls importance
- `scoreNote`: optional practical note

### Weather Activity Profile Standard v1

The /10 score is split into **Experience** and **Access / Safety**. The final score is then calculated with a safety cap: bad access / road / sea conditions cannot be hidden by a high indoor or scenic experience score.

Available profile ids:

- `indoor`, `semi_indoor`, `city_walk`, `historic_outdoor`, `outdoor_market`, `outlet_open_air`, `theme_park`
- `mountain_view`, `ropeway_mountain`, `hiking`, `snow_walk`, `ski_snow`, `village_scenic`, `waterfall_river`, `cave`, `wildlife_outdoor`, `road_trip`
- `coastal_scenic`, `beach`, `boat_cruise`, `open_sea`, `ferry`, `snorkel_dive`, `surf_water_sport`, `lake_activity`
- `cycling`, `night_view`, `festival_outdoor`, `outdoor_onsen`, `garden_park`, `stargazing`, `camping`, `golf`

Examples:

- Indoor mall: `indoor` — rain/visibility matter little to the experience, but transport/access still matters.
- Mountain ropeway: `ropeway_mountain` + `mountain_view` — wind, visibility and cloud are heavily weighted; official operation status still overrides the score.
- Shirakawa-go: `village_scenic` + `road_trip` — light snow can improve the scenery while heavy snow can reduce road/access safety.
- Cave: `cave` + `road_trip` — the cave experience is weather-resistant but the mountain-road approach can cap the final score.
- Beach/open sea: `beach`, `open_sea`, `boat_cruise`, etc. — marine data such as wave height / swell is required for a full marine-safety score. If marine data is missing, the UI marks the result as preliminary rather than treating land weather as enough.

Weather selection is stored per trip, so changing the selected region in one trip does not affect another trip. The engine uses the trip's own timezone and dates instead of Japan-specific hard-coded dates.

For the 2027 Japan trip, `weather.json` owns all nine regions, D1–D9 mapping, D6–D8 dynamic mapping and region Activity Profiles. Individual attractions also carry `weatherProfiles` so Today Mode / Driving Mode can reuse the same standard later. The Shinhotaka D6–D8 decision module remains a Japan-only optional module layered on top of the shared weather engine.

## Trip-specific modules

Trip-specific modules remain optional and belong in that trip's own `trip.json`. They are not copied into every trip automatically. For example, the 2027 Japan trip keeps its Shinhotaka D6–D8 weather-day selector as a trip-specific module while still using the shared itinerary, Trip Info, Attractions, Live Cam and Weather engines.
