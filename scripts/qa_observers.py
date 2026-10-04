#!/usr/bin/env python3
"""Regression checks for the Japan 2027 MutationObserver cleanup."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []


def error(message: str) -> None:
    ERRORS.append(message)


def read(path: str) -> str:
    p = ROOT / path
    if not p.is_file():
        error(f"Missing required file: {path}")
        return ""
    return p.read_text(encoding="utf-8")


def loader_block(loader: str, name: str) -> str:
    match = re.search(
        rf"const {re.escape(name)}=commonHead\.concat\(\[(.*?)\]\);",
        loader,
        re.S,
    )
    if not match:
        error(f"Cannot locate loader block: {name}")
        return ""
    return match.group(1)


def itinerary_asset_paths(block: str) -> list[str]:
    return re.findall(r"['\"](assets/[^'\"]+?\.js)(?:\?[^'\"]*)?['\"]", block)


def direct_observer_count(text: str) -> int:
    # Count actual constructor calls, not comments mentioning MutationObserver.
    return len(re.findall(r"\bnew\s+MutationObserver\s*\(", text))


def main() -> int:
    retired = ROOT / "assets" / "trip-no-observers-v2.js"
    if retired.exists():
        error("Retired global no-op MutationObserver shim still exists")

    loader = read("assets/attraction-info.js")
    guard = read("assets/trip-performance-guard.js")

    blocks = {
        name: loader_block(loader, name)
        for name in (
            "itineraryScripts",
            "tripInfoScripts",
            "genericItineraryScripts",
            "genericTripInfoScripts",
        )
    }

    guard_ref = "assets/trip-performance-guard.js"
    if guard_ref not in blocks["itineraryScripts"]:
        error("Japan itinerary no longer loads the bounded observer guard")
    for name in ("tripInfoScripts", "genericItineraryScripts", "genericTripInfoScripts"):
        if guard_ref in blocks[name]:
            error(f"Observer guard leaked into {name}")

    if "trip-no-observers-v2.js" in loader:
        error("Loader still references the retired no-op observer shim")

    required = (
        "const NativeMutationObserver=window.MutationObserver",
        "window.MutationObserver=GuardedMutationObserver",
        "window.MutationObserver=NativeMutationObserver",
        "setTimeout(()=>this.disconnect(),6500)",
        "selectedTrip!==DEFAULT_TRIP",
        "itinerary\\.html",
        "pagehide",
    )
    for marker in required:
        if marker not in guard:
            error(f"Observer guard is missing safety marker: {marker}")

    banned = (
        "NoopMutationObserver",
        "observe(){/* intentionally disabled */}",
        "observe(){}",
    )
    for marker in banned:
        if marker in guard:
            error(f"Observer guard contains retired no-op behavior: {marker}")

    # Only the dedicated guard may replace window.MutationObserver.
    for path in sorted((ROOT / "assets").glob("*.js")):
        text = path.read_text(encoding="utf-8")
        if "window.MutationObserver=" in text and path.name != "trip-performance-guard.js":
            error(f"Unexpected global MutationObserver replacement: assets/{path.name}")

    # Stage 3 debt audit: lock the remaining direct whole-page legacy observers
    # to the two files already identified. New observers must not silently grow.
    allowed_remaining = {
        "assets/trip-enhancements-v3.js",
        "assets/trip-v8-9-user-fixes.js",
    }
    found: dict[str, int] = {}
    for rel in itinerary_asset_paths(blocks["itineraryScripts"]):
        text = read(rel)
        count = direct_observer_count(text)
        if count:
            found[rel] = count

    unexpected = set(found) - allowed_remaining
    if unexpected:
        error("Unexpected itinerary MutationObserver users: " + ", ".join(sorted(unexpected)))
    missing_known = allowed_remaining - set(found)
    if missing_known:
        error("Observer debt audit is stale; expected observer no longer present: " + ", ".join(sorted(missing_known)))

    v8_ui = read("assets/trip-v8-ui.js")
    if direct_observer_count(v8_ui):
        error("trip-v8-ui.js must stay observer-free; use bounded startup passes + click events")
    if "[120,350,800,1600,2600]" not in v8_ui or "setTimeout(enrichModal,0)" not in v8_ui:
        error("trip-v8-ui.js lost its bounded startup/click refresh strategy")

    print("TravelPilot observer QA")
    print("Remaining direct Japan itinerary observers:")
    for rel, count in sorted(found.items()):
        print(f"  {rel}: {count}")
    print(f"Errors: {len(ERRORS)}")
    for item in ERRORS:
        print(f"ERROR: {item}")
    if ERRORS:
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
