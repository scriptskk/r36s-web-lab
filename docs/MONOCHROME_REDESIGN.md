# Monochrome Photo Edition (v0.6)

The Web Lab now uses the R36S image supplied for this project as its device surface.

## What changed

- The original image was cropped to the transparent console bounds and optimized as **assets/r36s-reference.webp** (154×240 source pixels). The external image is not presented as a new 3D mesh.
- The simulated 4:3 interface is rendered as an independent interactive DOM surface over the photograph's screen area. The virtual interface's reference resolution is **640×480**, scaled to the pictured display. The user can click its menu items.
- Transparent clickable regions are mapped onto the pictured direction pad, ABXY, START/SELECT, FN and analog sticks. These preserve the simulator navigation logic. The clickable regions are an approximation and must be verified visually on the live site at different screen sizes.
- Replaced accent-blue page surfaces with a monochrome visual system: deep black and graphite in dark mode, off-white and charcoal in light mode, and neutral borders.
- The site retains the **light/dark** header toggle and saves the preference in browser storage.
- Used a few uppercase, monospaced, pixel-adjacent labels, while keeping important headings in a professional UI typeface.
- Preserved separate Console, Laboratório and Comunidade navigation groups, including the expandable project folder and the Slot.R36S/PKForge workspaces.

## Security and hosting

- Cloudflare Access continues to protect the site. No authentication bypasses or database changes were introduced.
- The original user-supplied image asset is committed to the public repository. Avoid including private files or personally identifying information in visual assets.
- The Cloudflare build ships **monochrome.css** and **assets/r36s-reference.webp**; the optional Flask server also allows monochrome.css.
- Browser-only image compositing does not require uploading backups, ROMs or ArkOS images.
- The left-side theme editor still controls the simulated screen independently. New default color settings are neutral monochrome, but your existing custom screen-theme preferences may remain in your browser until changed or reset.

## Constraints

- The picture is a relatively small source asset; enlarged viewing may reveal image softness. It is a faithful image asset rather than a reconstructed high-poly model.
- While the website uses a real picture of a console, this does **not** reproduce firmware, native hardware logic, RK3326 CPU, GPU Mali, battery or SD storage.
- The separate embedded Sketchfab viewer is unchanged, and its display is not synchronized with the 2D screen.
- Visual alignment, hit targets and mobile behavior must be validated on real browsers; tests verify the source and markup, not visual-perfect alignment.
