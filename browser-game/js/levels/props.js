// Shared props for level files: rain, puddles, water, and furniture looks for street furniture.
// Everything is added to the level's root, so it goes away with the level.

// Rain: falling streaks over the given world rectangles [x0, z0, x1, z1] (outdoor areas only, there are no roofs).
export function rain(THREE, root, rects, n = 700) {
  const area = rects.map(([x0, z0, x1, z1]) => (x1 - x0) * (z1 - z0)), total = area.reduce((a, b) => a + b, 0);
  const pos = new Float32Array(n * 6), drops = [];
  for (let i = 0; i < n; i++) {
    let r = Math.random() * total, k = 0; while (r > area[k] && k < rects.length - 1) r -= area[k++];
    const [x0, z0, x1, z1] = rects[k];
    drops.push({ x: x0 + Math.random() * (x1 - x0), z: z0 + Math.random() * (z1 - z0), y: Math.random() * 9, v: 13 + Math.random() * 5 });
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x9ab8e8, transparent: true, opacity: 0.45, depthWrite: false }));
  lines.frustumCulled = false; root.add(lines);
  const splashes = [];
  const splM = new THREE.MeshBasicMaterial({ color: 0xb8d0ff, transparent: true, opacity: 0.28, depthWrite: false });
  for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.07, 10), splM); m.rotation.x = -Math.PI / 2; m.visible = false; root.add(m); splashes.push({ m, t: 0 }); }
  let si = 0;
  return (dt) => {
    for (let i = 0; i < n; i++) {
      const d = drops[i]; d.y -= d.v * dt;
      if (d.y < 0) { d.y += 9; if (Math.random() < 0.15) { const s = splashes[si++ % splashes.length]; s.m.position.set(d.x, 0.04, d.z); s.m.visible = true; s.t = 0; } }
      pos.set([d.x, d.y, d.z, d.x - 0.03, d.y + 0.45, d.z + 0.05], i * 6);
    }
    geo.attributes.position.needsUpdate = true;
    for (const s of splashes) if (s.m.visible) { s.t += dt; s.m.scale.setScalar(1 + s.t * 8); if (s.t > 0.18) s.m.visible = false; }
  };
}

// Puddles: dark shiny patches on the floor at the given world points [x, z, size].
export function puddles(THREE, root, list) {
  const m = new THREE.MeshPhongMaterial({ color: 0x3a4a66, transparent: true, opacity: 0.32, shininess: 140, specular: 0x8ab0ff, depthWrite: false });
  for (const [x, z, s] of list) { const p = new THREE.Mesh(new THREE.CircleGeometry(s, 18), m); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.026, z); p.scale.set(1, 0.6 + Math.random() * 0.4, 1); p.rotation.z = Math.random() * 6; root.add(p); }
}

// Canal water: a moving surface below the quay at world [x0, z0, x1, z1].
export function water(THREE, root, floorW, canvasTex, x0, z0, x1, z1) {
  const t = canvasTex(64, 64, (g) => { g.fillStyle = '#081a2c'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 50; i++) { g.fillStyle = `rgba(110,170,255,${0.04 + Math.random() * 0.12})`; g.fillRect(Math.random() * 64, Math.random() * 64, 5 + Math.random() * 10, 1); } });
  const w = floorW(x0, x1, z0, z1, t, 6, 0xffffff, -0.5);
  let k = 0; return (dt) => { k += dt; w.material.map.offset.x = k * 0.015; w.material.map.offset.y = Math.sin(k * 0.5) * 0.04; };
}

// A soft round glow (sprites without a texture draw as squares).
let glowMap = null;
export function glowSprite(THREE, color, sx, sy = sx, opacity = 0.4) {
  if (!glowMap) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); glowMap = new THREE.CanvasTexture(c); }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.set(sx, sy, 1); return s;
}

