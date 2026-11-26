// De winkels (2026-11-26): Eddy can walk into the shops on the Kipkruidenkade (across the canal), and every shopkeeper of
// the block (js/buurtfolk.js, Portier Willem included) has a small klusje for him. Do it and they become a vaste klant:
// on their weekday they take their usual order out of Eddy's stock and pay a little over the odds. Miss it twice in a
// row and they buy elsewhere until Eddy does the klusje again.
// Interiors: narrow Amsterdam shops built far from the street (like the woning rooms), reached with a fade: black and
// white tiles or worn planks, a Delft-blue tile band behind the counter, a steep stair in the back, a window on the
// binnentuin, the shop bell on the door, and the winkel's own stuff. The shopkeeper walks in with you, behind the counter.
// state.winkels = { jobs: { [biz]: { done, miss, served } }, visits }
import { INGREDIENTS, BLENDS } from './economy.js';
import { mergeStatic } from './richtex.js';

const WD_NAME = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
// a klusje per shopkeeper: what they want (a blend or a raw spice), the first time and then every week on wd (0 = Maandag)
export const JOBS = {
  hotel: { blend: 'slager', kg: 2, pay: 1.25, wd: 5, ask: 'The hotel kitchen wants to serve a "real Kaasland breakfast". The chef says that means Slagerskruiden on the eggs. Two kilo, discreetly, by the staff door.', thanks: 'The tourists photographed their eggs. Twelve of them. The chef wants it every Zaterdag.' },
  bitterbal: { blend: 'slager', kg: 2, pay: 1.2, wd: 2, ask: 'My ragout for the kroketten needs a kick, jongen. Freddy used to bring me Slagerskruiden. Two kilo?', thanks: 'Now THAT is a kroket. Bring me some every Woensdag, I fry more on Thursdays.' },
  kapsalon: { ing: 'kurkuma', kg: 1, pay: 1.6, wd: 1, ask: 'I do a golden hair mask. Kurkuma, yoghurt, a secret. One kilo of real kurkuma, not that yellow flour the Lampas sell.', thanks: 'Gorgeous. Half the street will have golden hair by Friday. Every Dinsdag, please.' },
  avond: { blend: 'kip', kg: 2, pay: 1.2, wd: 5, ask: 'I want to sell my own "shoarma chips". Plain crisps, your Kip Shoarma on top, double price. Two kilo to try?', thanks: 'Sold out in one night. Students. Every Zaterdag, my friend, before the clubs open.' },
  fiets: { ing: 'knoflook', kg: 2, pay: 1.5, wd: 0, ask: 'My wife makes a garlic soup that cures everything. Colds, flat tyres, divorce. Two kilo of knoflook?', thanks: 'The whole workshop smells of soup. My customers are healthy and they leave quickly. Every Maandag!' },
  bakker: { ing: 'kaneel', kg: 2, pay: 1.5, wd: 4, ask: 'My speculaas needs proper kaneel, Eddy. Not the dusty Lampas stuff. Two kilo and I\'ll show you what an oven can do.', thanks: 'Smell that. That\'s 1962 in a biscuit. Every Vrijdag, before the weekend rush.' },
  bloem: { ing: 'paprika', kg: 2, pay: 1.5, wd: 3, ask: 'Paprika powder around the buckets keeps the aphids off my tulips. Old trick from my oma in Aalsmeer. Two kilo?', thanks: 'Not one aphid! And the tulips look redder. Don\'t tell anybody. Every Donderdag, schat.' },
  kaas: { ing: 'komijn', kg: 3, pay: 1.5, wd: 1, ask: 'Leidse kaas needs komijn, three kilo for one wheel. My supplier retired to Spain. Your father\'s komijn was the best. Yours?', thanks: 'Komijnekaas like in the old days. I\'ll put your name on the wheel. Small. Every Dinsdag.' },
  bel: { blend: 'kebab', kg: 2, pay: 1.2, wd: 5, ask: 'My brother opens a grill in Kaasland-Noord. He wants Kebab Kruiden from a real supplier, not from a bag. Two kilo?', thanks: 'He says it\'s better than Turkey. Don\'t tell our mother. Every Zaterdag, bro.' },
  was: { ing: 'kardemom', kg: 1, pay: 1.4, wd: 0, ask: 'A pinch of kardemom in the dryer and the shirts come out smelling like a hotel. One kilo. Don\'t look at me like that.', thanks: 'The customers think I bought a new fabric softener. I let them. Every Maandag, jongeman.' },
  habibi: { blend: 'kip', kg: 5, pay: 1.1, wd: 4, ask: 'Habibi, I buy where it\'s cheapest. Today I try you. Five kilo Kip Shoarma, and if the kapsalon sings, you\'re my supplier.', thanks: 'It sings! Five kilo every Vrijdag, habibi. Friday night is kapsalon night.' },
  reis: { blend: 'lams', kg: 2, pay: 1.2, wd: 3, ask: 'Welcome packs for Costa del Kaas: a towel, a sun hat and a bag of real Kaasland spice. Two kilo of Lams Shoarma?', thanks: 'The tourists love it. Some even came back. Every Donderdag, for the weekend departures.' },
  makelaar: { ing: 'kaneel', kg: 1, pay: 1.8, wd: 4, ask: 'Viewings sell on smell. Fresh kaneel in the oven and a W 495.000 flat feels like home. One kilo, the good stuff.', thanks: 'Sold above asking. Forty-one bids. The buyer cried. Every Vrijdag, before the Saturday viewings.' },
};

