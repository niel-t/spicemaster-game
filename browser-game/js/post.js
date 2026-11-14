// Neon Vice-style screen pass for three.js (Neon Vice renderer.js: bloom, colour grade, PS1 retro mode).
// The scene renders into an HDR target; neon and lights over the threshold bleed into a blurred bloom layer, then one
// full-screen pass adds the bloom, a little extra saturation and a vignette, and applies the renderer's tone mapping.
// Modes: 'enhanced' (default), 'retro' (low resolution, 15-bit colour with ordered dithering), 'simple' (plain render, cheapest).
import * as THREE from '../vendor/three.module.min.js';

const KEY = 'spiceMasterEddy.gfx';
export const GFX_MODES = ['enhanced', 'retro', 'simple'];
export const GFX_LABEL = { enhanced: 'ENHANCED', retro: 'PS1 RETRO', simple: 'SIMPEL' };

const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const BRIGHT = `uniform sampler2D tSrc; uniform float uTh; varying vec2 vUv;
void main(){ vec3 c = texture2D(tSrc, vUv).rgb; float l = max(c.r, max(c.g, c.b)); float k = smoothstep(uTh, uTh + 0.6, l); gl_FragColor = vec4(c * k, 1.0); }`;
const BLUR = `uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
void main(){ vec3 c = texture2D(tSrc, vUv).rgb * 0.227;
  c += (texture2D(tSrc, vUv + uDir * 1.385).rgb + texture2D(tSrc, vUv - uDir * 1.385).rgb) * 0.316;
  c += (texture2D(tSrc, vUv + uDir * 3.231).rgb + texture2D(tSrc, vUv - uDir * 3.231).rgb) * 0.070;
  gl_FragColor = vec4(c, 1.0); }`;
const FINAL = `uniform sampler2D tScene; uniform sampler2D tBloom; uniform float uBloom; uniform float uSat; uniform float uVig; uniform float uRetro; varying vec2 vUv;
float bayer(vec2 p){ vec2 q = mod(floor(p), 4.0); int i = int(q.x + q.y * 4.0);
  float m[16]; m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
  for (int k = 0; k < 16; k++) if (k == i) return m[k] / 16.0; return 0.0; }
void main(){
  vec3 c = texture2D(tScene, vUv).rgb + texture2D(tBloom, vUv).rgb * uBloom;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(l), c, uSat);
  vec2 d = vUv - 0.5; c *= 1.0 - uVig * dot(d, d) * 1.5;
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  if (uRetro > 0.5) { gl_FragColor.rgb = floor(gl_FragColor.rgb * 31.0 + bayer(gl_FragCoord.xy / 2.0)) / 31.0; }
}`;

function load() { try { const m = localStorage.getItem(KEY); return GFX_MODES.includes(m) ? m : 'enhanced'; } catch (e) { return 'enhanced'; } }

export function createPost(renderer) {
  let mode = load();
  const opts = { type: THREE.HalfFloatType, depthBuffer: false };
  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const bA = new THREE.WebGLRenderTarget(1, 1, opts), bB = new THREE.WebGLRenderTarget(1, 1, opts);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), qs = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); quad.frustumCulled = false; qs.add(quad);
  const mk = (fs, uniforms, toneMapped = false) => new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false, toneMapped });
  const brightM = mk(BRIGHT, { tSrc: { value: null }, uTh: { value: 0.85 } });
  const blurM = mk(BLUR, { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } });
  const finalM = mk(FINAL, { tScene: { value: rt.texture }, tBloom: { value: bA.texture }, uBloom: { value: 0.9 }, uSat: { value: 1.12 }, uVig: { value: 0.55 }, uRetro: { value: 0 } }, true);
  const size = new THREE.Vector2(); let w = 0, h = 0, m0 = '';
  function fit() {
    renderer.getDrawingBufferSize(size);
    if (size.x === w && size.y === h && mode === m0) return;
    w = size.x; h = size.y; m0 = mode;
    const retro = mode === 'retro', k = retro ? 1 / 3 : 1;
    rt.setSize(Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k)));
    rt.samples = retro ? 0 : 4;
    rt.texture.minFilter = rt.texture.magFilter = retro ? THREE.NearestFilter : THREE.LinearFilter; rt.texture.needsUpdate = true;
    const bw = Math.max(8, w >> 2), bh = Math.max(8, h >> 2); bA.setSize(bw, bh); bB.setSize(bw, bh);
    finalM.uniforms.uRetro.value = retro ? 1 : 0;
  }
  function pass(mat, target) { quad.material = mat; renderer.setRenderTarget(target); renderer.render(qs, cam); }
  return {
    get mode() { return mode; },
    set mode(m) { if (!GFX_MODES.includes(m)) return; mode = m; try { localStorage.setItem(KEY, m); } catch (e) { /* settings are optional */ } },
    cycle() { this.mode = GFX_MODES[(GFX_MODES.indexOf(mode) + 1) % GFX_MODES.length]; return mode; },
    render(scene, camera) {
      if (mode === 'simple') { renderer.setRenderTarget(null); renderer.render(scene, camera); return; }
      fit();
      renderer.setRenderTarget(rt); renderer.render(scene, camera);
      brightM.uniforms.tSrc.value = rt.texture; pass(brightM, bA);
      for (let i = 0; i < 2; i++) {
        blurM.uniforms.tSrc.value = bA.texture; blurM.uniforms.uDir.value.set(1.5 / bA.width, 0); pass(blurM, bB);
        blurM.uniforms.tSrc.value = bB.texture; blurM.uniforms.uDir.value.set(0, 1.5 / bA.height); pass(blurM, bA);
      }
      pass(finalM, null);
    },
  };
}
