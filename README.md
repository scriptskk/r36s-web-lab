# R36S Web Lab

**v0.9 — PokeForge R36S v1.6:** o ZIP Go/ARM original agora é reconhecido localmente pelo laboratório. Um adaptador de interface fiel à estrutura das telas do código permite visualizar o menu 640×480, escolher perfil, navegar HOME/BOXES/BANK/PARTY/TRAINER/EDITOR/TOOLS/POKEDEX e carregar o catálogo Pokédex local de 151 espécies diretamente do ZIP. A execução real dos binários ARM, o acesso a /dev/fb0, saves e demais serviços ArkOS ainda exigem um executor separado. **Os arquivos originais não são enviados ao repositório público.** [Instruções e limitações](docs/POKEFORGE_NATIVE_ZIP.md).


**v0.8 — Importação de projetos:** importe os seus ZIPs de SLOT36S e PKForge R36S diretamente no laboratório privado, explore os arquivos e selecione a tela HTML principal. O editor HTML/CSS tem prévia 640×480 e há um modo experimental opt-in para JavaScript web em iframe de origem isolada. Adicionados controles físicos simulados L1/L2/R1/R2 (mouse, Q/E/Z/C e gamepad padrão 4–7). **Não é uma emulação ArkOS/RK3326 e não garante execução universal.** [Instruções, escopo e segurança](docs/IMPORT_AND_RUNTIME.md).


**v0.7 — Projetos históricos no laboratório:** pastas [SLOT36S](community/slot36s/) e [PKForge R36S](community/pkforge-r36s/) exportadas como referências versionadas no GitHub. Abra a pasta **Projetos da comunidade** e escolha um projeto para carregar a prévia 640×480, editar HTML/CSS e testar a navegação pelos botões R36S. [Catálogo e proveniência](community/README.md). *A fonte original do Slot e do PKForge não foi localizada; o Slot é uma reconstrução baseada em referência histórica e o PKForge é placeholder explícito.*


**v0.6 — R36S PHOTO EDITION:** serious monochrome black/white interface (with page light/dark toggle), native image of the R36S provided for this project, interactive 640x480 screen overlaid on that image, touch/click hotspots aligned to photographed controls and community project folders. Removed colored blue containers from the page. Pixel-like micro-labels are used sparingly. [Visual redesign details](docs/MONOCHROME_REDESIGN.md).


**v0.5 — Premium interface:** clean dark/light appearance selector, organized Console/Laboratório/Comunidade navigation, and a dedicated expandable community project folder with Slot.R36S and PKForge R36S. The navigable 2D R36S now has the front speaker, FN button, staggered ABXY keys and dual analog sticks arranged closer to the physical console. [UI guide](docs/PREMIUM_UI.md). No real ArkOS boot is claimed.


**NOVO — Slot.R36S e PKForge R36S:** workspaces visuais com importação local de HTML/CSS/imagens e prévia imediata dentro da tela virtual de 640×480. Os arquivos originais desses projetos precisam ser importados; nenhum frontend foi presumido ou copiado automaticamente. Não inicializa ArkOS nem executa JavaScript importado. [Como usar o laboratório de projetos](docs/PROJECT_LIVE_STUDIOS.md).


**Hospedagem gratuita e privada:** [Cloudflare Workers + Access + D1](docs/CLOUDFLARE_FREE.md). O deploy não foi ativado: necessita conectar sua conta Cloudflare, configurar D1, Access e segredos. O backend Flask/Render permanece como opção, mas não é necessário no caminho gratuito.

Open-source tools for working with R36S user interfaces, inspecting local firmware headers and cataloguing extracted backup folders. Includes a separate private server with login and SQLite activity records.

> The project does NOT boot ArkOS or emulate the Rockchip RK3326. Its reference profile does not limit physical CPU, RAM or GPU resources on the host machine.

## Private cloud deployment

The repository includes a ready-to-review Render Blueprint (`render.yaml`) with a paid web service, HTTPS endpoint, persistent SQLite disk and first-administrator password provisioning. The login protects the application, not the public GitHub source.

**Deploy instructions:** [docs/RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md). The Render account owner must connect and approve the deployment, enter a unique administrator secret in Render, and confirm any billing. The service is **not deployed yet**.

A complete SD image, ArkOS boot, server-side ROM storage and RK3326 hardware emulation remain outside the current implementation.

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