// Furniture letters for street dressing (use them in a level's furn table).
export const STREET_FURN = {
  // street lamp: an old iron post with a glowing lantern; blocks walking, too thin to hide behind
  l: { h: 0.4, cover: false, draw: ({ THREE, root, cyl, lam, n, cz, x, OX }) => {
    for (let k = 0; k < n; k++) {
      const px = OX + x + k + 0.5;
      cyl(0.08, 0.12, 3.2, lam({ color: 0x1a1e24 }), px, 1.6, cz, root, 8); cyl(0.2, 0.2, 0.25, lam({ color: 0x1a1e24 }), px, 0.12, cz, root, 8);
      const lan = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.34), new THREE.MeshBasicMaterial({ color: 0xffe0a0 })); lan.position.set(px, 3.35, cz); root.add(lan);
      const gl = glowSprite(THREE, 0xffc870, 2.4, 2.4, 0.5); gl.position.set(px, 3.35, cz); root.add(gl);
    }
  } },
  // bollard: short black post
  o: { h: 0.6, cover: false, draw: ({ cyl, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) { cyl(0.12, 0.14, 0.7, lam({ color: 0x14161a }), OX + x + k + 0.5, 0.35, cz, root, 10); cyl(0.15, 0.15, 0.06, lam({ color: 0x14161a }), OX + x + k + 0.5, 0.72, cz, root, 10); } } },
  // parked bicycle(s): low, bullets fly over
  k: { h: 0.6, cover: false, draw: ({ THREE, root, box, lam, n, cz, x, OX }) => {
    for (let k = 0; k < n; k++) {
      const px = OX + x + k + 0.5, c = [0x1a1a1a, 0x8a1a1a, 0x1a4a8a, 0x2a6a3a][(x + k) % 4];
      for (const dz of [-0.33, 0.33]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 6, 16), lam({ color: 0x1a1a1a })); w.position.set(px, 0.33, cz + dz); w.rotation.y = Math.PI / 2; root.add(w); }
      box(0.04, 0.04, 0.7, lam({ color: c }), px, 0.55, cz, root, false); box(0.04, 0.4, 0.04, lam({ color: c }), px, 0.45, cz - 0.1, root, false);
      box(0.3, 0.04, 0.04, lam({ color: 0x2a2a2a }), px, 0.85, cz + 0.3, root, false); box(0.1, 0.05, 0.2, lam({ color: 0x2a1a12 }), px, 0.75, cz - 0.15, root, false);
    }
  } },
  // wooden planter box with a shrub
  v: { h: 0.6, cover: false, draw: ({ THREE, root, box, lam, n, cx, cz, x, OX }) => {
    box(n - 0.1, 0.55, 0.8, lam({ color: 0x7a5230 }), cx, 0.28, cz, root);
    for (let k = 0; k < n; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38, 0), lam({ color: [0x2f7a2a, 0x3a8a34, 0x286a24][(x + k) % 3] })); b.position.set(OX + x + k + 0.5, 0.8, cz); b.castShadow = true; root.add(b); }
  } },
  // wooden bench
  h: { h: 0.45, cover: false, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.1, 0.06, 0.45, lam({ color: 0x8a5a30 }), cx, 0.45, cz, root); box(n - 0.1, 0.4, 0.06, lam({ color: 0x8a5a30 }), cx, 0.7, cz - 0.2, root, false); for (const s of [-1, 1]) box(0.06, 0.45, 0.4, lam({ color: 0x1a1a1a }), cx + s * (n / 2 - 0.2), 0.22, cz, root, false); } },
  // small round bistro table (low)
  t: { h: 0.75, cover: false, draw: ({ cyl, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) { const px = OX + x + k + 0.5; cyl(0.36, 0.36, 0.04, lam({ color: 0xd8d4c8 }), px, 0.75, cz, root, 16); cyl(0.04, 0.04, 0.74, lam({ color: 0x1a1a1a }), px, 0.37, cz, root, 6); for (const [dx, dz] of [[0.42, 0.2], [-0.42, -0.2]]) { cyl(0.16, 0.16, 0.04, lam({ color: 0x3a2a1a }), px + dx, 0.45, cz + dz, root, 10); cyl(0.02, 0.02, 0.45, lam({ color: 0x1a1a1a }), px + dx, 0.22, cz + dz, root, 6); } } } },
};
