# TravelPilot Standard Multi-Trip Architecture v1

Status: Round 2 architecture contract. No runtime migration is performed in this round.

## Goal

The 2027 Shirakawago / Shinhotaka trip is the Golden Reference Trip for TravelPilot Standard.

The rule is not "reduce the Japan trip until it fits the current generic renderer". The rule is:

> Any useful capability present in the Golden Reference Trip becomes a reusable TravelPilot Standard capability. Ordinary trips opt into those capabilities with data/config only.

The only deliberately retired Golden Reference behaviours are:

1. D6-D8 automatic day selection / itinerary swapping.
2. Weather-driven automatic selection of which D6-D8 day should be Shinhotaka.

Weather, Live Cam, weather scoring and suitability information remain. The app may inform the user, but Standard v1 must not automatically rewrite the itinerary.

## Architecture rules

1. Ordinary trips must be onboarded by adding files under `trips/<trip-id>/` plus a registry entry.
2. Ordinary trip onboarding must not require edits to `assets/*.js`, shared HTML, Service Worker code, or QA scripts.
3. Shared HTML pages are empty/generic shells. They must not contain Matsumoto, Shirakawago, Shinhotaka, D6-D8, Bangkok, Hokkaido or any other trip content.
4. Shared renderers must not branch on a concrete trip id.
5. All ordinary trip renderers use `generate`; `hydrate` is a migration-only state and is not part of the target architecture.
6. Reusable functionality belongs in Standard renderers/modules, not in files named after one destination.
7. Optional capability does not mean separate architecture. A trip may disable Live Cam, Driving Mode, winter driving, checklist, etc. with feature flags.
8. User state is trip-scoped. New state keys must follow `multiTrip.<feature>.<trip-id>[.<subkey>]`.
9. Legacy Japan storage keys may be read only by a bounded migration step, then must be retired.
10. Trip-specific CSS is allowed only for media/art direction that cannot be represented by Standard media data. It must never contain trip logic.
11. New reusable capabilities discovered in future trips should be added to Standard rather than implemented as `<destination>-fix.js`, `v2`, `hotfix`, etc.
12. No legacy file is deleted until its useful content has been migrated and parity checked.

## Standard trip package

A full-featured trip may contain:

```
trips/<trip-id>/
  trip.json
  itinerary.json
  trip-info.json
  hotels.json
  attractions.json
  live-cams.json
  weather.json
  departure-checklist.json
```

Not every trip needs every feature. `trip.json` declares which features are active.

## trip.json target contract

The current feature flags remain the Standard capability switches:

- itinerary
- tripInfo
- attractions
- liveCam
- todayMode
- drivingMode
- weather
- weatherScore
- weatherActivityProfiles
- packingChecklist
- winterDriving

Target renderer contract:

```json
{
  "renderers": {
    "itinerary": {"mode": "generate", "source": "itinerary"},
    "tripInfo": {"mode": "generate", "source": "tripInfo"},
    "attractions": {"mode": "generate", "source": "attractions"},
    "liveCam": {"mode": "generate", "source": "liveCams"},
    "weather": {"mode": "generate", "source": "weather", "profileStandard": "v1"},
    "todayMode": {"mode": "generate", "source": "itinerary"},
    "drivingMode": {"mode": "generate", "source": "itinerary"}
  }
}
```

A normal trip has `modules: []`. The Shinhotaka day-selector module is retired.

## itinerary.json target schema

Standard must support the full Golden Reference day presentation, not only a short timeline.

Day-level fields:

- `id`, `day`, `date`, `title`, `route`
- `weatherRegion`
- `driving`
- `hotelId`
- `hardCuts[]`
- `backups[]`
- `bonus[]`
- `constraints[]` for human-readable non-dynamic warnings
- `highlights[]` for explicit "今日重點" cards when automatic derivation is insufficient
- `media` for hero/gallery photos
- `items[]`

Standard itinerary item fields:

- `time`
- `type`
- `title`
- `localName`
- `description` / `note`
- `map`
- `attractionId`
- `hotelId`
- `parkingId`
- `durationMinutes`
- `price`
- `badges[]`
- `hardCut`
- `links[]`

