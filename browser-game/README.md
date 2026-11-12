# Spice Master Eddy — browser game

A Neon Vice-style browser game (three.js r170, plain ES modules, no build step).

## Run it
Browsers block ES modules from `file://`, so serve the folder:

```
cd browser-game
python -m http.server 8765
```
Then open http://localhost:8765

## Controls
WASD / arrows move · E interact · Esc close windows · N music on/off

Mission (Spekbuurt): mouse aim · click / F attack · E grab / throw · 1 melee · 2 / 3 guns · wheel or Tab cycle · R reload · Shift sprint · I inventory · Backspace restart

- **Loadout:** slot 1 is melee (the Maboota; press 1 again to switch to the honkbalknuppel if you have one), slots 2 and 3 hold guns.
  A picked-up gun fills an empty slot, otherwise it swaps with the gun in your hands. Pocket ammo is shared per calibre.
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
