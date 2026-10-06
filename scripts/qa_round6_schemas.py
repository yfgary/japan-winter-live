#!/usr/bin/env python3
from pathlib import Path
import json
import sys

try:
    from jsonschema import Draft202012Validator
except ImportError:
    print("jsonschema is required", file=sys.stderr)
    raise

ROOT=Path(__file__).resolve().parents[1]
TRIP=ROOT/"trips"/"shirakawago-shinhotaka-2027"
PAIRS=[
    ("schemas/trip-v12.schema.json", TRIP/"trip.json"),
    ("schemas/itinerary-v3.schema.json", TRIP/"itinerary.json"),
    ("schemas/attractions-v3.schema.json", TRIP/"attractions.json"),
    ("schemas/trip-info-v2.schema.json", TRIP/"trip-info.json"),
    ("schemas/live-cams-v3.schema.json", TRIP/"live-cams.json"),
    ("schemas/weather-v4.schema.json", TRIP/"weather.json"),
]
errors=[]
for schema_path,data_path in PAIRS:
    schema=json.loads((ROOT/schema_path).read_text(encoding="utf-8"))
    data=json.loads(data_path.read_text(encoding="utf-8"))
    validator=Draft202012Validator(schema)
    found=sorted(validator.iter_errors(data), key=lambda e:list(e.absolute_path))
    if found:
        for e in found:
            loc=".".join(str(x) for x in e.absolute_path) or "<root>"
            errors.append(f"{data_path.name} {loc}: {e.message}")
    else:
        print(f"PASS {data_path.name} <- {schema_path}")
if errors:
    print(f"Schema errors: {len(errors)}")
    for e in errors:
        print("ERROR:",e)
    sys.exit(1)
print("Round 6 schema validation PASS")
