// The Aero look for the 3D street (2026-11-20). Only while the "Lettertype" setting is Aero (html.aero); Klassiek keeps the
// dusk-pink neon street exactly as it was.
//   · sky and light: a clear Aero morning, blue overhead fading to cream and saffron at the horizon, a warm white sun.
//     The reflection map (scene.environment) is rebuilt from that sky, so car paint, glass and the canal pick it up.
//   · canal: glossy water (clearcoat, low roughness) with a slow ripple normal map that mirrors the sky.
//   · shop signs: every signTex sign gets a glass gel face (white gloss on the top half, a saffron rim light below)
//     and glows a little, so bloom picks it up in Enhanced.
// Graphics modes: Simple skips the ripple animation and the clearcoat (plain glossy Phong-like water, cheapest);
// PS1 Retro keeps the clearcoat but not the ripples (they shimmer at a third of the resolution). Nothing here adds a
// render pass, so phones pay only for one physical material on the canal.
// deps: THREE, scene, renderer, hemi, sun, water, post (mode), busy() -> true while a mission or drive owns the scene
export function createAeroWorld(deps) {
  const { THREE, scene, renderer, hemi, sun, water, post } = deps;
  const isAero = () => document.documentElement.classList.contains('aero');
  const base = { // Klassiek, as main.js set it up
    bg: scene.background.clone(), fog: scene.fog.color.clone(), fogNear: scene.fog.near, fogFar: scene.fog.far,
    env: scene.environment, envI: scene.environmentIntensity, hemiC: hemi.color.clone(), hemiG: hemi.groundColor.clone(), hemiI: hemi.intensity,
    sunC: sun.color.clone(), sunI: sun.intensity, waterM: water.material,
  };
  let on = null, env = null, waterM = null, rip = null, scanT = 0;
  const glossed = new Map(); // mesh -> { map, emissive, emissiveMap, ei }

  function aeroEnv() { // the Aero sky as an equirect strip, then PMREM (built once)
    if (env) return env;
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#1f6fd0'); gr.addColorStop(0.22, '#4f9ee8'); gr.addColorStop(0.4, '#a8d8f6'); gr.addColorStop(0.48, '#fff1d6'); gr.addColorStop(0.5, '#ffd48a');
    gr.addColorStop(0.53, '#c8b48e'); gr.addColorStop(1, '#6a5a44');
    g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    const sunG = g.createRadialGradient(150, 112, 2, 150, 112, 60); sunG.addColorStop(0, 'rgba(255,250,230,1)'); sunG.addColorStop(0.3, 'rgba(255,224,150,.6)'); sunG.addColorStop(1, 'rgba(255,224,150,0)');
    g.fillStyle = sunG; g.fillRect(60, 40, 180, 140);
    for (let i = 0; i < 26; i++) { // soft cumulus
      const x = (i * 97) % 512, y = 30 + ((i * 53) % 70), r = 16 + ((i * 29) % 26);
      const cg = g.createRadialGradient(x, y, 1, x, y, r); cg.addColorStop(0, 'rgba(255,255,255,.85)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = cg; g.beginPath(); g.ellipse(x, y, r * 1.8, r * 0.7, 0, 0, 7); g.fill();
    }
    const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.PMREMGenerator(renderer); env = pm.fromEquirectangular(t).texture; pm.dispose(); t.dispose();
    return env;
  }
  function ripples() { // a tileable ripple normal map, drawn once
    if (rip) return rip;
    const N = 128, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), img = g.createImageData(N, N);
    const h = (x, y) => Math.sin((x / N) * Math.PI * 6 + Math.sin((y / N) * Math.PI * 4) * 1.2) * 0.5 + Math.sin(((x + y) / N) * Math.PI * 10) * 0.25 + Math.sin(((x - 2 * y) / N) * Math.PI * 4) * 0.25;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const dx = h(x + 1, y) - h(x - 1, y), dy = h(x, y + 1) - h(x, y - 1), k = (y * N + x) * 4;
      img.data[k] = 128 + dx * 60; img.data[k + 1] = 128 + dy * 60; img.data[k + 2] = 255; img.data[k + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    rip = new THREE.CanvasTexture(c); rip.wrapS = rip.wrapT = THREE.RepeatWrapping; rip.repeat.set(36, 2);
    return rip;
  }
  function makeWater() {
    const simple = post && post.mode === 'simple';
    if (waterM) waterM.dispose();
    waterM = simple
      ? new THREE.MeshStandardMaterial({ color: 0x1f5e6a, roughness: 0.14, metalness: 0.45, envMapIntensity: 1.1 })
      : new THREE.MeshPhysicalMaterial({ color: 0x1a5562, roughness: 0.1, metalness: 0.5, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.05, normalMap: ripples(), normalScale: new THREE.Vector2(0.55, 0.55), clearcoatNormalMap: ripples(), clearcoatNormalScale: new THREE.Vector2(0.35, 0.35) });
    waterM.userData.mode = post ? post.mode : 'enhanced';
    return waterM;
  }
  function glossTex(src) { // the sign's own canvas with a glass gel face on top
    const img = src.image, w = img.width, h = img.height, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const top = g.createLinearGradient(0, 0, 0, h * 0.55); top.addColorStop(0, 'rgba(255,255,255,.55)'); top.addColorStop(0.5, 'rgba(255,255,255,.22)'); top.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = top; const r = Math.min(h * 0.35, 40);
    g.beginPath(); g.moveTo(10 + r, 10); g.lineTo(w - 10 - r, 10); g.quadraticCurveTo(w - 10, 10, w - 10, 10 + r); g.lineTo(w - 10, h * 0.48); g.bezierCurveTo(w * 0.7, h * 0.4, w * 0.3, h * 0.56, 10, h * 0.5); g.lineTo(10, 10 + r); g.quadraticCurveTo(10, 10, 10 + r, 10); g.fill();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(w * 0.06, h * 0.09, w * 0.88, Math.max(2, h * 0.025)); // the bright edge of the glass
    const bot = g.createLinearGradient(0, h * 0.7, 0, h); bot.addColorStop(0, 'rgba(242,193,78,0)'); bot.addColorStop(1, 'rgba(242,193,78,.45)'); // saffron rim light
    g.fillStyle = bot; g.fillRect(0, h * 0.7, w, h * 0.3);
    const t = new THREE.CanvasTexture(c); t.colorSpace = src.colorSpace; t.anisotropy = src.anisotropy || 1; t.userData.aeroGloss = true;
    return t;
  }
  function glossSigns() {
    scene.traverseVisible((o) => {
      if (!o.isMesh || glossed.has(o)) return; const m = o.material; if (!m || Array.isArray(m) || !m.map || !m.map.userData || !m.map.userData.sign || !m.map.image) return;
      const gt = glossTex(m.map), rec = { map: m.map, emissive: m.emissive ? m.emissive.clone() : null, emissiveMap: m.emissiveMap || null, ei: m.emissiveIntensity };
      glossed.set(o, rec); m.map = gt;
      if (m.emissive) { m.emissiveMap = gt; m.emissive.setRGB(0.55, 0.5, 0.42); m.emissiveIntensity = 0.75; } // backlit glass
      m.needsUpdate = true;
    });
  }
  function unglossSigns() {
    for (const [o, rec] of glossed) { const m = o.material; if (m.map && m.map.userData.aeroGloss) m.map.dispose(); m.map = rec.map; if (rec.emissive) { m.emissive.copy(rec.emissive); m.emissiveMap = rec.emissiveMap; m.emissiveIntensity = rec.ei; } m.needsUpdate = true; }
    glossed.clear();
  }
  function apply(a) {
    on = a;
    if (a) {
      scene.background.set(0xbfe0f2); scene.fog.color.set(0xcfe4ee); scene.fog.near = 80; scene.fog.far = 165;
      scene.environment = aeroEnv(); scene.environmentIntensity = 0.85;
      hemi.color.set(0xeaf4ff); hemi.groundColor.set(0x9a8a66); hemi.intensity = 1.5;
      sun.color.set(0xfff1d8); sun.intensity = 3.4; hemi.intensity = 1.62; // exposure stays put: missions share the renderer
      water.material = makeWater(); glossSigns();
    } else {
      scene.background.copy(base.bg); scene.fog.color.copy(base.fog); scene.fog.near = base.fogNear; scene.fog.far = base.fogFar;
      scene.environment = base.env; scene.environmentIntensity = base.envI;
      hemi.color.copy(base.hemiC); hemi.groundColor.copy(base.hemiG); hemi.intensity = base.hemiI;
      sun.color.copy(base.sunC); sun.intensity = base.sunI;
      water.material = base.waterM; unglossSigns();
    }
  }
  function tick(dt) {
    if (deps.busy && deps.busy()) return; // a mission or drive saved the street's lights and puts them back itself
    const want = isAero(); if (want !== on) apply(want);
    if (!on) return;
    const mode = post ? post.mode : 'enhanced';
    if (waterM && waterM.userData.mode !== mode) water.material = makeWater(); // Graphics changed: simple water or not
    if (rip && mode === 'enhanced') { rip.offset.x = (rip.offset.x + dt * 0.012) % 1; rip.offset.y = (rip.offset.y + dt * 0.02) % 1; }
    if ((scanT -= dt) <= 0) { scanT = 4; glossSigns(); } // signs built later (a new shop, the Loods sign) get their glass too
  }
  return { tick, get on() { return !!on; } };
}
