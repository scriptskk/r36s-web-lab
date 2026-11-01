# R36S Web Lab

Open-source tools for working with R36S user interfaces, inspecting local firmware headers and cataloguing extracted backup folders. Includes a separate private server with login and SQLite activity records.

> The project does NOT boot ArkOS or emulate the Rockchip RK3326. Its reference profile does not limit physical CPU, RAM or GPU resources on the host machine.

## Current modules

| Module | Function | Actual scope |
| --- | --- | --- |
| 3D model | Official Sketchfab embed of the R36S console by Moh1993 | Rotate and inspect the external model; its screen is not linked to the 2D UI |
| Simulator | 2D EmulationStation-inspired menus, input and appearance | Interface demonstration, not ArkOS |
| Hardware | RK3326 / 4× Cortex-A35 / Mali-G31 MP2 / 1 GiB DDR3L | Reference specification only; no ARM emulation or enforced limits |
| Screen | 640 × 480 pixels in 4:3 | Correct pixel aspect in CSS; chassis proportions are reference estimates, not measured on your unit |
| Firmware Lab | Read local image headers, MBR, optical ISO and DTB signatures | Does not mount partitions, extract image archives or boot |
| Backup | Catalogue local directories (ROMs, themes, BIOS, configs) | File names and sizes are counted in memory; no copying or uploading |
| ROM Player | Experimental EmulatorJS core for select user-provided game files | Not the emulators from your ArkOS image, not a full R36S |
| Theme Studio | Palette and typography preview, starter XML export | Needs validation on your actual EmulationStation fork |
| Activity | View SQLite events, logout | Only works behind the private Flask application, not GitHub Pages |

See [docs/PRIVATE_DEPLOYMENT.md](docs/PRIVATE_DEPLOYMENT.md) to set up the administrator password, authenticated web server, activity database and HTTPS access.

## R36S reference profile

- SoC: Rockchip RK3326 / ARM Cortex-A35 / 4 cores / maximum nominal ~1.5 GHz.
- GPU: ARM Mali-G31 MP2.
- Memory: 1 GiB DDR3L.
- Display: 3.5-inch IPS, 640 × 480, native 4:3.
- Storage: two microSD slots on the standard device.
- Dimensions used for the 2D shell outline: nominal 130 × 83 × 35 mm. Different revisions and sources vary. The 3D model preserves the author's original geometry and is not independently measured against a physical unit.
- Real hardware has panel/DTB/PCB variants. Device-specific fidelity requires matching those details to the target unit.

These numbers are descriptive. Setting a browser's memory cap or CSS aspect ratio does not reproduce RK3326 timing, ARM behavior, Mali GPU rendering, microSD I/O, battery or peripherals.

## Privacy and storage

The GitHub repository contains only public code, tests and documentation. Do not commit any personal firmware image, SD backup, ROM, BIOS, archive, user password, database or generated secret.

The private Flask instance uses a single administrator password hashed by Werkzeug scrypt, signed session cookies, CSRF protection and a local SQLite audit trail outside the repository. Events record validated metadata, not file contents. Audit data is not a tamper-proof forensic trail.

The Sketchfab embed connects to Sketchfab; the EmulatorJS player loads external code from the EmulatorJS CDN on demand. Review external providers' licenses and privacy policies before use.

## Run source-only simulator for development

~~~bash
python3 -m http.server 4173
~~~

Open http://localhost:4173. This static preview does NOT have authentication or an audit database and must not be used to host sensitive files.

For unit tests with Node.js 22:

~~~bash
npm test
~~~

For private deployment use the separate documented Flask application. There is no automatic public Pages workflow, since Pages does not provide private authentication.

## Backups and emulators

ArkOS SD backups are usually .img or compressed images (such as .img.xz), not conventional PC ISO installers. The firmware inspector reads a small header, even for a huge backup. To catalogue files from the SD, use a locally extracted/mounted backup folder. This does not install any emulator or ROM.

Only use games, BIOS and backups you are legally allowed to use. No ROMs, firmware or BIOS are distributed here.

## Roadmap

1. Identify the exact motherboard and display/DTB revision of a real R36S for calibration.
2. Read and validate complete theme packages and extracted boot/game partitions in a controlled sandbox.
3. Add protected backup storage and revisioned workspace changes, preserving source files read-only.
4. Investigate a separate RK3326-accurate emulator, including ARM, Mali, interrupts, boot chain, I/O and benchmark calibration against the console. There is no promise that unmodified ArkOS images will boot.
5. If the original 3D model is licensed for derivative use, integrate a controlled screen texture with a calibrated 640 × 480 framebuffer.

## Attribution and license

- [R36S console model by Moh1993](https://sketchfab.com/3d-models/r36s-console-c6ecbfabf473479a8ffd73149090c5bb). Embedded from Sketchfab, not redistributed. All model rights remain with the creator.
- [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) optional third-party browser emulation runtime, subject to its own licensing.
- [ArkOS](https://github.com/christianhaitian/arkos/wiki) independent Linux firmware.
- [EmulationStation theme specification](https://github.com/Aloshi/EmulationStation/blob/master/THEMES.md).
- [Handhelds Wiki / R36S](https://handhelds.wiki/R36S).

The original code in this repository is MIT-licensed (LICENSE). This does not license third-party ROMs, firmware, emulators, models or trademarks.
