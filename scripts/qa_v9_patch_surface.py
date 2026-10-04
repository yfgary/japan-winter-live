#!/usr/bin/env python3
"""Regression guard for Stage 5D/5E/5F Japan-2027 patch ownership."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ERRORS: list[str] = []

FILES = {
    "core": ASSETS / "japan2027-attraction-core-v1.js",
    "final": ASSETS / "trip-v9-final-fixes.js",
    "hotfix": ASSETS / "trip-v9-hotfix.js",
    "visit": ASSETS / "trip-v9-1-visit-fix.js",
    "repair": ASSETS / "info-icon-repair-v1.js",
}

REQUIRED = {
    "core": (
        "Japan2027AttractionCore",
        "BUTTON_SELECTOR",
        "findBest",
        "normalizeKeys",
        "stripVariationSelectors",
        "setExistingIdIfMissing",
        "ensureInfoButton",
        "dedupeInfoButtons",
    ),
    "final": (
        "__japan2027V90FinalFixes",
        "japanWinter2027_shinhotakaDay",
        "v90-shrine-info-btn",
        "#tripv2WeatherSelect [data-sh]",
    ),
    "hotfix": (
        "__japan2027V901Hotfix",
        "Japan2027AttractionCore",
        "v901TripInfoModal",
        "CORE.dedupeInfoButtons",
        "CORE.ensureInfoButton",
        "#winter-shrines",
        "setTimeout",
    ),
    "visit": (
        "__japan2027V91VisitFix",
        "Japan2027AttractionCore",
        "visit-meta-card",
        "CORE.findBest",
        "CORE.ensureInfoButton",
        "['d6','d7','d8']",
        "addMapPins",
        "setTimeout",
    ),
    "repair": (
        "__japan2027InfoIconRepairV1",
        "Japan2027AttractionCore",
        "CORE.norm",
        "CORE.findBest",
        "normalizeKeys:true",
        "iconSpace:true",
        "stripVariationSelectors:true",
        "CORE.ensureInfoButton",
        "setExistingIdIfMissing:true",
        "details.day .timeline-card h3",
        "multitrip:itineraryrendered",
        "japan2027:languagechange",
        ".tripv2-choice",
        "setTimeout",
    ),
}

texts: dict[str, str] = {}
for key, path in FILES.items():
    if not path.exists():
        ERRORS.append(f"Missing active Stage 5D/5E/5F file: {path.relative_to(ROOT)}")
        texts[key] = ""
        continue
    text = path.read_text(encoding="utf-8")
    texts[key] = text
    for marker in REQUIRED[key]:
        if marker not in text:
            ERRORS.append(f"{path.name} lost expected ownership marker: {marker}")
    if key != "core" and "new MutationObserver" in text:
        ERRORS.append(f"{path.name} reintroduced a live MutationObserver; bounded retry logic is required")

for key in ("hotfix", "visit"):
    text = texts.get(key, "")
    for forbidden in ("function norm(", "function bestInfo(", "function findAttraction(", "function removeDuplicateInfoButtons("):
        if forbidden in text:
            ERRORS.append(f"{FILES[key].name} reintroduced duplicated attraction helper: {forbidden}")

repair = texts.get("repair", "")
for forbidden in (
    "function norm(",
    "function strippedTitle(",
    "window.Japan2027EnhancementData",
    "document.createElement('button')",
):
    if forbidden in repair:
        ERRORS.append(f"info-icon-repair-v1.js reintroduced shared attraction primitive: {forbidden}")

loader = (ASSETS / "attraction-info.js").read_text(encoding="utf-8")
expected_loader_counts = {
    "japan2027-attraction-core-v1.js": 2,
    "trip-v9-final-fixes.js": 2,
    "trip-v9-hotfix.js": 2,
    "trip-v9-1-visit-fix.js": 1,
    "info-icon-repair-v1.js": 1,
}
for name, expected in expected_loader_counts.items():
    actual = loader.count(name)
    if actual != expected:
        ERRORS.append(f"Loader ownership changed for {name}: expected {expected} reference(s), found {actual}")

if loader.count("japan2027-attraction-core-v1.js?v=2") != 2:
    ERRORS.append("Stage 5F requires both Japan loader chains to use attraction core module pin v2")
if loader.count("info-icon-repair-v1.js?v=2") != 1:
    ERRORS.append("Stage 5F requires itinerary info icon repair module pin v2")

for array_name in ("itineraryScripts", "tripInfoScripts"):
    match = re.search(rf"const\s+{array_name}\s*=\s*commonHead\.concat\(\[(.*?)\]\);", loader, flags=re.S)
    if not match:
        ERRORS.append(f"Loader array missing: {array_name}")
        continue
    block = match.group(1)
    core_pos = block.find("japan2027-attraction-core-v1.js")
    hotfix_pos = block.find("trip-v9-hotfix.js")
    if core_pos < 0 or hotfix_pos < 0 or core_pos > hotfix_pos:
        ERRORS.append(f"{array_name}: shared attraction core must load before trip-v9-hotfix.js")
    if array_name == "itineraryScripts":
        visit_pos = block.find("trip-v9-1-visit-fix.js")
        repair_pos = block.find("info-icon-repair-v1.js")
        if visit_pos < 0 or core_pos > visit_pos:
            ERRORS.append("itineraryScripts: shared attraction core must load before trip-v9-1-visit-fix.js")
        if repair_pos < 0 or core_pos > repair_pos:
            ERRORS.append("itineraryScripts: shared attraction core must load before info-icon-repair-v1.js")
    elif "info-icon-repair-v1.js" in block:
        ERRORS.append("tripInfoScripts must not load itinerary-only info-icon-repair-v1.js")

button_tokens = (
    "enhance-info-btn",
    "attraction-info-btn",
    "backup-info-btn",
    "v90-shrine-info-btn",
)
print("TravelPilot Stage 5D/5E/5F patch surface QA")
for key, text in texts.items():
    present = [token for token in button_tokens if token in text]
    print(f"{FILES[key].name}: {len(text)} bytes; info-button tokens={','.join(present) or 'none'}; setTimeout={text.count('setTimeout')}")

print("Shared attraction core active:", "Japan2027AttractionCore" in texts.get("core", ""))
print("Final owns D6-D8 Shinhotaka storage:", "japanWinter2027_shinhotakaDay" in texts.get("final", ""))
print("Visit owns D6-D8 metadata cards:", "visit-meta-card" in texts.get("visit", ""))
print("Hotfix owns Trip Info modal:", "v901TripInfoModal" in texts.get("hotfix", ""))
print("Info icon repair uses shared core:", "CORE.findBest" in texts.get("repair", ""))
print(f"Errors: {len(ERRORS)}")
for item in ERRORS:
    print("ERROR:", item)
if ERRORS:
    sys.exit(1)
print("PASS")
