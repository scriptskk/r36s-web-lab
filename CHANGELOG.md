# Changelog

## [0.1.0] — 2026-11-01

### Added

- Browser-based R36S device preview with interactive controls.
- Seven sample platform categories and fictional game entries.
- Theme editor with color, background, font scale and LCD overlay controls.
- Safe, bounded import of EmulationStation `gamelist.xml` data.
- XML starter-theme export and JSON project snapshot download.
- Reference hardware specifications and offline-friendly architecture.
- Automated unit tests, CI and GitHub Pages deployment workflow.

### Limitations

- No ArkOS boot, ROM execution, emulation core or hardware virtualization.
- Exported theme XML must be validated on each target EmulationStation fork.
- Project JSON import and full theme-package import are not yet implemented.
