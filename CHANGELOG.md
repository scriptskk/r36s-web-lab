# Changelog

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
