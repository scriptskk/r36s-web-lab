# Changelog

## [0.5.0] — 2026-11-01

- Premium, responsive page shell and separate light/dark appearance stored locally.
- Sidebar reorganized into Console, Laboratório and Comunidade.
- Dedicated expandable Projetos da comunidade folder, with Slot.R36S and PKForge R36S project directory cards.
- Reworked navigable 2D R36S front, with correct LCD aspect, front grille, FN, Select/Start, ABXY and analog placement.
- Cloudflare and optional Flask bundles updated to serve premium.css and site-theme.js.
- Automated tests for appearance modes, project folder and navigation controls.
- **Limits:** CSS representation is not a calibrated physical mesh; Sketchfab remains external and ArkOS is not booted.


## [0.4.0] — 2026-11-01

- Two isolated visual workspaces named Slot.R36S and PKForge R36S.
- Import local HTML, CSS and image assets with size/path validation; render a sandboxed, script-disabled 640×480 live preview.
- Debounced HTML/CSS editing and browser-local export of static HTML snapshot.
- D1 audit event types for source import, preview change and preview export.
- No integrated Slot/PKForge source code, JavaScript execution, ArkOS boot or accurate RK3326 emulation.


## Cloudflare Free deployment preparation — 2026-11-01

- Added a Cloudflare Worker with signed Access JWT verification for every asset and API request, administrator email allowlist and CSRF-protected events.
- Added D1-backed log API, isolated web-only build output and Wrangler configuration.
- Added free-tier deployment guide, requiring user-owned Cloudflare setup before site can go online.
- No ArkOS boot, full backup storage or hardware emulation is claimed.

## [0.3.0] — 2026-11-01

### Added

- Standard R36S hardware reference profile and checks for 640 × 480, 4:3, 1 GiB and 4 cores.
- 2D console shell outline adjusted toward the nominal 83:130 face ratio.
- Private single-user Flask application with password hashing, CSRF, signed secure session cookies and login throttling.
- SQLite audit event API, log history viewer and automatic event logging for supported operations.
- Local read-only directory backup catalogue for ROMs, themes, BIOS and settings.
- Private deployment guide, login setup command and backend unit tests.
- Stop automatic GitHub Pages deployments while transitioning to a private instance.

### Limitations

- Published GitHub Pages sites must be manually unpublished in repository settings.
- ArkOS firmware and RK3326 are not emulated; memory and processor limits are descriptive.
- Full backup image mounting, file editing, server-side ROM storage and forensic logs are not yet implemented.
- The licensed 3D model embed does not display a live simulated framebuffer.

## [0.2.0] — 2026-11-01

### Added

- Official Sketchfab viewer of Moh1993's R36S console with attribution.
- Read-only local firmware header inspection (MBR, ISO, FDT).
- Experimental EmulatorJS ROM Player with user-provided files.
- Firmware parser unit tests.

## [0.1.0] — 2026-11-01

### Added

- Browser-based console preview with virtual keyboard/gamepad controls.
- Demo systems and games, theme editor and EmulationStation gamelist XML import.
- Theme XML export, JSON snapshot, reference hardware and CI checks.
