#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "v10.13.1"
PLAIN = "10.13.1"
PREVIOUS = "10.13.0"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly 1 match, found {count}")
    return text.replace(old, new, 1)


COMMON_SCRIPT = '''<script id="tripv2-common-script">
(function(){
    if (window.__tripV2CommonLoaded) return;
    window.__tripV2CommonLoaded = true;

    function ensureNetworkStatus(){
        let el = document.getElementById('tripv2NetworkStatus');
        if (!el) {
  el = document.createElement('div');
  el.id = 'tripv2NetworkStatus';
  el.className = 'tripv2-status';
  document.body.appendChild(el);
        }
        function refresh(){
  const online = navigator.onLine;
  el.textContent = online ? '🟢 Online' : '🟠 Offline';
  el.classList.toggle('offline', !online);
  el.title = online ? 'Live Cam / Google Maps 可正常使用' : 'Offline：行程可睇，但 Live Cam / Google Maps 需要網絡';
        }
        window.addEventListener('online', refresh);
        window.addEventListener('offline', refresh);
        refresh();
    }

    document.addEventListener('DOMContentLoaded', function(){
        ensureNetworkStatus();
    });
})();
</script>'''


def clean_legacy_html(path: str) -> None:
    text = read(path)

    css_pattern = re.compile(
        r"\n\.tripv2-update \{\n.*?\n\}\n"
        r"\.tripv2-update\.show \{ display: flex; \}\n"
        r"\.tripv2-update button \{\n.*?\n\}\n",
        re.S,
    )
    text, css_count = css_pattern.subn("\n", text)
    if css_count != 1:
        raise RuntimeError(f"{path}: expected one retired update CSS block, found {css_count}")

    mobile = "\n    .tripv2-update { bottom: 52px; }"
    if text.count(mobile) != 1:
        raise RuntimeError(f"{path}: expected one retired mobile update rule")
    text = text.replace(mobile, "", 1)

    script_pattern = re.compile(
        r'<script id="tripv2-common-script">\n.*?\n</script>',
        re.S,
    )
    text, script_count = script_pattern.subn(COMMON_SCRIPT, text)
    if script_count != 1:
        raise RuntimeError(f"{path}: expected one tripv2 common script, found {script_count}")

    for retired in (
        "tripv2UpdatePrompt",
        "tripv2ReloadBtn",
        "tripv2UpdateText",
        "tripv2-update",
        "ensureUpdatePrompt",
    ):
        if retired in text:
            raise RuntimeError(f"{path}: retired updater token remains: {retired}")
    if text.count("tripv2NetworkStatus") != 2:
        raise RuntimeError(f"{path}: network status block changed unexpectedly")

    write(path, text)


def clean_context() -> None:
    path = "assets/multi-trip-context-v1.js"
    text = read(path)
    text = replace_once(
        text,
        f"const APP_VERSION='v{PREVIOUS}';",
        f"const APP_VERSION='{VERSION}';",
        "APP_VERSION",
    )

    suppress_pattern = re.compile(
        r"/\* Compatibility only: old trip pages still contain a retired update banner\.\n"
        r"   Keep it visually disabled until those large legacy HTML files are migrated\. \*/\n"
        r"function suppressRetiredUpdateUi\(\)\{.*?\n\}\n\n",
        re.S,
    )
    text, n = suppress_pattern.subn("", text)
    if n != 1:
        raise RuntimeError(f"context: expected one suppression function, found {n}")

    text = replace_once(text, "  suppressRetiredUpdateUi();\n", "", "cleanupLegacySharedUi suppression call")
    text = replace_once(text, "suppressRetiredUpdateUi();\nif(shouldPersistActive())", "if(shouldPersistActive())", "startup suppression call")
    text = replace_once(
        text,
        "window.addEventListener('pageshow',()=>setTimeout(()=>{suppressRetiredUpdateUi();ensureVersionBadge();checkVersion(false);},250));",
        "window.addEventListener('pageshow',()=>setTimeout(()=>{ensureVersionBadge();checkVersion(false);},250));",
        "pageshow suppression call",
    )
    text = replace_once(
        text,
        "  document.addEventListener('DOMContentLoaded',()=>{syncBrand();suppressRetiredUpdateUi();},{once:true});",
        "  document.addEventListener('DOMContentLoaded',()=>{syncBrand();},{once:true});",
        "DOMContentLoaded suppression call",
    )
    text = replace_once(
        text,
        "[350,1200,2600].forEach(t=>setTimeout(()=>{syncBrand();suppressRetiredUpdateUi();},t));",
        "[350,1200,2600].forEach(t=>setTimeout(()=>{syncBrand();},t));",
        "delayed suppression call",
    )

    for retired in (
        "suppressRetiredUpdateUi",
        "multiTripRetiredUpdateUi",
        "tripv2UpdatePrompt",
        "multiTripUpdatePrompt",
        ".tripv2-update",
    ):
        if retired in text:
            raise RuntimeError(f"context: retired compatibility token remains: {retired}")
    write(path, text)


