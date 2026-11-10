#!/usr/bin/env python3
"""Publish the verified UI on the existing Linux origin; never replace the API.

Upload this script, a dist-only tar.gz and the build manifest, then run as root.
The generated backup contains a guarded rollback command and original branding.
"""
import argparse
import fcntl
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import tarfile
import urllib.error
import urllib.request

ROOT = Path('/var/www/blessing-api')
CONFIG = Path('/etc/nginx/conf.d/sub2api.conf')
BACKUPS = Path('/var/backups/blessing-api')
DOMAIN = 'api.blessingshs.cc.cd'
BRAND = {
    'site_name': 'Blessing API',
    'site_subtitle': '一个入口，管理你的 API 密钥、连接常用工具，让灵感与日常工作顺畅衔接。',
}
PROBES = [('/health', 'GET'), ('/setup/status', 'GET'),
          ('/api/v1/keys', 'GET'), ('/api/v1/admin/users', 'GET'),
          ('/v1/models', 'GET'), ('/v1/responses', 'GET'),
          ('/v1/chat/completions', 'POST'), ('/v1/messages', 'POST'),
          ('/v1beta/models', 'GET'), ('/v1beta/models/test:generateContent', 'POST'),
          ('/responses', 'GET'), ('/custom-voices', 'GET')]


def run(args, stdin=None):
    result = subprocess.run(args, input=stdin, text=True, encoding='utf-8',
                            capture_output=True, check=True)
    return result.stdout.strip()


def digest(data):
    return hashlib.sha256(data).hexdigest()


def atomic(path, data, mode=0o644):
    temp = path.with_name(path.name + '.blessing-tmp')
    temp.write_bytes(data)
    temp.chmod(mode)
    os.replace(temp, path)


def switch_link(target):
    current = ROOT / 'current'
    if not target:
        if current.is_symlink():
            current.unlink()
        return
    temp = ROOT / 'current.next'
    if temp.is_symlink():
        temp.unlink()
    temp.symlink_to(target)
    os.replace(temp, current)


def http(path, method='GET', port=80):
    request = urllib.request.Request('http://127.0.0.1:%s%s' % (port, path),
                                    data=b'{}' if method == 'POST' else None,
                                    headers={'Host': DOMAIN, 'Content-Type': 'application/json'},
                                    method=method)
    try:
        response = urllib.request.urlopen(request, timeout=20)
    except urllib.error.HTTPError as error:
        response = error
    return response.status, dict(response.headers), response.read()


def sql(query):
    return run(['docker', 'exec', '-i', 'sub2api-postgres', 'psql', '-X', '-U',
                'sub2api', '-d', 'sub2api', '-At', '-v', 'ON_ERROR_STOP=1'], query)


def quote(value):
    return "'" + value.replace("'", "''") + "'"


def brand_rows():
    return json.loads(sql("SELECT json_agg(t) FROM (SELECT key,value,updated_at FROM settings "
                          "WHERE key IN ('site_name','site_subtitle') ORDER BY key) t;"))


def change_brand(expected, replacements):
    # Lock both rows and reject concurrent edits instead of overwriting them.
    body = []
    for row in expected:
        key = row['key']
        body.append("PERFORM 1 FROM settings WHERE key=%s AND value=%s FOR UPDATE; "
                    "IF NOT FOUND THEN RAISE EXCEPTION 'Brand settings changed concurrently'; END IF;"
                    % (quote(key), quote(row['value'])))
    for row in replacements:
        timestamp = quote(row['updated_at']) + '::timestamptz' if row.get('updated_at') else 'now()'
        body.append('UPDATE settings SET value=%s,updated_at=%s WHERE key=%s;'
                    % (quote(row['value']), timestamp, quote(row['key'])))
    sql('BEGIN; DO $blessing$ BEGIN ' + '\n'.join(body) + ' END; $blessing$; COMMIT;')


def snapshot_probes():
    return {method + ' ' + path: [status, headers.get('Content-Type', '')]
            for path, method in PROBES
            for status, headers, _ in [http(path, method)]}


