// The arsenal: every weapon, calibre, attachment and armour piece, taken from Neon Vice (weapons.js / gunshop.js).
// Data only. mission.js fires and swings them, gunshop.js sells them (The Russian's catalogue), gunaudio.js plays them.
//
// Weapon fields (Neon Vice WD): spr = base spread (rad), mv = extra spread while moving, bloom = spread added per shot
// (bloomMax caps it), cd = seconds between shots, pel = pellets, ecd = enemy fire interval, loud = noise radius (m),
// kick = camera kick, cal = calibre (one pocket pool per calibre), mag = rounds per magazine, rl = reload seconds,
// ar = active-reload window [start, length] as fractions of rl, ammo = rounds in a loose gun dropped by a Lampas,
// spare = extra rounds that drop with it, burst = automatic (hold to fire), burst3 = three-round burst per pull,
// pierce = bodies a bullet goes through, pen = thin walls a bullet goes through, toss = thrown, melee = melee
// (kill = one-hit kill, knock = knocks down, range, arc = swing half-angle, cd = swing time), spd = move multiplier,
// excl = The Russian's exclusive (only some nights), snd = sound key in gunaudio.js, two = two-handed pose.
// Spice Master ids are kept for saves and level files: 'makarov' is Neon Vice's 9mm pistol, 'shotgun' the sawn-off
// (Neon Vice's double barrel), 'bat' the honkbalknuppel, 'maboota' the Russian police truncheon.
export const WD = {
  maboota: { name: 'MABOOTA', melee: true, knock: true, range: 1.15, cd: 0.38, arc: 1.0, snd: 'swing' },
  fists: { name: 'FISTS', melee: true, knock: true, range: 0.95, cd: 0.3, arc: 1.0, snd: 'swing' },
  bat: { name: 'HONKBALKNUPPEL', melee: true, kill: true, range: 1.3, cd: 0.45, arc: 1.1, len: 0.72, snd: 'swing' },
  knife: { name: 'KNIFE', melee: true, kill: true, range: 1.0, cd: 0.25, arc: 0.8, len: 0.27, snd: 'swing' },
  machete: { name: 'MACHETE', melee: true, kill: true, range: 1.2, cd: 0.36, arc: 1.0, len: 0.57, snd: 'swing' },
  katana: { name: 'KATANA', melee: true, kill: true, range: 1.5, cd: 0.26, arc: 1.35, len: 0.8, snd: 'swing', excl: true },
  tknife: { name: 'THROWING KNIVES', toss: true, ammo: 4, cal: null, mag: 4, cd: 0.3, loud: 0, len: 0.27, snd: 'throw' },
  // the Makarov is a .22 now: cheap and weak (weak = a plain Lampas takes two hits). The CZ Shadow 2 is the better 9mm pistol.
  makarov: { name: 'MAKAROV .22', ammo: 8, spare: 16, cal: '22', mag: 8, rl: 1.4, ar: [0.45, 0.15], cd: 0.24, pel: 1, spr: 0.035, mv: 0.08, bloom: 0.045, ecd: 0.8, loud: 11, kick: 0.06, snd: 'pistol', weak: true },
  cz: { name: 'CZ SHADOW 2', ammo: 17, spare: 17, cal: '9mm', mag: 17, rl: 1.1, ar: [0.45, 0.18], cd: 0.15, pel: 1, spr: 0.016, mv: 0.06, bloom: 0.03, ecd: 0.8, loud: 13, kick: 0.09, snd: 'pistol', len: 0.3 },
  silenced: { name: 'SILENCED CZ SHADOW 2', legacy: 'cz', ammo: 12, spare: 6, cal: '9mm', mag: 17, rl: 1.1, ar: [0.45, 0.18], cd: 0.15, pel: 1, spr: 0.016, mv: 0.06, bloom: 0.03, ecd: 0.85, loud: 2.5, kick: 0.06, snd: 'silenced', len: 0.36 }, // old saves: becomes a CZ + CZ suppressor
  revolver: { name: 'COLT PYTHON .357', ammo: 6, spare: 6, cal: '357', mag: 6, rl: 2.4, ar: [0.5, 0.12], cd: 0.34, pel: 1, spr: 0.012, mv: 0.06, bloom: 0.08, ecd: 0.95, loud: 15, pierce: 3, kick: 0.2, snd: 'revolver' },
  dual: { name: 'DUAL 9MMs', ammo: 26, spare: 10, cal: '9mm', mag: 30, rl: 2.6, ar: [0.5, 0.12], cd: 0.1, pel: 1, spr: 0.05, mv: 0.08, bloom: 0.02, bloomMax: 0.16, ecd: 0.35, burst: 6, loud: 13, kick: 0.08, snd: 'dual' },
  mp5sd: { name: 'MP5SD', ammo: 30, spare: 15, cal: '9mm', mag: 30, rl: 2.0, ar: [0.5, 0.14], cd: 0.075, pel: 1, spr: 0.045, mv: 0.07, bloom: 0.02, bloomMax: 0.16, ecd: 0.14, burst: 4, loud: 2.5, kick: 0.06, snd: 'silenced', len: 0.5, two: true },
  dualuzi: { name: 'DUAL UZIS', excl: true, unlock: 'act2', ammo: 64, spare: 32, cal: '9mm', mag: 64, rl: 2.8, ar: [0.5, 0.12], cd: 0.05, pel: 1, spr: 0.07, mv: 0.08, bloom: 0.025, bloomMax: 0.24, ecd: 0.12, burst: 6, loud: 14, kick: 0.08, snd: 'smg', dual: true },
  smg: { name: 'UZI', ammo: 32, spare: 16, cal: '9mm', mag: 32, rl: 1.8, ar: [0.5, 0.14], cd: 0.07, pel: 1, spr: 0.06, mv: 0.08, bloom: 0.025, bloomMax: 0.22, ecd: 0.12, burst: 4, loud: 13, kick: 0.08, snd: 'smg' },
  pump: { name: 'PUMP SHOTGUN', ammo: 6, spare: 4, cal: '12ga', mag: 6, rl: 3.0, ar: [0.55, 0.12], cd: 0.75, pel: 7, spr: 0.26, mv: 0.04, bloom: 0, ecd: 1.2, loud: 16, kick: 0.4, spd: 0.94, two: true, snd: 'pump', len: 0.68 },
  shotgun: { name: 'SAWN-OFF', ammo: 2, spare: 4, cal: '12ga', mag: 2, rl: 1.9, ar: [0.4, 0.18], cd: 0.22, pel: 10, spr: 0.38, mv: 0.04, bloom: 0, ecd: 1.4, loud: 17, kick: 0.55, spd: 0.95, two: true, snd: 'shotgun' },
  autosg: { name: 'AUTO SHOTGUN', ammo: 8, spare: 8, cal: '12ga', mag: 8, rl: 2.6, ar: [0.5, 0.13], cd: 0.24, pel: 7, spr: 0.3, mv: 0.05, bloom: 0, ecd: 0.9, burst: 3, loud: 17, kick: 0.42, spd: 0.93, two: true, snd: 'autosg', len: 0.72 },
  jackhammer: { name: 'JACKHAMMER', excl: true, unlock: 'act3', ammo: 16, spare: 10, cal: '12ga', mag: 16, rl: 2.9, ar: [0.5, 0.12], cd: 0.2, pel: 8, spr: 0.22, mv: 0.05, bloom: 0, ecd: 0.8, burst: 3, loud: 18, pierce: 2, kick: 0.45, spd: 0.92, two: true, snd: 'autosg', len: 0.78 },
  awp: { name: 'AWP', excl: true, unlock: 'act3', ammo: 5, spare: 10, cal: '338', mag: 5, rl: 3.0, ar: [0.55, 0.12], cd: 1.25, pel: 1, spr: 0.003, mv: 0.16, bloom: 0, ecd: 1.6, loud: 19, pierce: 3, pen: 2, kick: 0.5, spd: 0.9, two: true, snd: 'awp', scope: true, len: 0.95 },
  m16: { name: 'M16', ammo: 30, spare: 15, cal: '556', mag: 30, rl: 2.2, ar: [0.5, 0.13], cd: 0.32, pel: 1, spr: 0.015, mv: 0.09, bloom: 0.02, ecd: 0.9, burst3: true, loud: 15, pierce: 2, pen: 1, kick: 0.14, spd: 0.92, two: true, snd: 'rifle', len: 0.66 },
  goldak: { name: 'GOLDEN AK-47', excl: true, ammo: 40, spare: 20, cal: '762', mag: 40, rl: 2.5, ar: [0.5, 0.12], cd: 0.09, pel: 1, spr: 0.03, mv: 0.08, bloom: 0.02, bloomMax: 0.16, ecd: 0.2, burst: 5, loud: 15, pierce: 2, pen: 1, kick: 0.12, spd: 0.94, two: true, snd: 'ak', len: 0.62 },
  golddeagle: { name: 'GOLDEN DEAGLES', excl: true, ammo: 16, spare: 7, cal: '50ae', mag: 14, rl: 2.8, ar: [0.5, 0.1], cd: 0.16, pel: 1, spr: 0.03, mv: 0.07, bloom: 0.05, bloomMax: 0.2, ecd: 0.5, loud: 16, pierce: 3, pen: 1, kick: 0.24, snd: 'deagle', dual: true },
};
WD.dual.dual = true;
export const BASE_MAG = { smg: WD.smg.mag, dualuzi: WD.dualuzi.mag };

