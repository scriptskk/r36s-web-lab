# Changelog

## [0.9.1] — 2026-11-01

### Documentação e projetos da comunidade

- Reorganização do README principal, com instruções de instalação, recursos e compatibilidade atuais.
- Documentação independente para SLOT36S e PokeForge R36S, incluindo arquivos, testes e limitações de execução.
- Catálogo de workspaces atualizado para distinguir a prévia web de cartuchos do adaptador de ZIP Go/ARM.
- Tela inicial do PokeForge ajustada para orientar a importação local da distribuição v1.6.
- Guia Cloudflare revisado para instalações existentes e forks; testes de integração atualizados.
- Nenhum binário ARM, arquivo de save, ROM ou pacote privado foi adicionado ao repositório.


## [0.9.0] — 2026-11-01

- Implemented a Go/ARM ZIP detector for the real PokeForge R36S v1.6 distribution using its main.go and ArkOS launcher filenames.
- Added a navigable browser UI adaptation based on the source's real profile start screen and eight main tabs, including BOXES grid, BANK, POKEDEX, and OFFLINE UI notices.
- Loads the Kanto Pokédex catalog (151 entries) from the user's selected ZIP without uploading it, and correctly shows missing later-generation catalog entries.
- Maps L1/R1/L2/R2 and A/B/D-pad to the native-like UI workflow.
- Added tests for archive detection, UI navigation, and Cloudflare asset packaging.
- This does **not** execute ARM native binaries or emulate ArkOS, framebuffer drivers, trade/save editing, profiles, or audio.


## [0.8.1] — 2026-11-01

- Fixed ZIP import for source archives with large central directories by skipping node_modules and caches.
- Recognize and inventory React/Vite/TypeScript, Python, Lua and project configuration source files without executing them.
- Show clear diagnosis when an imported project needs a web build, uses ArkOS/EmulationStation XML, or has no browser-run HTML.
- Added realistic deflate-compressed ZIP regression tests and kept user files local to the browser.
- Native RK3326/ArkOS execution remains unsupported; real project archives are required for further compatibility work.


## [0.8.0] — 2026-11-01

- Clickable L1, L2, R1 and R2 shoulder controls outside the front photo, with keyboard Q/E/Z/C and standard Gamepad indices 4–7.
- Browser-local ZIP importer with source-type inventory, safe-path validation, 32 MB ZIP limit and 16 MB uncompressed cap.
- File explorer and HTML entry selector for imported projects; project and theme previews update immediately.
- Optional sandboxed browser JS runner with opaque origin, isolated per-route CSP and no outbound network access; suitable for testing self-contained web frontends, not Linux ARM applications.
- Keeps Cloudflare Access authentication, D1 audit events and local-only project file handling.
- ArkOS firmware / RK3326 peripherals are **not** emulated; real integration needs original files and a separate runner or hardware target.


## [0.7.0] — 2026-11-01

- Created persistent GitHub source folders for the two historic community projects.
- SLOT36S: original conversation concept of a GBA cartridge recreated as a simple, navigable reference HTML/CSS screen. Source/art assets of the original application remain unavailable.
- PKForge R36S: explicit missing-source placeholder with a working preview menu, not the actual program.
- Both project workspaces can now load updated repository HTML/CSS, edit it locally, export a sanitized preview, and navigate data-lab-item entries with the physical/keyboard gamepad input.
- Added provenance manifest and documentation; Cloudflare static builder bundles project folders and their texts, while the worker retains Access authentication.
- Did not claim to boot ArkOS, reproduce original system software or import copyrighted game data.


## [0.6.0] — 2026-11-01

- Replaced the illustrated 2D chassis with the actual transparent R36S photo supplied for this laboratory, optimized to WebP.
- The 4:3 console screen is live over the display area on the image. Navigation via keyboard, gamepad and screen entries remains; transparent control hotspots overlay the photographed physical buttons.
- New black/white editorial appearance and simplified cards, navigation, page hierarchy and restrained pixel-style micro typography.
- Page light/dark mode remains available, independent from Theme Studio. Default simulator accent and systems palette now start in neutral grayscale.
- Updated both Cloudflare static assets and optional Flask allowlist and added regression tests.
- **Limits:** precise button hit targets and visual sizing require browser inspection; 3D Sketchfab remains separate. Firmware, ArkOS boot and RK3326 hardware are not emulated.


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
