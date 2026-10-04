#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
RUNTIME_SUFFIXES = {".html", ".js", ".css", ".json", ".webmanifest"}
EXCLUDE_FILES = {Path(__file__).name}

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

print("TravelPilot orphan asset audit")
print(f"Runtime text files scanned: {len(runtime_files)}")
print(f"JS/CSS assets scanned: {len(candidates)}")
print("\nUNREFERENCED_LITERAL_CANDIDATES")
count = 0
for asset in candidates:
    needle = asset.name
    refs: list[str] = []
    for path in runtime_files:
        if path == asset:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if needle in text:
            refs.append(path.relative_to(ROOT).as_posix())
    if not refs:
        count += 1
        print(f"{asset.relative_to(ROOT).as_posix()}\t{asset.stat().st_size} bytes")
print(f"\nTotal unreferenced literal candidates: {count}")
print("NOTE: This is an audit only. Dynamic references still require manual review before deletion.")
