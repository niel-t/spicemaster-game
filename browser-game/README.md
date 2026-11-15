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
| Pay for parking by app (levels with a paid bay) | B | - | the blue P button |
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
- **Arrival:** launching a mission plays a short drive-in: the Oofmobiel pulls up, parks out front and Eddy walks to the door.
  Skip it with E / Space / click; a restart (Backspace) never replays it.
- **Mini-boss STEVEN ZEEGAAL** (Spekbuurt gym, his dojo): a 90s action-star parody. Slow, unarmed, never picks up guns,
  takes 4 hits, lazily leans out of the way of bullets, and his wrist lock twists your gun out of your hand. Enemy types are
  data-driven (`FOE_TYPES` in `js/mission.js`): give a spawn entry in a level file (`js/levels/*.js`) a 7th field `'zeegaal'` (or `{ type: 'zeegaal' }`) to place him in any level; Spekbuurt has him in the gym.
- **Neon Vice arsenal:** Makarov .22 (cheap; a plain Lampas takes two hits), CZ Shadow 2 (9mm, better on every stat, double the price), Colt Python .357 (through 3 bodies), dual 9mms, Uzi, silenced MP5SD, sawn-off, pump, auto shotgun (8 shells, full auto), M16 (3-round burst, through a thin wall), knife, honkbalknuppel, machete, throwing knives. Exclusives: Golden AK-47, Golden Deagles and Katana rotate by market day; the Dual Uzis unlock after Act 2, the Jackhammer (16 shells, tighter, pierces, W 12,000) and the AWP (.338, one shot, through 3 bodies and walls, the camera reaches out along your aim) after Act 3. Attachments: Makarov suppressor, CZ suppressor, extended Uzi mag (Uzi 48, Dual Uzis 96), quick sling. Armour: kevlar vest (soft, 1 hit, repaired) or a plate carrier that comes empty and holds 4 ceramic plates (W 250 each, 2 spares in your pocket, H slots one in on a mission). Grenades (3 of each): HE, flashbang (blinds and drops everyone who sees it), smoke (blocks sight, cones and lasers). Night-vision goggles (unlock after Act 1, V toggles them) for the night missions to come.
- **Sight lines (Neon Vice):** yellow vision cones on the floor show where each guard is looking (orange while searching), cut off by walls and closed doors; a red laser means a gunman is aiming at you. Heists keep their own rule (cones only with Kevin's floor plan). Switches: `SHOW_CONES` / `SHOW_LASERS` in `js/mission.js`.
- **Active reload:** R starts a reload from your pocket ammo (9mm for the Makarov, shells for the sawn-off). Press R again inside the
  green window on the bar above Eddy for an instant reload; miss it and the gun jams (slower reload). An empty gun reloads by itself when you attack.
- **Ammo:** bought boxes go to your pocket. Grab (E) a Lampas gun of the calibre you hold to strip its rounds; picking up a new gun also pockets its spare rounds.
- **Sprint:** Shift. Loud: any Lampas within ~4.5 m hears your footsteps and comes looking.

## Layout
| Path | What |
|---|---|
| `index.html` | HUD, dialogue box, Kaasdows 95 PC window, the Russian's gun shop, title screen (HTML/CSS overlays) |
| `js/main.js` | The whole game: renderer, materials, street + warehouse, characters (painted faces), story flow, PC tabs, shop, map, district progression |
| `js/arsenal.js` | Every weapon, calibre, attachment and armour piece, ported from Neon Vice (`WD`, `CAL`, `MODS`, `ARMOUR`, kill points, body force, The Russian's catalogue and prices in Wilders) |
| `js/gunshop.js` | Pandjeshuis Spasibo: The Russian's shop as Neon Vice's catalogue (sections, stat bars, attachments, ammo, bigger stashes, vest / plate carrier, deals and exclusives per market day, sell back at 40%) |
| `js/gunaudio.js` + `assets/audio/guns.mp3` | Neon Vice's real gun recordings (CC0, Free Firearm Sound Library, see `assets/audio/CREDITS.md`): shots, reload steps, dry clicks. Falls back to the synth sounds until loaded |
| `js/mission.js` | Mission engine (Neon Vice rules): builds the chosen level on a 1 m cell grid, Lampas AI, weapons, kit, kluis, HUD, results. Only one level is in the scene at a time |
| `js/levels/*.js` | One file per mission: grid layout, rooms + floors, doors, glass, furniture, spawns (incl. boss), loot, entry point, van arrival, texts, bounds, mood lighting and unique props (`decorate`). `spekbuurt.js`, `kroketkade.js`, `uitjesbuurt.js` |
| `js/economy.js` | The spice economy: market days, the Kruidenbeurs (prices, news, trends), warehouse stock. main.js creates it (`econ`), shows its PC tab and calls `econ.update()` in the hub loop |
| `js/drive.js` | The Oofmobiel drive between districts: a top-down city level with its own scene, camera, traffic, pedestrians, Lampas chase cars, HUD and minimap. main.js only starts it and renders it while it runs |
| `js/vehicles.js` | Shared vehicle models: the Oofmobiel (blue T5-style van) and the eight street cars, with physically based paint, glass, rubber and chrome. Used by the hub (`car()` in main.js, the parked van), the missions (garage cars, the drive-in van) and the Oofmobiel drive |
| `js/levels/props.js` | Shared level dressing: rain, puddles, canal water, glow sprites and street furniture letters (lamps, bollards, bikes, planters, benches, bistro tables) |
| `js/characters.js` | Neon Vice-style characters for three.js: skinned low-poly models with painted faces and clothes, idle/walk poses, the cast's looks (`LOOKS`). Keeps the old `makePerson()` contract (`userData.arms/legs/head/body`). `makePerson` builds every character with it: a named look (`ps2: LOOKS.eddyJr`) or one derived from the old options by `lookFromPerson` (Lampas get tracksuits, bosses suits); `ps2: false` keeps the old capsule figure |
| `js/ps2c.js` | The character builder ported from Neon Vice's `models.js`: skeleton, mesh lofting, face/body painters, `pose()`. Spice Master additions are marked |
| `dev/characters.html` | Turntable test page for the character models (idle / walk / aim, front / top view); not deployed |
| `js/post.js` | Neon Vice-style screen pass: HDR render, bloom on neon and lights, colour grade and vignette, PS1 retro mode. GRAPHICS in the pause menu cycles ENHANCED / PS1 RETRO / SIMPEL (saved in `spiceMasterEddy.gfx`) |
| `js/input.js` | Controller (Gamepad API) and touch input, pause menu, device-aware hints; turns both into the same key events the keyboard sends |
| `js/music.js` | Procedural upbeat WebAudio soundtrack |
| `vendor/three.module.min.js` | three.js r170 (MIT, see `three-LICENSE.txt`) |
| `assets/*.jpg` | CC0 PBR textures (ambientCG) + `_n` normal maps, dialogue face photos |
| `assets/kaasland_map.jpg` + `map_labels.json` | Map shown on the PC; label boxes/dots are read from the JSON |
| `tools/build_map.py` | Rebuilds the map (upscale, territory splits, label plates) and writes `map_labels.json` |

## Story flow (Chapter 0)
Talk to Eddy Sr. → list the 6 junk items on the PC → sell them on Kaasplaats → buy a mixing table → hire a Naknik →
Eddy Sr.'s farewell → visit The Russian (pawnshop, Kipkruidenkwartier) → buy a weapon → end of Chapter 0.

## Story flow (District 1: Kipkruidenkwartier)
Drive the Oofmobiel to a territory from the map (needs a weapon). Each one is a mission; clear it and it's yours.
1. **Spekbuurt** (Mission 1): Snackpaleis Spekbuurt, a Lampas shoarma joint. Owning it opens the other two.
2. **Kroketkade** (Mission 2): a brick corner snackbar on a rainy quay jutting into the canal: the shop, a checkered kitchen, storeroom, staff room and a purple garage with its roller shutter open onto the quay. 16 Lampas, the frituurbaas in the garage.
3. **Uitjesbuurt** (Mission 3): a white brick corner snackbar with a terrace on a street of canal houses. Down the stairs: a vaulted onion cellar with a glowing oven and, behind a hidden opening, the lieutenant's gambling den. 16 Lampas.

Own all three: **KIPKRUIDENKWARTIER IS YOURS**, a W 5.000 bonus, and the Lampas territories on the map turn to "next" (Oud-Vettenburg; Frietwijk is the first Lampas mission).
Progress is saved per level (`state.owned`, `state.lootTaken`); old saves with `state.spekbuurt` are migrated.

To add a mission: copy a file in `js/levels/`, add it to `LEVELS` in `js/mission.js`, and launch it with `mission.enter(id)`.

## Oofmobiel drive (district transitions)
Once Kipkruidenkwartier is yours, open the van map (get in the Oofmobiel), click an Oud-Vettenburg territory and press
**Drive to Oud-Vettenburg**. The camera goes straight overhead and you drive the blue van from Eddy & Zn across the city:
- **Controls:** W / ↑ gas, S / ↓ brake and reverse, A D steer, Shift handbrake (drift), **E / Space honk**, Backspace restart.
  Controller and touch: point the left stick (or left thumb) where you want to go and the van drives there; A / ACTIE honks.
- **Honking** makes pedestrians press themselves against the wall and cars pull over. Run someone over and it costs W 15 smartengeld.
- **De Grote Gracht** cuts the city in half. Only some bridges are down ("BRUG OPEN" means take another one) and there are road works.
  Drive into the canal and a tow truck fishes you out (−20% van health).
- **Hinderlaag:** cross into Oud-Vettenburg and Lampas cars come to ram you. Slam them into walls (or into them, faster than they hit you) to wreck them: W 50 each.
- **Arrive** by parking (slowly) in the yellow ring on the Frietwijk plaza. Pay: W 250 delivery fee + an on-time bonus (par 1:00) + Lampas bounties − smartengeld.
  If the van's health bar hits zero, try again or go home. The best time is saved in `state.drives`.
- Test hook: `__sme.startDrive()` jumps straight into the drive; `__sme.oofDrive` exposes its state.

## Spice economy (gang-wars layer, step 1 of 6)
Design: the *Gang Wars Economy* proposal (Claude Doc linked from the project). Code: `js/economy.js`, saved in `state.econ`.
- **Market days:** one passes after every outing (a cleared mission, i.e. `state.raids` going up, or an Oofmobiel drive), the same clock Nabil uses. Idling in the warehouse never costs anything.
- **Kruidenbeurs** (PC icon `%`, appears once the mixing table is bought): 8 ingredients in 3 grades (Lampas ★, Standaard ★★★, Bio ★★★★★). Prices drift every day (random walk pulled back to base), news events push one spice up or down 25-45% for 2-3 days, and the trend column shows the last 8 days. Dock spices (kurkuma, kaneel, kardemom, saffraan) come through the Abdavissies with a few kilos of supply a day.
- **Stock:** 200 kg in the home warehouse; sell back at 70%. Lampas spice crates from missions can be unpacked into 10 kg of Lampas-grade stock (or still sold on Kaasplaats).
- **Home turf discount:** 3% per owned Kipkruidenkwartier territory, +6% once the whole district is yours.
- **Mengkamer** (PC icon `B`, step 2): pick the blend the Naknikim mix (Kip Shoarma, Lams Shoarma, Kebab Kruiden; De Gouden Mix stays locked). Each Naknik mixes 10 kg per market day from stock, using grades cheapest or best first; quality = the average stars of the spices used, and a Naknik sometimes wastes 2 kg. Blends sell to the Groothandel (up to 40 kg a day, price = value x (0.4 + 0.12 x stars)).
- **Dagrapport** (PC icon `D`, step 3): Shoarma Schmatzel and every owned Kipkruidenkwartier joint are clients that order one blend a day (Schmatzel and Spekbuurt Kip, Kroketkade Lams, Uitjesbuurt Kebab). At the end of each market day the Naknikim mix first, then clients take their order from blend stock and pay value x (0.6 + 0.15 x stars) per kg. Trust (0-100) rises with full, good orders and falls with missed or low-quality ones; under 20 a client buys from the Lampas for 2 days. Personalities: Schmatzel is loyal, Kees haggles (a deal card: 20% off, insist, or cut off), Ruud is picky, Mevrouw Ui pays a day or two late. Blend values: Kip W 35, Lams W 40, Kebab W 60 per kg.
- **Remix raids** (step 4, replayability): an owned joint can be raided again from the van map ("Drive · remix raid"); the Lampas move back in every market day. The run is rolled from a seed (level + market day, so reloading never rerolls it): non-boss Lampas swap spawn spots and weapons, some stay home, 3 loot crates sit at random spots from the level's list, and one modifier sets the night: Gewone avond, Stroomstoring (dark, x1.3), Spitsuur (whole crew, x1.5), Kassa vol (more guns, x2), Rustige avond (fewer Lampas, x0.5). Bosses and named foes keep their rooms. The grade counts only the Lampas that were there. Personal bests per level (`state.best`: score, grade, time, runs) show on the results screen and the map. `mission.enter(id, { remix: mission.remixFor(id, day) })`; test hooks `mission.debugFoes()`, `mission.debugClear()`.
- **Klusbord** (PC icon `J`, step 5): three jobs per market day, rolled from the day's seed: hit a Lampas stash (tonight's remix raid at an owned joint, bonus pay), collect a debt from a late payer (same, they pay now +25%), a spoed-order (hand over 10-20 kg of a blend at 1.6x value), a supplier deal (30 kg Standaard spice at 40% off), and once Kipkruidenkwartier is yours, scout Oud-Vettenburg (the drive). Raid jobs show on the van map pin. A daily event may roll too (Lampas price war on one blend, kermis +50% orders, Nabil's party, rain -30%). Mission results set `state.lastRaid` so the economy can match raid jobs.
- **Turf and Lampas heat** (step 6): each owned Kipkruidenkwartier joint has control 0-100 (starts at 60; +5 for a full order, -10 for a missed one, -5 a day while heat is 40+). Control sets client pay (x0.5 at 0, x1.2 at 100). Lampas heat (0-100) rises +25 per joint taken, +2 a day per joint held and +5 per remix raid, and cools 4 a day. At 40 a Lampas price war, at 60 thugs lean on a client (control -10), at 80 (or a joint at 0 control) they retake the weakest joint: no orders until you win it back with a Retake raid from the van map (heat -30). At 100 they raid the warehouse (30% of the spice gone). Tribute (40 W per heat point) drops heat by 30. Shown in the Dagrapport and under the map.
- **Machinehandel** (step 7, under Kaasplaats): Dad's old trade. Buy shoarma machines used (two seeded offers a day) or new, hold up to 4, and sell them to client joints (grill W 1.400, pita oven 1.000, frituur 850, slicer 600). An installed machine raises that joint's daily order (+40/+20/+15/+10%), trust +10 and control +10. A haggling client with your machine can have it repossessed (trust -30). Klusbord machine-delivery jobs (once Kipkruidenkwartier is yours) pay 25% extra on arrival in Oud-Vettenburg, with Lampas heat +10.
- **Panden** (step 8, under My Wilders): buy a warehouse in a held territory (Loods Kroketkade W 6.000, Kelder Uitjesbuurt 4.500, Opslag Spekbuurt 5.000) for +100-150 kg, +1 machine slot and 2 Naknik places (W 450 each, they mix but give no 6-second trickle). Control there is shielded from the daily heat pressure. A Naknik on guard cuts a Lampas warehouse raid from 30% to 10% of the spice. A warehouse in a retaken territory shuts until you win it back.
- **Ranks and challenges** (step 9): reputation from client sales (W 20 = 1), raids (100, S grade 250), jobs (60) and retakes (150) sets the rank: Hulpje, Mengmeester (500), Kruidenhandelaar (1.500), Kruidenbaron (4.000), Spice Master (10.000), shown under My Wilders and on the start menu. Every level has four challenge stars, kept forever: S grade, no guns fired, under par (60 s + 8 s per Lampas, or `par` in the level file) and no hits taken; they show on the results screen and the map. **Daily challenge:** one seeded remix per real date on one of your joints, the same for every player that day, started from the van map; the best score of the day is kept in `state.daily`.
- **NPCs and the Ideeënboek** (`js/npcs.js`): seven people in Kipkruidenkwartier give Eddy ideas, each written into the Ideeënboek (PC icon `I`) and each unlocking a system: cousin **Shooki** (after your first joint; one extra Klusbord job a day), bookkeeper **Henk Cijfer** (at W 5.000; tomorrow's price arrows on the Kruidenbeurs), **Slager Bram** (bring him 10 kg Lams Shoarma of 3+ stars; he becomes a client and at trust 70+ makes Bio 25% cheaper), **Ome Joop** on the canal bench (pages of Eddy Sr.'s notebook at the district bonus / Mengmeester, Kruidenhandelaar and Kruidenbaron: the Slagerskruiden and Shoarma Speciaal blends and the first De Gouden Mix clue), **Monteur Mo** (after your first machine sale; broken machines for scrap, fixed overnight), **De Fluisteraar** under the bridge (from market day 5; W 50 for tomorrow's news, which is rolled a day ahead) and **Kevin**, a fed-up Lampas (Lampas heat 40+; a warning in the Dagrapport, and W 300 makes the next retake a quiet night). Met NPCs are saved in `state.npcs`; `__sme.npcs.CAST` exposes them.
- Later: New Game+ once the game has a finale; Noshgey Kariot and Abdavissies heat once their acts exist. with a day report, machine trade, territory control and faction heat, warehouses and raids.
- Test hook: `__sme.econ` (`advance()` ends a market day and runs the mix, `buy(id, grade, kg)`, `sellBlend(id, kg)`, `deliver()`, `stockTotal()`).

## Start menu & fonts
The game opens on a start menu (Continue / New Game / Controls / Music / Credits) over a slow dusk drift along the canal street;
it works with mouse, keyboard (↑ ↓ Enter Esc), controller (D-pad, A, B) and touch. A new game starts inside the warehouse:
Eddy Sr. hands over the keys there, then walks out through the shutter.

Fonts (SIL Open Font License, vendored in `assets/fonts` with their license files, so they work offline):
**Bungee** (logo, headings, money, toasts) · **Rubik** (UI, dialogue, shop, menus) · **VT323** and **Press Start 2P** (mission HUD, pixel accents).

## Saving
The game autosaves to `localStorage` (key `spiceMasterEddy.save`, versioned) on every story step, purchase, sale, music toggle,
mission end and when the tab closes. Mid-mission progress is not saved (it is when the mission ends). The title screen offers
**[Enter] Continue** or **[N] New Game** (asks to confirm with J). Fields a newer build added to the save are kept untouched.

Testing hooks are exposed on `window.__sme` in the browser console, e.g. `__sme.startLevel('kroketkade')` (jump into a mission),
`__sme.own('spekbuurt', 'kroketkade', 'uitjesbuurt')` (mark territories owned) and `__sme.mission.validate()` (level reachability checks).

## Naming rules
Kaasland (never the Netherlands) · currency Wilders · the blue Oofmobiel · factions Lampas, Noshgey Kariot, Abdavissies ·
helpers are Naknikim · the PC is Kaasdows 95. Full design: the Game Bible doc on the shared Drive.
