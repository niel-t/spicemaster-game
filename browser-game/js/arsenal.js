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
  makarov: { name: 'MAKAROV', ammo: 8, spare: 8, cal: '9mm', mag: 8, rl: 1.3, ar: [0.45, 0.16], cd: 0.2, pel: 1, spr: 0.025, mv: 0.07, bloom: 0.04, ecd: 0.8, loud: 13, kick: 0.1, snd: 'pistol' },
  silenced: { name: 'SILENCED 9MM', ammo: 12, spare: 6, cal: '9mm', mag: 15, rl: 1.5, ar: [0.45, 0.15], cd: 0.24, pel: 1, spr: 0.03, mv: 0.07, bloom: 0.04, ecd: 0.85, loud: 2.5, kick: 0.06, snd: 'silenced', len: 0.36 },
  revolver: { name: '.357 MAGNUM', ammo: 6, spare: 6, cal: '357', mag: 6, rl: 2.4, ar: [0.5, 0.12], cd: 0.34, pel: 1, spr: 0.012, mv: 0.06, bloom: 0.08, ecd: 0.95, loud: 15, pierce: 3, kick: 0.2, snd: 'revolver' },
  dual: { name: 'DUAL 9MMs', ammo: 26, spare: 10, cal: '9mm', mag: 30, rl: 2.6, ar: [0.5, 0.12], cd: 0.1, pel: 1, spr: 0.05, mv: 0.08, bloom: 0.02, bloomMax: 0.16, ecd: 0.35, burst: 6, loud: 13, kick: 0.08, snd: 'dual' },
  smg: { name: 'UZI', ammo: 32, spare: 16, cal: '9mm', mag: 32, rl: 1.8, ar: [0.5, 0.14], cd: 0.07, pel: 1, spr: 0.06, mv: 0.08, bloom: 0.025, bloomMax: 0.22, ecd: 0.12, burst: 4, loud: 13, kick: 0.08, snd: 'smg' },
  pump: { name: 'PUMP SHOTGUN', ammo: 6, spare: 4, cal: '12ga', mag: 6, rl: 3.0, ar: [0.55, 0.12], cd: 0.75, pel: 7, spr: 0.26, mv: 0.04, bloom: 0, ecd: 1.2, loud: 16, kick: 0.4, spd: 0.94, two: true, snd: 'pump', len: 0.68 },
  shotgun: { name: 'SAWN-OFF', ammo: 2, spare: 4, cal: '12ga', mag: 2, rl: 1.9, ar: [0.4, 0.18], cd: 0.22, pel: 10, spr: 0.38, mv: 0.04, bloom: 0, ecd: 1.4, loud: 17, kick: 0.55, spd: 0.95, two: true, snd: 'shotgun' },
  m16: { name: 'M16', ammo: 30, spare: 15, cal: '556', mag: 30, rl: 2.2, ar: [0.5, 0.13], cd: 0.32, pel: 1, spr: 0.015, mv: 0.09, bloom: 0.02, ecd: 0.9, burst3: true, loud: 15, pierce: 2, pen: 1, kick: 0.14, spd: 0.92, two: true, snd: 'rifle', len: 0.66 },
  goldak: { name: 'GOLDEN AK-47', excl: true, ammo: 40, spare: 20, cal: '762', mag: 40, rl: 2.5, ar: [0.5, 0.12], cd: 0.09, pel: 1, spr: 0.03, mv: 0.08, bloom: 0.02, bloomMax: 0.16, ecd: 0.2, burst: 5, loud: 15, pierce: 2, pen: 1, kick: 0.12, spd: 0.94, two: true, snd: 'ak', len: 0.62 },
  golddeagle: { name: 'GOLDEN DEAGLES', excl: true, ammo: 16, spare: 7, cal: '50ae', mag: 14, rl: 2.8, ar: [0.5, 0.1], cd: 0.16, pel: 1, spr: 0.03, mv: 0.07, bloom: 0.05, bloomMax: 0.2, ecd: 0.5, loud: 16, pierce: 3, pen: 1, kick: 0.24, snd: 'deagle', dual: true },
};
WD.dual.dual = true;
export const BASE_MAG = { smg: WD.smg.mag };

// calibres (Neon Vice CAL): box = rounds per box at The Russian's, price = Wilders per box, cap = pocket capacity before
// bigger stashes, up = capacity per stash upgrade, name = what the HUD shows.
export const CAL = {
  '9mm': { name: '9MM', box: 30, price: 40, cap: 90, up: 45 },
  '357': { name: '.357', box: 12, price: 60, cap: 36, up: 18 },
  '12ga': { name: 'HAGEL', box: 10, price: 60, cap: 30, up: 15 },
  '556': { name: '5.56', box: 30, price: 90, cap: 90, up: 45 },
  '762': { name: '7.62', box: 30, price: 100, cap: 90, up: 45 },
  '50ae': { name: '.50 AE', box: 14, price: 130, cap: 42, up: 14 },
};

// attachments (Neon Vice MODS): bought once, always fitted.
export const MODS = {
  supp: { name: 'MAKAROV SUPPRESSOR', price: 380, gun: 'makarov', info: 'Screws onto the Makarov. Its shots go quiet: nobody in the next room hears them.', say: 'Now your Makarov whispers. Like gossip, but louder for the other guy.' },
  xmag: { name: 'EXTENDED UZI MAG', price: 300, gun: 'smg', info: 'Clips into the Uzi. 48 rounds a magazine instead of 32.', say: 'Forty-eight rounds. For when thirty-two is not making your point.' },
  sling: { name: 'QUICK SLING', price: 230, gun: null, info: 'For every gun you carry. Switching weapons takes a blink instead of a breath.', say: 'Is a strap. But a fast strap. You switch guns before you finish the thought.' },
};

