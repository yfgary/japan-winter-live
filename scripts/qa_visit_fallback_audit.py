#!/usr/bin/env python3
"""Stage 5K/5L guard for finalpatch completion and the retained visit fallback."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ERRORS: list[str] = []

loader = (ASSETS / "attraction-info.js").read_text(encoding="utf-8")
visit = (ASSETS / "trip-v9-1-visit-fix.js").read_text(encoding="utf-8")
renderer = (ASSETS / "multi-trip-itinerary-renderer-v1.js").read_text(encoding="utf-8")
final = (ASSETS / "trip-v9-final-fixes.js").read_text(encoding="utf-8")

# Stage 5L adds an explicit finalpatch completion path but intentionally keeps the 2300 ms fallback.
for marker in (
    "document.addEventListener('multitrip:itineraryrendered',decorate)",
    "document.addEventListener('japan2027:finalpatch',onFinalPatch)",
    "function onFinalPatch(e){if(e.detail&&e.detail.final===true)decorate();}",
    "function scheduleFallback(){setTimeout(decorate,2300);}",
    "visit-meta-card",
    "addMapPins",
):
    if marker not in visit:
        ERRORS.append(f"visit fallback audit baseline changed: missing {marker}")

if visit.count("setTimeout") != 1:
    ERRORS.append(f"visit-fix should still have exactly one Stage 5J fallback; found {visit.count('setTimeout')} setTimeout token(s)")

for marker in (
    "new CustomEvent('multitrip:itineraryrendered'",
    "[0,350,900,1800].forEach(t=>setTimeout(render,t))",
):
    if marker not in renderer:
        ERRORS.append(f"renderer event evidence changed: missing {marker}")

for marker in (
    "function applyAll()",
    "scheduleShrines();",
    "[250,700,1500].forEach((t,i)=>setTimeout(()=>runFinalPatch(i+1,t,t===1500),t))",
    "new CustomEvent('japan2027:finalpatch'",
    "detail:{pass,delay,final}",
    "function runFinalPatch(pass,delay,final)",
):
    if marker not in final:
        ERRORS.append(f"legacy final-fix timing evidence changed: missing {marker}")

# Stage 5L now has a bounded legacy-final completion event, but fallback removal is deferred.
if "japan2027:finalpatch" not in final:
    ERRORS.append("Stage 5L requires trip-v9-final-fixes.js to emit japan2027:finalpatch")
if "japan2027:finalpatch" not in visit:
    ERRORS.append("Stage 5L requires visit-fix to consume japan2027:finalpatch")

match = re.search(r"const\s+itineraryScripts\s*=\s*commonHead\.concat\(\[(.*?)\]\);", loader, flags=re.S)
if not match:
    ERRORS.append("itineraryScripts loader block missing")
else:
    block = match.group(1)
    positions = {
        "final": block.find("trip-v9-final-fixes.js"),
        "visit": block.find("trip-v9-1-visit-fix.js"),
        "renderer": block.find("multi-trip-itinerary-renderer-v1.js"),
    }
    if min(positions.values()) < 0:
        ERRORS.append(f"Stage 5K loader evidence incomplete: {positions}")
    elif not (positions["final"] < positions["visit"] < positions["renderer"]):
        ERRORS.append(f"Expected final-fixes < visit-fix < renderer loader order; found {positions}")

print("TravelPilot Stage 5K/5L visit fallback contract QA")
print("Visit renderer listener active:", "multitrip:itineraryrendered" in visit)
print("Visit 2300 ms fallback retained:", "setTimeout(decorate,2300)" in visit)
print("Renderer last hydrate event at 1800 ms:", "[0,350,900,1800]" in renderer)
print("Legacy final retry reaches 1500 ms:", "[250,700,1500]" in final)
print("Legacy final completion event exists:", "japan2027:finalpatch" in final)
print("Visit consumes final completion event:", "japan2027:finalpatch" in visit)
print("Stage 5L conclusion: finalpatch path exists; keep 2300 ms fallback until runtime parity is proven")
print(f"Errors: {len(ERRORS)}")
for item in ERRORS:
    print("ERROR:", item)
if ERRORS:
    sys.exit(1)
print("PASS")
