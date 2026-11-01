"""Private single-user application and audit API for R36S Web Lab.

Start behind a TLS reverse proxy, bound to 127.0.0.1. Nothing in GitHub Pages
can securely host this authentication layer.
"""
from __future__ import annotations
import json
import os
import secrets
import sqlite3
import time
from datetime import timedelta
from pathlib import Path

from flask import Flask, abort, jsonify, redirect, render_template_string, request, send_from_directory, session, url_for
from flask_wtf import CSRFProtect
from flask_wtf.csrf import generate_csrf
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import check_password_hash, generate_password_hash

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.environ.get("R36S_DATA_DIR", str(Path.home() / ".local/share/r36s-web-lab"))).expanduser().resolve()
ALLOWED_EVENTS = {
    "theme_updated", "theme_exported", "theme_reset", "gamelist_imported",
    "library_reset", "snapshot_exported", "firmware_inspected", "rom_launch_requested",
    "model_opened", "backup_indexed",
    "project_imported", "project_preview_updated", "project_exported", "project_source_loaded", "project_runtime_launched"
}
ALLOWED_STATIC = {"index.html", "styles.css", "premium.css", "monochrome.css", "project-runtime.html", "rom-player.html", "rom-player.css", "assets/icon.svg"}
LOGIN_HTML = """<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>R36S Web Lab · Acesso privado</title>
<style>:root{color-scheme:dark;font-family:system-ui,Arial,sans-serif;background:#080e18;color:#e6eefb}*{box-sizing:border-box}body{min-height:100vh;margin:0;display:grid;place-items:center;padding:20px;background:radial-gradient(ellipse at top,#18314b,#080e18 70%)}main{max-width:420px;width:100%;background:#121d2c;border:1px solid #2c435a;border-radius:14px;padding:27px}h1{margin:5px 0 10px}p{color:#9fb2c8;font-size:13px;line-height:1.6}label{display:block;margin:20px 0 7px;font-size:12px}input{width:100%;font:inherit;padding:13px;color:inherit;background:#0d1623;border:1px solid #37516b;border-radius:7px}button{margin-top:18px;font:inherit;width:100%;padding:12px;border-radius:8px;background:#28527f;border:1px solid #457baf;color:white;cursor:pointer}.error{color:#ffb4b4}.small{font-size:11px}button:focus-visible,input:focus-visible{outline:2px solid #9fcaff;outline-offset:2px}</style></head><body><main><p>R36S WEB LAB / PRIVATE WORKSPACE</p><h1>Acesso ao laboratório</h1><p>Somente a conta administradora pode acessar arquivos, ferramentas e registros desta instância.</p>
{% if error %}<p class="error" role="alert">{{ error }}</p>{% endif %}
<form action="/login" method="post"><input type="hidden" name="csrf_token" value="{{ csrf_token() }}"><label for="password">Senha de administrador</label><input id="password" type="password" name="password" autocomplete="current-password" minlength="20" required autofocus><button type="submit">Entrar no laboratório</button></form>
<p class="small">A autenticação existe somente no servidor privado. Nenhuma senha é armazenada no código-fonte ou no GitHub.</p></main></body></html>"""


