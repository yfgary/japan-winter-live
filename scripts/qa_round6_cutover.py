#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
TRIP_ID="shirakawago-shinhotaka-2027"
TRIP_DIR=ROOT/"trips"/TRIP_ID
ERRORS=[]

def err(msg:str)->None: ERRORS.append(msg)
def load(path:Path):
    try: return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        err(f"Cannot load {path.relative_to(ROOT)}: {exc}")
        return {}

trip=load(TRIP_DIR/"trip.json")
itinerary=load(TRIP_DIR/"itinerary.json")
info=load(TRIP_DIR/"trip-info.json")
attractions=load(TRIP_DIR/"attractions.json")
hotels=load(TRIP_DIR/"hotels.json")
live=load(TRIP_DIR/"live-cams.json")
weather=load(TRIP_DIR/"weather.json")
departure=load(TRIP_DIR/"departure-checklist.json")
report=load(TRIP_DIR/"migration-report.json")

if trip.get("schemaVersion")!=12: err("Japan Golden Reference must be schema v12")
if trip.get("modules") not in ([],None): err("Japan modules must be empty")
if "legacy" in trip: err("Japan manifest still has legacy block")
for name,row in (trip.get("renderers") or {}).items():
    if row.get("mode")!="generate":
        err(f"Japan renderer {name} is not generate")

root_pages=("itinerary.html","trip-info.html","attractions.html","live.html")
for page in root_pages:
    text=(ROOT/page).read_text(encoding="utf-8")
    scripts=re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',text,re.I)
    if scripts!=["assets/cutover-router-v1.js"]:
        err(f"{page} is not a router-only public entry: {scripts}")

router=(ROOT/"assets"/"cutover-router-v1.js").read_text(encoding="utf-8")
for required in ("schemaVersion", "renderer?.mode==='generate'", "standard/", "legacy/"):
    if required not in router: err(f"cutover router missing contract token: {required}")
for banned in (TRIP_ID,"白川鄉","新穗高","bangkok-2026","hokkaido-2025"):
    if banned in router: err(f"cutover router contains trip-specific branch token: {banned}")

