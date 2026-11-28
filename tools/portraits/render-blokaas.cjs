// node tools/portraits/render-blokaas.cjs: renders the Hans and Conny persiflage portraits (blokaas-caricature.js) to
// browser-game/assets/face_hans.jpg / face_conny.jpg. Needs Playwright (PW or NODE_PATH).
const path = require('path');
const { chromium } = require(process.env.PW || 'playwright');
const { hans, conny } = require('./blokaas-caricature.js');
const OUT = process.argv[2] || path.join(__dirname, '../../browser-game/assets');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 256, height: 320 } });
  for (const [key, f] of [['hans', hans], ['conny', conny]]) for (const e of [0]) {
    await p.setContent(`<html><body style="margin:0">${f(e)}</body></html>`);
    await p.screenshot({ path: path.join(OUT, `face_${key}${e ? '_b' : ''}.jpg`), type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 256, height: 320 } });
  }
  await b.close(); console.log('rendered hans, conny');
})();
