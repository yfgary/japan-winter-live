#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
RUNTIME_SUFFIXES = {".html", ".js", ".css", ".json", ".webmanifest"}

runtime_files: list[Path] = []
for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in RUNTIME_SUFFIXES:
        continue
    if ".git" in path.parts or "node_modules" in path.parts:
        continue
    runtime_files.append(path)

candidates = sorted(
    p for p in ASSETS.iterdir()
    if p.is_file() and p.suffix.lower() in {".js", ".css"}
)

def refs_for(name: str, *, ignore: Path | None = None) -> list[str]:
    refs: list[str] = []
    for path in runtime_files:
        if ignore is not None and path == ignore:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if name in text:
            refs.append(path.relative_to(ROOT).as_posix())
    return refs

print("TravelPilot orphan asset audit")
print(f"Runtime text files scanned: {len(runtime_files)}")
print(f"JS/CSS assets scanned: {len(candidates)}")
print("\nUNREFERENCED_LITERAL_CANDIDATES")
orphaned: list[Path] = []
for asset in candidates:
    if not refs_for(asset.name, ignore=asset):
        orphaned.append(asset)
        print(f"{asset.relative_to(ROOT).as_posix()}\t{asset.stat().st_size} bytes")
print(f"\nTotal unreferenced literal candidates: {len(orphaned)}")

aggregate = ASSETS / "bangkok-day-galleries-v1.css"
if aggregate.exists():
    aggregate_lines = {line.strip() for line in aggregate.read_text(encoding="utf-8").splitlines() if line.strip()}
    print("\nBANGKOK_DUPLICATE_CHECK")
    print("aggregate refs: " + ", ".join(refs_for(aggregate.name, ignore=aggregate)))
    for asset in orphaned:
        if asset.name.startswith("bangkok-gallery-d") and asset.suffix == ".css":
            payload = asset.read_text(encoding="utf-8").strip()
            print(f"{asset.name}: {'EXACT_RULE_IN_AGGREGATE' if payload in aggregate_lines else 'NOT_EXACT'}")

print("\nNOTE: This is an audit only. Dynamic references still require manual review before deletion.")