def static_configuration(original, release, routes, headers):
    marker = '    location / {'
    if original.count(marker) != 1:
        raise RuntimeError('Expected exactly one original catch-all proxy')
    proxy = re.search(r'    location / \{\n(.*?)\n    \}', original, re.S).group(1)
    if 'proxy_pass http://127.0.0.1:8080;' not in proxy:
        raise RuntimeError('Unexpected upstream proxy')
    # A prior UI release is removed; the original catch-all remains intact.
    original = re.sub(r'    # BEGIN BLESSING UI\n.*?    # END BLESSING UI\n\n', '', original, flags=re.S)
    security = []
    for key in ['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy']:
        value = headers.get(key)
        if not value:
            raise RuntimeError('Missing upstream security header: ' + key)
        value = re.sub(r"\s*'nonce-[^']+'", '', value)
        if any(char in value for char in '\r\n$'):
            raise RuntimeError('Unexpected security header syntax')
        value = value.replace('\\', '\\\\').replace('"', '\\"')
        security.append('        add_header %s "%s" always;' % (key, value))
    security = '\n'.join(security)
    fixed = [route for route in routes if ':' not in route and route != '/']
    patterns = [re.escape(route) for route in sorted(set(fixed + ['/index.html']))]
    patterns += ['/legal/[^/]+', '/custom/[^/]+']
    pattern = '^(?:' + '|'.join(patterns) + ')/?$'
    block = '''    # BEGIN BLESSING UI
    root /var/www/blessing-api/current;
    location = / {
        try_files /index.html =404;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
%s
    }
    location ~ %s {
        try_files /index.html =404;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
%s
    }
    location = /logo.svg {
        try_files /logo.svg =404;
        add_header Cache-Control "no-cache" always;
%s
    }
    location ^~ /assets/ {
        root /var/www/blessing-api/shared;
        try_files $uri @blessing_original_assets;
        add_header Cache-Control "public, max-age=31536000, immutable";
%s
    }
    location @blessing_original_assets {
%s
    }
    # END BLESSING UI

''' % (security, pattern, security, security, security, proxy)
    return original.replace(marker, block + marker)


def restore(backup, guarded=True):
    state = json.loads((backup / 'state.json').read_text())
    if guarded and digest(CONFIG.read_bytes()) != state['deployedConfigSha256']:
        raise RuntimeError('Nginx configuration changed since deployment; review backup manually')
    # UI recovery must not depend on PostgreSQL availability. A concurrent brand
    # edit belongs to its author and must never be overwritten by rollback.
    atomic(CONFIG, (backup / 'sub2api.conf').read_bytes())
    switch_link(state['previousCurrent'])
    run(['nginx', '-t'])
    run(['systemctl', 'reload', 'nginx'])
    print('UI ROLLED BACK ' + str(backup), flush=True)
    try:
        expected = [{'key': key, 'value': value} for key, value in state['newBrand'].items()]
        current_rows = brand_rows()
        if {r['key']: r['value'] for r in current_rows} == state['newBrand']:
            change_brand(expected, state['originalBrand'])
        elif {r['key']: r['value'] for r in current_rows} != {r['key']: r['value'] for r in state['originalBrand']}:
            raise RuntimeError('Brand settings changed concurrently; preserved their new values')
        print('ORIGINAL BRAND RESTORED', flush=True)
    except Exception as error:
        print('UI restored; branding recovery requires review: ' + str(error), flush=True)


