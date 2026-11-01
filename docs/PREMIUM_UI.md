# R36S Web Lab — Premium UI v0.5

This is the browser UI redesign. It does not alter the protected Cloudflare Access Worker configuration or the contents of the D1 database.

## Appearance

The header has an accessible toggle for **light and dark page appearance**. It uses the local operating system preference the first time the site opens, and remembers your selection in this browser using localStorage. Page appearance is separate from the **Theme Studio** settings that control the simulated R36S screen.

The page shell uses a restrained neutral palette, high-contrast content cards, clearer focus outlines, consistent spacing and a responsive sidebar.

## Navigation

The sidebar is divided into dedicated groups:

- **Console** — Simulador, Modelo 3D, Hardware
- **Laboratório** — Theme Studio, Biblioteca, Firmware Lab, Backup, ROM Player
- **Comunidade** — an expandable folder **Projetos da comunidade** containing Slot.R36S and PKForge R36S, plus Activity audit logs

Clicking the folder label opens the project directory in the inspector with two project cards. Clicking a card selects the existing project workspace. On smaller screens the groups form a horizontal navigable strip.

These are development folders and visual HTML/CSS preview workspaces, not actual game cartridges or ArkOS installations. Real source files are still needed to display Slot.R36S or PKForge with fidelity.

## The console

The interactive 2D R36S shell has been adjusted to approximately **320 × 522 CSS pixels**, preserving the vertical-front aspect ratio seen in standard R36S photographs. The front now has:

- large 4:3 LCD with a full dark bezel, visual 640 × 480 preview
- crossed D-pad at the upper left
- four staggered ABXY buttons at the upper right
- central front speaker grille, FN button and Start/Select buttons
- dual analog sticks at the lower corners
- keyboard/Gamepad API/navigation buttons retained from the prior simulator

The reference physical console is approximately 130 × 80 × 20 mm according to iFixit, but variants differ. These CSS proportions are an approximation, not a calibrated 3D model. The Sketchfab viewer remains available in its dedicated section and is not modified.

## Tests and security

A Node.js test suite checks the appearance toggle, folder navigation, physical control markup and Cloudflare asset bundle. The protected Cloudflare deployment serves the new premium.css and src/site-theme.js files; the optional Flask deployment also allows the CSS.

No files or ROMs are uploaded by the theme toggle or folder controls. Existing Access authentication, D1 bindings, audit API and source-only separation remain unchanged.

## Limitations

- Changing the page from light to dark does not recolor the imported third-party Sketchfab player or the game emulator iframe.
- The 2D R36S mockup is navigable as a UI simulation; ArkOS, RK3326, peripheral timing and EmulationStation are not emulated.
- No native Slot.R36S or PKForge code is automatically executed.
- Review visual fidelity on multiple browser viewport sizes; automated tests cannot prove physical accuracy.