// calibres (Neon Vice CAL): box = rounds per box at The Russian's, price = Wilders per box, cap = pocket capacity before
// bigger stashes, up = capacity per stash upgrade, name = what the HUD shows.
export const CAL = {
  '22': { name: '.22', box: 40, price: 20, cap: 120, up: 40 },
  '9mm': { name: '9MM', box: 30, price: 40, cap: 90, up: 45 },
  '357': { name: '.357', box: 12, price: 60, cap: 36, up: 18 },
  '12ga': { name: 'HAGEL', box: 10, price: 60, cap: 30, up: 15 },
  '556': { name: '5.56', box: 30, price: 90, cap: 90, up: 45 },
  '762': { name: '7.62', box: 30, price: 100, cap: 90, up: 45 },
  '50ae': { name: '.50 AE', box: 14, price: 130, cap: 42, up: 14 },
  '338': { name: '.338 LAPUA', box: 10, price: 180, cap: 25, up: 10 },
};

// attachments (Neon Vice MODS): bought once, always fitted.
export const MODS = {
  supp: { name: 'MAKAROV SUPPRESSOR', price: 380, gun: 'makarov', info: 'Screws onto the Makarov. Its shots go quiet: nobody in the next room hears them.', say: 'Now your Makarov whispers. Like gossip, but louder for the other guy.' },
  czsupp: { name: 'CZ SUPPRESSOR', price: 450, gun: 'cz', info: 'Screws onto the CZ Shadow 2. Its shots go quiet: nobody in the next room hears them.', say: 'Czech precision, now with Czech discretion.' },
  xmag: { name: 'EXTENDED UZI MAG', price: 300, gun: 'smg', also: ['dualuzi'], info: 'Clips into the Uzi (48 rounds instead of 32) and the Dual Uzis (96 instead of 64).', say: 'Forty-eight rounds. For when thirty-two is not making your point.' },
  sling: { name: 'QUICK SLING', price: 230, gun: null, info: 'For every gun you carry. Switching weapons takes a blink instead of a breath.', say: 'Is a strap. But a fast strap. You switch guns before you finish the thought.' },
};