def deploy(args):
    if not re.fullmatch(r'[0-9]{8}T[0-9]{6}Z', args.release):
        raise RuntimeError('Release must be a UTC timestamp')
    archive = Path(args.archive)
    if digest(archive.read_bytes()) != args.sha256:
        raise RuntimeError('Archive checksum mismatch')
    manifest = json.loads(Path(args.manifest).read_text())
    if manifest['baselineCommit'] != args.baseline:
        raise RuntimeError('Build baseline mismatch')
    live_commit = run(['docker', 'inspect', '-f', '{{index .Config.Labels "org.opencontainers.image.revision"}}', 'sub2api'])
    if live_commit != args.baseline:
        raise RuntimeError('Running backend changed: ' + live_commit)
    container = run(['docker', 'inspect', '-f', '{{.Id}}', 'sub2api'])
    original = CONFIG.read_bytes()
    previous = ROOT / 'current'
    if previous.exists() and not previous.is_symlink():
        raise RuntimeError('current must be a symlink')
    previous_target = os.readlink(previous) if previous.is_symlink() else None
    branding = brand_rows()
    if {row['key'] for row in branding} != set(BRAND):
        raise RuntimeError('Expected both existing branding settings')
    before = snapshot_probes()
    if before['GET /health'][0] != 200 or before['GET /v1/models'][0] != 401:
        raise RuntimeError('Backend baseline health failed')
    upstream_status, upstream_headers, upstream_html = http('/', port=8080)
    if upstream_status != 200:
        raise RuntimeError('Upstream UI unavailable')
    release = ROOT / 'releases' / args.release
    release.mkdir(parents=True, mode=0o755, exist_ok=False)
    with tarfile.open(archive) as bundle:
        for member in bundle.getmembers():
            path = PurePosixPath(member.name)
            if path.is_absolute() or '..' in path.parts or not (member.isfile() or member.isdir()):
                raise RuntimeError('Unsafe archive member: ' + member.name)
            if path.parts and path.parts[0] not in ('assets', 'index.html', 'logo.svg'):
                raise RuntimeError('Unexpected archive member: ' + member.name)
        bundle.extractall(release)
    for path in release.rglob('*'):
        path.chmod(0o755 if path.is_dir() else 0o644)
    index = (release / 'index.html').read_bytes()
    if digest(index) != manifest['indexSha256']:
        raise RuntimeError('Index checksum mismatch')
    if re.search(rb'<script(?![^>]*\bsrc=)[^>]*>', index):
        raise RuntimeError('Static CSP requires external scripts')
    routes = json.loads(Path(args.routes).read_text())
    candidate = static_configuration(original.decode(), release, routes, upstream_headers).encode()
    shared = ROOT / 'shared' / 'assets'
    shared.mkdir(parents=True, exist_ok=True)
    for source in (release / 'assets').rglob('*'):
        target = shared / source.relative_to(release / 'assets')
        if source.is_dir():
            target.mkdir(exist_ok=True)
        elif target.exists() and digest(target.read_bytes()) != digest(source.read_bytes()):
            raise RuntimeError('Hashed asset collision: ' + str(source))
        elif not target.exists():
            shutil.copy2(source, target)
    backup = BACKUPS / args.release
    backup.mkdir(parents=True, mode=0o700, exist_ok=False)
    backup.chmod(0o700)
    (backup / 'sub2api.conf').write_bytes(original)
    (backup / 'deployed-sub2api.conf').write_bytes(candidate)
    shutil.copy2(args.manifest, backup / 'build-manifest.json')
    shutil.copy2(__file__, backup / 'publish-blessing-frontend.py')
    state = {'release': args.release, 'containerId': container, 'originalBrand': branding,
             'newBrand': BRAND, 'previousCurrent': previous_target, 'baselineCommit': args.baseline,
             'deployedConfigSha256': digest(candidate), 'probesBefore': before,
             'archiveSha256': args.sha256, 'indexSha256': manifest['indexSha256']}
    (backup / 'state.json').write_text(json.dumps(state, ensure_ascii=False, indent=2))
    (backup / 'rollback.sh').write_text('#!/bin/sh\nset -eu\npython3 ' + str(backup / 'publish-blessing-frontend.py') + ' rollback --backup ' + str(backup) + '\n')
    (backup / 'rollback.sh').chmod(0o700)
    if CONFIG.read_bytes() != original:
        raise RuntimeError('Nginx configuration changed during staging')
    try:
        switch_link(str(release))
        atomic(CONFIG, candidate)
        print('STAGED ' + str(release), flush=True)
        run(['nginx', '-t'])
        change_brand(branding, [{'key': key, 'value': value} for key, value in BRAND.items()])
        run(['systemctl', 'reload', 'nginx'])
        # New requests must observe the new config and all original gateway routes.
        import time
        time.sleep(1)
        for route in ['/', '/home', '/login', '/guide', '/register', '/dashboard', '/admin/settings', '/auth/oauth/callback', '/docs/batch-image']:
            status, headers, body = http(route)
            if status != 200 or digest(body) != manifest['indexSha256']:
                raise RuntimeError('Static page verification failed: ' + route)
        for asset in re.findall(rb'(?:src|href)="(/assets/[^"?#]+)', index):
            route = asset.decode()
            status, headers, body = http(route)
            if status != 200 or digest(body) != digest((release / route.lstrip('/')).read_bytes()):
                raise RuntimeError('Asset verification failed: ' + route)
            if 'text/html' in headers.get('Content-Type', ''):
                raise RuntimeError('Invalid asset MIME type: ' + route)
        after = snapshot_probes()
        if after != before:
            raise RuntimeError('Gateway routes changed: ' + json.dumps(after))
        if run(['docker', 'inspect', '-f', '{{.Id}}', 'sub2api']) != container:
            raise RuntimeError('API container changed concurrently')
        status, _, body = http('/api/v1/settings/public')
        settings = json.loads(body)['data']
        if status != 200 or any(settings.get(key) != value for key, value in BRAND.items()):
            raise RuntimeError('Public branding verification failed')
        state['probesAfter'] = after
        state['verified'] = True
        (backup / 'state.json').write_text(json.dumps(state, ensure_ascii=False, indent=2))
        print(json.dumps({'status': 'DEPLOYED', 'release': str(release), 'backup': str(backup),
                          'indexSha256': manifest['indexSha256'], 'containerUnchanged': True,
                          'probes': after}, indent=2), flush=True)
    except Exception:
        restore(backup, guarded=False)
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    publish = sub.add_parser('deploy')
    for name in ['archive', 'sha256', 'manifest', 'routes', 'release', 'baseline']:
        publish.add_argument('--' + name, required=True)
    rollback = sub.add_parser('rollback')
    rollback.add_argument('--backup', required=True)
    args = parser.parse_args()
    with open('/run/lock/blessing-api-deploy.lock', 'w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if args.command == 'rollback':
            restore(Path(args.backup))
        else:
            deploy(args)


if __name__ == '__main__':
    main()