standard_expected={
    "itinerary.html":{"assets/standard-core-v1.js","assets/standard-modes-v1.js","assets/standard-render-itinerary-v1.js"},
    "trip-info.html":{"assets/standard-core-v1.js","assets/standard-render-trip-info-v1.js"},
    "attractions.html":{"assets/standard-core-v1.js","assets/standard-render-attractions-v1.js"},
    "live.html":{"assets/standard-core-v1.js","assets/standard-render-live-v1.js"},
}
for page,expected in standard_expected.items():
    p=ROOT/"standard"/page
    if not p.is_file():
        err(f"Missing Standard page: standard/{page}")
        continue
    text=p.read_text(encoding="utf-8")
    scripts=set(re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',text,re.I))
    if scripts!=expected: err(f"standard/{page} scripts {sorted(scripts)} != {sorted(expected)}")
    if '<base href="../">' not in text: err(f"standard/{page} missing root base")

for page in root_pages:
    p=ROOT/"legacy"/page
    if not p.is_file(): err(f"Missing legacy fallback: legacy/{page}")
    elif '<base href="../">' not in p.read_text(encoding="utf-8"):
        err(f"legacy/{page} missing root base")

shared=[
    ROOT/"assets"/"standard-core-v1.js",
    ROOT/"assets"/"standard-modes-v1.js",
    ROOT/"assets"/"standard-render-itinerary-v1.js",
    ROOT/"assets"/"standard-render-trip-info-v1.js",
    ROOT/"assets"/"standard-render-attractions-v1.js",
    ROOT/"assets"/"standard-render-live-v1.js",
]
banned_tokens=(TRIP_ID,"japan2027","japanWinter2027","tripv2","白川鄉","白川郷","新穗高","新穂高","weather-day-selector")
for p in shared:
    text=p.read_text(encoding="utf-8")
    for token in banned_tokens:
        if token in text: err(f"Standard runtime {p.name} contains destination token {token!r}")
    if re.search(r"tripId\s*===?\s*['\"]",text):
        err(f"Standard runtime {p.name} contains concrete trip branch")

days=itinerary.get("days") or []
if [d.get("id") for d in days] != [f"d{i}" for i in range(1,10)]:
    err("Japan itinerary is not exact D1-D9")
by={d.get("id"):d for d in days}
fixed={"d6":"shinhotaka","d7":"shirakawago","d8":"takayama"}
for did,region in fixed.items():
    if by.get(did,{}).get("weatherRegion")!=region: err(f"{did} itinerary weatherRegion != {region}")
    if (weather.get("dayRegions") or {}).get(did)!=region: err(f"{did} weather dayRegion != {region}")

def aids(day_id):
    return {x.get("attractionId") for x in by.get(day_id,{}).get("items",[]) if x.get("attractionId")}
for x in ("hirayu-shrine","hirayu-no-mori","bear-park"):
    if x in aids("d6"): err(f"D6 optional stop leaked into main timeline: {x}")
for x in ("hida-toshogu","toyokawa-shiroyama-inari"):
    if x in aids("d7"): err(f"D7 optional shrine leaked into main timeline: {x}")
d6backup=json.dumps(by.get("d6",{}).get("backups") or [],ensure_ascii=False)
if "hirayu-shrine" not in d6backup or "hirayu-no-mori" not in d6backup:
    err("D6 optional Hirayu stops missing from backups")

all_text="\n".join(json.dumps(x,ensure_ascii=False) for x in (trip,itinerary,info,attractions,live,weather))
for token in ("dynamicRegionRules","flexibleRules","weather-day-selector","shinhotakaPlanner","japanWinter2027_shinhotakaDay"):
    if token in all_text: err(f"Retired selector token remains: {token}")

attr_ids={x.get("id") for x in attractions.get("attractions",[]) if x.get("id")}
hotel_ids={x.get("id") for x in hotels.get("hotels",[]) if x.get("id")}
for day in days:
    if day.get("hotelId") and day["hotelId"] not in hotel_ids: err(f"{day.get('id')} unknown hotel {day['hotelId']}")
    for item in day.get("items",[]):
        if item.get("attractionId") and item["attractionId"] not in attr_ids:
            err(f"{day.get('id')} unknown attraction {item['attractionId']}")

camera_ids={x.get("id") for x in live.get("cameras",[]) if x.get("id")}
for day in live.get("days",[]):
    for cid in day.get("cameras",[]):
        if cid not in camera_ids: err(f"{day.get('id')} unknown camera {cid}")

for day in days:
    media=day.get("media") or {}
    rows=([media.get("hero")] if media.get("hero") else []) + list(media.get("gallery") or [])
    for row in rows:
        src=(row or {}).get("src","")
        if src and not re.match(r"^https?://",src):
            if not (ROOT/src).is_file(): err(f"Missing local media: {src}")

computed={
    "days":len(days),
    "timelineItems":sum(len(d.get("items",[])) for d in days),
    "photos":sum((1 if (d.get("media") or {}).get("hero") else 0)+len((d.get("media") or {}).get("gallery") or []) for d in days),
    "attractions":len(attractions.get("attractions") or []),
    "richAttractions":sum(1 for x in attractions.get("attractions") or [] if x.get("summary") or x.get("history") or x.get("visit")),
    "hotels":len(hotels.get("hotels") or []),
    "departureChecklistItems":sum(len(g.get("items") or []) for g in departure.get("groups") or []),
    "liveCameras":len(live.get("cameras") or []),
    "liveDays":len(live.get("days") or []),
    "customTripInfoSections":len(info.get("customSections") or []),
}
for key,value in computed.items():
    if (report.get("counts") or {}).get(key)!=value:
        err(f"migration report drift {key}: report={(report.get('counts') or {}).get(key)!r} computed={value!r}")

if computed["timelineItems"]<100: err("Japan timeline shrank below 100")
if computed["attractions"]!=42 or computed["richAttractions"]!=42: err("Japan attraction parity is not 42/42")
if computed["hotels"]!=7: err("Japan hotel parity is not 7")
if computed["departureChecklistItems"]!=96: err("Japan departure checklist parity is not 96")
if computed["liveDays"]!=9 or computed["liveCameras"]!=37: err("Japan Live Cam parity is not 9 days / 37 cameras")

print("Round 6 Standard cutover static QA")
print(json.dumps(computed,ensure_ascii=False,indent=2))
print("Errors:",len(ERRORS))
for item in ERRORS: print("ERROR:",item)
if ERRORS: sys.exit(1)
print("PASS")