def setup_data():
    DATA_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
    try:
        os.chmod(DATA_DIR, 0o700)
    except OSError:
        pass
    key_file = DATA_DIR / "session.key"
    if not key_file.exists():
        fd = os.open(key_file, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        with os.fdopen(fd, "w") as out:
            out.write(secrets.token_hex(48))
    with sqlite3.connect(DATA_DIR / "lab.sqlite3") as db:
        db.execute("CREATE TABLE IF NOT EXISTS admin (id INTEGER PRIMARY KEY CHECK(id=1), password_hash TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1)")
        db.execute("""CREATE TABLE IF NOT EXISTS audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            occurred_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
            action TEXT NOT NULL, details_json TEXT NOT NULL, origin TEXT NOT NULL)""")
        db.execute("CREATE INDEX IF NOT EXISTS audit_time ON audit(id DESC)")
        db.commit()
    try:
        os.chmod(DATA_DIR / "lab.sqlite3", 0o600)
    except OSError:
        pass
    return key_file.read_text().strip()


def bootstrap_admin():
    """Provision the first admin from a provider-managed secret, never from Git."""
    with db_connect() as db:
        existing = db.execute("SELECT id FROM admin WHERE id=1").fetchone()
        if existing:
            return False
        password = os.environ.pop("R36S_INITIAL_PASSWORD", "")  # Clear runtime copy after bootstrap.
        if len(password) < 20 or len(password) > 512:
            if os.environ.get("R36S_REQUIRE_ADMIN_ON_START") == "1":
                raise RuntimeError("Defina R36S_INITIAL_PASSWORD (20+ caracteres) no painel privado da hospedagem.")
            return False
        hashed = generate_password_hash(password, method="scrypt")
        db.execute("INSERT OR IGNORE INTO admin(id,password_hash,version) VALUES(1,?,1)", (hashed,))
        created = db.execute("SELECT changes()").fetchone()[0] == 1
        if created:
            db.execute("INSERT INTO audit(action,details_json,origin) VALUES('admin_initialized','{}','server')")
        db.commit()
    return created


def db_connect():
    conn = sqlite3.connect(DATA_DIR / "lab.sqlite3", timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def audit(action: str, details: dict | None = None, origin="browser"):
    payload = json.dumps(details or {}, separators=(",", ":"), ensure_ascii=False)
    if len(payload.encode("utf-8")) > 1024:
        raise ValueError("Detalhes excedem 1 KB")
    with db_connect() as db:
        db.execute("INSERT INTO audit(action, details_json, origin) VALUES(?,?,?)", (action, payload, origin))
        db.commit()


def create_app():
    secret = setup_data()
    bootstrap_admin()
    app = Flask(__name__, static_folder=None)
    app.secret_key = secret
    app.config.update(
        SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Strict",
        SESSION_COOKIE_SECURE=(os.environ.get("R36S_DEV_HTTP") != "1"),
        PERMANENT_SESSION_LIFETIME=timedelta(hours=8),
        MAX_CONTENT_LENGTH=8192,
        WTF_CSRF_TIME_LIMIT=3600
    )
    CSRFProtect(app)
    limiter = Limiter(get_remote_address, app=app, storage_uri="memory://", default_limits=[])
    app.json.ensure_ascii = False

    @app.after_request
    def secure_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Robots-Tag"] = "noindex, nofollow, noarchive"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'; "
            "frame-src 'self' https://sketchfab.com; object-src 'none'; "
            "script-src 'self' https://cdn.emulatorjs.org 'wasm-unsafe-eval'; "
            "connect-src 'self' blob: https://cdn.emulatorjs.org; "
            "img-src 'self' data: blob: https:; media-src blob: 'self'; "
            "style-src 'self' 'unsafe-inline' https://cdn.emulatorjs.org; "
            "font-src 'self' data: https://cdn.emulatorjs.org"
        )
        return response

    def signed_in():
        if session.get("admin") != 1:
            return False
        with db_connect() as db:
            row = db.execute("SELECT version FROM admin WHERE id=1").fetchone()
        return bool(row and session.get("auth_version") == row["version"])

    @app.before_request
    def require_auth():
        # Credentials never become available to a static hosting provider.
        if request.path in ("/login", "/healthz"):
            return None
        if not signed_in():
            if request.path.startswith("/api/"):
                return jsonify(error="Sessão não autenticada"), 401
            return redirect(url_for("login"))
        return None

    @app.get("/healthz")
    def healthz():
        return jsonify(status="ok")

    @app.route("/login", methods=["GET", "POST"])
    @limiter.limit("5 per minute;20 per hour")
    def login():
        if request.method == "GET":
            if signed_in():
                return redirect(url_for("root"))
            return render_template_string(LOGIN_HTML, error=None)
        password = request.form.get("password", "")[:1024]
        with db_connect() as db:
            row = db.execute("SELECT password_hash, version FROM admin WHERE id=1").fetchone()
        if row and check_password_hash(row["password_hash"], password):
            session.clear()
            session["admin"] = 1
            session["auth_version"] = row["version"]
            session.permanent = True
            audit("login_success", {}, "server")
            return redirect(url_for("root"))
        # No password, filenames or supplied secrets are recorded.
        audit("login_failed", {}, "server")
        time.sleep(0.3)
        return render_template_string(LOGIN_HTML, error="Senha incorreta."), 401

    @app.post("/logout")
    def logout():
        audit("logout", {}, "server")
        session.clear()
        return redirect(url_for("login"))

    @app.get("/api/session")
    def api_session():
        return jsonify(authenticated=True, csrf_token=generate_csrf(), mode="private")

    @app.route("/api/audit", methods=["GET", "POST"])
    def api_audit():
        if request.method == "GET":
            raw_limit = request.args.get("limit", "60")
            try:
                limit = max(1, min(int(raw_limit), 100))
            except ValueError:
                abort(400)
            with db_connect() as db:
                rows = db.execute("SELECT id,occurred_at,action,details_json,origin FROM audit ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
            return jsonify(events=[{"id": r["id"], "at": r["occurred_at"], "action": r["action"],
                                   "details": json.loads(r["details_json"]), "origin": r["origin"]} for r in rows])
        obj = request.get_json(silent=True)
        if not isinstance(obj, dict) or obj.get("action") not in ALLOWED_EVENTS:
            return jsonify(error="Evento inválido"), 400
        raw = obj.get("details", {})
        if not isinstance(raw, dict) or len(raw) > 8:
            return jsonify(error="Detalhes inválidos"), 400
        # Store only bounded metadata. No filenames, uploaded bytes or arbitrary notes.
        details = {}
        for key, val in raw.items():
            if key in {"system", "format", "section"} and isinstance(val, str):
                details[key] = val[:40]
            elif key in {"count", "size_bytes"} and isinstance(val, int) and 0 <= val <= (1 << 50):
                details[key] = val
        audit(obj["action"], details, "browser")
        return jsonify(ok=True), 201

    @app.get("/")
    def root():
        return send_from_directory(ROOT, "index.html")

    @app.get("/<path:filename>")
    def static_assets(filename):
        if filename not in ALLOWED_STATIC and not (filename.startswith("src/") and filename.endswith(".js") and filename.count("/") == 1):
            abort(404)
        return send_from_directory(ROOT, filename)

    return app


if __name__ == "__main__":
    if os.environ.get("R36S_DEV_HTTP") != "1":
        raise SystemExit("Use gunicorn + HTTPS/Tailscale. HTTP de desenvolvimento exige R36S_DEV_HTTP=1.")
    create_app().run(host="127.0.0.1", port=8085, debug=False)
