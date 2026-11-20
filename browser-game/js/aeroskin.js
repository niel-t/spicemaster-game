// Aero skin: the rest of the Frutiger Aero look, on top of the fonts and panels in index.html's html.aero block.
// Everything here only applies while fontstyle.js has set html.aero (the "Aero" setting); Klassiek is untouched.
// Glass HUD plates, gel threat pips and boss bar, glossy touch buttons, warm saffron scene fades and drifting
// bubbles on the title, all in the spice-trader palette (saffron, turmeric, paprika, cumin, cardamom, cream).
const A = 'html.aero';
const glass = `background:linear-gradient(180deg,rgba(120,80,48,.62) 0%,rgba(70,42,22,.66) 48%,rgba(42,25,13,.74) 52%,rgba(54,33,18,.7) 100%);border:1px solid rgba(255,226,170,.5);box-shadow:inset 0 1px 0 rgba(255,255,255,.38),inset 0 -1px 0 rgba(0,0,0,.25),0 6px 18px rgba(20,10,4,.45);-webkit-backdrop-filter:blur(8px) saturate(1.2);backdrop-filter:blur(8px) saturate(1.2)`;
const sheen = `content:'';position:absolute;left:1px;right:1px;top:1px;height:48%;border-radius:inherit;border-bottom-left-radius:40% 10px;border-bottom-right-radius:40% 10px;background:linear-gradient(180deg,rgba(255,255,255,.26),rgba(255,255,255,.05));pointer-events:none`;
const gelSaffron = 'linear-gradient(180deg,#fff4cc 0%,#ffd473 38%,#f2a830 52%,#d9821a 80%,#f5b445 100%)';
const gelPaprika = 'linear-gradient(180deg,#ffd0b0 0%,#ff9a5a 38%,#e8661e 52%,#b8460e 80%,#e8742a 100%)';
const gelChili = 'linear-gradient(180deg,#ffc4bc 0%,#ff6a5a 38%,#e02a2a 52%,#9a0f14 80%,#d0302a 100%)';
const gelCardamom = 'linear-gradient(180deg,#f2ffd2 0%,#cfe68a 38%,#a3c450 52%,#74963a 80%,#a9c46a 100%)';
// soft rings of light that drift upwards: the Aero "bubbles"
const bubble = (x, y, r, a = 0.42) => `radial-gradient(circle at ${x} ${y},rgba(255,244,220,${a * 0.14}) 0,rgba(255,255,255,${a * 0.04}) ${r * 0.72}px,rgba(255,250,235,${a}) ${r * 0.86}px,rgba(255,240,210,${a * 0.25}) ${r * 0.95}px,rgba(255,255,255,0) ${r}px)`;
const shine = (x, y, r) => `radial-gradient(circle at ${x} ${y},rgba(255,255,255,.5) 0,rgba(255,255,255,0) ${r}px)`;
const soft = (a) => a.replace(/rgba\(([^)]*),([.\d]+)\)/g, (m, c, o) => `rgba(${c},${(+o * 0.45).toFixed(3)})`);
const bubbles = [bubble('12%', '78%', 46), shine('11.2%', '75%', 10), bubble('86%', '64%', 64, 0.36), shine('85%', '60%', 14), bubble('22%', '24%', 26, 0.5), bubble('70%', '18%', 34, 0.4), shine('69.4%', '16%', 8), bubble('48%', '92%', 22, 0.5), bubble('93%', '30%', 18, 0.5), bubble('5%', '45%', 30, 0.35)].join(',');