def bump_release_files() -> None:
    meta = json.loads(read("version.json"))
    if meta.get("version") != f"v{PREVIOUS}":
        raise RuntimeError(f"version.json expected v{PREVIOUS}, got {meta.get('version')}")
    meta.update(
        {
            "version": VERSION,
            "build": "2026-10-05.71",
            "updated": "2026-10-05T01:20:00+08:00",
            "notes": "Stage 4B legacy updater cleanup: remove the retired trip-page update popup code and CSS, remove the temporary runtime suppression shim, preserve the online/offline status indicator, and add regression QA so the retired updater cannot return.",
        }
    )
    write("version.json", json.dumps(meta, ensure_ascii=False, indent=2) + "\n")

    for path in ("index.html", "manifest.webmanifest"):
        text = read(path)
        if PREVIOUS not in text:
            raise RuntimeError(f"{path}: expected release pin {PREVIOUS}")
        write(path, text.replace(PREVIOUS, PLAIN))

    sw = read("sw.js")
    sw = replace_once(
        sw,
        f"const CACHE_NAME='travelpilot-v{PREVIOUS}-20261005';",
        f"const CACHE_NAME='travelpilot-{VERSION}-20261005';",
        "Service Worker cache name",
    )
    sw = replace_once(
        sw,
        f"assets/multi-trip-live-entry-v1.js?v={PREVIOUS}",
        f"assets/multi-trip-live-entry-v1.js?v={PLAIN}",
        "Service Worker Live Cam shim pin",
    )
    write("sw.js", sw)

    loader = read("assets/attraction-info.js")
    loader = replace_once(
        loader,
        f"assets/multi-trip-context-v1.js?v={PREVIOUS}",
        f"assets/multi-trip-context-v1.js?v={PLAIN}",
        "legacy loader runtime pin",
    )
    write("assets/attraction-info.js", loader)

    release_qa = read("scripts/qa_release.py")
    if 'previous = "10.12.1"' in release_qa:
        release_qa = replace_once(
            release_qa,
            'previous = "10.12.1"',
            f'previous = "{PREVIOUS}"',
            "release QA previous pin",
        )
    elif f'previous = "{PREVIOUS}"' not in release_qa:
        raise RuntimeError("release QA previous pin: expected 10.12.1 or 10.13.0")
    write("scripts/qa_release.py", release_qa)


def add_legacy_qa() -> None:
    qa = '''#!/usr/bin/env python3
"""Regression guard for retired trip-page update popup code."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []


def error(message: str) -> None:
    ERRORS.append(message)


retired_tokens = (
    "tripv2UpdatePrompt",
    "tripv2ReloadBtn",
    "tripv2UpdateText",
    "multiTripUpdatePrompt",
    "multiTripRetiredUpdateUi",
    "suppressRetiredUpdateUi",
    "ensureUpdatePrompt",
    ".tripv2-update",
)

runtime_files = [
    ROOT / "itinerary.html",
    ROOT / "trip-info.html",
    ROOT / "assets" / "multi-trip-context-v1.js",
]

for path in runtime_files:
    text = path.read_text(encoding="utf-8")
    for token in retired_tokens:
        if token in text:
            error(f"Retired updater token remains in {path.relative_to(ROOT)}: {token}")

for page in ("itinerary.html", "trip-info.html"):
    text = (ROOT / page).read_text(encoding="utf-8")
    if "tripv2NetworkStatus" not in text or "function ensureNetworkStatus" not in text:
        error(f"{page}: online/offline status indicator was removed with the updater")
    if "controllerchange" in text:
        error(f"{page}: retired Service Worker controllerchange listener remains")

context = (ROOT / "assets" / "multi-trip-context-v1.js").read_text(encoding="utf-8")
if "controllerchange" not in context:
    # The canonical runtime intentionally keeps only a comment documenting that
    # automatic controllerchange reloads are banned. This branch is informational.
    pass
if "there is no controllerchange listener and no automatic reload loop" not in context:
    error("Canonical runtime lost its explicit no-auto-reload contract")

print("TravelPilot retired updater QA")
print(f"Errors: {len(ERRORS)}")
for item in ERRORS:
    print(f"ERROR: {item}")
if ERRORS:
    sys.exit(1)
print("PASS")
'''
    write("scripts/qa_legacy_update.py", qa)

    workflow = read(".github/workflows/qa.yml")
    marker = "      - name: Run legacy update cleanup QA\n        run: python scripts/qa_legacy_update.py\n"
    if marker not in workflow:
        anchor = "      - name: Run observer regression QA\n        run: python scripts/qa_observers.py\n"
        if workflow.count(anchor) != 1:
            raise RuntimeError("qa.yml: observer QA anchor not found exactly once")
        workflow = workflow.replace(anchor, anchor + marker, 1)
    write(".github/workflows/qa.yml", workflow)


def final_guard() -> None:
    runtime = [
        "itinerary.html",
        "trip-info.html",
        "assets/multi-trip-context-v1.js",
    ]
    for path in runtime:
        text = read(path)
        for token in (
            "tripv2UpdatePrompt",
            "tripv2ReloadBtn",
            "multiTripUpdatePrompt",
            "suppressRetiredUpdateUi",
            ".tripv2-update",
        ):
            if token in text:
                raise RuntimeError(f"final guard: {token} remains in {path}")


if __name__ == "__main__":
    clean_legacy_html("itinerary.html")
    clean_legacy_html("trip-info.html")
    clean_context()
    bump_release_files()
    add_legacy_qa()
    final_guard()
    print("Stage 4B patch applied successfully")
