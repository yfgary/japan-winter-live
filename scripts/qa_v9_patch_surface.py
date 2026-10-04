#!/usr/bin/env python3
"""Stage 5D regression/audit guard for the active Japan-2027 v9 patch surface."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ERRORS: list[str] = []

FILES = {
    "final": ASSETS / "trip-v9-final-fixes.js",
    "hotfix": ASSETS / "trip-v9-hotfix.js",
    "visit": ASSETS / "trip-v9-1-visit-fix.js",
}

REQUIRED = {
    "final": (
        "__japan2027V90FinalFixes",
        "japanWinter2027_shinhotakaDay",
        "v90-shrine-info-btn",
        "#tripv2WeatherSelect [data-sh]",
    ),
    "hotfix": (
        "__japan2027V901Hotfix",
        "v901TripInfoModal",
        "removeDuplicateInfoButtons",
        "enhance-info-btn",
        "v90-shrine-info-btn",
        "#winter-shrines",
        "setTimeout",
    ),
    "visit": (
        "__japan2027V91VisitFix",
        "visit-meta-card",
        "enhance-info-btn",
        "v90-shrine-info-btn",
        "['d6','d7','d8']",
        "addMapPins",
        "setTimeout",
    ),
}

texts: dict[str, str] = {}
for key, path in FILES.items():
    if not path.exists():
        ERRORS.append(f"Missing active v9 patch file: {path.relative_to(ROOT)}")
        texts[key] = ""
        continue
    text = path.read_text(encoding="utf-8")
    texts[key] = text
    for marker in REQUIRED[key]:
        if marker not in text:
            ERRORS.append(f"{path.name} lost expected Stage 5D ownership marker: {marker}")
    if "new MutationObserver" in text:
        ERRORS.append(f"{path.name} reintroduced a live MutationObserver; Stage 5D expects bounded retry logic only")

loader = (ASSETS / "attraction-info.js").read_text(encoding="utf-8")
expected_loader_counts = {
    "trip-v9-final-fixes.js": 2,
    "trip-v9-hotfix.js": 2,
    "trip-v9-1-visit-fix.js": 1,
}
for name, expected in expected_loader_counts.items():
    actual = loader.count(name)
    if actual != expected:
        ERRORS.append(f"Loader ownership changed for {name}: expected {expected} reference(s), found {actual}")

button_tokens = (
    "enhance-info-btn",
    "attraction-info-btn",
    "backup-info-btn",
    "v90-shrine-info-btn",
)
print("TravelPilot Stage 5D v9 patch surface QA")
for key, text in texts.items():
    present = [token for token in button_tokens if token in text]
    print(f"{FILES[key].name}: {len(text)} bytes; info-button tokens={','.join(present) or 'none'}; setTimeout={text.count('setTimeout')}")

shared_hotfix_visit = [token for token in button_tokens if token in texts.get("hotfix", "") and token in texts.get("visit", "")]
print("Shared hotfix/visit info-button tokens:", ",".join(shared_hotfix_visit) or "none")
print("Final owns D6-D8 Shinhotaka storage:", "japanWinter2027_shinhotakaDay" in texts.get("final", ""))
print("Visit owns D6-D8 metadata cards:", "visit-meta-card" in texts.get("visit", ""))
print("Hotfix owns Trip Info modal:", "v901TripInfoModal" in texts.get("hotfix", ""))
print(f"Errors: {len(ERRORS)}")
for item in ERRORS:
    print("ERROR:", item)
if ERRORS:
    sys.exit(1)
print("PASS")
