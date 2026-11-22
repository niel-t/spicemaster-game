// Set dressing every mission level gets on top of its own layout: this is a spice war, so there are spice sacks and one-tonne big
// bags of spice standing against the walls everywhere; butchers' cold rooms get racks of meat on hooks; shoarma joints get shoarma
// spits turning on their counters.
//
// Sacks, big bags and meat racks are real furniture cells (they block walking and stop bullets), placed by dress() right after the
// level's layout and before anything is built: only against a wall, never near a door, a spawn, the loot or the start, and only
// where the floor stays connected (every Lampas and crate still reachable). The placement is seeded by the level id, so a level
// looks the same every visit. Shoarma spits are pure decoration on top of counter cells (spits()).

// the spices: [heap colour, sack print]
const SPICE = [[0xc8401e, '#c8401e'], [0xe8b020, '#e8b020'], [0x8a5a2a, '#8a5a2a'], [0xa8642a, '#a8642a'], [0x6a7a2a, '#6a7a2a'], [0xd8461e, '#d8461e'], [0x5a2a1a, '#5a2a1a'], [0xe0cc98, '#e0cc98']];
const NAMES = ['PAPRIKA', 'KURKUMA', 'KOMIJN', 'KANEEL', "ZA'ATAR", 'CHILI', 'KRUIDNAGEL', 'GEMBER', 'KIPKRUIDEN', 'RAS EL HANOUT', 'SUMAK', 'KERRIE'];

// everything static is drawn into one group per level, which mission.js then merges (one mesh per look: cheap to draw)
let DG = null;
export function dressGroup(THREE, root) { DG = new THREE.Group(); root.add(DG); return DG; }

const labelCache = {};
function label(THREE, t, col) {
  const k = t + col; if (labelCache[k]) return labelCache[k];
  const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, 128, 64); g.strokeStyle = col; g.lineWidth = 6; g.strokeRect(4, 4, 120, 56);
  g.fillStyle = col; g.font = 'bold 20px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, 64, 32, 112);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return (labelCache[k] = tx);
}

// the three furniture letters (picked so no level uses them)
export const DRESS_FURN = {
  // jute spice sacks, two or three to a cell, tops rolled open on a heap of spice, a printed label
  '§': { h: 0.8, cover: true, draw: ({ THREE, root, lam, n, cz, x, z, OX }) => {
    for (let k = 0; k < n; k++) {
      const px = OX + x + k + 0.5, s = (x * 7 + z * 13 + k) % SPICE.length;
      for (let i = 0; i < 4; i++) {
        const sx = px + (i % 2 ? 0.22 : -0.22), sz = cz + (i < 2 ? -0.2 : 0.22), [col, css] = SPICE[(s + i) % SPICE.length], tall = 0.72 + ((x + i) % 3) * 0.06;
        const sack = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, tall, 10), lam({ color: [0xa88a5a, 0x9a7c4c, 0xb4966a, 0x8e7248][i] }));
        sack.position.set(sx, tall / 2, sz); sack.rotation.z = ((i % 2) - 0.5) * 0.1; sack.castShadow = true; (DG || root).add(sack);
        const lip = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 5, 12), lam({ color: 0x8a6c3c })); lip.rotation.x = Math.PI / 2; lip.position.set(sx, tall, sz); (DG || root).add(lip);
        const heap = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.16, 10), lam({ color: col })); heap.position.set(sx, tall + 0.05, sz); (DG || root).add(heap);
        if (i >= 2) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), lam({ map: label(THREE, NAMES[(s + x + i) % NAMES.length], css) })); l.position.set(sx, 0.38, sz + 0.25); (DG || root).add(l); }
      }
    }
  } },
  // a one-tonne big bag of spice on a pallet: white woven bag, lifting loops, the spice heaped in the open top
  '¤': { h: 1.15, cover: true, draw: ({ THREE, root, box, lam, n, cz, x, z, OX }) => {
    for (let k = 0; k < n; k++) {
      const px = OX + x + k + 0.5, [col, css] = SPICE[(x * 5 + z * 11 + k) % SPICE.length];
      for (const dz of [-0.33, 0, 0.33]) box(0.9, 0.05, 0.18, lam({ color: 0xa87a4a }), px, 0.11, cz + dz, DG || root, false);
      box(0.9, 0.08, 0.9, lam({ color: 0x8a6038 }), px, 0.04, cz, DG || root, false);
      box(0.86, 0.92, 0.86, lam({ color: 0xe8e4d8 }), px, 0.6, cz, DG || root);
      for (const s of [-1, 1]) box(0.88, 0.05, 0.02, lam({ color: 0xc8c0a8 }), px, 0.6 + s * 0.25, cz + 0.44, DG || root, false);
      for (const [ox, oz] of [[-0.36, -0.36], [0.36, -0.36], [-0.36, 0.36], [0.36, 0.36]]) { const loop = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 4, 8, Math.PI), lam({ color: 0xd8d0b8 })); loop.position.set(px + ox, 1.06, cz + oz); loop.rotation.y = Math.atan2(ox, oz); (DG || root).add(loop); }
      const heap = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.22, 14), lam({ color: col })); heap.position.set(px, 1.16, cz); (DG || root).add(heap);
      const l = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.22), lam({ map: label(THREE, NAMES[(x + z + k) % NAMES.length], css) })); l.position.set(px, 0.62, cz + 0.44); (DG || root).add(l);
    }
  } },
  // a butcher's hanging rack: a steel frame with sides of meat on hooks
  '¶': { h: 2.2, cover: true, draw: ({ THREE, root, box, cyl, lam, n, cx, cz, x, OX }) => {
    const steel = lam({ color: 0xb8c0c4 });
    for (const s of [-1, 1]) box(0.06, 2.3, 0.06, steel, cx + s * (n / 2 - 0.08), 1.15, cz, DG || root, false);
    box(n - 0.1, 0.06, 0.06, steel, cx, 2.25, cz, DG || root, false);
    const meat = lam({ color: 0x9a2a26 }), fat = lam({ color: 0xf0dcc8 });
    for (let k = 0; k < n * 2; k++) {
      const px = OX + x + 0.25 + k * 0.5; cyl(0.01, 0.01, 0.3, steel, px, 2.08, cz, DG || root, 4);
      const side = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), meat); side.scale.set(0.95, 2.7, 0.6); side.position.set(px, 1.35, cz); side.castShadow = true; (DG || root).add(side);
      const rim = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), fat); rim.scale.set(0.35, 2.4, 0.5); rim.position.set(px + 0.12, 1.4, cz + 0.02); (DG || root).add(rim);
      const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.18, 6), fat); bone.position.set(px, 0.8, cz); (DG || root).add(bone);
    }
  } },
};
export const DRESS_LETTERS = Object.keys(DRESS_FURN).join('');

