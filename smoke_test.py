"""
KRISHX smoke test - exercises the shared Flask API the way the Web
frontend (frontend/src/api.js) and the Android app (mobile/src/config.js)
actually call it, and reports pass/fail + latency for each platform.

Usage:
    python smoke_test.py
    python smoke_test.py --web-url http://127.0.0.1:5000 --android-url http://172.20.10.3:5000
    python smoke_test.py --skip-android
    python smoke_test.py --skip-web

Defaults mirror the two client configs:
    Web target      -> frontend/src/api.js            (http://127.0.0.1:5000)
    Android target  -> mobile/src/config.js production (https://just-bul-krishx-backend.hf.space)

Exit code is 0 if every check on every tested platform passed, 1 otherwise.
"""
import argparse
import io
import sys
import time

import requests
from PIL import Image

# Note: 127.0.0.1, not localhost - on Windows, resolving "localhost" through
# requests/urllib3 can add a multi-second IPv6-then-IPv4 fallback delay that
# has nothing to do with actual server latency.
WEB_DEFAULT_URL     = 'http://127.0.0.1:5000'
ANDROID_DEFAULT_URL = 'https://just-bul-krishx-backend.hf.space'

SAMPLE_SOIL = {
    'Temparature': 26.0, 'Humidity': 65.0, 'Moisture': 40.0,
    'Nitrogen': 40.0, 'Phosphorous': 35.0, 'Potassium': 30.0,
}

TIMEOUT_SEC = 30


def _dummy_pest_image() -> bytes:
    """Synthetic in-memory image, same shape convention as pest_model.test_model()."""
    img = Image.new('RGB', (224, 224), color=(120, 150, 90))
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    buf.seek(0)
    return buf.read()


class Check:
    def __init__(self, name, method, path, **kwargs):
        self.name, self.method, self.path, self.kwargs = name, method, path, kwargs
        self.status = None
        self.latency_ms = None
        self.ok = False
        self.error = None
        self.response_json = None


def run_checks(base_url: str) -> list:
    session = requests.Session()
    checks = [
        Check('Health check',            'GET',  '/health'),
        Check('Soil types',              'GET',  '/soil_types'),
        Check('Pest classes',            'GET',  '/pest_classes'),
        Check('Model info',              'GET',  '/model_info'),
        Check('Recommend crops',         'POST', '/recommend_crops', json=SAMPLE_SOIL),
        Check('Predict (full pipeline)', 'POST', '/predict', json=SAMPLE_SOIL),
        Check('Pest detect (image)',     'POST', '/pest-detect',
              files={'image': ('leaf.jpg', _dummy_pest_image(), 'image/jpeg')}),
        Check('History (anonymous)',     'GET',  '/history'),
    ]

    top_crop = None
    for check in checks:
        url = base_url.rstrip('/') + check.path
        try:
            start = time.perf_counter()
            resp = session.request(check.method, url, timeout=TIMEOUT_SEC, **check.kwargs)
            check.latency_ms = (time.perf_counter() - start) * 1000
            check.status = resp.status_code
            check.ok = resp.status_code == 200
            try:
                check.response_json = resp.json()
            except ValueError:
                pass
            if check.name == 'Recommend crops' and check.ok:
                crops = (check.response_json or {}).get('Recommended Crops') or []
                top_crop = crops[0] if crops else None
        except requests.exceptions.RequestException as e:
            check.error = str(e)

    # Fertilizer check depends on a crop name from the "Recommend crops" call above,
    # so it runs after the loop rather than being hardcoded to a guessed crop.
    fert_check = Check('Recommend fertilizer', 'POST', '/recommend_fertilizer', json={
        'Crop': top_crop or 'rice',
        'Nitrogen': SAMPLE_SOIL['Nitrogen'],
        'Phosphorous': SAMPLE_SOIL['Phosphorous'],
        'Potassium': SAMPLE_SOIL['Potassium'],
    })
    url = base_url.rstrip('/') + fert_check.path
    try:
        start = time.perf_counter()
        resp = session.request(fert_check.method, url, timeout=TIMEOUT_SEC, **fert_check.kwargs)
        fert_check.latency_ms = (time.perf_counter() - start) * 1000
        fert_check.status = resp.status_code
        fert_check.ok = resp.status_code == 200
    except requests.exceptions.RequestException as e:
        fert_check.error = str(e)
    checks.append(fert_check)

    return checks


def print_report(platform: str, base_url: str, checks: list) -> bool:
    print(f'\n=== {platform} - {base_url} ===')
    print(f'{"Check":<24} {"Method":<6} {"Status":<8} {"Latency":>10}  Result')
    print('-' * 66)

    latencies = []
    all_ok = True
    for c in checks:
        if c.error:
            print(f'{c.name:<24} {c.method:<6} {"ERR":<8} {"-":>10}  FAIL  ({c.error})')
            all_ok = False
            continue
        latencies.append(c.latency_ms)
        result = 'PASS' if c.ok else 'FAIL'
        if not c.ok:
            all_ok = False
        print(f'{c.name:<24} {c.method:<6} {c.status:<8} {c.latency_ms:>8.1f}ms  {result}')

    if latencies:
        print('-' * 66)
        print(f'Avg latency: {sum(latencies)/len(latencies):.1f}ms   '
              f'Max: {max(latencies):.1f}ms   Min: {min(latencies):.1f}ms')
    return all_ok


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--web-url', default=WEB_DEFAULT_URL, help='Backend URL the Web frontend targets')
    parser.add_argument('--android-url', default=ANDROID_DEFAULT_URL, help='Backend URL the Android app targets')
    parser.add_argument('--skip-web', action='store_true')
    parser.add_argument('--skip-android', action='store_true')
    args = parser.parse_args()

    overall_ok = True
    results = {}

    if not args.skip_web:
        checks = run_checks(args.web_url)
        results['Web'] = checks
        overall_ok &= print_report('WEB', args.web_url, checks)

    if not args.skip_android:
        checks = run_checks(args.android_url)
        results['Android'] = checks
        overall_ok &= print_report('ANDROID', args.android_url, checks)

    if len(results) == 2:
        web_lat = [c.latency_ms for c in results['Web'] if c.latency_ms is not None]
        and_lat = [c.latency_ms for c in results['Android'] if c.latency_ms is not None]
        print('\n=== Web vs Android - avg latency ===')
        if web_lat:
            print(f'Web:     {sum(web_lat)/len(web_lat):.1f}ms avg over {len(web_lat)} calls')
        if and_lat:
            print(f'Android: {sum(and_lat)/len(and_lat):.1f}ms avg over {len(and_lat)} calls')

    print(f'\nOverall: {"ALL CHECKS PASSED" if overall_ok else "SOME CHECKS FAILED"}')
    sys.exit(0 if overall_ok else 1)


if __name__ == '__main__':
    main()