// body armour (Neon Vice ARMOUR): each plate stops one hit; repaired or traded up at The Russian's.
export const ARMOUR = {
  vest: { name: 'KEVLAR VEST', plates: 1, price: 500, repair: 180, soft: true }, // soft armour: stops one hit, repaired at The Russian's
  carrier: { name: 'PLATE CARRIER', plates: 4, price: 900, spd: 0.96, empty: true }, // comes empty: holds up to 4 ceramic plates, bought one by one
};
export const PLATE = { name: 'CERAMIC PLATE', price: 250, spare: 2 }; // each plate stops one hit; carry up to 2 spares, H slots one in on a mission
// grenades (G throws toward your aim, Q picks the type); carried up to 3 of each, missions only
export const NADES = {
  flash: { name: 'FLASHBANG', price: 200, max: 3, r: 7, info: 'Blinds and stuns every Lampas who sees it go off. Walk up and finish them.' },
  smoke: { name: 'SMOKE GRENADE', price: 150, max: 3, r: 3.2, secs: 12, info: 'A cloud nobody sees through: their cones and lasers stop at the smoke.' },
  he: { name: 'HE GRENADE', price: 350, max: 3, r: 2.6, info: 'Explodes. Kills everything close, knocks down the rest, breaks glass. Very loud. Mind your own feet.' },
};
// gear that is not armour and not a weapon
export const GEAR_X = {
  nvg: { name: 'NIGHT-VISION GOGGLES', price: 4000, excl: true, unlock: 'act1', info: 'V switches them on in a mission. Green, grainy, and you see in the dark. Made for the night jobs.' },
};

// what a kill is worth and how hard each weapon throws a body (Neon Vice KILLPTS / FORCE)
export const KILLPTS = { nade: 650, maboota: 450, bat: 450, knife: 450, machete: 450, katana: 500, fists: 500, exec: 800, door: 600, throw: 550, tknife: 550, boom: 700, gun: 300 };
export const FORCE = { makarov: 3, cz: 4.5, mp5sd: 4, dualuzi: 4.5, autosg: 9, jackhammer: 9.5, awp: 9, nade: 10, silenced: 4, revolver: 7, dual: 4.5, smg: 4, pump: 9.5, shotgun: 9.5, m16: 6, goldak: 6, golddeagle: 8, bat: 6.5, knife: 4, machete: 5.5, katana: 6, tknife: 4.5, maboota: 5.5, fists: 5.5, exec: 1, throw: 5, door: 6, boom: 10 };
export const isGunId = (id) => !!(id && WD[id] && !WD[id].melee);
export const isMeleeId = (id) => !!(id && WD[id] && WD[id].melee && id !== 'maboota' && id !== 'fists');
export const isArmourId = (id) => !!(id && ARMOUR[id]);
export const SHOT_GUN = (id) => !!(WD[id] && WD[id].pel > 1); // shotgun gore (head pops, body launch)