// which shops have a way in (the Kipkruidenkade) and how they look inside
const LOOKS = {
  bloem: { floor: 'tegel', wall: 0xeaf2e4, counter: 0x2f8a3a },
  kaas: { floor: 'plank', wall: 0xf6eccc, counter: 0x6a3e1a },
  bel: { floor: 'grijs', wall: 0xeeeaf6, counter: 0x2a1a5a },
  was: { floor: 'tegel', wall: 0xe4f0fa, counter: 0x2a8ad8 },
  habibi: { floor: 'rood', wall: 0xf4ead8, counter: 0x0c5a40 },
  reis: { floor: 'plank', wall: 0xfff1de, counter: 0xff8a1c },
  makelaar: { floor: 'grijs', wall: 0xf4f4f2, counter: 0x16161a },
};
const IDS = Object.keys(LOOKS);
const RZ = -112, RX0 = -72, RDX = 24, W = 9, D = 6.6, H = 3.0; // the rooms, out of sight behind the street

// deps: THREE, scene, player, state, econ, world(), bfolk(), BIZ, box, cyl, lam, canvasTex, signTex, solid, addInteract,
//       setBounds(b), snapCam(), dialogue(lines, done), choice(who, line, opts, cb), toast, beep, addMoney, save(), busy(),
//       doorAt(biz) -> { x, z } on the street, onJob(biz) (js/buurtrep.js)
export function createWinkels(deps) {
  const { THREE, scene, player, state, econ, box, cyl, lam } = deps;
  const S = () => { const s = state.winkels && typeof state.winkels === 'object' ? state.winkels : (state.winkels = {}); s.jobs = s.jobs && typeof s.jobs === 'object' ? s.jobs : {}; s.visits = s.visits | 0; return s; };
  const J = (biz) => S().jobs[biz] || null;
  const byId = Object.fromEntries(deps.BIZ.map((b) => [b.id, b]));
  const W0 = () => deps.world && deps.world();
  const wdNow = () => { const w = W0(); return w ? w.cal().wd : 0; };
  const M = {}; const mt = (c) => M[c] || (M[c] = lam({ color: c }));
  const fadeEl = document.createElement('div');
  fadeEl.style.cssText = 'position:fixed;inset:0;background:#120a04;opacity:0;pointer-events:none;transition:opacity .35s;z-index:40';
  document.body.appendChild(fadeEl);
  const fadeTo = (fn) => { fadeEl.style.opacity = '1'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { fadeEl.style.opacity = '0'; }, 60); } }, 380); };

  // ---------------------------------------------------------------- stock: blends and raw spice out of the warehouse
  function have(job) {
    const e = econ.ensure();
    if (job.blend) return (e.blends[job.blend] && e.blends[job.blend].kg) || 0;
    return Object.entries(e.stock).filter(([k]) => k.startsWith(job.ing + ':')).reduce((a, [, v]) => a + v, 0);
  }
  function take(job) { // returns kg taken (all or nothing)
    const e = econ.ensure(); if (have(job) + 1e-6 < job.kg) return 0;
    if (job.blend) { const b = e.blends[job.blend]; b.kg = +(b.kg - job.kg).toFixed(2); if (b.kg <= 0.001) delete e.blends[job.blend]; return job.kg; }
    let need = job.kg; // cheapest grade first: Lampas, then Standaard, then Bio
    for (const g of ['lampas', 'std', 'bio']) { const k = `${job.ing}:${g}`, v = e.stock[k] || 0, t = Math.min(v, need); if (t > 0) { e.stock[k] = +(v - t).toFixed(2); if (e.stock[k] <= 0.001) delete e.stock[k]; need -= t; } if (need <= 1e-6) break; }
    return job.kg;
  }
  const what = (job) => job.blend ? BLENDS.find((b) => b.id === job.blend).name : INGREDIENTS.find((g) => g.id === job.ing).name;
  const payOf = (job) => Math.round((job.blend ? BLENDS.find((b) => b.id === job.blend).value : INGREDIENTS.find((g) => g.id === job.ing).base) * job.kg * job.pay / 5) * 5;

  // ---------------------------------------------------------------- talking business (inside, or at the door for the north side)
  function serve(f) {
    const job = JOBS[f.biz]; if (!job) return false;
    const j = J(f.biz), name = f.name, nm = `${job.kg} kg ${what(job)}`;
    if (!state.table) return false; // no business yet: just small talk
    const chat = () => deps.chat(f);
    if (j && j.done && j.miss < 2) {
      const line = `Every <b>${WD_NAME[job.wd]}</b> I take <b>${nm}</b> out of your stock, ${fmt(payOf(job))}. ${have(job) >= job.kg ? 'You have it on the shelf.' : `<span style="color:#c33">You're short right now (${Math.floor(have(job) * 10) / 10} kg).</span>`}`;
      deps.choice(name, `Vaste klant · ${line}`, ['Even kletsen', 'Tot ziens'], (i) => { if (i === 0) chat(); });
      return true;
    }
    const lapsed = j && j.done && j.miss >= 2;
    deps.choice(name, lapsed ? `You missed my order twice, so I went elsewhere. But I\'d rather buy from you. ${job.ask}` : job.ask, [have(job) >= job.kg ? `Give ${nm} (+${fmt(payOf(job))})` : `I'll bring ${nm}`, 'Even kletsen', 'Tot ziens'], (i) => {
      if (i === 1) return chat(); if (i !== 0) return;
      if (have(job) < job.kg) { deps.dialogue([[name, `${nm}. ${job.blend ? 'Mix it at the warehouse' : 'Buy it on the Kruidenbeurs'} and come back. I\'m here ${openWords(f.biz)}.`]]); return; }
      take(job); const pay = payOf(job); deps.addMoney(pay); deps.beep(660, 0.08, 'triangle', 0.05);
      S().jobs[f.biz] = { done: econ.ensure().day, miss: 0, served: ((j && j.served) | 0) + 1 };
      if (deps.onJob) deps.onJob(f.biz, 'job');
      deps.dialogue([[name, job.thanks]], () => deps.toast('VASTE KLANT', `${name} buys ${nm} from you every ${WD_NAME[job.wd]}: ${fmt(pay)} a time. Keep it on the shelf.`, 4.5));
      deps.save();
    });
    return true;
  }
  const openWords = (biz) => { const o = (byId[biz] && byId[biz].open) || [0, 1, 2, 3, 4, 5, 6]; return o.length === 7 ? 'every day' : `${WD_NAME[o[0]]} to ${WD_NAME[o[o.length - 1]]}`; };

  // a market day began: the vaste klanten whose day it is collect their order
  function onDay() {
    const w = W0(); if (!w) return; const wd = w.cal().wd, rows = [];
    for (const [biz, j] of Object.entries(S().jobs)) {
      const job = JOBS[biz], b = byId[biz]; if (!job || !j || !j.done || j.miss >= 2 || job.wd !== wd) continue;
      const who = (deps.bfolk() && deps.bfolk().folk.find((f) => f.biz === biz)) || { name: b ? b.name : biz }, nm = `${job.kg} kg ${what(job)}`;
      if (take(job)) { const pay = payOf(job); deps.addMoney(pay); j.miss = 0; j.served = (j.served | 0) + 1; rows.push({ name: `${who.name} (${b ? b.short || b.name : ''}, vaste klant)`, want: nm, kg: job.kg, note: 'picked it up', pay }); if (deps.onJob) deps.onJob(biz, 'order'); }
      else { j.miss = (j.miss | 0) + 1; rows.push({ name: `${who.name} (vaste klant)`, want: nm, note: j.miss >= 2 ? 'MISSED twice: buys elsewhere now (ask again)' : 'MISSED: not in stock', pay: 0 }); if (deps.onJob) deps.onJob(biz, 'miss'); }
    }
    if (!rows.length) return;
    const rep = econ.ensure().report; if (rep && Array.isArray(rep.rows)) { rep.rows.push(...rows); rep.paid = (rep.paid || 0) + rows.reduce((a, r) => a + r.pay, 0); }
    const got = rows.filter((r) => r.pay), miss = rows.filter((r) => !r.pay);
    deps.toast('VASTE KLANTEN', `${got.length ? got.map((r) => r.name.split(' (')[0]).join(', ') + ` paid ${fmt(got.reduce((a, r) => a + r.pay, 0))}. ` : ''}${miss.length ? miss.map((r) => r.name.split(' (')[0]).join(', ') + ' came for nothing.' : ''}`, 4.5);
    deps.save();
  }

  // ---------------------------------------------------------------- the rooms
  const tileTex = (a, b) => { const t = deps.canvasTex(64, 64, (g) => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { g.fillStyle = (x + y) % 2 ? a : b; g.fillRect(x * 32, y * 32, 32, 32); } g.strokeStyle = 'rgba(0,0,0,.18)'; g.strokeRect(0, 0, 64, 64); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const plankTex = () => { const t = deps.canvasTex(128, 128, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = `hsl(28,${38 + (i % 3) * 6}%,${30 + ((i * 37) % 12)}%)`; g.fillRect(0, i * 16, 128, 15); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(((i * 53) % 128), i * 16, 2, 15); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const delftTex = () => { const t = deps.canvasTex(128, 64, (g) => { g.fillStyle = '#f4f6fa'; g.fillRect(0, 0, 128, 64); for (let i = 0; i < 4; i++) for (let r = 0; r < 2; r++) { const x = i * 32, y = r * 32; g.strokeStyle = '#c8d0e0'; g.strokeRect(x + 0.5, y + 0.5, 31, 31); g.strokeStyle = '#2a4aa0'; g.lineWidth = 2; g.beginPath(); if ((i + r) % 2) { g.arc(x + 16, y + 16, 7, 0, 7); g.moveTo(x + 16, y + 9); g.lineTo(x + 16, y + 3); } else { g.moveTo(x + 6, y + 24); g.quadraticCurveTo(x + 16, y + 6, x + 26, y + 24); g.moveTo(x + 12, y + 24); g.lineTo(x + 20, y + 24); } g.stroke(); for (const [cx, cy] of [[x + 3, y + 3], [x + 29, y + 3], [x + 3, y + 29], [x + 29, y + 29]]) { g.fillStyle = '#2a4aa0'; g.fillRect(cx - 1, cy - 1, 2, 2); } g.lineWidth = 1; } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const FLOOR = { tegel: () => tileTex('#f2efe6', '#1a1a1e'), plank: plankTex, grijs: () => tileTex('#b8b6b0', '#a8a6a0'), rood: () => tileTex('#a8261e', '#e8dccb') };
  const rooms = {};
  function build(biz) {
    if (rooms[biz]) return rooms[biz];
    const i = IDS.indexOf(biz), L = LOOKS[biz], ox = RX0 + i * RDX, oz = RZ, b = byId[biz];
    const g = new THREE.Group(); g.position.set(ox, 0, oz); g.visible = false; scene.add(g);
    const B = (w, h, d, c, x, y, z, sh = true) => box(w, h, d, typeof c === 'number' ? mt(c) : c, x, y, z, g, sh);
    const C = (rt, rb, h, c, x, y, z, seg = 12) => cyl(rt, rb, h, typeof c === 'number' ? mt(c) : c, x, y, z, g, seg);
    { const ground = new THREE.Mesh(new THREE.PlaneGeometry(W + 30, D + 30), mt(0x1a120a)); ground.rotation.x = -Math.PI / 2; ground.position.y = 0.004; g.add(ground); }
    const ft = FLOOR[L.floor](); ft.repeat.set(W / 0.9, D / 0.9); const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), lam({ map: ft })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; fl.receiveShadow = true; g.add(fl);
    B(W + 0.3, H, 0.15, L.wall, 0, H / 2, -D / 2 - 0.07); B(0.15, H, D, L.wall, -W / 2 - 0.07, H / 2, 0); B(0.15, H, D, L.wall, W / 2 + 0.07, H / 2, 0);
    B(W + 0.3, 0.14, 0.2, 0x3a2412, 0, 0.07, -D / 2 + 0.02, false); // plint
    // the low cutaway front with the door in the middle, a doormat and the brass bell above the door
    const gap0 = -0.6, gap1 = 0.6;
    B(gap0 + W / 2, 0.5, 0.15, L.wall, (-W / 2 + gap0) / 2, 0.25, D / 2 + 0.07); B(W / 2 - gap1, 0.5, 0.15, L.wall, (gap1 + W / 2) / 2, 0.25, D / 2 + 0.07);
    B(1.1, 0.03, 0.55, 0x6a4a2a, 0, 0.02, D / 2 - 0.3, false);
    // the window on the binnentuin: cream frame, small panes, green outside
    for (const wx of [-2.4, 2.4]) { B(1.6, 1.6, 0.06, 0xf4ecd8, wx, 1.75, -D / 2 + 0.03, false); B(1.4, 1.4, 0.07, lam({ color: 0x6a9a5a, emissive: 0x2a4a22 }), wx, 1.75, -D / 2 + 0.05, false); B(0.05, 1.4, 0.09, 0xf4ecd8, wx, 1.75, -D / 2 + 0.07, false); B(1.4, 0.05, 0.09, 0xf4ecd8, wx, 1.75, -D / 2 + 0.07, false); }
    // the counter along the left, Delft tiles behind it, a till and the shop bell
    const cx = -W / 2 + 1.9, cz = -0.6;
    B(2.8, 1.0, 0.7, L.counter, cx, 0.5, cz); B(2.9, 0.06, 0.8, 0x2a1a0e, cx, 1.03, cz, false);
    { const dt = delftTex(); dt.repeat.set(3, 1); const band = new THREE.Mesh(new THREE.PlaneGeometry(D - 0.4, 0.8), lam({ map: dt })); band.position.set(-W / 2 + 0.01, 1.4, -0.2); band.rotation.y = Math.PI / 2; g.add(band); }
    B(0.36, 0.22, 0.3, 0x2a2a2e, cx + 0.8, 1.17, cz, false); B(0.3, 0.06, 0.2, 0x7fd07f, cx + 0.8, 1.31, cz - 0.05, false); // kassa
    C(0.07, 0.09, 0.08, lam({ color: 0xd8b040, emissive: 0x3a2a00 }), cx - 0.9, 1.1, cz + 0.1, 10); // the bell you ring
    // the steep Amsterdam stair in the back right corner
    for (let s = 0; s < 9; s++) B(0.9, 0.06, 0.3, 0x6a4022, W / 2 - 0.55, 0.2 + s * 0.31, -D / 2 + 0.35 + s * 0.22, false);
    B(0.05, 3.0, 0.05, 0x3a2412, W / 2 - 1.02, 1.5, -D / 2 + 1.3, false);
    // the shop sign on the back wall, in the shop's colours
    if (b) { const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), lam({ map: deps.signTex([{ t: b.sign || b.name.toUpperCase(), size: 44 }], b.ad.bg, b.ad.fg, 512, 108) })); sg.position.set(0, 2.6, -D / 2 + 0.02); g.add(sg); }
    PROPS[biz] && PROPS[biz]({ B, C, g, L });
    const light = new THREE.PointLight(0xffe0b0, 0, W * 1.5, 1.3); light.position.set(0, H - 0.2, 0); g.add(light);
    mergeStatic(g, (o) => o === fl);
    const sol = [solid(ox - W / 2 - 0.3, ox + W / 2 + 0.3, oz - D / 2 - 0.3, oz - D / 2 + 0.05), solid(ox - W / 2 - 0.3, ox - W / 2 + 0.05, oz - D / 2, oz + D / 2), solid(ox + W / 2 - 0.05, ox + W / 2 + 0.3, oz - D / 2, oz + D / 2),
      solid(ox - W / 2, ox + gap0, oz + D / 2 - 0.05, oz + D / 2 + 0.3), solid(ox + gap1, ox + W / 2, oz + D / 2 - 0.05, oz + D / 2 + 0.3),
      solid(ox + cx - 1.45, ox + cx + 1.45, oz + cz - 0.4, oz + cz + 0.4), solid(ox + W / 2 - 1.05, ox + W / 2, oz - D / 2, oz - D / 2 + 2.3)];
    for (const s of (PROPS_SOLID[biz] || [])) sol.push(solid(ox + s[0], ox + s[1], oz + s[2], oz + s[3]));
    const r = { g, light, ox, oz, door: { x: ox, z: oz + D / 2 - 0.6 }, keeper: { x: ox + cx, z: oz + cz - 0.75 } };
    deps.addInteract({ pos: () => new THREE.Vector3(r.door.x, 0, r.door.z + 0.35), r: 1.2, enabled: () => inside === biz && !deps.busy(), label: () => `Naar buiten · ${b ? b.short || b.name : ''}`, act: () => leave() });
    return (rooms[biz] = r);
  }
  const solid = deps.solid;
  // each shop's own things: [B(w,h,d,col,x,y,z), C(rt,rb,h,col,x,y,z)] in room coordinates (x -4.5..4.5, z -3.3..3.3; the counter is at x -2.6)
  const TUL = [0xe8203a, 0xf2c14e, 0xff8fb8, 0xf08a1c, 0x9a5ad0, 0xffffff];
  const PROPS = {
    bloem({ B, C }) { for (let k = 0; k < 10; k++) { const x = -1.0 + (k % 5) * 0.75, z = k < 5 ? 1.9 : -1.6; C(0.2, 0.17, 0.42, 0x9aa4a8, x, 0.21, z); for (let t = 0; t < 7; t++) { const a = t * 0.9, rr = t ? 0.1 : 0; C(0.008, 0.008, 0.5, 0x3a8a3a, x + Math.cos(a) * rr, 0.66, z + Math.sin(a) * rr, 4); C(0.045, 0.03, 0.09, TUL[(k + t) % 6], x + Math.cos(a) * rr, 0.94, z + Math.sin(a) * rr, 6); } } B(0.9, 0.9, 0.5, 0x6a4a2a, 3.2, 0.45, 0.6); B(0.8, 0.02, 0.4, 0xf4f0e6, 3.2, 0.91, 0.6, false); },
    kaas({ B, C }) { for (const [x, z, rot] of [[-0.6, -3.0], [1.4, -3.0]]) { B(1.8, 2.2, 0.4, 0x6a3e1a, x, 1.1, z); for (let s = 0; s < 4; s++) for (let k = 0; k < 4; k++) { const c = C(0.2, 0.2, 0.12, [0xf6c12a, 0xe8a020, 0xc8102e, 0xf2d060][(s + k) % 4], x - 0.6 + k * 0.4, 0.38 + s * 0.5, z + 0.05, 14); c.rotation.x = Math.PI / 2; } }
      for (let k = 0; k < 5; k++) C(0.32, 0.32, 0.16, k % 2 ? 0xf6c12a : 0xe8a020, 1.4 + (k % 2) * 0.1, 0.08 + k * 0.17, 1.5, 16); B(0.9, 0.85, 0.6, 0x8a5a2a, -0.2, 0.43, 1.3); B(0.5, 0.04, 0.3, 0xe8d8b0, -0.2, 0.87, 1.3, false); C(0.12, 0.12, 0.08, 0xf6c12a, -0.3, 0.93, 1.3, 12); },
    bel({ B }) { B(4.0, 2.0, 0.1, 0xffffff, 0.6, 1.4, -3.15); for (let r = 0; r < 6; r++) for (let k = 0; k < 14; k++) B(0.16, 0.24, 0.04, [0x1a1a1a, 0xc8f04a, 0xe8202a, 0x2a8ad8, 0xff8fb8, 0xf2c14e][(r * 3 + k) % 6], -1.0 + k * 0.24, 0.65 + r * 0.3, -3.08, false);
      B(1.6, 0.8, 0.7, 0xc8c8cc, 2.4, 0.4, 1.4); B(0.4, 0.04, 0.3, 0x2a2a2e, 2.1, 0.82, 1.4, false); B(0.06, 0.5, 0.06, 0x2a2a2e, 2.8, 1.05, 1.2, false); B(0.3, 0.08, 0.2, 0xfff4c0, 2.75, 1.3, 1.3, false); B(0.18, 0.32, 0.05, 0x3a4a3a, -0.3, 1.25, -0.25, false); },
    was({ B, C }) { for (let k = 0; k < 6; k++) { const x = -1.4 + (k % 3) * 1.0, z = k < 3 ? -2.85 : -1.95; if (k >= 3) continue; B(0.85, 0.95, 0.75, 0xf4f4f4, x, 0.48, z); const d = C(0.27, 0.27, 0.05, k === 1 ? 0x8a8a8a : 0x2a4a6a, x, 0.55, z + 0.38, 16); d.rotation.x = Math.PI / 2; }
      for (let k = 0; k < 3; k++) { const x = 3.6, z = -0.9 + k * 0.9; B(0.75, 0.95, 0.85, 0xf4f4f4, x, 0.48, z); const d = C(0.25, 0.25, 0.05, 0x2a4a6a, x - 0.4, 0.55, z, 16); d.rotation.z = Math.PI / 2; }
      B(1.8, 0.85, 0.7, 0xd8d0c0, 0.6, 0.43, 1.4); for (let k = 0; k < 4; k++) B(0.36, 0.08, 0.28, [0xf2e8c8, 0x2a5a9a, 0xe8202a, 0xffffff][k], 0.0 + k * 0.4, 0.9 + (k % 2) * 0.05, 1.4, false); for (const x of [-1.6, -0.9]) { B(0.42, 0.06, 0.42, 0xe8a020, x, 0.45, 1.6); B(0.04, 0.45, 0.04, 0x8a8a8a, x, 0.22, 1.6); } },
    habibi({ B, C }) { C(0.22, 0.3, 0.75, 0x8a4a1e, -3.7, 1.5, -2.6, 14); C(0.02, 0.02, 1.1, 0x9aa0a8, -3.7, 1.5, -2.6, 6); B(0.6, 0.9, 0.1, 0xa83a1a, -3.7, 1.5, -2.95); // de spies
      { const mb = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.9), lam({ map: deps.signTex([{ t: 'KAPSALON W 7,50 · DÖNER W 5', size: 30 }, { t: 'SHOARMA · FALAFEL · FRIET', size: 26, color: '#ffffff' }], '#0a3a2a', '#ffe14a', 512, 160), emissive: 0x1a1a10 })); mb.position.set(0.4, 2.35, -3.2); arguments[0].g.add(mb); }
      for (const [x, z] of [[0.8, 1.2], [2.6, 1.2], [2.6, -0.8]]) { B(0.7, 0.05, 0.7, 0xf2f0ea, x, 0.75, z); B(0.06, 0.72, 0.06, 0x8a8a8a, x, 0.37, z); for (const dx of [-0.5, 0.5]) { B(0.36, 0.04, 0.36, 0xd8202a, x + dx, 0.45, z); B(0.04, 0.44, 0.04, 0xd8202a, x + dx, 0.22, z); } }
      B(0.7, 1.9, 0.6, 0xd8202a, 3.9, 0.95, 0.4); B(0.6, 1.6, 0.04, lam({ color: 0xbfe8ff, emissive: 0x2a4a5a }), 3.55, 1.0, 0.4); },
    reis({ B, C }) { for (const x of [0.2, 2.4]) { B(1.4, 0.75, 0.7, 0xf4f0e6, x, 0.38, 0.4); B(0.5, 0.35, 0.05, 0x2a2a2e, x, 0.95, 0.25, false); B(0.42, 0.04, 0.42, 0x1a2a5a, x, 0.45, 1.1); }
      { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.1), lam({ map: deps.signTex([{ t: 'COSTA DEL KAAS', size: 34 }, { t: '7 nachten v.a. W 299', size: 24, color: '#1a2a5a' }], '#ffd060', '#c8102e', 512, 300) })); p.position.set(1.2, 1.6, -3.22); arguments[0].g.add(p); }
      B(0.25, 1.4, 0.3, 0x6a4022, 3.9, 0.7, -1.2); for (let k = 0; k < 4; k++) B(0.04, 0.24, 0.18, [0xff8a1c, 0x2a8ad8, 0x3a9a4a, 0xe8202a][k], 3.75, 0.5 + k * 0.3, -1.2, false); C(0.22, 0.18, 0.4, 0x8a5a3a, -0.9, 0.2, 2.2); C(0.03, 0.05, 1.0, 0x6a4a2a, -0.9, 0.9, 2.2, 6); C(0.4, 0.1, 0.25, 0x3a9a4a, -0.9, 1.45, 2.2, 8); },
    makelaar({ B, C }) { for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { B(0.7, 0.9, 0.03, 0xffffff, -0.6 + k * 0.95, 1.0 + r * 1.05, -3.18, false); B(0.6, 0.4, 0.035, [0x8aa8c8, 0xc8a878, 0x9ab88a, 0xd8b8a8][(r + k) % 4], -0.6 + k * 0.95, 1.18 + r * 1.05, -3.17, false); }
      B(1.8, 0.04, 0.9, lam({ color: 0xcfe8f0, transparent: true, opacity: 0.55 }), 1.2, 0.76, 1.0, false); for (const x of [0.5, 1.9]) B(0.04, 0.74, 0.8, 0xc8c8cc, x, 0.38, 1.0, false); for (const x of [0.7, 1.7]) { B(0.45, 0.05, 0.45, 0x16161a, x, 0.46, 1.8); B(0.45, 0.45, 0.05, 0x16161a, x, 0.7, 2.02); }
      B(0.3, 0.7, 0.3, 0x8a3a1e, 3.6, 0.95, 0.6); B(0.3, 0.6, 0.3, 0x2a3a5a, 3.95, 0.9, 0.6); B(0.3, 0.8, 0.3, 0xe8d8b0, 3.25, 1.0, 0.6); B(1.2, 0.6, 0.5, 0xf4f4f2, 3.6, 0.3, 0.6); },
  };
  const PROPS_SOLID = { // walls of stuff: [x0, x1, z0, z1] in room coordinates
    bloem: [[-1.25, 2.25, 1.65, 2.15], [-1.25, 2.25, -1.85, -1.35], [2.75, 3.65, 0.35, 0.85]],
    kaas: [[-1.5, 2.3, -3.3, -2.75], [1.05, 1.8, 1.15, 1.85], [-0.65, 0.25, 1.0, 1.6]],
    bel: [[1.6, 3.2, 1.05, 1.75]],
    was: [[-1.85, 1.05, -3.25, -2.45], [3.2, 4.5, -1.4, 1.4], [-0.3, 1.5, 1.05, 1.75]],
    habibi: [[0.4, 1.2, 0.8, 1.6], [2.2, 3.0, 0.8, 1.6], [2.2, 3.0, -1.2, -0.4], [3.55, 4.5, 0.1, 0.7]],
    reis: [[-0.5, 0.9, 0.05, 0.75], [1.7, 3.1, 0.05, 0.75], [3.7, 4.5, -1.4, -1.0]],
    makelaar: [[0.3, 2.1, 0.55, 1.45], [3.0, 4.2, 0.35, 0.85]],
  };

  // ---------------------------------------------------------------- in and out
  let inside = null, keeperBack = null;
  const keeperOf = (biz) => deps.bfolk() && deps.bfolk().folk.find((f) => f.biz === biz);
  function enter(biz) {
    const b = byId[biz]; if (!b) return;
    if (!b.open.includes(wdNow())) { deps.toast('GESLOTEN', `${b.name} is closed today. Open ${b.hours}.`, 2.5); return; }
    if (deps.openNow && !deps.openNow(biz, b.open, wdNow())) { deps.toast('GESLOTEN', `${b.name} is closed at this hour. Open ${deps.hoursText ? deps.hoursText(biz) : b.hours}.`, 2.5); return; }
    deps.beep(1320, 0.05, 'sine', 0.04); setTimeout(() => deps.beep(990, 0.12, 'sine', 0.035), 90); // de winkelbel
    fadeTo(() => {
      const r = build(biz); inside = biz; r.g.visible = true; r.light.intensity = 2.2; S().visits++;
      const k = keeperOf(biz); if (k) { k.inside = true; keeperBack = { f: k, x: k.p.position.x, z: k.p.position.z, home: k.home }; k.p.position.set(r.keeper.x, 0, r.keeper.z); k.home = 0; k.p.rotation.y = 0; }
      player.position.set(r.door.x, 0, r.door.z); player.rotation.y = Math.PI;
      deps.setBounds({ x0: r.ox - W / 2 + 0.3, x1: r.ox + W / 2 - 0.3, z0: r.oz - D / 2 + 0.3, z1: r.oz + D / 2 - 0.1 });
      deps.snapCam();
      deps.toast((b.short || b.name).toUpperCase(), b.blurb, 3);
    });
  }
  function leave(quick) {
    if (!inside) return; const biz = inside, r = rooms[biz], d = deps.doorAt(biz);
    const go = () => {
      inside = null; r.g.visible = false; r.light.intensity = 0; deps.setBounds(null);
      if (keeperBack) { keeperBack.f.inside = false; const { f, x, z, home } = keeperBack; f.p.position.set(x, 0, z); f.home = home; f.p.rotation.y = home; keeperBack = null; }
      player.position.set(d.x, 0, d.z - 0.9); player.rotation.y = Math.PI; deps.snapCam();
    };
    if (quick) go(); else { deps.beep(990, 0.08, 'sine', 0.03); fadeTo(go); }
  }
  // the street doors on the Kipkruidenkade
  for (const biz of IDS) {
    const b = byId[biz]; if (!b || b.x0 == null) continue;
    deps.addInteract({ pos: () => { const d = deps.doorAt(biz); return new THREE.Vector3(d.x, 0, d.z - 0.45); }, r: 1.15, enabled: () => !inside && !deps.busy(),
      label: () => (!b.open.includes(wdNow()) ? `${b.short || b.name} · gesloten vandaag` : deps.openNow && !deps.openNow(biz, b.open, wdNow()) ? `${b.short || b.name} · gesloten (${deps.hoursText ? deps.hoursText(biz) : ''})` : `Naar binnen · ${b.short || b.name}`), act: () => enter(biz) });
  }
  const regulars = () => Object.entries(S().jobs).filter(([biz, j]) => JOBS[biz] && j.done && j.miss < 2).map(([biz]) => biz);
  const camFocus = (p) => { const r = rooms[inside]; return new THREE.Vector3(r.ox * 0.55 + p.x * 0.45, 0, (r.oz - 0.5) * 0.55 + p.z * 0.45); };
  const camHeight = () => D * 1.1 + 4.0;
  return { camFocus, camHeight, serve, onDay, enter, leave, inside: () => !!inside, where: () => inside, regulars, JOBS, rooms, have };
}