Target media shape:

```json
{
  "media": {
    "hero": {
      "src": "assets/images/example.jpg",
      "alt": "景點",
      "caption": "景點 caption",
      "credit": {"label": "Author / licence", "url": "https://..."}
    },
    "gallery": [
      {
        "src": "assets/images/example-2.jpg",
        "alt": "景點",
        "caption": "第二張圖",
        "credit": {"label": "Author / licence", "url": "https://..."}
      }
    ]
  }
}
```

Photo zoom is a Standard UI behaviour and is not implemented per trip.

## attractions.json target schema

Standard rich attraction detail must support:

- `id`, `name`, `localName`, `location`
- `day`, `dayNote`, `status`
- `score`, `scoreReason`
- `map`, `durationMinutes` or `duration`
- `weatherProfiles[]`
- `summary`
- `info`
- `history`
- `visit`
- `highlights[]`
- `access`
- `winter`
- `tips`
- `sources[]`
- optional `media`

The info modal, source links, map link, score reason and weather profile are all Standard capabilities.

## trip-info.json target schema

Existing reusable sections remain:

- overview
- transport
- car
- hotelStays
- parking
- hardCuts
- weather
- checklist
- emergency

Standard v1 adds a reusable optional-section contract so rich Japan content does not need Japan JS:

```json
{
  "customSections": [
    {
      "id": "train-fares",
      "title": "🚆 火車票價預算",
      "desc": "optional description",
      "type": "cards",
      "cards": []
    }
  ]
}
```

Required Standard custom-section types for the Golden Reference migration:

- `cards`
- `list`
- `notice`
- `links`

This covers train fare/budget information, snow-shrine bonuses, special winter notes, or future destination-specific information without destination-specific code.

Hotel payment, cancellation and parking detail remain in `hotels.json` and are rendered by Standard Trip Info.

## live-cams.json target schema

The Hokkaido data model is the baseline because it is already generic.

Standard supports:

- `cameras[]`
  - id
  - title
  - type: youtube / image / official / link
  - videoId / imageUrl / sourceUrl
  - sourceLabel
  - priority
  - desc
  - map
  - tags[]
- `days[]`
  - id
  - nav / label / date
  - title / desc / route
  - cameras[]
  - places[]
  - officialLinks[]

Japan 2027 must migrate from legacy HTML camera templates to this same model.

## weather.json target schema

Standard retains:

- regions
- coordinates
- dayRegions
- score profiles
- activity profiles
- trip timezone
- weather suitability scores
- road/access safety contribution
- warnings/notes

For the Golden Reference, D6-D8 become fixed `dayRegions` values. `dynamicRegionRules` used only by the removed day-selector are retired.

Weather may recommend caution or show suitability; it must not mutate itinerary days.

## Today Mode / Driving Mode

Both are Standard derived views.

They read from:

- itinerary.json
- attractions.json
- hotels.json
- weather.json

They must not need Japan-specific core state.

Today Mode Standard responsibilities include:

- trip-local current day
- next/current stop
- hard cut
- hotel/end point
- map links
- weather/suitability
- itinerary/live links gated by enabled features

Driving Mode Standard responsibilities include:

- per-trip/per-day stop index
- Google Maps navigation
- next parking point
- hard cut
- hotel/end point
- weather and road/access suitability
- wake lock
- feature-gated links

## Checklist state

Both departure and daily checklists are Standard.

Data lives in Trip JSON. State is stored by stable item id using a trip-scoped key. No future renderer may contain `japanWinter2027*` or `japan2027*` state ownership.

## Reference-trip acceptance rule

Japan 2027 is Standard only when it renders all retained functionality with Standard data/renderers and no Japan-specific runtime dependency.

The expected end state is:

- all Japan renderers = generate
- modules = []
- no D6-D8 selection UI
- no weather-driven itinerary mutation
- no `if (tripId === 'shirakawago-shinhotaka-2027')` in shared runtime
- no Japan content in shared HTML shells
- no Japan legacy cleanup pass required by generic trips
- no useful content lost compared with the pre-migration Golden Reference

