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
    retired_files = (
        ROOT / "assets" / "trip-no-observers-v2.js",
        ROOT / "assets" / "trip-performance-guard.js",
        ROOT / "scripts" / "test_observer_guard.mjs",
    )
    for path in retired_files:
        if path.exists():
            error(f"Retired observer cleanup file still exists: {path.relative_to(ROOT)}")

    loader = read("assets/attraction-info.js")
    blocks = {
        name: loader_block(loader, name)
        for name in (
            "itineraryScripts",
            "tripInfoScripts",
            "genericItineraryScripts",
            "genericTripInfoScripts",
        )
    }

    for retired_ref in ("trip-no-observers-v2.js", "trip-performance-guard.js"):
        if retired_ref in loader:
            error(f"Loader still references retired observer code: {retired_ref}")

    # No script may globally replace the browser MutationObserver constructor.
    for path in sorted((ROOT / "assets").glob("*.js")):
        text = path.read_text(encoding="utf-8")
        if "window.MutationObserver=" in text:
            error(f"Unexpected global MutationObserver replacement: assets/{path.name}")

    # Only i18n deliberately keeps one observer. It watches child additions so
    # Today/Driving UI created later can still be translated. All itinerary
    # decoration observers must remain removed.
    intentional = {"assets/i18n-v1.js"}
    found: dict[str, int] = {}
    for rel in itinerary_asset_paths(blocks["itineraryScripts"]):
        text = read(rel)
        count = direct_observer_count(text)
        if count:
            found[rel] = count

    unexpected = set(found) - intentional
    if unexpected:
        error("Unexpected itinerary MutationObserver users: " + ", ".join(sorted(unexpected)))
    missing_known = intentional - set(found)
    if missing_known:
        error("Intentional observer missing: " + ", ".join(sorted(missing_known)))
    for rel in intentional:
        if found.get(rel) != 1:
            error(f"Intentional observer count changed for {rel}: {found.get(rel, 0)}")

    v3 = read("assets/trip-enhancements-v3.js")
    if direct_observer_count(v3):
        error("trip-enhancements-v3.js must stay observer-free")
    if "[120,350,800,1600,2600]" not in v3:
        error("trip-enhancements-v3.js lost its bounded startup refresh strategy")

    v89 = read("assets/trip-v8-9-user-fixes.js")
    if direct_observer_count(v89):
        error("trip-v8-9-user-fixes.js must stay observer-free")
    if "[300,700,1200,2200]" not in v89 or "refreshLateUi" not in v89:
        error("trip-v8-9-user-fixes.js lost its bounded late-refresh strategy")

    v8_ui = read("assets/trip-v8-ui.js")
    if direct_observer_count(v8_ui):
        error("trip-v8-ui.js must stay observer-free; use bounded startup passes + click events")
    if "[120,350,800,1600,2600]" not in v8_ui or "setTimeout(enrichModal,0)" not in v8_ui:
        error("trip-v8-ui.js lost its bounded startup/click refresh strategy")

    i18n = read("assets/i18n-v1.js")
    if "observer.observe(document.documentElement,{subtree:true,childList:true})" not in i18n:
        error("i18n observer must stay scoped to documentElement child additions only")
    if "attributes:true" in i18n[i18n.find("function boot()"):] and direct_observer_count(i18n):
        error("i18n observer unexpectedly watches attributes")

    # Generic trips and Trip Info must not gain itinerary-only observers either.
    for name in ("tripInfoScripts", "genericItineraryScripts", "genericTripInfoScripts"):
        observed = {}
        for rel in itinerary_asset_paths(blocks[name]):
            count = direct_observer_count(read(rel))
            if count:
                observed[rel] = count
        allowed = intentional if name == "tripInfoScripts" else set()
        extra = set(observed) - allowed
        if extra:
            error(f"Unexpected observer users in {name}: " + ", ".join(sorted(extra)))

    print("TravelPilot observer QA")
    print("Intentional persistent observers:")
    for rel in sorted(intentional):
        print(f"  {rel}: {found.get(rel, 0)}")
    print("Remaining legacy itinerary observers: 0")
    print("Global MutationObserver overrides: 0")
    print(f"Errors: {len(ERRORS)}")
    for item in ERRORS:
        print(f"ERROR: {item}")
    if ERRORS:
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())