#!/usr/bin/env python3
"""Stage 5I audit guard for replacing visit-fix timers with renderer events later."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ERRORS: list[str] = []

loader = (ASSETS / "attraction-info.js").read_text(encoding="utf-8")
renderer = (ASSETS / "multi-trip-itinerary-renderer-v1.js").read_text(encoding="utf-8")
visit = (ASSETS / "trip-v9-1-visit-fix.js").read_text(encoding="utf-8")
user_plan = (ASSETS / "trip-v8-7-user-plan.js").read_text(encoding="utf-8")
repair = (ASSETS / "info-icon-repair-v1.js").read_text(encoding="utf-8")

# Loader ordering matters: visit-fix can subscribe before the renderer begins emitting.
match = re.search(r"const\s+itineraryScripts\s*=\s*commonHead\.concat\(\[(.*?)\]\);", loader, flags=re.S)
if not match:
    ERRORS.append("itineraryScripts loader block missing")
else:
    block = match.group(1)
    visit_pos = block.find("trip-v9-1-visit-fix.js")
    renderer_pos = block.find("multi-trip-itinerary-renderer-v1.js")
    if visit_pos < 0 or renderer_pos < 0:
        ERRORS.append("visit-fix or itinerary renderer missing from Japan itinerary loader")
    elif visit_pos > renderer_pos:
        ERRORS.append("visit-fix must load before itinerary renderer for a future event subscription")

renderer_markers = (
    "new CustomEvent('multitrip:itineraryrendered'",
    "detail:{mode:m,count,tripId:",
    "[0,350,900,1800].forEach(t=>setTimeout(render,t))",
)
for marker in renderer_markers:
    if marker not in renderer:
        ERRORS.append(f"renderer event contract changed: missing {marker}")

visit_markers = (
    "[1650,2300].forEach(t=>setTimeout(decorate,t))",
    "function decorate()",
    "['d6','d7','d8']",
    "visit-meta-card",
    "addMapPins",
)
for marker in visit_markers:
    if marker not in visit:
        ERRORS.append(f"visit-fix audit baseline changed: missing {marker}")

# Stage 5I is audit-only: conversion is intentionally deferred.
if "multitrip:itineraryrendered" in visit:
    ERRORS.append("Stage 5I is audit-only; visit-fix event conversion should be a separate runtime stage")

# Known legacy patches finish before the renderer's last hydrate event at 1800 ms.
for marker in (
    "setTimeout(runDomPatches,80)",
    "setTimeout(runDomPatches,400)",
    "setTimeout(runDomPatches,300)",
):
    if marker not in user_plan:
        ERRORS.append(f"user-plan timing evidence changed: missing {marker}")

# Existing info-icon repair demonstrates that the renderer event is already a live integration surface.
if "multitrip:itineraryrendered" not in repair:
    ERRORS.append("info-icon repair no longer listens to multitrip:itineraryrendered")

print("TravelPilot Stage 5I visit/render event audit QA")
print("Visit loads before renderer:", bool(match and match.group(1).find('trip-v9-1-visit-fix.js') < match.group(1).find('multi-trip-itinerary-renderer-v1.js')))
print("Renderer emits itinerary event:", "multitrip:itineraryrendered" in renderer)
print("Renderer hydrate retries include 1800 ms:", "[0,350,900,1800]" in renderer)
print("Visit still uses 1650/2300 ms baseline:", "[1650,2300]" in visit)
print("Info-icon repair already consumes renderer event:", "multitrip:itineraryrendered" in repair)
print(f"Errors: {len(ERRORS)}")
for item in ERRORS:
    print("ERROR:", item)
if ERRORS:
    sys.exit(1)
print("PASS")
