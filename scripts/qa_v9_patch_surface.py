#!/usr/bin/env python3
"""Regression guard for Stage 5D/5E Japan-2027 v9 patch ownership."""
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
}

REQUIRED = {
    "core": (
        "Japan2027AttractionCore",
        "BUTTON_SELECTOR",
        "findBest",
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
}

texts: dict[str, str] = {}
for key, path in FILES.items():
    if not path.exists():
        ERRORS.append(f"Missing active Stage 5D/5E file: {path.relative_to(ROOT)}")
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

loader = (ASSETS / "attraction-info.js").read_text(encoding="utf-8")
expected_loader_counts = {
    "japan2027-attraction-core-v1.js": 2,
    "trip-v9-final-fixes.js": 2,
    "trip-v9-hotfix.js": 2,
    "trip-v9-1-visit-fix.js": 1,
}
for name, expected in expected_loader_counts.items():
    actual = loader.count(name)
    if actual != expected:
        ERRORS.append(f"Loader ownership changed for {name}: expected {expected} reference(s), found {actual}")

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
        if visit_pos < 0 or core_pos > visit_pos:
            ERRORS.append("itineraryScripts: shared attraction core must load before trip-v9-1-visit-fix.js")

button_tokens = (
    "enhance-info-btn",
    "attraction-info-btn",
    "backup-info-btn",
    "v90-shrine-info-btn",
)
print("TravelPilot Stage 5D/5E v9 patch surface QA")
for key, text in texts.items():
    present = [token for token in button_tokens if token in text]
    print(f"{FILES[key].name}: {len(text)} bytes; info-button tokens={','.join(present) or 'none'}; setTimeout={text.count('setTimeout')}")

print("Shared attraction core active:", "Japan2027AttractionCore" in texts.get("core", ""))
print("Final owns D6-D8 Shinhotaka storage:", "japanWinter2027_shinhotakaDay" in texts.get("final", ""))
print("Visit owns D6-D8 metadata cards:", "visit-meta-card" in texts.get("visit", ""))
print("Hotfix owns Trip Info modal:", "v901TripInfoModal" in texts.get("hotfix", ""))
print(f"Errors: {len(ERRORS)}")
for item in ERRORS:
    print("ERROR:", item)
if ERRORS:
    sys.exit(1)
print("PASS")
