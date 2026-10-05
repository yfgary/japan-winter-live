#!/usr/bin/env python3
"""Stage 5Q-5T guard for itinerary info-icon retry/event ownership."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ERRORS: list[str] = []

loader = (ASSETS / "attraction-info.js").read_text(encoding="utf-8")
repair = (ASSETS / "info-icon-repair-v1.js").read_text(encoding="utf-8")
renderer = (ASSETS / "multi-trip-itinerary-renderer-v1.js").read_text(encoding="utf-8")
i18n = (ASSETS / "i18n-v1.js").read_text(encoding="utf-8")
final = (ASSETS / "trip-v9-final-fixes.js").read_text(encoding="utf-8")

# Stage 5T removes only the 900 ms startup pass after Stage 5S parity was manually verified.
for marker in (
    "function repair()",
    "function schedule(){[0,2800].forEach(t=>setTimeout(repair,t));}",
    "function catchUp(){if(document.documentElement.dataset.itineraryRenderer)repair();}",
    "document.addEventListener('multitrip:itineraryrendered',()=>{[0,120,500].forEach(t=>setTimeout(repair,t));});",
    "document.addEventListener('japan2027:languagechange',()=>{[0,250,800].forEach(t=>setTimeout(repair,t));});",
    "e.target.closest&&e.target.closest('.tripv2-choice')",
    "[100,400,1000].forEach(t=>setTimeout(repair,t))",
    "catchUp();",
    "window.Japan2027InfoIconRepair={repair};",
):
    if marker not in repair:
        ERRORS.append(f"Stage 5T info-icon runtime contract changed: missing {marker}")

for old_schedule in (
    "[0,180,450,900,1600,2800].forEach(t=>setTimeout(repair,t))",
    "[0,900,2800].forEach(t=>setTimeout(repair,t))",
):
    if old_schedule in repair:
        ERRORS.append(f"Stage 5T must not restore an older startup schedule: {old_schedule}")
if repair.count("setTimeout") != 4:
    ERRORS.append(
        f"Stage 5T must keep four retry surfaces while trimming only startup timings; "
        f"found {repair.count('setTimeout')} setTimeout token(s)"
    )
if "new MutationObserver" in repair:
    ERRORS.append("info-icon-repair-v1.js must not reintroduce a live MutationObserver")

# The renderer has an explicit completion signal and bounded hydrate retries.
for marker in (
    "new CustomEvent('multitrip:itineraryrendered'",
    "[0,350,900,1800].forEach(t=>setTimeout(render,t));",
    "window.MultiTripItineraryRenderer={__v1:true,render,hydrateAll,generateAll,mode}",
):
    if marker not in renderer:
        ERRORS.append(f"Itinerary renderer evidence changed: missing {marker}")

# Current i18n changes language by reload, while the reserved languagechange repair hook remains future-compatible.
for marker in (
    "localStorage.setItem(KEY,lang==='en'?'zh':'en');location.reload();",
    "setLang:n=>{localStorage.setItem(KEY,n==='en'?'en':'zh');location.reload();}",
):
    if marker not in i18n:
        ERRORS.append(f"i18n reload contract changed: missing {marker}")
if "japan2027:languagechange" not in repair:
    ERRORS.append("Reserved japan2027:languagechange info-icon repair hook was removed")

# Known D6-D8 choice handling reloads before the repair click retries would run.
for marker in (
    "#tripv2WeatherSelect [data-sh]",
    "setTimeout(()=>location.reload(),60)",
    "localStorage.setItem(SH_KEY,v)",
):
    if marker not in final:
        ERRORS.append(f"D6-D8 choice/reload evidence changed: missing {marker}")

# Stage 5R loader order remains required so normal renderer completion events cannot be missed.
match = re.search(r"const\s+itineraryScripts\s*=\s*commonHead\.concat\(\[(.*?)\]\);", loader, flags=re.S)
if not match:
    ERRORS.append("itineraryScripts loader block missing")
else:
    block = match.group(1)
    positions = {
        "core": block.find("japan2027-attraction-core-v1.js"),
        "visit": block.find("trip-v9-1-visit-fix.js"),
        "repair": block.find("info-icon-repair-v1.js"),
        "renderer": block.find("multi-trip-itinerary-renderer-v1.js"),
        "i18n": block.find("i18n-v1.js"),
        "polish": block.find("i18n-polish-en-v1.js"),
    }
    if min(positions.values()) < 0:
        ERRORS.append(f"Stage 5T itinerary loader evidence incomplete: {positions}")
    elif not (
        positions["core"] < positions["visit"] < positions["repair"] < positions["renderer"]
        < positions["i18n"] < positions["polish"]
    ):
        ERRORS.append(
            "Expected core < visit-fix < info-icon-repair < renderer < i18n < polish loader order; "
            f"found {positions}"
        )

if loader.count("info-icon-repair-v1.js?v=6") != 1:
    ERRORS.append("Stage 5T requires the Japan itinerary chain to use info-icon-repair module pin v6 exactly once")

# Repair remains Japan-itinerary-only and must not leak into generic itinerary chains.
generic = re.search(r"const\s+genericItineraryScripts\s*=\s*commonHead\.concat\(\[(.*?)\]\);", loader, flags=re.S)
if not generic:
    ERRORS.append("genericItineraryScripts loader block missing")
elif "info-icon-repair-v1.js" in generic.group(1):
    ERRORS.append("Generic itinerary chain must not load Japan info-icon repair")

print("TravelPilot Stage 5Q-5T info-icon event migration QA")
print("Repair startup schedule trimmed to 0/2800:", "[0,2800]" in repair)
print("Repair consumes itinerary-rendered event:", "multitrip:itineraryrendered" in repair)
print("Renderer emits itinerary-rendered event:", "multitrip:itineraryrendered" in renderer)
print("Repair loads before renderer:", bool(match and match.group(1).find("info-icon-repair-v1.js") < match.group(1).find("multi-trip-itinerary-renderer-v1.js")))
print("Deterministic catch-up present:", "dataset.itineraryRenderer" in repair and "catchUp();" in repair)
print("Language switch currently uses reload:", "location.reload()" in i18n)
print("Reserved languagechange repair hook retained:", "japan2027:languagechange" in repair)
print("Current languagechange producer present:", "japan2027:languagechange" in i18n)
print("D6-D8 selection reloads at 60 ms:", "setTimeout(()=>location.reload(),60)" in final)
print("Stage 5T conclusion: startup retries reduced to immediate + 2800 ms safety fallback while event, language and choice coverage remain intact")
print(f"Errors: {len(ERRORS)}")
for item in ERRORS:
    print("ERROR:", item)
if ERRORS:
    sys.exit(1)
print("PASS")
