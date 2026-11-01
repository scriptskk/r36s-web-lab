# Private deployment

This deployment is for a single administrator. It is separate from the public open-source code. **Do not publish personal backups, ROMs, BIOS, session.key, SQLite files, passwords or environment files to GitHub.**

## Architecture

- Public GitHub repository: source code and tests only.
- Private instance: Python/Flask server bound to 127.0.0.1.
- Database: SQLite at ~/.local/share/r36s-web-lab/lab.sqlite3 by default, outside the repository.
- Authentication: one password hashed with scrypt (Werkzeug); session cookies HttpOnly, Secure by default, SameSite Strict, 8-hour lifetime.
- Protection: CSRF for changes, rate-limited login and an allowlist for static files.
- Audit log: timestamps, action names and bounded metadata. Excludes files, passwords, BIOS and ROM contents.
- Access: via private Tailscale network or HTTPS reverse proxy. Do not expose Flask directly to the internet.

## Setup on a secured Linux host

First inspect the server and ensure Python, virtualenv, free disk space and TLS access are working. Do not blindly install packages.

~~~bash
git clone https://github.com/scriptskk/r36s-web-lab.git
cd r36s-web-lab
python3 -m venv .venv
.venv/bin/pip install -r requirements-private.txt
.venv/bin/python -m private_server.manage init
.venv/bin/gunicorn -w 2 -b 127.0.0.1:8085 "private_server.app:create_app()"
~~~

The setup command prompts for a new unique password (16+ characters). Never put it into GitHub. These commands do NOT automatically configure HTTPS or access from other devices. Expose this loopback service only through a verified TLS reverse proxy or authenticated private-network tunnel (e.g., Tailscale Serve). Check firewalls and access restrictions first.

### Local development, loopback only

For temporary HTTP development, the following disables Secure cookies explicitly:

~~~bash
R36S_DEV_HTTP=1 .venv/bin/python -m private_server.app
~~~

This is unsafe for publicly accessible HTTP. Never set R36S_DEV_HTTP=1 on an internet-facing service.

## API

- GET /api/session: authenticated state and CSRF token.
- GET /api/audit?limit=60: most recent 1–100 events.
- POST /api/audit: CSRF-protected, allowlisted events. Example:

~~~json
{"action":"theme_updated","details":{"section":"Theme Studio"}}
~~~

These records are not cryptographically tamper-proof and do not automatically monitor Git commits, file changes outside the web interface or OS-level edits. They record actions the frontend submits. For forensic logging add OS/auditd and immutable backups.

## Backups and storage

- Firmware Lab selects local images for header-only inspection. It does not unpack or boot ArkOS.
- The ROM Player can request local game files and try external emulation cores.
- Uploading a complete SD card image to a server, mounting partitions, editing emulators and booting an RK3326 virtual machine are not yet implemented.
- Keep originals outside your web deployment as read-only backups. Never execute untrusted files found in a backup automatically.

## Tests

~~~bash
npm test
.venv/bin/python -m unittest private_server.test_app
~~~

## Publishing safety

This repository is public. Do not use GitHub Pages for a private instance: Pages has no server-side login. If Pages has been activated, unpublish the existing site from Settings → Pages. Removing the workflow does not take down previously published content.