const MEAT_ROOM = /koelcel|cold|slacht|prep|butcher|vries/;
const OUTSIDE = /^(street|terrace|garden|jetty|deck|quay|quayeast|alley|steeg|stairs)$/; // pavements, decks and stairs stay clear

// per level: spice density (sack runs per 40 floor cells), shoarma spits on the counter, meat racks in the cold rooms
const SPICY = new Set(['komijnkade', 'kaneelsilos', 'paprikapakhuis', 'kruidnagelkade', 'peperhaven', 'kurkumaloods', 'saffraanpier', 'nootmuskade', 'smokkelsloot', 'containerchaos', 'kardemomdok',
  'couscouskade', 'zaatarmarkt', 'sumaksteeg', 'harissahof', 'dadelplein', 'kasbahalgara', 'goudenmolen']);
const SHOARMA = new Set(['spekbuurt', 'bitterbalbuurt', 'sauzenbuurt', 'mayonaisemarkt', 'knoflooksteeg', 'halvekipplein', 'frietwijk', 'uitjesbuurt']);
const SKIP = new Set(['warehouse']); // the siege map keeps its own barricade lanes clear

function rng(seed) { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) | 0; return () => { s = (s * 1103515245 + 12345) | 0; return ((s >>> 8) & 0xffff) / 0x10000; }; }

