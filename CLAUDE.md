# Lucky Dangle (hybrid) — project notes for Claude Code

Desktop app that hangs a swinging lucky charm from the top of the screen.
Electron, plain JS (no framework). Targets Windows, macOS and Linux.

## Run and build
- `npm install` then `npm start` to run.
- `npm run dist:mac` (on a Mac), `npm run dist:win`, `npm run dist:linux`.

## Layout
- `src/main.js` — main process: transparent click-through overlay window, tray / menu-bar icon, global shortcuts, settings (JSON in userData).
- `src/overlay.*` — the charm overlay; `src/physics.js` — Verlet rope/pendulum physics.
- `src/gallery.*` — charm gallery + settings window.
- `src/charms.js` + `charms_catalog.json` — charm definitions; art in `assets/charms/`.
- `src/preload.js` — context bridge; also swaps shortcut labels (⌘ on Mac, Ctrl elsewhere).

## Platform rules
- Shortcuts are CommandOrControl+Shift+D (show/hide) and +Shift+S (ritual). Never use plain Ctrl/⌘+S or +D: they steal Save and Bookmark system-wide.
- macOS: no Dock icon (`app.dock.hide()`, `LSUIElement`), overlay starts at `workArea.y` so it hangs below the menu bar and notch.
- Linux: `enable-transparent-visuals` switch, hardware acceleration off, 300 ms start delay.

## Origin and IP — read before shipping
- Forked from github.com/07bharathi/Luckydangle1.0 (remote `upstream`), which says MIT in package.json but has no LICENSE file. Keep credit in the README.
- That repo is a clone of the commercial Lucky Dangle app (luckydangle.app). Before any public or paid release:
  - Rename the product (not "Lucky Dangle").
  - Replace charm art in `assets/charms/` and the descriptions in `charms_catalog.json` with original work.
  - Remove the Spider-Man charm (Marvel IP).

## Roadmap (owner: Jagan)
1. New brand name + app icon.
2. Original Indian charm set: diya, ghanti, Murugan Vel, nimbu-mirchi, marigold toran, drishti bommai.
3. Multiple dangles at once, more than one charm on screen.
4. Test and package on Mac (arm64), then Windows.