// body armour (Neon Vice ARMOUR): each plate stops one hit; repaired or traded up at The Russian's.
export const ARMOUR = {
  vest: { name: 'KEVLAR VEST', plates: 1, price: 500, repair: 180 },
  carrier: { name: 'PLATE CARRIER', plates: 2, price: 1200, repair: 320, spd: 0.96 },
};

// what a kill is worth and how hard each weapon throws a body (Neon Vice KILLPTS / FORCE)
export const KILLPTS = { maboota: 450, bat: 450, knife: 450, machete: 450, katana: 500, fists: 500, exec: 800, door: 600, throw: 550, tknife: 550, boom: 700, gun: 300 };
export const FORCE = { makarov: 4.5, silenced: 4, revolver: 7, dual: 4.5, smg: 4, pump: 9.5, shotgun: 9.5, m16: 6, goldak: 6, golddeagle: 8, bat: 6.5, knife: 4, machete: 5.5, katana: 6, tknife: 4.5, maboota: 5.5, fists: 5.5, exec: 1, throw: 5, door: 6, boom: 10 };
export const isGunId = (id) => !!(id && WD[id] && !WD[id].melee);
export const isMeleeId = (id) => !!(id && WD[id] && WD[id].melee && id !== 'maboota' && id !== 'fists');
export const isArmourId = (id) => !!(id && ARMOUR[id]);
export const SHOT_GUN = (id) => !!(WD[id] && WD[id].pel > 1); // shotgun gore (head pops, body launch)

// The Russian's catalogue (Neon Vice's Nine of Nine's, sections down the left). Prices in Wilders.
export const SHOP_PRICE = { makarov: 350, silenced: 650, revolver: 850, dual: 950, smg: 1050, pump: 1150, shotgun: 1400, m16: 1550, bat: 90, knife: 150, machete: 270, tknife: 330, katana: 2250, golddeagle: 3600, goldak: 4500 };
export const SHOP_SECS = [
  { id: 'hand', name: 'HANDGUNS', kind: 'HANDGUN', w: ['makarov', 'silenced', 'revolver', 'dual', 'golddeagle'] },
  { id: 'long', name: 'SMG & RIFLES', kind: 'AUTOMATIC', w: ['smg', 'm16', 'goldak'] },
  { id: 'shot', name: 'SHOTGUNS', kind: 'SHOTGUN', w: ['shotgun', 'pump'] },
  { id: 'melee', name: 'MELEE & THROWN', kind: 'MELEE', w: ['knife', 'bat', 'machete', 'tknife', 'katana'] },
  { id: 'mods', name: 'ATTACHMENTS' },
  { id: 'gear', name: 'AMMO & ARMOUR' },
  { id: 'sell', name: 'SELL TO THE RUSSIAN' },
];
export const EXCL = ['goldak', 'golddeagle', 'katana'];
export const SELL_FRAC = 0.4, DEAL_OFF = 0.2;
export const WDESC = {
  makarov: 'Reliable. Like Lada, but works.', silenced: 'For conversations nobody hears.', revolver: 'Six chances. Goes through three men.',
  dual: 'Two pistols, twice the opinions.', smg: 'Sprays the room like cologne.', pump: 'Seven pellets of diplomacy.', shotgun: 'Two barrels. One opinion.',
  m16: 'Three-round bursts, through walls.', bat: 'Quiet. Very persuasive.', knife: 'Close, quiet, personal.', tknife: 'Four blades. Silent across the room. Go pick them up after.',
  machete: 'For cutting through the paperwork.', katana: 'Folded nine hundred times. By my cousin. On a Tuesday.',
  golddeagle: 'Two solid-gold hand cannons. Through walls, through men.', goldak: 'Solid gold. Fully automatic. Zero subtlety.',
};
// stat bars on the catalogue card (Neon Vice shopStats)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const E0 = { '9mm': 490, '357': 731, '12ga': 287, '556': 1750, '762': 2030, '50ae': 1965 };
export function gunStats(id) {
  const w = WD[id]; if (!w) return [];
  if (w.melee) return [['DAMAGE', w.kill ? 1 : 0.35], ['SPEED', clamp(0.25 / w.cd, 0, 1)], ['REACH', clamp(w.range / 1.5, 0, 1)], ['SWING ARC', clamp((w.arc || 1) / 1.35, 0, 1)]];
  if (w.toss) return [['DAMAGE', 0.9], ['FIRE RATE', clamp(1 / w.cd / 14, 0, 1)], ['ACCURACY', 0.85], ['PENETRATION', 0.33], ['CAPACITY', w.mag / 48]];
  const e = (E0[w.cal] || 0) * (w.pel || 1) * (id === 'smg' ? 1.22 : 1), rate = w.burst3 ? 9.4 : 1 / w.cd;
  return [['DAMAGE', clamp(Math.sqrt(e / 3000), 0.08, 1)], ['FIRE RATE', clamp(rate / 14, 0.06, 1)], ['ACCURACY', clamp(1 - w.spr / 0.4, 0.08, 1)], ['PENETRATION', clamp((w.pierce || 1) / 3, 0, 1)], ['CAPACITY', clamp(w.mag / 48, 0.04, 1)]];
}
