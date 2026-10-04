#!/usr/bin/env python3
"""Static QA checks for TravelPilot.

No third-party packages are required. The goal is to catch the regressions that
have hurt this project before: split version ownership, missing assets, stale
legacy references, invalid trip JSON and registry/config mismatches.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []
WARNINGS: list[str] = []


def error(message: str) -> None:
    ERRORS.append(message)


def warning(message: str) -> None:
    WARNINGS.append(message)


def read(path: str) -> str:
    p = ROOT / path
    if not p.is_file():
        error(f"Missing required file: {path}")
        return ""
    return p.read_text(encoding="utf-8")


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001 - QA should report any parse issue
        error(f"Invalid JSON: {path.relative_to(ROOT)} ({exc})")
        return None


def local_target_exists(base: Path, raw: str) -> bool:
    if not raw or raw.startswith(("#", "data:", "javascript:", "mailto:", "tel:")):
        return True
    parsed = urlsplit(raw)
    if parsed.scheme or parsed.netloc:
        return True
    path = parsed.path
    if not path or path == "/":
        return True
    target = (base / path).resolve()
    try:
        target.relative_to(ROOT.resolve())
    except ValueError:
        return True
    return target.exists()


def check_version_ownership() -> None:
    version_path = ROOT / "version.json"
    version_obj = load_json(version_path)
    if not isinstance(version_obj, dict):
        return
    version = str(version_obj.get("version", ""))
    if not re.fullmatch(r"v\d+\.\d+\.\d+", version):
        error(f"version.json has invalid semantic version: {version!r}")
        return
    plain = version.removeprefix("v")

    context = read("assets/multi-trip-context-v1.js")
    if f"const APP_VERSION='{version}'" not in context:
        error("multi-trip-context-v1.js APP_VERSION does not match version.json")
    if "XMLHttpRequest" in context or "eval)(" in context or "eval(" in context:
        error("multi-trip-context-v1.js must not use sync XHR/eval legacy loading")
    if "controllerchange" in context:
        error("multi-trip-context-v1.js must not auto-reload on controllerchange")

    sw = read("sw.js")
    if f"travelpilot-{version}-" not in sw:
        error("sw.js CACHE_NAME does not match version.json")

    index = read("index.html")
    for expected in (
        f"assets/multi-trip-context-v1.js?v={plain}",
        f"assets/travelpilot-home.css?v={plain}",
        f"manifest.webmanifest?v={plain}",
    ):
        if expected not in index:
            error(f"index.html is not pinned to current release asset: {expected}")

    manifest = read("manifest.webmanifest")
    if f"?v={plain}" not in manifest:
        warning("manifest.webmanifest does not contain the current asset version")


def check_retired_runtime_references() -> None:
    retired = (
        "multi-trip-context-legacy-v10.10.12.js",
        "version-v901-fix.js",
        "travelpilot-home-v10.10.15.css",
        "travelpilot-home-v10.11.0.css",
        "travelpilot-home-v10.11.1.css",
    )
    runtime_files = [
        ROOT / "index.html",
        ROOT / "attractions.html",
        ROOT / "sw.js",
        ROOT / "assets" / "attraction-info.js",
        ROOT / "assets" / "multi-trip-live-entry-v1.js",
    ]
    for path in runtime_files:
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        for name in retired:
            if name in text:
                error(f"Retired asset still referenced by {path.relative_to(ROOT)}: {name}")


def check_html_static_assets() -> None:
    attr_re = re.compile(r"\b(?:src|href)=[\"']([^\"']+)[\"']", re.I)
    for html in ROOT.glob("*.html"):
        text = html.read_text(encoding="utf-8")
        for raw in attr_re.findall(text):
            if not local_target_exists(html.parent, raw):
                error(f"Broken local reference in {html.name}: {raw}")


def check_trip_registry() -> None:
    registry_path = ROOT / "trips" / "registry.json"
    registry = load_json(registry_path)
    if not isinstance(registry, dict):
        return
    trips = registry.get("trips")
    if not isinstance(trips, list) or not trips:
        error("trips/registry.json must contain a non-empty trips array")
        return

    seen: set[str] = set()
    dates: list[tuple[date, str]] = []
    default_trip = registry.get("defaultTrip")

    for idx, trip in enumerate(trips):
        label = f"registry trip #{idx + 1}"
        if not isinstance(trip, dict):
            error(f"{label} is not an object")
            continue
        trip_id = str(trip.get("id", "")).strip()
        if not trip_id:
            error(f"{label} has no id")
            continue
        label = trip_id
        if trip_id in seen:
            error(f"Duplicate trip id: {trip_id}")
        seen.add(trip_id)

        try:
            start = date.fromisoformat(str(trip.get("startDate", "")))
            end = date.fromisoformat(str(trip.get("endDate", "")))
            if end < start:
                error(f"{label}: endDate is before startDate")
            dates.append((start, trip_id))
        except ValueError:
            error(f"{label}: invalid startDate/endDate")

        config_raw = str(trip.get("config", "")).strip()
        config_path = ROOT / config_raw if config_raw else ROOT / "trips" / trip_id / "trip.json"
        if not config_path.is_file():
            error(f"{label}: missing config file {config_path.relative_to(ROOT)}")
            continue
        config = load_json(config_path)
        if not isinstance(config, dict):
            continue
        if config.get("id") != trip_id:
            error(f"{label}: trip.json id does not match registry")
        if config.get("startDate") != trip.get("startDate") or config.get("endDate") != trip.get("endDate"):
            error(f"{label}: trip dates differ between registry and trip.json")

        pages = config.get("pages") or {}
        for page_key, page_path in pages.items():
            if isinstance(page_path, str) and not local_target_exists(ROOT, page_path):
                error(f"{label}: missing page for {page_key}: {page_path}")

        data_files = config.get("dataFiles") or {}
        trip_dir = config_path.parent
        for data_key, data_path in data_files.items():
            if not isinstance(data_path, str):
                error(f"{label}: dataFiles.{data_key} is not a string")
                continue
            target = trip_dir / data_path
            if not target.is_file():
                error(f"{label}: missing data file {target.relative_to(ROOT)}")
            else:
                load_json(target)

        for registry_key in ("cover", "entry"):
            raw = trip.get(registry_key)
            if isinstance(raw, str) and not local_target_exists(ROOT, raw):
                error(f"{label}: missing registry {registry_key}: {raw}")

    if default_trip not in seen:
        error(f"defaultTrip is not present in registry: {default_trip}")

    # Informational guard: homepage code is intentionally newest-to-oldest.
    index = read("index.html")
    if "String(b.startDate||'').localeCompare(String(a.startDate||''))" not in index:
        error("Homepage trip sorting is no longer startDate newest-to-oldest")


def check_all_json() -> None:
    for path in sorted(ROOT.rglob("*.json")):
        load_json(path)


def check_home_css_asset() -> None:
    css_path = ROOT / "assets" / "travelpilot-home.css"
    css = read(str(css_path.relative_to(ROOT)))
    for raw in re.findall(r"url\(['\"]?([^)'\"]+)", css):
        if not local_target_exists(css_path.parent, raw):
            error(f"Broken local CSS asset: {raw}")


def main() -> int:
    check_version_ownership()
    check_retired_runtime_references()
    check_html_static_assets()
    check_trip_registry()
    check_all_json()
    check_home_css_asset()

    print("TravelPilot static QA")
    print(f"Errors: {len(ERRORS)}  Warnings: {len(WARNINGS)}")
    for item in WARNINGS:
        print(f"WARNING: {item}")
    for item in ERRORS:
        print(f"ERROR: {item}")
    if ERRORS:
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
