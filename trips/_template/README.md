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

Set `renderers.weather.mode` to `generate` and add `weather: "weather.json"` under `dataFiles`.

The shared weather engine reads `weather.json` and builds the same 5-day forecast panel for every trip. Core fields:

- `regions`: region id → name, label, type, latitude and longitude
- `dayRegions`: D1–Dn → region id
- `dynamicRegionRules`: optional mapping for flexible-day modules
- `scoreProfiles`: optional visibility/cloud/gust/precipitation/snow weights by region type
- `scoreNote`: optional per-region practical note shown under the /10 score

Weather selection is stored per trip, so changing the selected region in one trip does not affect another trip. The engine uses the trip's own timezone and dates instead of Japan-specific hard-coded dates.

For the 2027 Japan trip, `weather.json` now owns all nine regions, D1–D9 mapping, D6–D8 dynamic region mapping, coordinates and suitability weights. The Shinhotaka D6–D8 decision module remains a Japan-only optional module layered on top of the shared weather engine.

## Trip-specific modules

Trip-specific modules remain optional and belong in that trip's own `trip.json`. They are not copied into every trip automatically. For example, the 2027 Japan trip keeps its Shinhotaka D6–D8 weather-day selector as a trip-specific module while still using the shared itinerary, Trip Info, Attractions, Live Cam and Weather engines.
