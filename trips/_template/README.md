# Multi Trip Template

Create a new folder under `trips/<trip-id>/` and copy the example files in this folder.

The shared app uses one set of HTML pages. A new trip does **not** need another `itinerary.html` or `trip-info.html`.

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

## Trip-specific modules

Trip-specific modules remain optional and belong in that trip's own `trip.json`. They are not copied into every trip automatically. For example, the 2027 Japan trip keeps its Shinhotaka D6–D8 weather-day selector as a trip-specific module while still using the shared itinerary and Trip Info engines.
