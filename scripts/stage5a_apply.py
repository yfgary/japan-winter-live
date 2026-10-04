#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = "10.13.1"
NEW = "10.13.2"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding="utf-8")


def replace_once(path: str, old: str, new: str) -> None:
    text = read(path)
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one occurrence of {old!r}, found {count}")
    write(path, text.replace(old, new, 1))


# 1) Remove the duplicate direct load. attraction-info.js already owns this dependency.
replace_once(
    "itinerary.html",
    '\n<script src="assets/trip-v9-final-fixes.js?v=1"></script>\n',
    "\n",
)

# 2) Coordinated release/cache pins.
replace_once(
    "assets/multi-trip-context-v1.js",
    "const APP_VERSION='v10.13.1'",
    "const APP_VERSION='v10.13.2'",
)
replace_once(
    "assets/attraction-info.js",
    "assets/multi-trip-context-v1.js?v=10.13.1",
    "assets/multi-trip-context-v1.js?v=10.13.2",
)

for path in ("index.html", "manifest.webmanifest", "sw.js"):
    text = read(path)
    if OLD not in text:
        raise SystemExit(f"{path}: current release pin {OLD} not found")
    write(path, text.replace(OLD, NEW))

meta_path = ROOT / "version.json"
meta = json.loads(meta_path.read_text(encoding="utf-8"))
meta.update({
    "version": "v10.13.2",
    "build": "2026-10-05.72",
    "updated": "2026-10-05T02:03:00+08:00",
    "notes": "Stage 5A loader audit: remove the duplicate direct trip-v9-final-fixes load, add dependency/duplicate/reference QA, document the current legacy loader inventory, and keep Japan legacy vs generic-trip dependency boundaries explicit."
})
meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

replace_once(
    "scripts/qa_release.py",
    'previous = "10.13.0"',
    'previous = "10.13.1"',
)

# 3) Loader regression QA.
qa_loader = r'''#!/usr/bin/env python3
"""Dependency and duplicate-load regression QA for TravelPilot trip loaders."""
from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []


def error(message: str) -> None:
    ERRORS.append(message)


def read(path: str) -> str:
    p = ROOT / path
    if not p.is_file():
        error(f"Missing required file: {path}")
        return ""
    return p.read_text(encoding="utf-8")


def logical(src: str) -> str:
    return src.split("?", 1)[0]


def quoted_assets(block: str) -> list[str]:
    return re.findall(r"['\"](assets/[^'\"]+\.js(?:\?[^'\"]*)?)['\"]", block)


def array_block(source: str, name: str, concat: bool = False) -> list[str]:
    if concat:
        pattern = rf"const\s+{re.escape(name)}\s*=\s*commonHead\.concat\(\[(.*?)\]\);"
    else:
        pattern = rf"const\s+{re.escape(name)}\s*=\s*\[(.*?)\];"
    match = re.search(pattern, source, flags=re.S)
    if not match:
        error(f"Loader array not found: {name}")
        return []
    return quoted_assets(match.group(1))


def check_unique(label: str, values: list[str]) -> None:
    counts = Counter(logical(v) for v in values)
    for path, count in sorted(counts.items()):
        if count > 1:
            error(f"{label}: duplicate dependency {path} x{count}")


def check_exists(label: str, values: list[str]) -> None:
    for src in values:
        path = logical(src)
        if not (ROOT / path).is_file():
            error(f"{label}: missing referenced asset {path}")


loader = read("assets/attraction-info.js")
common = array_block(loader, "commonHead")
itinerary_extra = array_block(loader, "itineraryScripts", concat=True)
trip_info_extra = array_block(loader, "tripInfoScripts", concat=True)
generic_itinerary_extra = array_block(loader, "genericItineraryScripts", concat=True)
generic_trip_info_extra = array_block(loader, "genericTripInfoScripts", concat=True)

sets = {
    "Japan itinerary": common + itinerary_extra,
    "Japan trip info": common + trip_info_extra,
    "Generic itinerary": common + generic_itinerary_extra,
    "Generic trip info": common + generic_trip_info_extra,
}

for label, values in sets.items():
    check_unique(label, values)
    check_exists(label, values)

expected_common = {
    "assets/multi-trip-context-v1.js",
    "assets/multi-trip-data-v1.js",
    "assets/multi-trip-nav-v1.js",
}
if {logical(v) for v in common} != expected_common:
    error("commonHead changed unexpectedly; keep shared trip context/data/nav ownership explicit")

legacy_markers = (
    "assets/trip-v8",
    "assets/trip-v9",
    "assets/trip-enhancement",
    "assets/trip-user-overrides.js",
    "assets/trip-deep-info",
    "assets/site-shell-v7.js",
    "assets/travel-mode-v1.js",
    "assets/travel-mode-nav-fix-v1.js",
    "assets/driving-mode-v1.js",
    "assets/nav-enhancements-v1.js",
    "assets/d6-d8-weather-decision-v1.js",
)
for label in ("Generic itinerary", "Generic trip info"):
    for src in sets[label]:
        path = logical(src)
        if path.startswith(legacy_markers):
            error(f"{label}: Japan legacy dependency leaked into generic trips: {path}")

script_src_re = re.compile(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\'][^>]*>', re.I)
for page, loader_set in (
    ("itinerary.html", sets["Japan itinerary"]),
    ("trip-info.html", sets["Japan trip info"]),
):
    direct = [s for s in script_src_re.findall(read(page)) if s.startswith("assets/")]
    direct_logical = [logical(s) for s in direct]
    check_unique(f"{page} direct scripts", direct)
    effective = {logical(s) for s in loader_set}
    for path in direct_logical:
        if path == "assets/attraction-info.js":
            continue
        if path in effective:
            error(f"{page}: direct script duplicates attraction-info loader dependency: {path}")

if "assets/trip-v9-final-fixes.js" in [logical(s) for s in script_src_re.findall(read("itinerary.html"))]:
    error("itinerary.html still directly loads trip-v9-final-fixes.js")

print("TravelPilot loader dependency QA")
for label, values in sets.items():
    print(f"{label}: {len(values)} dependencies")
print(f"Errors: {len(ERRORS)}")
for item in ERRORS:
    print(f"ERROR: {item}")
if ERRORS:
    sys.exit(1)
print("PASS")
'''
write("scripts/qa_loader.py", qa_loader)

# 4) Human-readable inventory for the next cleanup stage.
(ROOT / "docs").mkdir(exist_ok=True)
inventory = '''# TravelPilot legacy loader inventory

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
'''
write("docs/legacy-loader-inventory.md", inventory)
