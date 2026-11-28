// Spice Master Eddy: Chapter 0, Kipkruidenkwartier.
// Neon Vice-style top-down browser game: three.js, PS2-style low-poly people with photo faces.
import { fonts } from './fontstyle.js'; // first: picks Aero or classic fonts before anything draws
import './aeroskin.js'; // the rest of the Aero look (glass HUD, gel meters, touch orbs, fades); only active with html.aero
import * as THREE from '../vendor/three.module.min.js';
import { Music } from './music.js';
import { CombatScore } from './combatmusic.js'; // adaptive shootout score: layers that build as a fight heats up
import { initInput, virt, isPaused, glyph, inputMode, onInputMode, controlsTable } from './input.js';
import { createGunShop } from './gunshop.js';
import { initMission } from './mission.js';
import { createPost } from './post.js';
import { LOW as RICH_LOW, klinker, asphalt as asphaltTex, surface, macro, clapTexture, hardsteen, decal, mergeStatic, kit, kitMat, blobGeo, rng, rippleNormal } from './richtex.js'; // richer street surfaces, trees, roofs and street furniture
import { createAeroWorld } from './aeroworld.js'; // the Aero setting's 3D look: clear sky, glossy canal, glass shop signs
import { makeBikeModel, createFiets, BIKE_PAINT } from './bikes.js'; // Dutch street bikes + Eddy's own omafiets to ride
import { makePS2Person, ps2Animate, installCharacters, lookFromPerson, LOOKS, stats as charStats, repaint } from './characters.js';
import { createWoning } from './woning.js'; // Eddy's homes, furniture, morning visitors, knacks and outfits (from Neon Vice, in spice colours)
import { makeOofmobiel, makeKangoo, makeCar, setLivery } from './vehicles.js';
import { makeSloep, makeTourBoat, makeArk, makeBarge, rockBoat, PAL } from './boats.js'; // canal boats: sloep, rondvaartboot, woonark, tjalk
import { signFace } from './livery.js'; // the warehouse sign follows the van's brand // shared van and street cars
import { createRit } from './rit.js'; // every drive in the Oofmobiel, in 3D: the home street, then the ring road to the district
import { createEconomy, rankOf, CLIENTS, BLENDS } from './economy.js';
import { createHeists } from './heist.js'; // Nachtklussen: the Plannenbord, tools and the fence
import { createCrew } from './crew.js'; // the Naknikim as people: names, mood, errands
import { createKaasMap } from './kaasmap.js'; // the Map of Kaasland: aerial view + place list (PC + Oofmobiel)
import { createJohan } from './johan.js';
import { createVenues } from './venues.js'; // the street's two new ends: Club Monique (west) and Tryshtahn Auto (east) // Johan, the childhood friend with The Letter: a Miata on the road, a forklift in the hall
import { createMabootaLaw } from './maboota.js'; // the Maboota in public: witnesses, Wijkagent Bakker at the door
import { createStats } from './stats.js'; // cijfers en prestaties
import { createTop10 } from './top10.js'; // de Kaasland Top 10, every Maandag in the Krant
import { createStamklanten } from './stamklanten.js'; // named neighbours who remember quality and price
import { createKlok } from './klok.js'; // the hours of the day: dusk, night, shop hours
import { createPolitie } from './politie.js'; // a patrol car when Eddy misbehaves in public
import { createGoederen } from './goederen.js';
import { createSpoed } from './spoed.js'; // spoed deliveries: load the van at the door, drive to De Peperpijp, unload at the kerb (or Shooki does it) // inbound and outbound timeslots: the trucks at the shed, later at the hall's dock
import { createPaHuis } from './pahuis.js'; // Freddy Sr.'s house on the Komijnstraat: the bed, the televisions
import { createStraatLeven } from './straatleven.js'; // traffic and walkers on the Komijnstraat and in the districts
import { createWijk } from './wijk.js'; // the other districts as open streets, at the end of the snelweg
import { createRoam, CROSS, ROT_Z, KOMIJN_RING } from './roam.js'; // free roaming, step 1: the street runs on into Spekbuurt, Uitjesbuurt and Kroketkade
import { createHub } from './hub.js'; // Overzicht (Tab), the day strip, where the Wilders went, NEW cards, route arrow
import { createVandaag } from './vandaag.js'; // Shooki's three goals for today
import { createBuurtRep } from './buurtrep.js'; // what each neighbourhood thinks of Eddy
import { createWinkels } from './winkels.js'; // walk into the Kipkruidenkade shops; klusjes and vaste klanten
import { createBills } from './bills.js'; // Weekrekeningen: erfpacht, lonen, brandstof every Maandag
import { createGarage } from './garage.js'; // Garage Mo: van tiers, add-ons, wheel clamps, the tax inspector
import { createHaggle, createSpiceStall } from './haggle.js'; // haggling with Tristan's cast (Werkplaats clients, Fenna, Oma Zahra)
import { createWorkshop } from './workshop.js'; // De Werkplaats: build and repair machines, upgrade the Kaasdows
import { initPhone } from './phone.js'; // Hakan calls for kipkraud
import { createTitleCity } from './titlecity.js'; // the animated city behind the start menu
import { createTips } from './tips.js'; // Shooki texts a tip the first time each topic comes up
import { createTutorial } from './tutorial.js';
import { createGuide, lessons, GUIDE_TIPS } from './guide.js'; // Shooki's click-through tutorial cards with highlights // the first fifteen minutes: Shooki's tour of the spice trade
import { createLoods } from './loods.js'; // De Loods: timed warehouse upgrades, racking, the heftruck, the hall and the tent
import { createSollicitanten, naknikLook, drawFace, feeOf } from './sollicitanten.js'; // the Uitzendbureau: pick your Naknikim one by one
import { createProductie } from './productie.js'; // the production line: pallets of vaten, the mixer, blue bags
import { createInrichten } from './inrichten.js'; // Eddy places the bought machines himself: a shorter walk, more kilos
import { createNaknikWork } from './naknikwork.js'; // the Naknikim at work: stirring, carrying sacks, racking, the kruidenketel
import { createMedia } from './kaasmedia.js'; // Kaasdows Mediaspeler: original live-generated desktop music
import { createKaasweer } from './kaasweer.js';
import { createBuurtFolk } from './buurtfolk.js'; // the shopkeepers of the block
import { createRegulars, REG_FACES } from './regulars.js'; // de vaste gezichten: eight street regulars with portraits (2026-11-27)
import { createBuurt, bizSign, bizBySign, place as placeBiz, BIZ } from './buurt.js'; // every business on the block, their ads and the buurtkaart // the week, the seasons, the weather and Krant voor het Kaasvolk
import { createKaasdows, ICONS as KD_ICONS } from './kaasdows.js'; // the PC's desktop shell: icons, start menu, window frame, boot screen, startup chime
import { createBlokaas, BLK_FACES } from './blokaas.js'; // the rivals from Almere: Hans & Conny Blokaas, binoculars across the street (2026-11-28)
import { createActivists } from './activists.js'; // the protesters' picket on the pavement, and what Pa, Shooki and Razim think of it
import { createStreetFolk } from './streetfolk.js'; // passers-by as archetypes: props, poses, habits, their own [E]
import { createBalloons } from './balloons.js';
import { createPortraits } from './portrait.js'; // Freddy Sr. and Eddy Jr. photos that talk and blink // Frutiger Aero speech balloons, kept on screen
import { fitFov, createAutoQuality, shadowSize, IS_PHONE } from './mobile.js'; // phones and tablets: auto graphics, upright camera
import { createFreddy } from './freddy.js'; // Freddy Sr. comes home via Schiptagat and rides along
import { initNpcs } from './npcs.js'; // the people of Kipkruidenkwartier who give Eddy ideas // spice market, stock (gang-wars economy layer)
let mission = null; // Mission 1: Spekbuurt (js/mission.js)
let loods = null; // js/loods.js, set up after the economy
let johan = null; // js/johan.js, set up after De Loods
let venues = null; // js/venues.js: Club Monique and Tryshtahn Auto
let prod = null, solli = null; // js/productie.js, js/sollicitanten.js
let work = null; // js/naknikwork.js, set up after De Loods
let inricht = null; // js/inrichten.js
let buurt = null, bfolk = null, regulars = null; // js/buurt.js, js/buurtfolk.js, js/regulars.js
const streetHouses = []; // the houses on the street rows, for the buurtkaart
let stats = null, stam = null, klok = null, politie = null; // js/stats.js, js/stamklanten.js, js/klok.js, js/politie.js
let roam = null; // js/roam.js, set up after the street and the economy
let wijk = null, leven = null, driveWijk = null, pahuis = null, goederen = null, spoed = null; // js/wijk.js: the other districts as open streets; js/straatleven.js: their traffic
function tripOn() { return !!(oofDrive && oofDrive.active) || !!(wijk && wijk.active); } // Eddy is away from the home streets: on the snelweg, or in another district
let hub = null; // js/hub.js, set up after Vandaag
let vandaag = null; // js/vandaag.js, set up last (it reads every system)
let top10 = null; // js/top10.js, the weekly league (set up after Cijfers)
let brep = null; // js/buurtrep.js, set up right after the economy
let winkels = null; // js/winkels.js, set up after the shopkeepers
let bills = null; // js/bills.js, set up after Garage Mo and the crew
let world = null; // js/kaasweer.js: calendar, weather, the daily paper (set up once the walkers exist)
let woning = null; // js/woning.js, set up once the street, the economy and the phone exist
const music = new Music();
const score = new CombatScore();
const musicDucks = {}; // who wants the street song quieter (the fight score, the Kaasdows media player): the quietest wins
function setDuck(k, v) { if (musicDucks[k] === v) return; musicDucks[k] = v; music.duck(Math.min(1, ...Object.values(musicDucks))); }
// the loading screen (index.html #loader): main.js pauses between its big build steps so the bar can move and the page
// stays responsive; the last step warms every shader in the background before the first frame (a hidden tab doesn't wait for frames)
const bootBar = document.getElementById('ldBar'), bootLbl = document.getElementById('ldStep');
function bootStep(pct, label) {
  if (bootBar) bootBar.style.width = pct + '%'; if (bootLbl && label) bootLbl.textContent = label;
  return new Promise((r) => { let go = false; const f = () => { if (!go) { go = true; setTimeout(r, 0); } }; requestAnimationFrame(f); setTimeout(f, 120); });
}
function bootDone() { const el = document.getElementById('loader'); if (!el) return; if (bootBar) bootBar.style.width = '100%'; el.classList.add('done'); setTimeout(() => el.remove(), 600); }

// ------------------------------------------------------------------ renderer / scene
const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const PIXEL = 1.0;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2) * PIXEL);
renderer.setSize(innerWidth, innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
let aeroWorld = null; // js/aeroworld.js, made once the street is built (see the bottom of this file)
let fiets = null; // js/bikes.js: Eddy's omafiets, made at the bottom of this file
const post = createPost(renderer);
const autoQ = createAutoQuality(renderer, post); // caps the pixel ratio on touch devices, lowers it when the frame rate sags (js/mobile.js) // Neon Vice-style screen pass: bloom, grade, vignette; GRAPHICS in the pause menu (js/post.js)

const scene = new THREE.Scene();
installCharacters(scene); // Neon Vice-style skinned characters pose themselves right before each render
scene.background = new THREE.Color(0xf0b4b8);
scene.fog = new THREE.Fog(0xf0b4b8, 70, 140);
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.5, 300);
fitFov(camera, 38);
const balloons = createBalloons();
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); fitFov(camera, 38);
  renderer.setSize(innerWidth, innerHeight, false);
});

{
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, '#3a4ab0'); gr.addColorStop(0.25, '#8a6ad0'); gr.addColorStop(0.42, '#ff8fb0'); gr.addColorStop(0.5, '#ffd0a0'); gr.addColorStop(0.56, '#7a6a80'); gr.addColorStop(1, '#3a3048');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(Math.random() * 256, 18 + Math.random() * 30, 14 + Math.random() * 18, 4, 0, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(t).texture; scene.environmentIntensity = 0.55;
}
const hemi = new THREE.HemisphereLight(0xffe0f0, 0x6a5a80, 1.25); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd8a8, 2.9);
sun.position.set(-18, 30, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(shadowSize(), shadowSize());
{ const r = IS_PHONE ? 24 : 40; Object.assign(sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 1, far: 90 }); } // phones see ~20 m of street: a tighter box draws far fewer casters (and sharper)
sun.shadow.bias = -0.0008;
if (IS_PHONE) sun.shadow.autoUpdate = false; // phones redraw the shadow map every other frame (the tick sets needsUpdate): half the shadow draw calls
let shadowTick = 0;
scene.add(sun, sun.target);

// ------------------------------------------------------------------ helpers
const loader = new THREE.TextureLoader();
const texCache = {};
function tex(name, rx = 1, ry = 1) {
  const key = name + rx + 'x' + ry;
  if (texCache[key]) return texCache[key];
  const t = loader.load('./assets/' + name);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = 4;
  return (texCache[key] = t);
}
const lam = (o) => new THREE.MeshLambertMaterial(o);
function texN(name, rx = 1, ry = 1) {
  const key = 'N' + name + rx + 'x' + ry;
  if (texCache[key]) return texCache[key];
  const t = loader.load('./assets/' + name.replace('.jpg', '_n.jpg'));
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4;
  return (texCache[key] = t);
}
// PBR-ish material from the CC0 library textures (colour + generated normal map)
function pbr(name, rx, ry, color = 0xffffff, rough = 0.9, nscale = 0.8) {
  return new THREE.MeshStandardMaterial({ map: tex(name, rx, ry), normalMap: texN(name, rx, ry), normalScale: new THREE.Vector2(nscale, nscale), color, roughness: rough, metalness: 0 });
}
const woodMat = pbr('wood.jpg', 1, 1, 0xb08a64, 0.8, 0.6);
const mat = {
  skin: lam({ color: 0xe0a985 }),
  steel: new THREE.MeshPhongMaterial({ color: 0xb8bec4, shininess: 70, specular: 0x666666 }),
  dark: lam({ color: 0x2a2a2e }),
  black: lam({ color: 0x111114 }),
  glass: new THREE.MeshPhongMaterial({ color: 0x1d2a38, shininess: 90, specular: 0x8899aa }),
  wood: woodMat,
  white: lam({ color: 0xf0eee8 }),
  gold: new THREE.MeshPhongMaterial({ color: 0xe8b84a, shininess: 90, specular: 0xffeeaa }),
};
function box(w, h, d, m, x = 0, y = 0, z = 0, parent = scene, shadow = true) {
  const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  g.position.set(x, y, z);
  g.castShadow = shadow; g.receiveShadow = true;
  parent.add(g);
  return g;
}
function cyl(rt, rb, h, m, x = 0, y = 0, z = 0, parent = scene, seg = 10) {
  const g = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  g.position.set(x, y, z); g.castShadow = true; g.receiveShadow = true;
  parent.add(g);
  return g;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function signTex(lines, bg = '#1a1a1a', fg = '#ffd36b', w = 512, h = 128) {
  const t = signTex0(lines, bg, fg, w, h); t.userData.sign = true; return t; // aeroworld.js gives these a glass face under Aero
}
function signTex0(lines, bg, fg, w, h) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = fg; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((l, i) => {
      let fs = l.size || 46; g.font = `900 ${fs}px Arial Black, Impact, sans-serif`;
      while (g.measureText(l.t).width > w - 36 && fs > 10) { fs -= 2; g.font = `900 ${fs}px Arial Black, Impact, sans-serif`; } // shrink to fit, never crop
      g.fillStyle = l.color || fg;
      g.fillText(l.t, w / 2, h * (lines.length === 1 ? 0.52 : (i + 0.75) / (lines.length + 0.5)));
    });
  });
}

// ------------------------------------------------------------------ collision
const solids = []; // {minx,maxx,minz,maxz}
const BOUNDS = { cur: null }; // walkable area override (missions)
function solid(x0, x1, z0, z1) { const s = { minx: Math.min(x0, x1), maxx: Math.max(x0, x1), minz: Math.min(z0, z1), maxz: Math.max(z0, z1) }; solids.push(s); return s; }
function collide(p, r) {
  for (const s of solids) {
    if (s.off) continue;
    const cx = Math.max(s.minx, Math.min(p.x, s.maxx)), cz = Math.max(s.minz, Math.min(p.z, s.maxz));
    const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      if (d2 > 1e-8) { const d = Math.sqrt(d2), push = r - d; p.x += dx / d * push; p.z += dz / d * push; }
      else { // inside: push out on the shortest axis
        const opts = [[s.minx - r - p.x, 0], [s.maxx + r - p.x, 0], [0, s.minz - r - p.z], [0, s.maxz + r - p.z]];
        opts.sort((a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]));
        p.x += opts[0][0]; p.z += opts[0][1];
      }
    }
  }
  const B = BOUNDS.cur || { x0: WALK.x0, x1: WALK.x1, z0: WALK.z0, z1: FAR.front - 0.45 }; // z0: the hall and tent on the plot behind the shed; z1: the shop fronts across the canal
  p.x = Math.max(B.x0, Math.min(B.x1, p.x));
  p.z = Math.max(B.z0, Math.min(B.z1, p.z));
  if (!BOUNDS.cur) { // the canal: only over a bridge, and a bridge keeps you between its railings
    const N = 10.6 + RC, S_ = FAR.edge + 0.45;
    if (p.z > N && p.z < S_) {
      const br = onBridge || BRIDGES.find((b) => p.x > b.x0 + 0.3 && p.x < b.x1 - 0.3);
      if (br) { onBridge = br; p.x = Math.max(br.x0 + 0.42, Math.min(br.x1 - 0.42, p.x)); }
      else p.z = p.z < CZ ? N : S_;
    } else onBridge = null;
  }
}

await bootStep(12, 'Laying the cobbles of the Kipkruidenkwartier…');
// ------------------------------------------------------------------ world: ground, street, canal
// Cross-section (north → south), road centre RC: facades z=-7 | pavement 3.4 m | kerb | parking | 2 lanes | parking |
// kerb | red two-way fietspad | pavement + trees | quay | canal (CZ)
const RC = 1.6;
// the street runs east-west from -SX to SX (was ±70; made longer 2026-11-24 for Club Monique in the west and Tryshtahn's showroom in the east)
const SX = 100, SXK = SX / 70; // half length, and how much longer the tiled textures repeat
const WALK = { x0: -70, x1: 84, z0: -37.2 }; // how far Eddy can walk along it (js/roam.js stretches it once the buurten open)
let lifeLast = [-(SX - 2), SX - 2];
const lifeWin = (m = 100) => { if (BOUNDS.cur) return lifeLast; const lo = Math.max(WALK.x0 - 4, player.position.x - m), hi = Math.min(WALK.x1 + 4, player.position.x + m); return (lifeLast = WALK.x0 > -80 ? [-(SX - 2), SX - 2] : [lo, hi]); }; // traffic, bikes and walkers stay within ~100 m of Eddy; on the home street alone it is the old ±SX
const ROAD = { pN: RC - 5.0, lane: 3.0, pS: RC + 5.0, bike0: RC + 5.2, bike1: RC + 7.6, walk1: RC + 10.9 };
const CZ = 15 + RC;
// across the canal: the even side of the Kipkruidengracht. The houses stand back from the water, a klinker quay runs in front of them,
// and two bridges cross: the brick one by Eddy's parking and a white ophaalbrug at the east end.
const SROW = CZ + 13, FAR = { edge: CZ + 3.75, front: CZ + 9, lane: [CZ + 6.3, CZ + 7.4] };
const BRIDGES = [{ x0: 11.5, x1: 16.5 }, { x0: 56.2, x1: 59.8 }];
const offBridge = (x, m = 3) => BRIDGES.every((b) => Math.abs(x - (b.x0 + b.x1) / 2) > (b.x1 - b.x0) / 2 + m - 2.5);
let onBridge = null; // the bridge Eddy is crossing (collide keeps him on the deck)
let camFlip = false, flipA = 0, ctrlFlip = false; // across the canal the camera swings round to look south at the shop fronts; the controls follow once the keys are let go
const groundMat = macro(lam({ map: tex('paving.jpg', 40, 20), color: 0xd8d2c4 }), 0.18, 0.08);
for (const [z0, z1] of [[-70, CZ - 3.75], [CZ + 3.75, 70]]) {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(SX * 2, z1 - z0), groundMat);
  g.rotation.x = -Math.PI / 2; g.position.z = (z0 + z1) / 2; g.receiveShadow = true; scene.add(g);
}
function strip(z0, z1, m, y = 0.02) {
  const p = new THREE.Mesh(new THREE.PlaneGeometry(SX * 2, z1 - z0), m);
  p.rotation.x = -Math.PI / 2; p.position.set(0, y, (z0 + z1) / 2); p.receiveShadow = true; scene.add(p); return p;
}
const wetMats = []; // tarmac, klinkers and kerbs that go dark and shiny in the rain (js/kaasweer.js)
wetMats.push(strip(RC - ROAD.lane, RC + ROAD.lane, surface(asphaltTex('grey'), 22 * SXK, 1.6, { color: 0xc4c2c0, rough: 0.88, nscale: 0.6, macroAmt: 0.12 })).material); // aggregate, tar-sealed cracks, patches (js/richtex.js)
// parking bays: grey klinkers in herringbone (like the Drive street photos) with white bay lines
const bayMat = surface(klinker('grey'), 70 * SXK, 1, { rough: 0.9, nscale: 1.1, macroAmt: 0.16 });
strip(ROAD.pN, RC - ROAD.lane, bayMat, 0.022); strip(RC + ROAD.lane, ROAD.pS, bayMat, 0.022); wetMats.push(bayMat);
for (let x = -SX + 4; x < SX - 4; x += 5.6) for (const z of [RC - 4, RC + 4]) box(0.1, 0.01, 1.9, mat.white, x, 0.032, z, scene, false);
for (const z of [RC - ROAD.lane, RC + ROAD.lane]) box(SX * 2, 0.01, 0.1, mat.white, 0, 0.032, z, scene, false);
// centre line (dashed, Dutch style) — skipped at the zebra
for (let x = -SX + 4; x < SX - 4; x += 4) if (Math.abs(x + 18) > 3) box(2, 0.01, 0.14, mat.white, x, 0.035, RC, scene, false);
// zebra crossing spans the lanes and the bays
for (let i = 0; i < 10; i++) box(3.2, 0.012, 0.5, mat.white, -18, 0.036, RC - 4.3 + i * 0.96, scene, false);
// kerbs
const kerbMat = surface(hardsteen(), 70 * SXK, 0.25, { color: 0xd8d4cc, rough: 0.8, nscale: 0.6 }); // bluestone kerbs
for (const z of [RC - 5.1, RC + 5.1]) box(SX * 2, 0.16, 0.18, kerbMat, 0, 0.08, z, scene, false);
wetMats.push(kerbMat);
// pavements
for (const [z0, z1] of [[-7, RC - 5.2], [ROAD.bike1, ROAD.walk1]]) wetMats.push(strip(z0, z1, macro(pbr('tiles_stone.jpg', 46 * SXK, (z1 - z0) / 3, 0xc9c4ba, 0.85, 0.6), 0.15, 0.1), 0.012).material);
// fietspad: red asphalt with a dashed white centre line and bike symbols
wetMats.push(strip(ROAD.bike0, ROAD.bike1, surface(asphaltTex('red'), 28 * SXK, 0.6, { color: 0xe0b0a4, rough: 0.85, nscale: 0.5, macroAmt: 0.1 }), 0.016).material);
for (let x = -SX + 4; x < SX - 4; x += 3) box(1.2, 0.01, 0.1, mat.white, x, 0.03, (ROAD.bike0 + ROAD.bike1) / 2, scene, false);
const bikeSym = canvasTex(128, 128, (g) => { g.strokeStyle = '#fff'; g.lineWidth = 7; for (const x of [34, 94]) { g.beginPath(); g.arc(x, 82, 22, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(34, 82); g.lineTo(58, 50); g.lineTo(94, 50); g.lineTo(94, 82); g.moveTo(58, 50); g.lineTo(70, 82); g.lineTo(94, 50); g.moveTo(52, 40); g.lineTo(66, 40); g.moveTo(94, 50); g.lineTo(88, 34); g.stroke(); });
for (let x = -SX + 10; x < SX - 10; x += 20) for (const [z, r] of [[RC + 5.8, 0], [RC + 7.0, Math.PI]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), lam({ map: bikeSym, transparent: true })); p.rotation.set(-Math.PI / 2, 0, r - Math.PI / 2); p.position.set(x, 0.034, z); scene.add(p); }
box(SX * 2, 0.08, 0.12, kerbMat, 0, 0.04, ROAD.bike1, scene, false);

// canal along the south side of the street (Amsterdam-style)
const waterRip = rippleNormal(); // slow ripples so the Klassiek canal catches the light (js/richtex.js)
const water = new THREE.Mesh(new THREE.PlaneGeometry(SX * 2, 7.5), new THREE.MeshPhongMaterial({ color: 0x2e5a5c, shininess: 80, specular: 0x88aaaa, normalMap: waterRip, normalScale: new THREE.Vector2(0.45, 0.45) }));
water.rotation.x = -Math.PI / 2; water.position.set(0, -1.1, CZ); water.renderOrder = 10; scene.add(water); // drawn after the boats' dry wells (js/boats.js), so open boats are not full of canal
const quayMat = macro(pbr('brick_red.jpg', 60 * SXK, 1, 0x9a7a6a, 0.9, 1.0), 0.2, 0.15);
const q1 = new THREE.Mesh(new THREE.PlaneGeometry(SX * 2, 1.2), quayMat); q1.position.set(0, -0.55, CZ - 3.74); scene.add(q1);
const q2 = new THREE.Mesh(new THREE.PlaneGeometry(SX * 2, 1.2), quayMat); q2.position.set(0, -0.55, CZ + 3.74); q2.rotation.y = Math.PI; scene.add(q2);
const copingMat = surface(hardsteen(), 80 * SXK, 0.5, { color: 0xc8c4bc, rough: 0.8 });
box(SX * 2, 0.14, 0.4, copingMat, 0, 0.07, CZ - 3.9, scene, false); // bluestone quay coping
// bridge over the canal
box(5, 0.4, 7.8, lam({ map: tex('paving.jpg', 2, 3) }), 14, -0.15, CZ);
{ const K = kit(); // bridge: bluestone kerbs, a dark green iron railing with posts, a top rail and a mid rail, brick arch faces
  for (const x of [11.6, 16.4]) {
    K.box(0.34, 0.16, 7.8, 0x6a6e72, x, 0.13, CZ);
    for (let z = CZ - 3.8; z <= CZ + 3.81; z += 0.95) K.box(0.07, 0.95, 0.07, 0x1f3a2c, x, 0.68, z);
    K.box(0.1, 0.06, 7.8, 0x1f3a2c, x, 1.16, CZ); K.box(0.05, 0.05, 7.8, 0x1f3a2c, x, 0.68, CZ);
    for (let z = CZ - 3.8; z < CZ + 3.8; z += 0.19) K.box(0.025, 0.42, 0.025, 0x1f3a2c, x, 0.43, z + 0.09); // balusters
  }
  for (const z of [CZ - 3.6, CZ + 3.6]) K.box(5, 0.9, 0.2, 0x8a4a3a, 14, -0.75, z);
  scene.add(K.build()); }
// trees between the fietspad and the pavement: Dutch lindens and the odd Vice palm, half-way between the lamps
const treeKit = kit(), decals = []; // all lindens in one mesh; flat ground decals collected and batched per texture below
function tree(x, z, s = 1, TK = treeKit) { // TK: another kit for a free-roaming street piece // Dutch linden: tapered trunk, a fork, and a lumpy canopy of overlapping blobs in a few greens
  const r = rng(Math.round(x * 13 + 1000)), bark = 0x5e4636;
  TK.cyl(0.11 * s, 0.19 * s, 2.3 * s, bark, x, 1.15 * s, z, 9);
  TK.cyl(0.24 * s, 0.26 * s, 0.12, 0x4a3a2c, x, 0.06, z, 9); // root flare
  for (const a of [0.5, 2.6, 4.4]) TK.cyl(0.05 * s, 0.08 * s, 1.3 * s, bark, x + Math.cos(a) * 0.3 * s, 2.6 * s, z + Math.sin(a) * 0.3 * s, 6, Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
  const greens = [0x4f7a34, 0x5f8a3c, 0x46703a, 0x6a9442, 0x3e6230], autumn = Math.abs(Math.round(x)) % 4 === 2; // the odd tree already turning turmeric
  const blobs = [[0, 3.35, 0, 1.35], [0.85, 3.05, 0.3, 0.95], [-0.8, 3.1, -0.25, 1.0], [0.2, 3.0, -0.85, 0.9], [-0.25, 3.15, 0.85, 0.92], [0.1, 4.05, 0.1, 0.9], [0.6, 3.75, -0.5, 0.7]];
  blobs.forEach(([bx, by, bz, br], i) => {
    const c = autumn && i === 4 ? 0xa89a3a : greens[Math.floor(r() * greens.length)];
    TK.geo(blobGeo(1 + (i % 4), 2), c, x + bx * s * 0.8, by * s * 0.95, z + bz * s * 0.8, r() * 3, r() * 3, 0, br * s * 0.82, br * s * 0.74, br * s * 0.82);
  });
  if (TK === treeKit) decals.push(['grate', x, z, 1.5, r() * 6]);
  if (TK === treeKit && r() < 0.7) decals.push(['leaves', x + (r() - 0.5) * 1.6, z + (r() - 0.5) * 0.6, 1.8 + r(), r() * 6]);
  solid(x - 0.2, x + 0.2, z - 0.2, z + 0.2);
}
const frondTex = canvasTex(64, 256, (g, w, h) => {
  g.strokeStyle = '#3a6a22'; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 0); g.stroke();
  for (let y = 8; y < h - 6; y += 7) { const L = (w / 2 - 2) * Math.sin((y / h) * Math.PI) + 4; g.strokeStyle = y % 14 ? '#4f9a30' : '#5aa83a'; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, y + 6); g.lineTo(w / 2 - L, y); g.moveTo(w / 2, y + 6); g.lineTo(w / 2 + L, y); g.stroke(); }
});
const frondMat = new THREE.MeshLambertMaterial({ map: frondTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide });
function palm(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const bark = lam({ color: 0x8a6a48 }), lean = 0.12 + (Math.abs(x) % 3) * 0.05;
  let px = 0, py = 0;
  for (let i = 0; i < 7; i++) { // gently curved, ringed trunk
    const seg = cyl(0.17 - i * 0.012, 0.19 - i * 0.012, 0.75, bark, px, py + 0.37, 0, g, 8);
    seg.rotation.z = -lean * (i / 6); px += Math.sin(lean * (i / 6)) * 0.75; py += 0.72;
  }
  for (let k = 0; k < 8; k++) { // drooping fronds: two planes per frond
    const a = k / 8 * Math.PI * 2, fr = new THREE.Group(); fr.position.set(px, py + 0.1, 0); fr.rotation.y = a; g.add(fr);
    const p1 = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.4), frondMat); p1.rotation.set(-Math.PI / 2 + 0.55, 0, 0); p1.position.set(0, 0.25, 0.6); fr.add(p1);
    const p2 = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.2), frondMat); p2.rotation.set(-Math.PI / 2 - 0.5, 0, 0); p2.position.set(0, -0.05, 1.75); fr.add(p2);
    p1.castShadow = p2.castShadow = true;
  }
  for (let k = 0; k < 3; k++) cyl(0.09, 0.09, 0.16, lam({ color: 0x6a4a20 }), px + Math.cos(k * 2) * 0.18, py - 0.08, Math.sin(k * 2) * 0.18, g, 8);
  g.scale.setScalar(s);
  solid(x - 0.22, x + 0.22, z - 0.22, z + 0.22);
}
for (let x = -54; x <= 54; x += 12) if (Math.abs(x - 14) > 3) (Math.abs(x / 12) % 2 === 0.5 || x === -6 || x === 30 ? palm : tree)(x, ROAD.bike1 + 0.45, x % 24 === 6 ? 1.05 : 0.9);
{ const tm = treeKit.build(); if (tm) scene.add(tm); }

// ------------------------------------------------------------------ houses (Amsterdam-style gables)
const brickMats = [
  pbr('brick_red.jpg', 2, 3, 0xd08a6a),
  pbr('brick_red2.jpg', 2, 3, 0xb08070),
  pbr('brick_cream2.jpg', 2, 3, 0xe8dcc0),
  pbr('brick_red.jpg', 2, 3, 0x8a5a4a),
  pbr('plaster2.jpg', 2, 3, 0xf0e6d4, 0.95, 0.4),
  pbr('brick_red2.jpg', 2, 3, 0x8a7a76),
];
// Dutch 80s Neon Vice: Zaanse wooden houses (clapboard, white trim, pointed / bell gables, orange tiles) painted in Vice pastels
const VICE = [0x23a07a, 0x2fb8b0, 0xff8fb8, 0x9a86e0, 0x4f9ee0, 0xffb48a, 0x7ad8b0, 0xffd86a, 0x1f7a5e, 0x6ac0ff];
const NEON = [0xe8862c, 0xf2c14e, 0xffe14a, 0x8fbf4a];
const clapTex = clapTexture(1, 3); // painted boards with wood grain, butt joints and chipped edges (js/richtex.js)

const clapMat = (c) => new THREE.MeshStandardMaterial({ map: clapTex, bumpMap: clapTex, bumpScale: 2.2, color: c, roughness: 0.72 });
const roofMat = pbr('roof_tiles.jpg', 2, 2, 0xf08048, 0.8, 1.0);
const glassTex = canvasTex(64, 96, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#ffd8f0'); gr.addColorStop(0.45, '#8ab8e4'); gr.addColorStop(1, '#3a4a90');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(8, h); g.lineTo(26, h); g.lineTo(58, 0); g.lineTo(40, 0); g.fill();
  g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.moveTo(30, h); g.lineTo(36, h); g.lineTo(64, 10); g.lineTo(64, 0); g.fill();
});
const winMat = new THREE.MeshStandardMaterial({ map: glassTex, roughness: 0.05, metalness: 0.55, envMapIntensity: 1.4 });
const frameMat = lam({ color: 0xf6f4ee });
const neonMat = (c) => new THREE.MeshBasicMaterial({ color: c });
// soft additive glow strip that sits behind a neon tube (the Neon Vice glow without post-processing)
const glowTex = canvasTex(16, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const glowMat = (c, o = 0.55) => { const m = new THREE.MeshBasicMaterial({ color: c, map: glowTex, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false }); m.userData.baseOp = o; return m; };
function neonTube(g, x0, y0, x1, y1, z, c, t = 0.07) {
  const L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0);
  const core = box(L + t, t, t, neonMat(c), (x0 + x1) / 2, (y0 + y1) / 2, z, g, false); core.rotation.z = a;
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(L + 0.5, 0.55), glowMat(c)); gl.position.set((x0 + x1) / 2, (y0 + y1) / 2, z - 0.02); gl.rotation.z = a; gl.userData.glow = true; g.add(gl);
}
function neonRect(g, x, y, w, h, z, c) { neonTube(g, x - w / 2, y - h / 2, x + w / 2, y - h / 2, z, c); neonTube(g, x + w / 2, y - h / 2, x + w / 2, y + h / 2, z, c); neonTube(g, x + w / 2, y + h / 2, x - w / 2, y + h / 2, z, c); neonTube(g, x - w / 2, y + h / 2, x - w / 2, y - h / 2, z, c); }
// vertical neon blade sign sticking out of the facade
const BLADES = ['SNACK', 'VIDEO', 'DISCO', 'FRITES', 'HOTEL', 'KAAS', 'BIER', 'ARCADE', 'BINGO', 'GRILL'];
function bladeSign(g, x, y, z, word, c) {
  const hex = '#' + c.toString(16).padStart(6, '0');
  const t = canvasTex(96, 64 * word.length + 32, (q, w, h) => { q.fillStyle = '#140a1c'; q.fillRect(0, 0, w, h); q.strokeStyle = hex; q.lineWidth = 5; q.strokeRect(5, 5, w - 10, h - 10); q.font = '900 54px Arial Black, Arial'; q.textAlign = 'center'; q.shadowColor = hex; q.shadowBlur = 14; q.fillStyle = '#fff'; [...word].forEach((ch, i) => q.fillText(ch, w / 2, 70 + i * 64)); });
  const H = 0.42 * word.length + 0.25;
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.7, H), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); p.position.set(x, y, z + 0.55); p.rotation.y = Math.PI / 2; g.add(p);
  box(0.06, 0.06, 0.6, mat.dark, x, y + H / 2 - 0.1, z + 0.3, g, false); box(0.06, 0.06, 0.6, mat.dark, x, y - H / 2 + 0.1, z + 0.3, g, false);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, H + 0.8), glowMat(c, 0.35)); gl.position.set(x, y, z + 0.55); gl.rotation.y = Math.PI / 2; g.add(gl);
  const gl2 = gl.clone(); gl2.rotation.y = -Math.PI / 2; g.add(gl2);
}
// posters and graffiti (generated once, reused)
const POSTERS = [
  ['DISCO', 'KAASBAL', '12 MAART · 21:00', '#e8a33d', '#1e120a'], ['HOLLANDSE', 'HITS 86', 'MET DE ZINGENDE KAASBOER', '#ffd23a', '#2a1a5a'],
  ['GEZOCHT', 'JAN v. KAAS', 'BELONING: 500 WILDERS', '#1a1a1a', '#f2e6c8'], ['KOOP NU', 'KAASDOWS XL', 'DE TOEKOMST IS NU', '#a9c46a', '#0a1a3a'],
  ['CIRCUS', 'FRIKANDEL', 'KINDEREN HALF GELD', '#ff7a1a', '#fff2d8'], ['SPECERIJEN', 'EDDY & ZN', 'SINDS 1987', '#ffd36b', '#6b1410'],
].map(([a, b, c, fg, bg]) => canvasTex(128, 180, (g, w, h) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.fillRect(6, 6, w - 12, 6); g.fillRect(6, h - 12, w - 12, 6);
  g.textAlign = 'center'; g.font = '900 20px Arial Black, Arial'; g.fillText(a, w / 2, 44); g.font = '900 24px Arial Black, Arial'; let fs = 24; while (g.measureText(b).width > 118) { fs -= 2; g.font = `900 ${fs}px Arial Black, Arial`; } g.fillText(b, w / 2, 84);
  g.beginPath(); g.arc(w / 2, 122, 18, 0, 7); g.fill(); g.font = '700 10px Arial'; g.fillText(c, w / 2, 166);
}));
const TAGS = ['KAAS!', 'EDDY', 'NOSH', 'LAMPAS', 'D00D', 'WOEST', 'ZAAN', 'FRIET'];
const GRAFFITI = TAGS.map((word, i) => canvasTex(256, 96, (g, w, h) => {
  const cols = [['#e8a33d', '#a9c46a'], ['#ffd23a', '#8fbf4a'], ['#a9c46a', '#ff7a1a'], ['#7aff6a', '#e8a33d']][i % 4];
  g.translate(w / 2, h / 2); g.rotate(-0.08 + (i % 3) * 0.06); g.font = '900 64px Arial Black, Impact, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = '#111'; g.strokeText(word, 0, 0); g.fillStyle = cols[0]; g.fillText(word, 0, 0);
  g.lineWidth = 3; g.strokeStyle = cols[1]; g.strokeText(word, 0, 0);
  g.fillStyle = cols[0]; for (let k = 0; k < 6; k++) g.fillRect(-90 + k * 34, 20, 4, 10 + (k * 7) % 22);
}));
function poster(g, x, y, z, k, rot = 0) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.88), lam({ map: POSTERS[k % POSTERS.length], transparent: true })); p.position.set(x, y, z); p.rotation.z = rot; g.add(p); return p; }
function graffiti(g, x, y, z, k, wdt = 1.6) { const p = new THREE.Mesh(new THREE.PlaneGeometry(wdt, wdt * 0.375), lam({ map: GRAFFITI[k % GRAFFITI.length], transparent: true, depthWrite: false })); p.position.set(x, y, z); g.add(p); return p; }
const fadeables = [];
// a thin bar from (x0,y0) to (x1,y1) on the facade plane
function edge(g, x0, y0, x1, y1, z, m, t = 0.16) { const b = box(Math.hypot(x1 - x0, y1 - y0) + t * 0.6, t, 0.1, m, (x0 + x1) / 2, (y0 + y1) / 2, z, g, false); b.rotation.z = Math.atan2(y1 - y0, x1 - x0); return b; }
await bootStep(20, 'Building the canal houses…');
// ------------------------------------------------------------------ old Dutch canal houses (2026-11-26)
// Every house on the street is its own building: brick in ten tones (red, brown, yellow IJsselsteen, black-tarred, plastered),
// one of five gables (trapgevel, klokgevel, halsgevel, tuitgevel, lijstgevel) with a sandstone outline, a hoist beam and a loft
// hatch or oeil-de-boeuf, tall small-paned sash windows with stone lintels, some lit, some with shutters, a painted door with a
// fanlight. A business gets a projecting glass winkelpui in its own colours with its own window display (SHOPLOOK).
const OLD_WALLS = [
  pbr('brick_red.jpg', 2, 3, 0xc07a5c), pbr('brick_red2.jpg', 2, 3, 0x9a6a5c), pbr('brick_red.jpg', 2, 3, 0x7a4a3c), pbr('brick_cream2.jpg', 2, 3, 0xd8c090), pbr('brick_red2.jpg', 2, 3, 0x6a5850),
  pbr('plaster2.jpg', 2, 3, 0x34302e, 0.9, 0.4), pbr('brick_red.jpg', 2, 3, 0xa85a44), pbr('plaster2.jpg', 2, 3, 0xe6dcc8, 0.95, 0.4), pbr('brick_cream2.jpg', 2, 3, 0xb8a890), pbr('brick_red2.jpg', 2, 3, 0xb87060),
];
const stoneMat = lam({ color: 0xe6dcc6 }), roofDark = pbr('roof_tiles.jpg', 2, 2, 0x55555e, 0.8, 1.0);
const oldGlassTex = canvasTex(64, 96, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#9ab8cc'); gr.addColorStop(0.4, '#4a6a8a'); gr.addColorStop(1, '#1c2a3a');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.moveTo(6, h); g.lineTo(22, h); g.lineTo(56, 0); g.lineTo(40, 0); g.fill();
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(30, h); g.lineTo(36, h); g.lineTo(64, 14); g.lineTo(64, 4); g.fill();
});
const oldGlass = new THREE.MeshStandardMaterial({ map: oldGlassTex, roughness: 0.06, metalness: 0.5, envMapIntensity: 1.5 });
const oldGlassLit = new THREE.MeshStandardMaterial({ map: oldGlassTex, roughness: 0.1, metalness: 0.3, envMapIntensity: 1.2, emissive: 0xffc878, emissiveIntensity: 0.55 });
const shopGlass = new THREE.MeshStandardMaterial({ color: 0x7fb0c8, roughness: 0.05, metalness: 0.2, envMapIntensity: 0.6, transparent: true, opacity: 0.26, depthWrite: false }); shopGlass.userData.baseOp = 0.26;
const shopLit = lam({ color: 0x8a7858, emissive: 0xffc880, emissiveIntensity: 0.16 });
const OLD_DOORS = [0x1f3a2c, 0x5a1a1a, 0x1a2a4a, 0x16181a, 0x2a4a3a, 0x6a4a1a, 0x7a1a14, 0x23374a];
const OLD_GABLES = ['step', 'bell', 'neck', 'spout', 'bell', 'cornice', 'neck'];
const ballGeo = new THREE.SphereGeometry(1, 10, 7), ringGeo = new THREE.TorusGeometry(1, 0.1, 6, 20);
// what is in each shop window, and how its front is dressed. seg: the glass panes [{ x, wd }]; S: { w, SW, F, top, dx }
const SHOPLOOK = {
  bitterbal: { trim: 0x3a2412, door: 'r', awn: 'stripe', props(K, g, S, seg) { const x = seg[0].x; K.box(seg[0].wd, 0.07, 0.5, 0xd8d0c0, x, 1.05, S.F + 0.62); K.box(0.9, 0.6, 0.04, 0x1a1a1a, x, 2.0, S.F + 0.08); for (let i = 0; i < 5; i++) K.geo(ballGeo, 0xa8601e, x - 0.5 + i * 0.25, 1.16, S.F + 0.62, 0, 0, 0, 0.075, 0.075, 0.075); K.cyl(0.12, 0.1, 0.2, 0xf2c14e, x + 0.75, 1.19, S.F + 0.6, 10); } },
  habibi: { trim: 0x0c5a40, door: 'l', awn: 'solid', props(K, g, S, seg) { const x = seg[0].x; K.cyl(0.015, 0.015, 1.5, 0xd0d0d0, x, 1.5, S.F + 0.24, 6); K.cyl(0.14, 0.24, 0.95, 0xa8602a, x, 1.5, S.F + 0.24, 12); K.cyl(0.3, 0.3, 0.05, 0xb8b8b8, x, 0.98, S.F + 0.24, 14); K.box(0.5, 0.36, 0.03, 0xffd23a, x + 0.9, 2.0, S.F + 0.08); neonRect(g, x, 1.55, 0.9, 1.5, S.F + 0.1, 0xe8402a); } },
  kapsalon: { trim: 0xf4f2ea, door: 'r', props(K, g, S, seg) { const x = seg[0].x, px = -S.SW / 2 - 0.02; K.cyl(0.075, 0.075, 0.95, 0xf4f2ea, px, 1.7, S.F + 0.66, 12); for (let i = 0; i < 5; i++) K.cyl(0.08, 0.08, 0.09, i % 2 ? 0x1d2a8a : 0xc8102e, px, 1.34 + i * 0.18, S.F + 0.66, 12); K.geo(ballGeo, 0xd8b040, px, 2.24, S.F + 0.66, 0, 0, 0, 0.09, 0.09, 0.09); K.box(0.7, 0.9, 0.02, 0xbfd8e8, x, 1.7, S.F + 0.07); K.box(0.5, 0.5, 0.26, 0x8a1a1a, x, 0.85, S.F + 0.24); K.box(0.5, 0.6, 0.08, 0x8a1a1a, x, 1.3, S.F + 0.12); } },
  avond: { trim: 0x14204a, door: 'c', awn: 'stripe', props(K, g, S, seg) { const F_ = [0xf08a1c, 0xd8201a, 0x5f9a3c, 0xf2c14e]; for (const [i, sg] of seg.entries()) { K.box(0.75, 0.3, 0.5, 0x8a6a3a, sg.x, 0.2, S.F + 0.95, 0, 0.25); K.box(0.75, 0.3, 0.5, 0x7a5a30, sg.x, 0.42, S.F + 0.78, 0, 0.25); for (let q = 0; q < 8; q++) K.geo(ballGeo, F_[(q + i) % 4], sg.x - 0.27 + (q % 4) * 0.18, q < 4 ? 0.44 : 0.66, S.F + (q < 4 ? 1.0 : 0.82), 0, 0, 0, 0.085, 0.085, 0.085); } neonRect(g, seg[0].x, 1.9, 0.8, 0.4, S.F + 0.1, 0xe8202a); } },
  fiets: { trim: 0x1f6a44, door: 'l', props(K, g, S, seg) { const x = seg[0].x; for (const [dx, y] of [[-0.45, 1.75], [0.4, 1.55], [0.1, 0.95]]) { K.geo(ringGeo, 0x1c1c1c, x + dx, y, S.F + 0.22, 0, 0, 0, 0.32, 0.32, 0.32); K.cyl(0.03, 0.03, 0.05, 0x9aa0a4, x + dx, y, S.F + 0.22, 8, Math.PI / 2); } for (let i = 0; i < 3; i++) K.geo(ringGeo, 0x222222, S.SW / 2 - 0.5, 0.1 + i * 0.1, S.F + 0.95, Math.PI / 2, 0, 0, 0.3, 0.3, 0.3); K.cyl(0.03, 0.03, 0.7, 0xe8202a, S.SW / 2 - 1.0, 0.35, S.F + 0.9, 8); } },
  bakker: { trim: 0x8a4a12, riser: 0xf2e6c8, door: 'r', awn: 'stripe', props(K, g, S, seg) { const sg = seg[0]; for (const y of [0.98, 1.5]) { K.box(sg.wd - 0.2, 0.05, 0.32, 0xd8c8a0, sg.x, y, S.F + 0.22); const n = Math.max(3, Math.floor(sg.wd / 0.36)); for (let i = 0; i < n; i++) K.geo(ballGeo, [0xc8873a, 0xb8702a, 0xd89a4a][i % 3], sg.x - (n - 1) * 0.17 + i * 0.34, y + 0.11, S.F + 0.22, 0, 0, 0, y > 1 ? 0.1 : 0.15, 0.085, 0.1); } K.cyl(0.2, 0.2, 0.1, 0xe8c070, sg.x, 2.02, S.F + 0.22, 14); } },
  was: { trim: 0x2a8ad8, riser: 0xffffff, door: 'l', props(K, g, S, seg) { const sg = seg[0], n = Math.max(2, Math.floor(sg.wd / 0.7)); for (let i = 0; i < n; i++) { const x = sg.x - (n - 1) * 0.33 + i * 0.66; K.box(0.58, 0.8, 0.36, 0xf4f4f4, x, 0.92, S.F + 0.22); K.cyl(0.18, 0.18, 0.03, 0x2a3a50, x, 0.88, S.F + 0.41, 14, Math.PI / 2); K.box(0.4, 0.07, 0.02, 0x9ab0c0, x, 1.24, S.F + 0.41); } K.box(sg.wd - 0.3, 0.3, 0.03, 0x2a8ad8, sg.x, 2.0, S.F + 0.07); } },
  bloem: { trim: 0x2f8a3a, door: 'c', awn: 'solid', props(K, g, S, seg) { const T = [0xe8203a, 0xf2c14e, 0xff8fb8, 0xf08a1c, 0x9a5ad0, 0xffffff]; for (const [i, sg] of seg.entries()) for (let b = 0; b < 3; b++) { const x = sg.x - 0.45 + b * 0.45, z = S.F + 0.85 + (b % 2) * 0.22; K.cyl(0.15, 0.11, 0.32, 0x26282c, x, 0.16, z, 10); K.cyl(0.13, 0.13, 0.28, 0x2f8a3a, x, 0.42, z, 8); for (let q = 0; q < 5; q++) K.geo(ballGeo, T[(b + i * 3) % 6], x + Math.cos(q * 1.26) * 0.09, 0.6 + (q % 2) * 0.05, z + Math.sin(q * 1.26) * 0.09, 0, 0, 0, 0.055, 0.075, 0.055); } K.box(seg[0].wd - 0.2, 0.9, 0.03, 0x2a5a34, seg[0].x, 1.6, S.F + 0.07); } },
  kaas: { trim: 0x5a3208, riser: 0xf6c12a, door: 'r', props(K, g, S, seg) { const sg = seg[0], n = Math.max(2, Math.floor(sg.wd / 0.62)); K.box(sg.wd - 0.2, 0.06, 0.34, 0x8a5a2a, sg.x, 0.92, S.F + 0.22); for (let i = 0; i < n; i++) { const x = sg.x - (n - 1) * 0.3 + i * 0.6, k = 2 + (i % 3); for (let q = 0; q < k; q++) K.cyl(0.25, 0.25, 0.14, q === k - 1 && i % 2 ? 0xc8201a : [0xf2b81a, 0xe8a010, 0xf6c83a][q % 3], x, 1.03 + q * 0.15, S.F + 0.22, 16); } } },
  bel: { trim: 0x5a2ad8, door: 'r', props(K, g, S, seg) { const sg = seg[0]; for (const dx of [-0.45, 0.45]) { K.box(0.6, 1.0, 0.24, 0xffffff, sg.x + dx, 1.0, S.F + 0.2); for (let q = 0; q < 6; q++) K.box(0.09, 0.17, 0.03, [0x1a1a1a, 0xc8f04a, 0xe8202a, 0x2a8ad8, 0xf2c14e, 0x9a5ad0][q], sg.x + dx - 0.18 + (q % 3) * 0.18, 1.2 - Math.floor(q / 3) * 0.3, S.F + 0.34); } neonRect(g, sg.x, 2.0, 1.0, 0.36, S.F + 0.1, 0xc8f04a); } },
  reis: { trim: 0xff8a1c, door: 'l', awn: 'solid', props(K, g, S, seg) { const sg = seg[0]; K.cyl(0.05, 0.12, 0.5, 0x5a3a1a, sg.x - 0.4, 0.8, S.F + 0.24, 8); K.geo(ballGeo, 0x2a7ad8, sg.x - 0.4, 1.26, S.F + 0.24, 0, 0, 0, 0.24, 0.24, 0.24); K.geo(ringGeo, 0xd8b040, sg.x - 0.4, 1.26, S.F + 0.24, 0.4, 0, 0, 0.27, 0.27, 0.27); K.box(0.5, 0.7, 0.02, 0xffe14a, sg.x + 0.4, 1.6, S.F + 0.07); K.box(0.5, 0.3, 0.025, 0x5ac0ff, sg.x + 0.4, 1.4, S.F + 0.08); K.box(0.5, 0.7, 0.02, 0xff8fb8, sg.x + 1.0, 1.5, S.F + 0.07, 0, 0, 0.06); } },
  makelaar: { trim: 0x121212, riser: 0x121212, door: 'c', props(K, g, S, seg) { for (const sg of seg) { const n = Math.max(2, Math.floor(sg.wd / 0.4)); for (let r = 0; r < 3; r++) for (let i = 0; i < n; i++) { const x = sg.x - (n - 1) * 0.18 + i * 0.36, y = 0.95 + r * 0.5; K.box(0.28, 0.38, 0.02, 0xfdfbf4, x, y, S.F + 0.3); K.box(0.28, 0.16, 0.025, [0x8a5a4a, 0x5a7a9a, 0x7a8a5a, 0xb08a64][(r + i) % 4], x, y + 0.09, S.F + 0.31); } K.box(sg.wd - 0.1, 0.05, 0.05, 0xd8b040, sg.x, 2.38, S.F + 0.3); } } },
};
function shopfront(g, K, w, F, mi, shopSign, col) {
  const b = bizBySign(shopSign), look = (b && SHOPLOOK[b.id]) || {}, hex = (c) => parseInt(c.slice(1), 16);
  const bg = b ? hex(b.ad.bg) : 0x1e120a, fg = b ? hex(b.ad.fg) : 0xe8862c, trim = look.trim ?? 0x1c1c1e, SW = w * 0.9, top = 2.55;
  const dx = look.door === 'c' ? 0 : (look.door === 'l' ? -1 : 1) * (SW / 2 - 0.72), S = { w, SW, F, top, dx };
  K.box(SW - 0.3, 0.5, 0.5, look.riser ?? bg, 0, 0.25, F + 0.25); // the tiled riser under the glass
  box(SW - 0.3, top - 0.5, 0.04, shopLit, 0, 0.5 + (top - 0.5) / 2, F + 0.03, g, false); // a lit shop behind it
  for (const sx of [-1, 1]) K.box(0.16, top, 0.54, trim, sx * (SW / 2 - 0.08), top / 2, F + 0.27); // pilasters
  K.box(SW, 0.1, 0.56, trim, 0, top + 0.05, F + 0.28);
  // the door: glass in a painted frame, a kick plate and a brass push bar
  for (const sx of [-1, 1]) K.box(0.07, top, 0.08, trim, dx + sx * 0.5, top / 2, F + 0.47);
  box(0.92, 2.05, 0.04, shopGlass, dx, 1.12, F + 0.46, g, false); K.box(0.92, 0.28, 0.05, trim, dx, 0.16, F + 0.46); K.box(0.06, 0.5, 0.05, 0xd8b040, dx + (dx > 0 ? -0.34 : 0.34), 1.15, F + 0.5);
  K.box(0.92, 0.3, 0.05, trim, dx, 2.38, F + 0.46);
  // the panes either side of the door
  const seg = [];
  for (const [x0, x1] of [[-SW / 2 + 0.16, dx - 0.54], [dx + 0.54, SW / 2 - 0.16]]) if (x1 - x0 > 0.55) {
    const wd = x1 - x0, x = (x0 + x1) / 2; seg.push({ x, wd });
    box(wd, top - 0.5, 0.04, shopGlass, x, 0.5 + (top - 0.5) / 2, F + 0.46, g, false);
    K.box(wd, 0.06, 0.07, trim, x, 0.52, F + 0.47); if (wd > 2.2) K.box(0.05, top - 0.5, 0.07, trim, x, 0.5 + (top - 0.5) / 2, F + 0.47);
    K.box(wd, 0.05, 0.07, trim, x, 2.12, F + 0.47); // a transom bar: small lights above, like the old pui
  }
  seg.sort((a, c) => c.wd - a.wd);
  // fascia in the shop's own colours, a cornice over it
  K.box(SW + 0.1, 0.74, 0.5, bg, 0, top + 0.47, F + 0.27);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(SW - 0.1, 0.6), new THREE.MeshBasicMaterial({ map: signTex([{ t: shopSign, size: 46 }], b ? b.ad.bg : '#1e120a', b ? b.ad.fg : '#e8862c'), color: 0xd8d8d8 })); // unlit, so the shop's colours stay true in full sun
  sg.position.set(0, top + 0.5, F + 0.6); sg.rotation.x = -0.5; g.add(sg); // tilted up a little, the way painted fascia boards lean out, so it reads from the street camera
  K.box(SW + 0.3, 0.1, 0.64, look.trim === 0x121212 ? 0xd8b040 : 0xf0ece0, 0, top + 0.89, F + 0.3);
  if (look.awn) {
    const c1 = '#' + bg.toString(16).padStart(6, '0'), c2 = '#' + fg.toString(16).padStart(6, '0');
    const awnT = canvasTex(64, 64, (c) => { for (let i = 0; i < 8; i++) { c.fillStyle = look.awn === 'stripe' && i % 2 ? '#fbf6ea' : (look.awn === 'stripe' ? c2 === '#ffffff' ? c1 : c2 : c1); c.fillRect(i * 8, 0, 8, 64); } });
    const awn = box(SW, 0.06, 0.85, lam({ map: awnT }), 0, top - 0.16, F + 0.9, g); awn.rotation.x = 0.45; // short and steep, so the glass still shows from above
  }
  if (seg.length && look.props) look.props(K, g, S, seg);
}
function oldHouse(x, z, w, d, h, facing, mi, shopSign, opt = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = facing; scene.add(g);
  g.userData.fade = 1; fadeables.push(g);
  const K = kit(), F = d / 2, wall = OLD_WALLS[(mi * 7 + 3) % OLD_WALLS.length], kind = OLD_GABLES[(mi * 3) % OLD_GABLES.length];
  const dark = (mi * 7 + 3) % OLD_WALLS.length === 5, door = OLD_DOORS[(mi * 5 + 1) % OLD_DOORS.length], STONE = 0xe6dcc6;
  box(w, h, d, wall, 0, h / 2, 0, g);
  // the gable: its outline as a shape, the brick face, a sandstone band along the edge
  const gs = new THREE.Shape(), L = []; let apex, R;
  if (kind === 'step') { const n = w > 5.5 ? 4 : 3, sw = (w / 2 - 0.55) / n, sh = 0.62; apex = n * sh + 0.55; R = apex - 0.7; for (let i = 0; i < n; i++) L.push([-w / 2 + i * sw, i * sh], [-w / 2 + i * sw, (i + 1) * sh]); L.push([-0.55, n * sh], [-0.55, apex]); }
  else if (kind === 'spout') { apex = Math.min(w * 0.72, 4.0); R = apex - 0.6; L.push([-w / 2, 0], [-w / 2, 0.45], [-0.42, apex - 0.75], [-0.42, apex]); }
  else if (kind === 'cornice') { apex = 0.55; R = 1.9; L.push([-w / 2, 0], [-w / 2, apex]); }
  if (L.length) { gs.moveTo(L[0][0], L[0][1]); for (const p of L.slice(1)) gs.lineTo(p[0], p[1]); for (const p of L.slice().reverse()) gs.lineTo(-p[0], p[1]); }
  else if (kind === 'bell') { apex = 3.0; R = 2.3; gs.moveTo(-w / 2, 0); gs.quadraticCurveTo(-w / 2, 1.2, -w / 4, 1.5); gs.lineTo(-w / 4, apex - 0.4); gs.quadraticCurveTo(0, apex + 0.3, w / 4, apex - 0.4); gs.lineTo(w / 4, 1.5); gs.quadraticCurveTo(w / 2, 1.2, w / 2, 0); }
  else { const nw = Math.min(1.2, w * 0.25); apex = 3.7; R = 2.2; gs.moveTo(-w / 2, 0); gs.lineTo(-w / 2, 0.3); gs.quadraticCurveTo(-nw - 0.2, 0.5, -nw, 1.5); gs.lineTo(-nw, apex - 0.75); gs.lineTo(-nw - 0.18, apex - 0.75); gs.lineTo(0, apex); gs.lineTo(nw + 0.18, apex - 0.75); gs.lineTo(nw, apex - 0.75); gs.lineTo(nw, 1.5); gs.quadraticCurveTo(nw + 0.2, 0.5, w / 2, 0.3); gs.lineTo(w / 2, 0); }
  const gg = new THREE.ExtrudeGeometry(gs, { depth: 0.4, bevelEnabled: false }), uv = gg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / w + 0.5, uv.getY(i) / h); // bricks the size of the wall's
  const gm = new THREE.Mesh(gg, wall); gm.position.set(0, h, F - 0.4); gm.castShadow = true; g.add(gm);
  const rs = new THREE.Shape(); rs.moveTo(-w / 2 - 0.25, -0.1); rs.lineTo(0, R); rs.lineTo(w / 2 + 0.25, -0.1);
  const rm = new THREE.Mesh(new THREE.ExtrudeGeometry(rs, { depth: d - 0.6, bevelEnabled: false }), mi % 3 === 0 ? roofDark : roofMat);
  rm.position.set(0, h, -F); rm.castShadow = true; g.add(rm);
  roofDetail(K, w, d, h, R, F, mi, !opt.simple);
  if (opt.simple) { fadeables.pop(); { const km = K.build(); if (km) g.add(km); } mergeStatic(g); return g; } // back-row filler: silhouette only
  if (!opt.simple) { const P = gs.getPoints(5); for (let i = 0; i < P.length - 1; i++) if (P[i].y > 0.01 || P[i + 1].y > 0.01) edge(g, P[i].x, h + P[i].y, P[i + 1].x, h + P[i + 1].y, F + 0.02, stoneMat, 0.13); }
  box(w + 0.06, 0.14, 0.12, stoneMat, 0, h, F + 0.03, g, false); // a stone band where the gable starts
  // hoist beam with its hook, and under it a loft hatch (warehouse gables) or a round window
  if (kind === 'cornice') { // lijstgevel: a deep white cornice and a dormer that carries the beam
    K.box(w + 0.34, 0.3, 0.55, 0xf0ece0, 0, h + apex + 0.05, F - 0.05); for (let i = 0; i < Math.floor(w / 0.9); i++) K.box(0.14, 0.22, 0.3, 0xf0ece0, -w / 2 + 0.5 + i * 0.9, h + apex - 0.2, F + 0.12);
    K.box(1.3, 1.25, 0.7, 0xf0ece0, 0, h + apex + 0.8, F - 0.75); box(0.8, 0.75, 0.05, oldGlass, 0, h + apex + 0.78, F - 0.38, g, false); K.box(0.05, 0.75, 0.07, 0xf0ece0, 0, h + apex + 0.78, F - 0.37);
    K.box(0.95, 0.09, 0.85, 0x55555e, -0.36, h + apex + 1.6, F - 0.72, 0, 0, 0.6); K.box(0.95, 0.09, 0.85, 0x55555e, 0.36, h + apex + 1.6, F - 0.72, 0, 0, -0.6);
    K.box(0.11, 0.11, 0.9, 0x2a2420, 0, h + apex + 1.52, F - 0.1); K.box(0.03, 0.2, 0.03, 0x1a1a1a, 0, h + apex + 1.38, F + 0.3);
  } else {
    const by = h + apex - (kind === 'neck' ? 1.0 : kind === 'bell' ? 0.62 : 0.5);
    K.box(0.12, 0.12, 0.95, 0x2a2420, 0, by, F + 0.42); K.box(0.03, 0.22, 0.03, 0x1a1a1a, 0, by - 0.16, F + 0.84); K.geo(ringGeo, 0x1a1a1a, 0, by - 0.32, F + 0.84, 0, 0, 0, 0.06, 0.06, 0.06);
    const ly = h + (kind === 'neck' ? 1.75 : kind === 'bell' ? 1.45 : apex * 0.42);
    if (kind === 'neck' || kind === 'bell') { const c = new THREE.Mesh(new THREE.CircleGeometry(0.36, 20), mi % 2 ? oldGlassLit : oldGlass); c.position.set(0, ly, F + 0.03); g.add(c); K.geo(ringGeo, STONE, 0, ly, F + 0.04, 0, 0, 0, 0.4, 0.4, 0.4); K.box(0.05, 0.72, 0.03, STONE, 0, ly, F + 0.05); K.box(0.72, 0.05, 0.03, STONE, 0, ly, F + 0.05); }
    else { K.box(0.78, 1.06, 0.05, STONE, 0, ly, F + 0.03); K.box(0.62, 0.92, 0.05, door, 0, ly, F + 0.05); for (const sx of [-1, 1]) K.box(0.3, 0.92, 0.04, mi % 2 ? 0x8a1a14 : 0x1f3a2c, sx * 0.56, ly, F + 0.05); K.box(0.2, 0.2, 0.05, STONE, 0, ly + 0.72, F + 0.04, 0, 0, 0.785); }
    if (kind === 'neck') for (const sx of [-1, 1]) { K.geo(ballGeo, STONE, sx * (Math.min(1.2, w * 0.25) + 0.42), h + 0.72, F - 0.1, 0, 0, 0, 0.3, 0.42, 0.12); K.box(0.2, 0.34, 0.2, STONE, sx * (w / 2 - 0.16), h + 0.5, F - 0.1); } // the claw pieces and corner vases
    if (kind === 'step') K.box(0.22, 0.4, 0.22, STONE, 0, h + apex + 0.2, F - 0.2);
  }
  if (mi % 4 === 1) { K.box(0.56, 0.42, 0.05, STONE, w / 2 - 0.75, h - 0.5, F + 0.03); K.box(0.44, 0.3, 0.05, [0x2a5a8a, 0xc8201a, 0x1f6a44][mi % 3], w / 2 - 0.75, h - 0.5, F + 0.045); } // a gevelsteen
  // tall small-paned windows, smaller towards the top; stone lintel with a keystone, a sill, sometimes shutters or geraniums
  const pane = (wx, y, ww, hg, lit) => {
    box(ww + 0.18, hg + 0.18, 0.06, frameMat, wx, y, F + 0.02, g, false); box(ww, hg, 0.07, lit ? oldGlassLit : oldGlass, wx, y, F + 0.04, g, false);
    box(0.045, hg, 0.09, frameMat, wx, y, F + 0.05, g, false); for (const k of [-0.17, 0.17]) box(ww, 0.045, 0.09, frameMat, wx, y + hg * k, F + 0.05, g, false);
    K.box(ww + 0.3, 0.16, 0.1, dark ? 0xf4f0e6 : STONE, wx, y + hg / 2 + 0.17, F + 0.06); K.box(0.16, 0.25, 0.12, dark ? 0xf4f0e6 : STONE, wx, y + hg / 2 + 0.19, F + 0.07); K.box(ww + 0.3, 0.08, 0.2, STONE, wx, y - hg / 2 - 0.13, F + 0.1);
  };
  const floors = Math.floor((h - 1) / 2.8), nW = w >= 6.2 ? 3 : 2, ww = Math.min(1.1, (w / nW) * 0.5);
  for (let f = 0; f < floors; f++) {
    const y = 3.5 + f * 2.8 + (shopSign && f === 0 ? 0.6 : 0), hg = [1.95, 1.8, 1.5, 1.25][Math.min(f, 3)] - (shopSign && f === 0 ? 0.7 : 0);
    for (let k = 0; k < nW; k++) {
      const wx = nW === 3 ? (k - 1) * w * 0.3 : (k - 0.5) * w * 0.46;
      pane(wx, y, ww, hg, (mi * 5 + f * 3 + k * 7) % 4 === 0);
      if (mi % 5 === 2 && f === 0 && nW === 2) for (const sx of [-1, 1]) K.box(ww * 0.46, hg, 0.05, door, wx + sx * (ww * 0.73 + 0.1), y, F + 0.05);
      if (f === 0 && (mi + k) % 3 === 0 && !shopSign) { K.box(ww + 0.1, 0.22, 0.24, 0x6a4a2a, wx, y - hg / 2 - 0.02, F + 0.22); for (let q = 0; q < 5; q++) K.geo(blobGeo(1 + (q % 4), 0), [0xc8402e, 0xf2c14e, 0xe8862c, 0x5f8a3c, 0xc8402e][(q + mi) % 5], wx - 0.4 + q * 0.2, y - hg / 2 + 0.17, F + 0.24, q, q * 2, 0, 0.15, 0.13, 0.15); } // geraniums
    }
  }
  if (shopSign) shopfront(g, K, w, F, mi, shopSign);
  else if (!opt.noDoor) { // a painted door with a fanlight up two bluestone steps, and the tall windows of the voorkamer
    const dx = w * 0.28;
    box(1.12, 2.95, 0.08, frameMat, dx, 1.48, F + 0.02, g, false); K.box(0.92, 2.12, 0.1, door, dx, 1.08, F + 0.04);
    for (const [py, ph] of [[1.6, 0.8], [0.62, 0.8]]) K.box(0.62, ph, 0.03, ((door >> 1) & 0x7f7f7f), dx, py, F + 0.1);
    box(0.92, 0.6, 0.07, oldGlassLit, dx, 2.52, F + 0.04, g, false); box(0.04, 0.6, 0.09, frameMat, dx, 2.52, F + 0.05, g, false);
    K.geo(ballGeo, 0xd8b040, dx - 0.32, 1.12, F + 0.12, 0, 0, 0, 0.045, 0.045, 0.045);
    K.box(0.14, 0.26, 0.14, 0x16181a, dx + 0.78, 2.3, F + 0.14); K.box(0.1, 0.16, 0.1, 0xffd9a0, dx + 0.78, 2.3, F + 0.16); // the lantern by the door
    if (w > 6.4) { pane(-w * 0.34, 1.75, ww, 2.0, mi % 3 === 0); pane(-w * 0.08, 1.75, ww, 2.0, mi % 3 === 1); } else pane(-w * 0.2, 1.75, Math.min(1.25, ww + 0.15), 2.0, mi % 3 === 0);
    if (mi % 6 === 1) graffiti(g, -w * 0.2, 0.42, F + 0.03, mi, 1.5);
  }
  // bluestone plinth, the steps, wall anchors, a zinc downpipe
  K.box(w - 0.04, 0.42, 0.06, 0x5c6064, 0, 0.21, F + 0.045);
  if (!shopSign && !opt.noDoor) { K.box(1.4, 0.16, 0.62, 0x6a6e72, w * 0.28, 0.08, F + 0.33); K.box(1.2, 0.16, 0.34, 0x74787c, w * 0.28, 0.24, F + 0.19); }
  for (let f = 1; f <= floors; f++) for (const sx of [-1, 1]) { const ax = sx * (w / 2 - 0.3), ay = 2.2 + f * 2.8 - 0.1; K.box(0.06, 0.5, 0.04, 0x1e1e20, ax, ay, F + 0.04); K.box(0.2, 0.05, 0.04, 0x1e1e20, ax, ay + 0.2, F + 0.04); }
  if (mi % 2 === 0) { const px = (mi % 4 ? 1 : -1) * (w / 2 - 0.12); K.cyl(0.055, 0.055, h - 0.2, 0x9aa0a4, px, (h - 0.2) / 2, F + 0.1, 8); K.cyl(0.07, 0.07, 0.12, 0x8a9094, px, 0.06, F + 0.1, 8); }
  { const km = K.build(); if (km) g.add(km); }
  mergeStatic(g);
  g.traverse((c) => { if (c.isMesh) { c.material = c.material.clone(); c.material.transparent = true; } });
  return g;
}
function house(x, z, w, d, h, facing, mi, shopSign, opt = {}) {
  if (!opt.simple && !opt.y && (z === -11 || z === SROW)) { streetHouses.push({ x, z, w, d }); if (shopSign) { const b = bizBySign(shopSign); if (b) placeBiz(b.id, x, w); } }
  if (opt.color == null && !opt.y) return oldHouse(x, z, w, d, h, facing, mi, shopSign, opt); // the Zaanse wooden look stays for Hotel Kaasland and the clock house
  const g = new THREE.Group(); g.position.set(x, opt.y || 0, z); g.rotation.y = facing; scene.add(g);
  g.userData.fade = 1; fadeables.push(g);
  const K = kit(); // small detail (chimney, gutters, plinth, flower boxes...) baked into one mesh at the end
  const col = opt.color ?? VICE[mi % VICE.length], wall = opt.brick ? brickMats[mi % brickMats.length] : clapMat(col);
  const kind = opt.gable ?? ['point', 'bell', 'point', 'step', 'point', 'bell'][mi % 6];
  const F = d / 2;
  box(w, h, d, wall, 0, h / 2, 0, g);
  // white corner boards and cornice
  for (const sx of [-1, 1]) box(0.18, h, 0.18, frameMat, sx * (w / 2 - 0.02), h / 2, F - 0.02, g, false);
  box(w + 0.12, 0.22, 0.3, frameMat, 0, h, F - 0.05, g, false);
  // gable on the street side + roof behind it
  let apex = 2.4;
  const gs = new THREE.Shape();
  if (kind === 'point') {
    apex = Math.min(w * 0.85, 5);
    gs.moveTo(-w / 2, 0); gs.lineTo(0, apex); gs.lineTo(w / 2, 0);
  } else if (kind === 'bell') {
    apex = 3.0;
    gs.moveTo(-w / 2, 0); gs.quadraticCurveTo(-w / 2, 1.2, -w / 4, 1.5); gs.lineTo(-w / 4, apex - 0.4); gs.quadraticCurveTo(0, apex + 0.3, w / 4, apex - 0.4); gs.lineTo(w / 4, 1.5); gs.quadraticCurveTo(w / 2, 1.2, w / 2, 0);
  } else {
    gs.moveTo(-w / 2, 0); gs.lineTo(-w / 2, 1.2); gs.lineTo(-w / 4, 1.2); gs.lineTo(-w / 4, 2.4); gs.lineTo(w / 4, 2.4); gs.lineTo(w / 4, 1.2); gs.lineTo(w / 2, 1.2); gs.lineTo(w / 2, 0);
  }
  const gm = new THREE.Mesh(new THREE.ExtrudeGeometry(gs, { depth: 0.4, bevelEnabled: false }), wall);
  gm.position.set(0, h, F - 0.4); gm.castShadow = true; g.add(gm);
  const rs = new THREE.Shape(); rs.moveTo(-w / 2 - 0.25, -0.1); rs.lineTo(0, kind === 'point' ? apex : 2.3); rs.lineTo(w / 2 + 0.25, -0.1);
  const rm = new THREE.Mesh(new THREE.ExtrudeGeometry(rs, { depth: d - 0.6, bevelEnabled: false }), roofMat);
  rm.position.set(0, h, -F); rm.castShadow = true; g.add(rm);
  roofDetail(K, w, d, h, kind === 'point' ? apex : 2.3, F, mi, !opt.simple);
  if (opt.simple) { fadeables.pop(); { const km = K.build(); if (km) g.add(km); } mergeStatic(g); return g; } // back-row filler: silhouette only
  // white bargeboards along the gable, neon tube on some houses
  const neon = opt.neon ?? (mi % 2 === 0 ? NEON[(mi >> 1) % NEON.length] : null);
  if (kind === 'point') {
    edge(g, -w / 2 - 0.1, h - 0.05, 0, h + apex + 0.08, F + 0.02, frameMat, 0.24); edge(g, 0, h + apex + 0.08, w / 2 + 0.1, h - 0.05, F + 0.02, frameMat, 0.24);
    box(0.9, 1.1, 0.06, frameMat, 0, h + apex * 0.38, F + 0.02, g, false); box(0.7, 0.9, 0.07, winMat, 0, h + apex * 0.38, F + 0.04, g, false);
    if (neon) { neonTube(g, -w / 2 + 0.25, h + 0.1, 0, h + apex - 0.3, F + 0.1, neon); neonTube(g, 0, h + apex - 0.3, w / 2 - 0.25, h + 0.1, F + 0.1, neon); }
  } else if (neon) neonTube(g, -w * 0.45, h + 0.25, w * 0.45, h + 0.25, F + 0.12, neon);
  // more Neon Vice: a neon band above the shop floor, blade signs, glowing window outlines
  const n2 = NEON[(mi + 1) % NEON.length];
  if (!opt.noDoor && mi % 3 !== 2) neonTube(g, -w / 2 + 0.2, 2.75, w / 2 - 0.2, 2.75, F + 0.12, n2);
  if (!opt.noDoor && mi % 3 === 1 && !shopSign) bladeSign(g, (mi % 2 ? 1 : -1) * (w / 2 - 0.35), 4.9, F, BLADES[mi % BLADES.length], NEON[(mi + 2) % NEON.length]);
  if (mi % 4 === 0 && h > 6) neonRect(g, (mi % 8 ? 1 : -1) * w * 0.24, 3.4, 1.35, 1.85, F + 0.1, NEON[(mi + 3) % NEON.length]);
  // windows: white frames, glassy panes, a mullion and a sill
  const floors = Math.floor((h - 1) / 2.8);
  for (let f = 0; f < floors; f++) {
    const y = 3.4 + f * 2.8;
    for (let k = 0; k < (w < 4.8 ? 1 : 2); k++) {
      const wx = w < 4.8 ? -w * 0.12 : (k - 0.5) * w * 0.48;
      box(1.2, 1.7, 0.06, frameMat, wx, y, F + 0.02, g, false);
      box(0.95, 1.45, 0.07, winMat, wx, y, F + 0.04, g, false);
      box(0.06, 1.45, 0.09, frameMat, wx, y, F + 0.05, g, false); box(0.95, 0.06, 0.09, frameMat, wx, y + 0.25, F + 0.05, g, false);
      box(1.3, 0.08, 0.22, frameMat, wx, y - 0.88, F + 0.1, g, false);
      if (f === 0 && (mi + k) % 3 === 0) { K.box(1.1, 0.24, 0.26, 0x6a4a2a, wx, y - 0.74, F + 0.22); for (let q = 0; q < 5; q++) K.geo(blobGeo(1 + (q % 4), 0), [0xc8402e, 0xf2c14e, 0xe8862c, 0x5f8a3c, 0xc8402e][(q + mi) % 5], wx - 0.42 + q * 0.21, y - 0.55, F + 0.24, q, q * 2, 0, 0.15, 0.13, 0.15); } // geraniums
    }
  }
  if (opt.clock) { // Zaandam-style clock gable
    const ck = new THREE.Mesh(new THREE.CircleGeometry(0.85, 28), lam({ map: canvasTex(128, 128, (c) => { c.fillStyle = '#fbf6e8'; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.strokeStyle = '#1a1a1a'; c.lineWidth = 6; c.stroke(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.fillStyle = '#1a1a1a'; c.fillRect(64 + Math.cos(a) * 48 - 3, 64 + Math.sin(a) * 48 - 3, 6, 6); } c.lineWidth = 7; c.beginPath(); c.moveTo(64, 64); c.lineTo(64, 26); c.moveTo(64, 64); c.lineTo(90, 70); c.stroke(); }) }));
    ck.position.set(0, h + apex * 0.42, F + 0.08); g.add(ck);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.07, 6, 28), lam({ color: 0xd8b040 })); ring.position.copy(ck.position); g.add(ring);
  }
  if (shopSign) {
    box(w * 0.86, 2.2, 0.08, lam({ color: 0x1b2430 }), 0, 1.3, F + 0.03, g, false);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.86, 0.7), lam({ map: signTex([{ t: shopSign, size: 44 }], '#1e120a', '#' + (neon || 0xe8862c).toString(16).padStart(6, '0')), emissive: 0x401838 }));
    s.position.set(0, 2.75, F + 0.09); g.add(s);
    const awnT = canvasTex(64, 64, (c) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#' + col.toString(16).padStart(6, '0'); c.fillRect(i * 8, 0, 8, 64); } });
    const awn = box(w * 0.9, 0.12, 1.2, lam({ map: awnT }), 0, 2.45, F + 0.6, g);
    awn.rotation.x = 0.25;
  } else if (!opt.noDoor) {
    box(1.1, 2.3, 0.08, frameMat, w * 0.28, 1.15, F + 0.02, g, false);
    box(0.9, 2.15, 0.1, lam({ color: [0x1f5a48, 0xffffff, 0x2a3a6a, 0x8a1a3a][mi % 4] }), w * 0.28, 1.08, F + 0.03, g, false);
    box(1.2, 1.5, 0.06, frameMat, -w * 0.2, 1.5, F + 0.02, g, false);
    box(1.0, 1.3, 0.07, winMat, -w * 0.2, 1.5, F + 0.04, g, false);
    // street wear: posters between window and door, tags under the window
    if (mi % 3 !== 1) poster(g, w * 0.04 + 0.1, 1.55, F + 0.03, mi * 3 + 1, ((mi % 5) - 2) * 0.04);
    if (mi % 5 === 1 || mi % 5 === 3) poster(g, w * 0.04 + 0.5, 1.75, F + 0.035, mi * 3 + 2, 0.06);
    if (mi % 2 === 1) graffiti(g, -w * 0.2, 0.42, F + 0.03, mi, 1.5);
  }
  // facade detail: bluestone plinth, a front step, wall anchors, a zinc downpipe
  if (!opt.y) {
    K.box(w - 0.04, 0.42, 0.06, 0x5c6064, 0, 0.21, F + 0.045);
    if (!shopSign && !opt.noDoor) K.box(1.3, 0.16, 0.5, 0x6a6e72, w * 0.28, 0.08, F + 0.27);
  }
  for (let f = 1; f <= Math.floor((h - 1) / 2.8); f++) for (const sx of [-1, 1]) { const ax = sx * (w / 2 - 0.45), ay = 2.2 + f * 2.8 - 1.4; K.box(0.06, 0.42, 0.04, 0x1e1e20, ax, ay, F + 0.04, 0, 0, sx * 0.5); K.box(0.06, 0.42, 0.04, 0x1e1e20, ax, ay, F + 0.04, 0, 0, -sx * 0.5); }
  if (mi % 2 === 0) { const px = (mi % 4 ? 1 : -1) * (w / 2 - 0.14); K.cyl(0.055, 0.055, h - 0.2, 0x9aa0a4, px, (h - 0.2) / 2, F + 0.1, 8); K.cyl(0.07, 0.07, 0.12, 0x8a9094, px, 0.06, F + 0.1, 8); }
  { const km = K.build(); if (km) g.add(km); }
  mergeStatic(g); // the plain boxes become one mesh per look (cheaper to draw, cheaper to ray-test for the cutaway)
  g.traverse((c) => { if (c.isMesh) { c.material = c.material.clone(); c.material.transparent = true; } });
  return g;
}
// roof detail: a ridge cap, zinc gutters on both eaves, a brick chimney with a pot, and a dormer on some roofs
function roofDetail(K, w, d, h, R, F, mi, full) {
  const L = d - 0.6, zc = -F + L / 2, half = w / 2 + 0.25, slopeY = (x) => -0.1 + (R + 0.1) * (1 - Math.abs(x) / half);
  K.box(0.24, 0.14, L + 0.04, 0x9a4626, 0, h + R + 0.02, zc);
  for (const sx of [-1, 1]) { K.cyl(0.075, 0.075, L, 0x9aa0a4, sx * (w / 2 + 0.24), h - 0.16, zc, 8, Math.PI / 2); }
  const cx = (mi % 2 ? 1 : -1) * w * 0.22, cz = -F + 1.0 + (mi % 3) * 0.9, cy = h + slopeY(cx);
  K.box(0.56, 1.25, 0.72, [0x8a4a3a, 0x7a3e30, 0x9a5a44][mi % 3], cx, cy + 0.3, cz);
  K.box(0.7, 0.08, 0.86, 0x7a7c7e, cx, cy + 0.96, cz);
  K.cyl(0.09, 0.11, 0.3, 0xb8602a, cx + 0.1, cy + 1.14, cz, 8); if (mi % 2) K.cyl(0.09, 0.11, 0.26, 0xb8602a, cx - 0.12, cy + 1.12, cz + 0.12, 8);
  if (full && mi % 3 === 0 && w > 5 && R > 2) { // a dormer on the other slope, facing sideways
    const sx = cx > 0 ? -1 : 1, dx = sx * w * 0.24, dy = h + slopeY(dx), dz = -F + L * 0.55;
    K.box(0.9, 1.0, 1.15, 0xf6f4ee, dx, dy + 0.3, dz);
    K.box(0.04, 0.6, 0.7, 0x2a3a50, dx + sx * 0.46, dy + 0.32, dz); K.box(0.05, 0.7, 0.08, 0xf6f4ee, dx + sx * 0.47, dy + 0.32, dz);
    K.box(1.1, 0.1, 1.4, 0x9a4626, dx, dy + 0.85, dz, 0, 0, sx * 0.22);
  }
}
// Inntel-style stack of houses: a landmark at the west end of the street
function stackTower(x0, x1, z) {
  const W = x1 - x0, cx = (x0 + x1) / 2;
  house(cx, z, W, 9, 6.5, 0, 0, null, { gable: 'step', color: 0x1f7a5e, neon: 0xe8862c });
  house(cx - W * 0.24, z + 0.4, W * 0.5, 7, 4.2, 0, 1, null, { y: 6.5, gable: 'point', color: 0x4f9ee0, noDoor: true, neon: 0xf2c14e });
  house(cx + W * 0.26, z - 0.5, W * 0.48, 7, 5.6, 0, 3, null, { y: 6.5, gable: 'bell', color: 0x2fb8b0, noDoor: true });
  house(cx + 0.3, z + 0.2, W * 0.62, 6, 3.6, 0, 6, null, { y: 12.4, gable: 'point', color: 0x7ad8b0, noDoor: true, neon: 0xffe14a });
  const hs = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.8), lam({ map: signTex([{ t: 'HOTEL KAASLAND', size: 40 }], '#1e120a', '#a9c46a'), emissive: 0x204050 }));
  hs.position.set(cx, 5.6, z + 4.55); scene.add(hs);
  solid(x0, x1, z - 4.5, z + 4.5);
}
// north side: houses west and east of the warehouse (fronts face south, +z)
// split a span into house widths of 4.5-7.5 m that fill it exactly (no sliver houses)
function spanWidths(len, k0) {
  const ws = []; let left = len, k = k0;
  while (left > 0.01) { let w = 5 + (k % 3); if (left - w < 4.5) w = left <= 7.5 ? left : left / 2; ws.push(w); left -= w; k++; }
  return ws;
}
// fill the far west, past the play area (so no empty plots), then the Hotel Kaasland stack
// the far west: houses, then Club Monique (js/venues.js builds it in the gap CLUB.x0..x1), then houses up to the hotel stack
const CLUB = { x0: -66, x1: -50 }, DEALER = { x0: 52, x1: 80 };
{ let x = -SX, k = 20; for (const [a, b] of [[-SX, CLUB.x0], [CLUB.x1, -34]]) { x = a; spanWidths(b - a, k).forEach((w) => { house(x + w / 2, -11, w, 9, 9 + (k % 4), 0, k); solid(x, x + w, -15.5, -6.5); x += w; k++; }); } }
stackTower(-34, -26.5, -11);
const WH_X0_GAP = -11.2;
// Shoarma Schmatzel: loyal to Freddy Sr., right next to the Hotel Kaasland stack
const JS = { x0: -26.5, x1: -16.5, z0: -15.5, z1: -6.5, h: 4.8, doorX0: -21.6, doorX1: -20.2 };
let nx = JS.x1, hi = 3;
for (const w of spanWidths(WH_X0_GAP - nx, hi)) { house(nx + w / 2, -11, w, 9, 9 + (hi % 3) * 1.3, 0, hi, bizSign('nw', hi)); solid(nx, nx + w, -15.5, -6.5); nx += w; hi++; }
// east of the warehouse: Eddy's private parking (x 1..9.5), then the houses, with The Russian's pawnshop in between
const LOT = { x0: 1.15, x1: 9.5 };
const BAYS = { lines: [1.45, 5.35, 9.25], oof: 3.4, kangoo: 7.3 }; // bay lines and the two cars' centres
const HOME_DOORS = [{ x: 0.86, z: -16.6, stand: { x: 0.25, z: -16.6 }, face: -Math.PI / 2 }]; // Het Hok: a door in the warehouse's east wall; [1] the house next to Eddy's parking, [2] the one past the pawnshop (set below)
const PS = { x0: 20, x1: 28, z0: -15.5, z1: -6.5, h: 4.8, doorX0: 23.2, doorX1: 24.6 };
nx = LOT.x1;
for (const [a, b] of [[LOT.x1, PS.x0], [PS.x1, DEALER.x0], [DEALER.x1, SX]]) for (const w of spanWidths(b - a, hi)) { // the dealership plot (js/venues.js) breaks the row
  if (nx < a) nx = a;
  house(nx + w / 2, -11, w, 9, 9 + (hi % 4) * 1.1, 0, hi, hi === 7 ? 'BITTERBAL & ZO' : bizSign('ne', hi), hi === 9 ? { gable: 'point', color: 0x23a07a, clock: true, neon: null } : {}); solid(nx, nx + w, -15.5, -6.5);
  if (hi === 4 || hi === 6) HOME_DOORS[hi === 4 ? 1 : 2] = { x: nx + w / 2 + w * 0.28, z: -6.5, facade: true, stand: { x: nx + w / 2 + w * 0.28, z: -5.8 }, face: 0 }; // Eddy's woning (js/woning.js): the street door
  nx += w; hi++;
}
// back row behind the street (only the roofs show) so nothing looks empty from the camera
// the ophaalbrug at the east end: a white double drawbridge, the Amsterdam kind. Brick abutments, a plank deck, two portals
// with their balance beams and counterweights, chains down to the leaves.
{
  const B_ = BRIDGES[1], bx = (B_.x0 + B_.x1) / 2, W_ = B_.x1 - B_.x0, g = new THREE.Group(); g.position.set(bx, 0, CZ); scene.add(g);
  const white = lam({ color: 0xf4f2ea }), iron = lam({ color: 0x2a2c30 }), brick = lam({ map: tex('brick_red.jpg', 2, 0.5), color: 0x9a7a6a });
  const planks = lam({ map: canvasTex(64, 64, (c) => { c.fillStyle = '#7a5c3e'; c.fillRect(0, 0, 64, 64); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#6e5236' : '#84654a'; c.fillRect(0, i * 8, 64, 7); } }) });
  planks.map.wrapS = planks.map.wrapT = THREE.RepeatWrapping; planks.map.repeat.set(1, 6);
  for (const s_ of [-1, 1]) {
    box(W_ + 0.6, 1.0, 1.5, brick, 0, -0.5, s_ * 3.05, g); // abutment
    box(W_, 0.12, 3.72, planks, 0, 0.0, s_ * 1.88, g); // one leaf
    box(W_ + 0.1, 0.1, 0.12, iron, 0, 0.02, s_ * 0.02, g, false); // the seam where the leaves meet
    const pz = s_ * 2.75; // the portal
    for (const x of [-W_ / 2 - 0.12, W_ / 2 + 0.12]) {
      box(0.2, 4.7, 0.2, white, x, 2.35, pz, g);
      const br = box(0.1, 1.5, 0.1, white, x, 3.95, pz - s_ * 0.5, g, false); br.rotation.x = s_ * 0.72; // brace up to the beam
      // balance beam: pivots on the portal, the long arm reaches over the water, the short arm carries the counterweight
      const beam = new THREE.Group(); beam.position.set(x, 4.78, pz); beam.rotation.x = s_ * 0.13; g.add(beam);
      box(0.15, 0.2, 5.0, white, 0, 0, -s_ * 0.3, beam);
      const ch = box(0.035, 4.5, 0.035, iron, x * 0.96, 2.4, pz - s_ * 2.55, g, false); ch.rotation.x = s_ * 0.03; // the chain
      for (let z = 0.15; z < 3.7; z += 0.92) box(0.07, 0.95, 0.07, white, x * 0.985, 0.52, s_ * z, g, false); // railing posts
      box(0.07, 0.07, 3.7, white, x * 0.985, 1.0, s_ * 1.88, g, false); box(0.05, 0.05, 3.7, white, x * 0.985, 0.55, s_ * 1.88, g, false);
    }
    box(W_ + 0.64, 0.22, 0.26, white, 0, 4.72, pz, g); // portal head
    const cw = new THREE.Group(); cw.position.set(0, 4.78, pz); cw.rotation.x = s_ * 0.13; g.add(cw); box(W_ + 0.5, 0.5, 0.8, white, 0, -0.05, s_ * 1.95, cw); // counterweight box
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
}
for (let x = -SX, i = 0; x < SX; i++) { const w = 5 + (i % 3); if ((x + w < -34 || x > 12) && (x + w < DEALER.x0 - 2 || x > DEALER.x1 + 2) && (x + w < CLUB.x0 || x > CLUB.x1)) house(x + w / 2, -25.5, w, 9, 10 + (i % 4) * 1.2, 0, i + 7, null, { simple: true }); x += w; } // behind the shed: the bouwkavel (js/loods.js)
// (the row behind the plot is the Komijnstraat now: js/roam.js builds it)
// the houses across the canal, behind their quay
for (let x = -60, i = 0; x < 60; i++) { const w = 5 + (i % 3); house(x + w / 2, SROW, w, 8, 9 + (i % 4), Math.PI, i + 2, i === 13 ? 'SHOARMA HABIBI' : bizSign('s', i)); x += w; }
for (const [a, b, k0] of [[-SX, -60, 40], [60, SX, 50]]) { let x = a; spanWidths(b - a, k0).forEach((w, i) => { house(x + w / 2, SROW, w, 8, 9 + ((k0 + i) % 4), Math.PI, k0 + i, null); x += w; }); } // and on along the longer street

await bootStep(30, 'Sweeping out the warehouse…');
// ------------------------------------------------------------------ the warehouse
const WH = { x0: -11, x1: 1, z0: -21, z1: -7, h: 5.2, doorX0: -7, doorX1: -2.5 }; // z0 was -19: two metres deeper from the start (Tristan 2026-11-26), up to the plot
const wh = new THREE.Group(); scene.add(wh);
// painted corrugated sheet (generated so the colour stays bright): mint walls like the outlet sheds
const corrTex = canvasTex(128, 32, (g, w, h) => { for (let x = 0; x < w; x++) { const v = 200 + Math.round(55 * Math.cos(x / w * Math.PI * 16)); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, 0, 1, h); } });
corrTex.wrapS = corrTex.wrapT = THREE.RepeatWrapping; corrTex.repeat.set(6, 1);
const corr = new THREE.MeshStandardMaterial({ map: corrTex, bumpMap: corrTex, bumpScale: 2, color: 0x8ae6da, roughness: 0.6 });
const corrS = new THREE.MeshStandardMaterial({ map: corrTex, bumpMap: corrTex, bumpScale: 2, color: 0x8ae6da, roughness: 0.6, transparent: true });
const whFloor = new THREE.Mesh(new THREE.PlaneGeometry(WH.x1 - WH.x0, WH.z1 - WH.z0), pbr('concrete_floor.jpg', 3, 3, 0xc8c6c0, 0.8, 0.5));
whFloor.rotation.x = -Math.PI / 2; whFloor.position.set((WH.x0 + WH.x1) / 2, 0.03, (WH.z0 + WH.z1) / 2); whFloor.receiveShadow = true; wh.add(whFloor);
// back + side walls
// back wall: a doorway at x -4.6 into the corridor to De Hal (plugged until the hall is built)
box(-5.7 - WH.x0, WH.h, 0.3, corr, (WH.x0 - 5.7) / 2, WH.h / 2, WH.z0, wh); box(WH.x1 + 3.5, WH.h, 0.3, corr, (WH.x1 - 3.5) / 2, WH.h / 2, WH.z0, wh); box(2.2, WH.h - 2.6, 0.3, corr, -4.6, 2.6 + (WH.h - 2.6) / 2, WH.z0, wh);
const backPlug = box(2.2, 2.6, 0.3, corr, -4.6, 1.3, WH.z0, wh);
box(0.3, WH.h, WH.z1 - WH.z0, corr, WH.x0, WH.h / 2, (WH.z0 + WH.z1) / 2, wh);
// east wall: a doorway into Het Hok at z -16.6 (js/woning.js builds the room behind the parking)
box(0.3, WH.h, -17.15 - WH.z0, corr, WH.x1, WH.h / 2, (WH.z0 - 17.15) / 2, wh); box(0.3, WH.h, WH.z1 + 16.05, corr, WH.x1, WH.h / 2, (WH.z1 - 16.05) / 2, wh); box(0.3, WH.h - 2.3, 1.1, corr, WH.x1, 2.3 + (WH.h - 2.3) / 2, -16.6, wh);
solid(WH.x0 - 0.2, -5.7, WH.z0 - 0.3, WH.z0 + 0.15); solid(-3.5, WH.x1 + 0.2, WH.z0 - 0.3, WH.z0 + 0.15);
const backPlugSolid = solid(-5.7, -3.5, WH.z0 - 0.3, WH.z0 + 0.15);
solid(WH.x0 - 0.15, WH.x0 + 0.15, WH.z0, WH.z1);
solid(WH.x1 - 0.15, WH.x1 + 0.15, WH.z0, -17.15); solid(WH.x1 - 0.15, WH.x1 + 0.15, -16.05, WH.z1);
const hokDoorSolid = solid(WH.x1 - 0.15, WH.x1 + 0.15, -17.15, -16.05);
// front (south) wall: low strip always visible, the rest hides when you're inside
const frontHigh = new THREE.Group(); wh.add(frontHigh);
const frontLow = new THREE.Group(); wh.add(frontLow);
function frontWall(x0, x1) {
  box(x1 - x0, WH.h - 0.6, 0.3, corrS, (x0 + x1) / 2, 0.6 + (WH.h - 0.6) / 2, WH.z1, frontHigh);
  box(x1 - x0, 0.6, 0.3, corr, (x0 + x1) / 2, 0.3, WH.z1, frontLow);
  solid(x0, x1, WH.z1 - 0.15, WH.z1 + 0.15);
}
frontWall(WH.x0, WH.doorX0); frontWall(WH.doorX1, WH.x1);
box(WH.doorX1 - WH.doorX0, WH.h - 3.4, 0.3, corrS, (WH.doorX0 + WH.doorX1) / 2, 3.4 + (WH.h - 3.4) / 2, WH.z1, frontHigh);
// roller door
const shutterTex = canvasTex(64, 256, (g, w, h) => { for (let y = 0; y < h; y += 8) { g.fillStyle = y % 16 ? '#8c9298' : '#a8aeb4'; g.fillRect(0, y, w, 8); } });
const shutter = box(WH.doorX1 - WH.doorX0, 3.4, 0.12, lam({ map: shutterTex }), (WH.doorX0 + WH.doorX1) / 2, 1.7, WH.z1 + 0.05, wh);
const shutterSolid = solid(WH.doorX0, WH.doorX1, WH.z1 - 0.15, WH.z1 + 0.15);
// once De Hal takes the trucks, the roller door goes: the opening is closed with sheet and an ordinary steel door (Tristan 2026-11-27)
const doorOnly = { on: false, high: new THREE.Group(), low: new THREE.Group(), sols: [] };
{ const cx = (WH.doorX0 + WH.doorX1) / 2, dw = 0.65; frontHigh.add(doorOnly.high); frontLow.add(doorOnly.low);
  for (const [x0, x1] of [[WH.doorX0, cx - dw], [cx + dw, WH.doorX1]]) { box(x1 - x0, 3.4 - 0.6, 0.3, corrS, (x0 + x1) / 2, 0.6 + (3.4 - 0.6) / 2, WH.z1, doorOnly.high); box(x1 - x0, 0.6, 0.3, corr, (x0 + x1) / 2, 0.3, WH.z1, doorOnly.low); doorOnly.sols.push(Object.assign(solid(x0, x1, WH.z1 - 0.15, WH.z1 + 0.15), { off: true })); }
  box(dw * 2, 3.4 - 2.25, 0.3, corrS, cx, 2.25 + (3.4 - 2.25) / 2, WH.z1, doorOnly.high); box(dw * 2 + 0.2, 0.12, 0.36, lam({ color: 0x3a3e44 }), cx, 2.25, WH.z1, doorOnly.high, false); for (const s of [-1, 1]) box(0.1, 2.25, 0.36, lam({ color: 0x3a3e44 }), cx + s * (dw + 0.05), 1.125, WH.z1, doorOnly.low, false);
  { const leaf = box(0.06, 2.15, dw * 2 - 0.1, lam({ color: 0x4a6a8a }), cx - dw + 0.06, 1.08, WH.z1 + dw - 0.1, doorOnly.low, false); leaf.userData.leaf = true; } // standing open, against the wall
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.42), lam({ map: signTex([{ t: 'GOEDEREN → DE HAL', size: 44 }], '#f2c31a', '#1a1a1a', 512, 98) })); pl.position.set(cx + 2.0, 2.0, WH.z1 + 0.17); doorOnly.high.add(pl);
  doorOnly.high.visible = doorOnly.low.visible = false; }
function shedFront(on) { if (doorOnly.on === on) return; doorOnly.on = on; doorOnly.high.visible = doorOnly.low.visible = on; for (const s of doorOnly.sols) s.off = !on; }
// ---- the doorbell (Tristan 2026-11-27): people from the street do not walk into Eddy's warehouse. Whoever is headed for
// him stops on the threshold and rings; Eddy opens the door (E inside, by the door) or lets it ring.
const deurbel = { who: null, t: 0, cd: 0, angry: false };
function ringBell(who, angry) {
  deurbel.who = who; deurbel.t = 14; deurbel.angry = !!angry; if (deurbel.cd > 0) return; deurbel.cd = angry ? 1.6 : 7;
  beep(784, 0.22, 'sine', 0.07); setTimeout(() => beep(622, 0.45, 'sine', 0.07), 240); if (angry) { setTimeout(() => beep(784, 0.2, 'sine', 0.07), 520); setTimeout(() => beep(622, 0.4, 'sine', 0.07), 740); }
  if (isInside(player.position) && !state.inDialogue) toast('DING DONG', angry ? `${who}: on the deurbel, and on the door with a flat hand. Open it, or sit it out.` : `${who} is at the door. Open it (E by the door), or let it ring.`, 3.5);
}
// p: a world position (changed in place when it is inside the walls). Returns true when the visitor was stopped at the door.
function keepOut(p, who, wantsIn, angry) {
  if (!(p.x > WH.x0 - 0.2 && p.x < WH.x1 + 0.2 && p.z > WH.z0 - 0.2 && p.z < WH.z1 + 0.35)) return false;
  p.z = WH.z1 + 0.8; p.x = Math.max(WH.doorX0 + 0.5, Math.min(WH.doorX1 - 0.5, p.x));
  if (wantsIn && isInside(player.position)) ringBell(who, angry);
  return true;
}
{ const plate = box(0.14, 0.2, 0.05, lam({ color: 0xd8b040 }), WH.doorX1 + 0.45, 1.35, WH.z1 + 0.18, frontLow, false); box(0.05, 0.05, 0.03, lam({ color: 0x1a1a1a }), 0, 0, 0.035, plate, false);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.16), lam({ map: signTex([{ t: 'BELLEN A.U.B.', size: 40 }], '#f2ead8', '#3a2412', 256, 82) })); pl.position.set(WH.doorX1 + 0.45, 1.62, WH.z1 + 0.17); frontLow.add(pl); }
// sign
const sign = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 1.35), lam({ map: signFace(canvasTex, 'zn', 1024, 182) })); // Eddy & Zn, then Eddy's (updateKangoo)
sign.position.set((WH.doorX0 + WH.doorX1) / 2, 4.25, WH.z1 + 0.2); frontHigh.add(sign);
// roof (hidden while inside)
const roof = new THREE.Group(); wh.add(roof);
const roofMesh = box(WH.x1 - WH.x0 + 0.8, 0.25, WH.z1 - WH.z0 + 0.8, lam({ map: tex('roof_rust.jpg', 4, 4), color: 0xa08070 }), (WH.x0 + WH.x1) / 2, WH.h + 0.1, (WH.z0 + WH.z1) / 2, roof);
for (let i = 0; i < 2; i++) box(1.2, 0.5, 1.2, lam({ color: 0x8a8f94 }), WH.x0 + 3 + i * 6, WH.h + 0.45, -13, roof);
// sawtooth front parapet (like the outlet sheds), white trim + pink neon along the teeth
{
  const teeth = 4, tw = (WH.x1 - WH.x0) / teeth, th = 1.6;
  const ss = new THREE.Shape(); ss.moveTo(WH.x0, 0);
  for (let i = 0; i < teeth; i++) { ss.lineTo(WH.x0 + i * tw + tw * 0.78, th); ss.lineTo(WH.x0 + (i + 1) * tw, 0); }
  const saw = new THREE.Mesh(new THREE.ExtrudeGeometry(ss, { depth: 0.3, bevelEnabled: false }), new THREE.MeshStandardMaterial({ map: corrTex, color: 0xff7a68, roughness: 0.6 }));
  saw.position.set(0, WH.h, WH.z1 - 0.15); saw.castShadow = true; roof.add(saw);
  const white = lam({ color: 0xf6f4ee }), pink = new THREE.MeshBasicMaterial({ color: 0xe8862c });
  for (let i = 0; i < teeth; i++) {
    const a = [WH.x0 + i * tw, WH.h], b = [WH.x0 + i * tw + tw * 0.78, WH.h + th], c = [WH.x0 + (i + 1) * tw, WH.h];
    for (const [p, q, m, t, dz] of [[a, b, white, 0.18, 0.2], [b, c, white, 0.18, 0.2], [a, b, pink, 0.07, 0.3], [b, c, pink, 0.07, 0.3]]) {
      const e = box(Math.hypot(q[0] - p[0], q[1] - p[1]), t, 0.08, m, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, WH.z1 + dz, roof, false); e.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]);
    }
  }
  for (const x of [WH.x0, WH.x1]) box(0.22, WH.h, 0.22, white, x, WH.h / 2, WH.z1 + 0.05, frontLow, false);
  graffiti(frontLow, -9.2, 0.75, WH.z1 + 0.17, 1, 2.6); graffiti(frontLow, -0.7, 0.75, WH.z1 + 0.17, 4, 2.0);
  poster(frontHigh, -10.2, 2.2, WH.z1 + 0.17, 5); poster(frontHigh, -9.4, 2.25, WH.z1 + 0.17, 0, 0.05); poster(frontHigh, 0.2, 2.2, WH.z1 + 0.17, 1, -0.04);
  neonTube(frontHigh, WH.x0 + 0.3, 3.85, WH.doorX0 - 0.3, 3.85, WH.z1 + 0.22, 0xf2c14e); neonTube(frontHigh, WH.doorX1 + 0.3, 3.85, WH.x1 - 0.3, 3.85, WH.z1 + 0.22, 0xf2c14e);
  box(WH.x1 - WH.x0 + 0.2, 0.2, 0.25, white, (WH.x0 + WH.x1) / 2, WH.h - 0.05, WH.z1 + 0.06, frontHigh, false);
}
// interior lights
const inLight1 = new THREE.PointLight(0xfff0d0, 0, 15, 1.5); inLight1.position.set(-7.5, 4.2, -14); wh.add(inLight1);
const inLight2 = new THREE.PointLight(0xfff0d0, 0, 15, 1.5); inLight2.position.set(-2.5, 4.2, -14); wh.add(inLight2);
for (const x of [-7.5, -2.5]) box(2.4, 0.1, 0.25, lam({ color: 0xffffff, emissive: 0xfff6d8 }), x, 4.7, -13, roof, false);
// shelves along the back
const backShelf = { meshes: [], sol: null }; // the first one makes way for the door into De Hal (js/loods.js)
for (let i = 0; i < 2; i++) {
  const sx = WH.x0 + 6.4 + i * 3.9, ms = [];
  ms.push(box(3.6, 0.08, 1.0, mat.wood, sx, 1.0, WH.z0 + 0.8, wh), box(3.6, 0.08, 1.0, mat.wood, sx, 2.1, WH.z0 + 0.8, wh));
  for (let k = 0; k < 4; k++) ms.push(box(0.5, 0.6, 0.5, lam({ color: [0xb08a5a, 0x9a7a4a, 0xc0a070][k % 3] }), sx - 1.3 + k * 0.85, 1.35, WH.z0 + 0.8, wh));
  const so = solid(sx - 1.8, sx + 1.8, WH.z0, WH.z0 + 1.35);
  if (i === 0) { backShelf.meshes = ms; backShelf.sol = so; }
}
// ------------------------------------------------------------------ De Loods, laid out (Tristan 2026-11-26)
// The floor says what goes where: goods come in through the roller door (LAADZONE), stand on the pallets along the east wall
// (OPSLAG), are mixed at the back (MENGERIJ, with the mill beside it), bagged by the door (INPAK) and go out again. The west
// wall is for the racking, the back corner is the office, and the Naknikim have lockers. Every upgrade that is not there yet
// has its outline and its name stencilled on the concrete in white, so Eddy can see where it will stand.
const whZones = []; // { g, done() }: the outline of something still to come
const whPaint = {}; // floor paint that moves with its machine
{
  const K = kit(), Y = 0xf2c31a, WHT = 0xf4f2ec, DADO = 0x3f8f86;
  const liner = (KK) => (x0, z0, x1, z1, c = Y, w = 0.09) => KK.box(Math.abs(x1 - x0) + w, 0.012, Math.abs(z1 - z0) + w, c, (x0 + x1) / 2, 0.042, (z0 + z1) / 2);
  const rectOf = (ln) => (x0, z0, x1, z1, c, dash) => { if (!dash) { ln(x0, z0, x1, z0, c); ln(x0, z1, x1, z1, c); ln(x0, z0, x0, z1, c); ln(x1, z0, x1, z1, c); return; }
    for (let x = x0; x < x1 - 0.05; x += 0.5) { ln(x, z0, Math.min(x1, x + 0.28), z0, c); ln(x, z1, Math.min(x1, x + 0.28), z1, c); } for (let z = z0; z < z1 - 0.05; z += 0.5) { ln(x0, z, x0, Math.min(z1, z + 0.28), c); ln(x1, z, x1, Math.min(z1, z + 0.28), c); } };
  const stencil = (text, x, z, w, col = '#f2c31a', parent = wh, ry = 0) => {
    const t = canvasTex(256, 56, (g, cw, ch) => { g.clearRect(0, 0, cw, ch); g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 40; g.font = `900 ${fs}px Arial Black, Impact, sans-serif`; while (g.measureText(text).width > cw - 10 && fs > 10) { fs -= 2; g.font = `900 ${fs}px Arial Black, Impact, sans-serif`; } g.fillText(text, cw / 2, ch / 2 + 2); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 56 / 256), lam({ map: t, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.rotation.z = ry; m.position.set(x, 0.046, z); parent.add(m); return m; };
  const line = liner(K), rect = rectOf(line);
  // LAADZONE: yellow hatching inside the roller door, keep it clear
  // OPSLAG: the pallet places along the east wall
  rect(-1.2, -15.8, WH.x1 - 0.25, -9.15, Y); stencil('OPSLAG', -1.62, -12.45, 2.6, '#f2c31a', wh, Math.PI / 2);
  // MENGERIJ: the mixer at the back
  // (the MENGERIJ and INPAK paint are their own groups: they go along when Eddy moves the mixer or the packing, js/inrichten.js)
  for (const [k, fn] of [['mixer', (r, st, g) => { r(-4.15, -17.0, -1.38, -14.25, 0xe8862c); st('MENGERIJ', -2.76, -13.9, 2.4, '#e8862c', g); }], ['pack', (r, st, g) => { r(-1.55, -9.0, WH.x1 - 0.25, -7.4, 0x3aa0ff); st('INPAK', -2.2, -8.2, 1.4, '#3aa0ff', g, Math.PI / 2); }]]) {
    const g = new THREE.Group(), PK = kit(); wh.add(g); fn(rectOf(liner(PK)), stencil, g); const m = PK.build(); if (m) g.add(m); whPaint[k] = g; }
  // INPAK: bagging by the door, so the bags leave the way the vaten came
  // KANTOOR: the desk in the back corner on Oma's kilim, a pin board and a clock over it
  K.box(3.6, 0.02, 2.3, 0x9a2a2a, -8.8, 0.04, -19.45); K.box(3.2, 0.022, 1.9, 0xc8a05a, -8.8, 0.041, -19.45); K.box(2.6, 0.024, 1.3, 0x7a1f24, -8.8, 0.042, -19.45); for (const dx of [-1.0, 0, 1.0]) K.box(0.5, 0.026, 0.5, 0xe8d8b0, -8.8 + dx, 0.043, -19.45, Math.PI / 4);
  stencil('KANTOOR', -8.8, -18.05, 2.2);
  K.box(1.7, 1.0, 0.05, 0xb08a5a, -9.1, 1.9, WH.z0 + 0.19); K.box(1.8, 0.07, 0.07, 0x5a3a22, -9.1, 2.42, WH.z0 + 0.2); for (const [dx, dy, c] of [[-0.5, 0.2, 0xf4f2ec], [0.1, 0.25, 0xffe08a], [0.5, -0.1, 0xf4f2ec], [-0.2, -0.25, 0xff9a8a], [0.55, 0.3, 0x9ad0ff]]) K.box(0.3, 0.36, 0.01, c, -9.1 + dx, 1.9 + dy, WH.z0 + 0.225);
  K.cyl(0.24, 0.24, 0.05, 0xf4f2ec, -7.6, 2.5, WH.z0 + 0.19, 18, Math.PI / 2); K.cyl(0.27, 0.27, 0.03, 0x1a1a1a, -7.6, 2.5, WH.z0 + 0.175, 18, Math.PI / 2); K.box(0.02, 0.17, 0.01, 0x1a1a1a, -7.6, 2.57, WH.z0 + 0.225); K.box(0.12, 0.02, 0.01, 0x1a1a1a, -7.55, 2.5, WH.z0 + 0.225);
  K.box(0.5, 1.3, 0.55, 0x8a8f94, -10.5, 0.65, -18.4); for (let i = 0; i < 3; i++) K.box(0.03, 0.04, 0.3, 0x3a3e44, -10.24, 0.3 + i * 0.42, -18.4); solid(-10.8, -10.22, -18.72, -18.08); // a filing cabinet
  // the Naknikim's corner on the west wall: lockers, a bench, the time clock
  for (let i = 0; i < 3; i++) { const z = -12.7 + i * 0.56; K.box(0.5, 1.9, 0.52, [0x2f62b8, 0x2a58a6, 0x2f62b8][i], -10.55, 0.95, z); for (let v = 0; v < 3; v++) K.box(0.02, 0.02, 0.3, 0x1a2a4a, -10.29, 1.6 + v * 0.07, z); K.box(0.03, 0.1, 0.04, 0xd8d8d8, -10.29, 1.0, z + 0.16); }
  solid(-10.85, -10.27, -13.0, -11.28);
  K.box(0.4, 0.06, 1.5, 0x7a5a3a, -10.5, 0.45, -10.4); for (const dz of [-0.6, 0.6]) K.box(0.36, 0.45, 0.06, 0x3a3e44, -10.5, 0.225, -10.4 + dz); solid(-10.8, -10.28, -11.2, -9.6);
  K.box(0.06, 0.4, 0.3, 0x3a3e44, WH.x0 + 0.2, 1.5, -13.5); K.box(0.02, 0.12, 0.2, 0x40ff60, WH.x0 + 0.24, 1.58, -13.5); stencil('NAKNIKIM', -9.55, -12.15, 1.9, '#9ad0ff', wh, Math.PI / 2);
  // safety: a painted band round the walls, an extinguisher and a first aid box by the door, a mirror for the heftruck some day
  for (const [x0, x1] of [[WH.x0 + 0.2, -5.75], [-3.45, WH.x1 - 0.2]]) K.box(x1 - x0, 1.0, 0.04, DADO, (x0 + x1) / 2, 0.5, WH.z0 + 0.18);
  K.box(0.04, 1.0, WH.z1 - WH.z0 - 0.4, DADO, WH.x0 + 0.18, 0.5, (WH.z0 + WH.z1) / 2); for (const [z0, z1] of [[WH.z0 + 0.2, -17.2], [-16.0, WH.z1 - 0.2]]) K.box(0.04, 1.0, z1 - z0, DADO, WH.x1 - 0.18, 0.5, (z0 + z1) / 2);
  K.cyl(0.085, 0.085, 0.42, 0xd8202a, -2.15, 0.95, WH.z1 - 0.32, 10); K.cyl(0.03, 0.05, 0.1, 0x1a1a1a, -2.15, 1.21, WH.z1 - 0.32, 8); K.box(0.3, 0.3, 0.02, 0xd8202a, -2.15, 1.75, WH.z1 - 0.2);
  K.box(0.36, 0.3, 0.12, 0xf4f2ec, -9.1, 1.5, WH.z1 - 0.24); K.box(0.16, 0.05, 0.02, 0x2f8a3a, -9.1, 1.5, WH.z1 - 0.31); K.box(0.05, 0.16, 0.02, 0x2f8a3a, -9.1, 1.5, WH.z1 - 0.31); // (west of where the Voorraadrek can stand)
  { const km = K.build(); if (km) { km.receiveShadow = true; wh.add(km); } }
  // ---- still to come: white dashed outlines with the name of the upgrade, gone once it stands there
  const ghost = (done, fn) => { const g = new THREE.Group(), GK = kit(); wh.add(g); fn(rectOf(liner(GK)), (t, x, z, w, ry = 0) => stencil(t, x, z, w, '#f4f2ec', g, ry)); const m = GK.build(); if (m) g.add(m); whZones.push({ g, done }); };
  const has = (id) => !!(loods && loods.has(id));
  ghost(() => !!(loods && loods.ensure().racks > 0), (r, s) => { r(WH.x0 + 0.2, -16.7, -9.65, -13.4, WHT, true); s('PALLETSTELLING', -9.3, -15.05, 2.6, Math.PI / 2); });
  ghost(() => has('menger1'), (r, s) => { r(-3.95, -16.75, -1.6, -15.2, WHT, true); s('MENGMACHINE', -2.76, -17.3, 2.3); });
  ghost(() => has('molen'), (r, s) => { r(-7.25, -15.85, -5.35, -13.95, WHT, true); s('KRUIDENMOLEN', -6.3, -13.6, 2.3); });
  ghost(() => has('inpak'), (r, s) => { r(-1.3, -8.8, WH.x1 - 0.45, -7.6, WHT, true); s('INPAKMACHINE', -0.4, -9.25, 2.1); });
  ghost(() => has('hal'), (r, s) => { r(-5.65, WH.z0 + 0.25, -3.55, -19.7, WHT, true); s('DEUR NAAR DE HAL', -4.6, -19.4, 2.6); });
  ghost(() => has('roldeur') || has('hal'), (r, s) => { s('STALEN ROLDEUR', (WH.doorX0 + WH.doorX1) / 2, WH.z1 - 0.7, 2.6); });
  // the Laadzone is only there while the trucks stop at the shed (js/goederen.js): with De Hal built the floor is free
  { const g = new THREE.Group(), GK = kit(), ln = liner(GK), rc = rectOf(ln); wh.add(g); rc(WH.doorX0 + 0.1, -9.4, WH.doorX1 - 0.1, WH.z1 - 0.35, Y); for (let i = 0; i < 6; i++) GK.box(2.5, 0.012, 0.1, Y, WH.doorX0 + 0.75 + i * 0.6, 0.042, -8.38, 0.9); stencil('LAADZONE', (WH.doorX0 + WH.doorX1) / 2, -9.75, 2.6, '#f2c31a', g); const m = GK.build(); if (m) g.add(m); whZones.push({ g, done: () => has('hal') }); }
  // ...and with De Hal built it is used (Tristan 2026-11-27): west of the new door a bay of racking can go up (the Voorraadrek,
  // js/loods.js bay 13), east of it the Naknikim get a koffiehoek: a counter with the machine, a little table, two stools
  ghost(() => !has('hal') || has('voorrek'), (r, s) => { r(-8.4, -8.45, -5.6, -7.3, WHT, true); s('VOORRAADREK', -7.0, -8.85, 2.2); });
  { const g = new THREE.Group(), GK = kit(); wh.add(g);
    GK.box(1.25, 0.88, 0.52, 0xf4f2ec, -3.2, 0.44, -7.45); GK.box(1.31, 0.05, 0.58, 0x7a5a3a, -3.2, 0.905, -7.45); GK.box(1.2, 0.08, 0.02, 0x3a3e44, -3.2, 0.08, -7.18 - 0.0); // the counter, a wooden top
    GK.box(0.34, 0.5, 0.34, 0x2a2a2c, -3.55, 1.18, -7.42); GK.box(0.26, 0.12, 0.02, 0xd8202a, -3.55, 1.32, -7.24); GK.box(0.1, 0.05, 0.1, 0x8a8e94, -3.55, 1.0, -7.32); GK.cyl(0.04, 0.035, 0.08, 0xf4f2ec, -3.55, 0.97, -7.3, 10); // the machine and a cup under it
    for (const [dx, c] of [[-0.05, 0xf2c31a], [0.1, 0xf4f2ec], [0.25, 0x2f62b8]]) GK.cyl(0.04, 0.035, 0.09, c, -3.0 + dx, 0.975, -7.5, 10); GK.box(0.3, 0.2, 0.2, 0xb08a5a, -2.75, 1.03, -7.45); // mugs, a box of sugar
    GK.cyl(0.36, 0.36, 0.04, 0x7a5a3a, -3.15, 0.74, -8.6, 16); GK.cyl(0.05, 0.05, 0.72, 0x3a3e44, -3.15, 0.36, -8.6, 8); GK.cyl(0.24, 0.24, 0.03, 0x3a3e44, -3.15, 0.02, -8.6, 12); GK.cyl(0.045, 0.04, 0.09, 0xf4f2ec, -3.05, 0.805, -8.5, 10); // the table, a mug left on it
    for (const dx of [-0.62, 0.62]) { GK.cyl(0.17, 0.17, 0.05, 0xd8202a, -3.15 + dx, 0.5, -8.6, 12); GK.cyl(0.03, 0.03, 0.5, 0x3a3e44, -3.15 + dx, 0.25, -8.6, 6); }
    stencil('KOFFIE', -3.15, -9.25, 1.1, '#f4f2ec', g);
    const m = GK.build(); if (m) { m.castShadow = true; g.add(m); }
    whZones.push({ g, done: () => !has('hal'), sols: [solid(-3.85, -2.55, -7.75, -7.15), solid(-3.95, -2.35, -8.95, -8.25)] }); }
}
function whZoneTick() { for (const q of whZones) { let d = false; try { d = q.done(); } catch (e) { /* the loods is not set up yet */ } if (q.g.visible === d || (q.sols && q.sols[0].off !== d)) { q.g.visible = !d; if (q.sols) for (const s of q.sols) s.off = d; } } } // every frame: six cheap checks
const hokDoor = { leaf: null, pl: null }; // Het Hok: an open doorway while Eddy lives there, a shut storage door after the move
{ const hd = new THREE.Group(); hd.position.set(WH.x1 - 0.17, 0, -16.6); wh.add(hd); box(0.06, 0.12, 1.15, lam({ color: 0xf2ead8 }), 0, 2.3, 0, hd, false);
  const leaf = new THREE.Group(); hd.add(leaf); box(0.07, 2.2, 1.0, lam({ color: 0x6a4a2a }), 0, 1.1, 0, leaf, false); box(0.04, 0.05, 0.14, lam({ color: 0xd8b040 }), -0.05, 1.0, 0.3, leaf, false);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.2), lam({ map: signTex([{ t: 'HET HOK', size: 38 }], '#d8b040', '#3a2412', 256, 90) })); pl.position.set(-0.05, 2.55, 0); pl.rotation.y = -Math.PI / 2; hd.add(pl);
  hokDoor.leaf = leaf; hokDoor.pl = pl; hokDoor.plOpen = pl.material.map; hokDoor.plShut = signTex([{ t: 'OPSLAG', size: 38 }], '#f2b21a', '#1a1a1a', 256, 90); }
const isInside = (p) => p.x > WH.x0 && p.x < WH.x1 && p.z > WH.z0 && p.z < WH.z1 - 0.1;

// ------------------------------------------------------------------ street props
// street furniture is built into vertex-coloured kits (one draw call each); "clutter" is the optional layer that Simpel hides
const streetKit = kit(), clutterKit = kit(), clutter = new THREE.Group(); scene.add(clutter);
const lampHeadMat = lam({ color: 0xfff4d0, emissive: 0x806a30 }), LAMPS = [];
function lamp(x, z, K = streetKit) { // Amsterdam-style mast: stepped foot, collar rings, a curved arm and a lantern hood
  const dir = z < 0 ? 1 : -1, c = 0x26282c;
  K.cyl(0.16, 0.2, 0.5, c, x, 0.25, z, 10); K.cyl(0.13, 0.13, 0.08, 0x3a3c40, x, 0.54, z, 10);
  K.cyl(0.065, 0.09, 4.2, c, x, 2.65, z, 10); for (const y of [1.6, 3.2]) K.cyl(0.095, 0.095, 0.06, 0x3a3c40, x, y, z, 10);
  K.cyl(0.04, 0.05, 0.75, c, x, 4.85, z + dir * 0.18, 8, -dir * 0.75); K.cyl(0.04, 0.04, 0.55, c, x, 5.06, z + dir * 0.62, 8, -dir * 1.45);
  K.box(0.4, 0.08, 0.5, c, x, 4.98, z + dir * 0.95); K.cyl(0.05, 0.12, 0.16, c, x, 4.88, z + dir * 0.95, 8);
  if (K === streetKit) { box(0.34, 0.1, 0.4, lampHeadMat, x, 4.86, z + dir * 0.95, scene, false); LAMPS.push([x, z]); } else K.box(0.34, 0.1, 0.4, 0xfff4d0, x, 4.86, z + dir * 0.95);
}
for (let x = -66; x <= 78; x += 12) { if (x > DEALER.x0 && x < DEALER.x1) { lamp(x + 6, ROAD.bike1 + 0.2); continue; } lamp(x === 6 ? 10.6 : x, RC - 5.3); lamp(x + 6, ROAD.bike1 + 0.2); }
function bollard(x, z, K = streetKit) { // Amsterdammertje: dark paprika cast iron, three white-cross rings, a domed top
  const c = 0x5a1a14; K.cyl(0.085, 0.11, 0.86, c, x, 0.43, z, 10); K.cyl(0.1, 0.1, 0.05, 0x6a2418, x, 0.62, z, 10); K.cyl(0.095, 0.095, 0.04, 0x6a2418, x, 0.72, z, 10);
  K.geo(new THREE.SphereGeometry(0.088, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), c, x, 0.86, z);
  for (let k = 0; k < 3; k++) K.box(0.025, 0.07, 0.025, 0xf2efe6, x + 0.09 * Math.cos(k * 2.1), 0.55 - k * 0.1, z + 0.09 * Math.sin(k * 2.1));
}
for (let x = -70; x <= 84; x += 2.6) if (offBridge(x)) bollard(x, ROAD.walk1 + 0.05);
// the far quay: red klinkers, a bluestone edge, Amsterdammertjes along the water, lindens and lamps
wetMats.push(strip(FAR.edge, FAR.front, surface(klinker('red'), 70 * SXK, 2.4, { rough: 0.9, nscale: 1.0, macroAmt: 0.16 }), 0.022).material);
box(SX * 2, 0.14, 0.4, kerbMat, 0, 0.07, FAR.edge + 0.15, scene, false);
for (let x = -70; x <= 84; x += 2.6) if (offBridge(x)) bollard(x, FAR.edge + 0.6);
for (let x = -66; x <= 80; x += 24) { lamp(x, FAR.edge + 0.9); if (offBridge(x + 11, 4)) tree(x + 11, FAR.edge + 1.5, 0.9); }
// north pavement: a row of Amsterdammertjes along the kerb (not at Eddy's driveway, the zebra or a lamp), green bins in the row
if (!RICH_LOW) for (let x = -SX + 2.4; x <= SX - 2.4; x += 2.4) {
  if ((x > -0.6 && x < 10.8) || (x > DEALER.x0 + 3 && x < DEALER.x1 - 3) || Math.abs(x - (CLUB.x0 + CLUB.x1) / 2) < 2.4 || Math.abs(x + 18) < 2.6 || LAMPS.some(([lx, lz]) => lz < 0 && Math.abs(lx - x) < 0.9)) continue;
  if (Math.round(x / 2.4) % 9 === 4) { // Dutch litter bin: a green drum on a post, a grey lid with a slot
    clutterKit.cyl(0.05, 0.05, 1.0, 0x2a2c2e, x, 0.5, RC - 5.45, 8); clutterKit.cyl(0.24, 0.22, 0.62, 0x2f6a3a, x, 0.72, RC - 5.45, 12); clutterKit.cyl(0.25, 0.25, 0.06, 0x5a5e62, x, 1.05, RC - 5.45, 12); clutterKit.box(0.2, 0.03, 0.04, 0x1a1a1a, x, 1.085, RC - 5.33);
  } else bollard(x, RC - 5.42, clutterKit);
}
// flat street decals: drain gullies by both kerbs, manholes on the lanes, oil under the parked cars (batched per texture)
for (let x = -SX + 4, k = 0; x < SX - 4; x += 11, k++) for (const z of [RC - 4.9, RC + 4.9]) decals.push(['gully', x + (k % 2) * 3, z, 0.95, 0]);
for (const [x, z] of [[-44, RC - 1.5], [-26, RC + 1.4], [-4, RC - 1.5], [24, RC + 1.4], [41, RC - 1.5], [58, RC + 1.5]]) decals.push(['manhole', x, z, 0.9, x]);
{ const r = rng(5); for (let x = -SX + 4; x < SX - 4; x += 5.6) for (const z of [RC - 4, RC + 4]) if (r() < 0.45) decals.push(['oil', x + 2.8 + (r() - 0.5), z + (r() - 0.5) * 0.4, 1.3 + r() * 0.9, r() * 6]); }
function flushDecals() { // one merged quad mesh per decal texture
  const by = {}; for (const d of decals) (by[d[0]] = by[d[0]] || []).push(d); decals.length = 0;
  for (const [kind, list] of Object.entries(by)) {
    const pos = [], uv = [], idx = [];
    list.forEach(([, x, z, size, rot], i) => {
      const sx = kind === 'gully' ? size : size, sz = kind === 'gully' ? size * 0.6 : size, c = Math.cos(rot), sn = Math.sin(rot), y = kind === 'manhole' ? 0.04 : 0.036 + (i % 7) * 0.0004;
      for (const [u, v] of [[0, 0], [1, 0], [1, 1], [0, 1]]) { const lx = (u - 0.5) * sx, lz = (0.5 - v) * sz; pos.push(x + lx * c - lz * sn, y, z + lx * sn + lz * c); uv.push(u, v); }
      idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
    });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, lam({ map: decal(kind), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); m.receiveShadow = true; m.renderOrder = 1; scene.add(m);
  }
}
if (!RICH_LOW) for (let x = -60; x <= 60; x += 9) if (offBridge(x, 4)) { const K = clutterKit, z = CZ - 3.85; K.cyl(0.13, 0.15, 0.42, 0x26282c, x, 0.35, z, 10); K.cyl(0.19, 0.19, 0.07, 0x26282c, x, 0.58, z, 10); K.geo(new THREE.TorusGeometry(0.12, 0.025, 6, 12), 0x3a3c40, x, -0.25, CZ - 3.73, 0, 0, 0); } // iron mooring posts, a ring in the quay wall
flushDecals();
{ const m = streetKit.build(); if (m) scene.add(m); const c = clutterKit.build(); if (c) clutter.add(c); }
const ST = { road: wetMats[0], bay: bayMat, paveN: wetMats[3], paveS: wetMats[4], bike: wetMats[5], far: wetMats[6], coping: copingMat };
// ---- free roaming (js/roam.js): one more stretch of the same street, from x = a to b, as a single group.
// Same materials as the home street (so rain, snow and the Graphics setting follow), with the UVs scaled to the piece's
// length; lines, bollards, lamps and lindens go into two kits, so a whole piece is about twenty draw calls.
function streetPiece(a, b) {
  const g = new THREE.Group(), L = b - a, cx = (a + b) / 2, k = L / (SX * 2);
  const scaleU = (geo) => { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * k); return geo; };
  const pl = (z0, z1, m, y) => { const p = new THREE.Mesh(scaleU(new THREE.PlaneGeometry(L, z1 - z0)), m); p.rotation.x = -Math.PI / 2; p.position.set(cx, y, (z0 + z1) / 2); p.receiveShadow = true; g.add(p); return p; };
  const bx = (w, h, d, m, y, z) => { const q = new THREE.Mesh(scaleU(new THREE.BoxGeometry(w, h, d)), m); q.position.set(cx, y, z); q.receiveShadow = true; g.add(q); };
  pl(-70, CZ - 3.75, groundMat, 0); pl(CZ + 3.75, 70, groundMat, 0);
  pl(RC - ROAD.lane, RC + ROAD.lane, ST.road, 0.02); pl(ROAD.pN, RC - ROAD.lane, ST.bay, 0.022); pl(RC + ROAD.lane, ROAD.pS, ST.bay, 0.022);
  pl(-7, RC - 5.2, ST.paveN, 0.012); pl(ROAD.bike1, ROAD.walk1, ST.paveS, 0.012); pl(ROAD.bike0, ROAD.bike1, ST.bike, 0.016); pl(FAR.edge, FAR.front, ST.far, 0.022);
  for (const z of [RC - 5.1, RC + 5.1]) bx(L, 0.16, 0.18, kerbMat, 0.08, z);
  bx(L, 0.08, 0.12, kerbMat, 0.04, ROAD.bike1); bx(L, 0.14, 0.4, ST.coping, 0.07, CZ - 3.9); bx(L, 0.14, 0.4, kerbMat, 0.07, FAR.edge + 0.15);
  const w = new THREE.Mesh(scaleU(new THREE.PlaneGeometry(L, 7.5)), water.material); w.rotation.x = -Math.PI / 2; w.position.set(cx, -1.1, CZ); w.renderOrder = 10; g.add(w);
  for (const [z, ry] of [[CZ - 3.74, 0], [CZ + 3.74, Math.PI]]) { const q = new THREE.Mesh(scaleU(new THREE.PlaneGeometry(L, 1.2)), quayMat); q.position.set(cx, -0.55, z); q.rotation.y = ry; g.add(q); }
  const K = kit(), T = kit(), W = 0xf4f2ec;
  for (let x = a + 2.8; x < b; x += 5.6) for (const z of [RC - 4, RC + 4]) K.box(0.1, 0.01, 1.9, W, x, 0.032, z);
  for (const z of [RC - ROAD.lane, RC + ROAD.lane]) K.box(L, 0.01, 0.1, W, cx, 0.032, z);
  for (let x = a + 2; x < b; x += 4) K.box(2, 0.01, 0.14, W, x, 0.035, RC);
  for (let x = a + 1.5; x < b; x += 3) K.box(1.2, 0.01, 0.1, W, x, 0.03, (ROAD.bike0 + ROAD.bike1) / 2);
  for (let x = a + 1.3; x < b; x += 2.6) { bollard(x, ROAD.walk1 + 0.05, K); bollard(x, FAR.edge + 0.6, K); }
  for (let x = a + 6; x < b; x += 12) { lamp(x, RC - 5.3, K); lamp(x + 6 < b ? x + 6 : x, ROAD.bike1 + 0.2, K); }
  for (let x = a + 12; x < b; x += 24) { lamp(x, FAR.edge + 0.9, K); tree(x + 11 < b ? x + 11 : x - 5, FAR.edge + 1.5, 0.9, T); }
  for (let x = a + 3; x < b; x += 12) tree(x, ROAD.bike1 + 0.45, 0.9, T);
  const km = K.build(), tm = T.build(); if (km) g.add(km); if (tm) { tm.castShadow = true; g.add(tm); }
  return g;
}
// 80s Kaasland cars: side profiles with rounded corners, extruded with a bevel, glass greenhouses, chrome bits
const CAR_PAINT = [0xc8102e, 0xf2e8c8, 0x1f4fa0, 0x2f6a3a, 0xe8b020, 0x7a2a5a, 0xd8d8d8, 0x1a1a1a, 0xff7a3a, 0x5ac8c0, 0xff8fb8, 0x8a6a4a, 0x3a3a6a];
let carSeed = 7;
const crand = () => { carSeed = (carSeed * 16807) % 2147483647; return (carSeed - 1) / 2147483646; };
// at night every street lamp throws a soft pool of light on the pavement: one instanced, additive quad per lamp (no real lights)
const lampPools = new THREE.InstancedMesh(new THREE.PlaneGeometry(9, 9).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), color: 0xffd9a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), LAMPS.length);
{ const m4 = new THREE.Matrix4(); LAMPS.forEach(([x, z], i) => { m4.makeTranslation(x, 0.06, z + (z < 0 ? 0.95 : -0.95)); lampPools.setMatrixAt(i, m4); }); lampPools.visible = false; lampPools.renderOrder = 3; scene.add(lampPools); }
const morePools = []; // the same pools of lamp light on the streets built later (js/roam.js, js/wijk.js)
function lampPool(points, parent) { if (!points.length) return null; const q = new THREE.InstancedMesh(lampPools.geometry, lampPools.material, points.length), m4 = new THREE.Matrix4(); points.forEach(([x, z], i) => { m4.makeTranslation(x, 0.06, z); q.setMatrixAt(i, m4); }); q.visible = lampPools.visible; q.renderOrder = 3; parent.add(q); morePools.push(q); return q; }
const lendQ = []; // parked cars and rack bikes wait here until the ride system exists
function lendable(g, kind) { if (fiets) adoptRide(g, kind); else lendQ.push([g, kind]); }
function adoptRide(g, kind) { fiets.adopt(g, kind === 'car' ? { kind: 'car', name: g.userData.model || 'auto', solid: g.userData.solid, half: g.userData.half, width: g.userData.width } : { kind: 'bike', name: 'Fiets' }); }
function car(x, z, color, rot = 0, isSolid = true, model = -1) { // street cars come from js/vehicles.js
  const paint = crand() < 0.35 && color ? color : CAR_PAINT[Math.floor(crand() * CAR_PAINT.length)];
  const g = makeCar(THREE, canvasTex, { model, paint, rand: crand }); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  const half = g.userData.half, W = g.userData.width;
  if (isSolid) { g.userData.solid = solid(x - half, x + half, z - W / 2 - 0.05, z + W / 2 + 0.05); lendable(g, 'car'); } // any parked car can be borrowed (js/bikes.js adopt)
  return g;
}
const parkedN = []; // x of cars parked along the north pavement (ticket inspectors work these)
const CAR_COLS = [0xb8b2a2, 0x6a1e22, 0x2a4a6a, 0xcfcfc8, 0x2d2d2d, 0x8a8f3a, 0xe0d8c0, 0x3a5a7a, 0x9a2a2a, 0x556b5a];
// parked cars in the bays (none in front of the warehouse, the lot, or on the zebra)
{
  let k = 0;
  for (let x = -SX + 4.8; x < SX - 4; x += 5.6) for (const z of [RC - 4, RC + 4]) {
    if (z < RC && ((x > DEALER.x0 && x < DEALER.x1) || Math.abs(x - (CLUB.x0 + CLUB.x1) / 2) < 4)) continue; // keep the club door and the showroom drive clear
    k++;
    if (Math.abs(x + 18) < 4) continue;
    if (z < RC && x > -13 && x < 11) continue;
    if (z < RC && x > PS.doorX0 - 3.5 && x < PS.doorX1 + 2.5) continue;
    if ((k * 7) % 5 === 0) continue;
    car(x + 2.8, z, CAR_COLS[(k * 3) % CAR_COLS.length], (k % 2) * Math.PI, true);
    if (z < RC) parkedN.push(x + 2.8);
  }
}
// bike racks on the pavement (it's Kaasland after all)
for (const rx of [-24, 4, 30]) for (let i = 0; i < 5; i++) {
  const b = makeBikeModel(THREE, [0, 10, 0, 11, 0][i], BIKE_PAINT[(i * 3 + rx) & 7], { trim: i % 2 ? 0x1a1a1a : 0xefe3c8, basket: i !== 2 }); // parked Dutch bikes, nose to the kerb
  b.position.set(rx + i * 0.7, 0, RC + 10.35); b.rotation.y = Math.PI / 2; b.rotateX(0.06 * (i % 2 ? 1 : -1)); scene.add(b);
  mergeStatic(b); lendable(b, 'bike'); // one mesh per colour instead of ~70 parts a bike (they were 1.100 draw calls of the home street), and Eddy can borrow them
  if (i === 0) solid(rx - 0.4, rx + 3.2, RC + 9.95, RC + 10.75);
}

await bootStep(38, 'Washing the Oofmobiel…');
// ------------------------------------------------------------------ the Oofmobiel
// Eddy's private parking: asphalt lot with a low back wall and a PRIVÉ sign
{
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(LOT.x1 - LOT.x0, 8.5), lam({ map: tex('asphalt.jpg', 4, 4), color: 0x8c8c8c }));
  lot.rotation.x = -Math.PI / 2; lot.position.set((LOT.x0 + LOT.x1) / 2, 0.018, -11.25); lot.receiveShadow = true; scene.add(lot);
  const drive = new THREE.Mesh(new THREE.PlaneGeometry(LOT.x1 - LOT.x0 - 1, RC - 5.1 + 7), lam({ map: tex('asphalt.jpg', 4, 1), color: 0x8c8c8c }));
  drive.rotation.x = -Math.PI / 2; drive.position.set((LOT.x0 + LOT.x1) / 2, 0.02, (RC - 5.1 - 7) / 2); scene.add(drive);
  // two bays, each car centred in its own: the Oofmobiel on the left, Shooki's Kangoo on the right
  for (const x of BAYS.lines) box(0.12, 0.01, 6.5, lam({ color: 0xf2d24a }), x, 0.03, -11.6, scene, false);
  const prive = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#ffd36b'; g.fillRect(0, 0, w, h); g.fillStyle = '#6b1410'; g.font = '900 34px Arial Black, Arial'; g.textAlign = 'center'; g.fillText('PRIVÉ', w / 2, 52); g.font = '700 22px Arial'; g.fillText('EDDY & ZN · OOFMOBIEL', w / 2, 90); g.fillText('wegsleepregeling', w / 2, 116); });
  box(LOT.x1 - LOT.x0, 1.6, 0.3, brickMats[3], (LOT.x0 + LOT.x1) / 2, 0.8, -15.35); solid(LOT.x0, LOT.x1, -15.5, -15.2);
  graffiti(scene, 3.4, 0.85, -15.18, 3, 2.6); graffiti(scene, 7.2, 0.8, -15.18, 6, 2.2);
  cyl(0.05, 0.05, 2.2, mat.dark, LOT.x1 - 0.6, 1.1, -7.2);
  const ps = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.55), lam({ map: prive })); ps.position.set(LOT.x1 - 0.6, 2.0, -7.14); scene.add(ps);
  // painted word on the lot floor
  const pw = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), lam({ map: canvasTex(256, 64, (g) => { g.fillStyle = '#f2d24a'; g.font = '900 44px Arial'; g.textAlign = 'center'; g.fillText('PRIVÉ', 128, 50); }), transparent: true }));
  pw.rotation.x = -Math.PI / 2; pw.position.set((LOT.x0 + LOT.x1) / 2, 0.035, -7.8); scene.add(pw);
}
const oof = new THREE.Group(); oof.position.set(BAYS.oof, 0, -11.4); oof.rotation.y = -Math.PI / 2; scene.add(oof);
{ const v = makeOofmobiel(THREE, canvasTex); v.rotation.y = Math.PI / 2; oof.add(v); } // nose along the group's +x, as before
const oofSolid = solid(oof.position.x - 1.15, oof.position.x + 1.15, oof.position.z - 3.0, oof.position.z + 3.3); // off while the van is out on a trip (js/rit.js)
// Shooki's Renault Kangoo: parked next to the Oofmobiel once Kipkruidenkwartier is Eddy's (Shooki runs the errands in it)
const kangoo = (() => {
  const g = makeKangoo(THREE, canvasTex, { plate: 'SH-00-KI', livery: 'shooki' });
  g.position.set(BAYS.kangoo, 0, -11.6); g.rotation.y = -Math.PI / 2; g.visible = false; scene.add(g); // nose to the street, like the Oofmobiel
  g.userData.solid = solid(BAYS.kangoo - 0.9, BAYS.kangoo + 0.9, -13.8, -9.4); g.userData.solid.off = true;
  return g;
})();
function updateKangoo() { const on = !!state.district1 && !(spoed && spoed.kangooAway()); kangoo.visible = on; kangoo.userData.solid.off = !on; setLivery(oof, liveryNow(), canvasTex); const sm = signFace(canvasTex, liveryNow(), 1024, 182); if (sign.material.map !== sm) { sign.material.map = sm; sign.material.needsUpdate = true; } }
// the Oofmobiel's lettering: Dad's Eddy & Zn until Kipkruidenkwartier is Eddy's, then his own brand, Eddy's
const liveryNow = () => (state.district1 ? 'eddys' : 'zn');

await bootStep(46, 'Painting faces…');
// ------------------------------------------------------------------ characters
const faceTex = (f) => { const t = loader.load('./assets/' + f); t.colorSpace = THREE.SRGBColorSpace; return t; };
// ---- painted heads (Neon Vice approach: a stylised PS2 face painted from the reference photo's colours and features)
const hex = (c) => '#' + c.toString(16).padStart(6, '0');
function shade(c, k) { const r = Math.min(255, ((c >> 16) & 255) * k) | 0, g = Math.min(255, ((c >> 8) & 255) * k) | 0, b = Math.min(255, (c & 255) * k) | 0; return `rgb(${r},${g},${b})`; }
function paintHead(f) {
  // sphere UVs: face centre at u = 0.25 (x = 128), eyes on the equator (y ~ 124)
  return canvasTex(512, 256, (g, W, H) => {
    const C = 128, sk = f.skin;
    g.fillStyle = hex(sk); g.fillRect(0, 0, W, H);
    // soft shading: darker towards the sides/back, warm cheeks, brow ridge
    const grd = g.createLinearGradient(0, 0, W, 0);
    grd.addColorStop(0, 'rgba(0,0,0,.18)'); grd.addColorStop(0.25, 'rgba(0,0,0,0)'); grd.addColorStop(0.5, 'rgba(0,0,0,.2)'); grd.addColorStop(0.75, 'rgba(0,0,0,.26)'); grd.addColorStop(1, 'rgba(0,0,0,.18)');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    const soft = (x, y, rx, ry, col) => { g.save(); g.translate(x, y); g.scale(rx, ry); const r = g.createRadialGradient(0, 0, 0, 0, 0, 1); r.addColorStop(0, col); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(-1, -1, 2, 2); g.restore(); };
    g.save(); g.translate(C, 128); g.scale(1.32, 1.32); g.translate(-C, -128);
    for (const s of [-1, 1]) { soft(C + s * 30, 150, 16, 13, 'rgba(225,95,75,.28)'); soft(C + s * 34, 140, 10, 22, 'rgba(0,0,0,.12)'); }
    soft(C, 110, 42, 9, 'rgba(0,0,0,.14)');
    if (f.stubble) { for (let i = 0; i < 420; i++) { const x = C + (Math.random() - 0.5) * 92, y = 150 + Math.random() * 46; if (Math.abs(x - C) < 46 - (y - 150) * 0.25 && !(Math.abs(x - C) < 18 && Math.abs(y - 168) < 6)) { g.fillStyle = 'rgba(40,25,18,.18)'; g.fillRect(x, y, 1.4, 1.4); } } soft(C, 172, 34, 20, 'rgba(60,40,30,.12)'); }
    // ears
    for (const s of [-1, 1]) { g.fillStyle = shade(sk, 0.86); g.beginPath(); g.ellipse(C + s * 62, 130, 7, 13, 0, 0, 7); g.fill(); }
    // eyes: almond whites, iris, heavy upper lid
    for (const s of [-1, 1]) {
      const ex = C + s * 19, ey = 124;
      soft(ex, ey + 6, 12, 5, 'rgba(60,30,25,.25)');
      g.fillStyle = '#f2ece4'; g.beginPath(); g.moveTo(ex - 10, ey); g.quadraticCurveTo(ex, ey - (f.squint ? 5 : 7), ex + 10, ey); g.quadraticCurveTo(ex, ey + 5, ex - 10, ey); g.fill();
      g.fillStyle = f.iris || '#4a2e1c'; g.beginPath(); g.arc(ex, ey - 0.5, 4.2, 0, 7); g.fill();
      g.fillStyle = '#120a06'; g.beginPath(); g.arc(ex, ey - 0.5, 2, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.fillRect(ex + 1, ey - 3, 1.6, 1.6);
      g.strokeStyle = shade(sk, 0.45); g.lineWidth = 2.2; g.beginPath(); g.moveTo(ex - 11, ey + 0.5); g.quadraticCurveTo(ex, ey - (f.squint ? 6 : 8), ex + 11, ey + 0.5); g.stroke();
      // brows
      g.strokeStyle = f.brow; g.lineWidth = f.browW || 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(ex - s * 9, ey - 13); g.quadraticCurveTo(ex, ey - 18, ex + s * 12, ey - 12); g.stroke();
    }
    // nose
    g.strokeStyle = shade(sk, 0.62); g.lineWidth = 2; g.beginPath(); g.moveTo(C - 3, 128); g.quadraticCurveTo(C - 6, 146, C - 8, 150); g.quadraticCurveTo(C, 156, C + 8, 150); g.stroke();
    soft(C, 152, 9, 5, 'rgba(0,0,0,.16)');
    if (f.beard) { // full ginger beard + moustache (The Russian, like Nine of Nine)
      g.fillStyle = f.beard;
      g.beginPath(); g.moveTo(C - 50, 132); g.quadraticCurveTo(C - 54, 196, C, 206); g.quadraticCurveTo(C + 54, 196, C + 50, 132); g.quadraticCurveTo(C + 30, 160, C, 158); g.quadraticCurveTo(C - 30, 160, C - 50, 132); g.fill();
      g.beginPath(); g.moveTo(C - 22, 162); g.quadraticCurveTo(C, 150, C + 22, 162); g.quadraticCurveTo(C, 158, C - 22, 162); g.fill();
      for (let i = 0; i < 200; i++) { const a = Math.random() * Math.PI, r = 30 + Math.random() * 22; g.strokeStyle = 'rgba(60,25,8,.35)'; g.lineWidth = 1; g.beginPath(); const x = C + Math.cos(a) * r * 0.95, y = 158 + Math.sin(a) * r * 0.85; g.moveTo(x, y); g.lineTo(x + 1.5, y + 3); g.stroke(); }
    }
    // mouth: big smile (both reference photos are laughing)
    const my = 166;
    if (f.mouth === 'laugh') {
      g.fillStyle = '#4a1414'; g.beginPath(); g.moveTo(C - 20, my); g.quadraticCurveTo(C, my + 22, C + 20, my); g.quadraticCurveTo(C, my + 4, C - 20, my); g.fill();
      g.fillStyle = '#f4efe2'; g.beginPath(); g.moveTo(C - 16, my + 1.5); g.quadraticCurveTo(C, my + 7, C + 16, my + 1.5); g.quadraticCurveTo(C, my + 3, C - 16, my + 1.5); g.fill();
    } else {
      g.fillStyle = '#5a1a16'; g.beginPath(); g.moveTo(C - 17, my - 2); g.quadraticCurveTo(C, my + 14, C + 17, my - 2); g.quadraticCurveTo(C, my + 4, C - 17, my - 2); g.fill();
      g.fillStyle = '#f4efe2'; g.fillRect(C - 11, my - 0.5, 22, 4);
    }
    g.strokeStyle = shade(sk, 0.6); g.lineWidth = 1.6; for (const s of [-1, 1]) { g.beginPath(); g.arc(C + s * 24, my - 4, 5, s > 0 ? 0.2 : 2.3, s > 0 ? 1.0 : 3.0); g.stroke(); }
    if (f.goatee) { // a trimmed goatee: thin moustache down into a pointed chin beard
      g.fillStyle = f.goatee;
      g.beginPath(); g.moveTo(C - 21, my - 1); g.quadraticCurveTo(C, my - 12, C + 21, my - 1); g.quadraticCurveTo(C, my - 6, C - 21, my - 1); g.fill();
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(C + s * 20, my - 1); g.lineTo(C + s * 17, my + 14); g.lineTo(C + s * 12, my + 13); g.lineTo(C + s * 15, my); g.fill(); }
      g.beginPath(); g.moveTo(C - 13, my + 10); g.quadraticCurveTo(C, my + 16, C + 13, my + 10); g.lineTo(C + 9, my + 26); g.quadraticCurveTo(C, my + 34, C - 9, my + 26); g.closePath(); g.fill();
    }
    if (f.glasses) {
      g.strokeStyle = '#0c0c10'; g.lineWidth = 3.2;
      for (const s of [-1, 1]) { const ex = C + s * 19; g.beginPath(); g.roundRect(ex - 14, 115, 28, 18, 5); g.stroke(); }
      g.beginPath(); g.moveTo(C - 5, 121); g.lineTo(C + 5, 121); g.stroke();
      g.fillStyle = f.tint || 'rgba(190,220,255,.16)'; for (const s of [-1, 1]) g.fillRect(C + s * 19 - 12, 117, 24, 14);
    }
    g.restore();
    if (f.glasses) { g.strokeStyle = '#0c0c10'; g.lineWidth = 3; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(C + s * 44, 120); g.lineTo(C + s * 66, 124); g.stroke(); } }
    // hair: everything above the hairline, plus the back of the head
    g.fillStyle = f.hair;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, f.backLine); g.lineTo(C + 128 + 20, f.backLine);
    g.quadraticCurveTo(C + 70, f.sideLine, C + 50, f.hairLine + 14); g.quadraticCurveTo(C, f.hairLine - 6, C - 50, f.hairLine + 14); g.quadraticCurveTo(C - 70, f.sideLine, C - 128 - 20, f.backLine); g.lineTo(0, f.backLine); g.closePath(); g.fill();
    if (f.curls) for (let i = 0; i < 380; i++) { const x = Math.random() * W, y = Math.random() * (f.backLine + 6); const inFace = Math.abs(x - C) < 50 && y > f.hairLine; if (!inFace) { g.strokeStyle = Math.random() < 0.5 ? shade(0x3a2a20, 1) : 'rgba(0,0,0,.6)'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 2 + Math.random() * 3, 0, 5); g.stroke(); } }
  });
}
// shoulder cap for an open shirt: skin all the way up to the neck (sphere UVs, front at x = 128, cap = top half)
function collarTex(kind = 'jr') {
  if (kind === 'ru') return canvasTex(512, 256, (g, W, H) => {
    g.fillStyle = '#121216'; g.fillRect(0, 0, W, H); dolphins(g, W, H, 2);
    g.fillStyle = '#d0682a'; g.beginPath(); g.moveTo(128 - 78, 0); g.lineTo(128 + 78, 0); g.lineTo(128 + 34, H + 2); g.lineTo(128 - 34, H + 2); g.closePath(); g.fill();
    g.fillStyle = '#e8b896'; g.beginPath(); g.ellipse(128, 0, 46, 40, 0, 0, Math.PI); g.fill();
    g.strokeStyle = '#b4561e'; g.lineWidth = 6; g.beginPath(); g.ellipse(128, 0, 48, 42, 0, 0, Math.PI); g.stroke();
    g.strokeStyle = '#000'; g.lineWidth = 5; g.beginPath(); g.moveTo(128 - 78, 0); g.lineTo(128 - 34, H + 2); g.moveTo(128 + 78, 0); g.lineTo(128 + 34, H + 2); g.stroke();
  });
  // the half-sphere cap maps the full texture height (top of canvas = neck, bottom = where it meets the torso)
  const T = 46, B = 20; // half-widths of the V at the neck and at the torso seam (px of 512 = full circle)
  return canvasTex(512, 256, (g, W, H) => {
    g.fillStyle = '#86acdf'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#e2a886'; g.beginPath(); g.moveTo(128 - T, 0); g.lineTo(128 + T, 0); g.lineTo(128 + B, H + 2); g.lineTo(128 - B, H + 2); g.closePath(); g.fill();
    for (let i = 0; i < 260; i++) { const y = 70 + Math.random() * (H - 70), half = T - (y / H) * (T - B); const x = 128 + (Math.random() - 0.5) * half * 1.5; g.fillStyle = 'rgba(55,32,18,.5)'; g.fillRect(x, y, 2, 2); }
    g.strokeStyle = '#f5c64e'; g.lineWidth = 3; for (const y of [90, 160]) { const half = T - (y / H) * (T - B) - 3; g.beginPath(); g.moveTo(128 - half, y - 8); g.quadraticCurveTo(128, y + 16, 128 + half, y - 8); g.stroke(); }
    g.strokeStyle = '#6a8fc4'; g.lineWidth = 5; g.beginPath(); g.moveTo(128 - T, 0); g.lineTo(128 - B, H + 2); g.moveTo(128 + T, 0); g.lineTo(128 + B, H + 2); g.stroke();
  });
}
function dolphins(g, W, H, n = 1) {
  const cols = [['#ff5aa0', '#ffb36b'], ['#38c8e8', '#a46bff'], ['#ff8a5a', '#ff4a8a'], ['#5ae0c8', '#3a9aff']];
  for (let i = 0; i < 14 * n; i++) {
    const x = Math.random() * W, y = Math.random() * H, s = 0.5 + Math.random() * 0.5, c = cols[i % 4];
    const gr = g.createLinearGradient(x - 14 * s, y, x + 14 * s, y); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
    g.fillStyle = gr; g.save(); g.translate(x, y); g.rotate(Math.random() * 6.3); g.scale(s, s);
    g.beginPath(); g.ellipse(0, 0, 14, 5, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-12, 0); g.lineTo(-20, -6); g.lineTo(-18, 5); g.fill(); g.beginPath(); g.moveTo(0, -4); g.lineTo(-4, -10); g.lineTo(4, -4); g.fill();
    g.restore();
  }
}
function shirtTex(kind) {
  // cylinder UVs (thetaStart = PI): front centre at x = 128
  return canvasTex(256, 128, (g, W, H) => {
    if (kind === 'jr') {
      g.fillStyle = '#86acdf'; g.fillRect(0, 0, W, H);
      for (let x = 0; x < W; x += 3) { g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(x, 0, 1, H); }
      g.fillStyle = '#e2a886'; g.beginPath(); g.moveTo(118, 0); g.lineTo(138, 0); g.lineTo(128, 46); g.closePath(); g.fill();
      for (let i = 0; i < 60; i++) { const x = 118 + Math.random() * 20, y = 2 + Math.random() * 40; if (Math.abs(x - 128) < (46 - y) * 0.22) { g.fillStyle = 'rgba(55,32,18,.55)'; g.fillRect(x, y, 1.5, 1.5); } }
      g.strokeStyle = '#f5c64e'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(121, 4); g.quadraticCurveTo(128, 22, 135, 4); g.stroke();
      g.strokeStyle = '#6a8fc4'; g.lineWidth = 3; g.beginPath(); g.moveTo(117, 0); g.lineTo(128, 47); g.lineTo(139, 0); g.stroke();
      g.fillStyle = '#eef3fb'; for (let y = 56; y < H; y += 14) { g.beginPath(); g.arc(128, y, 2, 0, 7); g.fill(); }
    } else if (kind === 'ru') {
      g.fillStyle = '#121216'; g.fillRect(0, 0, W, H); dolphins(g, W, H);
      g.fillStyle = '#d0682a'; g.fillRect(110, 0, 36, H);
      g.strokeStyle = '#000'; g.lineWidth = 3; g.beginPath(); g.moveTo(110, 0); g.lineTo(110, H); g.moveTo(146, 0); g.lineTo(146, H); g.stroke();
    } else if (kind === 'sr') {
      g.fillStyle = '#232a40'; g.fillRect(0, 0, W, H);
      for (let y = 0; y < H; y += 4) { g.fillStyle = 'rgba(255,255,255,.035)'; g.fillRect(0, y, W, 2); }
      g.strokeStyle = '#9a2222'; g.lineWidth = 6; g.beginPath(); g.moveTo(98, 0); g.quadraticCurveTo(128, 46, 158, 0); g.stroke();
      g.strokeStyle = '#ece6d4'; g.lineWidth = 3; g.beginPath(); g.moveTo(104, 0); g.quadraticCurveTo(128, 38, 152, 0); g.stroke();
    } else if (kind && kind[0] === '#') { // plain tee for passers-by: crew neck, maybe stripes; 'p' = police uniform
      g.fillStyle = kind.slice(0, 7); g.fillRect(0, 0, W, H);
      const fl = kind.slice(7);
      if (fl.includes('s')) for (let y = 14; y < H; y += 18) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, y, W, 7); }
      if (fl.includes('c')) { g.fillStyle = '#ffd23a'; g.fillRect(0, 62, W, 12); g.fillStyle = '#ffffff'; g.font = '900 16px Arial'; g.textAlign = 'center'; g.fillText('CONTROLE', 0, 40); g.fillText('CONTROLE', W, 40); g.fillStyle = '#ffd23a'; g.fillRect(104, 26, 14, 10); }
      if (fl.includes('a')) { g.fillStyle = '#f2efe6'; g.fillRect(96, 30, 64, H - 30); g.strokeStyle = '#d8d2c4'; g.lineWidth = 3; g.beginPath(); g.moveTo(100, 30); g.lineTo(84, 0); g.moveTo(156, 30); g.lineTo(172, 0); g.stroke(); g.fillStyle = '#c8402e'; g.font = '900 11px Arial'; g.textAlign = 'center'; g.fillText('SCHMATZEL', 128, 60); }
      if (fl.includes('p')) {
        g.fillStyle = '#d8b040'; g.beginPath(); g.moveTo(104, 30); g.lineTo(112, 26); g.lineTo(120, 30); g.lineTo(118, 42); g.lineTo(112, 46); g.lineTo(106, 42); g.fill();
        g.fillStyle = '#ffffff'; g.fillRect(126, 0, 4, H); g.font = '900 20px Arial'; g.textAlign = 'center'; g.fillText('POLITIE', 0, 50); g.fillText('POLITIE', W, 50);
        g.fillStyle = '#111'; g.fillRect(0, H - 14, W, 10);
      }
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 4; g.beginPath(); g.moveTo(108, 0); g.quadraticCurveTo(128, 18, 148, 0); g.stroke();
    } else {
      g.fillStyle = '#ec7d2c'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#c45e1a'; g.fillRect(104, 0, 6, H); g.fillRect(146, 0, 6, H);
      g.fillStyle = '#ffd36b'; g.beginPath(); g.roundRect(114, 40, 28, 22, 4); g.fill();
      g.fillStyle = '#7a3a0a'; g.font = '900 16px Arial'; g.textAlign = 'center'; g.fillText('N', 128, 57);
    }
  });
}
const HEADS = {
  jr: { skin: 0xe4ab88, hair: '#1d1510', brow: '#20150f', hairLine: 92, sideLine: 120, backLine: 150, curls: true, glasses: true, stubble: true, mouth: 'smile' },
  sr: { skin: 0xdc9c82, hair: '#eceae4', brow: '#c8c4bc', browW: 5, hairLine: 84, sideLine: 116, backLine: 150, squint: true, mouth: 'laugh' },
  ru: { skin: 0xf0c4a2, hair: '#a0602e', brow: '#8a4a22', hairLine: 88, sideLine: 118, backLine: 150, glasses: true, beard: '#a85a28', mouth: 'smile', iris: '#5a7a8a' },
  nak: { skin: 0xe8b890, hair: '#e8792a', brow: '#5a3a1a', hairLine: 80, sideLine: 100, backLine: 110, mouth: 'laugh', iris: '#2a4a8a' },
};
function makePerson(o) {
  // Neon Vice-style model (js/characters.js): a named look, or one derived from these options. ps2: false keeps the old capsule figure
  if (o.ps2 !== false) return makePS2Person(o.ps2 || lookFromPerson(o, HEADS), { scale: o.scale, scene, lazy: !o.ps2 }); // extras finish in the background
  const s = o.scale || 1, belly = o.belly || 0;
  const root = new THREE.Group();
  const body = new THREE.Group(); body.scale.setScalar(s); root.add(body);
  const std = (c, r = 0.75) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const skin = std(o.skin, 0.6);
  const topM = o.front === 'ru' ? new THREE.MeshStandardMaterial({ map: shirtTex('ru'), roughness: 0.8 }) : o.front && o.front[0] === '#' ? std(parseInt(o.front.slice(1, 7), 16), 0.85) : std(o.shirt, 0.85), legsM = std(o.pants, 0.85), shoeM = std(o.shoes, 0.4);
  const add = (geo, m, x, y, z, parent = body) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; parent.add(me); return me; };
  // legs
  const legs = [];
  for (const sx of [-0.11, 0.11]) {
    const leg = new THREE.Group(); leg.position.set(sx, 0.9, 0); body.add(leg);
    add(new THREE.CapsuleGeometry(0.095, 0.6, 4, 10), legsM, 0, -0.4, 0, leg);
    const shoe = add(new THREE.CapsuleGeometry(0.075, 0.16, 4, 10), shoeM, 0, -0.84, 0.05, leg); shoe.rotation.x = Math.PI / 2; shoe.scale.set(1.1, 1, 0.7);
    legs.push(leg);
  }
  // hips + torso (textured cylinder, front at u = 0.5)
  add(new THREE.CylinderGeometry(0.23 + belly * 0.03, 0.21, 0.24, 18), legsM, 0, 0.98, 0).scale.z = 0.78;
  if (o.belt) add(new THREE.CylinderGeometry(0.235 + belly * 0.035, 0.235 + belly * 0.035, 0.06, 18), std(o.belt, 0.4), 0, 1.09, 0).scale.z = 0.8;
  const tm = new THREE.MeshStandardMaterial({ map: shirtTex(o.front), roughness: 0.85 });
  const torso = add(new THREE.CylinderGeometry(0.27, 0.235 + belly * 0.04, 0.56, 20, 1, false, Math.PI, Math.PI * 2), tm, 0, 1.38, 0);
  torso.scale.z = 0.72;
  const capM = (o.front === 'jr' || o.front === 'ru') ? new THREE.MeshStandardMaterial({ map: collarTex(o.front), roughness: 0.85 }) : topM;
  add(new THREE.SphereGeometry(0.27, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), capM, 0, 1.655, 0).scale.set(1, 0.24, 0.72);
  if (belly > 0) { const b = add(new THREE.SphereGeometry(0.24, 16, 12), topM, 0, 1.18, 0.07 + belly * 0.03); b.scale.set(1.0, 0.85, 0.72 + belly * 0.25); }
  if (o.chest) for (const sx of [-1, 1]) { const c = add(new THREE.SphereGeometry(0.1, 14, 10), topM, sx * 0.095, 1.42, 0.13); c.scale.set(1, 0.92, 0.85 * o.chest); }
  if (o.skirt) { const sk = add(new THREE.CylinderGeometry(0.235, 0.34, 0.46, 18), std(o.skirt, 0.8), 0, 0.82, 0); sk.scale.z = 0.85; }
  add(new THREE.CylinderGeometry(0.07, 0.08, 0.14, 12), skin, 0, 1.72, 0);
  // head: smooth ellipsoid with a painted face, nose, curls
  const head = new THREE.Group(); head.position.y = 1.74; head.scale.setScalar(1.28); body.add(head);
  const hc = o.head || HEADS[o.headKind];
  const hm = new THREE.MeshStandardMaterial({ map: paintHead(hc), roughness: 0.6 });
  const hd = add(new THREE.SphereGeometry(0.15, 28, 20), hm, 0, 0.15, 0, head); hd.scale.set(0.92, 1.12, 1.0);
  add(new THREE.SphereGeometry(0.028, 10, 8), skin, 0, 0.13, 0.145, head).scale.set(0.8, 1.1, 1);
  if (o.headKind === 'jr' || o.headKind === 'sr') {
    const hairM = std(o.headKind === 'jr' ? 0x1d1510 : 0xeceae4, 0.9);
    const n = o.headKind === 'jr' ? 46 : 26;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, el = Math.random() * 0.9;
      const r = o.headKind === 'jr' ? 0.05 + Math.random() * 0.02 : 0.045;
      const p = new THREE.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el));
      if (p.z > 0.55 && p.y < 0.55) continue; // keep the face clear
      if (o.headKind === 'sr' && p.y > 0.75) continue;
      add(new THREE.SphereGeometry(r, 8, 6), hairM, p.x * 0.145, 0.2 + p.y * 0.14, p.z * 0.15 - 0.01, head);
    }
  } else if (o.headKind === 'ru') {
    const hairM = std(0xa0602e, 0.85), beardM = std(0xa85a28, 0.9);
    for (let i = 0; i < 30; i++) { const a = Math.random() * Math.PI * 2, el = 0.25 + Math.random() * 0.75; const p = new THREE.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)); if (p.z > 0.5 && p.y < 0.5) continue; add(new THREE.SphereGeometry(0.05, 8, 6), hairM, p.x * 0.14, 0.2 + p.y * 0.13, p.z * 0.14 - 0.01, head); }
    for (let i = 0; i < 26; i++) { const a = -0.15 * Math.PI + Math.random() * 1.3 * Math.PI; const yy = -0.06 + Math.random() * 0.1; add(new THREE.SphereGeometry(0.038, 8, 6), beardM, Math.cos(a) * 0.115, 0.08 + yy, Math.sin(a) * 0.105 + 0.045, head); }
  } else if (o.head) { // passer-by: volume hair, optional long hair / bun
    if (o.feltHat) { // Nabil's green felt hat: wide brim, rope band, a feather
      const fm = std(o.feltHat, 0.95);
      add(new THREE.CylinderGeometry(0.215, 0.205, 0.022, 22), fm, 0, 0.255, 0.005, head).rotation.x = -0.12;
      const cr = add(new THREE.CylinderGeometry(0.125, 0.152, 0.12, 20), fm, 0, 0.325, -0.005, head); cr.scale.z = 1.08;
      add(new THREE.SphereGeometry(0.126, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), fm, 0, 0.383, -0.005, head).scale.set(1, 0.35, 1.08);
      const band = add(new THREE.TorusGeometry(0.147, 0.013, 6, 24), std(0x2f6a3a, 0.9), 0, 0.282, -0.005, head); band.rotation.x = Math.PI / 2;
      const fe = add(new THREE.SphereGeometry(0.05, 10, 6), std(0xb8a898, 1), 0.11, 0.38, -0.05, head); fe.scale.set(0.35, 1.9, 0.6); fe.rotation.set(-0.5, 0, -0.55);
    }
    if (o.cigarette) { // cigarette in the corner of the mouth, with a glowing tip
      const cg = new THREE.Group(); cg.position.set(0.03, 0.085, 0.15); cg.rotation.set(1.15, 0.25, 0); head.add(cg);
      add(new THREE.CylinderGeometry(0.008, 0.008, 0.075, 8), std(0xf4f0e8, 0.8), 0, 0.035, 0, cg);
      add(new THREE.CylinderGeometry(0.0085, 0.0085, 0.012, 8), new THREE.MeshBasicMaterial({ color: 0xff6a20 }), 0, 0.077, 0, cg);
    }
    if (o.ballcap) { // baseball cap
      const dome = add(new THREE.SphereGeometry(0.158, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), std(o.ballcap, 0.7), 0, 0.24, -0.005, head); dome.scale.set(1, 0.75, 1.05);
      const vis = add(new THREE.CylinderGeometry(0.13, 0.13, 0.015, 16, 1, false, -Math.PI / 2, Math.PI), std(o.ballcap, 0.6), 0, 0.245, 0.09, head); vis.scale.z = 1.25;
    }
    if (o.head.beard3d) { const bm = std(parseInt(o.head.beard3d.slice(1), 16), 0.9); for (let i = 0; i < 24; i++) { const a = -0.15 * Math.PI + Math.random() * 1.3 * Math.PI; add(new THREE.SphereGeometry(0.036, 8, 6), bm, Math.cos(a) * 0.112, 0.06 + Math.random() * 0.09, Math.sin(a) * 0.1 + 0.045, head); } }
    if (o.mandarin) { // silk jacket details: gold mandarin collar and three frog buttons down the chest
      const gm = std(o.mandarin, 0.3); const col = add(new THREE.CylinderGeometry(0.09, 0.1, 0.07, 18, 1, true), gm, 0, 1.69, 0); col.scale.z = 0.85;
      for (let k = 0; k < 3; k++) { add(new THREE.BoxGeometry(0.11, 0.022, 0.02), gm, 0, 1.56 - k * 0.11, 0.2); add(new THREE.SphereGeometry(0.016, 8, 6), gm, 0, 1.56 - k * 0.11, 0.212); }
    }
    if (o.chain) { const ch = add(new THREE.TorusGeometry(0.1, 0.012, 6, 18), std(0xe8c040, 0.2), 0, 1.66, 0.05); ch.rotation.x = Math.PI / 2 - 0.35; ch.scale.y = 1.2; }
    if (o.police || o.capColor) { // peaked cap: police navy, or the ticket inspectors' colour
      const cc = o.capColor || 0x1a2440;
      const cap = add(new THREE.CylinderGeometry(0.165, 0.15, 0.1, 18), std(cc, 0.6), 0, 0.31, -0.01, head); cap.scale.z = 1.05;
      add(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 18), std(cc, 0.6), 0, 0.37, -0.01, head);
      const pk = add(new THREE.CylinderGeometry(0.12, 0.12, 0.015, 14, 1, false, -Math.PI / 2, Math.PI), std(0x111111, 0.3), 0, 0.27, 0.07, head); pk.scale.z = 1.2;
      add(new THREE.BoxGeometry(0.05, 0.05, 0.01), std(0xd8b040, 0.3), 0, 0.33, 0.155, head);
    }
    const hairM = std(parseInt(o.head.hair.slice(1), 16), 0.9);
    if (o.head.slick) { // slicked straight back: one smooth glossy cap instead of tufts
      const sm = new THREE.MeshStandardMaterial({ color: parseInt(o.head.hair.slice(1), 16), roughness: 0.25, metalness: 0.1 });
      const cap = add(new THREE.SphereGeometry(0.152, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), sm, 0, 0.165, -0.03, head); cap.scale.set(0.96, 0.82, 1.04); cap.rotation.x = -0.55; // tilted back: hairline high on the forehead, volume at the back
    }
    if (o.head.ponytail) { const pt = add(new THREE.CapsuleGeometry(0.032, 0.13, 4, 8), hairM, 0, 0.13, -0.17, head); pt.rotation.x = 0.35; add(new THREE.SphereGeometry(0.03, 8, 6), hairM, 0, 0.21, -0.155, head); }
    if (!o.head.bald && !o.head.slick) for (let i = 0; i < 22; i++) { const a = Math.random() * Math.PI * 2, el = 0.3 + Math.random() * 0.7; const p = new THREE.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)); if (p.z > 0.45 && p.y < 0.6) continue; add(new THREE.SphereGeometry(0.048, 8, 6), hairM, p.x * 0.14, 0.2 + p.y * 0.13, p.z * 0.14 - 0.01, head); }
    if (o.head.long) { const l = add(new THREE.CapsuleGeometry(0.11, 0.2, 4, 10), hairM, 0, 0.08, -0.08, head); l.scale.set(1.25, 1, 0.7); }
    if (o.head.bun) add(new THREE.SphereGeometry(0.07, 10, 8), hairM, 0, 0.36, -0.07, head);
  } else if (o.headKind === 'nak') {
    const cap = add(new THREE.SphereGeometry(0.16, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), std(0xf2c31a, 0.5), 0, 0.24, 0, head); cap.scale.set(1, 0.7, 1.05);
    add(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 16, 1, false, -Math.PI / 2, Math.PI), std(0xf2c31a, 0.5), 0, 0.24, 0.1, head).scale.z = 1.4;
  }
  // arms
  const arms = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(sx * (0.29 + belly * 0.03), 1.6, 0); body.add(arm);
    add(new THREE.CapsuleGeometry(0.075, 0.24, 4, 10), topM, 0, -0.16, 0, arm);
    add(new THREE.CapsuleGeometry(0.065, 0.22, 4, 10), o.rolled ? skin : topM, 0, -0.46, 0.02, arm);
    add(new THREE.SphereGeometry(0.06, 10, 8), skin, 0, -0.66, 0.03, arm).scale.set(0.8, 1.1, 0.7);
    arm.rotation.z = sx * 0.07;
    arms.push(arm);
  }
  root.userData = { legs, arms, head, body, phase: 0 };
  scene.add(root);
  return root;
}
function animate(p, speed, dt) {
  const u = p.userData;
  if (u.ps2) { ps2Animate(p, speed, dt); return; }
  if (speed > 0.05) {
    u.phase += dt * (5 + speed * 1.2);
    const sw = Math.sin(u.phase) * Math.min(0.7, 0.25 + speed * 0.12);
    u.legs[0].rotation.x = sw; u.legs[1].rotation.x = -sw;
    u.arms[0].rotation.x = -sw * 0.8; u.arms[1].rotation.x = sw * 0.8;
    u.body.position.y = Math.abs(Math.cos(u.phase)) * 0.04;
  } else {
    u.phase += dt * 1.5;
    for (const l of u.legs) l.rotation.x *= 0.8;
    for (const a of u.arms) a.rotation.x *= 0.8;
    u.body.position.y = Math.sin(u.phase) * 0.008;
  }
}

const player = makePerson({ ps2: LOOKS.eddyJr, headKind: 'jr', shirt: 0x86acdf, front: 'jr', pants: 0xe9e4d8, belt: 0x5a3018, shoes: 0x6a3a1c, belly: 1, skin: 0xe4ab88 });
const START_POS = new THREE.Vector3(-4.4, 0, -16.3); // a new game starts inside the warehouse (Eddy's place), next to the old PC
player.position.copy(START_POS); player.rotation.y = 0.5;
const dad = makePerson({ ps2: LOOKS.eddySr, headKind: 'sr', shirt: 0x232a40, front: 'sr', pants: 0x4a4a52, shoes: 0x2a2018, belly: 0.6, skin: 0xdc9c82, scale: 0.96 });
const DAD_IN = new THREE.Vector3(-2.5, 0, -12.9), DAD_OUT = new THREE.Vector3(-1.6, 0, -6.0); // waits inside, then stands out front
dad.position.copy(DAD_IN); dad.rotation.y = -2.6;
const dadSolid = solid(DAD_IN.x - 0.35, DAD_IN.x + 0.35, DAD_IN.z - 0.35, DAD_IN.z + 0.35);
function placeDadSolid(p) { Object.assign(dadSolid, { minx: p.x - 0.35, maxx: p.x + 0.35, minz: p.z - 0.35, maxz: p.z + 0.35 }); }
function dadOutside() { dad.position.copy(DAD_OUT); dad.rotation.y = -Math.PI * 0.75; placeDadSolid(DAD_OUT); dadSolid.off = false; dad.userData.walkTo = null; }
// The Russian (same look and vibe as Nine of Nine in Neon Vice), behind the counter of his pawnshop like a Stalker trader
const RU = { x: (PS.x0 + PS.x1) / 2, z: -12.3 };
const russian = makePerson({ ps2: LOOKS.russian, headKind: 'ru', shirt: 0x121216, front: 'ru', pants: 0x2a2c3a, shoes: 0x1e1814, belly: 0.9, skin: 0xf0c4a2, scale: 1.02 });
russian.position.set(RU.x, 0, RU.z); russian.rotation.y = 0;
const shop = new THREE.Group(); scene.add(shop);
const shopRoof = new THREE.Group(); shop.add(shopRoof);
const shopFrontHigh = new THREE.Group(); shop.add(shopFrontHigh);
const shopLights = [];
let shopDoorOpen = 0, shopDoorTarget = 0, shopDoor, shopDoorSolid;
{
  const W0 = PS.x0, W1 = PS.x1, Z0 = PS.z0, Z1 = PS.z1, H = PS.h, cx = (W0 + W1) / 2, cz = (Z0 + Z1) / 2;
  const outer = clapMat(0x7a4ab0), inner = pbr('plaster2.jpg', 2, 1, 0x6a6458, 0.95, 0.5), dark = lam({ color: 0x1a1a1e });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W1 - W0, Z1 - Z0), pbr('concrete_floor.jpg', 2, 2, 0x8a8478, 0.85, 0.5));
  fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0.03, cz); fl.receiveShadow = true; shop.add(fl);
  // walls: brick outside, grubby plaster inside
  box(W1 - W0, H, 0.3, inner, cx, H / 2, Z0, shop); solid(W0, W1, Z0 - 0.2, Z0 + 0.15);
  for (const x of [W0, W1]) { box(0.3, H, Z1 - Z0, inner, x, H / 2, cz, shop); solid(x - 0.15, x + 0.15, Z0, Z1); }
  const front = (x0, x1) => {
    box(x1 - x0, H - 0.7, 0.3, outer, (x0 + x1) / 2, 0.7 + (H - 0.7) / 2, Z1, shopFrontHigh);
    box(x1 - x0, 0.7, 0.3, outer, (x0 + x1) / 2, 0.35, Z1, shop); solid(x0, x1, Z1 - 0.15, Z1 + 0.15);
  };
  front(W0, PS.doorX0); front(PS.doorX1, W1);
  box(PS.doorX1 - PS.doorX0, H - 2.4, 0.3, outer, (PS.doorX0 + PS.doorX1) / 2, 2.4 + (H - 2.4) / 2, Z1, shopFrontHigh);
  // shop window with bars, dark inside
  box(2.6, 1.5, 0.06, winMat, W0 + 1.8, 1.55, Z1 + 0.17, shopFrontHigh, false);
  for (let i = 0; i < 6; i++) box(0.04, 1.5, 0.04, mat.dark, W0 + 0.65 + i * 0.46, 1.55, Z1 + 0.24, shopFrontHigh, false);
  box(2.6, 1.5, 0.06, winMat, W1 - 1.4, 1.55, Z1 + 0.17, shopFrontHigh, false);
  // door (hinged on the left), green paint, brass knob
  const hinge = new THREE.Group(); hinge.position.set(PS.doorX0, 0, Z1 + 0.05); shop.add(hinge);
  box(PS.doorX1 - PS.doorX0, 2.35, 0.08, lam({ color: 0x24402e }), (PS.doorX1 - PS.doorX0) / 2, 1.18, 0, hinge);
  box(0.9, 0.7, 0.09, winMat, (PS.doorX1 - PS.doorX0) / 2, 1.75, 0.01, hinge, false);
  cyl(0.05, 0.05, 0.08, lam({ color: 0xd8b040 }), PS.doorX1 - PS.doorX0 - 0.18, 1.1, 0.07, hinge).rotation.x = Math.PI / 2;
  shopDoor = hinge; shopDoorSolid = solid(PS.doorX0, PS.doorX1, Z1 - 0.15, Z1 + 0.15);
  // façade: neon sign, OPEN sign, door mat, pink glow
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 0.95), lam({ map: signTex([{ t: 'PANDJESHUIS SPASIBO', size: 40 }], '#140818', '#e8a33d'), emissive: 0x401030 }));
  sg.position.set(cx, 3.3, Z1 + 0.18); shopFrontHigh.add(sg);
  const op = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.35), lam({ map: signTex([{ t: 'OPEN', size: 70 }], '#000000', '#a9c46a', 256, 100), emissive: 0x206070 }));
  op.position.set(W1 - 1.4, 2.0, Z1 + 0.22); shopFrontHigh.add(op);
  const neon = new THREE.PointLight(0xe8862c, 2.5, 7); neon.position.set(cx, 3.0, Z1 + 1.0); scene.add(neon);
  box(1.3, 0.02, 0.8, lam({ color: 0x3a2a1a }), (PS.doorX0 + PS.doorX1) / 2, 0.03, Z1 + 0.6, scene, false);
  neonRect(shopFrontHigh, W0 + 1.8, 1.55, 2.75, 1.65, Z1 + 0.26, 0xf2c14e); poster(shop, PS.doorX1 + 0.5, 1.5, Z1 + 0.17, 2); graffiti(shop, W1 - 1.6, 0.35, Z1 + 0.17, 0, 1.6);
  bladeSign(shopFrontHigh, W1 - 0.4, 3.0, Z1, 'GUNS', 0xe8862c);
  // flat roof with a parapet and an AC unit (hidden while you're inside)
  box(W1 - W0 + 0.4, 0.3, Z1 - Z0 + 0.4, lam({ map: tex('roof_rust.jpg', 3, 3), color: 0x6a6a6a }), cx, H + 0.15, cz, shopRoof);
  box(1.4, 0.8, 1.0, lam({ color: 0x9aa0a4 }), W0 + 2, H + 0.7, Z0 + 2, shopRoof);
  box(W1 - W0 + 0.4, 0.6, 0.3, outer, cx, H + 0.6, Z1 + 0.1, shopFrontHigh);

  // ---- inside: Stalker-trader bunker. Counter across the room, The Russian behind it, guns on the wall.
  const CZc = -10.9; // counter line
  const wood = mat.wood, metal = lam({ color: 0x4a4e52 }), olive = lam({ color: 0x4a5236 });
  box(W1 - W0 - 2.6, 1.05, 0.8, wood, cx, 0.53, CZc, shop); box(W1 - W0 - 2.4, 0.08, 1.0, lam({ color: 0x3a2618 }), cx, 1.09, CZc, shop);
  box(1.3, 1.05, 0.8, metal, W0 + 0.8, 0.53, CZc, shop); box(1.3, 1.05, 0.8, metal, W1 - 0.8, 0.53, CZc, shop);
  solid(W0, W1, CZc - 0.45, CZc + 0.45);
  // a security grille on the left half of the counter
  for (let i = 0; i < 9; i++) cyl(0.015, 0.015, 1.2, metal, W0 + 1.6 + i * 0.25, 1.7, CZc - 0.05);
  box(2.2, 0.04, 0.04, metal, W0 + 2.6, 2.3, CZc - 0.05, shop);
  // things on the counter: cash register, desk lamp, a pistol on a cloth, ammo boxes, a TV
  box(0.5, 0.3, 0.45, lam({ color: 0x2a2a2e }), cx + 1.6, 1.28, CZc, shop); box(0.44, 0.18, 0.06, lam({ color: 0x80ffa0, emissive: 0x206030 }), cx + 1.6, 1.5, CZc + 0.2, shop, false);
  cyl(0.12, 0.14, 0.04, metal, cx - 1.4, 1.15, CZc - 0.1, shop); cyl(0.02, 0.02, 0.45, metal, cx - 1.4, 1.38, CZc - 0.1, shop);
  const shade_ = cyl(0.04, 0.16, 0.18, lam({ color: 0x2e5a3a }), cx - 1.25, 1.6, CZc - 0.1, shop); shade_.rotation.z = -0.5;
  const lampL = new THREE.PointLight(0xffc070, 0, 6, 1.6); lampL.position.set(cx - 1.1, 1.45, CZc); shop.add(lampL); shopLights.push([lampL, 2.6]);
  box(0.6, 0.02, 0.4, lam({ color: 0x6a1a1a }), cx - 0.3, 1.14, CZc + 0.1, shop, false);
  box(0.3, 0.12, 0.05, mat.black, cx - 0.3, 1.2, CZc + 0.1, shop, false); box(0.07, 0.14, 0.05, mat.black, cx - 0.4, 1.12, CZc + 0.1, shop, false);
  for (let i = 0; i < 3; i++) box(0.22, 0.12, 0.14, lam({ color: [0x8a6a2a, 0x2a4a2a, 0x8a6a2a][i] }), cx + 0.5 + i * 0.26, 1.19 + (i === 1 ? 0.12 : 0), CZc + 0.1, shop);
  box(0.6, 0.5, 0.5, lam({ color: 0x2a2826 }), W1 - 1.0, 1.35, CZc - 0.1, shop);
  const tvS = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.36), lam({ color: 0x5a8a9a, emissive: 0x2a4a5a })); tvS.position.set(W1 - 1.0, 1.37, CZc + 0.16); shop.add(tvS);
  // the gun wall: pegboard, rifles, shotguns, pistols, and the Golden AK under a spotlight
  const peg = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#5a4a36'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.45)'; for (let y = 6; y < h; y += 12) for (let x = 6; x < w; x += 12) g.fillRect(x, y, 3, 3); });
  const pegM = lam({ map: peg });
  const wallZ = Z0 + 0.2;
  box(W1 - W0 - 1.0, 2.8, 0.06, pegM, cx, 2.0, wallZ, shop, false);
  const gunM = lam({ color: 0x1c1c1e }), woodG = lam({ color: 0x6a3a1a });
  function rifle(x, y, len = 1.3, gold = false) {
    const g = new THREE.Group(); g.position.set(x, y, wallZ + 0.08); shop.add(g);
    const body = gold ? lam({ color: 0xd8a830, emissive: 0x4a3008 }) : gunM;
    box(len * 0.55, 0.09, 0.05, body, 0, 0, 0, g, false);
    box(len * 0.3, 0.05, 0.04, body, len * 0.42, 0.01, 0, g, false);
    box(len * 0.28, 0.12, 0.05, gold ? body : woodG, -len * 0.38, -0.02, 0, g, false);
    box(0.06, 0.22, 0.05, body, len * 0.1, -0.14, 0, g, false).rotation.z = 0.25;
    box(0.07, 0.15, 0.05, gold ? body : woodG, -len * 0.08, -0.1, 0, g, false);
    return g;
  }
  for (let i = 0; i < 3; i++) { rifle(cx - 2.2, 3.0 - i * 0.55); rifle(cx + 2.2, 3.0 - i * 0.55, 1.15); }
  rifle(cx, 2.9, 1.45, true);
  const gold = new THREE.SpotLight(0xffe0a0, 0, 5, 0.35, 0.5); gold.position.set(cx, 4.4, wallZ + 1.2); gold.target.position.set(cx, 2.9, wallZ); shop.add(gold, gold.target); shopLights.push([gold, 14]);
  const goldTag = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), lam({ map: signTex([{ t: 'NOT FOR SALE', size: 54 }], '#000', '#ffd36b', 256, 64) }));
  goldTag.position.set(cx, 2.55, wallZ + 0.1); shop.add(goldTag);
  for (let i = 0; i < 4; i++) { const p = new THREE.Group(); p.position.set(cx - 0.75 + i * 0.5, 1.95, wallZ + 0.08); shop.add(p); box(0.22, 0.07, 0.04, gunM, 0, 0, 0, p, false); box(0.06, 0.14, 0.04, i === 2 ? woodG : gunM, -0.07, -0.08, 0, p, false); }
  // shelves on the side walls: green army crates, ammo cans, a stuffed dolphin
  for (const sx of [W0 + 0.5, W1 - 0.5]) {
    for (const y of [0.9, 1.8, 2.7]) box(0.7, 0.06, 3.6, wood, sx, y, Z0 + 2.4, shop);
    for (let i = 0; i < 6; i++) box(0.5, 0.32, 0.5, [olive, lam({ color: 0x3a4228 }), metal][i % 3], sx, 1.1 + (i % 3) * 0.9, Z0 + 1.0 + Math.floor(i / 3) * 2.2, shop);
    solid(sx - 0.4, sx + 0.4, Z0, Z0 + 4.3);
  }
  const dol = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.45, 4, 10), lam({ color: 0x7aa0c8 })); dol.rotation.z = Math.PI / 2; dol.position.set(W1 - 0.5, 3.0, Z0 + 2.4); shop.add(dol);
  // customer side: a couple of crates, a chair, a "NO CREDIT" sign
  box(0.7, 0.6, 0.7, olive, W0 + 0.8, 0.3, Z1 - 1.0, shop); box(0.6, 0.5, 0.6, olive, W0 + 0.85, 0.85, Z1 - 1.05, shop); solid(W0 + 0.4, W0 + 1.2, Z1 - 1.4, Z1 - 0.6);
  const nc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.4), lam({ map: signTex([{ t: 'NO CREDIT · NO RECEIPTS', size: 30 }], '#e8e2d0', '#8a1010', 512, 128) }));
  nc.position.set(cx, 3.95, wallZ + 0.1); shop.add(nc);
  // light: one bare bulb on a wire + a pink neon strip, only lit while you're inside
  cyl(0.008, 0.008, 1.4, mat.black, cx + 0.8, H - 0.7, Z1 - 2.3, shop);
  const bulbM = lam({ color: 0xffe0a0, emissive: 0x806020 }); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), bulbM); bulb.position.set(cx + 0.8, H - 1.45, Z1 - 2.3); shop.add(bulb);
  const bulbL = new THREE.PointLight(0xffd8a0, 0, 10, 1.4); bulbL.position.copy(bulb.position); shop.add(bulbL); shopLights.push([bulbL, 2.6]);
  box(W1 - W0 - 1.2, 0.05, 0.05, lam({ color: 0xe8862c, emissive: 0xe8862c }), cx, H - 0.25, Z0 + 0.3, shop, false);
  const wallL = new THREE.PointLight(0xffd8a8, 0, 7, 1.4); wallL.position.set(cx, 3.6, Z0 + 1.6); shop.add(wallL); shopLights.push([wallL, 3.2]);
  const pinkL = new THREE.PointLight(0xe8862c, 0, 8, 1.6); pinkL.position.set(cx, H - 0.5, Z0 + 1.0); shop.add(pinkL); shopLights.push([pinkL, 1.4]);
}
const isInShop = (p) => p.x > PS.x0 && p.x < PS.x1 && p.z > PS.z0 && p.z < PS.z1 - 0.1;
function openShopDoor() { shopDoorTarget = 1; shopDoorSolid.off = true; beep(320, 0.12, 'triangle', 0.04); setTimeout(() => beep(1320, 0.25, 'sine', 0.03), 120); }

await bootStep(56, 'Booting Kaasdows XL…');
// ------------------------------------------------------------------ junk, desk, PC, mixing table
const junkDefs = [
  { id: 'doner', name: 'Döner Grill Turbo 3000', price: 650, x: -9.4, z: -9.6 },
  { id: 'fryer', name: 'Deep fryer "De Vetput"', price: 320, x: -5.6, z: -10.6 },
  { id: 'griddle', name: 'Griddle (rusty edges)', price: 280, x: -1.2, z: -9.8 },
  { id: 'fridge', name: 'Shoarma display fridge (leaks a bit)', price: 540, x: -0.9, z: -14.2 },
  { id: 'buckets', name: '14 buckets of garlic sauce (empty?)', price: 90, x: -9.6, z: -14.0 },
  { id: 'oven', name: 'Pita oven "Vulkaan"', price: 470, x: -5.0, z: -15.0 },
];
function buildJunk(d) {
  const g = new THREE.Group(); g.position.set(d.x, 0, d.z); scene.add(g);
  if (d.id === 'doner') {
    box(0.9, 0.12, 0.9, mat.steel, 0, 0.06, 0, g); box(0.9, 1.9, 0.12, mat.steel, 0, 1.0, -0.4, g);
    cyl(0.03, 0.03, 1.9, mat.steel, 0, 1.0, 0, g, 6);
    cyl(0.2, 0.3, 1.1, lam({ color: 0x8a4a22, flatShading: true }), 0, 1.0, 0, g, 9);
    box(0.7, 1.2, 0.05, lam({ color: 0xff5a22, emissive: 0x401000 }), 0, 1.0, -0.33, g, false);
  } else if (d.id === 'fryer') {
    box(1.0, 0.95, 0.75, mat.steel, 0, 0.48, 0, g);
    box(0.85, 0.02, 0.6, lam({ color: 0x8a6a1a }), 0, 0.97, 0, g, false);
    for (const x of [-0.22, 0.22]) { box(0.36, 0.25, 0.5, lam({ color: 0x777777, wireframe: true }), x, 1.1, 0, g, false); box(0.05, 0.05, 0.4, mat.black, x, 1.2, 0.45, g, false); }
  } else if (d.id === 'griddle') {
    box(1.4, 0.85, 0.8, mat.steel, 0, 0.43, 0, g); box(1.35, 0.06, 0.75, lam({ color: 0x2a2624 }), 0, 0.89, 0, g);
    box(0.2, 0.25, 0.25, lam({ color: 0x8a3a1a }), 0.5, 0.9, 0.1, g);
  } else if (d.id === 'fridge') {
    box(1.6, 0.8, 0.8, mat.steel, 0, 0.4, 0, g);
    const gl = box(1.55, 0.6, 0.75, new THREE.MeshPhongMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.35, shininess: 100 }), 0, 1.1, 0, g, false);
    for (let i = 0; i < 3; i++) box(0.35, 0.12, 0.3, lam({ color: [0xd06040, 0x80a040, 0xe0d0a0][i] }), -0.45 + i * 0.45, 0.9, 0, g);
  } else if (d.id === 'buckets') {
    for (let i = 0; i < 6; i++) { const c = cyl(0.22, 0.19, 0.42, lam({ color: 0xf2f2ee }), (i % 3) * 0.48 - 0.48, 0.21 + Math.floor(i / 3) * 0.42, (i % 2) * 0.12, g, 10); }
    for (let i = 0; i < 3; i++) box(0.3, 0.08, 0.02, lam({ color: [0xd03020, 0x30a040, 0xe0c020][i] }), (i % 3) * 0.48 - 0.48, 0.25, 0.22, g, false);
  } else if (d.id === 'oven') {
    box(1.2, 1.1, 1.0, mat.steel, 0, 0.55, 0, g); box(0.8, 0.35, 0.05, lam({ color: 0x1a1a1a, emissive: 0x401000 }), 0, 0.65, 0.51, g, false);
    cyl(0.12, 0.12, 0.8, mat.steel, 0.35, 1.5, -0.3, g, 8);
  }
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), lam({ map: signTex([{ t: 'FOR SALE', size: 54 }], '#ffd36b', '#7a1a14', 256, 128), side: THREE.DoubleSide }));
  tag.position.set(0, 2.2, 0.2); tag.visible = false; g.add(tag);
  d.group = g; d.tag = tag; d.solid = solid(d.x - 0.8, d.x + 0.8, d.z - 0.55, d.z + 0.55);
  return g;
}
junkDefs.forEach(buildJunk);
// desk with the Kaasdows XL PC
const desk = new THREE.Group(); desk.position.set(-8.8, 0, -19.6); scene.add(desk);
box(2.4, 0.08, 1.0, mat.wood, 0, 0.78, 0, desk); for (const [x, z] of [[-1.1, -0.42], [1.1, -0.42], [-1.1, 0.42], [1.1, 0.42]]) box(0.07, 0.78, 0.07, mat.wood, x, 0.39, z, desk);
const beige = lam({ color: 0xd8d0b8 });
box(0.62, 0.52, 0.55, beige, 0, 1.12, -0.12, desk); box(0.45, 0.12, 0.3, beige, 0, 0.86, -0.12, desk);
const screenTex = canvasTex(128, 96, (g) => { const sky = g.createLinearGradient(0, 0, 0, 84); sky.addColorStop(0, '#2a6ad8'); sky.addColorStop(1, '#a9d0ff'); g.fillStyle = sky; g.fillRect(0, 0, 128, 84); // Kaasdows XL: sky, a green polder, the blue taskbar
  g.fillStyle = '#4fa83a'; g.beginPath(); g.moveTo(0, 70); g.quadraticCurveTo(50, 52, 128, 66); g.lineTo(128, 84); g.lineTo(0, 84); g.fill(); g.fillStyle = '#2663e0'; g.fillRect(0, 84, 128, 12); g.fillStyle = '#3fae3f'; g.fillRect(0, 84, 30, 12);
  g.fillStyle = '#fff'; g.font = 'bold 13px Arial'; g.fillText('Kaasdows XL', 26, 40); for (let i = 0; i < 3; i++) { g.fillStyle = ['#ff9a2e', '#f6c12a', '#3b8de0'][i]; g.fillRect(8, 8 + i * 22, 12, 12); } });
const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.38), lam({ map: screenTex, emissive: 0x1a3a7a, emissiveMap: screenTex }));
screen.position.set(0, 1.14, 0.16); desk.add(screen);
box(0.6, 0.04, 0.22, beige, 0, 0.84, 0.3, desk);
box(0.6, 0.08, 0.6, lam({ color: 0x333338 }), 0, 0.5, 1.0, desk); box(0.6, 0.7, 0.08, lam({ color: 0x333338 }), 0, 0.9, 1.3, desk);
const pcGlow = new THREE.PointLight(0x5ad0d0, 0.8, 4); pcGlow.position.set(0, 1.3, 0.8); desk.add(pcGlow);
solid(-10.05, -7.55, -20.15, -19.05);
// mixing table (appears after buying)
const mixTable = new THREE.Group(); mixTable.position.set(-4.6, 0, -12.6); mixTable.visible = false; scene.add(mixTable);
box(2.6, 0.08, 1.3, mat.steel, 0, 0.92, 0, mixTable); for (const [x, z] of [[-1.2, -0.55], [1.2, -0.55], [-1.2, 0.55], [1.2, 0.55]]) box(0.07, 0.92, 0.07, mat.steel, x, 0.46, z, mixTable);
cyl(0.45, 0.3, 0.35, mat.steel, 0, 1.13, 0, mixTable, 14);
const spiceInBowl = cyl(0.42, 0.42, 0.04, lam({ color: 0xc8641e }), 0, 1.28, 0, mixTable, 14);
for (const [x, c] of [[-0.95, 0xd03a1a], [0.95, 0xe2b21a], [-0.6, 0x7a4a1e]]) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.3, 8), lam({ color: c })); p.position.set(x, 1.1, x < -0.8 ? 0.3 : -0.3); mixTable.add(p); }
for (let i = 0; i < 4; i++) box(0.5, 0.7, 0.4, lam({ color: 0xc8b48a }), -3.2 + (i % 2) * 0.55, 0.35 + Math.floor(i / 2) * 0.7, -0.3, mixTable);
let mixSolid = null;

// ------------------------------------------------------------------ UI
const $ = (id) => document.getElementById(id);
const ui = { money: $('money'), income: $('income'), obj: $('objective'), prompt: $('prompt'), toast: $('toast') };
const state = { step: 'title', money: 0, shown: 0, listed: new Set(), sold: new Set(), table: false, naknik: 0, income: 0, mapSeen: false, inDialogue: false, inPC: false, kit: [], metRussian: false,
  raids: 0, loan: { amount: 1000, out: false, at: 0 }, metNabil: false, metSchmatzel: false, armed: false };
function setObjective(t) { ui.obj.innerHTML = t; }
let toastT = 0;
function toast(big, small = '', t = 2.6) { if (hub) hub.noteToast(big); ui.toast.innerHTML = big + (small ? `<small>${small}</small>` : ''); ui.toast.style.display = 'block'; toastT = t; }
function addMoney(n, fromEl) {
  if (stats) stats.money(n);
  if (hub) hub.noteMoney(n, fromEl && fromEl.textContent ? fromEl.textContent.replace(/\s+/g, ' ').replace(/\(.*$/, '').trim().slice(0, 40) : (state.inPC && pcTab && $('pc').style.display === 'block' ? (icons.find(([id]) => id === pcTab) || [, , ''])[2] : ''));
  state.money += n; beep(880, 0.08); setTimeout(() => beep(1320, 0.1), 90);
  const f = document.createElement('div'); f.className = 'fly'; f.textContent = (n >= 0 ? '+W ' : '-W ') + Math.abs(n);
  const r = fromEl ? fromEl.getBoundingClientRect() : { left: innerWidth - 220, top: 70 };
  f.style.left = r.left + 'px'; f.style.top = r.top + 'px'; document.body.appendChild(f);
  requestAnimationFrame(() => { f.style.transform = 'translateY(-60px)'; f.style.opacity = '0'; });
  setTimeout(() => f.remove(), 1300);
  // Never rebuild the Kaasdows window here: Wilders also arrive on their own (Naknik income every 6 sec, crew errands),
  // and a rebuild mid-click swallowed the click, closed open dropdowns and threw away what Eddy was doing in the PC.
  // PC buttons re-render the window themselves; passive income only updates the balance and what it can now pay for.
  if (state.inPC) refreshPCMoney();
}
function refreshPCMoney() {
  const pc = $('pc'), w = 'W ' + state.money.toLocaleString('nl-NL');
  pc.querySelectorAll('[data-bal]').forEach((e) => { e.textContent = w; });
  pc.querySelectorAll('button[data-need]').forEach((b) => { b.disabled = state.money < +b.dataset.need; });
}
let actx = null;
function beep(freq, dur, type = 'square', vol = 0.05) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
  } catch (e) { /* audio is optional */ }
}

// dialogue
const faces = { 'Johan': './assets/face_johan.jpg', 'Tryshtahn': './assets/face_tryshtahn.jpg', 'Jossi': './assets/face_jossi.jpg', 'Freddy Sr.': './assets/face_sr.jpg', 'Freddy Sr. (telefoon)': './assets/face_sr.jpg', 'Eddy Jr.': './assets/face_jr.jpg', 'The Russian': './assets/face_ru.jpg', 'Naknik': null, 'Nabil': './assets/face_nabil.jpg', 'Schmatzel': null, 'Hakan (telefoon)': './assets/face_hakan.jpg', 'Shooki': './assets/face_shooki.jpg', 'Shooki (telefoon)': './assets/face_shooki.jpg', 'Razim (telefoon)': './assets/face_razim.jpg', 'Razim': './assets/face_razim.jpg', 'Henk Cijfer': './assets/face_henk.jpg', 'Henk Cijfer (telefoon)': './assets/face_henk.jpg', 'Van der Belasting': './assets/face_belasting.jpg' };
Object.assign(faces, BLK_FACES); Object.assign(faces, REG_FACES, { 'Bram met de Bakfiets (telefoon)': REG_FACES['Bram met de Bakfiets'], 'Monteur Mo': './assets/face_mo.jpg', 'Monteur Mo (telefoon)': './assets/face_mo.jpg', 'Wijkagent Bakker': './assets/face_bakker.jpg', 'Wijkagent Bakker (telefoon)': './assets/face_bakker.jpg', 'Wijkagent': './assets/face_bakker.jpg', 'Wijkagent (telefoon)': './assets/face_bakker.jpg', 'Naknik': './assets/face_naknik1.jpg', 'Naknik (telefoon)': './assets/face_naknik1.jpg', 'Creplach': './assets/face_creplach.jpg', 'Creplach (telefoon)': './assets/face_creplach.jpg', 'Ome Joop': './assets/face_joop.jpg', 'Ome Joop (telefoon)': './assets/face_joop.jpg', 'Kevin': './assets/face_kevin.jpg', 'Kevin (telefoon)': './assets/face_kevin.jpg', 'Slager Bram': './assets/face_slager.jpg', 'Slager Bram (telefoon)': './assets/face_slager.jpg', 'De Fluisteraar': './assets/face_fluister.jpg', 'De Fluisteraar (telefoon)': './assets/face_fluister.jpg', 'Naknikim': './assets/face_naknik2.jpg' }); // drawn portraits (tools/portraits/cast.js)
let dlgQueue = [], dlgDone = null;
const portraits = createPortraits($('dlgface'));
let dlgClosedAt = 0; // when the last dialogue closed (js/bikes.js: the E that closed it must not also open the car door)
function dialogue(lines, done) { if (freddy) lines = freddy.chime(lines); dlgQueue = lines.slice(); // Pa adds his word when he is there (js/freddy.js)
  dlgDone = done; state.inDialogue = true; nextLine(); }
function nextLine() {
  if (!dlgQueue.length) { $('dialogue').style.display = 'none'; state.inDialogue = false; dlgClosedAt = performance.now(); const d = dlgDone; dlgDone = null; if (d) d(); return; }
  const [who, line] = dlgQueue.shift();
  $('dlgwho').textContent = who; $('dlgline').textContent = line; { const ml = line.includes('\n'); $('dlgline').style.whiteSpace = ml ? 'pre-line' : ''; $('dlgline').style.unicodeBidi = ml ? 'plaintext' : ''; } // a Hebrew line + transliteration (js/activists.js)
  const f = faces[who];
  $('dlgface').style.display = f ? 'block' : 'none'; if (f) $('dlgface').src = f; $('dialogue').classList.toggle('noface', !f); portraits.show(f, line);
  $('dialogue').style.display = 'block'; beep(520, 0.04, 'triangle');
}
$('dialogue').addEventListener('click', nextLine);

// ------------------------------------------------------------------ Kaasdows XL
const BUYERS = ['Snackbar Bij Henk', 'Mo van de markt', 'Grillroom Zuid', 'Tante Gerda', 'Frituur Het Gouden Frietje', 'Restaurant De Lepel', 'Anonymous (Lampas?)', 'Kees from Spekbuurt'];
const bids = {};
function bidFor(d) { if (!bids[d.id]) bids[d.id] = { who: BUYERS[Math.floor(Math.random() * BUYERS.length)], amount: Math.round(d.price * (0.9 + Math.random() * 0.25) / 5) * 5 }; return bids[d.id]; }
const TABLE_COST = 600, NAKNIK_COST = 450, NAKNIK_INCOME = 0;
// balance 2026-11-19, the slow start: a Hulpje runs one Naknik, a Mengmeester two, a Kruidenhandelaar as many as there are tables
const NAK_BY_RANK = [1, 2];
const nakCap = () => Math.min(loods.naknikCap(), rankNow() < NAK_BY_RANK.length ? NAK_BY_RANK[rankNow()] : Infinity); // balance 2026-11-15: no passive timer, Naknikim earn by mixing
let pcTab = 'sell', pcMode = 'pc';
const LOOT_PRICE = 150;
const icons = [['sell', 'K', 'Kaasplaats'], ['hire', 'N', 'Naknik Uitzendbureau'], ['shop', 'M', 'Buy mixing table'], ['beurs', '%', 'Kruidenbeurs'], ['meng', 'B', 'Mengkamer'], ['rapport', 'D', 'Dagrapport'], ['jobs', 'J', 'Klusbord'], ['ideas', 'I', 'Ideeënboek'], ['werk', '⚙', 'Werkplaats'], ['garage', 'G', 'Garage Mo'], ['plan', 'P', 'Plannenbord'], ['map', '⌖', 'Map of Kaasland'], ['woning', 'H', 'Woning'], ['loods', '▦', 'De Loods'], ['bank', 'W', 'My Wilders'], ['krant', 'K', 'Krant voor het Kaasvolk'], ['buurt', 'B', 'Buurtkaart'], ['bills', '€', 'Rekeningen'], ['rep', '♥', 'Buurten'], ['media', '♪', 'Mediaspeler']];
// the spice economy (js/economy.js): market days, the Kruidenbeurs and warehouse stock. Owned territories make the home market cheaper.
let freddy = null; // js/freddy.js, set up once the phone exists
let activists = null; // js/activists.js, set up after Freddy
let blokaas = null; // js/blokaas.js, set up after the activists
let npcs = null; // js/npcs.js, set up once the street and the mission engine exist
let phone = null; // js/phone.js, Hakan's kipkraud calls
const econ = createEconomy({ onKg: (kg) => { if (top10) top10.sold(kg); }, onBuy: (id, kg) => { if (blokaas) blokaas.onOrder(id, kg); }, onSale: (cid, ok) => brep && brep.sale(cid, ok), onGroup: (n, ok) => brep && brep.group(n, ok), sellBias: (cid) => (brep ? brep.sellBias(cid) : 1) * (blokaas ? blokaas.sellBias(cid) : 1) * (top10 ? top10.sellBias() : 1), groupBias: (n) => (brep ? brep.groupBias(n) : 1), heatBias: (f) => (brep ? brep.heatBias(f) : 0), homeCrew: () => crew.working(), helpKg: () => (prod ? prod.helpKg() : 0), boost: () => { const b = loods ? loods.boost() : {}; if (woning && woning.hokStorage()) b.cap = (b.cap || 0) + 80; return b; }, state, addMoney, toast, tip: (k) => { tips.show(k); if (k === 'order' && vandaag) vandaag.note('order'); }, endDay: () => endDay(), onPlan: () => { updateObjective(); }, spoed: (j, el) => (spoed ? spoed.offer(j, el) : null), holdArrivals: () => !!goederen && state.step === 'free' && !(state.tut && !state.tut.done), onDay: (d) => { if (klok) klok.newDay(); if (goederen) goederen.onDay(d); if (spoed) spoed.onDay(d); if (brep) brep.onDay(d); if (bills) { bills.onDay(d); if (stats && (d - 1) % 7 === 0 && state.bills.last && state.bills.last.paid === true && state.bills.last.week === bills.weekOf(d) - 1) stats.add('billsPaid'); } if (winkels) winkels.onDay(d); if (stam) stam.onDay(d); if (top10) top10.onDay(d); if (stats) stats.onDay(d); if (ui.obj) updateObjective(); }, daily: () => { const d = dailyChallenge(); return d && { date: d.date, name: JOINTS.find(([, id]) => id === d.id)[0], mod: mission.REMIX_MODS[d.remix.mod].name, best: state.daily && state.daily.date === d.date ? state.daily.best : 0 }; }, save: () => writeSave(), siege: true, away: () => (Array.isArray(state.crew) ? state.crew.filter((c) => c && c.away).length : 0), extraJobs: () => (state.ws && state.ws.pc && state.ws.pc.ram ? 1 : 0), joints: () => ['schmatzel', ...JOINTS.filter(([, id]) => owns(id)).map(([, id]) => id)], discount: () => d1Owned() * 0.03 + (state.district1 ? 0.06 : 0),
  demand: (d) => (world ? world.demand(d) : 1), priceBias: (id, d) => (world ? world.priceBias(id, d) : 1), truckLate: (d) => !!(world && world.truckLate(d)), weatherName: () => (world ? world.weather().name : 'Bad weather'), // Kaasland leeft (js/kaasweer.js)
  dayLine: () => (world ? `${world.weather().icon} ${world.cal().wdName}, ${world.weather().name.toLowerCase()} ${world.weather().temp}°${world.cal().holi ? `, ${world.cal().holi.name}` : ''}. ` : ''),
  onRaid: (r) => { if (world) world.note('raid', { id: r.id, name: (JOINTS.find(([, id]) => id === r.id) || [r.id])[0], grade: r.grade, remix: !!r.remix }); }, onStrikes: (s) => { if (world) world.note('strike', { text: s.join(' ') }); } });
brep = createBuurtRep({ state, econ, toast, save: () => writeSave() });
const haggle = createHaggle({ onDeal: (who, how) => (how === 'deal' && stats && stats.add('haggles'), how === 'deal' && vandaag && vandaag.note('haggle'), brep.add('kade', how === 'caught' ? -3 : 1, how === 'caught' ? `caught telling ${who} a story` : null)), state, day: () => econ.ensure().day, toast, beep, save: () => writeSave() });
let guide = null; // js/guide.js, set up once the street, the van and the NPCs exist
const tips = createTips({ state, beep, save: () => writeSave(), held: (k) => !!(guide && guide.on() && guide.script && GUIDE_TIPS.includes(k)), busy: () => !!(guide && guide.showing()), away: () => { try { return !!(state.inDialogue || choiceOpen); } catch (e) { return false; } } }); // a dialogue or choice is up: the tip card waits (choiceOpen is declared further down)
const tutorial = createTutorial({ state, econ, toast, beep, save: () => writeSave(), dialogue, choice, objective: () => updateObjective(), guided: () => !!(guide && guide.on()), refresh: () => { if (state.inPC && pcMode === 'pc' && $('pc').style.display === 'block') renderPC(); } });
const stall = createSpiceStall({ state, econ, haggle, addMoney, toast, save: () => writeSave() });
const rankNow = () => rankOf(econ.ensure().rep).i;
// the slow hustle: the new PC tabs open along the way, not all at the start
const UNLOCK = {
  werk: { ok: () => econ.has('opknappen') || !!(state.ws && (state.ws.built || state.ws.repaired)), why: 'Sell your first machine (Kaasplaats), then go and see Monteur Mo under the railway.' },
  garage: { ok: () => !!(state.drives && Object.keys(state.drives).length) || !!state.district1, why: 'Take the Oofmobiel for a drive first.' },
  krant: { ok: () => state.step === 'free' && !tutorial.active(), why: 'The paper boy only delivers to proper businesses. Finish the tour with Shooki first.' },
  plan: { ok: () => !!state.district1 || !!state.ngp, why: 'Take all of Kipkruidenkwartier first. Then Kevin and the Fluisteraar start talking about night work.' }, // New Game+ keeps the night work you already opened
};
const canDo = (k) => (k === 'rank1' ? rankNow() >= 1 : k === 'heist' ? !!(state.heists && state.heists.done && state.heists.done.tutorial) : UNLOCK[k] ? UNLOCK[k].ok() : true);
const ws = createWorkshop({ actOpen: (n) => actOpen(n), rank: rankNow, state, econ, addMoney, toast, beep, haggle, save: () => writeSave() });
const actOpen = (n) => (n === 2 ? NOSH.some(([, id]) => owns(id)) : n === 3 ? ABD.some(([, id]) => owns(id)) : true); // per-act extras: hold a joint in that act
const garage = createGarage({ bills: () => bills, tip: (k) => tips.show(k), actOpen, rank: rankNow, state, econ, addMoney, toast, save: () => writeSave(), onPaint: (c) => paintVan(c), phone: () => phone, livery: () => liveryNow() });
const crew = createCrew({ can: canDo, state, econ, ws, addMoney, toast, save: () => writeSave() });
bills = createBills({ state, econ, garage, crew, loods: () => loods, woning: () => woning, rank: () => rankNow(), addMoney, toast, tip: (k) => tips.show(k), save: () => writeSave(),
  eligible: () => !!state.table && state.step === 'free' && !tutorial.active(), dayName: (d) => (world ? world.cal(d).wdName : '') });
const heists = createHeists({ extraTarget: () => (blokaas ? blokaas.heistTarget() : null), rank: rankNow, state, econ, garage, addMoney, toast, save: () => writeSave(), closePC: () => closePC(),
  levels: () => JOINTS.map(([name, id, , ok]) => ({ id, name, faction: NOSH.some((j) => j[1] === id) ? 'noshgey' : ABD.some((j) => j[1] === id) ? 'abdavissies' : PARA.some((j) => j[1] === id) ? 'paravim' : 'lampas', owned: owns(id), unlocked: typeof ok === 'function' ? !!ok() : id === 'spekbuurt' || owns('spekbuurt') })),
  go: function heistGo(id, h) { // drive there first, park round the corner, then the night begins
    if (mission.active || tripOn()) return; if (!econ.canRaid()) { raidRefused(); return; }
    if (klok && !klok.isNight()) { choice('Eddy Jr.', `It is ${klok.label()}. A Nachtklus needs the dark: the street is still full of people.`, ['Wait until dark (20:30)', 'Not now'], (k) => { if (k === 0) { klok.waitUntil(20.5); heistGo(id, h); } }); return; }
    econ.startRaid(); const j = JOINTS.find((x) => x[1] === id);
    oofDrive.start({ van: garage.stats(), from: 'Kipkruidenkwartier', to: j ? j[0] : h.to || id, target: j && j[4], theme: h.theme, mission: 'Lights off. Park round the corner.', onDone: (res) => {
      clearPlayerSplats(); clock.getDelta();
      if (res.arrived) { mission.enter(id, { heist: h }); return; }
      toast('NACHTKLUS OFF', 'The Oofmobiel never made it. The job is off for tonight.', 3.5); writeSave();
    } });
  } });
function paintVan(c) { oof.traverse((o) => { if (o.userData && o.userData.paint) o.userData.paint.color.setHex(c); }); }
const pcHidden = ['rep', 'bills', 'krant', 'beurs', 'meng', 'rapport', 'jobs', 'ideas', 'werk', 'garage', 'plan', 'woning', 'loods']; // need the mixing table first
function pcPrograms() {
  if (pcMode !== 'pc') return [];
  return icons.filter(([id]) => (!pcHidden.includes(id) || state.table) && tutorial.showTab(id) && !(id === 'loods' && tutorial.active())).map(([id, , label]) => {
    if (!tutorial.active() && UNLOCK[id] && UNLOCK[id].ok()) tutorial.markNew(id); // a tab that just opened up gets a NEW badge
    return { id, label, isNew: tutorial.isNew(id) && !(pcTab === id && kd.winOpen) };
  });
}
const media = createMedia({ $, duck: (k) => setDuck('media', k) });
const kd = createKaasdows({ $, beep, programs: pcPrograms, refresh: () => renderPC(), money: () => 'W ' + state.money.toLocaleString('nl-NL'),
  user: () => ({ name: 'Eddy Jr.', face: faces['Eddy Jr.'] }),
  onOpenTab: (id) => { pcTab = id; renderPC(); }, onLogoff: () => closePC(),
  help: (tab) => { if (!(tab && tips.again('tab:' + tab))) kd.msg('Kaasdows Help', 'Click (or tap) an icon on the desktop, or pick a program from the green <b>start</b> button. The <b>×</b> closes a window, <b>_</b> tucks it away on the taskbar. Log off with the red button bottom-right, or <b>Esc</b>.'); } });
$('pcmedia').innerHTML = KD_ICONS.media; $('pcmedia').onclick = (e) => { e.stopPropagation(); kd.open('media'); }; // the tray note while music plays
function openPC(tab = 'sell', mode = 'pc') { kmap.warm(); // paint the aerial map while the desktop is open, so the map tab is instant
  pcTab = tab; pcMode = mode; state.inPC = true; $('pc').style.display = 'block'; kd.login(mode); renderPC();
}
function closePC() { if (buurt && buurt.isOpen()) { buurt.close(); return; } media.stop(); if (!state.inPC || $('pc').style.display !== 'block') { state.inPC = false; $('pc').style.display = 'none'; return; } kd.logoff(); state.inPC = false; $('pc').style.display = 'none'; afterPC(); }
// the window's ×: shuts the program and shows the desktop (the Oofmobiel planner has no desktop, so it logs off)
$('pcclose').onclick = (e) => { e.stopPropagation(); if (pcMode === 'van') closePC(); else kd.closeWindow(); };
const PC_TITLE = { buurt: 'Buurtkaart', krant: 'Krant voor het Kaasvolk', sell: 'Kaasplaats', hire: 'Naknik Uitzendbureau', shop: 'Mixing table', beurs: 'Kruidenbeurs', meng: 'Mengkamer', rapport: 'Dagrapport', jobs: 'Klusbord', ideas: 'Ideeënboek', werk: 'Werkplaats', garage: 'Garage Mo', plan: 'Plannenbord', map: 'Map of Kaasland', woning: 'Woning', loods: 'De Loods', bank: 'My Wilders', media: 'Kaasdows Mediaspeler' };
function renderPC() {
  kd.setTab(pcTab);
  kd.render(pcPrograms(), pcTab, pcMode === 'van' ? 'Oofmobiel' : PC_TITLE[pcTab] || 'Kaasdows', pcMode === 'van' ? 'van' : pcTab);
  refreshPCMoney();
  if (pcMode === 'pc' && !kd.winOpen) return; // the desktop is showing: nothing to draw inside a window
  if (pcMode === 'pc') { tutorial.opened(pcTab); if (!UNLOCK[pcTab] || UNLOCK[pcTab].ok()) tips.show('tab:' + pcTab); }
  const body = $('winbody'); const title = $('wintitle');
  const fmt = (n) => 'W ' + n.toLocaleString('nl-NL');
  if (pcMode === 'van') {
    title.textContent = 'Oofmobiel · Where to?';
    const hv = woning ? woning.vanHomes() : []; // Eddy's own house is across town (js/woning.js)
    body.innerHTML = (hv.length ? `<div class="well" style="margin-bottom:8px"><b>Home</b> · ${hv.map((h) => `<button class="b95" data-home="${h.tier}">Drive home · ${h.name}${h.home ? '' : ' (move in)'}</button>`).join(' ')}</div>` : '') + mapHTML(true); bindMap();
    body.querySelectorAll('[data-home]').forEach((b) => b.onclick = () => { closePC(); woning.driveHome(+b.dataset.home); });
    return;
  }
  if (haggle.tab() === pcTab) tips.show('haggle');
  if (haggle.tab() === pcTab) { title.textContent = haggle.title(); body.innerHTML = haggle.html(); body.scrollTop = 0; haggle.bind(body, renderPC); return; } // a negotiation takes over its tab until it ends
  if (pcTab === 'sell') {
    title.textContent = 'Kaasplaats.kl · Second-hand catering gear';
    const rows = junkDefs.filter((d) => state.listed.has(d.id) && !state.sold.has(d.id));
    let h = `<div class="well" style="margin-bottom:10px"><b>Welcome to Kaasplaats!</b> Your listings and the best bids. Balance: <b data-bal>${fmt(state.money)}</b></div>`;
    if (!rows.length) h += `<div class="well">${state.sold.size === junkDefs.length ? 'Everything sold! Dad would be proud. (Or jealous.)' : 'No listings yet. Walk around the warehouse and list your old junk (E).'}</div>`;
    else {
      h += '<table class="list"><tr><th>Listing</th><th>Asking</th><th>Best bid</th><th></th></tr>';
      for (const d of rows) { const b = bidFor(d); h += `<tr><td>${d.name}</td><td>${fmt(d.price)}</td><td class="bid">${fmt(b.amount)}<br><small>${b.who}</small></td><td><button class="b95" data-sell="${d.id}">Sell</button></td></tr>`; }
      h += '</table>';
    }
    if (state.loot) h += `<table class="list" style="margin-top:8px"><tr><th>Listing</th><th>Asking</th><th>Best bid</th><th></th></tr><tr><td>Lampas spice, crate (×${state.loot})<br><small>"slightly borrowed"</small></td><td>${fmt(LOOT_PRICE)}</td><td class="bid">${fmt(LOOT_PRICE)}<br><small>Kees from Spekbuurt</small></td><td><button class="b95" id="sellLoot">Sell all</button></td></tr></table>`;
    const unl = junkDefs.length - state.listed.size;
    if (unl > 0 && state.step !== 'talk') h += `<p>${unl} more item(s) in the warehouse aren't listed yet.</p>`;
    if (state.table) h += econ.machinesHTML(); // Dad's old trade: machines for the joints
    body.innerHTML = h; econ.machinesBind(body, renderPC);
    body.querySelectorAll('[data-sell]').forEach((b) => b.onclick = () => sellItem(b.dataset.sell, b));
    const sl = $('sellLoot'); if (sl) sl.onclick = () => { addMoney(state.loot * LOOT_PRICE, sl); toast('SOLD', `${state.loot} crate(s) of Lampas spice. Kees doesn't ask questions.`, 2); state.loot = 0; writeSave(); renderPC(); };
  } else if (pcTab === 'hire') {
    title.textContent = 'Naknik Uitzendbureau · "They get it done. Mostly."';
    body.innerHTML = solli.html(); solli.bind(body, renderPC); // candidates with a name, a face, stats and a work ethic (js/sollicitanten.js)
  } else if (pcTab === 'shop') {
    title.textContent = 'Van Kruidenburg Wholesale · Mixing tables';
    body.innerHTML = `<div class="well"><b>Mixing table "Basis"</b><br>Steel table, mixing bowl, three sacks of starter spices (paprika, curry, cumin). Fine for beginners.<br><br>Price: <b>${fmt(TABLE_COST)}</b></div><br>
      <button class="b95" id="tableBtn" ${state.table ? 'disabled' : `data-need="${TABLE_COST}"${state.money < TABLE_COST ? ' disabled' : ''}`}>${state.table ? 'Bought' : 'Buy (' + fmt(TABLE_COST) + ')'}</button>`;
    $('tableBtn').onclick = buyTable;
  } else if (pcTab === 'beurs') {
    title.textContent = 'Kruidenbeurs.kl · Spice prices, live-ish';
    body.innerHTML = (ws.hasPC('modem') ? `<div class="well" style="margin-bottom:8px"><b>56k modem</b> · tomorrow's rumour: <i>${econ.rumour()}.</i></div>` : '') + stall.html() + econ.html(); econ.bind(body, renderPC); stall.bind(body, renderPC);
  } else if (pcTab === 'meng') {
    title.textContent = 'Mengkamer · What are the Naknikim mixing?';
    body.innerHTML = econ.mixHTML(); econ.mixBind(body, renderPC);
  } else if (pcTab === 'rapport') {
    title.textContent = 'Dagrapport · Clients, orders and who owes what';
    body.innerHTML = econ.reportHTML(); econ.reportBind(body, renderPC);
  } else if (pcTab === 'jobs') {
    title.textContent = 'Klusbord · Jobs for today';
    body.innerHTML = econ.jobsHTML(); econ.jobsBind(body, renderPC);
  } else if (pcTab === 'ideas') {
    title.textContent = "Ideeënboek · Eddy Jr.'s notebook";
    body.innerHTML = econ.ideasHTML();
  } else if (UNLOCK[pcTab] && !UNLOCK[pcTab].ok()) {
    title.textContent = { werk: 'Werkplaats', garage: 'Garage Mo', plan: 'Plannenbord', krant: 'Krant voor het Kaasvolk' }[pcTab] + ' · locked';
    body.innerHTML = `<div class="well"><b>Not yet.</b><br>${UNLOCK[pcTab].why}<br><br><small>Start small: sell Dad's junk, hire Naknikim, take joints, earn your rank. Kaasland opens up as you grow.</small></div>`;
  } else if (pcTab === 'buurt') {
    title.textContent = 'Buurtkaart · Kipkruidenkwartier';
    body.innerHTML = buurt.html(); buurt.bind(body, renderPC); // the map scrolls to Eddy the first time
  } else if (pcTab === 'krant') {
    if (vandaag) vandaag.note('krant');
    title.textContent = 'Krant voor het Kaasvolk · het dagblad van Kaasland';
    body.innerHTML = world.paperHTML(); body.scrollTop = 0;
  } else if (pcTab === 'werk') {
    title.textContent = 'Werkplaats · Build, repair, upgrade';
    body.innerHTML = ws.html(); ws.bind(body, renderPC);
  } else if (pcTab === 'plan') {
    title.textContent = 'Plannenbord · Nachtklussen';
    body.innerHTML = heists.html(); heists.bind(body, renderPC);
  } else if (pcTab === 'rep') {
    title.textContent = 'Buurten · Wat de buurt van je vindt';
    body.innerHTML = brep.html();
  } else if (pcTab === 'bills') {
    title.textContent = 'Rekeningen · Weekrekeningen';
    body.innerHTML = bills.html(); bills.bind(body, renderPC);
  } else if (pcTab === 'garage') {
    title.textContent = 'Garage Mo · Oofmobiel upgrades';
    body.innerHTML = garage.html(); garage.bind(body, renderPC);
  } else if (pcTab === 'loods') {
    title.textContent = 'De Loods · Bouwbedrijf Gerrit & Zonen';
    body.innerHTML = loods.html(); loods.bind(body, renderPC);
  } else if (pcTab === 'woning') {
    title.textContent = "Woning · Eddy's homes, furniture, knacks and outfits";
    body.innerHTML = woning.html(); woning.bind(body, renderPC);
  } else if (pcTab === 'map') {
    title.textContent = 'Map of Kaasland';
    body.innerHTML = mapHTML(false); bindMap();
    if (!state.mapSeen) { state.mapSeen = true; setTimeout(onMapSeen, 400); }
  } else if (pcTab === 'media') {
    title.textContent = 'Kaasdows Mediaspeler'; body.innerHTML = media.html(); media.bind(body);
  } else if (pcTab === 'bank') {
    title.textContent = 'My Wilders · Kaasbank';
    body.innerHTML = `<div class="well">Balance: <b data-bal>${fmt(state.money)}</b><br>Mixing: <b>${econ.dayKg()} kg</b> a market day<br>Naknikim employed: <b>${state.naknik}</b><br>Market day: <b>${econ.ensure().day}</b> · Spice in stock: <b>${econ.stockTotal()} kg</b><br>Territories: <b>${1 + JOINTS.filter(([, id]) => owns(id)).length}</b> (Kipkruidenkwartier${JOINTS.filter(([, id]) => owns(id)).map(([n]) => ', ' + n).join('')})<br><br><i>"Whoever holds the spice, holds Kaasland." · Freddy Sr.</i></div>${econ.rankHTML()}${state.table ? econ.propertyHTML() : ''}`;
    econ.propertyBind(body, renderPC);
  }
}
await bootStep(62, 'Counting the Lampas…');
// ------------------------------------------------------------------ district 1: Kipkruidenkwartier (Spekbuurt, Kroketkade, Uitjesbuurt)
// Each territory is a mission (js/levels/*.js). Spekbuurt opens the other two; owning all three clears the district.
const D1 = [['Spekbuurt', 'spekbuurt', 1], ['Kroketkade', 'kroketkade', 2], ['Uitjesbuurt', 'uitjesbuurt', 3]];
// Act 1: Oud-Vettenburg, the Lampas heartland. One mission per territory (plan: Frietwijk first, then the rest, Pindasausplein last).
// [name, level id, mission number, unlocked(), drive target]; reached by the Oofmobiel drive (js/rit.js), which starts the mission on arrival.
const LAMPAS = [['Frietwijk', 'frietwijk', 1, () => !!state.district1], ['Sauzenbuurt', 'sauzenbuurt', 2, () => owns('frietwijk'), [0, 6]], ['Knoflooksteeg', 'knoflooksteeg', 3, () => owns('frietwijk'), [2, 7]],
  ['Mayonaisemarkt', 'mayonaisemarkt', 4, () => owns('frietwijk'), [3, 9]], ['Halve Kip Plein', 'halvekipplein', 5, () => ['sauzenbuurt', 'knoflooksteeg', 'mayonaisemarkt'].filter(owns).length >= 2, [3, 6]],
  ['Bitterbalbuurt', 'bitterbalbuurt', 6, () => ['sauzenbuurt', 'knoflooksteeg', 'mayonaisemarkt'].filter(owns).length >= 2, [5, 7]],
  ['Pindasausplein', 'pindasausplein', 7, () => LAMPAS.filter(([, id]) => id !== 'pindasausplein' && owns(id)).length >= 6, [0, 8]]]; // the act finale: Jan van Kaas // 5th: the drive's parking crossing (default: the Frietwijk plaza)
// Act 2: Hipsterheuvel, the Noshgey Kariot (plan: Joppiehaven first, Speltpolder last). Opens once the Lampas are finished.
const NOSH = [['Joppiehaven', 'joppiehaven', 1, () => !!state.act1, [1, 9]], ['Frikandelhaven', 'frikandelhaven', 2, () => owns('joppiehaven'), [0, 9]],
  ['Havermelkhaven', 'havermelkhaven', 3, () => owns('joppiehaven'), [2, 9]], ['Kombucha-kwartier', 'kombuchakwartier', 4, () => owns('joppiehaven'), [3, 9]],
  ...[['Gembergracht', 'gembergracht', 5, [4, 9]], ['Avocado-akkers', 'avocadoakkers', 6, [5, 9]], ['Glutenvrije Gaarde', 'glutenvrijegaarde', 7, [2, 8]]].map(([n, id, k, tg]) => [n, id, k, () => ['frikandelhaven', 'havermelkhaven', 'kombuchakwartier'].filter(owns).length >= 2, tg]),
  ...[['Quinoaplantage', 'quinoaplantage', 8, [1, 8]], ['Oat-oase', 'oatoase', 9, [4, 8]]].map(([n, id, k, tg]) => [n, id, k, () => ['gembergracht', 'avocadoakkers', 'glutenvrijegaarde'].filter(owns).length >= 2, tg]),
  ['Speltpolder', 'speltpolder', 10, () => NOSH.filter(([, id]) => id !== 'speltpolder' && owns(id)).length >= 9, [5, 8]]]; // the act finale: Goeroe Granola
// Act 3: De Duistere Dokken, the Abdavissies (plan: Komijnkade first, Kardemomdok last). Opens once the Noshgey Kariot are finished.
const ABD = [['Komijnkade', 'komijnkade', 1, () => !!state.act2, [5, 6]], ["Kaneelsilo's", 'kaneelsilos', 2, () => owns('komijnkade'), [5, 5]],
  ['Paprikapakhuis', 'paprikapakhuis', 3, () => owns('komijnkade'), [4, 6]], ['Kruidnagelkade', 'kruidnagelkade', 4, () => owns('komijnkade'), [5, 4]],
  ...[['Peperhaven', 'peperhaven', 5, [4, 5]], ['Kurkumaloods', 'kurkumaloods', 6, [4, 4]]].map(([n, id, k, tg]) => [n, id, k, () => ['kaneelsilos', 'paprikapakhuis', 'kruidnagelkade'].filter(owns).length >= 2, tg]),
  ...[['Saffraanpier', 'saffraanpier', 7, [3, 5]], ['Nootmuskade', 'nootmuskade', 8, [3, 4]], ['Smokkelsloot', 'smokkelsloot', 9, [2, 5]]].map(([n, id, k, tg]) => [n, id, k, () => ['peperhaven', 'kurkumaloods'].some(owns), tg]),
  ['Containerchaos', 'containerchaos', 10, () => ['saffraanpier', 'nootmuskade', 'smokkelsloot'].filter(owns).length >= 2, [2, 4]],
  ['Kardemomdok', 'kardemomdok', 11, () => ABD.filter(([, id]) => id !== 'kardemomdok' && owns(id)).length >= 10, [1, 5]]]; // the act finale: De Abdavis
// De Zandwijk: the Paravim, Ras al Gara's desert clan. A side act (optional) that opens with Act 2 done, alongside the docks.
// The toughest clan (three hits each, one loud shot wakes them all: def.paravim in js/mission.js). Couscouskade first, Kasbah al Gara last.
const PARA = [['Couscouskade', 'couscouskade', 1, () => !!state.act2, [0, 7]], ["Za'atarmarkt", 'zaatarmarkt', 2, () => owns('couscouskade'), [1, 7]], ['Sumaksteeg', 'sumaksteeg', 3, () => owns('couscouskade'), [0, 5]],
  ...[['Harissahof', 'harissahof', 4, [1, 6]], ['Dadelplein', 'dadelplein', 5, [0, 4]]].map(([n, id, k, tg]) => [n, id, k, () => owns('zaatarmarkt') && owns('sumaksteeg'), tg]),
  ['Kasbah al Gara', 'kasbahalgara', 6, () => PARA.filter(([, id]) => id !== 'kasbahalgara' && owns(id)).length >= 5, [1, 3]]]; // the finale: Ras al Gara
const FINAL = [['De Gouden Molen', 'goudenmolen', 1, () => !!state.act3, [3, 3]]]; // the finale
const ACT_JOINTS = [...LAMPAS, ...NOSH, ...ABD, ...PARA, ...FINAL]; // territories reached by the top-down drive
const actOf = (j) => (PARA.includes(j) ? { n: 'P', label: 'Paravim', where: 'De Zandwijk, Paravim turf.' } : FINAL.includes(j) ? { n: 4, where: 'An island in the river, where Dad hid the recipe.' } : ABD.includes(j) ? { n: 3, where: 'De Duistere Dokken, Abdavissies turf.' } : NOSH.includes(j) ? { n: 2, where: 'Hipsterheuvel, Noshgey Kariot turf.' } : { n: 1, where: 'Oud-Vettenburg, the Lampas heartland.' });
const JOINTS = [...D1, ...ACT_JOINTS]; // every territory with a mission: remix raids, the daily challenge and clients use all of them
const lampasOwned = () => LAMPAS.filter(([, id]) => owns(id)).length;
const ACT1_BONUS = 10000;
const FINALE_BONUS = 50000;
function checkFinale() { // De Gouden Mix is Eddy's: the end of the story, and New Game+ opens
  if (state.finale || !owns('goudenmolen') || (mission && mission.active)) return false;
  state.finale = true; addMoney(FINALE_BONUS);
  toast('DE GOUDEN MIX IS YOURS', `Kaasland is yours, jongen. Bonus: W ${FINALE_BONUS.toLocaleString('nl-NL')}. Thank you for playing Spice Master Eddy. New Game+ waits on the map, at De Gouden Molen.`, 12);
  [523, 659, 784, 1046, 784, 1046, 1318, 1568, 2093].forEach((f, i) => setTimeout(() => beep(f, 0.22, 'triangle', 0.07), i * 140));
  writeSave(); return true;
}
// New Game+: keep your money, rank, kit, machines and warehouses' stock; every territory goes back to its faction and every enemy is tougher.
function startNewGamePlus() {
  state.ngp = (state.ngp || 0) + 1;
  for (const [, id] of JOINTS) if (owns(id)) mission.setOwned(id, false);
  if (state.van) { state.van.clamp = null; state.van.inspector = null; } // a clean start on the street (js/garage.js)
  state.owned = {}; state.spekbuurt = false; state.lootTaken = {}; state.district1 = state.act1 = state.act2 = state.act3 = state.finale = state.paravim = false; state.rasCall = 0;
  toast(`NEW GAME+ ${state.ngp}`, 'The factions are back on every corner, tougher than before. Start with Spekbuurt.', 6);
  writeSave(); updateObjective();
}
const paraNote = () => (state.paravim ? '<span style="color:#6ed36e">De Zandwijk is yours: the Paravim are settled.</span> ' : `<span style="color:#e8a33d">Side act: the Paravim in De Zandwijk${PARA.some(([, id]) => owns(id)) ? ` (${PARA.filter(([, id]) => owns(id)).length}/6): ${PARA.filter(([, id, , ok]) => !owns(id) && ok()).map(([n]) => `<b>${n}</b>`).join(', ')}` : ', starting with <b>Couscouskade</b>'}. Optional, and the toughest clan.</span> `);
const PARA_BONUS = 25000;
function checkPara() { // Kasbah al Gara has fallen: the Paravim are settled (no more Paravim heat), and they trade with Eddy now
  if (state.paravim || !owns('kasbahalgara') || (mission && mission.active)) return false;
  state.paravim = true; addMoney(PARA_BONUS);
  toast('THE PARAVIM ARE SETTLED', `De Zandwijk is yours. Bonus: W ${PARA_BONUS.toLocaleString('nl-NL')}. The ledger proved it: Dad paid every shipment, Oom Gerrit kept the money for the last three. Ras al Gara swears at Gerrit now, not at you, and his men will be at De Gouden Molen. The Paravim caravans sell you ras el hanout, sumak, za’atar and harissa on the Kruidenbeurs: mix Woestijn Shoarma for the joints in De Zandwijk.`, 13);
  [523, 659, 784, 1046, 1318, 1568, 2093].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle', 0.06), i * 120));
  writeSave(); return true;
}
const ACT3_BONUS = 20000;
function checkAct3() { // Kardemomdok has fallen: the Abdavissies are finished; De Abdavis's files point to De Gouden Molen
  if (state.act3 || !owns('kardemomdok') || (mission && mission.active)) return false;
  state.act3 = true; addMoney(ACT3_BONUS);
  toast('THE ABDAVISSIES ARE FINISHED', `De Duistere Dokken are yours. Bonus: W ${ACT3_BONUS.toLocaleString('nl-NL')}. De Abdavis's files: he bought Dad's empire through the Lampas and the Noshgey, and the recipe was never his. It's in a windmill on an island in the river. Next: De Gouden Molen.`, 11);
  [523, 659, 784, 1046, 1318, 1568, 2093].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle', 0.06), i * 120));
  writeSave(); return true;
}
const ACT2_BONUS = 15000;
function checkAct2() { // the Commune has fallen: the Noshgey Kariot are finished, and Eddy holds his dad's first notebook page
  if (state.act2 || !owns('speltpolder') || (mission && mission.active)) return false;
  state.act2 = true; addMoney(ACT2_BONUS);
  if (!state.rasCall && phone) { state.rasCall = 1; phone.callRas(); } // the Paravim want their money: De Zandwijk opens
  toast('THE NOSHGEY KARIOT ARE FINISHED', `Hipsterheuvel is yours. Bonus: W ${ACT2_BONUS.toLocaleString('nl-NL')}. In the chest: a page from Dad's notebook. "De Gouden Mix begint waar de schepen aanleggen." Next: the Abdavissies in De Duistere Dokken.`, 10);
  [523, 659, 784, 1046, 1318, 1568, 2093].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle', 0.06), i * 120));
  writeSave(); return true;
}
function checkAct1() { // Fort Pindasaus has fallen: the Lampas are finished (no more Lampas heat, retakes or raids)
  if (state.act1 || !owns('pindasausplein') || (mission && mission.active)) return false;
  state.act1 = true; addMoney(ACT1_BONUS);
  toast('THE LAMPAS ARE FINISHED', `Oud-Vettenburg is yours. Bonus: W ${ACT1_BONUS.toLocaleString('nl-NL')}. No more Lampas heat. Next: the Noshgey Kariot on Hipsterheuvel.`, 8);
  [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle', 0.06), i * 120));
  writeSave(); return true;
}
const DISTRICT_BONUS = 5000;
const owns = (id) => !!(state.owned && state.owned[id]) || (id === 'spekbuurt' && !!state.spekbuurt);
const d1Owned = () => D1.filter(([, id]) => owns(id)).length;
function checkDistrict() { // all three owned: the district is yours, once
  if (state.district1 || d1Owned() < D1.length || (mission && mission.active)) return false;
  state.district1 = true; addMoney(DISTRICT_BONUS);
  toast('KIPKRUIDENKWARTIER IS YOURS', `All three territories are yours. Bonus: W ${DISTRICT_BONUS.toLocaleString('nl-NL')}. Next: Oud-Vettenburg, Lampas heartland.`, 7);
  [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle', 0.06), i * 120));
  writeSave(); return true;
}
const PINS = [
  ['Kipkruidenkwartier', 235, 430, 'own'], ['Spekbuurt', 420, 465, 'next'],
  ['Sauzenbuurt', 145, 297, 'a1'], ['Frietwijk', 265, 274, 'a1'], ['Knoflooksteeg', 378, 286, 'a1'], ['Mayonaisemarkt', 475, 232, 'a1'], ['Halve Kip Plein', 475, 330, 'a1'], ['Bitterbalbuurt', 575, 286, 'a1'],
  ['Havermelkhaven', 330, 130, 'a2'], ['Kombucha-kwartier', 502, 147, 'a2'], ['Avocado-akkers', 645, 84, 'a2'],
  ['Komijnkade', 767, 242, 'a3'], ['Smokkelsloot', 620, 427, 'a3'], ['Containerchaos', 739, 476, 'a3'],
  ['Kroketkade', 452, 378, 'next'], ['Uitjesbuurt', 172, 490, 'next'], ['Pindasausplein', 95, 432, 'a1'], ['Quinoaplantage', 772, 82, 'a2'],
  ['Kurkumaloods', 562, 372, 'a3'], ['Nootmuskade', 876, 432, 'a3'], ['Kardemomdok', 626, 500, 'a3'],
  ['Joppiehaven', 190, 116, 'a2'], ['Speltpolder', 982, 58, 'a2'], ["Kaneelsilo's", 895, 258, 'a3'], ['Paprikapakhuis', 706, 284, 'a3'],
  ['De Gouden Molen', 640, 204, 'fin'],
];
let MAPL = null;
fetch('./assets/map_labels.json').then((r) => r.json()).then((j) => { MAPL = j; if (state.inPC && (pcMode === 'van' || pcTab === 'map')) renderPC(); }).catch(() => {});
const kmap = createKaasMap();
function mapHTML(van) {
  const kindOf = (n, r) => { const l = ACT_JOINTS.find((x) => x[0] === n); if (l) return owns(l[1]) ? (econ.isRetaken(l[1]) ? 'lost' : 'own') : l[3]() ? 'm3' : FINAL.includes(l) ? (state.act3 ? 'locked' : 'fin') : PARA.includes(l) ? (state.act2 ? 'locked' : 'para') : ABD.includes(l) ? (state.act2 ? 'locked' : 'a3') : NOSH.includes(l) ? (state.act1 ? 'locked' : 'a2') : state.district1 ? 'locked' : 'a1'; const d = D1.find((x) => x[0] === n); if (d && owns(d[1]) && econ.isRetaken(d[1])) return 'lost'; if (n === 'Kipkruidenkwartier' || (d && owns(d[1]))) return 'own'; if (d) return d[2] === 1 ? 'm1' : owns('spekbuurt') ? 'm2' : 'next'; if (r === 'lampas' && state.district1) return 'next'; return ({ start: 'next', lampas: 'a1', nosh: 'a2', abd: 'a3', fin: 'fin' })[r]; };
  const terr = [];
  if (MAPL) {
    const [W, H] = MAPL.size, fx = 1024 / W, fy = 572 / H;
    for (const [n, { box, region, dot }] of Object.entries(MAPL.labels)) {
      const k = kindOf(n, region), b = [box[0] * fx, box[1] * fy, box[2] * fx, box[3] * fy];
      const d = dot ? [dot[0] * fx, dot[1] * fy] : [b[0] - 7, (b[1] + b[3]) / 2];
      const jid = (JOINTS.find((x) => x[0] === n) || [])[1];
      terr.push({ n, k, region, box: b, dot: d, extra: k === 'own' && jid && ws.hasPC('gpu') ? Math.round(econ.controlOf(jid)) + '%' : '' });
    }
  } else { // labels not loaded yet: the old pin table
    const reg = { own: 'start', next: 'start', a1: 'lampas', a2: 'nosh', a3: 'abd', fin: 'fin' };
    for (const [n, x, y, r] of PINS) terr.push({ n, k: kindOf(n, reg[r]), region: reg[r], box: [x - 40, y - 24, x + 40, y - 8], dot: [x - 46, y - 16] });
  }
  const e = econ.ensure(), wh = Object.keys(e.wh || {}).map((id) => { const j = JOINTS.find((x) => x[1] === id); return j && { n: j[0], name: j[0] + ' warehouse' }; }).filter(Boolean);
  return kmap.html({ van, air: freddy ? freddy.mapState() : 'air', terr, warehouses: wh, heat: e.heat, turf: state.table ? econ.turfHTML(true) : '', para: Object.fromEntries(PARA.map(([n]) => [n, kindOf(n, 'para')])), almere: blokaas ? blokaas.mapState() : null, done: { district1: state.district1, act1: state.act1, act2: state.act2, act3: state.act3 } });
}
// the daily challenge: one seeded raid per real day on one of your joints, the same for every player that day
function dailyChallenge() {
  const ids = JOINTS.filter(([, id]) => owns(id) && !econ.isRetaken(id)).map(([, id]) => id); if (!ids.length) return null;
  const t = new Date(), date = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  let h = 0; for (const c of date) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const all = JOINTS.map(([, id]) => id), id = all[h % all.length];
  const pickId = ids.includes(id) ? id : ids[h % ids.length];
  return { date, id: pickId, remix: { ...mission.remixFor(pickId, `daily-${date}`), daily: date } };
}
// an owned joint: the Lampas move back in every market day, so it can be raided again (a remix: js/mission.js)
function remixInfo(n, id) {
  const rx = mission.remixFor(id, econ.ensure().day), m = mission.REMIX_MODS[rx.mod], b = state.best && state.best[id];
  const job = econ.jobFor(id);
  if (econ.isRetaken(id)) return `<b style="color:#a00">${n}: the Lampas took it back!</b> No orders until you retake it. <b>Tonight: ${m.name}</b> (${m.line}) Winning it back drops Lampas heat by 30.`;
  const dc = dailyChallenge(), st = b && b.stars ? b.stars : {}, stars = ['S', 'melee', 'par', 'clean'].map((k) => (st[k] ? '★' : '☆')).join('') + (state.tins && state.tins[id] ? '◆' : '◇');
  return (job ? `<b style="color:#a00">JOB: ${job.title} (+W ${job.reward.toLocaleString('nl-NL')})</b><br>` : '') + (dc && dc.id === id ? `<b style="color:#000080">DAILY CHALLENGE today: ${mission.REMIX_MODS[dc.remix.mod].name}</b>${pcMode === 'van' ? ' <button class="b95" id="goDaily">Play the daily challenge</button>' : ''}<br>` : '') + `Challenges: <b>${stars}</b> (S grade, no guns, under par, no hits)<br>` + `<b>${n}</b>: yours, and a client of Eddy & Zn. But the Lampas sneak back in every night. <b>Tonight's remix: ${m.name}</b> (${m.line})${b ? ` Your best: <b>${b.grade}</b> · W ${b.score.toLocaleString('nl-NL')} · ${b.runs || 1} run(s).` : ''}`;
}
function bindMap() {
  document.querySelectorAll('[data-pin]').forEach((p) => p.onclick = () => {
    const n = p.dataset.pin, k = p.dataset.k, info = $('pininfo'); beep(600, 0.04);
    if (n === 'Schiptagat') { // the airport (js/freddy.js): where Pa lands
      const due = freddy && freddy.due();
      info.innerHTML = `<b>Schiptagat</b>: Kaasland's little airport, south of Kaaspark. Charter flights to Costa del Kaas, a kiss &amp; ride, and a snackbar that charges W 9 for a kroket. ${due ? (pcMode === 'van' ? '<b>Pa lands today.</b> <button class="b95" id="goAir">Drive to Schiptagat · pick up Pa</button>' : '<b>Pa lands today.</b> <i>Get in the Oofmobiel to pick him up.</i>') : freddy && freddy.back() ? '<i>Pa is home. Nobody you need to fetch here.</i>' : '<i>Nobody to pick up. Yet.</i>'}`;
      const ga = $('goAir'); if (ga) ga.onclick = () => { closePC(); freddy.pickup(); };
      return;
    }
    if (n === 'Blokaas Specijeren' && blokaas) { // the rivals' hall in Almere (js/blokaas.js)
      info.innerHTML = blokaas.mapInfo(pcMode === 'van');
      const ga = $('goAlm'); if (ga) ga.onclick = () => { closePC(); startDrive(null, 'almere'); };
      return;
    }
    const d1 = D1.find((x) => x[0] === n), lj = ACT_JOINTS.find((x) => x[0] === n), jt = d1 || lj, act = lj && actOf(lj);
    const drive = (label) => (pcMode !== 'van' ? '<i>Drive there in the Oofmobiel.</i>' : state.kit.includes('maboota') ? `<button class="b95" id="goM">${label}</button>` : '<i>Get a weapon from The Russian first.</i>');
    const lblurb = { Couscouskade: 'The Paravim quay. Boats bring more of them every minute until you cut the mooring lines. Paravim take three hits.', "Za'atarmarkt": 'The Paravim souk. Shoot a stall and its keeper joins the fight.', Sumaksteeg: 'A narrow alley with lookouts and flares.', Harissahof: 'A courtyard of harissa pots. Shoot one and everyone near it burns.', Dadelplein: 'The oasis where they count their money. Sandstorms, and the chests leave once they see you.', 'Kasbah al Gara': 'Ras al Gara’s fortress, and the Paravim ledger.', Joppiehaven: 'Joppiehaven Organic Wrap Bar, on a boardwalk over the marina: the Noshgey Kariot’s front door. Their guards take two hits.', 'De Gouden Molen': 'The windmill on the island. Every faction has sent its last men, and someone you know waits by the chest.', Saffraanpier: 'De Rode Draad, a red restaurant on the saffron pier, and the saffron vault behind it.', Nootmuskade: 'An Abdavissies black-market auction. The bidders run when it kicks off.', Smokkelsloot: 'A boathouse over an indoor smuggling canal. Knock them into the water.', Containerchaos: 'Terminal 7: a maze of container stacks and a dockers’ bar.', Kardemomdok: 'The Abdavissies headquarters. De Abdavis, and the files on Dad’s empire.', Peperhaven: 'The harbour master’s sorting hall, in a blackout. Throw the fuse box or fight in the dark.', Kurkumaloods: 'A yellow loods of containers and barrels, with an overhead crane that sweeps the floor.', Paprikapakhuis: 'A dark Abdavissies storehouse where the shelving blocks sight. Every aisle is a blind corner.', Kruidnagelkade: 'De Gouden Kruidnagel: a packing hall and a casino. The guards carry shotguns.', Komijnkade: 'De Natte Komijn, a kiosk on a stormy quay and the Abdavissies’ first warehouse. Waves break over the edge.', "Kaneelsilo's": 'The Abdavissies cinnamon silos. Open the three silo valves and dump their stock.', Quinoaplantage: 'De Superkorrel: a grain warehouse where shot sack piles burst into blinding dust clouds.', 'Oat-oase': 'A VIP pool party. Guards in pairs, guests who run, and a pool to knock the Noshgey into.', Speltpolder: 'De Oerkorrel Commune, the Noshgey island headquarters. Goeroe Granola, a disco dome, and a golden chest in the greenhouse.', Gembergracht: 'Club Gember under the bridge: a packed dance floor of clubgoers who stampede when the shooting starts.', 'Avocado-akkers': 'De Groene Goudmijn, a greenhouse café and hydroponics lab. Glass walls everywhere.', 'Glutenvrije Gaarde': 'A white townhouse deli, a bamboo garden that blocks sight, and a glass lab behind it.', Havermelkhaven: 'De Volle Korrel, an oat-milk café with the Noshgey oat-milk plant behind it. Shoot a tank and the flood knocks them flat.', 'Kombucha-kwartier': 'The Kombucha Collectief: a palm lounge and a hall of copper fermentation tanks that burst when shot.', Frikandelhaven: 'De Ambachtelijke Frikandel: a harbour café, a disco cellar with strobes and a copper brewery.', Pindasausplein: 'Fort Pindasaus: the Lampas headquarters on a fortified pier. Watchtowers, searchlights, and Jan van Kaas himself.', Bitterbalbuurt: 'Café De Gouden Bitterbal, a brown café next to a white gabled shoarma shop. The Lampas keep their Wilders in the vault below.', Mayonaisemarkt: 'De Witte Klodder on the market square, and behind it the Lampas wholesale depot: a huge open hall full of pallets and spice crates.', 'Halve Kip Plein': 'De Halve Haan, a chicken grill on the corner. Behind it, the office where every Lampas order is booked. Wipe their PCs.', Knoflooksteeg: 'De Knoflookbol, a takeaway hatch in a dark alley. Behind it, three Lampas gambling dens. Go quiet.', Sauzenbuurt: 'Het Dunne Sausje, on the west quay: the Lampas water down the garlic sauce here. Kick over their kettles.', Frietwijk: 'Friettent De Vette Hap: the Lampas’ busiest snack corner. Behind the counter, a kitchen made of glass and a back office full of Wilders.' };
    const blurb = { Kroketkade: 'A Lampas snackbar on the rainy corner of the quay. The kitchen and the garage behind it are full of Lampas.', Uitjesbuurt: 'De Zure Ui, the corner snackbar with a terrace. Underneath: an onion cellar and a Lampas gambling den.' };
    const t = {
      own: jt ? remixInfo(n, jt[1]) + (pcMode === 'van' ? ' <button class="b95" id="goM">Drive · remix raid</button>' : ' <i>Drive there in the Oofmobiel.</i>') + (n === 'De Gouden Molen' && state.finale ? `<br><b>New Game+${state.ngp ? ` ${state.ngp + 1}` : ''}</b>: keep your Wilders, rank and kit; every territory goes back to its faction and every enemy takes one more hit. <button class="b95" id="goNGP">Start New Game+</button>` : '') : `<b>${n}</b>: your home base. The Eddy & Zn warehouse. ${pcMode === 'van' ? '<button class="b95" id="go">Drive</button>' : ''}`,
      lost: jt ? remixInfo(n, jt[1]) + (pcMode === 'van' ? ' <button class="b95" id="goM">Drive · retake it</button>' : ' <i>Drive there in the Oofmobiel.</i>') : '',
      m1: `<b>Spekbuurt</b>: Lampas turf. Slager &amp; Shoarma Spekbuurt sells their watered-down spice, and the back of the butcher's is full of Lampas. <b>Mission 1.</b> ${pcMode !== 'van' ? '<i>Drive there in the Oofmobiel.</i>' : state.kit.includes('maboota') ? '<button class="b95" id="goM">Drive · start mission</button>' : '<i>Get a weapon from The Russian first.</i>'}`,
      m2: d1 ? `<b>${n}</b>: Lampas turf in Kipkruidenkwartier. ${blurb[n] || ''} <b>Mission ${d1[2]}.</b> ${drive('Drive · start mission')}` : '',
      next: d1 ? `<b>${n}</b>: part of Kipkruidenkwartier, but the shoarma joints here still buy Lampas spice. <i>Take Spekbuurt first.</i>` : state.district1 ? `<b>${n}</b>: Oud-Vettenburg, the Lampas heartland. Next on the list. <i>(Missions in a later build.)</i> ${pcMode === 'van' ? '<button class="b95" id="goD">Drive to Oud-Vettenburg</button>' : '<i>Drive there in the Oofmobiel.</i>'}` : `<b>${n}</b>: part of Kipkruidenkwartier, but the shoarma joints here still buy Lampas spice. <i>(Coming in the next build.)</i>`,
      m3: lj ? `<b>${n}</b>: ${act.where} ${lblurb[n] || ''} <b>${act.label ? `${act.label} · mission ${lj[2]}${lj[2] === 6 ? ' (finale)' : ''}` : act.n === 4 ? 'The finale' : `Act ${act.n} · mission ${lj[2]}`}.</b> ${pcMode !== 'van' ? '<i>Drive there in the Oofmobiel.</i>' : state.kit.includes('maboota') ? `<button class="b95" id="goL">Drive to ${n} · start mission</button>` : '<i>Get a weapon from The Russian first.</i>'}` : '',
      locked: `<b>${n}</b>: ${act ? act.where : ''} ${lblurb[n] || ''} <i>${act && act.n === 'P' ? (n === 'Couscouskade' ? 'Finish the Noshgey Kariot first.' : n === 'Kasbah al Gara' ? 'Take the other five De Zandwijk places first.' : lj[2] >= 4 ? "Take Za'atarmarkt and Sumaksteeg first." : 'Take Couscouskade first.') : act && act.n === 4 ? 'Finish the Abdavissies first.' : act && act.n === 3 ? (n === 'Komijnkade' ? 'Finish the Noshgey Kariot first.' : n === 'Kardemomdok' ? 'Take the other ten dock territories first.' : n === 'Containerchaos' ? 'Take two of Saffraanpier, Nootmuskade and Smokkelsloot first.' : lj[2] >= 7 ? 'Take Peperhaven or Kurkumaloods first.' : lj[2] >= 5 ? "Take two of Kaneelsilo's, Paprikapakhuis and Kruidnagelkade first." : 'Take Komijnkade first.') : act && act.n === 2 ? (n === 'Joppiehaven' ? 'Finish the Lampas first.' : n === 'Speltpolder' ? 'Take the other nine Hipsterheuvel territories first.' : lj[2] >= 8 ? 'Take two of Gembergracht, Avocado-akkers and Glutenvrije Gaarde first.' : lj[2] >= 5 ? 'Take two of Frikandelhaven, Havermelkhaven and Kombucha-kwartier first.' : 'Take Joppiehaven first.') : n === 'Pindasausplein' ? 'Take the other six Oud-Vettenburg territories first.' : ['Halve Kip Plein', 'Bitterbalbuurt'].includes(n) ? 'Take two of Sauzenbuurt, Knoflooksteeg and Mayonaisemarkt first.' : 'Take Frietwijk first.'}</i>`,
      later: `<b>${n}</b>: Oud-Vettenburg, the Lampas heartland. ${lampasOwned() ? 'Next on the list.' : '<i>Take Frietwijk first.</i>'} <i>(This mission comes in a later build.)</i>`,
      a1: `<b>${n}</b>: Lampas territory. Their watered-down spice, your customers. <i>Locked.</i>`,
      a2: `<b>${n}</b>: Noshgey Kariot territory. Organic, artisanal, wildly overpriced. <i>Locked.</i>`,
      a3: `<b>${n}</b>: Abdavissies territory. Nobody asks questions here. <i>Locked.</i>`,
      fin: `<b>${n}</b>: where the secret of De Gouden Mix waits. Someday.`,
    }[k];
    info.innerHTML = t;
    const go = $('go'); if (go) go.onclick = () => { closePC(); toast('HOME', 'You\'re already at the warehouse.'); }; // travelling elsewhere must call clearPlayerSplats()
    const goM = $('goM'); if (goM) goM.onclick = () => { closePC(); const id = jt ? jt[1] : 'spekbuurt'; const rx = owns(id) ? { ...mission.remixFor(id, econ.ensure().day), retake: econ.isRetaken(id) } : null; if (rx && rx.retake) { const km = econ.retakeMod(); if (km) rx.mod = km; } mission.enter(id, rx ? { remix: rx } : {}); };
    const goD = $('goD'); if (goD) goD.onclick = () => { closePC(); const ks = Object.keys(wijk.WIJKEN).filter(wijkOpen); if (ks.length < 2) { startDrive(); return; } choice('Eddy Jr.', 'A run in the Oofmobiel, no raid. Which district?', [...ks.map((k) => wijk.WIJKEN[k].name), 'Not now'], (i) => { if (i < ks.length) startDrive(null, ks[i]); }); };
    const goNGP = $('goNGP'); if (goNGP) goNGP.onclick = () => { closePC(); startNewGamePlus(); };
    const goL = $('goL'); if (goL) goL.onclick = () => { closePC(); startDrive(lj[1]); };
    const goDaily = $('goDaily'); if (goDaily) goDaily.onclick = () => { const dc = dailyChallenge(); if (!dc) return; closePC(); mission.enter(dc.id, { remix: dc.remix }); };
  });
  kmap.bind($('winbody'));
}
function sellItem(id, btn) {
  const d = junkDefs.find((j) => j.id === id); if (!d || state.sold.has(id)) return;
  const b = bidFor(d);
  state.sold.add(id); addMoney(b.amount, btn);
  d.solid.off = true; poof(d.group);
  if (state.sold.size === junkDefs.length) {
    setTimeout(() => { toast('ALL SOLD!', 'The warehouse is empty. Time to start mixing.'); }, 300);
    state.step = 'hire'; updateObjective();
  }
  renderPC(); writeSave();
}
function buyTable() {
  if (state.table || state.money < TABLE_COST) return;
  addMoney(-TABLE_COST, $('tableBtn')); state.table = true; mixTable.visible = true;
  mixSolid = solid(-8.0, -3.2, -13.4, -11.8);
  updateObjective(); renderPC(); writeSave();
}
const naknikim = [];
function hireNaknik() { // test hook and old callers: the cheapest candidate of the day
  const list = solli.pool(), i = list.map((c, k) => [feeOf(c), k]).filter(([, k]) => !list[k].hired).sort((a, b) => a[0] - b[0])[0];
  if (i && solli.hire(i[1], $('hireBtn'))) renderPC();
}
function onHire(c) { // a candidate from the Uitzendbureau signs: he becomes crew and walks in
  crew.add(c); spawnNaknik(true);
  toast(`${c.name.toUpperCase()} HIRED`, state.naknik > 3 ? `He's at the mixing table in ${state.naknik > 5 ? 'De Overkapping' : 'De Hal'}: about ${solli.kgOf(c)} kg of blend a market day.` : `He's on his way to the mixing table: about ${solli.kgOf(c)} kg of blend a market day. Watch him work the line, or lend a hand.`);
  updateObjective(); writeSave();
}
function spawnNaknik(walk) {
  state.naknik++; state.income = state.naknik * NAKNIK_INCOME;
  const me = Array.isArray(state.crew) ? state.crew[state.naknik - 1] : null, lk = me && me.look; // his own face and build (js/sollicitanten.js); crews from older saves wear look C
  const n = makePerson({ ps2: lk ? naknikLook(lk) : LOOKS.naknik, headKind: 'nak', shirt: 0xec7d2c, front: 'nak', pants: 0xc45e1a, shoes: 0x3a2a1a, belly: 0.8, skin: 0xe8b890, scale: (lk && lk.scale) || 0.68, rolled: true });
  n.position.set((WH.doorX0 + WH.doorX1) / 2, 0, -6.2);
  const spots = [[-4.6, -11.3], [-3.1, -12.6], [-6.1, -12.6]];
  const extra = state.naknik > 3 ? loods.spots()[state.naknik - 4] : null; // the hall and tent tables (js/loods.js)
  if (extra) walk = false; // they start there (no walking through the back wall)
  n.userData.target = extra ? new THREE.Vector3(extra[0], 0, extra[1]) : new THREE.Vector3(spots[state.naknik - 1][0], 0, spots[state.naknik - 1][1]);
  n.userData.face = extra ? [extra[2], extra[3]] : [-4.6, -12.6];
  n.userData.walking = walk; naknikim.push(n);
  if (!walk) { n.position.copy(n.userData.target); n.rotation.y = Math.atan2(n.userData.face[0] - n.position.x, n.userData.face[1] - n.position.z); n.userData.phase = Math.random() * 6; }
  addInteract({ obj: n, pos: () => n.position, r: 1.8, enabled: () => n.visible, label: () => { const m = crew.info(naknikim.indexOf(n)); return m ? `Talk to ${m.name}` : 'Talk to the Naknik'; }, act: () => talkNaknik(n) });
}
const NAK_LINES = ['I mix! I mix!', 'Boss, what is cumin? I just put lots in.', 'Paprika is red. Red is fast. I mix fast.', 'Can I have a break? No? Ok.', 'I counted the koriander. It is many.'];
function talkNaknik(n) { tips.show('crew'); if (vandaag) vandaag.note('naknik'); // name, skill and mood; send them out on an errand or give them a day off
  const i = naknikim.indexOf(n), m = crew.info(i);
  if (!m) return dialogue([['Naknik', NAK_LINES[Math.floor(Math.random() * NAK_LINES.length)]]]);
  if (crew.napping(i)) return choice(m.name, `<i>(snoring on a sack of paprika)</i> Mood: <b>${m.moodWord}</b> (${m.mood}). Skill ${m.stars}. A day off would help.`, ['Give a day off', 'Let them sleep'], (k) => { if (k === 0) crew.dayOff(i); });
  choice(m.name, `"${NAK_LINES[Math.floor(Math.random() * NAK_LINES.length)]}" <br><small>Mengen <b>${m.skill}</b> · Tempo <b>${m.tempo}</b> · Werkethiek <b>${m.ethic}</b> (of 5) · mood <b>${m.moodWord}</b> (${m.mood})${m.quirk ? ` · <i>${m.quirk}</i>` : ''}<br>An errand takes one market day, and they don't mix meanwhile.</small>`, ['Back to work', 'Send on an errand', 'Give a day off'], (k) => {
    if (k === 2) crew.dayOff(i);
    if (k === 1) setTimeout(() => choice(m.name, 'Where to, boss?', [...crew.errands().map((e) => e.name), 'Never mind'], (e) => { const list = crew.errands(); if (e >= 0 && e < list.length) crew.send(i, list[e].id); }), 50);
  }, 0); // Escape: back to work
}
function spiceCloud(at) { // a mixing mistake: a puff of paprika
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshBasicMaterial({ color: 0xc2412d, transparent: true, opacity: 0.7, depthWrite: false }));
  m.position.set(at.x, 1.0, at.z); scene.add(m); const t0 = performance.now();
  const step = () => { const k = (performance.now() - t0) / 1600; if (k >= 1) { scene.remove(m); return; } m.scale.setScalar(1 + k * 3); m.material.opacity = 0.7 * (1 - k); m.position.y = 1.0 + k * 0.8; requestAnimationFrame(step); };
  step();
}
function poof(g) {
  const t0 = performance.now();
  const step = () => { const k = (performance.now() - t0) / 400; if (k >= 1) { g.visible = false; return; } g.scale.setScalar(1 - k); g.rotation.y += 0.3; requestAnimationFrame(step); };
  step();
}
function afterPC() { updateObjective(); }
function onMapSeen() {
}

// ------------------------------------------------------------------ interactables
const inter = [];
function addInteract(o) { inter.push(o); return o; }
addInteract({ obj: dad, pos: () => dad.position, r: 2.2, enabled: () => dad.visible && !dad.userData.leaving && (!freddy || freddy.talkable()), label: () => (freddy && freddy.back() ? 'Talk to Pa' : 'Talk to Dad'), act: talkDad });
addInteract({ obj: russian, pos: () => russian.position, r: 2.9, enabled: () => isInShop(player.position), label: () => 'Talk to The Russian', act: talkRussian });
addInteract({ obj: shopDoor, pos: () => new THREE.Vector3((PS.doorX0 + PS.doorX1) / 2, 0, PS.z1 + 0.4), r: 1.6, enabled: () => shopDoorTarget === 0,
  label: () => ['russian', 'free'].includes(state.step) ? 'Open the door · Pandjeshuis Spasibo' : 'Pandjeshuis Spasibo · locked',
  act: () => { if (['russian', 'free'].includes(state.step)) openShopDoor(); else toast('LOCKED', 'A note on the door: "Back in 5 minutes. Or 5 days." · R.', 2.2); } });
junkDefs.forEach((d) => addInteract({
  obj: d.group, pos: () => d.group.position, r: 1.9,
  enabled: () => state.step !== 'talk' && !state.sold.has(d.id) && d.group.visible,
  label: () => state.listed.has(d.id) ? `${d.name} · listed (sell it on the PC)` : `List for sale: ${d.name}`,
  act: () => {
    if (state.listed.has(d.id)) { toast('ALREADY LISTED', 'Sell it on Kaasplaats on the PC.'); return; }
    state.listed.add(d.id); d.tag.visible = true; beep(980, 0.06, 'triangle');
    toast('LISTED', `${d.name} · asking W ${d.price}`, 1.8);
    if (state.listed.size === junkDefs.length && state.step === 'list') { state.step = 'sell'; }
    updateObjective();
  },
}));
addInteract({ obj: desk, pos: () => new THREE.Vector3(-8.8, 0, -18.6), r: 1.8, enabled: () => state.step !== 'talk', label: () => 'Kaasdows XL · log in', act: () => openPC(state.step === 'hire' ? (state.table ? 'hire' : 'shop') : state.step === 'map' ? 'map' : 'sell') });
addInteract({ obj: oof, pos: () => oof.position, r: 4.2, label: () => (spoed && spoed.vanLabel()) || 'Oofmobiel · get in', act: () => { if (!garage.ensure().clamp && spoed && spoed.vanAct()) return; if (garage.ensure().clamp) { tips.show('clamp'); } if (garage.ensure().clamp) return choice('Oofmobiel', `There's a <b>wheel clamp</b> on the front wheel. Pay the fine (W ${garage.CLAMP_FINE + garage.ticketSum()}${garage.ticketSum() ? ', with your open tickets' : ''}) or get Monteur Mo to cut it off (W ${garage.MO_CLAMP})?`, ['Pay the fine', 'Call Mo', 'Leave it'], (i) => { if (i < 2 && garage.unclamp(i ? 'mo' : 'pay')) openPC('map', 'van'); }); openPC('map', 'van'); }, far: true });
addInteract({ obj: kangoo, pos: () => kangoo.position, r: 2.6, enabled: () => kangoo.visible && !(mission && mission.active), label: () => (spoed && spoed.shookiBusy() ? "Shooki's Kangoo · loading" : "Shooki's Kangoo"), act: () => (spoed && spoed.shookiBusy()) ? toast('SHOOKI', '"Bro, hands off the Kangoo. Carry a bag if you want to help."', 2.5) : dialogue([['Eddy Jr.', 'A white Renault Kangoo. "SHOOKI KOERIER · 24/7 · FAMILIEPRIJS". There\'s a dent in the back door shaped like a bollard.'], ...(npcs && npcs.met('shooki') ? [['Shooki', ['Don\'t touch the mirror, bro. It\'s held on with tape and love.', 'Diesel, bro. It smells like money.', 'I sleep in the back sometimes. Business is business.', 'Hakan\'s kipkraud goes in the back, the rest goes on top.'][Math.floor(Math.random() * 4)]]] : [])]) });

const SHOP = [
  { id: 'makarov', name: 'Makarov PM', desc: '9mm pistol, 8 rounds. Reliable. Like Lada, but works. (Gun slot)', price: 350 },
  { id: 'bat', name: 'Honkbalknuppel', desc: 'Baseball bat. Quiet. Very persuasive.', price: 90 },
  { id: 'ammo', name: '9mm ammo (50)', desc: 'For the Makarov. Bullets are not included, my friend. Never.', price: 40, multi: true },
  { id: 'vest', name: 'Kevlar vest', desc: 'Stops one bullet. Maybe two. Do not test.', price: 500 },
  { id: 'shotgun', name: 'Sawn-off shotgun', desc: 'Two barrels, one opinion. Comes with 12 shells. (Gun slot)', price: 1400 },
  { id: 'shells', name: 'Shotgun shells (12)', desc: 'For the sawn-off. Twelve opinions.', price: 60, multi: true },
  { id: 'goldak', name: 'Golden AK-47', desc: '"For you? Later. When you are big boss."', price: 0, locked: true },
];
const RU_SAY = ['Everything is quality. Everything is cash.', 'No receipts, no questions, no refunds.', 'Your father bought his first knife here. He still owes me for the sharpening.', 'Dolphins are smartest animal. After me.'];
// The Russian's shop is Neon Vice's catalogue now (js/gunshop.js): every gun, attachment, ammo, armour, selling back
let gunShop = null;
function shopUI() { return gunShop || (gunShop = createGunShop({ mission, state, $, addMoney, beep, save: () => writeSave(), kitText: () => kitText(), onClose: afterShop })); }
function openShop() { shopUI().open(); tips.show('shop'); }
function closeShop() { shopUI().close(); }
function afterShop() {
  if (state.step === 'russian' && state.kit.includes('maboota')) { state.step = 'free'; toast('END OF CHAPTER 0', 'You\'re armed. Next: take Spekbuurt from the Lampas.', 4); }
  updateObjective();
}
function kitText() { if (mission && mission.kitSummary) { $('kit').textContent = mission.kitSummary(); return; } $('kit').textContent = state.kit.includes('maboota') ? 'Kit: Maboota' : ''; }
function giveMaboota() {
  if (state.kit.includes('maboota')) return;
  state.kit.unshift('maboota'); kitText(); equip(true);
  toast('MABOOTA ACQUIRED', document.body.classList.contains('touch') ? 'Your first weapon. Tap SLAAN to draw it and swing; it tucks itself away again. Keep it holstered in public: people call the police.' : 'Your first weapon. Press 1 to draw / holster, F or click to swing. Keep it holstered in public: people call the police.', 5);
}
function talkRussian() {
  if (!['russian', 'free'].includes(state.step)) { dialogue([['The Russian', 'Pandjeshuis is closed for you, my friend. Come back when Eddy sends you.']]); return; }
  if (!state.metRussian) {
    state.metRussian = true;
    dialogue([
      ['The Russian', 'Ahh! Eddy\'s boy! Look at you, same shirt energy as your father. Your father and I, we go back. Before the Lampas. Before dolphins on shirts were cool.'],
      ['Eddy Jr.', 'Pa says you can help me. The Lampas run Spekbuurt.'],
      ['The Russian', 'Lampas boys do not negotiate with spice. They negotiate with this.'],
      ['The Russian', 'But first, a gift. For Eddy\'s boy. This is Maboota. Is not a gun. Is better: never runs out of bullets.'],
      ['Eddy Jr.', '...It\'s a stick.'],
      ['The Russian', 'One thing. Kaasland police do not like big men with sticks on the street. Out here, keep it in your jacket. Take it out for Lampas, not for tourists.'],
      ['The Russian', 'Is a very persuasive stick. Welcome to Pandjeshuis Spasibo. Everything is quality, everything is cash. Pick, pay, go make your father proud.'],
    ], () => { giveMaboota(); openShop(); });
  } else openShop();
}
function talkDad() {
  if (freddy && freddy.back() && activists && activists.debrief('freddy')) return; // Eddy tells Pa about the protesters (js/activists.js)
  if (freddy && freddy.back() && blokaas && blokaas.debrief('freddy')) return; // ...and about the Blokaas (js/blokaas.js)
  if (freddy && freddy.talk()) return; // back from Costa del Kaas (js/freddy.js)
  if (state.step === 'talk') {
    dialogue([
      ['Freddy Sr.', 'Eddy! Jongen! There you are. Thirty years I ran this warehouse. Every shoarma joint in Kaasland got its spice from Eddy & Zn.'],
      ['Freddy Sr.', 'Then the Lampas came. Cheap, watered-down mixes. Half sawdust, half lies. My customers left me one by one.'],
      ['Eddy Jr.', 'So you\'re just giving up?'],
      ['Freddy Sr.', 'I\'m retiring. Here, the keys. The warehouse is yours. It\'s full of my old shoarma junk. Sell it, it\'s worth a few Wilders.'],
      ['Freddy Sr.', 'And Eddy... somewhere in Kaasland is the recipe for De Gouden Mix. The blend that made me king. Every faction wants it. Don\'t let them find it first.'],
      ['Eddy Jr.', 'De Gouden Mix... Right. First, the junk goes.'],
    ], () => {
      state.step = 'list'; openShutter(); updateObjective();
      dadSolid.off = true; dad.userData.walkTo = [new THREE.Vector3((WH.doorX0 + WH.doorX1) / 2, 0, WH.z1 - 1.4), new THREE.Vector3((WH.doorX0 + WH.doorX1) / 2, 0, WH.z1 + 1.0), DAD_OUT.clone()];
      toast('KEYS RECEIVED', 'The warehouse is yours');
    });
  } else if (state.step === 'dad2') {
    dialogue([
      ['Freddy Sr.', 'Look at you, jongen. Wilders in your pocket and a Naknik stirring the pot. Your old man is proud.'],
      ['Freddy Sr.', 'But the Lampas won\'t hand over Spekbuurt because you ask nicely. You\'ll need protection.'],
      ['Freddy Sr.', 'Go see an old friend of mine. The Russian. Pawn shop at the east end of the street. Tell him Eddy sent you.'],
      ['Eddy Jr.', 'And you?'],
      ['Freddy Sr.', 'Me? Costa del Kaas. Sun, sea, no spice wars. Don\'t call me unless you find De Gouden Mix.'],
      ['Eddy Jr.', 'Thanks, pa.'],
    ], () => { state.step = 'russian'; dad.userData.leaving = true; updateObjective(); });
  } else {
    const lines = {
      list: 'Walk around the warehouse. Everything you see can go. Except the PC, that still works fine.',
      sell: 'That old PC has Kaasplaats on it. Sell everything there. Don\'t let them rip you off, jongen.',
      hire: 'A mixing table and a few Naknikim. Those boys aren\'t smart, but they mix like nobody else.',
      russian: 'Go on, the pawn shop at the east end. The Russian is expecting you.',
      map: 'Have a look at the map. Kaasland is big, and the Lampas are everywhere.',
      free: state.district1 ? (owns('frietwijk') ? 'Frietwijk! You took a joint in Oud-Vettenburg, jongen. Jan van Kaas will be fuming in his pier.' : 'Kipkruidenkwartier is ours again, jongen. Your old man is proud. Oud-Vettenburg is where the Lampas really live. Start with Frietwijk, the snack corner on the plaza.') : owns('spekbuurt') ? `Spekbuurt is ours. Now ${D1.filter(([, id]) => !owns(id)).map(([n]) => n).join(' and ')}. Then Kipkruidenkwartier is ours again.` : 'Spekbuurt is next. Three joints, all selling Lampas rubbish. Start there.',
    };
    dialogue([['Freddy Sr.', lines[state.step] || 'Get to work, jongen.']]);
  }
}
let shutterOpen = 0, shutterTarget = 0;
// What stands inside the warehouse is not drawn while the roof is on (Eddy outside, or away): the mixers, the racks and the
// production line were a quarter of the home street's draw calls and nobody could see them. Things in view of the open
// shutter stay. Done with layers, not .visible, so it never fights the game's own show/hide of a machine or a pallet.
const whIn = []; let whScan = 0, whHidden = false; const whBox = new THREE.Box3();
function whLayer(o, hide) { o.traverse((c) => { if (!c.isLight) c.layers.set(hide ? 1 : 0); }); } // lights stay: a light dropping out changes the light count, and every material in the street would recompile
function whCull(inside) {
  for (let k = 0; k < 30 && whScan < scene.children.length; k++, whScan++) { // sort the scene out a few objects a frame (and whatever is added later)
    const o = scene.children[whScan]; if (o.isLight || o.isCamera || o === player || o === dad || o.userData.mobile) continue; // (mobile: the production line, js/productie.js)
    let skinned = false; o.traverse((c) => { if (c.isSkinnedMesh || c.isInstancedMesh) skinned = true; }); if (skinned) continue;
    whBox.setFromObject(o); if (whBox.isEmpty()) continue;
    const b = whBox, within = b.min.x > WH.x0 + 0.15 && b.max.x < WH.x1 - 0.15 && b.min.z > WH.z0 + 0.15 && b.max.z < WH.z1 - 0.3 && b.max.y < WH.h - 0.15;
    const inDoorView = b.max.x > WH.doorX0 - 0.8 && b.min.x < WH.doorX1 + 0.8 && b.max.z > WH.z1 - 4.5;
    if (within && !inDoorView) { whIn.push(o); if (whHidden) whLayer(o, true); }
  }
  const hide = !inside;
  if (hide !== whHidden) { whHidden = hide; for (const o of whIn) whLayer(o, hide); }
}
function openShutter() { shutterTarget = 1; shutterSolid.off = true; beep(180, 0.5, 'sawtooth', 0.03); }

function updateObjective() {
  const n = state.listed.size, s = state.sold.size, N = junkDefs.length;
  if (state.step === 'list' && n === N) state.step = 'sell';
  const t = {
    title: '',
    talk: 'Talk to <b>Freddy Sr.</b> He\'s waiting for you in the warehouse.',
    list: `List the old shoarma junk for sale: walk up to each machine and press <b>E</b> (${n}/${N}).`,
    sell: `Sell everything on <b>Kaasplaats</b> using the Kaasdows XL PC at the back (${s}/${N} sold).`,
    hire: !state.table ? `Buy a <b>mixing table</b> on the PC (W ${TABLE_COST}).` : state.naknik === 0 ? `Hire your first <b>Naknik</b> on the PC (W ${NAKNIK_COST}).` : 'Talk to <b>Freddy Sr.</b> one last time.',
    map: 'Check the <b>map of Kaasland</b> on the PC or in the Oofmobiel.',
    dad2: 'Talk to <b>Freddy Sr.</b> one last time.',
    russian: 'Visit <b>The Russian</b>: go inside <b>Pandjeshuis Spasibo</b>, east end of the street.',
    free: state.district1 ? `<b style="color:#6ed36e">Kipkruidenkwartier is yours.</b>${state.loot ? ` Sell your ${state.loot} spice crate(s) on <b>Kaasplaats</b>.` : ''} ${state.act1 ? ` <span style="color:#6ed36e">Oud-Vettenburg is yours: the Lampas are finished.</span> ${NOSH.filter(([, id, , ok]) => !owns(id) && ok()).length ? `<span style="color:#ffd36b">Next: the Noshgey Kariot on Hipsterheuvel: ${NOSH.filter(([, id, , ok]) => !owns(id) && ok()).map(([n]) => `<b>${n}</b>`).join(', ')}.</span>` : state.act2 ? `<span style="color:#6ed36e">Hipsterheuvel is yours too: the Noshgey Kariot are finished.</span> ${paraNote()}${state.act3 ? `<span style="color:#6ed36e">De Duistere Dokken are yours: the Abdavissies are finished.</span> ${state.finale ? '<span style="color:#6ed36e">De Gouden Mix is yours. Kaasland is yours.</span> <span style="color:#ffd36b">New Game+ waits at De Gouden Molen on the map.</span>' : '<span style="color:#ffd36b">Next: <b>De Gouden Molen</b>, the windmill on the island. Dad’s recipe is there.</span>'}` : ABD.some(([, id]) => owns(id)) ? `<span style="color:#ffd36b">Docks next: ${ABD.filter(([, id, , ok]) => !owns(id) && ok()).map(([n]) => `<b>${n}</b>`).join(', ')}.</span>` : '<span style="color:#ffd36b">Next: the Abdavissies in De Duistere Dokken, starting with <b>Komijnkade</b>.</span>'}` : '<span style="color:#ffd36b">Next: <b>Speltpolder</b>, the Noshgey island headquarters.</span>'}` : owns('frietwijk') ? ` <span style="color:#6ed36e">${lampasOwned()}/${LAMPAS.length} of Oud-Vettenburg is yours.</span> <span style="color:#ffd36b">Next: ${LAMPAS.filter(([, id, , ok]) => !owns(id) && ok()).map(([n]) => `<b>${n}</b>`).join(', ') || 'Pindasausplein'}. Drive there in the <b>Oofmobiel</b>.</span>` : ' <span style="color:#ffd36b">Next: <b>Frietwijk</b> in Oud-Vettenburg, Lampas heartland. Drive there in the <b>Oofmobiel</b>.</span>'}` : owns('spekbuurt') ? `<b style="color:#6ed36e">${D1.filter(([, id]) => owns(id)).map(([n]) => n).join(' and ')} ${d1Owned() > 1 ? 'are' : 'is'} yours.</b>${state.loot ? ` Sell your ${state.loot} spice crate(s) on <b>Kaasplaats</b>.` : ''} <span style="color:#ffd36b">Next: take ${D1.filter(([, id]) => !owns(id)).map(([n]) => `<b>${n}</b>`).join(' and ')}.</span> Drive there in the <b>Oofmobiel</b>.` : 'Kitted out. Chapter 0 done. <span style="color:#ffd36b">Next: take Spekbuurt from the Lampas.</span> Get in the <b>Oofmobiel</b> and drive there.',
  }[state.step];
  if (state.step === 'hire' && state.table && state.naknik > 0) state.step = 'dad2';
  if (owns('spekbuurt')) tutorial.owned('spekbuurt');
  if (state.district1 && tutorial.active()) tutorial.skip(); // never got round to Shooki's tour: it stops nagging once the district is Eddy's
  updateKangoo();
  setObjective((tutorial.objective() || (freddy && freddy.objective()) || (spoed && state.step === 'free' && spoed.objective()) || t || '') + (state.step === 'free' && !mission.active ? `<div id="dayplan">${econ.planLine()}</div>` : ''));
  if (state.step === 'free' && !tutorial.active()) tips.show('day');
  if (['list', 'sell', 'hire', 'russian', 'free'].includes(state.step)) tips.show('step:' + state.step);
  if (state.step === 'free' && checkDistrict()) updateObjective();
  if (state.step === 'free' && checkAct1()) updateObjective();
  if (state.step === 'free' && checkAct2()) updateObjective();
  if (state.step === 'free' && checkAct3()) updateObjective();
  if (state.step === 'free' && checkPara()) updateObjective();
  if (state.step === 'free' && checkFinale()) updateObjective();
}

// phones (2026-11-26): three.js walked ~13.000 objects every frame to update matrices, most of them inside big hidden groups
// (interiors, the mission level, homes). A hidden group with many parts skips that walk; it is brought up to date the moment
// it hides and catches up by itself the frame it shows again.
// one E for everything (2026-11-26): the [E] label floats over the thing it belongs to (a person, a door, a crate),
// so it's always clear what E does; tap or click the label to do it. Off screen it sits at the bottom as before.
let promptFor = null, promptKey = '';
const promptV = new THREE.Vector3(), promptBox = new THREE.Box3();
function promptAnchor(it) {
  if (it.lift === undefined) { let h = 1.7; if (it.obj) { if (it.obj.userData && it.obj.userData.ps2) h = 2.15; else { promptBox.setFromObject(it.obj); if (isFinite(promptBox.max.y)) h = Math.max(1.1, Math.min(3.2, promptBox.max.y - it.pos().y + 0.35)); } } it.lift = h; }
  return promptV.copy(it.pos()).setY(it.pos().y + it.lift);
}
function showPrompt(it) {
  const key = `${glyph('E')}|${it.label()}`;
  if (key !== promptKey || promptFor !== it) { ui.prompt.innerHTML = `<b style="color:#ffd36b">[${glyph('E')}]</b> ${it.label()}`; promptKey = key; promptFor = it; }
  ui.prompt.style.display = 'block';
  const v = promptAnchor(it).project(camera), x = (v.x + 1) / 2 * innerWidth, y = (1 - v.y) / 2 * innerHeight;
  const ok = v.z < 1 && x > 20 && x < innerWidth - 20 && y > 70 && y < innerHeight - 40;
  ui.prompt.classList.toggle('float', ok);
  if (ok) { const w = ui.prompt.offsetWidth, cx = Math.max(w / 2 + 8, Math.min(innerWidth - w / 2 - 8, x)); ui.prompt.style.left = cx + 'px'; ui.prompt.style.top = y + 'px'; ui.prompt.style.setProperty('--tail', (x - cx) + 'px'); }
  else { ui.prompt.style.left = ui.prompt.style.top = ''; }
}
ui.prompt.addEventListener('click', (e) => { e.stopPropagation(); if (current && !state.inDialogue && !state.inPC && !choiceOpen && !(fiets && fiets.riding())) current.act(); });
// in a car the camera looks where it is going: up to 9 m ahead at speed
let driveZoom = 1, chaseH = Math.PI, chaseLow = 0, polderCam = false;
const driveFocus = () => { const p = player.position.clone(), v = fiets && fiets.current; if (polderCam && !(v && v.kind === 'car')) { p.z -= 5.5; p.y += 2.2; } /* Almere: look up the road, the A6 on the horizon */ if (v && v.kind === 'car') { const sp = Math.min(17, Math.abs(v.B.v) * 0.42) * Math.sign(v.B.v || 1); p.x += Math.sin(v.B.h) * sp; p.z += Math.cos(v.B.h) * sp; p.y = v.obj.position.y || 0; } return p; }; // (y: up on a snelweg viaduct, js/rit.js)
const roomCam = () => (woning && woning.inside() ? woning : winkels && winkels.inside() ? winkels : pahuis && pahuis.inside() ? pahuis : null); // rooms frame the camera themselves
function skipHiddenMatrices() {
  for (const c of scene.children) {
    if (c.visible) { c.matrixWorldAutoUpdate = true; continue; }
    if (!c.matrixWorldAutoUpdate) continue; // already parked
    let n = 0; c.traverse(() => { n++; }); if (n <= 40) continue; // small things (a walker at home) keep updating
    c.updateMatrixWorld(true); c.matrixWorldAutoUpdate = false;
  }
}
// ------------------------------------------------------------------ save (localStorage, one versioned key)
// Everything worth keeping lives in `state`; the world (sold junk, shutter, table, Naknikim, Freddy Sr. gone) is rebuilt from it on load.
// Unknown fields in a save (from a newer build) are kept and written back untouched.
const SAVE_KEY = 'spiceMasterEddy.save', SAVE_VER = 1;
const SAVE_FIELDS = ['top10', 'blokaas', 'blokaasRecept', 'inricht', 'koffie', 'vaste', 'introSeen', 'spoed', 'goed', 'step', 'money', 'table', 'naknik', 'mapSeen', 'kit', 'metRussian', 'raids', 'loan', 'metNabil', 'metSchmatzel', 'loot', 'spekbuurt', 'spekbuurtLootTaken', 'owned', 'lootTaken', 'district1', 'drives', 'ammo', 'pool', 'loadout', 'stash', 'econ', 'best', 'daily', 'act1', 'act2', 'act3', 'finale', 'paravim', 'rasCall', 'ngp', 'npcs', 'freddy', 'ws', 'van', 'crew', 'crewDay', 'heists', 'hg', 'eddy', 'tins', 'tut', 'tips', 'loods', 'guide', 'activists', 'prod', 'sollis', 'cops', 'bills', 'winkels', 'buurtrep', 'vandaag', 'seenTabs', 'klok', 'stats', 'stam',
  // never saved before 2026-11-26 although their modules said so: gun shop buys, the weather and paper, Johan, the club, the buurt
  'mods', 'upg', 'nades', 'nadeSel', 'spares', 'gear', 'ruStock', 'weer', 'johan', 'club', 'dealer', 'buurt'];
let saveExtra = {}, loadingSave = false, titleConfirm = false;
function readSave() { // the home district was renamed from De Natte Worst (2026-11): old saves carry the old name in news and turf text
  try { let raw = localStorage.getItem(SAVE_KEY); if (!raw) return null; raw = raw.replace(/(De |de )?Natte Worst/g, 'Kipkruidenkwartier'); const d = JSON.parse(raw); return d && typeof d === 'object' && d.state && typeof d.state === 'object' ? d : null; }
  catch (e) { return null; }
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* storage blocked */ } saveExtra = {}; }
function writeSave() {
  if (loadingSave || state.step === 'title' || (mission && mission.active)) return false; // mid-mission progress is saved when the mission ends
  const st = { ...(saveExtra.state || {}) };
  for (const k of SAVE_FIELDS) if (state[k] !== undefined) st[k] = state[k];
  st.listed = [...state.listed]; st.sold = [...state.sold];
  const d = { ...saveExtra, v: SAVE_VER, at: Date.now(), state: st, settings: { ...(saveExtra.settings || {}), music: music.on } };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); saveExtra = d; return true; } catch (e) { return false; }
}
function applySave(d) {
  loadingSave = true; saveExtra = d;
  const s = d.state;
  for (const k of SAVE_FIELDS) if (s[k] !== undefined && k !== 'naknik') state[k] = s[k];
  tutorial.migrate(s.tut); // saves from before the tour skip it
  tips.migrate(s.tips);
  state.guide = s.guide && typeof s.guide === 'object' ? { done: { ...(s.guide.done || {}) }, off: !!s.guide.off } : { done: {}, off: false }; // Shooki's guided cards pick up wherever the save is
  state.kit = Array.isArray(s.kit) ? s.kit.slice() : []; state.ammo = { ...(s.ammo || {}) }; if (s.pool) state.pool = { ...s.pool };
  state.loan = { amount: 1000, out: false, at: 0, ...(s.loan || {}) };
  state.listed = new Set(s.listed || []); state.sold = new Set(s.sold || []); state.shown = state.money = +s.money || 0;
  for (const j of junkDefs) { if (state.sold.has(j.id)) { j.solid.off = true; j.group.visible = false; } else if (state.listed.has(j.id)) j.tag.visible = true; }
  if (state.step !== 'talk') { shutterTarget = shutterOpen = 1; shutterSolid.off = true; }
  if (state.table) { mixTable.visible = true; if (!mixSolid) mixSolid = solid(-8.0, -3.2, -13.4, -11.8); }
  if (loods) loods.loaded(); state.naknik = 0; for (let i = 0; i < Math.min(loods ? loods.naknikCap() : 3, +s.naknik || 0); i++) spawnNaknik(false);
  if (state.step !== 'talk') dadOutside(); // the keys were handed over: Freddy Sr. is out front (or gone)
  if (['russian', 'free'].includes(state.step)) { dad.visible = false; dad.userData.leaving = false; dadSolid.off = true; }
  mission.migrateKit(); kitText(); if (state.kit.includes('maboota')) equip(false); // holstered: it's not something you walk the street with (js/maboota.js)
  paintVan(garage.stats().paint); // the van Eddy owns now
  if (!s.loadout) state.loadout = null; if (!s.stash) state.stash = null; mission.migrateKit(); kitText();
  if (woning) woning.loaded();
  loadingSave = false;
}
let savedGame = readSave();
// ---- start menu: Continue / New Game / Controls / Music / Credits (mouse, keyboard, controller and touch)
let titleView = 'main', titleSel = 0;
const districtSummary = (st) => (st.econ && st.econ.rep ? ` · ${rankOf(st.econ.rep).name}` : '') + (st.district1 ? ' · Kipkruidenkwartier is yours' : ((n) => (n ? ` · ${n}/3 of Kipkruidenkwartier` : ''))(['spekbuurt', 'kroketkade', 'uitjesbuurt'].filter((id) => (st.owned && st.owned[id]) || (id === 'spekbuurt' && st.spekbuurt)).length));
const titleItems = () => titleView === 'confirm' ? [['no', 'Nee, terug'], ['yes', 'Ja, opnieuw beginnen']]
  : titleView === 'controls' || titleView === 'credits' ? [['back', 'Terug']]
  : [...(savedGame ? [['cont', 'Continue']] : []), ['new', 'New Game'], ['controls', 'Controls'], ['music', 'Music'], ['fonts', 'Lettertype'], ['credits', 'Credits']];
function titleMenu(confirm) {
  if (confirm === true) titleView = 'confirm'; else if (confirm === false && titleView === 'confirm') titleView = 'main';
  titleConfirm = titleView === 'confirm';
  const items = titleItems(); titleSel = Math.max(0, Math.min(titleSel, items.length - 1));
  const sub = (t) => t === 'music' ? (musicWanted() ? 'ON' : 'OFF') : t === 'fonts' ? (fonts.mode === 'aero' ? 'AERO' : 'KLASSIEK') : t === 'cont' && savedGame ? `W ${(+savedGame.state.money || 0).toLocaleString('nl-NL')}` : '';
  let panel = '';
  if (titleView === 'controls') panel = `<div class="tpanel"><h3>Controls</h3>${controlsTable()}</div>`;
  if (titleView === 'credits') panel = `<div class="tpanel"><h3>Credits</h3><p>An original Kaasland story about Eddy Jr., his father's spice warehouse and the Lampas.</p>
    <p><b>Engine:</b> three.js (MIT) · <b>Textures:</b> ambientCG (CC0) · <b>Music:</b> generated live in your browser</p>
    <p><b>Motion capture:</b> CMU Graphics Lab Motion Capture Database (mocap.cs.cmu.edu, created with funding from NSF EIA-0196217), BVH conversion by Bruce Hahne</p>
    <p><b>Fonts</b> (SIL Open Font License): Selawik by Microsoft · Nunito by Vernon Adams · Bungee by David Jonathan Ross · Rubik by Hubert &amp; Fischer · VT323 by Peter Hull · Press Start 2P by Cody "CodeMan38" Boisclair</p>
    <p>Built with Claude Code.</p></div>`;
  if (titleView === 'confirm') panel = `<div class="tpanel"><h3>Nieuw spel?</h3>Your saved game will be gone for good.</div>`;
  $('tmenu').innerHTML = panel + items.map(([t, label], i) => `<div class="mi${i === titleSel ? ' sel' : ''}" data-t="${t}"><span>${label}</span><small>${sub(t)}</small></div>`).join('');
  const m = inputMode(), info = m === 'pad' ? 'D-pad to choose · A to select · B back' : m === 'touch' ? 'Tap to choose' : '↑ ↓ to choose · Enter to select · Esc back';
  $('tinfo').textContent = titleView === 'main' && savedGame ? `Saved ${new Date(savedGame.at || Date.now()).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}${districtSummary(savedGame.state)} · ${info}` : info;
}
let musicPref = !(savedGame && savedGame.settings && savedGame.settings.music === false);
const musicWanted = () => musicPref;
function titleAct(t) {
  beep(660, 0.05, 'triangle', 0.04);
  if (t === 'cont') continueGame();
  else if (t === 'new') { if (savedGame) { titleSel = 0; titleMenu(true); } else startGame(); }
  else if (t === 'yes') newGame();
  else if (t === 'no' || t === 'back') { titleView = 'main'; titleSel = 0; titleMenu(false); }
  else if (t === 'controls' || t === 'credits') { titleView = t; titleSel = 0; titleMenu(); }
  else if (t === 'fonts') { fonts.cycle(); titleMenu(); }
  else if (t === 'music') { musicPref = !musicPref; try { if (musicPref) music.start(); else music.stop(); } catch (e) { /* audio optional */ } titleMenu(); }
}
titleMenu(false);
let titleCity = null; try { titleCity = createTitleCity($('title')); } catch (e) { console.error(e); }
function leaveTitle() { $('title').style.display = 'none'; document.body.classList.remove('on-title'); if (titleCity) { titleCity.stop(); titleCity = null; } }
// hints follow the last device used (keyboard / controller / touch)
const HELP = {
  mouse: 'WASD move · Shift run · E interact / click · Wheel zoom · M map · N music · I inventory · 1 Maboota · F / click attack · P pause · guns on missions only',
  pad: 'Left stick move · LB run · A interact · RT attack · RB map · D-pad ▼ inventory · Start pause',
  touch: '',
};
function deviceHints() {
  const m = inputMode();
  $('help').textContent = HELP[m];
  const nx = document.querySelector('#dialogue .next'); if (nx) nx.textContent = m === 'pad' ? 'A to continue' : m === 'touch' ? 'tap to continue' : 'E / click to continue';
  if (state.step === 'title') titleMenu();
}
onInputMode(deviceHints);
addEventListener('pagehide', () => writeSave());

// ------------------------------------------------------------------ input
const keys = {};
addEventListener('keydown', (e) => {
  if (state.step === 'title') { titleKey(e); return; }
  keys[e.code] = true;
  if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
    if (state.inDialogue) { nextLine(); return; }
    if (choiceOpen) return;
    if (!state.inPC && current) current.act();
  }
  if (e.code === 'Escape' && top10 && top10.isOpen()) { e.preventDefault(); top10.escape(); return; }
  if ((e.code === 'Escape' || e.code === 'Tab') && hub && hub.isOpen()) { e.preventDefault(); hub.escape(); return; } // the top window closes first
  if (e.code === 'Tab' && !state.inPC && !state.inDialogue && !choiceOpen && !(mission && mission.active) && hub) { e.preventDefault(); hub.show(); return; }
  if (e.code === 'Escape' && state.inDialogue && !choiceOpen) { nextLine(); return; } // Esc never leaves a line hanging: it moves on like E
  if (e.code === 'Escape' && choiceOpen) { if (choiceCancel !== null) closeChoice(choiceCancel); return; }
  if (e.code === 'Escape' && state.inPC) { if ($('shop').style.display === 'block') closeShop(); else if (!($('pc').style.display === 'block' && kd.escape())) closePC(); }
  if (e.code === 'KeyN') { const on = music.toggle(); toast(on ? 'MUSIC ON' : 'MUSIC OFF', '', 1); writeSave(); }
  if (e.code === 'KeyM' && !state.inDialogue && !choiceOpen) state.inPC ? closePC() : openPC('map', 'pc');
  if ((e.code === 'Digit1' || e.code === 'Numpad1') && !state.inPC && !state.inDialogue) { if (state.kit.includes('maboota')) equip(!state.armed); else toast('NO WEAPON', 'You have nothing to hold yet.', 1.4); }
  if (e.code === 'KeyF' && !state.inPC && !state.inDialogue) swing();
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
let zoom = 1;
addEventListener('wheel', (e) => { if (!state.inPC) zoom = Math.max(0.6, Math.min(1.6, zoom + Math.sign(e.deltaY) * 0.08)); }, { passive: true });
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
canvas.addEventListener('pointerdown', (e) => {
  if (state.inDialogue) { nextLine(); return; }
  if (state.inPC || (fiets && fiets.riding())) return;
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  for (const it of inter) {
    if (!it.obj || (it.enabled && !it.enabled())) continue; // prompt-only interactables (De Loods, the woning) have no mesh to click
    if (ray.intersectObject(it.obj, true).length) {
      const d = it.pos().distanceTo(player.position);
      if (d <= it.r + 0.6 || it.far) it.act(); else if (state.armed) swing(); else toast('TOO FAR', 'Walk over there first.', 1.4);
      return;
    }
  }
  if (state.armed) swing();
});
$('title').addEventListener('click', (e) => { const t = e.target.closest('[data-t]'); if (t) titleAct(t.dataset.t); });
$('title').addEventListener('mousemove', (e) => { const t = e.target.closest('.mi'); if (!t) return; const i = [...$('tmenu').querySelectorAll('.mi')].indexOf(t); if (i >= 0 && i !== titleSel) { titleSel = i; $('tmenu').querySelectorAll('.mi').forEach((el, k) => el.classList.toggle('sel', k === i)); } });
function titleKey(e) {
  const items = titleItems();
  if (['ArrowUp', 'KeyW'].includes(e.code)) { titleSel = (titleSel + items.length - 1) % items.length; titleMenu(); beep(700, 0.03, 'square', 0.02); return; }
  if (['ArrowDown', 'KeyS', 'Tab'].includes(e.code)) { e.preventDefault(); titleSel = (titleSel + 1) % items.length; titleMenu(); beep(700, 0.03, 'square', 0.02); return; }
  if (['Enter', 'Space', 'KeyE'].includes(e.code)) { titleAct(items[titleSel][0]); return; }
  if (titleConfirm && ['KeyJ', 'KeyY'].includes(e.code)) { newGame(); return; }
  if (['Escape', 'Backspace'].includes(e.code) && titleView !== 'main') { titleAct('back'); return; }
  if (e.code === 'KeyN' && titleView === 'main') titleAct('new');
  if (e.code === 'KeyC' && titleView === 'main' && savedGame) titleAct('cont');
}
function newGame() { clearSave(); savedGame = null; startGame(); }
function continueGame() {
  if (state.step !== 'title') return;
  applySave(savedGame); leaveTitle(); camPos.copy(player.position).add(new THREE.Vector3(0, 14, 4.5)); camLook.copy(player.position); updateObjective(); beep(440, 0.1, 'triangle');
  toast('WELKOM TERUG', `W ${state.money.toLocaleString('nl-NL')} in your pocket.`, 2);
  if (musicPref) { try { music.start(); } catch (e) { /* audio optional */ } }
}
function startGame() {
  if (state.step !== 'title') return;
  tutorial.begin(); tips.reset(); state.guide = { done: {}, off: false }; setTimeout(() => tips.show('start'), 2600);
  leaveTitle(); camPos.copy(player.position).add(new THREE.Vector3(0, 14, 4.5)); camLook.copy(player.position); state.step = 'talk'; updateObjective(); beep(440, 0.1, 'triangle'); writeSave();
  if (musicPref) { try { music.start(); } catch (e) { /* audio optional */ } }
  toast('KIPKRUIDENKWARTIER', 'Freddy Sr. is waiting for you in the warehouse.', 2.6);
}

await bootStep(70, 'Waking up the neighbours…');
// ------------------------------------------------------------------ street life: traffic, cyclists, pedestrians
// Kaasland drives on the right: westbound on the north lane, eastbound on the south lane.
// Speech bubbles for angry drivers (canvas sprite, redrawn per shout)
function bubble() { return balloons.anchor(); } // HTML Aero balloons over a 3D anchor (js/balloons.js)
function say(sp, text, col = '#e8a33d', life = 2.2, name = '') { balloons.say(sp, text, col, life, name); }
const DRIVER_SHOUTS = ['TOET TOET!', 'Hé kaaskop, aan de kant!', 'Get off the road, gek!', 'Doe normaal, man!', 'I\'m late for my frikandel!', 'MOVE IT, spice boy!', 'Rij ik jou aan of hoe zit het?', 'Ga fietsen ofzo!'];
const BIKE_SHOUTS = ['TRING TRING!', 'Fietspad, hè?!', 'Kijk uit, joh!', 'This is a BIKE lane!'];
// a real van's claxon (2026-11-26): the two-tone electric horn of a delivery van, a low and a high disc sounding together
// (about 410 and 510 Hz), buzzy, straight on and straight off. For Eddy's own horn in a car; the street's traffic keeps honk().
function claxon(dur = 0.55) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime, out = actx.createGain(), lp = actx.createBiquadFilter(), sh = actx.createWaveShaper();
    lp.type = 'lowpass'; lp.frequency.value = 2600; lp.Q.value = 0.8;
    { const n = 256, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(x * 2.6); } sh.curve = c; } // the rasp of a horn diaphragm
    out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.11, t + 0.018); out.gain.setValueAtTime(0.11, t + dur); out.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.07);
    for (const [f, type, g] of [[410, 'sawtooth', 0.5], [510, 'sawtooth', 0.45], [820, 'square', 0.12], [1020, 'square', 0.1]]) {
      const o = actx.createOscillator(), og = actx.createGain(); o.type = type; o.frequency.setValueAtTime(f * 0.97, t); o.frequency.linearRampToValueAtTime(f, t + 0.04); og.gain.value = g; o.connect(og).connect(sh); o.start(t); o.stop(t + dur + 0.1);
    }
    sh.connect(lp).connect(out).connect(actx.destination);
  } catch (e) { /* audio is optional */ }
}
function honk() { beep(415, 0.32, 'square', 0.035); setTimeout(() => beep(349, 0.42, 'square', 0.035), 160); }
function bell() { beep(2100, 0.12, 'sine', 0.04); setTimeout(() => beep(2100, 0.18, 'sine', 0.04), 140); }
// knockback when traffic hits you
const knock = { vx: 0, vz: 0, vy: 0, t: 0 };
const moveV = { x: 0, z: 0 }; // Eddy's walking velocity (eased, see the movement block in the loop)
function bump(vx, vz, up, line) {
  if (knock.t > 0) return;
  knock.vx = vx; knock.vz = vz; knock.vy = up; knock.t = 0.9;
  beep(110, 0.25, 'sawtooth', 0.06); setTimeout(() => beep(70, 0.3, 'square', 0.05), 60);
  toast('BONK!', line, 1.6);
}
const traffic = [];
for (let i = 0; i < 6; i++) {
  const dir = i % 2 ? 1 : -1, z = RC + (dir > 0 ? 1.5 : -1.5);
  const c = car(-60 + i * 21, z, CAR_COLS[(i * 4 + 1) % CAR_COLS.length], dir > 0 ? 0 : Math.PI, false, [0, 1, 6, 2, 5, 3][i]);
  c.userData.dir = dir; c.userData.v = 8; c.userData.vmax = 7 + (i % 3) * 1.5;
  c.userData.solid = solid(0, 0, 0, 0);
  c.userData.blockT = 0; c.userData.honkT = 0;
  c.userData.bubble = bubble(); c.add(c.userData.bubble); c.userData.bubble.position.set(0, 3.0, 0);
  traffic.push(c);
}
// bikes, Kaasland-style: kind 0 normal, 1 tricycle, 2 four-seater "vierfiets", 3 tall bike, 4 bakfiets with a cheese
function makeBike(color, kind = 0) { // js/bikes.js builds them now: real tubes, spoked wheels, mudguards, crates and cranks
  const b = makeBikeModel(THREE, kind, color, { trim: kind === 0 || kind === 10 ? 0x1a1a1a : undefined }); scene.add(b); return b;
}
const SKINS = [0xf0c8a8, 0xe0a882, 0xc8885e, 0x9a6440, 0x6a4028, 0xf4d2bc];
const HAIRS = ['#1a1410', '#3a2a1a', '#7a5a30', '#d8c080', '#a0602e', '#8a8a8a', '#202020'];
const SHIRTS = ['#c83a2a', '#2a5a9a', '#e8e2d0', '#3a7a4a', '#f2c31a', '#2a2a30', '#8a4aa0', '#e87a9a', '#1a6a6a', '#d06a20'];
const PANTS = [0x2a3a5a, 0x3a3a3a, 0xc8b89a, 0x1a1a22, 0x5a4a3a, 0x4a5a7a];
function passerBy(seed, opt = {}) {
  const r = (k) => (Math.sin(seed * 97.13 + k * 13.7) * 43758.5453) % 1, ri = (n, k) => Math.floor(Math.abs(r(k)) * n);
  const lk = opt.look || {}; // a street-folk archetype's clothes (js/streetfolk.js)
  const female = lk.female ?? opt.female ?? (ri(2, 20) === 0), kid = !!opt.kid, police = !!opt.police;
  const skin = lk.skin || SKINS[ri(SKINS.length, 1)], hair = lk.hair ? lk.hair : lk.grey ? ['#c8c8c4', '#e8e6e0', '#9a9a96'][ri(3, 2)] : HAIRS[ri(HAIRS.length, 2)];
  const head = { skin, hair, brow: hair, hairLine: 84 + ri(10, 3), sideLine: 116, backLine: 150, mouth: ri(2, 4) ? 'smile' : 'laugh', iris: ['#4a2e1c', '#3a5a7a', '#2a2a2a'][ri(3, 5)], glasses: !kid && ri(5, 6) === 0,
    long: female ? ri(4, 7) !== 0 : ri(6, 7) === 0, bun: female && ri(3, 8) === 0, bald: !female && !kid && !police && ri(7, 9) === 0 };
  if (lk.bun) { head.bun = true; head.long = false; } if (lk.glasses) head.glasses = true; if (lk.glasses === false) head.glasses = false; if (lk.long !== undefined) head.long = lk.long; if (lk.bald === false) head.bald = false; if (lk.grey && !female) head.bald = ri(2, 9) === 0;
  if (head.bald) head.hairLine = 40;
  if (female) head.mouth = 'smile';
  const shirt = police ? '#1d2a4ap' : lk.shirt || SHIRTS[ri(SHIRTS.length, 10)] + (ri(4, 11) === 0 ? 's' : '');
  const skirt = lk.skirt ?? (female && !police && ri(2, 16) === 0 ? [0xe8862c, 0x2a2a30, 0x3a7ad8, 0xf2e8c8, 0x8a4aa0][ri(5, 17)] : null);
  return makePerson({ head, police, front: shirt, pants: police ? 0x1a2238 : lk.pants ?? (skirt ? [0x2a1a1a, skin][ri(2, 18)] : PANTS[ri(PANTS.length, 12)]), shoes: police ? 0x111111 : lk.shoes ?? [0x1a1a1a, 0xe8e8e8, 0x5a3a1a, 0xc8102e][ri(4, 13)],
    belly: kid || female ? 0 : lk.belly ?? [0, 0, 0.4, 0.8][ri(4, 14)], chest: female && !kid ? 1 + Math.abs(r(19)) * 0.35 : 0, skirt, skin,
    suit: lk.suit, ballcap: lk.ballcap, feltHat: lk.feltHat,
    scale: (kid ? 0.56 + Math.abs(r(15)) * 0.1 : (female ? 0.88 : 0.93) + Math.abs(r(15)) * 0.12) * (lk.scale || 1) });
}
// things people walk with
function makeStroller() {
  const g = new THREE.Group(), c = [0x2a4a7a, 0xd84a7a, 0x2a6a4a, 0xe8d8b0][Math.floor(Math.random() * 4)];
  for (const [x, z] of [[0.28, 0.22], [0.28, -0.22], [-0.25, 0.22], [-0.25, -0.22]]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 5, 12), mat.black); w.position.set(x, 0.12, z); g.add(w); }
  box(0.62, 0.05, 0.42, mat.dark, 0, 0.26, 0, g, false);
  const tub = box(0.6, 0.3, 0.4, lam({ color: c }), 0.02, 0.48, 0, g); 
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: c, side: THREE.DoubleSide })); hood.position.set(-0.12, 0.62, 0); hood.rotation.z = 0.4; hood.scale.set(1, 1, 0.95); g.add(hood);
  const baby = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), lam({ color: 0xf4d2bc })); baby.position.set(0.12, 0.66, 0); g.add(baby);
  box(0.04, 0.5, 0.04, mat.dark, -0.42, 0.62, 0, g, false).rotation.z = 0.5; box(0.04, 0.04, 0.42, mat.dark, -0.52, 0.84, 0, g, false);
  scene.add(g); return g;
}
function makeDog(seed) {
  const g = new THREE.Group(), cols = [0x8a5a2a, 0x1a1a1a, 0xe8d8b0, 0xd89a4a, 0x6a6a6a], c = lam({ color: cols[seed % cols.length] }), sz = [0.8, 1.15, 0.6][seed % 3];
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.36, 4, 10), c); body.rotation.z = Math.PI / 2; body.position.y = 0.36; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), c); head.position.set(0.32, 0.5, 0); g.add(head);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.09), c); snout.position.set(0.43, 0.47, 0); g.add(snout);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 5), mat.black); nose.position.set(0.5, 0.49, 0); g.add(nose);
  for (const z of [-0.07, 0.07]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.04), c); e.position.set(0.3, 0.6, z); e.rotation.x = z > 0 ? 0.4 : -0.4; g.add(e); }
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.22, 6), c); tail.position.set(-0.3, 0.48, 0); tail.rotation.z = -0.8; g.add(tail);
  const legs = [];
  for (const [x, z] of [[0.18, 0.07], [0.18, -0.07], [-0.18, 0.07], [-0.18, -0.07]]) { const l = new THREE.Group(); l.position.set(x, 0.3, z); g.add(l); const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.05), c); m.position.y = -0.15; l.add(m); legs.push(l); }
  g.scale.setScalar(sz); g.userData = { legs, tail, ph: 0 };
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(g); return g;
}
const leashMat = new THREE.LineBasicMaterial({ color: 0xe8862c });
const cyclists = [];
const BIKE_KINDS = [0, 2, 1, 10, 4, 3, 0, 11, 5, 6, 7, 8, 9, 10, 0, 4];
BIKE_KINDS.forEach((kind, i) => {
  const dir = i % 2 ? -1 : 1, z = RC + (dir > 0 ? 5.85 : 6.95);
  const bike = makeBike(BIKE_PAINT[i % BIKE_PAINT.length], kind);
  const riders = bike.userData.seats.map(([sx, sy, pose], k) => {
    const r = passerBy(100 + i * 5 + k); scene.remove(r); bike.add(r);
    r.position.set(sx - 0.02, sy - 0.9, 0); r.rotation.y = Math.PI / 2;
    r.userData.arms[0].rotation.x = r.userData.arms[1].rotation.x = -1.0;
    r.userData.squat = pose === 'squat'; // mini bikes: knees up by the ears
    if (r.userData.squat) { r.position.y = sy - 0.62; r.scale.y = 0.94; }
    return r;
  });
  bike.position.set(-64 + i * 8.3, 0, z); bike.rotation.y = dir > 0 ? 0 : Math.PI;
  const len = bike.userData.len;
  bike.userData = { dir, v: 4, vmax: kind === 2 ? 3.2 : kind === 1 ? 2.8 : kind === 5 ? 2.6 : kind === 9 ? 2.4 : kind >= 6 ? 3.2 : 4 + (i % 3) * 0.6, riders, phase: i, len, kind, bubble: bubble(), shoutT: 0 };
  bike.add(bike.userData.bubble); bike.userData.bubble.position.set(0, { 3: 3.6, 6: 3.4, 7: 4.1, 8: 4.1, 9: 4.5 }[kind] || 2.7, 0);
  cyclists.push(bike);
});
const walkers = [];
const LANES = { N: [-4.5, -5.25], S: [RC + 8.55, RC + 9.45], F: FAR.lane }; // F: the quay across the canal
const folk = createStreetFolk({ scene, lam, mat, box, beep });
for (let i = 0; i < 20; i++) {
  const side = i >= 16 ? 'F' : i % 2 ? 'S' : 'N', dir = (i >> 1) % 2 ? 1 : -1;
  const police = i === 4 || i === 13, arch = police ? null : folk.SLOTS[i >= 16 ? [9, 6, 11, 1][i - 16] : i], A_ = arch && folk.ARCH[arch];
  const p = passerBy(i + 1, { police, look: A_ ? A_.look : undefined, female: arch === 'buggy' || arch === 'pram' ? i % 3 !== 2 : undefined });
  p.position.set(-60 + ((i * 37) % 130), 0, LANES[side][dir > 0 ? 0 : 1]);
  const u = { side, dir, v: police ? 1.0 : A_ ? A_.v * (0.92 + ((i * 7) % 5) * 0.04) : 1.1 + ((i * 7) % 5) * 0.12, wait: 0, blocked: 0, police, comp: null };
  if (A_) u.comp = folk.dress(p, arch, i, {
    kid: (seed) => passerBy(seed, { kid: true }),
    dog: (k) => { const d = makeDog(k); const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), leashMat); scene.add(line); return { type: 'dog', obj: d, ahead: 1.3, off: 0.35, line }; },
  });
  p.userData.walk = u;
  walkers.push(p);
}
// Kaasland leeft (js/kaasweer.js): weekdays, seasons, weather on the street and in the trade, Krant voor het Kaasvolk
world = createKaasweer({ stories: (y, d) => [...(blokaas ? blokaas.stories(y) : []), ...(top10 ? top10.stories(d) : [])], league: (d) => (top10 ? top10.paperBox(d) : ''), smallAd: (d) => (blokaas ? blokaas.smallAd(d) : null), ad: (d) => (buurt ? buurt.paperAd(d) : ''), THREE, state, scene, hemi, sun, walkers, wetMats, econ, day: () => econ.ensure().day, rank: () => rankNow(), active: () => state.step === 'free',
  busy: () => !!mission.active, thunder: () => { beep(42, 1.1, 'sawtooth', 0.035); setTimeout(() => beep(31, 1.4, 'triangle', 0.05), 120); },
  onApply: (w, c, tod) => { if (state.step === 'free' && !['zon', 'bewolkt'].includes(w.id)) tips.show('weer');
    const n = tod ? tod.n : 0; lampHeadMat.emissive.setHex(0x806a30).multiplyScalar(1 + 3.2 * n); lampPools.visible = n > 0.05; for (const q of morePools) q.visible = n > 0.05; lampPools.material.opacity = 0.42 * n; oldGlassLit.emissiveIntensity = 0.3 + 1.0 * n; shopLit.emissiveIntensity = 0.16 + 0.9 * n; } }); // lamps and windows come on at dusk (js/klok.js)
buurt = createBuurt({ far: FAR, bridges: BRIDGES, canal: [CZ - 3.75, CZ + 3.75], THREE, scene, state, player, world: () => world, z: ROAD.walk1 - 0.6, rc: RC, walk: WALK, houses: () => streetHouses, solid, addInteract, choice, toast, beep, tip: (k) => tips.show(k),
  busy: () => !!mission.active, indoors: () => isInside(player.position) || !!(winkels && winkels.inside()) || !!(woning && woning.inside()) || !!(venues && venues.inside()) });
bfolk = createBuurtFolk({ openNow: (id, days, wd) => (klok ? klok.openNow(id, days, wd) : true), serve: (f) => { if (vandaag) vandaag.note('talk'); return winkels ? winkels.serve(f) : false; }, scene, player, far: FAR, world: () => world, addInteract, dialogue, makePerson: (look, scale) => makePerson({ ps2: look, scale }), animate: (p, dt) => animate(p, 0, dt), busy: () => !!(mission.active || tripOn()) });
regulars = createRegulars({ THREE, scene, player, state, box, cyl, lam, signTex, solid, sit, addInteract, dialogue, choice, toast, beep, addMoney, save: () => writeSave(), world: () => world,
  makePerson: (look, scale) => makePerson({ ps2: look, scale }), animate: (p, dt) => animate(p, 0, dt), busy: () => !!(mission.active || tripOn()), levels: () => mission.LEVELS,
  nextJoint: () => ['spekbuurt', 'kroketkade', 'uitjesbuurt', ...ACT_JOINTS.filter((j) => j[3]()).map((j) => j[1])].find((id) => !owns(id)),
  shopSpots: () => bfolk.folk.filter((f) => f.p.visible).map((f) => ({ name: f.name, x: f.p.position.x, z: f.p.position.z })),
  point: (x, z, n) => buurt.setPoint(x, z, n), clearPoint: () => buurt.clearRoute(), rep: (d, why) => brep.add('kade', d, why), music: () => media.play() });
winkels = createWinkels({ openNow: (id, days, wd) => (klok ? klok.openNow(id, days, wd) : true), hoursText: (id) => (klok ? klok.hoursText(id) : ''), THREE, scene, player, state, econ, world: () => world, bfolk: () => bfolk, BIZ, box, cyl, lam, canvasTex, signTex, solid, addInteract, dialogue, choice, toast, beep, addMoney,
  save: () => writeSave(), busy: () => !!(mission.active || tripOn()), setBounds: (b) => { BOUNDS.cur = b; }, snapCam: () => window.__sme.snapCam(), chat: (f) => bfolk.chat(f),
  doorAt: (id) => { const b = BIZ.find((x) => x.id === id), w = b.x1 - b.x0, look = SHOPLOOK[id] || {}, dx = look.door === 'c' ? 0 : (look.door === 'l' ? -1 : 1) * (w * 0.9 / 2 - 0.72); return { x: (b.x0 + b.x1) / 2 - dx, z: FAR.front }; },
  onJob: (biz, kind) => { const k = bfolk.folk.find((f) => f.biz === biz), nm = k ? k.name : biz; if (stats && kind !== 'miss') stats.add(kind === 'job' ? 'klusjes' : 'vaste'); if (kind === 'job' && vandaag) vandaag.note('klus'); brep.add('kade', kind === 'job' ? 6 : kind === 'order' ? 1 : -2, kind === 'job' ? `helped ${nm}` : kind === 'miss' ? `${nm}'s order missed` : null); } });
const LINES_POLICE = ['Alles in orde hier, meneer?', 'No loitering near the canal.', 'We are watching the Lampas boys. And you.', 'Nice van. Is it registered?'];
// Everyday Kaasland grumbling: the weather, Den Haag, petrol, groceries, rent. Generic parody, nobody real named.
// GRIPES are the longer "Say hi" answers; MUTTERS are short enough for a speech bubble when Eddy walks past.
const GRIPES = [
  'Weer regen. Gisteren regen. Morgen? Drie keer raden.',
  'Buienradar zei droog. Buienradar liegt. Altijd.',
  'Vier seizoenen op één dag, en ze zijn allemaal herfst.',
  'Twintig jaar fiets ik hier. Tegenwind. Beide kanten op!',
  'We hadden ook een zomer, hoor. Op een dinsdag. Moest ik werken.',
  'Den Haag, hè. Vergaderen tot ze een ons wegen en dan een commissie oprichten.',
  'Ze gaan het "onderzoeken". Dat zeggen ze al sinds mijn communie.',
  'Kabinet gevallen? Alweer? M’n vorige stempas ligt nog op het kastje.',
  'Die lui in Den Haag hebben nog nooit een fietsenstalling van binnen gezien.',
  'Verkiezingen weer. Andere poppetjes, zelfde toneelstuk.',
  'Twee euro dertig voor een liter benzine! Ik ga lopen. O wacht, dat doe ik al.',
  'Ik tank tegenwoordig per tientje. Dan voelt het minder erg.',
  'Ik zag een benzineprijs en moest even gaan zitten. Op de stoeprand.',
  'Een komkommer van een euro! Een KOMKOMMER, meneer.',
  'Vroeger deed ik boodschappen voor een tientje. Nu krijg je daarvoor de tas.',
  'Kaas is onbetaalbaar geworden. In Kaasland! Het moet niet gekker worden.',
  'Bonuskaart, app, zegeltjes... en nóg zes euro voor een pak koffie.',
  'Krimpflatie, noemen ze dat. Zelfde prijs, halve zak chips.',
  'Huur omhoog, energie omhoog, en mijn salaris? Dat is "in overleg".',
  'Energierekening binnen. Ik douche voortaan bij m’n schoonmoeder.',
  'Eigen risico al op in januari. Ik heb één keer geniesd.',
  'Elf jaar op de wachtlijst voor een huurhuis. M’n kat staat er ook op.',
  'Blauwe envelop op de mat. M’n hart deed even niks.',
  'Trein weer vertraagd. Seinstoring. Het is áltijd een seinstoring.',
  'Hele straat open voor de glasvezel. Derde keer dit jaar. Zelfde stoep.',
  'Parkeren kost hier meer per uur dan m’n auto waard is.',
  'Fiets gejat. Weer. Morgen koop ik ’m vast terug op Marktplaats.',
  'Vier vijftig voor een kopje koffie! Zit er een lening bij?',
  'De gemeente heeft een rotonde gebouwd. Waar eerst een rotonde stond.',
  'Mag niet klagen, hoor. Doe ik toch.',
];
const MUTTERS = [
  'Alweer regen...', 'Wat een rotweer.', 'Tegenwind. Altijd tegenwind.', 'Zomer? Was dat dinsdag?',
  'Die lui in Den Haag, hè...', 'Ze gaan het "onderzoeken".', 'Benzine? Vloeibaar goud!',
  'Boodschappen? Onbetaalbaar!', 'Een euro voor een komkommer!', 'Kaas te duur. In Kaasland!',
  'Halve zak chips, hele prijs.', 'Huur omhoog. Alweer.', 'Weer een seinstoring...',
  'Eigen risico. Pff.', 'Blauwe envelop... zucht.', 'Wéér de straat open.',
  'Vroeger was alles beter.', 'Mag niet klagen. Doe ik toch.',
];
let lastGripe = -1, mutterT = 4;
function gripe(pool) { let k; do k = Math.floor(Math.random() * pool.length); while (pool.length > 1 && k === lastGripe); lastGripe = k; return pool[k]; }
const LINES_NPC = [...GRIPES, 'Lekker weertje, hè?', 'Watch it, I\'m walking here!', 'Have you seen the Lampas boys around? Bad news.', 'My snackbar only uses Eddy & Zn spice. Used to, anyway.', 'Fietsbel! Ring ring!', 'Nice shirt. Very... open.', 'They say old Freddy had a secret recipe.'];
const folkCtx = {
  bubble: (o, text, col, name) => personBubble(o, text, col, name),
  toast, flash: cameraFlash,
  facePlayer: (o, dog) => { o.rotation.y = Math.atan2(player.position.x - o.position.x, player.position.z - o.position.z) - (dog ? Math.PI / 2 : 0); o.userData.faceT = 2.2; },
  dist: 99,
};
walkers.forEach((w) => addInteract({ obj: w, pos: () => w.position, r: 1.4, enabled: () => w.visible, label: () => (w.userData.folk ? w.userData.folk.a.label : 'Say hi'), act: () => {
  const u = w.userData; u.walk.wait = Math.max(u.walk.wait, 2.5); w.rotation.y = Math.atan2(player.position.x - w.position.x, player.position.z - w.position.z);
  if (u.folk) { folk.interact(w, folkCtx); return; }
  const P_ = u.walk.police; personBubble(w, gripe(P_ ? LINES_POLICE : LINES_NPC), P_ ? '#3a6aff' : '#e8a33d', P_ ? 'Politie' : '');
} }));
// the tourist's camera flash: a quick white light at the camera
const flashLight = new THREE.PointLight(0xffffff, 0, 7, 1.5); scene.add(flashLight); let flashT = 0;
function cameraFlash(w, atEddy) { w.getWorldPosition(flashLight.position); flashLight.position.y += 1.7; flashLight.intensity = 6; flashT = 0.12; if (atEddy) toast('KLIK!', 'You are now in a holiday album in Osaka.', 1.8); }
// ================================================================== SHOARMA SCHMATZEL
// A small choice menu in the dialogue box. Escape (B on a controller) picks the cancel option, the last one by default;
// cancel = null means there is no way out (Kevin's siege call, the tax inspector), so Escape leaves the menu open.
let choiceOpen = false, choiceCb = null, choiceCancel = null, choiceN = 0;
function choice(who, line, options, cb, cancel = options.length - 1) {
  { const pre = freddy && freddy.preChoice(who); if (pre) { dialogue(pre, () => choice(who, line, options, cb, cancel)); return; } } // Pa meets an old friend first (js/freddy.js)
  state.inPC = true; choiceOpen = true; choiceCb = cb; choiceCancel = cancel; choiceN = options.length;
  $('dlgwho').textContent = who; $('dlgline').style.whiteSpace = $('dlgline').style.unicodeBidi = ''; $('dlgline').innerHTML = line + '<div id="choices" style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap"></div>';
  const f = faces[who]; $('dlgface').style.display = f ? 'block' : 'none'; if (f) $('dlgface').src = f; $('dialogue').classList.toggle('noface', !f); portraits.show(f, line);
  options.forEach((o, i) => { const b = document.createElement('button'); b.textContent = (i + 1) + '. ' + o; b.style.cssText = 'font:700 15px Arial;padding:7px 14px;border-radius:6px;border:2px solid #ffd36b;background:#2a1a0e;color:#fff;cursor:pointer'; b.onclick = (ev) => { ev.stopPropagation(); closeChoice(i); }; $('choices').appendChild(b); });
  $('dialogue').style.display = 'block';
}
function closeChoice(i) { if (!choiceOpen) return; choiceOpen = false; state.inPC = false; $('dialogue').style.display = 'none'; const cb = choiceCb; choiceCb = null; if (cb) cb(i); }
addEventListener('keydown', (e) => { if (!choiceOpen) return; const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code), n = m ? +m[1] - 1 : -1; if (n >= 0 && n < choiceN) { e.stopImmediatePropagation(); closeChoice(n); } }, true); // number keys 1-9 pick an option

// seated pose for diners and card players (not driven by animate())
function sit(p, y = 0.47) { const u = p.userData; u.legs.forEach((l) => { l.rotation.x = -1.45; }); u.body.position.y = y - 0.9; u.seated = true; }
const joint = new THREE.Group(); scene.add(joint);
const jointRoof = new THREE.Group(); joint.add(jointRoof);
const jointFront = new THREE.Group(); joint.add(jointFront);
const jointLights = [];
let jDoorOpen = 0, jDoorTarget = 0, jDoor, jDoorSolid, doner;
{
  const W0 = JS.x0, W1 = JS.x1, Z0 = JS.z0, Z1 = JS.z1, H = JS.h, cx = (W0 + W1) / 2, cz = (Z0 + Z1) / 2;
  const outer = clapMat(0x1f9e6e), tiles = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#f2f2ea'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c8c8be'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } });
  tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping; tiles.repeat.set(6, 2);
  const inner = lam({ map: tiles });
  const floorT = canvasTex(64, 64, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#2a2a30' : '#e8e2d0'; g.fillRect(x * 8, y * 8, 8, 8); } });
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(5, 4.5);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W1 - W0, Z1 - Z0), lam({ map: floorT })); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0.03, cz); fl.receiveShadow = true; joint.add(fl);
  box(W1 - W0, H, 0.3, inner, cx, H / 2, Z0, joint); solid(W0, W1, Z0 - 0.2, Z0 + 0.15);
  for (const x of [W0, W1]) { box(0.3, H, Z1 - Z0, inner, x, H / 2, cz, joint); solid(x - 0.15, x + 0.15, Z0, Z1); }
  const front = (x0, x1) => { box(x1 - x0, H - 0.7, 0.3, outer, (x0 + x1) / 2, 0.7 + (H - 0.7) / 2, Z1, jointFront); box(x1 - x0, 0.7, 0.3, outer, (x0 + x1) / 2, 0.35, Z1, joint); solid(x0, x1, Z1 - 0.15, Z1 + 0.15); };
  front(W0, JS.doorX0); front(JS.doorX1, W1);
  box(JS.doorX1 - JS.doorX0, H - 2.4, 0.3, outer, (JS.doorX0 + JS.doorX1) / 2, 2.4 + (H - 2.4) / 2, Z1, jointFront);
  // big shop windows with gold lettering, neon frames
  for (const [x, w] of [[W0 + 2.6, 4.2], [W1 - 1.9, 2.6]]) { box(w, 1.8, 0.06, winMat, x, 1.6, Z1 + 0.17, jointFront, false); neonRect(jointFront, x, 1.6, w + 0.1, 1.9, Z1 + 0.24, 0xffe14a); }
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.5), lam({ map: signTex([{ t: 'DÖNER · SHOARMA · FALAFEL', size: 34 }], 'rgba(0,0,0,0)', '#ffd36b', 512, 72), transparent: true })); ws.position.set(W0 + 2.6, 1.15, Z1 + 0.22); jointFront.add(ws);
  const hinge = new THREE.Group(); hinge.position.set(JS.doorX0, 0, Z1 + 0.05); joint.add(hinge);
  box(JS.doorX1 - JS.doorX0, 2.35, 0.08, lam({ color: 0xc8402e }), (JS.doorX1 - JS.doorX0) / 2, 1.18, 0, hinge);
  box(0.9, 1.2, 0.09, winMat, (JS.doorX1 - JS.doorX0) / 2, 1.5, 0.01, hinge, false);
  jDoor = hinge; jDoorSolid = solid(JS.doorX0, JS.doorX1, Z1 - 0.15, Z1 + 0.15);
  // façade: big neon sign, awning, blade sign, menu board on the pavement
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 1.1), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'SHOARMA SCHMATZEL', size: 96 }, { t: 'SINDS 1971 · OOK VOOR EDDY', size: 40, color: '#ffffff' }], '#1e120a', '#ff7a1a', 1024, 150) }));
  sg.position.set(cx, 3.35, Z1 + 0.2); jointFront.add(sg);
  neonRect(jointFront, cx, 3.35, 7.75, 1.25, Z1 + 0.24, 0xe8862c);
  const awnT = canvasTex(64, 64, (c) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#c8402e'; c.fillRect(i * 8, 0, 8, 64); } });
  // awnings only over the two windows, so the door stays visible
  for (const [x, w] of [[W0 + 2.6, 4.4], [W1 - 1.9, 2.8]]) { const awn = box(w, 0.12, 1.1, lam({ map: awnT }), x, 2.65, Z1 + 0.65, jointFront); awn.rotation.x = 0.28; }
  bladeSign(jointFront, W0 + 0.4, 3.0, Z1, 'DÖNER', 0xffe14a);
  const bord = new THREE.Group(); bord.position.set(JS.doorX1 + 1.1, 0, Z1 + 1.1); bord.rotation.y = -0.3; scene.add(bord);
  const bt = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0), lam({ map: signTex([{ t: 'VANDAAG', size: 26 }, { t: 'SHOARMA', size: 30, color: '#ffffff' }, { t: 'BROODJE W 4', size: 22, color: '#ffd36b' }], '#202018', '#ff7a1a', 256, 256) })); bt.position.y = 0.7; bt.rotation.x = -0.15; bord.add(bt);
  solid(JS.doorX1 + 0.8, JS.doorX1 + 1.4, Z1 + 0.8, Z1 + 1.4);
  // roof (hidden while inside)
  box(W1 - W0 + 0.4, 0.3, Z1 - Z0 + 0.4, lam({ map: tex('roof_rust.jpg', 3, 3), color: 0x6a6a6a }), cx, H + 0.15, cz, jointRoof);
  box(W1 - W0 + 0.4, 0.6, 0.3, outer, cx, H + 0.6, Z1 + 0.1, jointFront);
  cyl(0.3, 0.3, 1.2, lam({ color: 0x9aa0a4 }), W1 - 1.2, H + 0.6, Z0 + 1.2, jointRoof);
  // ---- inside: counter + döner spit on the right, the card table on the left, two tables for diners by the window
  const steel = new THREE.MeshStandardMaterial({ color: 0xc8ccd0, roughness: 0.3, metalness: 0.8 });
  const CZc = -13.0;
  box(4.0, 1.05, 0.8, lam({ color: 0xc8402e }), W1 - 2.3, 0.53, CZc, joint); box(4.2, 0.08, 0.95, steel, W1 - 2.3, 1.09, CZc, joint);
  box(0.8, 1.05, 2.3, lam({ color: 0xc8402e }), W1 - 4.3, 0.53, CZc - 0.75, joint);
  solid(W1 - 4.7, W1, CZc - 0.45, CZc + 0.45); solid(W1 - 4.7, W1 - 3.9, Z0, CZc);
  // sneeze glass + salads
  box(3.0, 0.4, 0.04, new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.35, roughness: 0.05 }), W1 - 2.4, 1.35, CZc + 0.35, joint, false);
  for (let i = 0; i < 6; i++) box(0.45, 0.06, 0.32, lam({ color: [0xd84a2a, 0x4f9a30, 0xf2e8c8, 0xe8b020, 0x7a2a5a, 0xf2f2ea][i] }), W1 - 3.75 + i * 0.5, 1.15, CZc, joint, false);
  // döner spit: a turning cone of meat in front of a glowing grill
  box(0.9, 1.6, 0.4, steel, W1 - 0.9, 1.9, Z0 + 0.5, joint); box(0.7, 1.3, 0.05, lam({ color: 0xff7a1a, emissive: 0xc84010 }), W1 - 0.9, 1.9, Z0 + 0.72, joint, false);
  doner = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 1.1, 14), lam({ color: 0x9a5a2a, map: canvasTex(64, 64, (g) => { g.fillStyle = '#9a5a2a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 90; i++) { g.fillStyle = ['#c8783a', '#6a3a1a', '#e8a050'][i % 3]; g.fillRect(Math.random() * 64, Math.random() * 64, 6, 2); } }) }));
  doner.position.set(W1 - 0.9, 1.85, Z0 + 1.15); joint.add(doner); cyl(0.02, 0.02, 1.6, steel, W1 - 0.9, 1.85, Z0 + 1.15, joint);
  // menu board with neon
  const menu = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.2), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'BROODJE SHOARMA  W 4', size: 26 }, { t: 'SCHOTEL KAASLAND  W 9', size: 26, color: '#ffffff' }, { t: 'KAPSALON EDDY  W 7', size: 26, color: '#ffd36b' }], '#1e120a', '#a9c46a', 512, 192) }));
  menu.position.set(W1 - 3.0, 3.2, Z0 + 0.17); joint.add(menu); neonRect(joint, W1 - 3.0, 3.2, 3.3, 1.3, Z0 + 0.2, 0xe8862c);
  // framed photo of young Schmatzel and Freddy Sr.
  const ph = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), lam({ map: canvasTex(128, 96, (g) => { g.fillStyle = '#d8c8a0'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#8a6a4a'; g.fillRect(6, 6, 116, 84); g.fillStyle = '#f2d8b8'; for (const x of [40, 88]) { g.beginPath(); g.arc(x, 40, 13, 0, 7); g.fill(); g.fillRect(x - 15, 55, 30, 30); } g.fillStyle = '#1a1a1a'; g.font = '700 10px Arial'; g.fillText('EDDY & SCHMATZEL 1966', 6, 92); }) }));
  ph.position.set(W0 + 0.17, 2.4, cz); ph.rotation.y = Math.PI / 2; joint.add(ph);
  // card table (round, green felt) on the left
  const CT = { x: W0 + 2.25, z: -12.0 };
  cyl(1.05, 1.05, 0.06, lam({ color: 0x1f6a3a }), CT.x, 0.76, CT.z, joint, 28); cyl(1.1, 1.1, 0.05, lam({ color: 0x6a3a1a }), CT.x, 0.72, CT.z, joint, 28); cyl(0.08, 0.12, 0.72, mat.dark, CT.x, 0.36, CT.z, joint);
  for (let i = 0; i < 9; i++) { const c = box(0.12, 0.005, 0.17, lam({ color: 0xffffff }), CT.x + Math.cos(i) * 0.45, 0.8, CT.z + Math.sin(i * 1.7) * 0.4, joint, false); c.rotation.y = i; }
  for (let i = 0; i < 12; i++) cyl(0.05, 0.05, 0.03 + (i % 4) * 0.03, lam({ color: [0xc8102e, 0x1a1a1a, 0xffd23a][i % 3] }), CT.x + Math.cos(i * 0.52) * 0.7, 0.8 + (i % 4) * 0.015, CT.z + Math.sin(i * 0.52) * 0.7, joint, 10);
  solid(CT.x - 1.55, CT.x + 1.55, CT.z - 1.55, CT.z + 1.55);
  joint.userData.CT = CT;
  // diner tables by the window
  for (const [tx, tz] of [[W1 - 1.5, -8.1], [W1 - 1.5, -10.3], [W0 + 1.3, -7.9]]) { box(1.0, 0.05, 0.7, lam({ color: 0xf2efe6 }), tx, 0.76, tz, joint); cyl(0.05, 0.05, 0.74, mat.dark, tx, 0.37, tz, joint); solid(tx - 0.55, tx + 0.55, tz - 0.4, tz + 0.4); }
  // lights (only while you're inside): warm fluorescent tubes + a pink neon strip
  for (const x of [cx - 2.5, cx + 2.5]) { box(2.0, 0.08, 0.2, lam({ color: 0xffffff, emissive: 0xfff6d8 }), x, H - 0.3, cz, jointRoof, false); const l = new THREE.PointLight(0xfff0d8, 0, 12, 1.4); l.position.set(x, H - 0.6, cz); joint.add(l); jointLights.push([l, 2.6]); }
  const pl = new THREE.PointLight(0xe8862c, 0, 6, 1.6); pl.position.set(W1 - 3, 3, Z0 + 1); joint.add(pl); jointLights.push([pl, 1.2]);
}
const isInJoint = (p) => p.x > JS.x0 && p.x < JS.x1 && p.z > JS.z0 && p.z < JS.z1 - 0.1;
function openJointDoor() { jDoorTarget = 1; jDoorSolid.off = true; beep(1480, 0.1, 'sine', 0.03); setTimeout(() => beep(1180, 0.15, 'sine', 0.03), 110); }
// Schmatzel behind the counter
const schmatzel = makePerson({ chefHat: true, stache: true, head: { skin: 0xe0a882, hair: '#c8c4bc', brow: '#8a8478', hairLine: 70, sideLine: 112, backLine: 150, mouth: 'laugh', squint: true, iris: '#3a2a1a' }, front: '#3a6aa0a', shirt: 0x3a6aa0, pants: 0x3a3a3a, shoes: 0x1a1a1a, belly: 1, skin: 0xe0a882, scale: 0.95, rolled: true });
schmatzel.position.set(JS.x1 - 2.6, 0, -14.1); 
// chef's toque and moustache are part of his look (chefHat / stache)
// Nabil and the card players (Soprano types)
const CTp = joint.userData.CT;
const nabil = makePerson({ head: { skin: 0xc89070, hair: '#1a1410', brow: '#14100c', hairLine: 92, sideLine: 120, backLine: 150, mouth: 'laugh', iris: '#4a2e1a', beard: '#241c16', beard3d: '#241c16' }, feltHat: 0x3e4e36, cigarette: true, front: '#6a3e24', shirt: 0x6a3e24, pants: 0x2a2a30, shoes: 0x111111, belly: 0.5, skin: 0xc89070 });
const SOPRANOS = [
  { head: { skin: 0xe8b890, hair: '#151515', brow: '#111', hairLine: 78, sideLine: 110, backLine: 140, mouth: 'smile', iris: '#3a2a1a' }, front: '#2a2a2e', shirt: 0x2a2a2e, belly: 1.2, chain: true },
  { head: { skin: 0xdca07a, hair: '#2a2a2a', brow: '#222', hairLine: 60, sideLine: 100, backLine: 150, mouth: 'laugh', iris: '#3a2a1a', glasses: true }, front: '#f2efe6', shirt: 0xf2efe6, belly: 1.4, chain: true },
  { head: { skin: 0xf0c4a2, hair: '#3a2a1a', brow: '#2a1a10', hairLine: 84, sideLine: 116, backLine: 150, mouth: 'smile', iris: '#4a6a8a' }, front: '#4a1a2as', shirt: 0x4a1a2a, belly: 0.8 },
  { head: { skin: 0xc8885e, hair: '#8a8a8a', brow: '#6a6a6a', hairLine: 74, sideLine: 112, backLine: 150, mouth: 'smile', iris: '#2a2a2a', squint: true }, front: '#1a2a4a', shirt: 0x1a2a4a, belly: 1.1, chain: true },
];
const cardPlayers = [nabil, ...SOPRANOS.map((o) => makePerson({ ...o, pants: 0x1a1a1e, shoes: 0x111111, skin: o.head.skin, scale: 1.02 }))];
cardPlayers.forEach((p, i) => {
  const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
  p.position.set(CTp.x + Math.cos(a) * 1.45, 0, CTp.z + Math.sin(a) * 1.45);
  p.rotation.y = Math.atan2(CTp.x - p.position.x, CTp.z - p.position.z);
  sit(p); const u = p.userData; u.arms.forEach((ar) => { ar.rotation.x = -1.1; }); u.cardPhase = i * 1.3;
  // chair
  const ch = new THREE.Group(); ch.position.copy(p.position); ch.rotation.y = p.rotation.y; joint.add(ch);
  box(0.45, 0.06, 0.45, lam({ color: 0x6a3a1a }), 0, 0.45, -0.05, ch); box(0.45, 0.5, 0.06, lam({ color: 0x6a3a1a }), 0, 0.72, -0.28, ch);
});
// diners eating shoarma
const diners = [];
[[JS.x1 - 1.5, -8.75, 0], [JS.x1 - 1.5, -9.65, Math.PI], [JS.x1 - 1.5, -10.95, 0], [JS.x0 + 1.3, -8.55, 0]].forEach(([x, z, r], i) => {
  const p = passerBy(400 + i); p.position.set(x, 0, z); p.rotation.y = r; sit(p);
  const pita = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.16, 4, 8), lam({ color: 0xe8c890 })); pita.rotation.z = Math.PI / 2; pita.position.set(0, -0.68, 0.06); p.userData.arms[1].add(pita);
  p.userData.eatPh = i * 2; diners.push(p);
});
// quest marker: floating yellow prism over Nabil
const prism = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), new THREE.MeshBasicMaterial({ color: 0xffe14a }));
prism.scale.set(0.8, 1.4, 0.8); scene.add(prism);
const prismGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ map: canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,230,80,.9)'); r.addColorStop(1, 'rgba(255,230,80,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(prismGlow);
const loanDue = () => state.loan.out && state.raids >= state.loan.at + 2;
const nabilHasAsk = () => !state.loan.out || loanDue();
function talkSchmatzel() {
  if (!state.metSchmatzel) {
    state.metSchmatzel = true;
    dialogue([
      ['Schmatzel', 'Eddy? Little Eddy?! Look at you! Last time you were here you could not see over the counter!'],
      ['Schmatzel', 'Your father and I, we grew up two streets from here. He sold me my first kilo of spice in 1971. On credit! Nobody gives credit anymore.'],
      ['Eddy Jr.', 'He says hi. From Costa del Kaas.'],
      ['Schmatzel', 'Of course he does. Sit, sit! A broodje shoarma, on the house. With Eddy & Zn spice, like the old days. Nobody else in this street gets it.'],
    ], () => { toast('BROODJE SHOARMA', 'On the house. Lekker.', 2.4); beep(660, 0.08, 'triangle'); setTimeout(() => beep(880, 0.12, 'triangle'), 90); });
  } else {
    const L = ['Another shoarma? You are too skinny, jongen. Here.', 'The Lampas sent a man last week. Wanted me to buy their spice. I gave him a kapsalon to go and showed him the door.', 'Nabil? He has been sitting at that table since 1983. Somehow he never loses.', 'When you find De Gouden Mix, you come here first. Promise me.'];
    dialogue([['Schmatzel', L[Math.floor(Math.random() * L.length)]]], () => toast('BROODJE SHOARMA', 'On the house.', 1.6));
  }
}
function talkNabil() {
  const L = state.loan;
  if (L.out && !loanDue()) { dialogue([['Nabil', ['Patience, my friend. The cards need time to warm up.', 'You will get it back. Nabil always pays. Ask anyone at this table.', 'Shh, shh. I am on a streak.'][Math.floor(Math.random() * 3)]]]); return; }
  if (L.out && loanDue()) {
    const back = L.amount * 2;
    dialogue([
      ['Nabil', 'Eddy! Come, come. Like I promised.'],
      ['Nabil', 'W ' + back + '. Count it. Go on, count it. Nabil always wins.'],
    ], () => { addMoney(back); L.out = false; L.amount *= 2; toast('NABIL PAID YOU BACK', '+W ' + back + '. He somehow always wins.', 3); });
    return;
  }
  const ask = () => choice('Nabil', `Listen. I need W ${L.amount}. Just a small loan. I give it back, double. Nabil always pays.`, [`Lend W ${L.amount}`, 'Not now'], (i) => {
    if (i !== 0) { dialogue([['Nabil', 'Your loss, my friend. The cards are hot today.']]); return; }
    if (state.money < L.amount) { dialogue([['Nabil', `W ${L.amount}, Eddy. Not less. Come back when your pockets are fatter.`]]); return; }
    addMoney(-L.amount); L.out = true; L.at = state.raids;
    dialogue([['Nabil', 'You are a good boy. Like your father. Now let me play.']], () => toast('LOAN TO NABIL', 'W ' + L.amount + ' gone into the card game.', 2.4));
  });
  if (!state.metNabil) {
    state.metNabil = true;
    dialogue([
      ['Nabil', 'Eddy & Zn! The son! Sit, sit. No, not there, that is Tony\'s chair. He gets upset.'],
      ['Nabil', 'Your father, he always believed in me. Even in 1984. Especially in 1984.'],
    ], ask);
  } else ask();
}
addInteract({ obj: jDoor, pos: () => new THREE.Vector3((JS.doorX0 + JS.doorX1) / 2, 0, JS.z1 + 0.4), r: 1.6, enabled: () => jDoorTarget === 0, label: () => 'Open the door · Shoarma Schmatzel', act: openJointDoor });
addInteract({ obj: schmatzel, pos: () => schmatzel.position, r: 2.6, enabled: () => isInJoint(player.position), label: () => 'Talk to Schmatzel', act: talkSchmatzel });
addInteract({ obj: nabil, pos: () => nabil.position, r: 1.9, enabled: () => isInJoint(player.position), label: () => nabilHasAsk() ? 'Talk to Nabil  (!)' : 'Talk to Nabil', act: talkNabil });
cardPlayers.slice(1).forEach((p, i) => addInteract({ obj: p, pos: () => p.position, r: 1.7, enabled: () => isInJoint(player.position), label: () => 'Talk', act: () => dialogue([['Card player', ['Fuhgeddaboudit.', 'You in or you out? We play for real Wilders here.', 'Nabil, it\'s your deal. AGAIN.', 'Hey. Respect the table.'][i]]]) }));
function updateJoint(dt) {
  jDoorOpen += (jDoorTarget - jDoorOpen) * Math.min(1, dt * 3); jDoor.rotation.y = jDoorOpen * 1.7;
  const inJ = isInJoint(player.position);
  jointRoof.visible = !inJ; jointFront.visible = !inJ;
  for (const [l, k] of jointLights) l.intensity += ((inJ ? k : 0) - l.intensity) * Math.min(1, dt * 4);
  doner.rotation.y += dt * 0.8;
  const t = performance.now() * 0.001;
  cardPlayers.forEach((p) => { const u = p.userData; u.cardPhase += dt; u.arms[0].rotation.x = -1.1 + Math.sin(u.cardPhase * 1.7) * 0.15; u.arms[1].rotation.x = -1.0 + (Math.sin(u.cardPhase * 0.6) > 0.85 ? -0.5 : 0); u.head.rotation.y = Math.sin(u.cardPhase * 0.4) * 0.3; });
  diners.forEach((p) => { const u = p.userData; u.eatPh += dt; const k = (Math.sin(u.eatPh * 1.2) + 1) / 2; u.arms[1].rotation.x = -0.6 - k * 1.5; u.arms[0].rotation.x = -0.5; });
  { const toP = Math.atan2(player.position.x - schmatzel.position.x, player.position.z - schmatzel.position.z); schmatzel.rotation.y += Math.atan2(Math.sin(toP - schmatzel.rotation.y), Math.cos(toP - schmatzel.rotation.y)) * Math.min(1, dt * 3); animate(schmatzel, 0, dt); }
  const show = nabilHasAsk();
  prism.visible = prismGlow.visible = show;
  if (show) { prism.position.set(nabil.position.x, 2.7 + Math.sin(t * 2.5) * 0.08, nabil.position.z); prism.rotation.y += dt * 2; prismGlow.position.copy(prism.position); prismGlow.lookAt(camera.position); }
  return inJ;
}

// ================================================================== MABOOTA (melee)
const maboota = new THREE.Group();
{ const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.62, 10), new THREE.MeshStandardMaterial({ color: 0x141418, roughness: 0.4 })); b.position.y = -0.31; maboota.add(b);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.037, 0.14, 10), new THREE.MeshStandardMaterial({ color: 0x6a1a1a, roughness: 0.9 })); grip.position.y = 0.02; maboota.add(grip);
  const side = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8), b.material); side.rotation.z = Math.PI / 2; side.position.set(0.07, -0.05, 0); maboota.add(side); }
maboota.position.set(0, -0.68, 0.06); maboota.rotation.x = -1.2; maboota.visible = false;
player.userData.arms[0].add(maboota);
let swingT = 0, swingHit = false;
function equip(on) { state.armed = on; maboota.visible = on; $('weapon').style.display = state.kit.includes('maboota') ? 'block' : 'none'; $('weapon').className = 'hud' + (on ? ' on' : ''); if (on) beep(300, 0.06, 'square', 0.03); }
function swing() {
  if (!state.armed && document.body.classList.contains('touch') && state.kit.includes('maboota') && !(mission && mission.active) && !state.inPC && !state.inDialogue) equip(true); // touch has no holster key: SLAAN draws it (js/maboota.js tucks it away again)
  if (!state.armed || swingT > 0 || knock.t > 0) return;
  swingT = 0.38; swingHit = false; beep(180, 0.08, 'sawtooth', 0.02);
}
function personBubble(p, text, col, name = '') { if (!p.userData.bubble) { p.userData.bubble = bubble(); p.add(p.userData.bubble); const u_ = p.userData, top = u_.ps2 ? u_.body.scale.y * 2.05 + 0.25 : (new THREE.Box3().setFromObject(p).max.y - p.getWorldPosition(new THREE.Vector3()).y) / (p.scale.y || 1) + 0.35; p.userData.bubble.position.set(0, isFinite(top) ? Math.min(2.6, Math.max(0.8, top)) : 2.5, 0); } say(p.userData.bubble, text, col, 2.2, name); }
const OUCH = ['AU!', 'Hé! Doe normaal!', 'AAAH!', 'Waarom?!', 'Ik bel de politie!', 'Mijn bril!'];
function knockDown(p, dirX, dirZ, line) {
  const u = p.userData; u.down = 3.2; u.downDir = Math.atan2(dirX, dirZ);
  personBubble(p, line || OUCH[Math.floor(Math.random() * OUCH.length)], '#ff7a1a');
  beep(90, 0.18, 'square', 0.06); setTimeout(() => beep(60, 0.2, 'sawtooth', 0.05), 50);
}
// one person on the street gets hit (Maboota, bat or a bullet): they fall, get up complaining and run off
function streetTargets() { return [...walkers.filter((w) => !w.userData.walk.police && !w.userData.walk.flee), ...officers.map((o) => o.p)].filter((p) => p.visible && !(p.userData.down > 0)); }
function hitStreetPerson(p, f) {
  if (brep && !(mission && mission.active)) brep.add('kade', -3, 'hit someone on the street');
  const off = officers.find((o) => o.p === p);
  if (off) { if (freddy) freddy.hit('inspector'); knockDown(p, f.x, f.z, ['Mijn bonnenboekje!', 'Au! Ik schrijf je op!', 'Dit is geen geldig vervoersbewijs!'][Math.floor(Math.random() * 3)]); hitOfficer(off); if (law) law.onHit(false); }
  else { knockDown(p, f.x, f.z); if (freddy) freddy.hit('civilian'); if (law) law.onHit(true); for (const w of walkers) if (w.userData.walk.police && w.position.distanceTo(player.position) < 10) personBubble(w, 'Hé! POLITIE! Doe normaal!', '#3a6aff'); }
}
function doHit() {
  const f = new THREE.Vector3(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y));
  if (mission && mission.active) { mission.melee(f); return; }
  const targets = [...walkers.filter((w) => !w.userData.walk.police && !w.userData.walk.flee), ...officers.map((o) => o.p)];
  let any = false;
  for (const p of targets) {
    if (p.userData.down > 0 || !p.visible) continue;
    const d = p.position.clone().sub(player.position); d.y = 0; const L = d.length();
    if (L < 1.6 && d.normalize().dot(f) > 0.25) { any = true; hitStreetPerson(p, f); }
  }
  if (activists && activists.melee(f)) any = true; // the protesters' picket scatters (js/activists.js)
  if (blokaas && blokaas.melee(f)) any = true; // the Blokaas run for their bikes (js/blokaas.js)
  if (any) { /* screen thump */ camPos.y += 0.25; }
}
function updateMelee(dt) {
  if (swingT > 0) {
    swingT -= dt; const k = 1 - swingT / 0.38; const a = player.userData.arms[0];
    a.rotation.x = k < 0.35 ? -0.6 - k / 0.35 * 2.2 : -2.8 + (k - 0.35) / 0.65 * 3.6; a.rotation.z = -0.3;
    if (k > 0.5 && !swingHit) { swingHit = true; doHit(); }
    if (swingT <= 0) a.rotation.z = -0.07;
  } else if (state.armed) { const a = player.userData.arms[0]; a.rotation.x = Math.min(a.rotation.x, -0.25); }
  // people who got knocked over lie down, then get back up
  for (const p of [...walkers, ...officers.map((o) => o.p)]) {
    const u = p.userData; if (!(u.down > 0)) continue;
    u.down -= dt; const lying = u.down > 0.6 ? 1 : Math.max(0, u.down / 0.6);
    u.body.rotation.x = -1.5 * lying; u.body.position.y = 0.12 * lying;
    if (u.down <= 0) {
      u.body.rotation.x = 0; u.body.position.y = 0;
      if (u.walk) { u.walk.flee = true; u.walk.dir = Math.sign(p.position.x - player.position.x) || 1; personBubble(p, ['Ik bel de politie!', 'Gek! Gestoorde gek!', 'Mijn moeder hoort hiervan!', 'Dit pik ik niet!', 'Ik ga naar De Telegraaf!'][Math.floor(Math.random() * 5)], '#e8a33d'); }
    }
  }
}

// ================================================================== TICKET INSPECTORS (rare, drop a few Wilders)
const officers = [];
let officerT = 35;
const TICKET_Z = RC - 5.55; // on the pavement, right behind the parked cars
function spawnOfficer() {
  const from = Math.random() < 0.5 ? -1 : 1;
  const p = makePerson({ head: { skin: SKINS[Math.floor(Math.random() * SKINS.length)], hair: '#2a2a2a', brow: '#222', hairLine: 88, sideLine: 116, backLine: 150, mouth: 'smile', iris: '#3a3a3a' }, capColor: 0x6a1a2a, front: '#4a2a4ac', shirt: 0x4a2a4a, pants: 0x2a2a30, shoes: 0x111111, belly: 0.6, skin: 0xe0b090 });
  p.position.set(player.position.x + from * 22, 0, LANES.N[0]);
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.03), lam({ color: 0xffd23a })); pad.position.set(0, -0.62, 0.08); p.userData.arms[1].add(pad);
  const o = { p, state: 'walk', said: false, v: 1.3, car: null, t: 0, done: new Set() };
  officers.push(o); return o;
}
function nextCar(o) {
  let best = null, bd = 1e9;
  for (const cx of parkedN) { if (o.done.has(cx)) continue; const d = Math.abs(cx - o.p.position.x) + Math.abs(cx - player.position.x) * 0.3; if (d < bd) { bd = d; best = cx; } }
  o.car = best; o.state = best === null ? 'leave' : 'walk';
}
function hitOfficer(o) {
  if (o.state === 'flee') return;
  const n = 10 + Math.floor(Math.random() * 26);
  addMoney(n); toast('+W ' + n, 'The ticket inspector\'s petty cash.', 2); coins(o.p.position);
  o.state = 'flee';
}
const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd23a, metalness: 0.9, roughness: 0.25, emissive: 0x402a00 });
const flying = [];
function coins(at) { for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 12), coinMat); c.position.set(at.x, 1.0, at.z); c.userData = { vx: (Math.random() - 0.5) * 3, vy: 4 + Math.random() * 2, vz: (Math.random() - 0.5) * 3, life: 1.3 }; scene.add(c); flying.push(c); } }
function updateOfficers(dt) {
  officerT -= dt;
  if (officerT < 0 && officers.length === 0 && state.step !== 'title') { spawnOfficer(); officerT = 60 + Math.random() * 60; }
  for (let i = officers.length - 1; i >= 0; i--) {
    const o = officers[i], p = o.p, u = p.userData;
    if (u.down > 0) continue;
    if (o.state === 'walk' && o.car === null) nextCar(o);
    if (o.state === 'walk') { // along the pavement to the spot behind the car, then step up to the kerb
      const tx = o.car + (Math.abs(o.car - p.position.x) > 0.4 ? 0 : 0), tz = Math.abs(o.car - p.position.x) > 0.3 ? LANES.N[0] : TICKET_Z;
      const d = new THREE.Vector3(tx - p.position.x, 0, tz - p.position.z), L = d.length();
      if (L < 0.08) { o.state = 'ticket'; o.t = 7 + Math.random() * 5; }
      else { d.normalize(); p.position.addScaledVector(d, Math.min(L, o.v * dt)); p.rotation.y = Math.atan2(d.x, d.z); animate(p, o.v, dt); }
    } else if (o.state === 'ticket') { // back to the pavement, facing the car, scribbling
      p.rotation.y += Math.atan2(Math.sin(0 - p.rotation.y), Math.cos(0 - p.rotation.y)) * Math.min(1, dt * 6);
      animate(p, 0, dt); const u2 = p.userData; u2.arms[1].rotation.x = -1.2 + Math.sin(performance.now() * 0.02) * 0.08; u2.arms[0].rotation.x = -0.9;
      if (!o.said && player.position.distanceTo(p.position) < 6) { o.said = true; personBubble(p, ['Foutparkeerder!', 'Bon. En nog een bon.', 'Vervoersbewijs? Nee? Ook een bon.'][Math.floor(Math.random() * 3)], '#ffd23a'); }
      o.t -= dt; if (o.t < 0) { o.done.add(o.car); o.said = false; nextCar(o); }
    } else { // flee or leave: run away from the player
      const d = p.position.x > player.position.x ? 1 : -1, sp = o.state === 'flee' ? 4.5 : 1.3;
      p.position.x += d * sp * dt; p.position.z += (LANES.N[1] - p.position.z) * Math.min(1, dt * 2); p.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2; animate(p, sp, dt);
    }
    if (Math.abs(p.position.x - player.position.x) > 40) { scene.remove(p); officers.splice(i, 1); }
    const bu = u.bubble && u.bubble.userData; if (bu && bu.life > 0) { bu.life -= dt; if (bu.life <= 0) u.bubble.visible = false; }
  }
  for (let i = flying.length - 1; i >= 0; i--) { const c = flying[i], d = c.userData; d.life -= dt; d.vy -= 14 * dt; c.position.x += d.vx * dt; c.position.y = Math.max(0.03, c.position.y + d.vy * dt); c.position.z += d.vz * dt; c.rotation.x += dt * 10; if (d.life <= 0) { scene.remove(c); flying.splice(i, 1); } }
}

// ================================================================== SPICE WAR at the warehouse (economy.js sets econ siege at Lampas heat 100)
// Prepare (barricade one entrance, set one oil drum as a trap), then hold three waves in the 'warehouse' mission.
let siegeAsked = -1;
function updateSiege() {
  const sg = econ.siegeDue(); if (!sg || state.step !== 'free' || state.inPC || state.inDialogue || mission.active || tripOn() || siegeAsked === sg.day) return;
  siegeAsked = sg.day; tips.show('siege');
  const FN = { lampas: 'Lampas', noshgey: 'Noshgey Kariot', abdavissies: 'Abdavissies' }, fname = FN[sg.faction] || 'Lampas';
  const warn = sg.faction === 'noshgey' ? ['Shooki', `"Cousin! There are like forty hipsters on cargo bikes outside the warehouse. The ${fname}. They brought a drone."`] : sg.faction === 'abdavissies' ? ['De Fluisteraar', `(whispers) "Vans with no plates. The ${fname} are outside your warehouse. They brought crowbars."`] : ['Kevin', '"Bro. Bro! The Lampas are outside your warehouse. Like, all of them. You fight, or you let them take the spice?"'];
  choice(warn[0], warn[1], ['Defend the warehouse', 'Let them take it'], (i) => {
    if (i === 1) { const m = econ.siegeResult(false); toast(`THE ${fname.toUpperCase()} RAIDED THE WAREHOUSE`, m, 5); writeSave(); return; }
    setTimeout(() => choice('Eddy Jr.', 'Thirty seconds. Barricade one way in with crates?', ['The front shutter', 'The loading bay', 'The side door'], (b) => {
      const bar = ['front', 'bay', 'side'][b];
      setTimeout(() => choice('Eddy Jr.', 'And one red oil drum by a door, to shoot when they come through?', ['By the front shutter', 'By the loading bay', 'By the side door'], (t) => {
        const names = (state.crew || []).map((c) => c && c.name).filter(Boolean);
        mission.enter('warehouse', { defend: { faction: fname, looks: sg.faction, barricade: bar, trap: ['front', 'bay', 'side'][t], naknik: state.naknik || 0, names, onEnd: siegeOver } });
      }, null), 60);
    }, null), 60);
  }, null); // no Escape out of a siege: fight or let them in
}
function siegeOver(res) {
  const m = econ.siegeResult(res.win); if (res.win && econ.addRep) econ.addRep(200);
  let lost = 0; for (let k = 0; k < res.lost && state.naknik > 0; k++) { state.naknik--; const n = naknikim.pop(); if (n) { n.visible = false; scene.remove(n); } lost++; }
  state.income = (state.naknik || 0) * NAKNIK_INCOME;
  toast(res.win ? 'THE WAREHOUSE HELD' : 'THE WAREHOUSE FELL', `${m}${lost ? ` They dragged off ${lost} Naknik(im). Hire new ones at the Uitzendbureau.` : ''}`, 6);
  econ.advance('defending the warehouse'); writeSave();
}

// ================================================================== TAX INSPECTOR Van der Belasting (Garage Mo / js/garage.js rolls when he comes)
// He walks up to Eddy in the street when Eddy carries a lot of cash: pay a fine, try a bribe, or offer a free garlic sauce.
let inspector = null;
function updateInspector(dt) {
  if (!inspector) {
    if (!garage.inspectorDue() || state.step !== 'free' || state.inPC || state.inDialogue || mission.active) return;
    const from = Math.random() < 0.5 ? -1 : 1;
    const p = makePS2Person(lookFromPerson({ head: { skin: 0xf0c4a4, hair: '#8a7a62', brow: '#6a5a48', hairLine: 70, sideLine: 110, backLine: 140, mouth: 'flat', iris: '#4a5a6a' }, suit: true, suitShirt: 0xf2f2ee, shirt: 0x2e3036, pants: 0x2e3036, shoes: 0x111111, belly: 0.2, skin: 0xf0c4a4 }, HEADS), { scene }); // grey suit, white shirt, lanyard (assets/face_belasting.jpg)
    const brief = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.1), lam({ color: 0x4a2a14 })); brief.position.set(0, -0.62, 0.05); p.userData.arms[1].add(brief);
    p.position.set(player.position.x + from * 16, 0, LANES.N[0]); scene.add(p);
    inspector = { p, t: 0, talked: false };
    personBubble(p, 'Meneer Eddy? Belastingdienst.', '#ffd23a');
    return;
  }
  const p = inspector.p, d = new THREE.Vector3(player.position.x - p.position.x, 0, player.position.z - p.position.z), L = d.length();
  inspector.t += dt;
  if (inspector.left) { p.position.x += inspector.left * 2.2 * dt; animate(p, 2.2, dt); if (Math.abs(p.position.x - player.position.x) > 40) { scene.remove(p); inspector = null; } return; }
  if (L > 1.6) { d.normalize(); p.position.addScaledVector(d, Math.min(L - 1.5, 2.0 * dt)); p.rotation.y = Math.atan2(d.x, d.z); animate(p, 2.0, dt); }
  else if (!inspector.talked && !state.inDialogue && !state.inPC) {
    inspector.talked = true; animate(p, 0, dt);
    const fine = garage.inspectorFine();
    tips.show('inspector');
    choice('Van der Belasting', `Van der Belasting, Kaasland tax office. That is a lot of cash for a man who "sells old shoarma junk". I count a fine of <b>W ${fine.toLocaleString('nl-NL')}</b>${garage.has('luik') ? ' <small>(he doesn\'t find the hidden compartment in the Oofmobiel)</small>' : ''}.`, [`Pay W ${fine.toLocaleString('nl-NL')}`, 'Slip him W 500', 'Offer a free garlic sauce'], (i) => {
      const line = garage.settleInspector(['pay', 'bribe', 'saus'][i]);
      dialogue([['Van der Belasting', line]], () => { inspector.left = p.position.x > player.position.x ? 1 : -1; });
    }, null); // you don't walk away from the tax office
  }
}

// ================================================================== THE MABOOTA IN PUBLIC (js/maboota.js)
// Out on the street people notice a drawn truncheon and call it in; Wijkagent Bakker comes by the next morning.
const law = createMabootaLaw({ callMult: () => brep.callMult(), pardon: () => brep.pardon(), onReport: (how) => { if (politie && how !== 'search' && state.cops && state.cops.reports.filter((r) => r.day === econ.ensure().day).length >= 3) politie.witness('maboota', player.position.x, player.position.z); return brep.add('kade', how === 'search' ? -6 : how === 'hit' ? -5 : -3, how === 'search' ? 'a huiszoeking at your warehouse' : how === 'hit' ? 'hit someone with the Maboota' : 'waving the Maboota around'); }, state, walkers, player, personBubble, toast, beep, econ, tips, dialogue, choice, addMoney, equip, scene, animate,
  isPublic: () => !(activists && activists.heat()) && state.step !== 'title' && !(mission && mission.active) && !tripOn() && !(woning && woning.inside()) && !(winkels && winkels.inside()) && !isInside(player.position) && !(venues && venues.inside()),
  atHome: () => !!(woning && woning.inside()),
  busy: () => choiceOpen || !!inspector || !!(mission && mission.active) || tripOn() || !!(phone && phone.isOpen) || isPaused(),
  touch: () => document.body.classList.contains('touch'),
  makeCop: () => passerBy(900 + Math.floor(Math.random() * 99), { police: true }),
  laneZ: () => LANES.N[0], onPlan: () => updateObjective(), save: () => writeSave() });

// ================================================================== RAZIM drops by unannounced (js/phone.js has his texts and calls)
// Some market days Eddy's annoying friend (Neon Vice's Money Man) just turns up, at the warehouse, at home, wherever Eddy is: "EDDY! Surprise!"
// Buy him a broodje, let him tag along (he follows Eddy around asking questions, then leaves and texts), or claim
// you're not in Nederland while he's standing right in front of you. Good-natured: he just wants shoarma with Eddy.
let razim = null;
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const RAZIM_LOOK = { head: { skin: 0xd6a888, hair: '#1e1814', brow: '#1a1410', bald: true, hairLine: 64, sideLine: 112, backLine: 140, mouth: 'smile', glasses: true, iris: '#3a2a1e' }, shirt: 0x1c1c22, pants: 0x2c3446, shoes: 0x1a1a1a, belly: 0.05, skin: 0xd6a888 };
// Razim is Neon Vice's Money Man (same person), but in his own black sweater (Tristan's call): slim, glasses, bald (only a scatter of hair, so head.bald). Portrait: assets/face_razim.jpg.
// He talks like him too: fast, transactional, always pricing something. And shoarma.
const RAZ_ASK = ['That machine? W 400. I\'d give you 350. Today only.', 'Everybody has a price, Eddy. Your Naknikim? Priceless. Also W 9 an hour.', 'You know what this place needs? A receipt printer.', 'What does this machine do?', 'Is that a Naknik? Hi Naknik!', 'Eddy. Shoarma after this?', 'Can I press this button?', 'Your dad still has that moustache?', 'I could work here. I\'d be good.', 'Ok but after this, shoarma.', 'Eddy, look, I can do a cartwheel. ...No I can\'t.'];
function razimVisit() {
  if (razim || state.step !== 'free' || state.inPC || state.inDialogue || mission.active) return false;
  const from = Math.random() < 0.5 ? -1 : 1;
  const p = makePS2Person(lookFromPerson(RAZIM_LOOK, HEADS), { scene });
  const z = Math.abs(player.position.z - LANES.N[0]) < 10 ? player.position.z : LANES.N[0];
  p.position.set(player.position.x + from * 14, 0, z); scene.add(p);
  razim = { p, t: 0, talked: false, follow: 0, ask: 4 };
  personBubble(p, rnd(['EDDY! Surprise!', 'Eddyyy! I was in the neighbourhood! Pricing things!', 'Eddy! Don\'t pretend you didn\'t see me!']), '#b4cc7a');
  return true;
}
// passers-by, the police, the inspector and Razim: none of them through the walls. Whoever ends up at the door while Eddy is
// inside has come for him, and rings.
const guardV = new THREE.Vector3();
function doorGuard(dt) {
  if (deurbel.cd > 0) deurbel.cd -= dt; if (deurbel.t > 0) deurbel.t -= dt;
  if (mission.active || tripOn()) return;
  const one = (o, who) => { const q = o && (o.isObject3D ? o : o.p || o.g || o.obj); if (!q || !q.visible || !q.position) return; guardV.copy(q.position); if (keepOut(guardV, who, true)) { q.position.x = guardV.x; q.position.z = guardV.z; } };
  for (const w of walkers) one(w, 'Somebody from the street');
  for (const o of officers) one(o, 'The police');
  one(inspector, 'The parking inspector'); one(razim, 'Razim');
}
addInteract({ pos: () => new THREE.Vector3((WH.doorX0 + WH.doorX1) / 2, 0, WH.z1 - 0.9), r: 1.6, enabled: () => deurbel.t > 0 && isInside(player.position) && !state.inDialogue && !(spoed && spoed.atDoor()), // (not while a van is backed up to the door: js/spoed.js)
  label: () => `Open the door · ${deurbel.who}`, act: () => { deurbel.t = 0; player.position.set((WH.doorX0 + WH.doorX1) / 2, 0, WH.z1 + 1.9); player.rotation.y = 0; if (window.__sme.snapCam) window.__sme.snapCam(); beep(330, 0.08, 'square', 0.04); } });
function updateRazim(dt) {
  if (!razim) {
    const e = econ.ensure();
    if (state.step !== 'free' || !npcs.met('shooki') || (state.tut && !state.tut.done)) return;
    if (e.razimVisitRoll !== e.day) { e.razimVisitRoll = e.day; e.razimVisitIn = !garage.inspectorDue() && Math.random() < 0.3 ? 30 + Math.random() * 120 : -1; }
    if (!(e.razimVisitIn > 0) || state.inPC || state.inDialogue || mission.active || garage.inspectorDue()) return;
    if ((e.razimVisitIn -= dt) <= 0 && !razimVisit()) e.razimVisitIn = 5;
    return;
  }
  const p = razim.p, d = new THREE.Vector3(player.position.x - p.position.x, 0, player.position.z - p.position.z), L = d.length();
  razim.t += dt;
  if (razim.left) { p.position.x += razim.left * 2.6 * dt; p.rotation.y = razim.left * Math.PI / 2; animate(p, 2.6, dt); if (Math.abs(p.position.x - player.position.x) > 40) { scene.remove(p); razim = null; } return; }
  const leave = (txt) => { razim.left = p.position.x > player.position.x ? 1 : -1; if (txt && phone) phone.razimText(txt); };
  if (razim.follow > 0) { // tagging along: keeps two steps behind Eddy and asks things
    razim.follow -= dt; razim.ask -= dt;
    if (L > 2.4) { d.normalize(); p.position.addScaledVector(d, Math.min(L - 2.2, (L > 6 ? 4.5 : 2.6) * dt)); p.rotation.y = Math.atan2(d.x, d.z); animate(p, L > 6 ? 4.5 : 2.6, dt); } else { p.rotation.y = Math.atan2(d.x, d.z); animate(p, 0, dt); }
    if (razim.ask <= 0) { razim.ask = 6 + Math.random() * 5; personBubble(p, rnd(RAZ_ASK), '#b4cc7a'); }
    if (razim.follow <= 0 || state.step !== 'free') { personBubble(p, 'Ok I go. I text you!', '#b4cc7a'); leave(['that was fun', 'same time tomorrow?', 'with shoarma this time']); }
    return;
  }
  if (L > 1.6) { d.normalize(); p.position.addScaledVector(d, Math.min(L - 1.5, 3.0 * dt)); p.rotation.y = Math.atan2(d.x, d.z); animate(p, 3.0, dt); }
  else if (!razim.talked && !state.inDialogue && !state.inPC) {
    razim.talked = true; animate(p, 0, dt);
    tips.show('razimVisit');
    dialogue([['Razim', rnd(['EDDY! I was just walking by. For forty minutes. Around your place.', 'Surprise! You didn\'t answer, so I came. A taxi here was W 22, so you owe me a broodje. Minimum.', 'Eddy! I priced your warehouse on the way in. Don\'t worry about it. Shoarma?', 'Eddy! I texted, you didn\'t reply, so I thought: he\'s probably dead. You\'re not dead! Shoarma?'])]],
      () => choice('Razim', '<i>Razim is here. In person. Razim wants shoarma.</i>', ['Tamam, one broodje. Quick. (W 15)', 'I\'m working, Razim.', 'I\'m not in Nederland.'], (i) => {
        if (i === 0) {
          if (state.money >= 15) addMoney(-15);
          dialogue([['Eddy Jr.', 'Tamam. One broodje. Quick.'], ['Razim', rnd(['YES! Best friend! ...You\'re paying, right? You\'re paying.', 'Quick, quick. I eat fast. You know I eat fast.']) ], ['Razim', 'Ahh. Shoarma with Eddy. Now my day is complete. See you tomorrow!']],
            () => { leave(['thanks for the broodje!!', 'best day', 'tomorrow again?']); toast('BROODJE MET RAZIM', 'He ate his and half of yours. Somehow you feel a bit better.', 3.5); writeSave(); });
        } else if (i === 1) {
          dialogue([['Eddy Jr.', 'I\'m working, Razim.'], ['Razim', 'No problem! I\'ll just watch. I\'m very quiet. You won\'t even notice me.']], () => { razim.follow = 35 + Math.random() * 20; razim.ask = 3; });
        } else {
          dialogue([['Eddy Jr.', 'I\'m not in Nederland.'], ['Razim', rnd(['Eddy. I am LOOKING at you. I can touch your face.', 'Ok. When you\'re back in Nederland, I\'m right here. Standing here. In Nederland.'])]], () => { personBubble(p, 'Ok bye! Not-in-Nederland Eddy!', '#b4cc7a'); leave(['you\'re funny', 'you were literally there', 'shoarma when you\'re "back"?']); });
        }
      }, null));
  }
}

// Razim at a mission: some raids he is already standing by the Oofmobiel when Eddy parks ("I was in the area. Pricing
// things."), chats whenever Eddy walks past, and sometimes makes it rain: the Money Man's stack of cash, a few Wilders
// "for luck". mission.js calls arrived() after the drive-in and left() on the way out. Never on a Nachtklus or a siege.
let razimM = null;
const RAZ_M_HI = ['Eddy! Small world. I was in the area. Pricing things.', 'You\'re going in there? I give you good odds. W 300 on you, W 200 on the fryer.', 'Eddy! I\'ll watch the van. Five Wilders an hour, first hour free.', 'EDDY! I followed the Oofmobiel. Don\'t make it weird. Shoarma after?'];
const RAZ_M_TALK = ['That door is worth W 80. The hinges alone, W 12.', 'If there\'s a fryer in there, I give you forty for it. Fifty if it\'s clean.', 'After this: shoarma. You\'re paying, you\'re the one with a job.', 'I\'d come in, but these shoes cost more than the building.', 'Everybody has a price, Eddy. The Lampas? Cheap. Very cheap.', 'I priced your van. Don\'t ask.', 'Receipts, Eddy. Ask them for receipts.', 'Is it loud in there? It sounds loud. Is there shoarma in there?', 'I\'m not here. If anyone asks, I was never here. I was at Schmatzel.'];
function razimArrived(info) {
  if (razimM || info.heist || info.defend || state.step !== 'free' || !npcs.met('shooki')) return;
  const e = econ.ensure();
  if (!razimM && !window.__razimForce && (e.razimMissionDay === e.day || Math.random() > 0.3)) return;
  e.razimMissionDay = e.day; window.__razimForce = false;
  const p = makePS2Person(lookFromPerson(RAZIM_LOOK, HEADS), { scene });
  p.position.set(info.start.x + 1.8, 0, info.start.z + 0.4); p.rotation.y = Math.PI * 1.5; scene.add(p);
  razimM = { p, hi: false, talk: 0, rain: Math.random() < 0.4 };
}
function razimLeft() { if (razimM) { scene.remove(razimM.p); razimM = null; } }
function updateRazimMission(dt) {
  if (!razimM) return;
  const p = razimM.p, dx = player.position.x - p.position.x, dz = player.position.z - p.position.z, L = Math.hypot(dx, dz);
  animate(p, 0, dt); razimM.talk -= dt;
  if (L < 6) p.rotation.y = Math.atan2(dx, dz);
  if (L > 3.2 || razimM.talk > 0) return;
  if (!razimM.hi) {
    razimM.hi = true; razimM.talk = 5; personBubble(p, rnd(RAZ_M_HI), '#b4cc7a');
    if (razimM.rain) setTimeout(() => { if (!razimM) return; const n = 15 + Math.floor(Math.random() * 4) * 5; addMoney(n); coins(p.position); personBubble(p, `Make it rain! W ${n}, for luck. I want ${n + 5} back.`, '#b4cc7a'); }, 2600);
    return;
  }
  razimM.talk = 7 + Math.random() * 5; personBubble(p, rnd(RAZ_M_TALK), '#b4cc7a');
}

await bootStep(80, 'Feeding the seagulls…');
// ================================================================== SEAGULLS (they poop on people)
const gulls = [], poops = [];
function makeGull() {
  const g = new THREE.Group(), white = lam({ color: 0xf6f6f2 }), grey = lam({ color: 0xb8bcc4, side: THREE.DoubleSide });
  const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.35, 4, 8), white); b.rotation.z = Math.PI / 2; g.add(b);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), white); h.position.set(0.3, 0.06, 0); g.add(h);
  const bk = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 6), lam({ color: 0xf2c43a })); bk.rotation.z = -Math.PI / 2; bk.position.set(0.44, 0.05, 0); g.add(bk);
  const wings = [];
  for (const s of [1, -1]) { const w = new THREE.Group(); w.position.set(0.02, 0.06, s * 0.08); g.add(w); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.7), grey); m.rotation.x = -Math.PI / 2; m.position.z = s * 0.35; w.add(m); const tip = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), lam({ color: 0x1a1a1a, side: THREE.DoubleSide })); tip.rotation.x = -Math.PI / 2; tip.position.set(-0.08, 0.001, s * 0.62); w.add(tip); wings.push([w, s]); }
  g.scale.setScalar(1.1); scene.add(g);
  return { g, wings, a: Math.random() * 6, r: 9 + Math.random() * 5, h: 6.5 + Math.random() * 1.5, state: 'circle', t: 40 + Math.random() * 40, target: null, flap: Math.random() * 6 };
}
for (let i = 0; i < 2; i++) gulls.push(makeGull());
function squawk() { beep(1400, 0.08, 'sawtooth', 0.025); setTimeout(() => beep(1100, 0.12, 'sawtooth', 0.025), 90); setTimeout(() => beep(1300, 0.1, 'sawtooth', 0.02), 230); }
const splatMat = lam({ color: 0xf6f6ee });
// poop on Eddy's head stays until he changes location (travel); call clearPlayerSplats() on every location change
const playerSplats = [];
function clearPlayerSplats() { for (const sp of playerSplats) sp.parent && sp.parent.remove(sp); playerSplats.length = 0; }
const gullLastP = new THREE.Vector3(); let gullPV = 0;
function updateGulls(dt) {
  const P = player.position;
  gullPV = gullLastP.lengthSq() ? Math.hypot(P.x - gullLastP.x, P.z - gullLastP.z) / Math.max(dt, 1e-3) : 0; gullLastP.copy(P);
  for (const G of gulls) {
    G.flap += dt * (G.state === 'circle' ? 6 : 10);
    for (const [w, s] of G.wings) w.rotation.x = s * Math.sin(G.flap) * 0.6;
    let tx, ty, tz;
    if (G.state === 'circle') {
      G.a += dt * 0.35; tx = P.x + Math.cos(G.a) * G.r; tz = P.z + 2 + Math.sin(G.a) * G.r * 0.6; ty = G.h; G.t -= dt;
      if (G.t < 0 && Math.random() < 0.35) { // land on the pavement and peck at dropped fries
        G.state = 'land'; G.t = 14 + Math.random() * 10; G.spot = { x: P.x + (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 5), z: LANES.N[0] + (Math.random() - 0.5) * 1.2 }; continue;
      }
      if (G.t < 0) {
        const pool = walkers.filter((w) => w.position.distanceTo(P) < 14 && !(w.userData.down > 0));
        if (!pool.length) { G.t = 20; continue; }
        G.target = Math.random() < 0.1 ? player : pool[Math.floor(Math.random() * pool.length)];
        G.state = 'dive'; squawk();
      }
    } else if (G.state === 'dive') {
      const T = G.target.position; const lead = G.target === player ? 0 : G.target.userData.walk.dir * G.target.userData.walk.v * 0.9;
      tx = T.x + lead; tz = T.z; ty = 3.8;
      if (Math.hypot(G.g.position.x - tx, G.g.position.z - tz) < 0.6 && G.g.position.y < 4.4 && G.target === player && state.metSchmatzel && Math.random() < 0.5) { // not poop: the broodje!
        toast('MEEUW!', 'A seagull snatched the broodje shoarma right out of Eddy’s hand. Schmatzel will make you another one.', 3.5); squawk();
        const bun = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.16, 3, 6), lam({ color: 0xd8a860 })); bun.rotation.z = Math.PI / 2; bun.position.set(0.2, -0.12, 0); G.g.add(bun); G.bun = bun;
        G.state = 'leave'; G.t = 4;
      } else if (Math.hypot(G.g.position.x - tx, G.g.position.z - tz) < 0.6 && G.g.position.y < 4.4) {
        const pp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), splatMat); pp.position.copy(G.g.position); pp.userData = { vy: 0, target: G.target }; scene.add(pp); poops.push(pp);
        G.state = 'leave'; G.t = 3; squawk();
      }
    } else if (G.state === 'land') { // waddle and peck; Eddy running at it sends it up with a squawk
      tx = G.spot.x; tz = G.spot.z; ty = 0.12; G.t -= dt;
      if (G.g.position.y < 0.3) { G.flap = 0; G.g.rotation.z = Math.sin(performance.now() * 0.012) > 0.6 ? -0.5 : 0; if (Math.random() < dt * 0.4) G.spot.x += (Math.random() - 0.5) * 1.2; }
      const run = gullPV, near = Math.hypot(P.x - G.g.position.x, P.z - G.g.position.z);
      if (G.t < 0 || (near < 3.2 && (run > 3 || keys.ShiftLeft)) || near < 1.4) { G.state = 'leave'; G.t = 3; G.g.rotation.z = 0; if (near < 3.2) squawk(); }
    } else { tx = G.g.position.x + 8; tz = G.g.position.z - 6; ty = G.h + 1; G.t -= dt; if (G.t < 0) { G.state = 'circle'; G.t = 60 + Math.random() * 60; if (G.bun) { G.g.remove(G.bun); G.bun = null; } } }
    const d = new THREE.Vector3(tx - G.g.position.x, ty - G.g.position.y, tz - G.g.position.z), L = d.length();
    const sp = G.state === 'dive' ? 9 : G.state === 'land' ? (G.g.position.y > 0.3 ? 5 : 0.8) : 6;
    if (L > 0.05) { G.g.position.addScaledVector(d.normalize(), Math.min(L, sp * dt)); G.g.rotation.y = Math.atan2(-d.z, d.x); }
  }
  for (let i = poops.length - 1; i >= 0; i--) {
    const pp = poops[i], u = pp.userData;
    if (u.ground !== undefined) { u.ground -= dt; if (u.ground < 0) { scene.remove(pp); poops.splice(i, 1); } continue; }
    u.vy -= 16 * dt; pp.position.y += u.vy * dt;
    const T = u.target, top = T === player ? 1.95 : 1.95 * (T.userData.body.scale.x || 1);
    if (pp.position.y < top && Math.hypot(pp.position.x - T.position.x, pp.position.z - T.position.z) < 0.7) {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), splatMat); sp.scale.set(1.3, 0.35, 1.1); sp.position.set(0, 0.36, 0); T.userData.head.add(sp); if (T === player) playerSplats.push(sp); else setTimeout(() => sp.parent && sp.parent.remove(sp), 20000);
      if (T === player) toast('SPLAT!', 'A seagull got you. Lucky, they say.', 2.2); else { personBubble(T, ['GADVERDAMME!', 'Bah! Een meeuw!', 'Niet weer!', 'Mijn nieuwe jas!'][Math.floor(Math.random() * 4)], '#f6f6ee'); T.userData.walk.wait = 1.6; }
      beep(220, 0.05, 'sine', 0.05); scene.remove(pp); poops.splice(i, 1); continue;
    }
    if (pp.position.y <= 0.03) { pp.position.y = 0.03; pp.scale.set(2.2, 0.25, 2.2); u.ground = 12; }
  }
}

// ---- the canal: woonarken and old tjalks moored on the far side, a rondvaartboot, a sloep with friends, and ducks (js/boats.js)
// Lanes across the 7.5 m canal: tour boat CZ-2.15, sloep CZ-0.1, houseboats CZ+2.3 against the far quay.
const boats = [];
const FLOAT = -1.04; // the boats ride a hand higher than the water plane, so the boot-top shows and they sit on the canal, not in it
const moor = (b, x) => { b.position.set(x, FLOAT, CZ + 2.3); scene.add(b); boats.push(b); return b; };
moor(makeArk({ wall: clapMat(0x2f6a8a), roof: 'flat', winMat, frameMat, trim: 0xf3e6c8, chairA: '#2f6a8a', phase: 0.4 }), -46);
moor(makeBarge({ hull: 0x16181a, band: 0xf6f2e8, cabin: 0xf3e6c8, hatchA: 0x1f6a44, hatchB: 0xf3e6c8, phase: 1.7 }), -30);
moor(makeArk({ wall: clapMat(PAL.saffron), roof: 'pitch', roofCol: 0x3a4a5a, winMat, frameMat, trim: 0x1f3a2c, door: 0x5a2a1e, bikeCol: 0x2f5f8a, phase: 2.9 }), -2);
moor(makeBarge({ hull: 0x5a1a1a, band: 0xf2c14e, cabin: 0xefe2c4, leeboard: 0xc88a50, hatchA: 0xb5442a, hatchB: 0xf3e6c8, phase: 4.2 }), 26);
moor(makeArk({ wall: clapMat(0xc8402e), roof: 'flat', winMat, frameMat, trim: 0xf3e6c8, door: 0x2f4a3a, chairA: '#c8402e', phase: 5.5 }), 42);
// rondvaartboot: sails east to the landing stage by the bridge, waits, backs out west, and turns round out of sight
const tourCrew = Array.from({ length: 7 }, (_, i) => { const p = passerBy(200 + i); p.scale.setScalar(0.9); return p; });
const tour = makeTourBoat({ sign: lam({ map: signTex([{ t: 'RONDVAART KAASLAND', size: 40 }], '#24303a', '#f2c14e') }), crew: tourCrew, sit, phase: 0.8 });
tour.position.set(-30, FLOAT, CZ - 2.15); scene.add(tour);
tour.userData.move = { mode: 'fwd', v: 0, wait: 0 };
// sloep: three friends, a skipper and a crate of beer; west out of sight and back, turning round at the wide bit between the houseboats
const sloep = makeSloep({ crew: Array.from({ length: 4 }, (_, i) => passerBy(300 + i)), sit, hull: PAL.cardamom, moving: true, phase: 2.2 });
sloep.position.set(-12, FLOAT, CZ - 0.1); sloep.rotation.y = Math.PI; scene.add(sloep);
sloep.userData.move = { dir: -1, v: 2.2, turn: 0 };
const ducks = [];
for (let i = 0; i < 18; i++) {
  const d = new THREE.Group(), male = i % 3 === 0, farm = i % 5 === 2, scale = (i % 4 === 3 ? 0.6 : 1) * 1.35;
  const bodyM = lam({ color: farm ? 0xfaf8f0 : male ? 0x8a8478 : 0x7a5a3a });
  const b0 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), bodyM); b0.scale.set(1.5, 0.75, 0.95); b0.position.y = 0.08; d.add(b0);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 6), bodyM); tail.rotation.z = Math.PI / 2 + 0.5; tail.position.set(-0.38, 0.14, 0); d.add(tail);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), lam({ color: farm ? 0xfaf8f0 : male ? 0x1f7a3a : 0x6a4a2a })); hd.position.set(0.28, 0.32, 0); d.add(hd);
  if (male && !farm) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 4, 10), lam({ color: 0xffffff })); ring.rotation.x = Math.PI / 2; ring.position.set(0.25, 0.2, 0); d.add(ring); }
  const bk = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.1), lam({ color: 0xf2a020 })); bk.position.set(0.43, 0.3, 0); d.add(bk);
  d.scale.setScalar(scale); d.position.set(-50 + i * 6 + (i % 3), -1.08, CZ - 2.8 + (i % 4) * 0.5); d.rotation.y = Math.random() * 6;
  d.userData = { heading: d.rotation.y, t: Math.random() * 5, baby: scale < 1 };
  scene.add(d); ducks.push(d);
}
function updateCanal(dt) {
  const t = performance.now() * 0.001;
  { // the rondvaartboot: slows into the stop west of the bridge, waits, backs out west, and comes round again out of sight
    const m = tour.userData.move, x = tour.position.x;
    if (m.mode === 'fwd') { m.v += (Math.min(1.8, Math.max(0.25, (-6 - x) * 0.18)) - m.v) * Math.min(1, dt * 0.6); if (x > -6.5) { m.mode = 'stop'; m.wait = 9; } }
    else if (m.mode === 'stop') { m.v *= Math.pow(0.2, dt); if ((m.wait -= dt) < 0) m.mode = 'back'; }
    else { m.v += (-1.5 - m.v) * Math.min(1, dt * 0.35); if (x < -60) { m.mode = 'fwd'; m.v = 1.4; } }
    tour.position.x += m.v * dt;
    rockBoat(tour, t, Math.max(0, m.v));
  }
  { // the sloep: west out of sight and back; turns round on the spot in the open water by the bridge
    const m = sloep.userData.move;
    if (m.turn > 0) {
      m.turn -= dt; const k = Math.min(1, 1 - m.turn / 4.5);
      sloep.rotation.y = m.from + Math.PI * k * k * (3 - 2 * k); sloep.position.x += 0.25 * dt * Math.cos(sloep.rotation.y);
      if (m.turn <= 0) { m.dir = -m.dir; sloep.rotation.y = m.dir > 0 ? 0 : Math.PI; }
    } else {
      sloep.position.x += m.v * m.dir * dt;
      if (m.dir < 0 && sloep.position.x < -60) { m.dir = 1; sloep.rotation.y = 0; } // out of sight
      if (m.dir > 0 && sloep.position.x > 7.5) { m.turn = 4.5; m.from = sloep.rotation.y; }
    }
    rockBoat(sloep, t, m.turn > 0 ? 0.6 : m.v);
  }
  for (const b of boats) rockBoat(b, t, 0);
  for (const d of ducks) {
    const u = d.userData; u.t -= dt;
    if (u.t < 0) { u.heading += (Math.random() - 0.5) * 2.2; u.t = 1.5 + Math.random() * 3; }
    if (d.position.z < CZ - 3.2) u.heading = Math.PI / 2 * 0.8 * (Math.random() < 0.5 ? 1 : -1) + Math.PI / 2;
    if (d.position.z > CZ - 0.6) u.heading = -Math.PI / 2;
    if (Math.abs(d.position.x) > 50) u.heading = d.position.x > 0 ? Math.PI : 0;
    d.rotation.y += Math.atan2(Math.sin(-u.heading - d.rotation.y), Math.cos(-u.heading - d.rotation.y)) * Math.min(1, dt * 2);
    const sp = 0.35 * (u.baby ? 1.2 : 1);
    d.position.x += Math.cos(-d.rotation.y) * sp * dt; d.position.z += Math.sin(-d.rotation.y) * sp * dt;
    d.position.y = -1.08 + Math.sin(performance.now() * 0.004 + d.position.x * 3) * 0.015;
  }
}

function updateStreet(dt) {
  const P = player.position;
  for (const c of traffic) {
    const u = c.userData;
    // brake for the player (or anyone) in our lane ahead, and for the car in front
    let free = 99;
    const ahead = (x, z, half) => { if (Math.abs(z - c.position.z) < 1.5) { const d = (x - c.position.x) * u.dir - u.half - half; if (d > -1) free = Math.min(free, d); } };
    ahead(P.x, P.z, 0.4);
    const byPlayer = free < 4;
    for (const o of traffic) if (o !== c && o.userData.dir === u.dir) ahead(o.position.x, o.position.z, o.userData.half);
    // blocked by you: honk and shout; hit you if you jump in front at speed
    if (byPlayer && u.v < 2) { u.blockT += dt; u.honkT -= dt; if (u.blockT > 0.5 && u.honkT <= 0) { honk(); say(u.bubble, DRIVER_SHOUTS[Math.floor(Math.random() * DRIVER_SHOUTS.length)]); u.honkT = 2.6; } }
    else u.blockT = 0;
    if (u.v > 2.5 && Math.abs(P.z - c.position.z) < 1.3 && Math.abs(P.x - c.position.x) < u.half + 0.45 && P.y < 0.3)
      bump(u.dir * (3 + u.v * 0.9), Math.sign(P.z - c.position.z || 1) * 5, 6.5, 'You bounced off a ' + c.userData.model + '.');
    const want = free < 2.5 ? 0 : free < 9 ? u.vmax * (free - 2.5) / 6.5 : u.vmax;
    u.v += Math.max(-12 * dt, Math.min(4 * dt, want - u.v));
    c.position.x += u.v * u.dir * dt;
    { const [lo, hi] = lifeWin(); if (u.dir > 0 ? c.position.x > hi : c.position.x < lo) c.position.x = u.dir > 0 ? lo : hi; else if (u.dir > 0 ? c.position.x < lo - 30 : c.position.x > hi + 30) c.position.x = u.dir > 0 ? lo : hi; }
    const bu = u.bubble.userData; if (bu.life > 0) { bu.life -= dt; if (bu.life <= 0) u.bubble.visible = false; }
    const sd = u.solid; sd.off = knock.t > 0; sd.minx = c.position.x - u.half; sd.maxx = c.position.x + u.half; sd.minz = c.position.z - 0.95; sd.maxz = c.position.z + 0.95;
  }
  for (const b of cyclists) {
    const u = b.userData;
    let free = 99, byPlayer = false;
    if (Math.abs(P.z - b.position.z) < 0.9) { const d = (P.x - b.position.x) * u.dir - u.len - 0.3; if (d > -0.8) { free = Math.min(free, d); byPlayer = d < 2.5; } }
    for (const o of cyclists) if (o !== b && o.userData.dir === u.dir) { const d = (o.position.x - b.position.x) * u.dir - u.len - o.userData.len - 0.6; if (d > -1) free = Math.min(free, d); }
    const want = free < 0.8 ? 0 : free < 5 ? u.vmax * free / 5 : u.vmax;
    u.v += Math.max(-10 * dt, Math.min(3 * dt, want - u.v));
    if (byPlayer && u.v < 0.6) { u.shoutT -= dt; if (u.shoutT <= 0) { bell(); say(u.bubble, BIKE_SHOUTS[Math.floor(Math.random() * BIKE_SHOUTS.length)], '#2fb8a8'); u.shoutT = 3; } }
    if (u.v > 2 && Math.abs(P.z - b.position.z) < 0.6 && Math.abs(P.x - b.position.x) < u.len + 0.3 && P.y < 0.3) bump(u.dir * 4, Math.sign(P.z - b.position.z || 1) * 3, 4, 'Run over by a ' + ['bike', 'vierfiets', 'tricycle', 'tall bike', 'bakfiets full of Gouda', 'mini bike', 'penny-farthing', 'double-decker bike', 'extra-tall bike', 'four-man tower bike', 'opafiets', 'transportfiets'][u.kind] + '.');
    b.position.x += u.v * u.dir * dt;
    { const [lo, hi] = lifeWin(96); if (u.dir > 0 ? b.position.x > hi : b.position.x < lo) b.position.x = u.dir > 0 ? lo : hi; else if (u.dir > 0 ? b.position.x < lo - 30 : b.position.x > hi + 30) b.position.x = u.dir > 0 ? lo : hi; }
    for (const w of b.children) if (w.userData.r) w.rotation.z -= u.v * dt / w.userData.r; else if (w.userData.crank) w.rotation.z -= u.v * dt * 1.6;
    u.phase += u.v * dt * 1.6;
    u.riders.forEach((r, k) => { const ru = r.userData, ph = u.phase + k * 0.7; const base = ru.squat ? -1.55 : -0.9, amp = ru.squat ? 0.25 : 0.5; ru.legs[0].rotation.x = base + Math.sin(ph * (ru.squat ? 2 : 1)) * amp; ru.legs[1].rotation.x = base - Math.sin(ph * (ru.squat ? 2 : 1)) * amp; });
    const bu = u.bubble.userData; if (bu.life > 0) { bu.life -= dt; if (bu.life <= 0) u.bubble.visible = false; }
  }
  mutterT -= dt; const now = performance.now() / 1000;
  for (const w of walkers) {
    const u = w.userData.walk, cp = u.comp;
    if (u.home) continue; // stayed in out of the weather (js/kaasweer.js)
    let moving = false;
    const bu = w.userData.bubble && w.userData.bubble.userData; if (bu && bu.life > 0) { bu.life -= dt; if (bu.life <= 0) w.userData.bubble.visible = false; }
    if (w.userData.down > 0) continue;
    if (!u.police && !u.flee && mutterT <= 0 && !(w.userData.mutterCd > now) && w.position.distanceTo(P) < 3.4 && Math.random() < dt * 1.5) { // grumble as Eddy walks past
      const wm = Math.random() < 0.4 && world.mutter(), fm = !wm && Math.random() < 0.6 && folk.mutter(w); if (wm) personBubble(w, wm, '#6a8ab0'); else if (fm) personBubble(w, fm.text, fm.col); else personBubble(w, gripe(MUTTERS), '#7a8a9a'); // today's weather and headline (js/kaasweer.js) mutterT = 6 + Math.random() * 6; w.userData.mutterCd = now + 30;
    }
    if (u.flee) { // running off the map; comes back later as an ordinary passer-by
      w.position.x += u.dir * 4.6 * dt; w.rotation.y = u.dir > 0 ? Math.PI / 2 : -Math.PI / 2; animate(w, 4.6, dt);
      { const [lo, hi] = lifeWin(90); if (w.position.x > hi || w.position.x < lo) { u.flee = false; w.position.x = w.position.x > hi ? lo + 4 : hi - 4; u.wait = 20 + Math.random() * 30; } }
      if (cp) { cp.obj.position.x += (w.position.x + u.dir * cp.ahead - cp.obj.position.x) * Math.min(1, dt * 6); cp.obj.rotation.y = cp.type === 'kid' ? w.rotation.y : (u.dir > 0 ? 0 : Math.PI); if (cp.type === 'kid') animate(cp.obj, 4.6, dt); if (cp.type === 'dog' && cp.line) { const a = cp.line.geometry.attributes.position, hand = w.userData.arms[0].localToWorld(new THREE.Vector3(0, -0.66, 0.03)); a.setXYZ(0, hand.x, hand.y, hand.z); a.setXYZ(1, cp.obj.position.x, 0.45 * cp.obj.scale.x, cp.obj.position.z); a.needsUpdate = true; } }
      continue;
    }
    if (u.wait > 0) u.wait -= dt;
    else {
      let lane = LANES[u.side][u.dir > 0 ? 0 : 1]; if (activists && activists.blocks(w.position.x, lane)) lane = Math.max(lane, -4.3); // round the protesters' picket (js/activists.js)
      const reach = 1.0 + (cp ? Math.max(0, cp.ahead) : 0);
      let blocked = false;
      const near = (x, z, r) => { const dx = (x - w.position.x) * u.dir, dz = Math.abs(z - w.position.z); return dx > 0 && dx < r && dz < 0.6; };
      if (near(P.x, P.z, reach) || near(dad.position.x, dad.position.z, reach)) blocked = true;
      for (const o of walkers) if (o !== w && near(o.position.x, o.position.z, reach - 0.1)) blocked = true;
      if (blocked) { u.blocked += dt; if (u.blocked > 1.6) { u.dir *= -1; u.blocked = 0; } }
      else {
        u.blocked = 0; moving = true;
        w.position.x += u.v * u.dir * dt; w.position.z += (lane - w.position.z) * Math.min(1, dt * 2);
        w.rotation.y = u.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        if (!BOUNDS.cur) { const lo = Math.max(WALK.x0 + 6, P.x - 84), hi = Math.min(WALK.x1 - 6, P.x + 84); // they turn at the ends of the street, or 84 m from Eddy, and catch up when he has walked on
          if (u.dir > 0 ? w.position.x > hi : w.position.x < lo) { if (w.position.x > hi + 30 || w.position.x < lo - 30) w.position.x = w.position.x > hi ? hi - 2 : lo + 2; u.dir *= -1; u.wait = 0.5 + Math.random(); } }
      }
    }
    if (u.inPlace > 0) { u.inPlace -= dt; w.userData.inPlace = u.inPlace > 0; animate(w, u.v, dt); } // the jogger keeps jogging on the spot
    else animate(w, moving ? u.v : 0, dt);
    if (cp) {
      const sideSign = u.side === 'N' ? 1 : -1; // companions walk on the kerb side
      const tx = w.position.x + u.dir * cp.ahead, tz = w.position.z + sideSign * cp.off;
      cp.obj.position.x += (tx - cp.obj.position.x) * Math.min(1, dt * 6); cp.obj.position.z += (tz - cp.obj.position.z) * Math.min(1, dt * 6);
      const cu = cp.obj.userData; tickBubble(cp.obj, dt); if (cu.kid) tickBubble(cu.kid, dt);
      if (cu.faceT > 0) cu.faceT -= dt; // turned to look at Eddy for a moment
      else cp.obj.rotation.y = cp.type === 'kid' ? w.rotation.y : (u.dir > 0 ? 0 : Math.PI);
      if (cp.type === 'kid') animate(cp.obj, moving ? u.v * 1.3 : 0, dt);
      if (cp.type === 'dog') {
        const du = cp.obj.userData; du.ph += dt * (moving ? 12 : 3);
        du.legs.forEach((l, k) => { l.rotation.z = moving ? Math.sin(du.ph + (k % 2 ? Math.PI : 0) + (k > 1 ? 0.6 : 0)) * 0.5 : 0; });
        du.tail.rotation.x = Math.sin(du.ph * 1.5) * 0.6;
        const a = cp.line.geometry.attributes.position, hand = w.userData.arms[0].localToWorld(new THREE.Vector3(0, -0.66, 0.03));
        a.setXYZ(0, hand.x, hand.y, hand.z); a.setXYZ(1, cp.obj.position.x + (u.dir > 0 ? 0.25 : -0.25) * cp.obj.scale.x, 0.45 * cp.obj.scale.x, cp.obj.position.z); a.needsUpdate = true;
      }
    }
    if (w.userData.folk) { folkCtx.dist = w.position.distanceTo(P); folk.update(w, dt, moving || u.inPlace > 0, folkCtx); }
  }
  if (flashT > 0) { flashT -= dt; if (flashT <= 0) flashLight.intensity = 0; }
}
function tickBubble(o, dt) { const b = o.userData.bubble, bu = b && b.userData; if (bu && bu.life > 0) { bu.life -= dt; if (bu.life <= 0) b.visible = false; } }

// ------------------------------------------------------------------ loop
let current = null; const walkFrom = { x: 0, z: 0 };
const clock = new THREE.Clock();
const occl = new THREE.Raycaster();
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
let incomeT = 0, lastStep = state.step, titleSkip = 0;
function tick() {
  autoQ.tick(performance.now(), isPaused() || state.step === 'title');
  if (isPaused()) { clock.getDelta(); post.render(scene, camera); balloons.sync(scene, camera); requestAnimationFrame(tick); return; }
  // (the drive is part of this world now: js/rit.js runs below, with everything else)
  if (state.step !== lastStep) { lastStep = state.step; writeSave(); }
  let dt = Math.min(clock.getDelta(), 0.05);
  if (mission && mission.active) dt = mission.hitstop(dt); // Neon Vice hitstop on kills
  const riding = !!(fiets && !(mission && mission.active) && fiets.update(dt)); // on the omafiets: js/bikes.js moves Eddy
  if (oofDrive.active) oofDrive.update(dt);
  if (stats && state.step === 'free' && !riding && !(mission && mission.active)) { const wd = Math.hypot(player.position.x - walkFrom.x, player.position.z - walkFrom.z); if (wd > 0.001 && wd < 1) stats.add('walked', wd); } walkFrom.x = player.position.x; walkFrom.z = player.position.z;
  // movement (screen-relative: camera looks north)
  let mx = 0, mz = 0, canMove = false;
  const mOn = mission && mission.active;
  if (!state.inDialogue && !state.inPC && state.step !== 'title' && !(mOn && mission.frozen()) && !mission.invOpen() && !(phone && phone.isOpen)) {
    if (keys.KeyW || keys.ArrowUp) mz -= 1; if (keys.KeyS || keys.ArrowDown) mz += 1;
    if (keys.KeyA || keys.ArrowLeft) mx -= 1; if (keys.KeyD || keys.ArrowRight) mx += 1;
    mx += virt.mx; mz += virt.mz; // controller / touch stick
    canMove = true;
  }
  if (mOn || BOUNDS.cur) ctrlFlip = false; else if (!mx && !mz) ctrlFlip = camFlip; // screen-relative, also with the camera turned round (latched while a key is held, so crossing never reverses you)
  if (ctrlFlip) { mx = -mx; mz = -mz; }
  if (knock.t > 0 || riding || (loods && loods.driving())) { mx = mz = 0; canMove = false; } // on the heftruck, js/loods.js drives
  let len = Math.hypot(mx, mz); if (len < 0.15) { mx = mz = 0; len = 0; }
  // feel pass 2026-11-27: a stick pushed part way walks (keys are always a full push), and Eddy takes ~0.1 s to reach speed
  // and less to stop, so starts and stops read as weight without feeling floaty; anything that takes control stops him dead
  const push = len >= 0.999 ? 1 : Math.min(1, Math.max(0.42, (len - 0.15) / 0.55));
  const speed = len ? (keys.ShiftLeft || keys.ShiftRight ? 7.5 : 4.2) * (1 + 0.06 * (woning ? woning.perk('fleet') : 0)) * push : 0;
  if (!canMove) moveV.x = moveV.z = 0;
  else { const k = 1 - Math.exp(-dt * (len ? 30 : 40)); moveV.x += ((len ? mx / len * speed : 0) - moveV.x) * k; moveV.z += ((len ? mz / len * speed : 0) - moveV.z) * k; if (!len && Math.hypot(moveV.x, moveV.z) < 0.05) moveV.x = moveV.z = 0; }
  if (knock.t > 0) {
    knock.t -= dt;
    player.position.x += knock.vx * dt; player.position.z += knock.vz * dt;
    knock.vx *= 1 - dt * 2.5; knock.vz *= 1 - dt * 2.5;
    knock.vy -= 22 * dt; player.position.y = Math.max(0, player.position.y + knock.vy * dt);
    if (player.position.y === 0 && knock.vy < 0) knock.vy = Math.abs(knock.vy) > 3 ? -knock.vy * 0.35 : 0;
    player.rotation.y += dt * 14 * Math.min(1, knock.t * 2);
    if (knock.t <= 0) player.position.y = 0;
  }
  if (moveV.x || moveV.z) { player.position.x += moveV.x * dt; player.position.z += moveV.z * dt; }
  if (len) {
    const target = mission && mission.aiming() ? player.rotation.y : Math.atan2(mx, mz);
    let dr = target - player.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr));
    player.rotation.y += dr * Math.min(1, dt * 20);
  }
  if (!(loods && loods.driving()) && !riding) collide(player.position, 0.38);
  if (!riding) animate(player, Math.hypot(moveV.x, moveV.z), dt);
  updateMelee(dt);
  if (!(freddy && freddy.update(dt))) { // Freddy Sr. back home: js/freddy.js walks him behind Eddy
  // dad faces the player when close
  const toP = Math.atan2(player.position.x - dad.position.x, player.position.z - dad.position.z);
  if (dad.userData.walkTo && dad.userData.walkTo.length) { // walking out through the shutter
    const t = dad.userData.walkTo[0], d = t.clone().sub(dad.position); d.y = 0; const L = d.length();
    if (L < 0.08) { dad.userData.walkTo.shift(); if (!dad.userData.walkTo.length) dadOutside(); }
    else if (shutterOpen > 0.6 || dad.userData.walkTo.length < 3) { const st = Math.min(L, 2.2 * dt); dad.position.addScaledVector(d.normalize(), st); dad.rotation.y = Math.atan2(d.x, d.z); animate(dad, 2.2, dt); }
  } else if (player.position.distanceTo(dad.position) < 6) { let dr = toP - dad.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); dad.rotation.y += dr * Math.min(1, dt * 4); }
  if (dad.userData.leaving && dad.visible) {
    dad.rotation.y = Math.PI / 2; dad.position.x -= 2.4 * dt; dad.position.z += (-5.3 - dad.position.z) * dt;
    dad.rotation.y = -Math.PI / 2; dadSolid.off = true; animate(dad, 2.4, dt);
    if (dad.position.x < -36) dad.visible = false;
  } else animate(dad, 0, dt);
  }
  const toR = Math.atan2(player.position.x - russian.position.x, player.position.z - russian.position.z);
  if (isInShop(player.position)) { let dr = toR - russian.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); russian.rotation.y += dr * Math.min(1, dt * 4); }
  animate(russian, 0, dt);
  if (!mOn) { score.update(dt, null); updateStreet(dt); updateCanal(dt); updateOfficers(dt); updateGulls(dt); updateInspector(dt); law.update(dt); updateRazim(dt); if (activists) { activists.update(dt); activists.tick(dt); } if (blokaas) blokaas.update(dt); updateSiege(); mission.street(dt); } else { mission.update(dt); updateRazimMission(dt); }
  setDuck('fight', score.on ? 0 : 1); // the fight score replaces the street song
  const inJ = !mOn && updateJoint(dt);
  // naknikim walk to the table, then work: stir, and run little jobs around De Loods (js/naknikwork.js)
  for (const n of naknikim) {
    const u = n.userData, i = naknikim.indexOf(n); { const m = crew.info(i); n.visible = !(m && m.away); } { const bu = u.bubble && u.bubble.userData; if (bu && bu.life > 0) { bu.life -= dt; if (bu.life <= 0) u.bubble.visible = false; } }
    if (u.walking) {
      const via = n.position.z > -7.5 ? new THREE.Vector3((WH.doorX0 + WH.doorX1) / 2, 0, -9) : u.target;
      const d = via.clone().sub(n.position); d.y = 0; const L = d.length();
      if (L < 0.15 && via === u.target) { u.walking = false; n.rotation.y = Math.atan2(u.face[0] - n.position.x, u.face[1] - n.position.z); }
      else { d.normalize(); n.position.addScaledVector(d, Math.min(L, 2.6 * dt)); n.rotation.y = Math.atan2(d.x, d.z); }
      animate(n, u.walking ? 2.6 : 0, dt);
    } else if (work.update(n, dt, crew.napping(i))) { // low mood: back at the table, asleep against the sacks
      u.body.rotation.x = -0.5; u.phase += dt;
      if (Math.sin(u.phase * 0.7) > 0.995 && !(u.bubble && u.bubble.visible)) personBubble(n, 'Zzz...', '#a9c46a');
    }
  }
  work.tick(dt);
  if (state.table) spiceInBowl.rotation.y += dt * (state.naknik ? 2 : 0);
  // a finished mission ends the market day (checked back in the hub, so the toast doesn't cover the results screen)
  if (!mission.active && !state.inDialogue && econ.update()) garage.afterMission(); // a mission ended: maybe a wheel clamp
  if (state.step === 'free' && !mission.active) { const dp = document.getElementById('dayplan'), l = econ.planLine(); if (dp && dp.dataset.l !== l) { dp.dataset.l = l; dp.innerHTML = l; } } // keep today's plan line current
  if (!mission.active) { garage.dayCheck(); const oops = crew.dayCheck(); if (oops) { const here = naknikim.filter((x, k) => x.visible && !crew.napping(k)); const who = here[Math.floor(Math.random() * here.length)]; if (who) { personBubble(who, oops, '#f2c14e'); spiceCloud(who.position); } } }
  if (npcs) npcs.update(dt);
  if (phone) phone.update(dt);
  tips.update(dt);
  if (woning && !mOn) woning.update(dt);
  if (loods && !mOn) loods.update(dt);
  if (johan && !mOn) johan.update(dt);
  if (venues && !mOn) venues.update(dt);
  buurt.update(dt); bfolk.update(dt); if (regulars) regulars.update(dt); if (vandaag) vandaag.update(dt); if (top10) top10.update(dt); if (hub) { hub.update(dt); checkUnlocks(dt); } if (roam) roam.update(dt, mOn); if (wijk) wijk.update(dt, mOn); if (pahuis) pahuis.update(dt); if (goederen && !mOn && !tripOn()) goederen.update(dt); if (spoed && !mOn) spoed.update(dt); if (leven) { leven.set(mOn || oofDrive.active ? null : wijk && wijk.active ? wijk.streets() : state.step === 'free' && !BOUNDS.cur && player.position.z < -40 ? KOMIJN : null); leven.update(dt); } if (klok) klok.update(dt); if (stats) stats.update(dt); if (politie && !mOn) politie.update(dt);
  world.update(dt, player.position, state.step !== 'title' && !mOn && !(woning && woning.inside()) && !(winkels && winkels.inside()) && !isInside(player.position) && !(venues && venues.inside())); // rain, snow and lightning on the street (js/kaasweer.js)
  { const P_ = player.position; // the song restyles inside some buildings (js/music.js setStyle), and goes back to the street version outside
    music.setStyle(mOn || tripOn() ? null : venues && venues.inClub(P_) ? 'disco' : venues && venues.inShow(P_) ? 'bollywood' : isInShop(P_) ? 'russian' : isInJoint(P_) ? 'arabic' : null); }
  if (prod && !mOn) prod.update(dt);
  if (inricht) { inricht.tick(); inricht.update(); }
  ui.income.textContent = state.naknik || econ.helpKg() ? `${state.naknik ? `${state.naknik} Naknik${state.naknik === 1 ? '' : 'im'}` : 'Your own hands'} · mixing ${econ.dayKg()} kg a market day` : ''; // (the old W 30 / 6 sec timer is gone)
  // money counter
  if (state.shown !== state.money) { const d = state.money - state.shown; state.shown += Math.sign(d) * Math.max(1, Math.ceil(Math.abs(d) * dt * 4)); if (Math.sign(state.money - state.shown) !== Math.sign(d)) state.shown = state.money; }
  ui.money.textContent = 'W ' + String(Math.max(0, state.shown)).padStart(7, '0');
  // shutter
  shutterOpen += (shutterTarget - shutterOpen) * Math.min(1, dt * 1.5);
  shutter.position.y = 1.7 + shutterOpen * 3.1; shutter.scale.y = 1 - shutterOpen * 0.9;
  // inside the warehouse: hide roof + front wall, switch on lights
  const inside = isInside(player.position) && state.step !== 'title'; // the title backdrop shows the street with the roof on
  shedFront(!!(loods && loods.has('hal')));
  roof.visible = !inside; frontHigh.visible = !inside; shutter.visible = !doorOnly.on && (!inside || shutterOpen < 0.5);
  whCull(inside); whZoneTick(); doorGuard(dt);
  const li = inside ? 2.2 : 0; inLight1.intensity += (li - inLight1.intensity) * dt * 4; inLight2.intensity = inLight1.intensity;
  // pawnshop: door swings open, roof + façade hide while you're inside, bunker lights come on
  shopDoorOpen += (shopDoorTarget - shopDoorOpen) * Math.min(1, dt * 3); shopDoor.rotation.y = shopDoorOpen * 1.7;
  const inShop = isInShop(player.position);
  shopRoof.visible = !inShop; shopFrontHigh.visible = !inShop;
  for (const [l, k] of shopLights) l.intensity += ((inShop ? k : 0) - l.intensity) * Math.min(1, dt * 4);
  // interaction prompt
  current = null; let best = 1e9;
  const fx = Math.sin(player.rotation.y), fz = Math.cos(player.rotation.y);
  for (const it of inter) {
    if (it.enabled && !it.enabled()) continue;
    const p = it.pos(), dx = p.x - player.position.x, dz = p.z - player.position.z, d = Math.hypot(dx, dz);
    if (d >= it.r) continue;
    const score = d - (d > 0.05 ? (dx * fx + dz * fz) / d : 1) * 0.6; // two things in reach: the one Eddy faces wins
    if (score < best) { best = score; current = it; }
  }
  if (current && !state.inDialogue && !state.inPC && state.step !== 'title' && !(fiets && fiets.riding())) { showPrompt(current); }
  else { ui.prompt.style.display = 'none'; promptFor = null; }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) ui.toast.style.display = 'none'; }
  // camera: Neon Vice-style high top-down, eased
  const carV = fiets && fiets.current && fiets.current.kind === 'car' ? Math.abs(fiets.current.B.v) : -1; driveZoom += ((carV < 0 ? 1 : 1.22 + Math.min(0.95, carV / 34)) - driveZoom) * Math.min(1, dt * 2); // a car pulls the camera back, more at speed
  const off = new THREE.Vector3(0, 12.5 * zoom * driveZoom, 6 * zoom * driveZoom);
  if (oofDrive.active && fiets && fiets.current) { // a trip in the Oofmobiel: the camera sits behind the van and turns with it, so the road ahead is up the screen (also on an upright phone)
    const hh = fiets.current.B.h; chaseH += Math.atan2(Math.sin(hh - chaseH), Math.cos(hh - chaseH)) * Math.min(1, dt * 2.6);
    chaseLow += ((BOUNDS.cur ? 1 : 0) - chaseLow) * Math.min(1, dt * 1.5); // on the snelweg the camera drops behind the van: the road runs to the horizon and the blue signs can be read
    const zk = zoom * (1 + (driveZoom - 1) * (1 - 0.7 * chaseLow)), d = (7.5 + 6.5 * chaseLow) * zk; off.set(-Math.sin(chaseH) * d, (11.5 - 6.3 * chaseLow) * zk, -Math.cos(chaseH) * d);
  } else if ((polderCam = !!(wijk && wijk.town && wijk.town.W.polder && !mOn))) { // Almere (js/wijk.js buildPolder): the snelweg camera, low with the horizon in view (Tristan 2026-11-28)
    const v = fiets && fiets.current;
    if (v && v.kind === 'car') { const hh = v.B.h; chaseH += Math.atan2(Math.sin(hh - chaseH), Math.cos(hh - chaseH)) * Math.min(1, dt * 2.6); chaseLow += (1 - chaseLow) * Math.min(1, dt * 1.5);
      const zk = zoom * (1 + (driveZoom - 1) * 0.3), d = 14 * zk; off.set(-Math.sin(chaseH) * d, 5.2 * zk, -Math.cos(chaseH) * d); }
    else { chaseH = Math.PI; chaseLow = 0; off.set(0, 5.6 * zoom, 17 * zoom); } // on foot: dropped low behind Eddy, looking up the road at the halls and the A6
  } else { chaseH = Math.PI; chaseLow = 0; }
  if (mOn || BOUNDS.cur || state.step === 'title') { camFlip = false; flipA = 0; } else if (!camFlip && player.position.z > CZ + 1.2) camFlip = true; else if (camFlip && player.position.z < CZ - 1.2) camFlip = false;
  flipA += ((camFlip ? Math.PI : 0) - flipA) * Math.min(1, dt * 2.2);
  if (flipA > 0.002) off.set(Math.sin(flipA) * 6 * zoom, 12.5 * zoom, Math.cos(flipA) * 6 * zoom); // swing round the east side to face the far quay
  if (inside || inShop || inJ) off.set(0, 14 * zoom, 4.5 * zoom);
  if (loods && loods.inside()) off.set(0, 16 * zoom, 5.5 * zoom); // De Hal is big
  const rc = roomCam(), wf = rc ? rc.camFocus(player.position) : null; // in Eddy's woning or a shop: frame the room, follow Eddy a little
  if (wf) { const ch = rc.camHeight(); off.set(0, ch * zoom, ch * 0.43 * zoom); }
  const jc = new THREE.Vector3(((JS.x0 + JS.x1) / 2) * 0.4 + player.position.x * 0.6, 0, -11.5 * 0.5 + player.position.z * 0.5);
  camPos.lerp((inJ ? jc.clone() : inShop ? new THREE.Vector3((PS.x0 + PS.x1) / 2 * 0.4 + player.position.x * 0.6, 0, -12.2 * 0.5 + player.position.z * 0.5) : wf ? wf.clone() : driveFocus()).add(off), Math.min(1, dt * (fiets && fiets.riding() ? 6 : 4)));
  const lookAt = inJ ? jc.clone().setY(0.8) : inShop ? new THREE.Vector3((PS.x0 + PS.x1) / 2 * 0.4 + player.position.x * 0.6, 0.8, -12.2 * 0.5 + player.position.z * 0.5) : wf ? wf.clone().setY(0.8) : driveFocus().add(new THREE.Vector3(0, 0.8, 0));
  if (state.step === 'title') { const tt = performance.now() * 0.001; camPos.set(-14 + Math.sin(tt * 0.045) * 16, 5.2 + Math.sin(tt * 0.11) * 0.6, 7.5); camLook.set(camPos.x * 0.85 + 2, 1.6, -7); }
  else if (mOn) { const mc = mission.cameraFor(zoom); if (mission.snap) { camPos.copy(mc.pos); mission.snap = false; } camPos.lerp(mc.pos, Math.min(1, dt * 5)); camLook.copy(camPos).sub(mc.pos).add(mc.look); }
  else camLook.lerp(lookAt, Math.min(1, dt * 6));
  if (inricht && inricht.active()) { const ic = inricht.cam(); camPos.copy(ic.pos); camLook.copy(ic.look); } // (the plan view holds still: dragging needs a steady floor)
  { const vc = venues && venues.cam && !mOn ? venues.cam() : null; if (vc) { camPos.copy(vc.pos); camLook.copy(vc.look); } } // Club Monique's privé booth: close-up shots (js/venues.js)
  camera.position.copy(camPos); camera.lookAt(camLook);
  if (sun.shadow.autoUpdate || (++shadowTick & 1)) { sun.position.set(player.position.x - 18, 30, player.position.z + 14); sun.target.position.copy(player.position); sun.shadow.needsUpdate = true; } // (the light only moves when its map is redrawn, so shadows never swim)
  if (aeroWorld) aeroWorld.tick(dt);
  clutter.visible = post.mode !== 'simple'; // Simpel: no street clutter (js/richtex.js)
  if (post.mode === 'enhanced') { waterRip.offset.x = (waterRip.offset.x + dt * 0.01) % 1; waterRip.offset.y = (waterRip.offset.y + dt * 0.017) % 1; }
  if (!aeroWorld || !aeroWorld.on) water.material.color.setHSL(0.5, 0.55, 0.2 + Math.sin(performance.now() * 0.001) * 0.01);
  $('clock').textContent = new Date().toTimeString().slice(0, 5);
  // fade houses that stand between the camera and the player (Neon Vice-style cutaway)
  occl.set(camera.position, player.position.clone().add(new THREE.Vector3(0, 1, 0)).sub(camera.position).normalize());
  occl.far = camera.position.distanceTo(player.position);
  const hits = new Set(); for (const h of occl.intersectObjects(fadeables, true)) { let o = h.object; while (o && !o.userData.fade) o = o.parent; if (o) hits.add(o); }
  for (const g of fadeables) {
    const tgt = g.userData.cut && g.position.z > player.position.z && g.position.z - player.position.z < 22 && Math.abs(g.position.x - player.position.x) < 30 ? 0.1 : hits.has(g) || (false && g.position.z > player.position.z && g.position.z - player.position.z < 22 && Math.abs(g.position.x - player.position.x) < 30) ? 0.22 : 1; // cut: a row with its back to the camera (js/wijk.js) opens up along the whole stretch Eddy is on
    if (Math.abs(g.userData.fade - tgt) > 0.01) {
      g.userData.fade += (tgt - g.userData.fade) * Math.min(1, dt * 8);
      g.traverse((c) => { if (c.isMesh) { c.material.opacity = g.userData.fade * (c.material.userData.baseOp ?? 1); c.material.depthWrite = g.userData.fade > 0.95 && c.material.userData.baseOp === undefined; } });
    }
  }
  skipHiddenMatrices();
  // the painted city covers the street on the title screen: keep the 3D scene warm with an occasional frame
  if (!(state.step === 'title' && titleCity && titleCity.ready && (++titleSkip % 20))) post.render(scene, camera);
  balloons.sync(state.step === 'title' ? null : scene, camera);
  requestAnimationFrame(tick);
}
camPos.copy(player.position).add(new THREE.Vector3(0, 12.5, 6)); camLook.copy(player.position);
updateObjective();
mission = initMission({ tod: () => (klok ? klok.tod() : null), onEvent: (t, x) => { if (freddy) freddy.onMission(t, x); if (t === 'results' && stats) { stats.add('raids'); stats.add('kos', (x && x.kills) || 0); if (x && /^S/.test(x.grade || '')) stats.add('sGrades'); } if (t === 'results' && vandaag) vandaag.note('raid', x && x.grade); if (t === 'results' && state.lastRaid && brep) brep.raid(state.lastRaid.id, x && x.grade, { vettenburg: LAMPAS.map((j) => j[1]), hipster: NOSH.map((j) => j[1]), dokken: ABD.map((j) => j[1]), zandwijk: PARA.map((j) => j[1]) }); }, score, musicOn: () => music.on, perk: (k) => (woning ? woning.perk(k) : 0) + (k === 'medic' && regulars && regulars.haringOn() ? 2 : 0) /* a broodje haring (js/regulars.js): faster healing this raid */, THREE, scene, camera, player, state, box, cyl, lam, solid, solids, collide, makePerson, animate, toast, beep, addMoney,
  neonTube, neonRect, signTex, canvasTex, car, $, maboota, equip, swing, bubble, say, addInteract, clearPlayerSplats, sun, hemi, canvas,
  tip: (k) => tips.show(k), dialogue: (lines, done) => dialogue(lines, done), choiceOpen: () => choiceOpen, interacting: () => current, // the [E] prompt on screen (the van, a task): E acts on it instead of throwing the weapon // Shooki's tips; the clamp choice must not lose its keys to the mission
  parkTicket: () => garage.addTicket(mission.levelName()), clampVan: () => writeSave(), parkDone: () => garage.parkingDone(), // paid bays (js/garage.js)
  clampChoice: (cb) => { tips.show('clamp'); const tix = garage.ticketSum(); choice('Oofmobiel', `The handhaver left a <b>wheel clamp</b> on the front wheel. Pay at the parking office (W ${garage.CLAMP_FINE + tix}${tix ? ', with your open tickets' : ''}) or get Monteur Mo to cut it off (W ${garage.MO_CLAMP})?`, ['Pay the fine', 'Call Mo', 'Leave it'], (i) => cb(i < 2 && garage.unclamp(i ? 'mo' : 'pay'))); },
  arrived: (i) => razimArrived(i), left: () => razimLeft(), // Razim sometimes waits by the van (above)
  makeVan: () => oof.clone(true), brand: () => liveryNow(), save: () => writeSave(), kitChanged: () => kitText(), shop: SHOP, streetTargets, streetHit: hitStreetPerson, setBounds: (b) => { BOUNDS.cur = b; }, updateObjective, setArea: (t) => { $('area').textContent = t; } });
initInput({ state, getMission: () => mission, canvas, beep, toast, gfx: post, fonts });
// the drive to the next district (js/rit.js): from the van map once Kipkruidenkwartier is yours
{ const enter0 = mission.enter; mission.enter = (id, o) => { const r = enter0(id, o); if (r !== null && regulars) regulars.raidStart(); if (r !== null && freddy) freddy.onMission('enter', o || {}); const tip = () => { if (mission.arriving && mission.arriving()) { setTimeout(tip, 500); return; } tips.show(o && o.heist ? 'heist' : o && o.defend ? 'siege' : o && o.remix ? 'remix' : 'mission'); }; setTimeout(tip, 1600); return r; }; } // Shooki's first-time tips (after the joint intro and the van arrival)
// the snelweg politie (js/snelpolitie.js): stats, the fine, and Garage Mo hearing about it (the turbo unlocks in js/garage.js)
function onSnelPolitie(kind, data) {
  if (kind === 'chase') { if (stats) stats.add('chases'); if (garage.chased()) setTimeout(() => toast('GARAGE MO', rankNow() >= 2 ? '"Heard the stekkerpolitie had you on the snelweg. Come by the garage: I\'ve got something with a turbo."' : '"Heard the politie had you on the snelweg. When you\'re a Kruidenhandelaar, come and see me. I\'ve got something with a turbo."', 6), 14000); }
  else if (kind === 'escape') { if (stats) stats.add('escapes'); }
  else if (kind === 'arrest') { const paid = Math.min(state.money, data.fine | 0); if (paid) addMoney(-paid); if (stats) { stats.add('arrests'); stats.add('fines', paid); } if (brep) brep.add('kade', -3, 'arrested on the snelweg'); }
}
const oofDrive = createRit({ onPolice: onSnelPolitie, nightK: () => (klok ? klok.tod().n : 0), onHonk: () => { if (stats) stats.add('flitsers'); }, THREE, scene, player, state, kit, lam, signTex, solid, toast, beep, choice, RC, roadMat: ST.road, isPaused, day: () => econ.ensure().day,
  makeCar: (o) => makeCar(THREE, canvasTex, { ...o, rand: crand }), makeVan: () => oof.clone(true), passerBy: (seed) => passerBy(seed), animate: (p, v, dt) => animate(p, v, dt),
  get fiets() { return fiets; }, oof, oofSolid, buurt: () => buurt, setBounds: (b) => { BOUNDS.cur = b; }, snapCam: () => window.__sme.snapCam(),
  exit: { get x() { return Math.min(213, WALK.x1 - 3); }, z: RC + 1.5 }, blockedStart: () => !!(mission && mission.active) || !!(fiets && fiets.riding()) });
{ const start0 = oofDrive.start; oofDrive.start = (o) => { // today's weather rides along: wet or frozen roads slide (js/kaasweer.js)
  const g = world ? world.grip() : 1; start0({ grip: g, ...o });
  if (g < 0.95) setTimeout(() => toast(g < 0.6 ? 'SPEKGLAD' : 'GLAD WEGDEK', `${world.weather().icon} ${world.weather().name}: the Oofmobiel slides in the corners. Brake early.`, 3), 400);
}; }
let driveMission = null; // the Lampas mission the drive is heading for (null: a scouting run)
// the day plan (econ.today): a raid takes the whole day, warehouse work and deliveries share one. Sleeping or the PC button ends it.
function raidRefused() { tips.show('day'); toast('NOT TODAY', 'A raid takes the whole day, and you already worked today. Sleep (or end the day on the PC) and raid tomorrow.', 4); }
function endDay() {
  if (mission.active || tripOn()) return false;
  const idle = state.step === 'free' && !econ.today().plan; // nothing done today: a rest day, once every few days (balance 2026-11-19)
  if (idle && !econ.restOK() && !(garage.ensure().clamp && state.money < garage.MO_CLAMP)) { tips.show('rest'); toast('NOT TIRED YET', `You already had a rest day. Do something first: a delivery run in the Oofmobiel, a Klusbord job, racking pallets, or a raid. Next rest day: day ${econ.restNext()}.`, 5); return false; }
  if (idle) econ.rested();
  econ.endDay(econ.today().plan === 'raid' ? 'recovering' : econ.today().plan ? 'asleep' : 'taking a day off'); writeSave(); updateObjective(); if (state.inPC) renderPC(); return true;
}
{ const enter1 = mission.enter; mission.enter = (id, o) => { // every raid but the warehouse defence claims the day
  if (!(o && o.defend)) { if (!econ.canRaid()) { raidRefused(); return null; } econ.startRaid(); }
  return enter1(id, o);
}; }
function startDrive(id = null, wk = null) {
  if (tripOn() || mission.active) return; // already away
  if (id ? !econ.canRaid() : !econ.canDrive()) { if (id) raidRefused(); else toast('NOT TODAY', econ.today().plan === 'raid' ? 'Today is a raid day.' : 'One delivery run a day: the Oofmobiel needs a rest. Finish up and end the day.', 3.5); return; }
  if (id) econ.startRaid(); else econ.work('rit');
  driveMission = id; driveWijk = id ? null : wk || 'lampas'; const j = id && JOINTS.find((x) => x[1] === id); oofDrive.start({ van: garage.stats(), from: 'Kipkruidenkwartier', to: j ? j[0] : wijk ? wijk.WIJKEN[driveWijk].name : 'Oud-Vettenburg', target: j && j[4], theme: !j ? driveWijk : (PARA.includes(j) ? 'sand' : NOSH.includes(j) ? 'nosh' : ABD.includes(j) || FINAL.includes(j) ? 'docks' : 'lampas'), mission: id ? mission.LEVELS[id].text.banner[0] + ' is just round the corner.' : null, onDone: afterDrive }); }
const wijkOpen = (k) => (k === 'almere' ? !!(blokaas && blokaas.almereOpen()) : k === 'pijp' ? true : k === 'air' ? !!(freddy && (freddy.back() || freddy.due())) : k === 'lampas' ? !!state.district1 : k === 'nosh' ? !!state.act1 : !!state.act2);
const PA_DOOR = { x: 31, z: -59.9 }; // Freddy Sr.'s front door on the Komijnstraat (js/pahuis.js)
const makePa = () => makePerson({ ps2: LOOKS.eddySr, headKind: 'sr', shirt: 0x232a40, front: 'sr', pants: 0x4a4a52, shoes: 0x2a2018, belly: 0.6, skin: 0xdc9c82, scale: 0.96 }); // a district opens when the story reaches it
const wijkOf = (id) => { const j = ACT_JOINTS.find((x) => x[1] === id); return !j ? null : PARA.includes(j) ? 'sand' : NOSH.includes(j) ? 'nosh' : ABD.includes(j) || FINAL.includes(j) ? 'docks' : 'lampas'; };
const raidOnFoot = (id, inStreet) => { if (!econ.canRaid()) { raidRefused(); return; } const rx = owns(id) ? { ...mission.remixFor(id, econ.ensure().day), retake: econ.isRetaken(id) } : null; if (rx && rx.retake) { const km = econ.retakeMod(); if (km) rx.mod = km; } mission.enter(id, { ...(rx ? { remix: rx } : {}), onFoot: true, inStreet }); }; // knocked on the joint's door in the open world: straight in, no van drive-in
function afterDrive(res) {
  clearPlayerSplats(); clock.getDelta();
  if (res.arrived) {
    addMoney(res.pay); state.drives = state.drives || {};
    state.drives.oudvettenburg = Math.min(state.drives.oudvettenburg ?? 1e9, Math.round(res.time));
    if (driveMission) { const id = driveMission; driveMission = null; econ.driveDone(true); writeSave(); const wk = wijkOf(id);
      if (wk && wijk) { wijk.enter(wk, { target: id }); return; } // arrived: Eddy is in the district, the joint is down the street (js/wijk.js)
      mission.enter(id, owns(id) ? { remix: { ...mission.remixFor(id, econ.ensure().day), retake: econ.isRetaken(id) } } : {}); return; }
    if (wijk) { econ.driveDone(true); wijk.enter(driveWijk || 'lampas'); return; } // a run without a raid: look around the Lampas streets
    toast('BACK AT THE WAREHOUSE', `Oud-Vettenburg scouted. +W ${res.pay}. The day isn't over: rack pallets, deliver, then sleep to end it.`, 4.5);
  } else { driveMission = null; toast('BACK AT THE WAREHOUSE', 'The Oofmobiel limps home on three wheels.', 3); }
  econ.driveDone(!!res.arrived); // a scout job pays out
  setTimeout(() => tips.show('day'), 4600); // a delivery run doesn't end the day: Eddy does, by sleeping
  writeSave(); updateObjective();
}
deviceHints();
npcs = initNpcs({ tutorial, THREE, scene, makePerson: (o) => makePS2Person(lookFromPerson(o, HEADS), { scale: o.scale, scene }), addInteract, dialogue, choice, toast, state, econ, player, addMoney, animate, solid, owns, mission, sit, rankOf, save: () => writeSave(), debrief: (w) => !!(activists && activists.debrief(w)) || !!(blokaas && blokaas.debrief(w)) });
loods = createLoods({ forkExtra: (t, F) => (johan ? johan.forkExtra(t, F) : null), layoutEff: () => (inricht ? inricht.eff() : 1), floorKg: () => (prod ? prod.floorKg() : null), rackLoads: () => (prod ? prod.rackLoads() : null), dressPallet: (g, l) => prod && prod.dressPallet(g, l), tip: (k) => tips.show(k), makeDriver: () => makePerson({ ps2: LOOKS.naknik, headKind: 'nak', shirt: 0xec7d2c, front: 'nak', pants: 0xc45e1a, shoes: 0x3a2a1a, belly: 0.8, skin: 0xe8b890, scale: 0.68, rolled: true }), THREE, scene, box, cyl, lam, canvasTex, signTex, solid, collide, addInteract, player, state, econ, rank: rankNow, addMoney, toast, beep, keys, virt, glyph,
  save: () => writeSave(), setBounds: (b) => { BOUNDS.cur = b; }, snapCam: () => window.__sme.snapCam(), shutter,
  junkDone: () => state.sold.size === junkDefs.length, inWarehouse: () => isInside(player.position), blocked: () => mission.active || tripOn(),
  away: () => mission.active || tripOn(), frozen: () => state.inDialogue || state.inPC || choiceOpen || !!(phone && phone.isOpen),
  hideShelf: (on) => { for (const m of backShelf.meshes) m.visible = !on; backShelf.sol.off = on; backPlug.visible = !on; backPlugSolid.off = on; } });
// ================================================================== JOHAN (js/johan.js): The Letter, the Miata, the forklift
johan = createJohan({ THREE, scene, state, dialogue, toast, beep, save: () => writeSave(), player, loods, solid, addInteract,
  day: () => econ.ensure().day, bubble: (p, t) => personBubble(p, t), animate: (p, dt) => animate(p, 0, dt),
  makeJohan: () => makePerson({ ps2: LOOKS.johan, headKind: 'johan', shirt: 0x1e2a4a, front: 'johan', pants: 0x1a1e2a, shoes: 0x6a3a1c, belly: 0, skin: 0xe8bc9c }) });
{ const st = oofDrive.start; oofDrive.start = (o) => st({ ...o, johan: johan.driveCue() }); }
{ const st = oofDrive.start; oofDrive.start = (o) => { const ev0 = o.onEvent; // diesel on the Maandag bill and wear on the van (js/bills.js, js/garage.js)
  return st({ ...o, onEvent: (t, x) => { if (ev0) ev0(t, x);
    if (t === 'start') bills.drove();
    else if (t === 'arrive') garage.addWear(2 + ((x && x.dents) || 0) * 0.12);
    else if (t === 'fail') garage.addWear(12);
    else if (t === 'canal') { garage.addWear(8); if (!garage.insured() && state.money >= 75) { addMoney(-75); toast('SLEEPDIENST', 'The tow truck wants W 75 for fishing the Oofmobiel out. Van insurance at Garage Mo covers that.', 3); } }
  } }); }; } // Johan may cut the Oofmobiel off, early game
venues = createVenues({ THREE, scene, box, cyl, lam, canvasTex, signTex, solid, addInteract, player, state, dialogue, choice, toast, beep, addMoney, save: () => writeSave(),
  day: () => econ.ensure().day, makePerson: (look, scale) => makePerson({ ps2: look, scale }), sit, animate: (p, dt) => animate(p, 0, dt), passerBy: (seed) => passerBy(seed), makeCar: (o) => makeCar(THREE, canvasTex, o) });
// the production line in the shed: pallets of vaten, the mixer, the packing table (js/productie.js)
prod = createProductie({ rank: () => rankNow(), goods: () => goederen, THREE, scene, box, cyl, lam, canvasTex, signTex, solid, addInteract, player, state, econ, loods, toast, beep, glyph, save: () => writeSave(),
  away: () => mission.active || tripOn() || state.step === 'title', pep: (k) => { for (const m of crew.ensure()) if (!m.away) m.mood = Math.min(100, m.mood + k); } });
solli = createSollicitanten({ extra: () => brep.hireExtra(), state, day: () => econ.ensure().day, rank: rankNow, cap: nakCap, homeCap: () => loods.naknikCap(), canHire: () => !!state.table, perNaknik: () => econ.perNaknik(), addMoney, onHire, fmt: (n) => 'W ' + Math.round(n).toLocaleString('nl-NL'), save: () => writeSave() });
// the Naknikim at work around the shed, the hall and the tent (js/naknikwork.js)
work = createNaknikWork({ carry: prod.carry, lineBusy: () => prod.lineBusy(), pace: (n) => { const m = crew.info(naknikim.indexOf(n)); return m ? { speed: 0.79 + 0.07 * m.tempo, rest: 1.6 - 0.2 * m.ethic } : null; }, scene, solids, solid, animate, list: () => naknikim, frozen: (n) => (state.inDialogue || state.inPC) && n.position.distanceTo(player.position) < 2.6,
  rooms: () => { const r = [{ x0: WH.x0, x1: WH.x1, z0: WH.z0, z1: WH.z1 }, ...loods.workRooms()], a = goederen && goederen.apron(); if (a) r.push(a); return r; }, // (the pavement too, while a truck unloads at the shed)
  ketels: [{ x: -9.3, z: -9.5, area: 'shed', on: () => state.table && state.sold.has('doner') }, { x: -1.4, z: -23.3, area: 'hall', on: () => loods.has('hal') }],
  stations: () => {
    const out = [...loods.workStations(), ...prod.stations(), ...(goederen ? goederen.stations() : [])], shelfY = 1.16, shelfZ = WH.z0 + 1.35;
    if (state.table) out.push({ key: 'pileshed', kind: 'pile', area: 'shed', x: -8.45, z: -12.9, fx: -7.5, fz: -12.9, h: 'floor', grab: true });
    for (const [k, sx] of [[0, WH.x0 + 6.4], [1, WH.x0 + 10.3]]) {
      if (k === 0 && loods.has('hal')) continue; // that shelf made way for the door into De Hal
      const ox = (Math.random() - 0.5) * 2.2;
      out.push({ key: 'shelf' + k, kind: 'shelf', area: 'shed', x: sx + ox, z: shelfZ + 0.5, fx: sx + ox, fz: shelfZ - 0.6, h: 'mid', grab: true, store: true, put: new THREE.Vector3(sx + ox, shelfY, shelfZ - 0.2) });
    }
    return out;
  } });
// Inrichten (js/inrichten.js): E at the pin board in the kantoor, or under the board in De Hal
inricht = createInrichten({ THREE, scene, camera, canvas, state, prod, loods, work, solids, player, toast, beep, save: () => writeSave(), paint: whPaint, snapCam: () => window.__sme.snapCam(),
  shedRect: { x0: WH.x0, x1: WH.x1, z0: WH.z0, z1: WH.z1 }, hallRect: () => { const [hx, hz] = loods.hallAt, H = loods.HALL; return { x0: hx + H.x0, x1: hx + H.x1, z0: hz + H.z0, z1: hz + H.z1 }; },
  door: (room) => (room === 'hall' ? { x: -4.6, z: loods.hallAt[1] + loods.HALL.z1 - 0.9 } : { x: (WH.doorX0 + WH.doorX1) / 2, z: WH.z1 - 0.7 }),
  mustReach: (room) => {
    const st = (sp) => prod.standAt(sp), homes = naknikim.filter((n) => n.userData.target && (room === 'shed' ? n.userData.target.z > WH.z0 : n.userData.target.z < WH.z0 && n.userData.target.x > -11)).map((n) => ({ x: n.userData.target.x, z: n.userData.target.z }));
    if (room === 'hall') { const r = [...prod.FEED_SPOTS.map(st), st(prod.OUT_SPOT), ...prod.UIT_SPOTS.map(st), { x: 10, z: -26.6 }, ...homes]; const L = loods.ensure(); for (let i = 1; i < Math.min(L.racks, 7); i++) { const f = loods.bays[i].front; r.push({ x: f.x, z: f.z + 1.3 }); } return r; }
    const r = [{ x: -8.8, z: -17.9 }, { x: 0.3, z: -16.6 }, ...homes]; if (state.table) r.push(...prod.SHED_SPOTS.map(st), { x: -8.45, z: -12.9 }); if (loods.has('hal')) r.push({ x: -4.6, z: WH.z0 + 0.7 }); return r; } });
addInteract({ pos: () => (inricht.active() ? new THREE.Vector3(0, -99, 0) : loods.inside() ? new THREE.Vector3(loods.hallAt[0] + 1.0, 0, loods.hallAt[1] - 1.6) : new THREE.Vector3(-9.1, 0, WH.z0 + 1.0)), r: 1.3,
  enabled: () => !inricht.active() && (loods.inside() || isInside(player.position)) && !state.inDialogue && inricht.PIECES.some((q) => q.here(loods.inside() ? 'hall' : 'shed')),
  label: () => `Inrichten · place the machines (${Math.round((inricht.eff() - 1) * 100) >= 0 ? '+' : ''}${Math.round((inricht.eff() - 1) * 100)}% kilos)`, act: () => inricht.open(loods.inside() ? 'hall' : 'shed') });
woning = createWoning({ paper: { ok: () => UNLOCK.krant.ok(), unread: () => world.unread(), open: () => openPC('krant') }, placeKluis: (x, z) => mission.placeKluis(x, z), endDay: () => endDay(), hokDoor: (open) => { hokDoorSolid.off = open; hokDoor.leaf.visible = !open; hokDoor.pl.material.map = open ? hokDoor.plOpen : hokDoor.plShut; hokDoor.pl.material.needsUpdate = true; },
  vanStand: () => ({ x: oof.position.x, z: oof.position.z + 1.9 }), THREE, scene, box, cyl, lam, canvasTex, signTex, solid, solids, addInteract, player, state, econ, rankOf, addMoney, toast, dialogue, choice, beep, music, repaint,
  save: () => writeSave(), setBounds: (b) => { BOUNDS.cur = b; }, openPC: (tab) => openPC(tab), doors: HOME_DOORS,
  snapCam: () => { const inH = roomCam(), k = inH ? [inH.camHeight(), inH.camHeight() * 0.43] : [12.5, 6], f = inH ? inH.camFocus(player.position) : player.position.clone(); camPos.copy(f).add(new THREE.Vector3(0, k[0] * zoom, k[1] * zoom)); camLook.copy(f).setY(0.8); }, inWarehouse: () => isInside(player.position), blocked: () => mission.active,
  busy: () => state.inDialogue || state.inPC || choiceOpen || mission.active || tripOn() || state.step === 'title' || !!(phone && phone.isOpen) });
woning.loaded();
{ const start0 = oofDrive.start; oofDrive.start = (o) => { const ev0 = o.onEvent; o = { ...o, onEvent: (t, x) => { if (ev0) ev0(t, x); if (freddy) freddy.driveEvent(t, x); } }; const r = start0(o); /* Pa in the passenger seat */ setTimeout(() => tips.show('drive'), 1200); return r; }; }
phone = initPhone({ extraContacts: () => (blokaas ? blokaas.extraContacts() : []), extraScreens: (ctx) => ({ blokaas: () => blokaas.phoneScreen(ctx), blokaasSms: () => blokaas.smsScreen(ctx) }), freddyCall: () => freddy && freddy.onCall(), freddyMissed: () => freddy && freddy.onMissed(), freddyBack: () => !!(freddy && freddy.back()), freddyChat: () => freddy && freddy.chat(), tip: (k) => tips.show(k), state, econ, dialogue, choice, toast, beep, addMoney, busy: () => state.inDialogue || state.inPC || choiceOpen || mission.active || tripOn() || state.step === 'title', met: (id) => npcs.met(id), inspectorFine: () => garage.inspectorFine(), hasLuik: () => garage.has('luik'), save: () => writeSave() });
freddy = createFreddy({ airport: (job) => !!(wijk && job && wijk.enter('air', { job })), paHouse: () => { if (buurt) buurt.setPoint(PA_DOOR.x, PA_DOOR.z, "Pa's huis"); }, state, econ, dad, dadSolid, player, animate, dialogue, choice, toast, beep, addMoney, save: () => writeSave(), objective: () => updateObjective(), phone: () => phone, drive: () => oofDrive, van: () => garage.stats(), afterDrive: () => { clearPlayerSplats(); clock.getDelta(); },
  busy: () => state.inDialogue || state.inPC || choiceOpen || mission.active || tripOn() || state.step === 'title' || !!(phone && phone.isOpen) || isPaused(),
  hidden: () => state.step === 'title' || mission.active || tripOn() || !!(woning && woning.inside()) || !!(pahuis && pahuis.inside()) });
activists = createActivists({ keepOut, bell: ringBell, knock: (vx, vz, up) => bump(vx, vz, up), indoors: () => isInside(player.position) || !!(loods && loods.inside()) || !!(woning && woning.inside()),
  money: () => state.money, addMoney, pass: (h) => klok && klok.pass(h), rep: (n, why) => brep && brep.add('kade', n, why), fact: (k, data) => world && world.note(k, data),
  flash: () => { const f = $('hitFlash') || Object.assign(document.body.appendChild(document.createElement('div')), { id: 'hitFlash' }); f.style.cssText = 'position:fixed;inset:0;background:radial-gradient(transparent 45%, rgba(200,20,20,.55));opacity:1;pointer-events:none;transition:opacity .45s;z-index:39'; requestAnimationFrame(() => requestAnimationFrame(() => { f.style.opacity = '0'; })); },
  scene, lam, box, passerBy, personBubble, animate, player, dad, state, econ, folk, addInteract, dialogue, choice, toast, beep, save: () => writeSave(),
  freddy: () => freddy, phone: () => phone, metShooki: () => npcs.met('shooki'), inspectorDue: () => garage.inspectorDue(),
  ready: () => state.step === 'free' && !(state.tut && !state.tut.done),
  busy: () => state.inDialogue || state.inPC || choiceOpen || mission.active || tripOn() || state.step === 'title' || !!(phone && phone.isOpen) || isPaused(),
  hidden: () => state.step === 'title' || mission.active || tripOn() || !!(woning && woning.inside()) });
blokaas = createBlokaas({ scene, lam, box, passerBy, personBubble, animate, player, dad, state, econ, folk, addInteract, dialogue, choice, toast, beep, signTex, save: () => writeSave(),
  solid, addMoney, money: () => state.money, rank: () => rankNow(), fact: (k, data) => world && world.note(k, data), wijk: () => wijk,
  route: (x, z, label) => { if (!buurt) return; if (x == null) buurt.clearRoute(); else buurt.setPoint(x, z, label); },
  busyAway: () => state.inDialogue || state.inPC || choiceOpen || mission.active || !!(phone && phone.isOpen) || isPaused(), // in a district (tripOn) Eddy can still talk
  freddy: () => freddy, phone: () => phone, metShooki: () => npcs.met('shooki'), inspectorDue: () => garage.inspectorDue(), activistsHere: () => !!(activists && activists.state().here && !activists.state().gone),
  ready: () => state.step === 'free' && !(state.tut && !state.tut.done),
  busy: () => state.inDialogue || state.inPC || choiceOpen || mission.active || tripOn() || state.step === 'title' || !!(phone && phone.isOpen) || isPaused(),
  hidden: () => state.step === 'title' || mission.active || tripOn() || !!(woning && woning.inside()) || !!(pahuis && pahuis.inside()) });
// Shooki's guided tutorial (js/guide.js): click-through cards that point at the thing to click or the place to go
{
  const V = (x, z, y = 1.6) => new THREE.Vector3(x, y, z);
  const at = (o) => (o && o.position ? o.position.clone().setY(o.position.y + 1.9) : null);
  const castPos = (id) => { const c = npcs && npcs.CAST.find((x) => x.id === id); if (c && c.p.visible) return V(c.p.position.x, c.p.position.z, 2.1); const p = c && c.pos(); return p ? V(p[0], p[1], 2.1) : null; }; // where he really stands (he may be mid-walk)
  const pcReady = () => state.inPC && pcMode === 'pc' && $('pc').style.display === 'block' && !kd.booting;
  const L = lessons({ state, tutorial, money: () => state.money,
    near: (v, r) => !!v && Math.hypot(v.x - player.position.x, v.z - player.position.z) < r,
    pcReady, tab: (id) => pcReady() && pcTab === id && kd.winOpen,
    icon: (label) => [...document.querySelectorAll('#pcicons .icon')].find((e) => e.textContent.toLowerCase().includes(label.toLowerCase())) || null,
    q: (sel, up = 0) => { let e = document.querySelector(sel); for (let k = 0; e && k < up; k++) e = e.parentElement; return e; },
    row: () => { const b = document.querySelector('#winbody [data-buy]'); return b ? b.closest('tr') : null; },
    stockCell: () => { const b = document.querySelector('#winbody [data-sellst]'); return b ? b.closest('td') : null; },
    table: (t) => [...document.querySelectorAll('#winbody table.list')].find((e) => e.textContent.includes(t)) || null,
    cell: (t) => [...document.querySelectorAll('#winbody td')].find((e) => e.textContent.includes(t)) || null,
    junkLeft: () => junkDefs.length - state.listed.size, isInShop: () => isInShop(player.position),
    pos: {
      dad: () => (dad.visible ? at(dad) : null), desk: () => V(-8.8, -19.2, 2.4), door: () => V((PS.doorX0 + PS.doorX1) / 2, PS.z1 + 0.4, 2.6),
      russian: () => at(russian), oof: () => at(oof), shooki: () => castPos('shooki'), joop: () => castPos('joop'),
      junk: () => { const left = junkDefs.filter((j) => !state.listed.has(j.id) && j.group.visible); left.sort((a, b) => Math.hypot(a.x - player.position.x, a.z - player.position.z) - Math.hypot(b.x - player.position.x, b.z - player.position.z)); return left[0] ? V(left[0].x, left[0].z, 1.9) : null; },
    } });
  const pv = new THREE.Vector3();
  guide = createGuide({ state, beep, save: () => writeSave(), current: L.current, pcHint: L.pcHint, label: L.label, count: L.count, pcReady,
    hidden: () => state.step === 'title' || state.inDialogue || choiceOpen || mission.active || tripOn() || isPaused() || !!(phone && phone.isOpen) || (state.inPC && $('pc').style.display === 'block' && kd.booting) || !!(woning && woning.inside()),
    project: (v) => { pv.copy(v).project(camera); return { x: (pv.x + 1) / 2 * innerWidth, y: (1 - pv.y) / 2 * innerHeight, behind: pv.z > 1 }; },
    onSkip: () => { tutorial.skipAll(); updateObjective(); tips.again(state.step === 'talk' ? 'start' : 'step:' + state.step); } }); // skipped: Shooki's corner tip for this moment instead
}
// test hooks: __sme.startLevel('kroketkade') jumps into a mission (skips Chapter 0), __sme.own('spekbuurt', 'kroketkade') marks territories owned
const startLevel = (id) => { if (!['russian', 'free'].includes(state.step)) state.step = 'free'; if (!state.kit.includes('maboota')) giveMaboota(); closePC(); mission.enter(id); };
const ownTerritories = (...ids) => { for (const id of ids) mission.setOwned(id); updateObjective(); writeSave(); };
vandaag = createVandaag({ state, econ, rank: () => rankNow(), tutorial: () => tutorial.active(), unlocked: (t) => (UNLOCK[t] ? UNLOCK[t].ok() : true), klusOpen: () => !!winkels && Object.keys(winkels.JOBS).some((b) => !((state.winkels || {}).jobs || {})[b]),
  rep: (id) => brep.get(id), wear: () => garage.ensure().wear, owing: () => bills.owing(), addMoney, addRep: (n) => { econ.ensure().rep += n; if (n === 5 && stats) stats.add('goals'); }, toast, beep, save: () => writeSave(),
  isTouch: () => document.body.classList.contains('touch'), extra: () => (top10 ? top10.vandaagHTML() : ''),
  hidden: () => state.step === 'title' || state.inDialogue || choiceOpen || state.inPC || mission.active || tripOn() || isPaused() || !!(phone && phone.isOpen) || (buurt && buurt.isOpen()) });
const TAB_NEW = { garage: 'Garage Mo: trade up the Oofmobiel, fit add-ons, and get the wear fixed.', werk: 'The Werkplaats: buy broken machines, fix them up and sell them on.', krant: 'Krant voor het Kaasvolk: the weather, the market and the street, every morning.',
  plan: 'The Plannenbord: night jobs on rival joints, quiet ones and loud ones.', bills: 'Rekeningen: what Maandag will cost you, and any open bills.', rep: 'Buurten: what each neighbourhood thinks of you, and what that changes.',
  beurs: 'The Kruidenbeurs: buy spice for the Naknikim to mix. Prices move every day.', meng: 'The Mengkamer: which blend the Naknikim mix.', rapport: 'The Dagrapport: what the clients paid, and how the gangs feel about you.',
  jobs: 'The Klusbord: delivery jobs for a bit of extra cash.', ideas: 'The Ideeënboek: every trick you learn from the street.', woning: 'Your woning: furniture, outfits and knacks.', loods: 'De Loods: build the warehouse out, step by step.', buurt: 'The Buurtkaart: every shop on the block, and when it is open.' };
const tabOpen = (id) => (!pcHidden.includes(id) || state.table) && tutorial.showTab(id) && !(UNLOCK[id] && !UNLOCK[id].ok());
let unlockT = 0;
function checkUnlocks(dt) { // a PC program that just opened up gets a card with "Laat zien" (js/hub.js)
  if ((unlockT += dt) < 2 || state.step !== 'free' || tutorial.active()) return; unlockT = 0;
  const now = Object.keys(TAB_NEW).filter(tabOpen);
  if (!Array.isArray(state.seenTabs)) { state.seenTabs = now; return; } // an older save: what's open already is not news
  for (const id of now) if (!state.seenTabs.includes(id)) { state.seenTabs.push(id); hub.unlocked(id, TAB_NEW[id], KD_ICONS[id] || ''); }
}
function dueToday() { // what the day strip and Overzicht say is coming
  const out = [], e = econ.ensure(), d = e.day, c = world ? world.cal() : null;
  if (winkels && c) { const reg = winkels.regulars().filter((b) => winkels.JOBS[b].wd === (c.wd + 1) % 7); if (reg.length) out.push(`tomorrow ${reg.length} vaste klant${reg.length > 1 ? 'en collect' : ' collects'}`); }
  const tr = e.inbound.filter((o) => o.day === d + 1).reduce((a, o) => a + o.kg, 0); if (tr) out.push(`truck tomorrow: ${tr} kg`);
  if (bills) { const owe = bills.owing(); if (owe) out.push(`open bills W ${owe.toLocaleString('nl-NL')}`); else if (c && c.wd === 6 && state.table) out.push(`Maandag: bills ~W ${bills.items().reduce((a, x) => a + x.amt, 0).toLocaleString('nl-NL')}`); }
  if (garage.ensure().clamp) out.push('wheel clamp on the van'); else if (garage.ensure().wear >= 60) out.push('the van rattles: Garage Mo');
  if (garage.inspectorDue && garage.inspectorDue()) out.push('the tax inspector is coming');
  return out;
}
function goalSpot(id) { // where a Vandaag goal happens on the street
  const pc = { x: -8.8, z: -15.4, name: 'the Kaasdows pc' };
  if (['order', 'krant', 'haggle', 'bills', 'repair'].includes(id)) return pc;
  if (id === 'rit') return { x: oof.position.x, z: oof.position.z + 2.4, name: 'the Oofmobiel' };
  if (id === 'rack') return { x: -4.6, z: -20.5, name: 'the racks in De Loods' };
  if (id === 'naknik' && naknikim[0]) return { x: naknikim[0].position.x, z: naknikim[0].position.z, name: 'a Naknik' };
  const wd = world ? world.cal().wd : 0, open = bfolk.folk.filter((f) => f.b.open.includes(wd));
  if (id === 'klus') { const k = open.find((f) => winkels.JOBS[f.biz] && !((state.winkels || {}).jobs || {})[f.biz]); return k ? { biz: k.biz } : null; }
  if (id === 'talk' && open.length) { const k = open.slice().sort((a, b) => a.p.position.distanceTo(player.position) - b.p.position.distanceTo(player.position))[0]; return { biz: k.biz }; }
  return null;
}
hub = createHub({ THREE, state, econ, world: () => world, bills: () => bills, brep: () => brep, vandaag: () => vandaag, winkels: () => winkels, buurt: () => buurt, openPC: (t) => openPC(t), camera, player, toast, beep, save: () => writeSave(),
  blocked: () => state.step === 'title' || state.inDialogue || choiceOpen || mission.active || tripOn() || isPaused() || (state.inPC && !hub.isOpen()),
  busy: () => state.inDialogue || choiceOpen || state.inPC || mission.active || tripOn() || isPaused() || !!(phone && phone.isOpen),
  indoors: () => isInside(player.position) || !!(winkels && winkels.inside()) || !!(woning && woning.inside()) || !!(venues && venues.inside()),
  stam: () => stam, stats: () => stats, top10: () => top10, time: () => (klok ? klok.label() : ''), arrowOk: () => tripOn(), goalSpot, dueToday, tabLabel: (id) => (icons.find(([i]) => i === id) || [, , id])[2], isTouch: () => document.body.classList.contains('touch'),
  inPCTab: () => (state.inPC && pcTab ? (icons.find(([id]) => id === pcTab) || [, , ''])[2] : '') });
ui.money.addEventListener('click', (e) => { e.stopPropagation(); if (hub.show('geld')) beep(700, 0.03, 'triangle', 0.02); });
stats = createStats({ state, econ, addMoney, toast, beep, save: () => writeSave(), jobsDone: () => Object.values((state.winkels || {}).jobs || {}).filter((j) => j && j.done).length, maxHearts: () => (stam ? stam.maxHearts() : 0), maxRep: () => (brep ? Math.max(...brep.BUURTEN.map((b) => brep.get(b.id))) : 0) });
top10 = createTop10({ state, econ, stats: () => stats, world: () => world, rank: () => rankNow(), rankName: () => rankOf(econ.ensure().rep).name, owns, blokaas: () => state.blokaas, owing: () => (bills ? bills.owing() : 0),
  held: (g) => (g === 'lampas' ? [...D1, ...LAMPAS] : g === 'noshgey' ? NOSH : g === 'abdavissies' ? ABD : g === 'paravim' ? PARA : []).filter(([, id]) => owns(id)).length,
  brepAvg: () => { const L = brep.BUURTEN.filter((b) => !b.show || b.show(state)); return L.reduce((a, b) => a + brep.get(b.id), 0) / Math.max(1, L.length); },
  addMoney, addRep: (n) => { econ.ensure().rep += n; }, toast, beep, save: () => writeSave(), eligible: () => !!state.table && state.step === 'free' && !tutorial.active(),
  busy: () => state.inDialogue || choiceOpen || state.inPC || mission.active || tripOn() || isPaused() || !!(phone && phone.isOpen) || !!(hub && hub.isOpen()), openKrant: () => openPC('krant') });
stam = createStamklanten({ state, econ, addMoney, toast, save: () => writeSave(), onServed: (n) => stats.add('stam', n), onHappy: () => brep.add('kade', 0.3) });
klok = createKlok({ state, toast, save: () => writeSave(), running: () => !mission.active && !tripOn() && !state.inPC && !state.inDialogue && !choiceOpen && !isPaused(), onTime: (t) => { if (world) world.setTime(t); } });
politie = createPolitie({ THREE, scene, player, state, lam, RC, lifeWin, toast, beep, dialogue, addMoney, makeCar: (o) => makeCar(THREE, canvasTex, { ...o, rand: crand }),
  reachable: () => player.position.z < CZ - 3.2, indoors: () => isInside(player.position) || isInShop(player.position) || !!(winkels && winkels.inside()) || !!(woning && woning.inside()) || !!(venues && venues.inside()),
  paused: () => state.inDialogue || choiceOpen || state.inPC || isPaused(), busy: () => !!(mission.active || tripOn()) || state.step !== 'free', riding: () => fiets.current, dismount: () => fiets.dismount(), speedOf: () => (fiets.current ? Math.abs(fiets.state.v) : 0),
  near: (x, z, r) => walkers.some((w) => w.visible && !(w.userData.walk && w.userData.walk.home) && Math.hypot(w.position.x - x, w.position.z - z) < r),
  onChase: () => stats.add('chases'), onEscape: () => stats.add('escapes'), onArrest: (paid) => { stats.add('arrests'); stats.add('fines', paid); brep.add('kade', -4, 'arrested on the street'); }, passTime: (h) => klok.pass(h) });
roam = createRoam({ lampPool, THREE, scene, player, state, streetPiece, ST, kerbMat, groundMat, lamp, tree, bollard, house, spanWidths, solid, solids, fadeables, car, kit, box, lam, signTex, addInteract, dialogue, choice, toast,
  busy: () => !!(mission.active || tripOn()) || state.inDialogue || choiceOpen, SROW, RC, FAR, WALK, HOME: { x0: -70, x1: 84 }, low: IS_PHONE, snapCam: () => window.__sme.snapCam(),
  owns: (id) => owns(id), retaken: (id) => econ.isRetaken(id), canRoam: () => state.step === 'free' && !tutorial.active(), setArea: (t) => { $('area').textContent = t; },
  raid: (id) => raidOnFoot(id),
  clientLine: (cid) => { const c = CLIENTS.find((x) => x.id === cid); if (!c) return null; const b = BLENDS.find((x) => x.id === c.blend), have = Math.floor((econ.ensure().blends[c.blend] || { kg: 0 }).kg), st = brep ? brep.tierOf(brep.get(cid)).name : ''; return [c.who, `${c.kg} kg ${b ? b.name : c.blend} every market day, Eddy. ${have >= c.kg ? 'I see you have it on the shelf. Good.' : `You have ${have} kg. Don\u2019t make me call the Lampas.`}${st ? ` (The buurt: ${st}.)` : ''}`]; } });
wijk = createWijk({ jointSize: (id) => { const d = mission.LEVELS[id]; return d ? { W: d.W, sx: d.start[0] } : null; }, prebuild: (id) => mission.prebuild(id), shiftCam: (dx, dz) => { camPos.x += dx; camPos.z += dz; camLook.x += dx; camLook.z += dz; }, onEnter: (t) => { if (spoed) spoed.onEnter(t); if (blokaas) blokaas.onEnter(t); }, shopBuild: (key, nm, h) => !!(blokaas && blokaas.shopBuild(key, nm, h)), makePa, animate: (p, v, dt) => animate(p, v, dt), beep, airJob: () => (freddy ? freddy.airJob() : null), lampPool, THREE, scene, player, state, house, spanWidths, solid, solids, fadeables, car, kit, lam, lamp, tree, bollard, ST, kerbMat, groundMat, signTex, addInteract, toast, dialogue, choice,
  setBounds: (b) => { BOUNDS.cur = b; }, snapCam: () => window.__sme.snapCam(), setArea: (t) => { $('area').textContent = t; }, makeVan: () => oof.clone(true), low: IS_PHONE,
  fadeTo: (fn, hold = 120) => { const f = $('wijkFade') || Object.assign(document.body.appendChild(document.createElement('div')), { id: 'wijkFade' }); f.style.cssText = 'position:fixed;inset:0;background:#120a04;opacity:1;pointer-events:none;transition:opacity .35s;z-index:40'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { f.style.opacity = '0'; }, hold); } }, 380); },
  route: (x, z, label) => { if (!buurt) return; if (x == null) buurt.clearRoute(); else buurt.setPoint(x, z, label); },
  joints: (key) => ACT_JOINTS.filter((j) => wijkOf(j[1]) === key).map(([name, id, , ok]) => ({ name, id, open: () => !!ok(), owned: () => owns(id), retaken: () => econ.isRetaken(id) })),
  adoptVan: (van, sol) => fiets.adopt(van, { kind: 'car', name: 'Oofmobiel', own: true, quiet: true, solid: sol, half: 2.5, width: 2.0, k: { vmax: 17, acc: 7, brake: 16, rev: -5, turn: 1.5, grip: 4.5, r: 1.0, nose: 1.9 } }),
  mount: (v) => fiets.mount(v), riding: () => (fiets ? fiets.current : null), isOpen: wijkOpen,
  trip: (o) => oofDrive.start({ van: garage.stats(), noPay: true, skipStreet: true, arrived: '', ...o }),
  raid: raidOnFoot, clientLine: () => null, dismount: () => { if (fiets && fiets.riding()) fiets.dismount(); }, busy: () => !!mission.active || state.inDialogue || choiceOpen,
  goHome: () => { player.visible = true; player.position.set(oof.position.x + 1.9, 0, oof.position.z + 2.2); player.rotation.set(0, 0, 0); } });
pahuis = createPaHuis({ THREE, scene, player, state, box, cyl, lam, canvasTex, signTex, solid, addInteract, dialogue, toast, beep, makePa, animate: (p, v, dt) => animate(p, v, dt), door: PA_DOOR,
  setBounds: (b) => { BOUNDS.cur = b; }, snapCam: () => window.__sme.snapCam(), busy: () => !!mission.active || tripOn() || state.inDialogue || choiceOpen, open: () => !!(freddy && freddy.back()),
  onFirst: () => { if (buurt && buurt.route && buurt.route.name === "Pa's huis") buurt.clearRoute(); if (freddy) freddy.welcome(); } });
{ // his nameplate, a red doormat and two geraniums on the Komijnstraat, so the door can be found
  const K = kit(), x = PA_DOOR.x, z = PA_DOOR.z - 0.55; K.box(1.3, 0.03, 0.7, 0xa01828, x, 0.03, z + 0.5); for (const s of [-1, 1]) { K.cyl(0.2, 0.15, 0.34, 0xb0542a, x + s * 1.0, 0.17, z + 0.35, 10); K.geo(new THREE.SphereGeometry(0.26, 8, 6), 0xd8202a, x + s * 1.0, 0.52, z + 0.35); }
  const m = K.build(); if (m) scene.add(m);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.5), lam({ map: signTex([{ t: 'FREDDY SR.', size: 70 }, { t: 'niet storen · bed draait', size: 34 }], '#2a1a10', '#d8b040', 384, 128) })); sg.position.set(x, 2.75, z + 0.12); scene.add(sg);
}
goederen = createGoederen({ THREE, scene, player, state, econ, klok, kit, lam, signTex, solid, addInteract, toast, beep, addMoney, dialogue, phone: () => phone, save: () => writeSave(),
  naknik: () => state.naknik | 0, hal: () => !!(loods && loods.has('hal')), inHall: () => !!(loods && loods.inside()), front: { x: -3.0, z: RC - 4 }, dock: { x: 11, z: -26.6 },
  openDoor: () => { if (shutterTarget < 1) openShutter(); }, setHaul: (ids) => prod.setHaul(ids),
  haulSpots: (k, hall) => { // where the Naknikim wheel the truck's pallets to (inbound) or fetch them from (outbound)
    const st = (sp) => { const a = prod.standAt(sp); return { x: a.x, z: a.z, fx: sp.x, fz: sp.z }; }, L = loods.ensure(), bays = loods.bays;
    if (hall) { if (k === 'out') return [...prod.UIT_SPOTS.map(st), st(prod.OUT_SPOT)];
      const r = []; for (let i = 1; i < Math.min(L.racks, 7); i++) { const f = bays[i].front; r.push({ x: f.x, z: f.z + 1.75, fx: f.x, fz: f.z }); } return r.length ? r : prod.FEED_SPOTS.map(st); }
    if (k === 'out') return prod.SHED_SPOTS.slice(3).map(st);
    const r = prod.SHED_SPOTS.map(st); if (L.racks > 0) { const f = bays[0].front; r.push({ x: f.x + 1.0, z: f.z, fx: f.x, fz: f.z }); } return r; },
  ready: () => state.step === 'free' && !(state.tut && !state.tut.done), busy: () => !!mission.active || tripOn() || state.inDialogue || choiceOpen || state.inPC,
  setHour: (h) => { state.klok = state.klok || {}; state.klok.h = h; klok.refresh(); }, fmt: (h) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}` });
// the koffiehoek on the old Laadzone (De Hal built): once a market day, a round of coffee for the ploeg
addInteract({ pos: () => (loods && loods.has('hal') && isInside(player.position) ? new THREE.Vector3(-3.15, 0, -9.0) : new THREE.Vector3(0, -99, 0)), r: 1.3,
  enabled: () => !!(loods && loods.has('hal')) && isInside(player.position) && !state.inDialogue,
  label: () => (state.koffie === econ.ensure().day ? 'Koffiehoek · the pot is empty for today' : (state.naknik | 0) ? 'Koffie voor de ploeg · W 12' : 'A coffee for yourself'),
  act: () => { const d = econ.ensure().day; if (state.koffie === d) return toast('KOFFIE', 'One round a day. The Naknikim are already buzzing.', 2.4);
    const n = state.naknik | 0; if (n && state.money < 12) return toast('KOFFIE', 'Not even W 12 for coffee. Sell something first.', 2.6);
    state.koffie = d; beep(260, 0.3, 'sine', 0.04); setTimeout(() => beep(420, 0.18, 'triangle', 0.04), 260);
    if (!n) { toast('KOFFIE', 'Eddy drinks a coffee alone at the little table. Once there is a crew, this round is for them.', 3); writeSave(); return; }
    addMoney(-12); for (const m of crew.ensure()) if (!m.away) m.mood = Math.min(100, m.mood + 4);
    toast('KOFFIE VOOR DE PLOEG', `Eddy pours ${n} mug${n > 1 ? 's' : ''} at the koffiehoek. −W 12, crew mood up.`, 3.2); writeSave(); } });
spoed = createSpoed({ THREE, scene, player, state, econ, klok, kit, lam, signTex, addInteract, toast, beep, choice, dialogue, addMoney, save: () => writeSave(), objective: () => updateObjective(),
  oof, oofSolid, kangoo, goederen, hal: () => !!(loods && loods.has('hal')), inHall: () => !!(loods && loods.inside()),
  fade: (fn) => { const f = $('wijkFade') || Object.assign(document.body.appendChild(document.createElement('div')), { id: 'wijkFade' }); f.style.cssText = 'position:fixed;inset:0;background:#120a04;opacity:1;pointer-events:none;transition:opacity .35s;z-index:40'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { f.style.opacity = '0'; }, 120); } }, 380); },
  route: (x, z, label) => { if (!buurt) return; if (x == null) buurt.clearRoute(); else buurt.setPoint(x, z, label); },
  makeBag: (id) => prod.makeBag(id), makeNaknik: () => makePerson({ ps2: LOOKS.naknik, headKind: 'nak', shirt: 0xec7d2c, front: 'nak', pants: 0xc45e1a, shoes: 0x3a2a1a, belly: 0.8, skin: 0xe8b890, scale: 0.68, rolled: true }),
  makeShooki: () => { const c = npcs.CAST.find((q) => q.id === 'shooki'); return makePS2Person(lookFromPerson(c.look, HEADS), { scale: c.look.scale, scene }); },
  passerBy: (seed) => passerBy(seed), animate: (p, v, dt) => animate(p, v, dt), naknik: () => state.naknik | 0, kangooOn: () => !!state.district1 && !!(npcs && npcs.met('shooki')),
  drive: (o) => oofDrive.start(o), driving: () => oofDrive.active, par: oofDrive.PAR, vanStats: () => garage.stats(), clamp: () => !!garage.ensure().clamp, wijk,
  riding: () => (fiets ? fiets.current : null), dismount: () => { if (fiets && fiets.riding()) fiets.dismount(); }, closePC: () => closePC(), openDoor: () => { if (shutterTarget < 1) openShutter(); },
  ready: () => state.step === 'free' && !(state.tut && !state.tut.done) && !mission.active && !tripOn(), away: () => !!mission.active || tripOn(),
  fmtH: (h) => `${String(Math.floor(h) % 24).padStart(2, '0')}:${String(Math.round((h % 1) * 60) % 60).padStart(2, '0')}`, onDelivered: (who) => { if (stats) stats.add('spoed'); if (brep && who === 'eddy') brep.add('kade', 0.5); } });
{ const sc = npcs.CAST.find((c) => c.id === 'shooki'); if (sc) { const show0 = sc.show; sc.show = () => show0() && !(spoed && spoed.shookiBusy()); } } // out with the Kangoo, or carrying bags in his own figure
leven = createStraatLeven({ THREE, scene, player, solid, low: IS_PHONE, makeCar: (o) => makeCar(THREE, canvasTex, { ...o, rand: crand }), passerBy: (seed) => passerBy(seed), animate: (p, v, dt) => animate(p, v, dt),
  eddy: () => (fiets && fiets.current ? { x: fiets.state.x, z: fiets.state.z, r: 1.6 } : { x: player.position.x, z: player.position.z, r: 0.4 }) });
const KOMIJN = [{ x0: -334, x1: 214, lanes: [-54.5, -51.5], walks: [-59.3, -48.8], rings: CROSS.map((x) => ({ x, z: ROT_Z })), ring: KOMIJN_RING }]; // js/roam.js BZ, and its rotondes
window.__sme = { get top10() { return top10; }, get blokaas() { return blokaas; }, get inricht() { return inricht; }, get regulars() { return regulars; }, get spoed() { return spoed; }, get wijk() { return wijk; }, get goederen() { return goederen; }, get pahuis() { return pahuis; }, get freddy() { return freddy; }, get leven() { return leven; }, get stats() { return stats; }, get stam() { return stam; }, get klok() { return klok; }, get politie() { return politie; }, get roam() { return roam; }, get hub() { return hub; }, get vandaag() { return vandaag; }, get brep() { return brep; }, get winkels() { return winkels; }, get bills() { return bills; }, get buurt() { return buurt; }, get bfolk() { return bfolk; }, get world() { return world; }, get venues() { return venues; }, get johan() { return johan; }, get loods() { return loods; }, get fiets() { return fiets; }, get guide() { return guide; }, score, media, get work() { return work; }, get prod() { return prod; }, get solli() { return solli; }, tips, tutorial, kangoo, woning, HOME_DOORS, snapCam: () => { camPos.copy(player.position).add(new THREE.Vector3(0, 12.5 * zoom, 6 * zoom)); camLook.copy(player.position).setY(0.8); }, startNewGamePlus, charStats, post, startLevel, startDrive, oofDrive, own: ownTerritories, checkDistrict, LEVELS: mission.LEVELS, writeSave, readSave, solids, clearSave, SAVE_KEY, scene, camera, renderer, makeBike, mission, BOUNDS,  clearPlayerSplats, playerSplats, nabil, schmatzel, talkNabil, talkSchmatzel, openJointDoor, JS, giveMaboota, equip, swing, spawnOfficer, officers, gulls, ducks, knock, bump, say, traffic, cyclists, walkers, openShopDoor, PS, oof, talkRussian, russian, openShop, paintHead, HEADS, setZoom: (z) => { zoom = z; }, dad, player, state, junkDefs, loods, talkDad, openPC, closePC, nextLine, sellItem, buyTable, hireNaknik, econ, ws, garage, crew, heists, siegeOver, naknikim, talkNaknik, oof, gulls, get inspector() { return inspector; }, law, razimVisit, get razim() { return razim; }, get razimM() { return razimM; }, get npcs() { return npcs; }, get freddy() { return freddy; }, get activists() { return activists; }, get phone() { return phone; }, folk, folkCtx, balloons, dialogue };
aeroWorld = createAeroWorld({ THREE, scene, renderer, hemi, sun, water, post, busy: () => mission.active });
fiets = createFiets({ talkedAt: () => dlgClosedAt, honk: () => { claxon(); if (oofDrive.active) oofDrive.honked(); }, onBorrow: (v) => { v.obj.userData.moved = true; if (v.solid) v.solid.moved = true; if (v.kind === 'car') { stats.add('borrowed'); politie.witness('theft', v.obj.position.x, v.obj.position.z); } },
  onMove: (v, d, sp) => { stats.add(v.kind === 'car' ? 'driven' : 'biked', d); if (sp > 3.5) { const R = v.kind === 'car' ? 1.5 : 0.8, fx = Math.sin(player.rotation.y), fz = Math.cos(player.rotation.y); for (const w of walkers) { if (!w.visible || w.userData.down > 0 || (w.userData.walk && w.userData.walk.home)) continue; if (Math.hypot(w.position.x - player.position.x, w.position.z - player.position.z) < R) { hitStreetPerson(w, { x: fx, z: fz }); politie.witness('hit', w.position.x, w.position.z); } } } },
  THREE, scene, player, keys, collide, addInteract, toast, beep, bell, canvasTex, park: { x: 2.2, z: -6.2, h: Math.PI / 2 },
  onCrash: (v, sp) => { if (oofDrive.active && v === oofDrive.vehicle()) oofDrive.crash(sp); },
  busy: () => mission.active, frozen: () => state.inDialogue || state.inPC || !!(phone && phone.isOpen) || isPaused(), knocked: () => knock.t > 0 && !tripOn() });
for (const [g, kind] of lendQ) adoptRide(g, kind); lendQ.length = 0;
if (IS_PHONE) { // phones: the shadow pass was three quarters of the home street's draw calls, most of it small street furniture.
  // Anything under a metre across that is not a person, an animal or a vehicle stops casting; houses, trees, cars and people keep their shadows.
  for (const c of scene.children) { if (Object.keys(c.userData).some((k) => k !== 'merged' && k !== 'fade')) continue;
    c.traverse((o) => { if (!o.isMesh || !o.castShadow || o.isSkinnedMesh) return; const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); if (g.boundingSphere.radius * Math.max(o.scale.x, o.scale.y, o.scale.z) < 1.0) o.castShadow = false; }); }
}
await bootStep(90, 'Warming up the grill…');
// the first frame would compile every shader at once, frozen. Warm them in the street's real look (the Aero sky and water
// if that style is on) and with and without the sun's shadows: storm clouds and nightfall switch those off, and each
// switch used to recompile the whole street mid-game.
try { if (aeroWorld) aeroWorld.tick(0); await post.warm(scene, camera); const sh = sun.castShadow; sun.castShadow = !sh; await post.warm(scene, camera); sun.castShadow = sh; } catch (e) { console.warn('shader warm-up skipped', e); }
bootDone();
tick();
