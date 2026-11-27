// node tools/portraits/render-cast.cjs [outDir] [--sheet]: renders every cast portrait (cast.js) with its talking frames
// face_<key>.jpg (mouth closed), _m1 / _m2 (open), and _b versions with the eyes shut, 256 x 320, like faces.js.
// Needs Playwright (NODE_PATH or a local install).
const path = require('path'), fs = require('fs');
const { chromium } = require(process.env.PW || 'playwright');
const { cast, CAST } = require('./cast.js');
const OUT = process.argv[2] || path.join(__dirname, '../../browser-game/assets'), SHEET = process.argv.includes('--sheet');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 256, height: 320 } });
  fs.mkdirSync(OUT, { recursive: true });
  for (const key of Object.keys(CAST)) for (const m of [0, 1, 2]) for (const e of [0, 1]) {
    if (SHEET && (m || e)) continue;
    await p.setContent(`<html><body style="margin:0">${cast(key, m, e)}</body></html>`);
    await p.screenshot({ path: path.join(OUT, `face_${key}${m ? '_m' + m : ''}${e ? '_b' : ''}.jpg`), type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: 256, height: 320 } });
  }
  await b.close(); console.log('rendered', Object.keys(CAST).length);
})();
