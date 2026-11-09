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

Testing hooks are exposed on `window.__sme` in the browser console.

## Naming rules
Kaasland (never the Netherlands) · currency Wilders · the blue Oofmobiel · factions Lampas, Noshgey Kariot, Abdavissies ·
helpers are Naknikim · the PC is Kaasdows 95. Full design: the Game Bible doc on the shared Drive.
