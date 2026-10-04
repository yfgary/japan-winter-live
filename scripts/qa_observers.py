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

    print("TravelPilot observer QA")
    print(f"Errors: {len(ERRORS)}")
    for item in ERRORS:
        print(f"ERROR: {item}")
    if ERRORS:
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
