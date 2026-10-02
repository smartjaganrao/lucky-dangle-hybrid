# Lucky Dangle (hybrid)

A lucky charm that dangles from the top of your screen. It sways while you work, lets every click pass through to the apps underneath, and performs a small ritual when you ask.

Runs on **macOS, Windows and Linux**. Built with Electron and plain JavaScript.

> **Status:** work in progress. The product name and some of the charm art are placeholders and will change before any release. See [Credit and status](#credit-and-status).

---

## Quick start

```bash
npm install
npm start
```

On macOS or Linux you can also run `./start.sh`. On Windows, double-click `run-dangle.bat`.

Lucky Dangle lives in the **menu bar** (macOS) or **system tray** (Windows, Linux). It has no Dock icon. Use the tray icon to open the gallery or quit.

---

## Features

- **Transparent overlay.** The charm hangs from the top edge of the screen with no window, border or shadow. Everything outside the charm is click-through.
- **Rope physics.** Verlet-rope pendulum with a light ambient breeze. Click to flick, drag to swing it with the cursor.
- **Slide along the edge.** Drag the small bar near the top to move the anchor anywhere along the screen edge.
- **Several charms at once.** Hang up to 8 at the same time, each with its own rope and anchor.
- **Charm gallery.** Each charm has its origin, a short story and its ritual. One click hangs it.
- **Tray / menu-bar menu.** Switch or add charms, trigger rituals, show or hide everything.
- **Global shortcuts.**

  | Action | macOS | Windows / Linux |
  | --- | --- | --- |
  | Show or hide the charms | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>D</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>D</kbd> |
  | Perform the ritual | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>S</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>S</kbd> |

  Shift is part of both shortcuts on purpose, so they never take over Save or Bookmark.

---

## Charms

**Original Indian charms**

| Charm | Ritual |
| --- | --- |
| **Diya** (Thooku vilakku), a brass hanging lamp | The flame flares up |
| **Vel**, Murugan's leaf-bladed spear | The spear glows |
| **Rudraksha mala**, 27 seeds, a guru bead and a tassel | Chant a round: the seeds light up one by one, then the guru bead |
| **Marigold toran** (Genda phool), a string of marigolds | Flick |

**Traditional charms**

| Charm | Origin | Ritual |
| --- | --- | --- |
| Nazar boncuğu | Turkey, Mediterranean | Flick |
| Hamsa | Middle East, North Africa | Flick |
| Nimbu-mirchi | India | Hang a fresh garland |
| Ghanta | India | Ring the bell |
| Drishti bommai | South India | Repaints through seven colours |
| Chinese knot | China | The cord cinches and settles |
| Daruma | Japan | Paint one eye for a goal, the other when it is met |
| Maneki-neko | Japan | Beckoning paw |
| Horseshoe | Europe, Americas | Flick |
| Scarab | Ancient Egypt | Ceremonial wings open |
| Himmeli | Finland | Turns in the draft |

**Make your own:** hang any emoji, or load your own image.

---

## Project layout

| Path | What it does |
| --- | --- |
| `src/main.js` | Main process: overlay window, tray, shortcuts, settings |
| `src/overlay.*` | The charm overlay and its ritual animations |
| `src/physics.js` | Verlet rope and pendulum physics |
| `src/charms.js` | Charm definitions, vector art and bead styles |
| `src/gallery.*` | Charm gallery and settings window |
| `src/preload.js` | Context bridge and per-platform shortcut labels |
| `assets/` | Charm images, sounds and icons |

To add a vector charm, write its SVG in `src/charms.js`, add an entry to `CHARMS`, and give it a `ritual.kind`. Handle that kind in `performRitual()` and `updateRituals()` in `src/overlay.js`.

---

## Build a standalone app

```bash
npm run dist:mac     # on a Mac
npm run dist:win     # Windows portable .exe and installer
npm run dist:linux
```

Output goes to `dist/`.

---

## Credit and status

This project started as a fork of [07bharathi/Luckydangle1.0](https://github.com/07bharathi/Luckydangle1.0), which is itself a clone of the commercial [Lucky Dangle](https://luckydangle.app/) app. That repository declares MIT in its `package.json` but ships no `LICENSE` file, so the licensing of the inherited code and art is unclear.

Before any public or paid release this project will:

- change the product name and app icon
- replace the inherited charm art and descriptions with original work
- remove the charms that use third-party characters

The original Indian charms above (diya, vel, rudraksha mala, marigold toran) are drawn from scratch as vector art in this repository.

## Roadmap

- [ ] New name and app icon
- [x] Original Indian charms: diya, vel, marigold toran, rudraksha mala
- [ ] More original charms: temple bells, lotus, kolam, jasmine gajra
- [x] Several charms on screen at once
- [ ] Test and package on Mac (arm64), then Windows
