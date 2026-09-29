from pathlib import Path
import json

# itinerary: load final override last so it wins over older plan scripts.
p = Path('itinerary.html')
s = p.read_text(encoding='utf-8')
tag = '<script src="assets/trip-v9-final-fixes.js?v=1"></script>'
if tag not in s:
    if '</body>' not in s:
        raise SystemExit('itinerary.html has no </body>')
    s = s.replace('</body>', tag + '\n\n</body>', 1)
p.write_text(s, encoding='utf-8')

# Version badge code.
p = Path('assets/site-shell-v7.js')
s = p.read_text(encoding='utf-8')
s = s.replace("const INSTALLED_VERSION = 'v8.9';", "const INSTALLED_VERSION = 'v9.0';")
p.write_text(s, encoding='utf-8')

# PWA cache version and final script.
p = Path('sw.js')
s = p.read_text(encoding='utf-8')
first = s.splitlines()[0]
if first.startswith('const CACHE_NAME'):
    s = s.replace(first, 'const CACHE_NAME = "japan-winter-2027-v9.0-final-20260930";', 1)
entry = '    "./assets/trip-v9-final-fixes.js",\n'
if '"./assets/trip-v9-final-fixes.js"' not in s:
    anchor = '    "./assets/trip-v8-9-user-fixes.js",\n'
    if anchor not in s:
        raise SystemExit('sw.js anchor not found')
    s = s.replace(anchor, anchor + entry, 1)
p.write_text(s, encoding='utf-8')

Path('version.json').write_text(json.dumps({
    'version':'v9.0',
    'build':'2026-09-30.2',
    'updated':'2026-09-30T01:40:00+08:00',
    'notes':'D2 exact 3-photo layout; reliable D6-D8 Shinhotaka selector and matching photos; scheduled Hida Toshogu, Toyokawa Shiroyama Inari and Hirayu Shrine; detailed shrine guides; SA/PA and roadside rest-stop notes.'
}, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

print('v9.0 files patched')
