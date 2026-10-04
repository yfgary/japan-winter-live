#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = "10.13.2"
NEW = "10.13.3"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding="utf-8")


def replace_once(path: str, old: str, new: str) -> None:
    text = read(path)
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one occurrence of {old!r}, found {count}")
    write(path, text.replace(old, new, 1))


# Remove the retired update prompt from the remaining legacy Live Cam page,
# while preserving the Online/Offline network-status indicator.
live_path = ROOT / "live.html"
live = live_path.read_text(encoding="utf-8")

css_pattern = re.compile(
    r"\n\.tripv2-update \{.*?\n\}\n"
    r"\.tripv2-update\.show \{ display: flex; \}\n"
    r"\.tripv2-update button \{.*?\n\}\n",
    re.S,
)
live, css_count = css_pattern.subn("\n", live, count=1)
if css_count != 1:
    raise SystemExit(f"live.html: expected one retired update CSS block, removed {css_count}")
live = live.replace("    .tripv2-update { bottom: 52px; }\n", "")

js_pattern = re.compile(
    r"\n    function ensureUpdatePrompt\(\)\{.*?\n    \}\n\n"
    r"    document\.addEventListener\('DOMContentLoaded', function\(\)\{",
    re.S,
)
live, js_count = js_pattern.subn(
    "\n\n    document.addEventListener('DOMContentLoaded', function(){",
    live,
    count=1,
)
if js_count != 1:
    raise SystemExit(f"live.html: expected one retired update JS function, removed {js_count}")
live = live.replace("\n        ensureUpdatePrompt();", "")

for token in (
    "tripv2UpdatePrompt",
    "tripv2ReloadBtn",
    "tripv2UpdateText",
    "ensureUpdatePrompt",
    ".tripv2-update",
):
    if token in live:
        raise SystemExit(f"live.html: retired updater token still present: {token}")
if "tripv2NetworkStatus" not in live or "function ensureNetworkStatus" not in live:
    raise SystemExit("live.html: network status indicator was accidentally removed")
live_path.write_text(live, encoding="utf-8")

# Fix the Live Cam entry shim's stale runtime pin.
replace_once(
    "assets/multi-trip-live-entry-v1.js",
    "assets/multi-trip-context-v1.js?v=10.12.0",
    "assets/multi-trip-context-v1.js?v=10.13.3",
)

# Coordinated release/cache pins.
replace_once(
    "assets/multi-trip-context-v1.js",
    "const APP_VERSION='v10.13.2'",
    "const APP_VERSION='v10.13.3'",
)
replace_once(
    "assets/attraction-info.js",
    "assets/multi-trip-context-v1.js?v=10.13.2",
    "assets/multi-trip-context-v1.js?v=10.13.3",
)

for path in ("index.html", "manifest.webmanifest", "sw.js"):
    text = read(path)
    if OLD not in text:
        raise SystemExit(f"{path}: current release pin {OLD} not found")
    write(path, text.replace(OLD, NEW))

meta_path = ROOT / "version.json"
meta = json.loads(meta_path.read_text(encoding="utf-8"))
meta.update({
    "version": "v10.13.3",
    "build": "2026-10-05.73",
    "updated": "2026-10-05T02:18:00+08:00",
    "notes": "Hotfix Live Cam reload prompt: remove the retired update/reload UI and Service Worker update listener from live.html, preserve Online/Offline status, align the Live Cam entry runtime pin, and extend regression QA to cover Live Cam."
})
meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Extend retired-updater QA to cover Live Cam too.
qa_path = ROOT / "scripts/qa_legacy_update.py"
qa = qa_path.read_text(encoding="utf-8")
qa = qa.replace(
    '    ROOT / "trip-info.html",\n    ROOT / "assets" / "multi-trip-context-v1.js",',
    '    ROOT / "trip-info.html",\n    ROOT / "live.html",\n    ROOT / "assets" / "multi-trip-context-v1.js",',
    1,
)
qa = qa.replace(
    'for page in ("itinerary.html", "trip-info.html"):',
    'for page in ("itinerary.html", "trip-info.html", "live.html"):',
    1,
)
qa_path.write_text(qa, encoding="utf-8")

# Release QA now also guards the Live Cam entry shim's internal runtime pin.
qa_release_path = ROOT / "scripts/qa_release.py"
qar = qa_release_path.read_text(encoding="utf-8")
qar = qar.replace(
    '    loader = read("assets/attraction-info.js")\n',
    '    loader = read("assets/attraction-info.js")\n    live_entry = read("assets/multi-trip-live-entry-v1.js")\n',
    1,
)
qar = qar.replace(
    '            "Live Cam injected shim pin": f"assets/multi-trip-live-entry-v1.js?v={plain}",\n',
    '            "Live Cam injected shim pin": f"assets/multi-trip-live-entry-v1.js?v={plain}",\n            "Live Cam entry runtime pin": f"assets/multi-trip-context-v1.js?v={plain}",\n',
    1,
)
qar = qar.replace(
    '            "Live Cam injected shim pin": sw,\n',
    '            "Live Cam injected shim pin": sw,\n            "Live Cam entry runtime pin": live_entry,\n',
    1,
)
qar = qar.replace('    previous = "10.13.1"', '    previous = "10.13.2"', 1)
qar = qar.replace(
    '        ("assets/multi-trip-context-v1.js", context),\n',
    '        ("assets/multi-trip-context-v1.js", context),\n        ("assets/multi-trip-live-entry-v1.js", live_entry),\n',
    1,
)
qa_release_path.write_text(qar, encoding="utf-8")
