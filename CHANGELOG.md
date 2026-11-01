# Changelog

## [0.2.0] — 2026-11-01

### Added

- Official embedded Sketchfab viewer of Moh1993's R36S console with visible attribution.
- Firmware Lab: local header-only inspection of ArkOS disk images, MBR partition entries, optical ISO headers and FDT headers.
- Independent browser ROM Player based on optional EmulatorJS CDN loading, with formats for several retro systems.
- Unit tests covering firmware image header classification and MBR parsing.

### Limitations

- The Sketchfab model cannot currently display the simulator output on its own screen.
- ArkOS boot, device tree emulation and full RK3326 hardware virtualization are not implemented.
- Browser game execution remains experimental and needs real-browser compatibility tests.
- Compressed firmware images are recognized but not unpacked.

## [0.1.0] — 2026-11-01

### Added

- Browser-based R36S device preview with interactive controls.
- Seven sample platform categories and fictional game entries.
- Theme editor with color, background, font scale and LCD overlay controls.
- Safe, bounded import of EmulationStation gamelist.xml data.
- XML starter-theme export and JSON project snapshot download.
- Reference hardware specifications and offline-friendly architecture.
- Automated unit tests, CI and GitHub Pages deployment workflow.
