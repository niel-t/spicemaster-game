# Spice Master Eddy — browser game

A Neon Vice-style browser game (three.js r170, plain ES modules, no build step).

## Run it
Browsers block ES modules from `file://`, so serve the folder:

```
cd browser-game
python -m http.server 8765
```
Then open http://localhost:8765

## Play online
**GitHub Pages:** https://niel-t.github.io/spicemaster-game/ (from `niel-t/spicemaster-game`, deployed by `.github/workflows/pages.yml` on every push to `claude/neon-vice-mechanics`).

GitLab Pages publishes the game on every push to `claude/neon-vice-mechanics` (and to the default branch once merged):
https://srk7630145.gitlab.io/spice-master-eddy/ — works on PC, phone and tablet, controller included.
The job lives in `.gitlab-ci.yml` at the repo root and only copies `index.html`, `js/`, `assets/` and `vendor/` (no build step).
If the project is private, Pages may be limited to project members: Settings > General > Visibility > Pages.

## Controls
| | Keyboard / mouse | Xbox controller | Touch (phone / tablet) |
|---|---|---|---|
| Move | WASD / arrows | Left stick | Left thumb (anywhere on the left half) |
| Aim (missions) | Mouse | Right stick (idle: aims where you walk) | Right thumb |
| Attack / execute downed Lampas / Maboota swing | Click / F | RT (hold to repeat) | SLAAN on the street · push the right thumb past the ring in missions |
| Interact / grab / throw · advance dialogue · skip the drive in | E / Space | A | ACTIE, or tap the dialogue box |
| Reload (again in the green window = instant, a miss jams) | R | X / LT | RELOAD |
| Switch weapon (1 melee, 2 + 3 guns) | Wheel / Tab / 1-3 | Y (D-pad ◀ ▲ ▶ for slots) | WISSEL |
| Sprint (loud in missions) | Shift | LB / L3 | SPRINT (toggle) |
| Map | M | RB | KAART |
| Inventory | I | D-pad ▼ | INV |
| Back / close windows | Esc | B | ✕ buttons |
| Restart mission | Backspace | Back | OPNIEUW |
| Pause menu (resume, inventory, map, music, restart, controls) | P / Esc | Start | II |
| Music on / off | N | pause menu | pause menu |
| Menus (PC, shop, kluis, choices, title) | Mouse | D-pad / left stick + A, B back | Tap |

The game switches hints and on-screen controls to the device you used last: a controller shows `[A]`-style prompts,
touch shows the thumbsticks and buttons (auto-on for phones and tablets), and keyboard / mouse hides both again.
On phones the page can't zoom or scroll, it respects notches (safe areas) and the HUD scales down; landscape plays best.

- **Your kit carries over:** whatever you walk out of a mission with (guns incl. ones taken off the Lampas, their loaded rounds,
  pocket ammo, the vest if it wasn't shot through) goes home with you and into the next mission. Backspace restores the kit you came in with.
- **De Kluis (stash):** a green locker in the warehouse (E) with 6 shelves to store and swap gear. Purchases from The Russian go
  into your hands if there is room, otherwise into the kluis.
- **Arrival:** launching Spekbuurt plays a short drive-in: the Oofmobiel pulls up, parks out front and Eddy walks to the door.
  Skip it with E / Space / click; a restart (Backspace) never replays it.
- **Active reload:** R starts a reload from your pocket ammo (9mm for the Makarov, shells for the sawn-off). Press R again inside the
  green window on the bar above Eddy for an instant reload; miss it and the gun jams (slower reload). An empty gun reloads by itself when you attack.
- **Ammo:** bought boxes go to your pocket. Grab (E) a Lampas gun of the calibre you hold to strip its rounds; picking up a new gun also pockets its spare rounds.
- **Sprint:** Shift. Loud: any Lampas within ~4.5 m hears your footsteps and comes looking.

## Layout
| Path | What |
|---|---|
| `index.html` | HUD, dialogue box, Kaasdows 95 PC window, the Russian's gun shop, title screen (HTML/CSS overlays) |
| `js/main.js` | The whole game: renderer, materials, street + warehouse, characters (painted faces), story flow, PC tabs, shop, map |
| `js/input.js` | Controller (Gamepad API) and touch input, pause menu, device-aware hints; turns both into the same key events the keyboard sends |
| `js/music.js` | Procedural upbeat WebAudio soundtrack |
| `vendor/three.module.min.js` | three.js r170 (MIT, see `three-LICENSE.txt`) |
| `assets/*.jpg` | CC0 PBR textures (ambientCG) + `_n` normal maps, dialogue face photos |
| `assets/kaasland_map.jpg` + `map_labels.json` | Map shown on the PC; label boxes/dots are read from the JSON |
| `tools/build_map.py` | Rebuilds the map (upscale, territory splits, label plates) and writes `map_labels.json` |

## Story flow (Chapter 0)
Talk to Eddy Sr. → list the 6 junk items on the PC → sell them on Kaasplaats → buy a mixing table → hire a Naknik →
Eddy Sr.'s farewell → visit The Russian (pawnshop, De Natte Worst) → buy a weapon → end of Chapter 0.

## Saving
The game autosaves to `localStorage` (key `spiceMasterEddy.save`, versioned) on every story step, purchase, sale, music toggle,
mission end and when the tab closes. Mid-mission progress is not saved (it is when the mission ends). The title screen offers
**[Enter] Continue** or **[N] New Game** (asks to confirm with J). Fields a newer build added to the save are kept untouched.

Testing hooks are exposed on `window.__sme` in the browser console.

## Naming rules
Kaasland (never the Netherlands) · currency Wilders · the blue Oofmobiel · factions Lampas, Noshgey Kariot, Abdavissies ·
helpers are Naknikim · the PC is Kaasdows 95. Full design: the Game Bible doc on the shared Drive.
