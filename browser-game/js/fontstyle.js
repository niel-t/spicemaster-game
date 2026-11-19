// Lettertype setting: "Klassiek" keeps Bungee / Rubik / pixel fonts, "Aero" swaps every one of them for the
// Frutiger Aero pair used by Kaasdows XL, the balloons and Shooki's cards (Selawik for text, Nunito for display).
// The swap re-declares the old family names, so every inline style, injected stylesheet and canvas sign follows
// without touching the modules. size-adjust keeps the pixel fonts' replacements roughly the same size on screen.
const KEY = 'sme-fonts';
const F = 'assets/fonts/';
const sel = (fam, adj) => [['selawkl', 300], ['selawk', 400], ['selawksb', 600], ['selawkb', 700]]
  .map(([f, w]) => `@font-face{font-family:"${fam}";src:url("${F}${f}.woff2") format("woff2");font-weight:${w};font-display:swap;size-adjust:${adj}%}`).join('');
const nun = (fam, w, adj) => `@font-face{font-family:"${fam}";src:url("${F}nunito-var.woff2") format("woff2");font-weight:${w};font-display:swap;size-adjust:${adj}%}`;
const LCD = `@font-face{font-family:"Shmokia LCD";src:url("${F}vt323.woff2") format("woff2");font-display:swap}`; // the phone's screen stays a pixel LCD in both
const CLASSIC_CSS = LCD + `@font-face{font-family:"Bungee";src:url("${F}bungee.woff2") format("woff2");font-display:swap}@font-face{font-family:"Rubik";src:url("${F}rubik-var.woff2") format("woff2");font-weight:300 900;font-display:swap}@font-face{font-family:"VT323";src:url("${F}vt323.woff2") format("woff2");font-display:swap}@font-face{font-family:"Press Start 2P";src:url("${F}press-start-2p.woff2") format("woff2");font-display:swap}`;
const AERO_CSS = LCD + sel('Rubik', 104) + sel('VT323', 74) + nun('Bungee', 900, 104) + nun('Press Start 2P', 900, 128) + sel('Aero Text', 100) + nun('Aero Display', '200 1000', 100);

export const FONT_LABEL = { aero: 'AERO', classic: 'KLASSIEK' };
let mode = 'aero';
try { const v = localStorage.getItem(KEY); if (v === 'classic' || v === 'aero') mode = v; } catch (e) { /* storage blocked */ }
let el = null;
function apply() {
  if (!el) { el = document.createElement('style'); el.id = 'gamefonts'; document.head.appendChild(el); }
  el.textContent = mode === 'aero' ? AERO_CSS : CLASSIC_CSS;
  document.documentElement.classList.toggle('aero', mode === 'aero');
}
apply();
export const fonts = {
  get mode() { return mode; },
  set(m) { mode = m === 'classic' ? 'classic' : 'aero'; try { localStorage.setItem(KEY, mode); } catch (e) { /* storage blocked */ } apply(); if (fonts.onchange) fonts.onchange(mode); },
  cycle() { fonts.set(mode === 'aero' ? 'classic' : 'aero'); return mode; },
  onchange: null,
};
