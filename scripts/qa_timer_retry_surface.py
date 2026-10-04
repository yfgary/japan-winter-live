#!/usr/bin/env python3
"""Regression guard for the Stage 5G-5L bounded timer/retry surface."""
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
    "repair": ASSETS / "info-icon-repair-v1.js",
}

REQUIRED = {
    "final": (
        "setTimeout(()=>location.reload(),60)",
        "[250,700,1500].forEach((t,i)=>setTimeout(()=>runFinalPatch(i+1,t,t===1500),t))",
        "japan2027:finalpatch",
        "function runFinalPatch(pass,delay,final)",
        "function applyAll()",
        "japanWinter2027_shinhotakaDay",
    ),
    "hotfix": (
        "[120,350,800,1600,2600].forEach(t=>setTimeout(run,t))",
        "function run()",
        "#winter-shrines",
        "v901TripInfoModal",
    ),
    "visit": (
        "document.addEventListener('multitrip:itineraryrendered',decorate)",
        "document.addEventListener('japan2027:finalpatch',onFinalPatch)",
        "setTimeout(decorate,2300)",
        "function decorate()",
        "['d6','d7','d8']",
        "visit-meta-card",
        "addMapPins",
    ),
    "repair": (
        "[0,180,450,900,1600,2800].forEach(t=>setTimeout(repair,t))",
        "multitrip:itineraryrendered",
        "[0,120,500].forEach(t=>setTimeout(repair,t))",
        "japan2027:languagechange",
        "[0,250,800].forEach(t=>setTimeout(repair,t))",
        ".tripv2-choice",
        "[100,400,1000].forEach(t=>setTimeout(repair,t))",
        "window.Japan2027InfoIconRepair={repair}",
    ),
}

texts: dict[str, str] = {}
for key, path in FILES.items():
    if not path.is_file():
        ERRORS.append(f"Missing Stage 5G-5L timer surface file: {path.relative_to(ROOT)}")
        texts[key] = ""
        continue
    text = path.read_text(encoding="utf-8")
    texts[key] = text
    for marker in REQUIRED[key]:
        if marker not in text:
            ERRORS.append(f"{path.name} timer/ownership baseline changed: missing {marker}")
    if "new MutationObserver" in text:
        ERRORS.append(f"{path.name} reintroduced a live MutationObserver; bounded retries/events are required")

repair = texts.get("repair", "")
for removed_tail in ("4800", "7000"):
    if removed_tail in repair:
        ERRORS.append(f"info-icon-repair-v1.js reintroduced removed Stage 5H startup retry: {removed_tail} ms")

visit = texts.get("visit", "")
if "[1650,2300]" in visit or "setTimeout(decorate,1650)" in visit:
    ERRORS.append("trip-v9-1-visit-fix.js reintroduced removed Stage 5J 1650 ms fixed retry")
if visit.count("setTimeout") != 1:
    ERRORS.append(f"trip-v9-1-visit-fix.js should keep exactly one 2300 ms startup fallback; found {visit.count('setTimeout')} setTimeout token(s)")

print("TravelPilot Stage 5G-5L timer/retry surface QA")
for key, path in FILES.items():
    text = texts.get(key, "")
    print(f"{path.name}: setTimeout={text.count('setTimeout')}; MutationObserver={text.count('MutationObserver')}")

print("Classification: D6-D8 reload=state transition; final=bounded retries with finalpatch completion signal; hotfix=keep pending targeted runtime proof; visit=renderer/finalpatch driven with one 2300 ms fallback; info-icon startup tail trimmed to 2800 ms")
print(f"Errors: {len(ERRORS)}")
for item in ERRORS:
    print("ERROR:", item)
if ERRORS:
    sys.exit(1)
print("PASS")
