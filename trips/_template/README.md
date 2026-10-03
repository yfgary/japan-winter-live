# Multi Trip Template

Create a new folder under `trips/<trip-id>/` and copy the example files in this folder.

For the itinerary page, set `renderers.itinerary.mode` to `generate` in `trip.json`. The shared `itinerary.html` page will then build D1–Dn directly from `itinerary.json`; no extra HTML page is required.

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

Trip-specific modules remain optional and belong in that trip's own `trip.json`. They are not copied into every trip automatically.