// The Russian's catalogue (Neon Vice's Nine of Nine's, sections down the left). Prices in Wilders.
export const SHOP_PRICE = { makarov: 350, cz: 700, revolver: 850, mp5sd: 1800, autosg: 2800, dualuzi: 3500, awp: 9000, jackhammer: 12000, dual: 950, smg: 1050, pump: 1150, shotgun: 1400, m16: 1550, bat: 90, knife: 150, machete: 270, tknife: 330, katana: 2250, golddeagle: 3600, goldak: 4500 };
export const SHOP_SECS = [
  { id: 'hand', name: 'HANDGUNS', kind: 'HANDGUN', w: ['makarov', 'cz', 'revolver', 'dual', 'golddeagle'] },
  { id: 'long', name: 'SMG & RIFLES', kind: 'AUTOMATIC', w: ['smg', 'mp5sd', 'dualuzi', 'm16', 'goldak', 'awp'] },
  { id: 'shot', name: 'SHOTGUNS', kind: 'SHOTGUN', w: ['shotgun', 'pump', 'autosg', 'jackhammer'] },
  { id: 'melee', name: 'MELEE & THROWN', kind: 'MELEE', w: ['knife', 'bat', 'machete', 'tknife', 'katana'] },
  { id: 'nades', name: 'GRENADES' },
  { id: 'mods', name: 'ATTACHMENTS' },
  { id: 'gear', name: 'AMMO & ARMOUR' },
  { id: 'xgear', name: 'SPECIAL GEAR' },
  { id: 'sell', name: 'SELL TO THE RUSSIAN' },
];
export const EXCL = ['goldak', 'golddeagle', 'katana']; // the rotating exclusives; the ones with WD[id].unlock stay on the shelf once unlocked
export const SELL_FRAC = 0.4, DEAL_OFF = 0.2;
export const WDESC = {
  makarov: 'Reliable. Like Lada, but works. Small bullets: aim twice.', cz: 'Czech. Precise. Expensive. Like my ex-wife.', revolver: 'Colt Python. Six chances. Goes through three men.',
  mp5sd: 'Whispers thirty times a second.', dualuzi: 'Two Uzis. No thinking required.', autosg: 'Eight shells, as fast as you pull. Reload, repeat.',
  jackhammer: 'Sixteen shells. Tight. Through people. Even I am afraid of this one.', awp: 'One shot. One Lampas. Sometimes three.',
  dual: 'Two pistols, twice the opinions.', smg: 'Sprays the room like cologne.', pump: 'Seven pellets of diplomacy.', shotgun: 'Two barrels. One opinion.',
  m16: 'Three-round bursts, through walls.', bat: 'Quiet. Very persuasive.', knife: 'Close, quiet, personal.', tknife: 'Four blades. Silent across the room. Go pick them up after.',
  machete: 'For cutting through the paperwork.', katana: 'Folded nine hundred times. By my cousin. On a Tuesday.',
  golddeagle: 'Two solid-gold hand cannons. Through walls, through men.', goldak: 'Solid gold. Fully automatic. Zero subtlety.',
};
// stat bars on the catalogue card (Neon Vice shopStats)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const E0 = { '22': 160, '338': 4800, '9mm': 490, '357': 731, '12ga': 287, '556': 1750, '762': 2030, '50ae': 1965 };
export function gunStats(id) {
  const w = WD[id]; if (!w) return [];
  if (w.melee) return [['DAMAGE', w.kill ? 1 : 0.35], ['SPEED', clamp(0.25 / w.cd, 0, 1)], ['REACH', clamp(w.range / 1.5, 0, 1)], ['SWING ARC', clamp((w.arc || 1) / 1.35, 0, 1)]];
  if (w.toss) return [['DAMAGE', 0.9], ['FIRE RATE', clamp(1 / w.cd / 14, 0, 1)], ['ACCURACY', 0.85], ['PENETRATION', 0.33], ['CAPACITY', w.mag / 48]];
  const e = (E0[w.cal] || 0) * (w.pel || 1) * (w.weak ? 0.5 : 1), rate = w.burst3 ? 9.4 : 1 / w.cd;
  return [['DAMAGE', clamp(Math.sqrt(e / 3000), 0.08, 1)], ['FIRE RATE', clamp(rate / 14, 0.06, 1)], ['ACCURACY', clamp(1 - w.spr / 0.4, 0.08, 1)], ['PENETRATION', clamp((w.pierce || 1) / 3, 0, 1)], ['CAPACITY', clamp(w.mag / 48, 0.04, 1)]];
}
