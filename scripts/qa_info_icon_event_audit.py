#!/usr/bin/env python3
"""Stage 5Q audit guard for itinerary info-icon retry/event ownership."""
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

# Stage 5Q is audit-only. Keep the existing info-icon repair runtime contract intact.
for marker in (
    "function repair()",
    "function schedule(){[0,180,450,900,1600,2800].forEach(t=>setTimeout(repair,t));}",
    "document.addEventListener('multitrip:itineraryrendered',()=>{[0,120,500].forEach(t=>setTimeout(repair,t));});",
    "document.addEventListener('japan2027:languagechange',()=>{[0,250,800].forEach(t=>setTimeout(repair,t));});",
    "e.target.closest&&e.target.closest('.tripv2-choice')",
    "[100,400,1000].forEach(t=>setTimeout(repair,t))",
    "window.Japan2027InfoIconRepair={repair};",
):
    if marker not in repair:
        ERRORS.append(f"Stage 5Q audit baseline changed: missing {marker}")

if repair.count("setTimeout") != 4:
    ERRORS.append(
        f"Stage 5Q expects the existing four retry surfaces to remain intact; "
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

# Current i18n changes language by reload; no active languagechange custom-event contract is confirmed.
for marker in (
    "localStorage.setItem(KEY,lang==='en'?'zh':'en');location.reload();",
    "setLang:n=>{localStorage.setItem(KEY,n==='en'?'en':'zh');location.reload();}",
):
    if marker not in i18n:
        ERRORS.append(f"i18n reload contract changed: missing {marker}")
if "japan2027:languagechange" in i18n:
    ERRORS.append("Stage 5Q assumption changed: i18n-v1.js now contains japan2027:languagechange; re-audit producer/consumer ownership")

# Known D6-D8 choice handling reloads before the repair click retries would run.
for marker in (
    "#tripv2WeatherSelect [data-sh]",
    "setTimeout(()=>location.reload(),60)",
    "localStorage.setItem(SH_KEY,v)",
):
    if marker not in final:
        ERRORS.append(f"D6-D8 choice/reload evidence changed: missing {marker}")

# Loader order currently puts repair after renderer and i18n, explaining why startup catch-up remains relevant.
match = re.search(r"const\s+itineraryScripts\s*=\s*commonHead\.concat\(\[(.*?)\]\);", loader, flags=re.S)
if not match:
    ERRORS.append("itineraryScripts loader block missing")
else:
    block = match.group(1)
    positions = {
        "renderer": block.find("multi-trip-itinerary-renderer-v1.js"),
        "i18n": block.find("i18n-v1.js"),
        "polish": block.find("i18n-polish-en-v1.js"),
        "repair": block.find("info-icon-repair-v1.js"),
    }
    if min(positions.values()) < 0:
        ERRORS.append(f"Stage 5Q itinerary loader evidence incomplete: {positions}")
    elif not (positions["renderer"] < positions["i18n"] < positions["polish"] < positions["repair"]):
        ERRORS.append(f"Expected renderer < i18n < polish < repair loader order; found {positions}")

# Repair remains Japan-itinerary-only and must not leak into generic itinerary chains.
generic = re.search(r"const\s+genericItineraryScripts\s*=\s*commonHead\.concat\(\[(.*?)\]\);", loader, flags=re.S)
if not generic:
    ERRORS.append("genericItineraryScripts loader block missing")
elif "info-icon-repair-v1.js" in generic.group(1):
    ERRORS.append("Generic itinerary chain must not load Japan info-icon repair")

print("TravelPilot Stage 5Q info-icon event audit QA")
print("Repair startup schedule intact:", "[0,180,450,900,1600,2800]" in repair)
print("Repair consumes itinerary-rendered event:", "multitrip:itineraryrendered" in repair)
print("Renderer emits itinerary-rendered event:", "multitrip:itineraryrendered" in renderer)
print("Repair loads after renderer:", bool(match and match.group(1).find("multi-trip-itinerary-renderer-v1.js") < match.group(1).find("info-icon-repair-v1.js")))
print("Language switch uses reload:", "location.reload()" in i18n)
print("Confirmed languagechange producer in i18n-v1.js:", "japan2027:languagechange" in i18n)
print("D6-D8 selection reloads at 60 ms:", "setTimeout(()=>location.reload(),60)" in final)
print("Stage 5Q conclusion: do not remove info-icon retries until subscriber timing and dead/unproven event ownership are isolated")
print(f"Errors: {len(ERRORS)}")
for item in ERRORS:
    print("ERROR:", item)
if ERRORS:
    sys.exit(1)
print("PASS")