// dress(def, G, isBlock): writes sack ('§'), big bag ('¤') and meat rack ('¶') cells into the grid. Returns the cells it placed.
export function dress(def, G, isBlock) {
  if (SKIP.has(def.id) || def.noDress) return [];
  const W = def.W, H = def.H, r = rng(def.id + '#dress'), placed = [];
  const walk = (x, z) => x >= 0 && z >= 0 && x < W && z < H && !isBlock(G[z][x]) && !DRESS_LETTERS.includes(G[z][x]);
  const start = def.validateFrom ? [Math.floor(def.validateFrom[0]), Math.floor(def.validateFrom[1])] : null;
  if (!start || !walk(start[0], start[1])) return [];
  // the cells that must stay reachable: spawns and loot
  const must = [...(def.spawns || []).map((s) => [Math.floor(s[0]), Math.floor(s[1])]), ...(def.loot || []).map((l) => [Math.floor(l[0]), Math.floor(l[1])])].filter(([x, z]) => walk(x, z));
  const flood = () => { const seen = new Uint8Array(W * H), q = [start[1] * W + start[0]]; seen[q[0]] = 1; let n = 0;
    while (q.length) { const c = q.pop(); n++; const x = c % W, z = (c / W) | 0; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, nz = z + dz; if (walk(nx, nz) && !seen[nz * W + nx]) { seen[nz * W + nx] = 1; q.push(nz * W + nx); } } }
    return { seen, n }; };
  let base = flood();
  const keepClear = [];
  for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === 'D' || G[z][x] === '%') keepClear.push([x + 0.5, z + 0.5, G[z][x] === 'D' ? 2.6 : 1.2]);
  for (const [x, z] of must) keepClear.push([x + 0.5, z + 0.5, 1.6]);
  keepClear.push([start[0] + 0.5, start[1] + 0.5, 3]);
  for (const [x, z] of def.hallCells || []) keepClear.push([x + 0.5, z + 0.5, 1.6]);
  const clear = (x, z) => keepClear.every(([cx, cz, rr]) => Math.hypot(x + 0.5 - cx, z + 0.5 - cz) >= rr);
  const wallBy = (x, z) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => { const c = (G[z + dz] || [])[x + dx]; return c === '#'; });
  const tryPut = (x, z, ch) => {
    if (G[z][x] !== '.' || !base.seen[z * W + x] || !wallBy(x, z) || !clear(x, z)) return false;
    const old = G[z][x]; G[z][x] = ch; const f = flood();
    if (f.n !== base.n - 1 || must.some(([mx, mz]) => !f.seen[mz * W + mx])) { G[z][x] = old; return false; }
    base = f; placed.push([x, z, ch]); return true;
  };
  const spicy = SPICY.has(def.id), dens = spicy ? 3.6 : 1.8;
  for (const [name, x0, z0, x1, z1] of def.rooms) {
    if (OUTSIDE.test(name)) continue;
    const cells = []; for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) cells.push([x, z]);
    for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
    const meat = MEAT_ROOM.test(name);
    let want = Math.round(cells.length / 40 * (meat ? 2.6 : dens)) + (r() < 0.5 ? 1 : 0), got = 0;
    for (const [x, z] of cells) { if (got >= want) break; const ch = meat ? (got % 3 === 2 ? '§' : '¶') : (r() < (spicy ? 0.45 : 0.25) ? '¤' : '§'); if (tryPut(x, z, ch)) got++; }
  }
  return placed;
}

// shoarma spits on counter cells in the shoarma joints: a tapered roll of meat on a skewer, slowly turning, in front of a glowing
// grill plate. Returns the spits (decorate-style tick turns them).
export function spits(def, G, THREE, root, lam, OX, Z0, placed = []) {
  // spilt spice: low heaps on the floor beside some of the sacks and big bags (decoration only, nothing to trip over)
  placed.forEach(([x, z, ch], i) => {
    if (ch === '¶' || (x * 3 + z * 5 + i) % 3) return;
    for (const [dx, dz] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) { if ((G[z + dz] || [])[x + dx] !== '.') continue;
      const col = SPICE[(x + z * 7) % SPICE.length][0], h = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.09, 12), lam({ color: col }));
      h.scale.set(1.3, 1, 0.8); h.position.set(OX + x + 0.5 + dx * 0.62, 0.045, Z0 + z + 0.5 + dz * 0.62); h.rotation.y = i; (DG || root).add(h); break; }
  });
  if (!SHOARMA.has(def.id)) return [];
  const runs = []; // counter runs (K) in shop / kitchen rooms
  for (const [name, x0, z0, x1, z1] of def.rooms) {
    if (!/shop|kitchen|keuken|winkel|grill/.test(name)) continue;
    for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) if (G[z][x] === 'K' && G[z][x - 1] !== 'K') { let n = 0; while (G[z][x + n] === 'K') n++; runs.push([x, z, n]); }
  }
  runs.sort((a, b) => b[2] - a[2]);
  const out = [], meat = lam({ color: 0x9a5a2a }), crisp = lam({ color: 0x6a3a1a }), steel = lam({ color: 0xc8ccd0 }), glow = new THREE.MeshBasicMaterial({ color: 0xff7a2a });
  for (const [x, z, n] of runs.slice(0, 2)) {
    const count = n >= 5 ? 2 : 1;
    for (let k = 0; k < count; k++) {
      const g = new THREE.Group(); g.position.set(OX + x + (count === 1 ? n / 2 : k === 0 ? 0.8 : n - 0.8), 1.08, Z0 + z + 0.5); root.add(g);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12), steel); base.position.y = 0.03; g.add(base);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.25, 6), steel); rod.position.y = 0.62; g.add(rod);
      const roll = new THREE.Group(); roll.position.y = 0.55; g.add(roll);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 0.85, 16), meat); body.castShadow = true; roll.add(body);
      for (let i = 0; i < 6; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28 - i * 0.02, 0.03, 4, 16), crisp); ring.rotation.x = Math.PI / 2; ring.position.y = -0.36 + i * 0.14; roll.add(ring); }
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.9), glow); plate.position.set(0, 0.55, -0.38); g.add(plate);
      out.push(roll);
    }
  }
  return out;
}