const CSS = `
/* ---- street HUD: area pill, objective card, money plate, help strip ---- */
${A} #area{padding:3px 12px 4px;margin-left:-12px;border-radius:999px;font-size:13px;${glass}}
${A} #objective{padding:9px 14px 10px;margin-left:-14px;top:50px;border-radius:14px;${glass};background:linear-gradient(180deg,rgba(110,72,42,.46),rgba(50,30,16,.52) 50%,rgba(34,20,10,.6) 51%,rgba(46,28,15,.56))}
${A} #objective::before{${sheen}}
${A} #objective:empty{display:none}
${A} #help{padding:5px 14px;border-radius:999px;background:linear-gradient(180deg,rgba(80,50,28,.45),rgba(30,18,10,.55) 50%,rgba(20,12,6,.62) 51%);border:1px solid rgba(255,226,170,.25);box-shadow:inset 0 1px 0 rgba(255,255,255,.2);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#aeroMoney{position:fixed;pointer-events:none;display:none;border-radius:999px;${glass}}
#aeroMoney::before{${sheen}}
${A} #income{color:#cfe68a}
${A} #kit{color:#ffe0a8}
@media (max-width:820px),(max-height:500px){
  ${A} #area{font-size:10px;padding:2px 9px 3px;margin-left:-9px}
  ${A} #objective{top:calc(32px + env(safe-area-inset-top));padding:6px 10px 7px;margin-left:-10px;border-radius:11px}
}
/* ---- shop backdrop: warm instead of the old purple ---- */
${A} #shop{background:radial-gradient(ellipse at 50% 28%,rgba(150,90,40,.55),rgba(42,22,10,.9) 70%)}
/* ---- mission HUD ---- */
${A} #nvHud{padding:10px 14px 10px;border-radius:16px;${glass}}
${A} #nvHud::before{${sheen}}
${A} #nvHud .hp{color:#ff4a50;text-shadow:0 1px 0 #6a0010,0 0 10px rgba(255,70,80,.55)}
${A} #nvHud .hp + .w > span{display:inline-block;padding:3px 9px 4px;margin:0 5px 3px 0;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.03) 50%,rgba(0,0,0,.16) 51%);border:1px solid rgba(255,226,170,.25);box-shadow:inset 0 1px 0 rgba(255,255,255,.2)}
${A} #nvScore{padding:8px 14px;border-radius:14px;${glass};z-index:6;top:84px}
${A} #nvScore .l{color:#ffb27a}
${A} #nvScore::before{${sheen}}
${A} #nvThreat{padding:5px 12px 6px 14px;border-radius:999px;${glass};font-size:9px}
${A} #nvThreat .pip{width:18px;height:9px;margin-left:5px;border-radius:999px;transform:none;vertical-align:-1px;background:linear-gradient(180deg,rgba(0,0,0,.45),rgba(255,255,255,.12));box-shadow:inset 0 1px 2px rgba(0,0,0,.5),0 1px 0 rgba(255,255,255,.15)}
${A} #nvThreat .pip.on1{background:${gelSaffron};box-shadow:inset 0 1px 0 rgba(255,255,255,.8),0 0 6px rgba(242,184,75,.6)}
${A} #nvThreat .pip.on2{background:${gelPaprika};box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 0 9px rgba(232,102,30,.8)}
${A} #nvThreat .pip.on3{background:${gelChili};box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 0 12px rgba(224,42,42,.9)}
${A} #nvBoss .n{display:inline-block;padding:3px 12px 4px;border-radius:999px;${glass}}
${A} #nvBoss .bar{height:14px;padding:3px;gap:2px;border:1px solid rgba(255,226,170,.75);border-radius:999px;background:linear-gradient(180deg,rgba(20,8,2,.85),rgba(60,28,10,.75));box-shadow:inset 0 2px 4px rgba(0,0,0,.6),0 0 0 3px rgba(255,255,255,.08),0 6px 14px rgba(0,0,0,.5)}
${A} #nvBoss .bar i{border-radius:6px;background:${gelSaffron};box-shadow:inset 0 1px 0 rgba(255,255,255,.75)}
${A} #nvBoss .bar i:first-child{border-radius:999px 6px 6px 999px}${A} #nvBoss .bar i:last-child{border-radius:6px 999px 999px 6px}
${A} #nvBoss.p2 .bar{border-color:rgba(255,160,150,.85);box-shadow:inset 0 2px 4px rgba(0,0,0,.6),0 0 0 3px rgba(255,60,60,.2),0 0 18px rgba(255,30,40,.7)}
${A} #nvBoss.p2 .bar i{background:${gelChili}}
${A} #nvReload{height:10px;outline:none;border:1px solid rgba(255,240,210,.7);border-radius:999px;background:linear-gradient(180deg,rgba(0,0,0,.5),rgba(255,255,255,.15));box-shadow:0 2px 6px rgba(0,0,0,.5)}
${A} #nvReload .g{background:${gelCardamom};border-radius:999px}${A} #nvReload .f{border-radius:999px 0 0 999px;background:rgba(232,102,30,.45)}
${A} #nvReload .m{width:3px;margin-left:-1.5px;border-radius:2px;box-shadow:0 0 4px #fff}
${A} #nvBanner{padding:16px 0 18px;background:linear-gradient(90deg,transparent,rgba(42,24,12,.55) 18%,rgba(42,24,12,.62) 50%,rgba(42,24,12,.55) 82%,transparent)}
${A} #nvBanner::before,${A} #nvBanner::after{content:'';position:absolute;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,226,170,.85),transparent)}
${A} #nvBanner::before{top:0}${A} #nvBanner::after{bottom:0}
${A} #nvScreen{background:${soft(bubbles)},radial-gradient(ellipse at 50% 32%,rgba(140,84,38,.5),rgba(24,12,5,.86) 72%);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
${A} #nvScreen .grade{filter:drop-shadow(0 0 18px rgba(255,200,90,.55)) drop-shadow(0 4px 6px rgba(60,20,6,.7))}
${A} #nvScreen .stats b{color:#cfe68a}
${A} #nvScan{opacity:.3}
${A} #nvInv .ic{border-radius:50%;background:radial-gradient(circle at 50% 28%,rgba(255,255,255,.4),rgba(255,255,255,.06) 46%,rgba(0,0,0,.25) 100%),#3a2414;box-shadow:inset 0 -3px 6px rgba(0,0,0,.35),0 2px 5px rgba(0,0,0,.4)}
${A} #nvInv{background:radial-gradient(ellipse at 50% 30%,rgba(120,70,30,.45),rgba(20,10,4,.84) 72%)}
@media (max-width:820px),(max-height:500px){${A} #nvThreat{font-size:7px;padding:3px 9px 4px 10px;left:auto;right:calc(174px + env(safe-area-inset-right));transform:none;top:calc(12px + env(safe-area-inset-top))}${A} #nvBoss{top:auto;bottom:calc(54px + env(safe-area-inset-bottom))}${A} #nvThreat .pip{width:12px;height:7px;margin-left:3px}${A} #nvHud{padding:7px 10px}${A} #nvScore{padding:6px 10px;top:calc(50px + env(safe-area-inset-top))}}
/* ---- drive HUD ---- */
${A} #drv .top{padding:9px 14px 11px;border-radius:14px;${glass}}
${A} #drv .top::before{${sheen}}
${A} #drv .bar{height:12px;border:1px solid rgba(255,240,210,.75);border-radius:999px;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(255,255,255,.12));box-shadow:inset 0 1px 3px rgba(0,0,0,.6);overflow:hidden}
${A} #drv .bar i{background:${gelCardamom};border-radius:999px;box-shadow:inset 0 1px 0 rgba(255,255,255,.7)}
${A} #drv canvas{border:2px solid rgba(255,226,170,.85);border-radius:14px;box-shadow:0 0 0 3px rgba(255,255,255,.12),0 8px 18px rgba(0,0,0,.5);opacity:.95}
${A} #drv .hint{left:50%;right:auto;transform:translateX(-50%);white-space:nowrap;padding:5px 16px;border-radius:999px;background:linear-gradient(180deg,rgba(80,50,28,.45),rgba(30,18,10,.55) 50%,rgba(20,12,6,.62) 51%);border:1px solid rgba(255,226,170,.25);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
${A} #drv .res table{border-collapse:separate;border-spacing:0 3px}
${A} #drv .res td{padding:3px 8px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02) 50%,rgba(0,0,0,.1) 51%)}
${A} #drv .res td:first-child{border-radius:8px 0 0 8px}${A} #drv .res td:last-child{border-radius:0 8px 8px 0}
${A} #drv .res .tot td{border-top:0;color:#cfe68a;background:linear-gradient(180deg,rgba(185,212,110,.25),rgba(185,212,110,.08) 50%,rgba(0,0,0,.1) 51%)}
@media (max-width:700px){${A} #drv .hint{font-size:12px;white-space:normal;width:86vw;text-align:center}}
@media (max-height:500px){${A} #drv .top{padding:6px 10px 8px}${A} #drv .route{font-size:14px}${A} #drv .stats{font-size:18px}${A} #drv .bar{width:130px}}
${A} body.touch #drv .hint{display:none}
/* ---- scene fades (mission, loods, woning): a warm saffron iris instead of a black cut ---- */
${A} .smeFade{background:radial-gradient(circle at 50% 46%,#fff0c8 0%,#f2b84b 22%,#c2601e 52%,#5a2410 80%,#24120a 100%) !important}
${A} .smeFade::after{content:'';position:absolute;inset:0;background:${bubbles};opacity:.7}
/* ---- touch controls: gel orbs and glass pills ---- */
${A} #touchUI .tb{border:1px solid rgba(255,244,220,.85);background:radial-gradient(circle at 50% 22%,rgba(255,248,225,.85) 0,rgba(255,220,140,.6) 28%,rgba(232,150,50,.55) 55%,rgba(122,46,26,.65) 100%);box-shadow:inset 0 -8px 12px rgba(60,20,6,.3),inset 0 2px 2px rgba(255,255,255,.7),0 4px 12px rgba(0,0,0,.4);color:#fff;text-shadow:0 1px 2px #5a2410,0 0 6px rgba(90,36,16,.6)}
${A} #touchUI .tb.down,${A} #touchUI .tp.down{background:radial-gradient(circle at 50% 22%,#fffaf0 0,#ffe08a 30%,#f2a830 60%,#b8600e 100%)}
${A} #touchUI .tb.active,${A} #touchUI .tp.active{background:radial-gradient(circle at 50% 22%,#f6ffe0 0,#d4ea96 30%,#9ab84a 62%,#4e6a1e 100%)}
${A} #touchUI .tp{border:1px solid rgba(255,226,170,.6);background:linear-gradient(180deg,rgba(120,80,48,.72),rgba(66,40,22,.78) 50%,rgba(40,24,13,.85) 51%,rgba(54,33,18,.8));box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 3px 8px rgba(0,0,0,.4);text-shadow:0 1px 2px #000}
${A} .tbase{border:1px solid rgba(255,240,210,.55);background:radial-gradient(circle at 50% 35%,rgba(255,255,255,.18),rgba(255,226,170,.06) 60%,rgba(0,0,0,.12));box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 4px 14px rgba(0,0,0,.3)}
${A} .tbase.ring{border-color:rgba(242,168,48,.75);box-shadow:0 0 0 14px rgba(242,168,48,.14)}
${A} #tzR.fire .tbase.ring{box-shadow:0 0 0 14px rgba(232,102,30,.42)}
${A} .tknob{background:radial-gradient(circle at 50% 28%,#fffaf0 0,#ffe7b0 34%,#e8a33d 72%,#9a4a16 100%);box-shadow:inset 0 -4px 6px rgba(80,30,8,.3),0 3px 10px rgba(0,0,0,.45)}
/* ---- title: bubbles drifting over the canal city ---- */
${A} #title::after{content:'';position:absolute;inset:-10% 0 0;z-index:0;pointer-events:none;background:${bubbles};background-size:100% 120vh;animation:aeroRise 30s linear infinite}
@keyframes aeroRise{from{background-position:0 0}to{background-position:0 -120vh}}
@media (prefers-reduced-motion:reduce){${A} #title::after{animation:none}}
`;

const st = document.createElement('style'); st.id = 'aeroskin'; st.textContent = CSS; document.head.appendChild(st);

// The money counter is glossy gradient-clipped text, so its glass pill has to be a separate plate behind it.
function plate() {
  const money = document.getElementById('money');
  if (!money) return;
  const p = document.createElement('div'); p.id = 'aeroMoney'; money.parentNode.insertBefore(p, document.querySelector('.hud') || money);
  let last = '';
  setInterval(() => {
    let key = 'none';
    if (document.documentElement.classList.contains('aero')) {
      const cs = getComputedStyle(money), r = money.getBoundingClientRect();
      if (cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && money.textContent.trim()) {
        const px = Math.round(r.height * 0.42), py = Math.round(r.height * 0.06);
        key = `${Math.round(r.left - px)},${Math.round(r.top - py)},${Math.round(r.width + px * 2)},${Math.round(r.height + py * 2)},${cs.opacity}`;
      }
    }
    if (key === last) return; last = key;
    if (key === 'none') { p.style.display = 'none'; return; }
    const [x, y, w, h, o] = key.split(',');
    Object.assign(p.style, { display: 'block', left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', opacity: o });
  }, 200);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', plate); else plate();
