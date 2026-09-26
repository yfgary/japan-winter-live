from pathlib import Path
import re

CSS_TAG = '<link rel="stylesheet" href="assets/attraction-info.css?v=1">'
JS_TAG = '<script src="assets/attraction-info.js?v=1"></script>'


def link_assets(path):
    p = Path(path)
    s = p.read_text(encoding='utf-8')

    # Remove older copies if this script is rerun.
    s = re.sub(r'\s*<link rel="stylesheet" href="assets/attraction-info\.css\?v=\d+">', '', s)
    s = re.sub(r'\s*<script src="assets/attraction-info\.js\?v=\d+"></script>', '', s)

    if '</head>' not in s or '</body>' not in s:
        raise SystemExit(f'Missing head/body in {path}')

    s = s.replace('</head>', CSS_TAG + '\n\n</head>', 1)
    s = s.replace('</body>', JS_TAG + '\n\n</body>', 1)
    p.write_text(s, encoding='utf-8')


link_assets('itinerary.html')
link_assets('trip-info.html')

sw = Path('sw.js')
w = sw.read_text(encoding='utf-8')
w = re.sub(r'japan-winter-2027-v\d+', 'japan-winter-2027-v4', w, count=1)

entries = [
    '    "./assets/attraction-info.css",\n',
    '    "./assets/attraction-info.js",\n',
]

if '"./assets/attraction-info.css"' not in w:
    anchor = '    "./manifest.webmanifest",\n'
    if anchor not in w:
        raise SystemExit('manifest cache anchor not found')
    w = w.replace(anchor, anchor + entries[0] + entries[1], 1)

sw.write_text(w, encoding='utf-8')
print('Attraction assets linked; service worker bumped to v4')
