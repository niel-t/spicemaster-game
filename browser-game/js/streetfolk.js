// Street folk (Tristan 2026-11-16): the passers-by of Kipkruidenkwartier as recognisable people instead of identical
// walkers. Each archetype has its own clothes, props in the hands or on the back, a way of holding them (arm poses layered on
// the motion-capture walk through the character's ps2 `extra` hook, see js/characters.js), its own pace, its own little
// habits on the pavement and its own [E] interaction. main.js still owns the walking lanes, blocking and knock-downs.
import * as THREE from '../vendor/three.module.min.js';

const X = [1, 0, 0], Y = [0, 1, 0];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const lerp = (a, b, k) => a + (b - a) * k;

// arm pose: lo = lowered from the A-pose, ax = raised forward (negative), ay = turned inward, el = elbow bend
const A = {
  push: { lo: 0.6, ax: -0.95, ay: 0.12, el: 0.55 },     // both hands on a pram / rollator handle
  pull: { lo: 0.62, ax: 0.42, ay: 0.05, el: 0.12 },     // a shopping trolley trailing behind
  ear: { lo: 0.95, ax: -0.55, ay: 0.95, el: 2.45 },     // phone at the ear
  text: { lo: 0.66, ax: -0.62, ay: 0.55, el: 1.55 },    // phone in front, reading
  bag: { lo: 0.3, ax: 0.05, ay: 0, el: 0.08 },          // carrying a heavy bag
  case: { lo: 0.36, ax: 0, ay: 0, el: 0.1 },            // briefcase
  leash: { lo: 0.5, ax: -0.42, ay: 0.08, el: 0.5 },     // dog on the lead
  hand: { lo: 0.22, ax: -0.12, ay: 0, el: 0.15 },       // holding a child's hand
  up: { lo: 0.16, ax: -0.55, ay: 0, el: 0.35 },         // a child reaching up to a parent
  photo: { lo: 0.7, ax: -1.08, ay: 0.62, el: 1.95 },    // camera at the eye, both hands
  wave: { lo: 0.4, ax: -2.6, ay: -0.1, el: 0.6 },       // arm up, waving
  pet: { lo: 0.64, ax: -0.85, ay: 0.2, el: 0.25 },      // reaching down to the dog
  jog: { lo: 0.62, ax: -0.25, ay: 0.3, el: 1.6 },       // jogging arms
  cup: { lo: 0.62, ax: -0.5, ay: 0.4, el: 1.45 },       // coffee in hand
  // the activists' picket (js/activists.js)
  horn: { lo: 0.92, ax: -1.25, ay: 0.55, el: 1.9 },     // megaphone at the mouth
  fist: { lo: 0.2, ax: -2.85, ay: -0.05, el: 0.25 },    // fist in the air
  pole: { lo: 0.58, ax: -0.85, ay: 0.32, el: 1.05 },    // both hands up a banner pole
  board: { lo: 0.62, ax: -0.75, ay: 0.62, el: 1.35 },   // clipboard held out at the chest
  offer: { lo: 0.5, ax: -1.25, ay: 0.12, el: 0.35 },    // a flyer held out at arm's length
};

// ---------- the archetypes ----------
// look: overrides for passerBy() in main.js; comp: what walks with them; v: pace; hands: [right, left] arm poses
export const ARCH = {
  buggy: {
    title: "Parent with buggy", names: ["Sanne", "Mo", "Ilse", "Jeroen", "Fatima"], col: "#e86aa0", v: 0.95, comp: "buggy",
    look: { pants: 0x3a3a48 }, hands: ["push", "push"], label: "Peek in the buggy",
    talk: ["Ze slaapt eindelijk. Als jij nu hard praat, ben jij vannacht aan de beurt.", "Kinderopvang kost meer dan mijn huur. Dus nu wandel ik. De hele dag.",
      "Drie uur geslapen. In totaal. Deze week.", "Ja, ze lijkt op mij. Vooral als ze boos is."],
    mutters: ["Ssst... ze slaapt.", "Nog één rondje, schatje.", "Waar is die speen nou?", "Stoep op, stoep af..."],
  },
  pram: {
    title: "Parent with pram", names: ["Lotte", "Ahmed", "Noor", "Bram"], col: "#6ab0e8", v: 0.9, comp: "pram",
    look: { pants: 0x2a3a5a }, hands: ["push", "push"], label: "Peek in the pram",
    talk: ["Twee weken oud. Ik weet niet meer welke dag het is.", "Hij huilt alleen als het stil is. Of als het lawaai is.", "Kraamzorg is weg. Nu moet ik het zelf weten. Help."],
    mutters: ["Zo, lekker wiegen.", "Bijna thuis, kleintje.", "Ademt hij nog? Ja. Oké."],
  },
  dog: {
    title: "Dog walker", names: ["Gerda", "Kees", "Yvonne", "Daan"], col: "#c8862c", v: 1.1, comp: "dog",
    look: {}, hands: ["leash", null], label: "Pet the dog",
    talk: ["Hij doet niks, hoor! Hij wil alleen spelen.", "Hij heet Bobbie. Hij is negen. Hij denkt dat hij een pup is.", "Poepzakjes, check. Koekjes, check. Geduld, op."],
    mutters: ["Bobbie, niet aan die lantaarnpaal!", "Hier! HIER! ...ook goed.", "Braaf. Brááf.", "Niet aan die frikandel, Bobbie!"],
  },
  kid: {
    title: "Parent and child", names: ["Marieke", "Hassan", "Petra", "Rik"], col: "#ffb03a", v: 1.0, comp: "kid",
    look: {}, hands: ["hand", null], label: "Wave at the kid",
    talk: ["Hij wil later kruidenhandelaar worden. Ik zeg: word maar tandarts.", "Op weg naar zwemles. Diploma A. Voor de derde keer.", "Ja, hij mag een ijsje. Ja, in november."],
    mutters: ["Hand vasthouden bij de weg!", "Niet in die plas springen...", "Nog vijf minuutjes, dan zijn we er."],
    kidTalk: ["Mama, is dat de kruidenman?", "Meneer, mag ik een kruidnootje?", "Jij ruikt naar kerrie!", "Ik heb een ballon!", "Papa, waarom is die meneer zo bezweet?"],
  },
  opa: {
    title: "Opa with rollator", names: ["Opa Kees", "Opa Henk", "Opa Wim", "Oma Riek"], col: "#8ab05a", v: 0.55, comp: "rollator",
    look: { grey: true, feltHat: 0x4a4038, belly: 0.4, pants: 0x5a4a3a, scale: 0.92 }, hands: ["push", "push"], label: "Help Opa",
    talk: ["Dank je, jongen. Hier, een pepermuntje. Niet allemaal tegelijk.", "In mijn tijd kostte een kilo peper een kwartje. En die was beter ook.",
      "Ik heb jouw vader nog gekend. Die had tenminste een net overhemd aan.", "Vroeger was alles beter. Behalve mijn heup. Die is nu van titanium."],
    mutters: ["Rustig aan, rustig aan...", "Die stoepranden, hè.", "Vroeger was alles beter.", "Waar heb ik mijn bril gelaten?"],
  },
  trolley: {
    title: "Oma with shopping trolley", names: ["Oma Truus", "Oma Bep", "Tante Zahra", "Oma Ans"], col: "#b05ac8", v: 0.7, comp: "trolley",
    look: { female: true, grey: true, bun: true, skirt: 0x4a3a5a, scale: 0.9, glasses: true }, hands: ["pull", null], label: "Ask about the market",
    talk: ["Naar de markt, jongen. Daar zijn de tomaten nog eerlijk.", "Bij de supermarkt betaal je voor het plastic. Op de markt voor de praatjes.",
      "Mijn trolley is ouder dan jij. En hij piept minder.", "Kaas van de markt. Echte. Niet van die plakjes in een bakje."],
    mutters: ["Hup, de stoep op.", "Die wieltjes, hè...", "Komkommer, prei, kaas... wat nog meer?"],
  },
  shopper: {
    title: "Shopper with bags", names: ["Ingrid", "Karim", "Mariska", "Joop"], col: "#e8a33d", v: 1.0, comp: null,
    look: {}, hands: ["bag", "bag"], label: "Ask about the prices", bags: true,
    talk: ["Vijftig euro. Twee tassen. En ik ben het wc-papier vergeten.", "Bonuskaart, app, zegeltjes... en nóg zes euro voor een pak koffie.",
      "Krimpflatie, noemen ze dat. Zelfde prijs, halve zak chips.", "Een komkommer van een euro! Een KOMKOMMER, meneer."],
    mutters: ["Zware tassen...", "Alles is duurder.", "Halve zak chips, hele prijs.", "Vergeten. Natuurlijk."],
  },
  business: {
    title: "Businessman on the phone", names: ["Gerard", "Mark", "Sandra", "Pieter"], col: "#3a7ad8", v: 1.25, comp: null,
    look: { suit: true, shirt: '#2a3040', pants: 0x2a3040, shoes: 0x1a1a1a }, hands: ["ear", "case"], label: "Interrupt the call",
    talk: ["Sorry, ik zit in een call. ...Nee Gerard, niet jij.", "Ik heb om drie uur een sync over de vorige sync.", "We moeten dit even offline oppakken. Jij en ik. Nooit."],
    mutters: ["Ja. Nee. Ja. Precies.", "Even sparren over de KPI's...", "Laten we dit parkeren.", "Ik stuur je een invite.", "We schalen op, Henk!"],
  },
  tourist: {
    title: "Tourist", names: ["Tourist", "Tourist", "Backpacker"], col: "#3ac8c0", v: 0.85, comp: null,
    look: { ballcap: 0xf2e8c8, shirt: '#38c8e8s', pants: 0xc8b89a, shoes: 0xe8e8e8 }, hands: [null, null], label: "Give directions", backpack: true, camera: true,
    talk: ["Excuse me, where is the windmill? ...Which one? There are many?", "So gezellig! I don't know what it means but I say it all the time.",
      "Is this the famous spice district? I smell it! Very... strong.", "One photo please? You look very local."],
    mutters: ["Wow, so many bikes!", "Ooh, a canal!", "Click! Beautiful.", "Where is the cheese museum?"],
  },
  courier: {
    title: "Food courier", names: ["Koerier", "Bezorger"], col: "#20b090", v: 1.6, comp: null,
    look: { shirt: '#20b090', pants: 0x1a1a22, ballcap: 0x20b090, shoes: 0x1a1a1a }, hands: ["text", null], label: "Ask about the order", box: true,
    talk: ["Bestelling voor... Eddy? Nee? Pff. Derde adres al.", "Vijf minuten zegt de app. De app fietst niet.", "Huisnummer 12B. Er IS geen 12B!"],
    mutters: ["Waar is 12B nou...", "Nog drie bestellingen.", "Vijf sterren, hè!", "De app zegt links. Links is water."],
  },
  jogger: {
    title: "Jogger", names: ["Jogger", "Hardloper"], col: "#ff5a8a", v: 3.0, comp: null,
    look: { shirt: '#ff5a8a', pants: 0x1a1a22, shoes: 0xf2f2f2, belly: 0, ballcap: 0x1a1a22 }, hands: ["jog", "jog"], label: "Say hi", jog: true,
    talk: ["Kan niet stoppen! Hartslagzone drie!", "Halve marathon in april! ...misschien een kwart.", "Strava kijkt mee! Doorlopen!"],
    mutters: ["Hijg... hijg...", "Nog twee kilometer!", "Uit de weg, PR-poging!", "Pfff... tegenwind..."],
  },
  teen: {
    title: "Teen on the phone", names: ["Jayden", "Sem", "Yasmina", "Liam"], col: "#a46bff", v: 0.9, comp: null,
    look: { shirt: '#2a2a30', pants: 0x2a3a5a, shoes: 0xe8e8e8, scale: 0.86 }, hands: ["text", "text"], label: "Say hi", head: 0.35,
    talk: ["Bro, wat. Ik film een TikTok.", "Ben jij die spice guy? Mijn neef koopt bij jou. Ofzo.", "Wacht, geen bereik. Hoe leefden mensen vroeger?"],
    mutters: ["Geen bereik hier, bro.", "Wollah, wat is dit.", "Haha, kijk dit dan.", "Twee procent batterij..."],
  },
};
// which archetype walks in which of the 16 pavement slots (4 and 13 are the police)
export const SLOTS = ["buggy", "business", "dog", "tourist", null, "opa", "shopper", "dog", "kid", "jogger", "courier", "teen", "pram", null, "trolley", "business"];

export function createStreetFolk({ scene, lam, mat, box, beep }) {
  const tmp = new THREE.Vector3();

  // ---------- props ----------
  function phone() { const g = new THREE.Group(); box(0.075, 0.15, 0.014, mat.black, 0, 0, 0, g, false); const s = box(0.062, 0.12, 0.004, new THREE.MeshBasicMaterial({ color: 0x8ad8ff }), 0, 0, 0.009, g, false); s.name = 'screen'; return g; }
  function bag(col, food) {
    const g = new THREE.Group(), m = lam({ color: col });
    box(0.3, 0.34, 0.16, m, 0, -0.2, 0, g); box(0.31, 0.05, 0.17, lam({ color: 0x2a6ac8 }), 0, -0.1, 0, g, false);
    for (const x of [-0.08, 0.08]) box(0.02, 0.14, 0.02, m, x, 0.02, 0, g, false);
    if (food) { const leek = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.42, 6), lam({ color: 0xe8f0d0 })); leek.position.set(-0.07, 0.0, 0.02); leek.rotation.z = 0.25; g.add(leek);
      const top = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 5), lam({ color: 0x3a8a3a })); top.position.set(-0.12, 0.25, 0.02); top.rotation.z = 0.25; g.add(top);
      const loaf = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.3, 3, 6), lam({ color: 0xd89a4a })); loaf.position.set(0.08, 0.0, -0.02); loaf.rotation.z = -0.3; g.add(loaf); }
    return g;
  }
  function briefcase() { const g = new THREE.Group(), m = lam({ color: 0x4a2a14 }); box(0.4, 0.3, 0.09, m, 0, -0.2, 0, g); box(0.14, 0.03, 0.03, mat.black, 0, -0.03, 0, g, false); box(0.41, 0.02, 0.095, mat.gold, 0, -0.1, 0, g, false); return g; }
  function cup() { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.032, 0.13, 10), lam({ color: 0xf0eee8 })); c.position.y = 0.02; g.add(c); const l = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.02, 10), lam({ color: 0x3a2a1a })); l.position.y = 0.09; g.add(l); box(0.085, 0.04, 0.085, lam({ color: 0xa0602e }), 0, 0.02, 0, g, false); return g; }
  function camera() { const g = new THREE.Group(); box(0.15, 0.09, 0.07, mat.black, 0, 0, 0, g); const l = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.07, 10), mat.dark); l.rotation.x = Math.PI / 2; l.position.set(0, 0, 0.06); g.add(l); box(0.03, 0.02, 0.01, mat.white, 0.05, 0.035, 0.036, g, false); return g; }
  function backpack(col) { const g = new THREE.Group(), m = lam({ color: col }); const b = box(0.36, 0.46, 0.2, m, 0, 0, 0, g); box(0.3, 0.16, 0.06, lam({ color: 0x2a2a30 }), 0, -0.1, -0.12, g, false); const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8), lam({ color: 0x3a6a3a })); roll.rotation.z = Math.PI / 2; roll.position.set(0, 0.28, 0); g.add(roll); b.name = 'pack'; return g; }
  function foodBox() {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d');
    x.fillStyle = '#20b090'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#fff'; x.font = '900 22px Arial Black, Arial'; x.textAlign = 'center';
    x.fillText('SNACK', 64, 58); x.fillText('RACE', 64, 84); x.beginPath(); x.arc(64, 26, 12, 0, 7); x.fill(); x.fillStyle = '#20b090'; x.beginPath(); x.moveTo(58, 20); x.lineTo(72, 26); x.lineTo(58, 32); x.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const side = lam({ map: t }), plain = lam({ color: 0x1a9a7a });
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.34), [side, side, plain, plain, side, side]); m.castShadow = true;
    const g = new THREE.Group(); g.add(m); return g;
  }
  function helium(col) { // a party balloon on a string, tied to a child's wrist
    const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), new THREE.MeshPhongMaterial({ color: col, shininess: 90, specular: 0xffffff })); b.scale.y = 1.15; g.add(b);
    const knot = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.05, 6), b.material); knot.position.y = -0.19; knot.rotation.x = Math.PI; g.add(knot);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xeeeeee }));
    scene.add(g); scene.add(line); return { g, line, vy: 0 };
  }

  // things walked alongside (main.js moves them; they are built facing +X with the handle at -X)
  function wheel(g, x, z, r = 0.11) { const w = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 5, 12), mat.black); w.position.set(x, r + 0.01, z); g.add(w); return w; }
  function makeBuggy(makeKid, seed) { // a sit-up buggy with a toddler in it, sun canopy and a bag on the handle
    const g = new THREE.Group(), c = [0x2a4a7a, 0xd84a7a, 0x2a6a4a, 0x3a3a40][seed % 4], cm = lam({ color: c });
    for (const [x, z] of [[0.3, 0.2], [0.3, -0.2], [-0.28, 0.22], [-0.28, -0.22]]) wheel(g, x, z, x > 0 ? 0.09 : 0.12);
    for (const z of [-0.2, 0.2]) { box(0.04, 0.04, 0.04, mat.dark, 0, 0, 0, g, false); const t = box(0.75, 0.03, 0.03, mat.dark, 0.0, 0.42, z, g, false); t.rotation.z = -0.55; }
    box(0.34, 0.05, 0.36, cm, 0.1, 0.36, 0, g); const back = box(0.06, 0.42, 0.36, cm, -0.08, 0.56, 0, g); back.rotation.z = 0.25;
    box(0.04, 0.04, 0.46, mat.dark, -0.34, 0.86, 0, g, false); // handle
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: c, side: THREE.DoubleSide })); hood.position.set(-0.04, 0.78, 0); hood.rotation.z = 0.75; hood.scale.set(1, 0.7, 0.85); g.add(hood);
    const nappy = bag(0xe8d8b0, false); nappy.scale.setScalar(0.7); nappy.position.set(-0.36, 0.84, 0.18); g.add(nappy);
    const kid = makeKid(); kid.userData.seated = true; kid.scale.setScalar(0.5); kid.position.set(0.02, 0.32, 0); kid.rotation.y = Math.PI / 2; g.add(kid);
    g.userData.kid = kid;
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    scene.add(g); return g;
  }
  function makePram(seed) { // a deep pram: a baby in a bonnet under a blanket, a rattle on a string
    const g = new THREE.Group(), c = [0xe8d8b0, 0x2a4a7a, 0x8a9aa8, 0x6a8a6a][seed % 4], cm = lam({ color: c });
    for (const [x, z] of [[0.28, 0.22], [0.28, -0.22], [-0.25, 0.22], [-0.25, -0.22]]) wheel(g, x, z, 0.15);
    box(0.62, 0.05, 0.4, mat.dark, 0, 0.3, 0, g, false);
    box(0.64, 0.3, 0.42, cm, 0.02, 0.52, 0, g);
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: c, side: THREE.DoubleSide })); hood.position.set(-0.12, 0.66, 0); hood.rotation.z = 0.5; g.add(hood);
    const blanket = box(0.4, 0.05, 0.38, lam({ color: [0xf2b8c8, 0xb8d8f2, 0xf2e8a0][seed % 3] }), 0.14, 0.68, 0, g, false);
    const baby = new THREE.Group(); baby.position.set(-0.08, 0.72, 0); g.add(baby);
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), lam({ color: [0xf4d2bc, 0xc8885e, 0xe0a882][seed % 3] })); baby.add(face);
    const bonnet = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8, Math.PI / 2, Math.PI, 0, Math.PI * 0.6), lam({ color: 0xffffff, side: THREE.DoubleSide })); bonnet.rotation.z = Math.PI / 2; bonnet.rotation.y = Math.PI / 2; baby.add(bonnet);
    const dummy = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.008, 4, 8), lam({ color: 0x3ab0e8 })); dummy.position.set(0.07, 0, 0); dummy.rotation.y = Math.PI / 2; baby.add(dummy);
    const rattle = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), lam({ color: 0xffd23a })); rattle.position.set(0.12, 0.86, 0); g.add(rattle);
    box(0.004, 0.18, 0.004, mat.white, 0.12, 0.95, 0, g, false);
    box(0.04, 0.5, 0.04, mat.dark, -0.42, 0.62, 0, g, false).rotation.z = 0.5; box(0.04, 0.04, 0.42, mat.dark, -0.52, 0.84, 0, g, false);
    g.userData.baby = baby; g.userData.rattle = rattle; g.userData.blanket = blanket;
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    scene.add(g); return g;
  }
  function makeRollator() { // rollator: four wheels, brakes, a seat and a basket with groceries
    const g = new THREE.Group(), red = lam({ color: 0xb8202a });
    for (const [x, z] of [[0.24, 0.24], [0.24, -0.24], [-0.24, 0.26], [-0.24, -0.26]]) wheel(g, x, z, 0.09);
    for (const z of [-0.24, 0.24]) { const f = box(0.04, 0.85, 0.035, red, 0.1, 0.5, z, g, false); f.rotation.z = 0.32; const r = box(0.035, 0.85, 0.035, red, -0.22, 0.5, z, g, false); r.rotation.z = -0.05; box(0.1, 0.04, 0.05, mat.black, -0.26, 0.92, z, g, false); }
    box(0.36, 0.03, 0.48, mat.black, -0.02, 0.56, 0, g);
    const basket = box(0.26, 0.16, 0.36, lam({ color: 0x2a2a30 }), 0.14, 0.4, 0, g, false);
    const loaf = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.2, 3, 6), lam({ color: 0xd89a4a })); loaf.rotation.x = Math.PI / 2; loaf.position.set(0.14, 0.5, 0.04); g.add(loaf);
    const milk = box(0.06, 0.14, 0.06, lam({ color: 0xf0f0f0 }), 0.18, 0.52, -0.1, g, false);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    scene.add(g); return g;
  }
  function makeTrolley() { // the tartan "boodschappentrolley", pulled behind: handle at +X so it trails the walker
    const g = new THREE.Group();
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    x.fillStyle = '#c8303a'; x.fillRect(0, 0, 64, 64); x.fillStyle = 'rgba(30,60,120,.6)'; for (let i = 0; i < 64; i += 16) { x.fillRect(i, 0, 7, 64); x.fillRect(0, i, 64, 7); }
    x.fillStyle = 'rgba(240,200,60,.7)'; for (let i = 5; i < 64; i += 16) { x.fillRect(i, 0, 2, 64); x.fillRect(0, i, 64, 2); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2);
    const bagM = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.5, 12), lam({ map: t })); bagM.position.set(0.02, 0.42, 0); bagM.rotation.z = -0.35; g.add(bagM);
    for (const z of [-0.13, 0.13]) wheel(g, -0.06, z, 0.09);
    const rod = box(0.03, 0.85, 0.03, mat.steel, 0.16, 0.55, 0, g, false); rod.rotation.z = -0.4;
    box(0.04, 0.04, 0.2, mat.black, 0.33, 0.95, 0, g, false);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 12), lam({ color: 0x1a2a4a })); lid.position.set(0.11, 0.66, 0); lid.rotation.z = -0.35; g.add(lid);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    scene.add(g); return g;
  }

  // ---------- poses: layered over the mocap walk ----------
  function install(p) {
    const u = p.userData; if (!u.ps2) return;
    u.ps2.extra = (R, rot, lower, hinge) => {
      const f = u.folk; if (!f || u.down > 0 || Math.abs(u.body.rotation.x) > 1) return;
      const tp = f.tmp && f.tmp.t > 0 ? f.tmp : null;
      for (const s of [-1, 1]) {
        const k = s < 0 ? 0 : 1, P = (tp && tp.hands[k] !== undefined ? A[tp.hands[k]] : null) || A[f.hands[k]];
        if (!P) continue;
        const nm = s > 0 ? 'L' : 'R', up = 'uarm' + nm, fa = 'farm' + nm;
        const swing = f.moving && P === A.jog ? Math.sin(u.phase * 0.95 + (s > 0 ? Math.PI : 0)) * 0.55 : 0;
        const wave = P === A.wave ? Math.sin(performance.now() / 120) * 0.35 : 0;
        delete R[up]; delete R[fa]; delete R['hand' + nm];
        lower(s, P.lo + wave * 0.4); rot(up, X, P.ax + swing); rot(up, Y, -s * P.ay); rot(fa, hinge(s), P.el + Math.max(0, -swing) * 0.3);
      }
      const hd = (tp && tp.head !== undefined ? tp.head : f.head) || 0;
      if (hd) rot('head', X, hd);
    };
  }
  const hand = (p, k) => p.userData.arms[k];
  function hold(p, k, obj, x = 0, y = -0.7, z = 0.06) { obj.position.set(x, y, z); hand(p, k).add(obj); return obj; }
  function onBack(p, obj, y = 1.28, z = -0.24) { obj.position.set(0, y, z); p.userData.body.add(obj); return obj; }

  // dress a walker for its archetype: props, poses, companion
  function dress(p, id, i, deps) {
    const a = ARCH[id], u = p.userData;
    u.folk = { id, a, name: pick(a.names), hands: a.hands.slice(), head: a.head || 0, tmp: null, moving: false, habitT: 4 + Math.random() * 8, props: {} };
    install(p);
    const pr = u.folk.props;
    if (a.bags) { hold(p, 0, bag(0xf2f2ee, true)); hold(p, 1, bag(0xf2f2ee, false)); }
    if (id === 'business') { pr.phone = hold(p, 0, phone(), 0, -0.66, 0.06); pr.phone.rotation.set(0, 0, 0); hold(p, 1, briefcase()); }
    if (id === 'courier') { onBack(p, foodBox(), 1.3, -0.3); pr.phone = hold(p, 0, phone(), 0, -0.68, 0.07); pr.phone.rotation.x = -0.6; }
    if (id === 'teen') { pr.phone = hold(p, 0, phone(), 0.04, -0.68, 0.07); pr.phone.rotation.set(-0.7, 0, Math.PI / 2); }
    if (id === 'tourist') { onBack(p, backpack(0xe86a1a)); pr.camera = camera(); pr.camera.position.set(0, 1.28, 0.17); u.body.add(pr.camera); }
    if (id === 'jogger') { const bt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 8), lam({ color: 0x3ab0e8 })); hold(p, 1, bt, 0, -0.68, 0.06); }
    // the companion that walks with them (main.js keeps it alongside)
    let comp = null;
    if (a.comp === 'buggy') comp = { type: 'stroller', obj: makeBuggy(() => deps.kid(i + 70), i), ahead: 0.8, off: 0 };
    if (a.comp === 'pram') comp = { type: 'stroller', obj: makePram(i), ahead: 0.75, off: 0 };
    if (a.comp === 'rollator') comp = { type: 'stroller', obj: makeRollator(), ahead: 0.55, off: 0 };
    if (a.comp === 'trolley') comp = { type: 'stroller', obj: makeTrolley(), ahead: -0.7, off: 0 };
    if (a.comp === 'dog') comp = deps.dog(i);
    if (a.comp === 'kid') {
      const k = deps.kid(i + 50); comp = { type: 'kid', obj: k, ahead: 0.05, off: 0.5 };
      k.userData.folk = { id: 'child', a: { hands: [null, null] }, name: 'Kind', hands: [null, null], tmp: null, moving: false };
      install(k);
      if (i % 2 === 0) { comp.balloon = helium([0xff3a5a, 0x3a8aff, 0xffd23a, 0x3ac860][i % 4]); }
    }
    return comp;
  }

  // per frame, after main.js has moved the walker and its companion
  function update(w, dt, moving, ctx) {
    const u = w.userData, f = u.folk; if (!f) return;
    f.moving = moving;
    if (f.tmp && f.tmp.t > 0) { f.tmp.t -= dt; if (f.tmp.t <= 0) f.tmp = null; }
    const wk = u.walk, cp = wk && wk.comp;
    // which hand holds the child: the one on the child's side (companions walk on the kerb side)
    if (cp && cp.type === 'kid') {
      const kidLeft = (wk.side === 'N' ? 1 : -1) * wk.dir < 0, kf = cp.obj.userData.folk;
      f.hands = kidLeft ? [null, 'hand'] : ['hand', null];
      if (kf) { kf.moving = moving; kf.hands = kidLeft ? ['up', null] : [null, 'up']; if (kf.tmp && kf.tmp.t > 0) { kf.tmp.t -= dt; if (kf.tmp.t <= 0) kf.tmp = null; } }
      if (cp.balloon) { // bob on its string above the child's free hand
        const b = cp.balloon, kidHand = cp.obj.userData.arms[kidLeft ? 1 : 0]; kidHand.updateWorldMatrix(true, false);
        tmp.set(0, -0.7, 0.05).applyMatrix4(kidHand.matrixWorld);
        const t = performance.now() / 1000, tx = tmp.x - wk.dir * (moving ? 0.25 : 0.05) + Math.sin(t * 1.3 + w.id) * 0.06, ty = tmp.y + 0.95, tz = tmp.z + Math.cos(t * 1.1) * 0.06;
        b.g.position.x += (tx - b.g.position.x) * Math.min(1, dt * 4); b.g.position.y += (ty - b.g.position.y) * Math.min(1, dt * 6); b.g.position.z += (tz - b.g.position.z) * Math.min(1, dt * 4);
        b.g.rotation.z = (b.g.position.x - tmp.x) * -0.6;
        const ap = b.line.geometry.attributes.position; ap.setXYZ(0, tmp.x, tmp.y, tmp.z); ap.setXYZ(1, b.g.position.x, b.g.position.y - 0.2, b.g.position.z); ap.needsUpdate = true;
        b.g.visible = b.line.visible = w.visible && cp.obj.visible;
      }
    }
    if (cp && cp.obj && cp.obj.userData.baby) { const bb = cp.obj.userData.baby, t = performance.now() / 1000; bb.rotation.x = Math.sin(t * 0.7 + w.id) * 0.15; cp.obj.userData.rattle.position.y = 0.86 + Math.sin(t * 3) * 0.02 * (moving ? 1 : 0.3); }
    if (cp && cp.type === 'dog') { const du = cp.obj.userData; if (du.hop > 0) { du.hop -= dt; cp.obj.position.y = Math.abs(Math.sin(du.hop * 14)) * 0.18; } else if (cp.obj.position.y) cp.obj.position.y = 0; }
    // habits: little things they do on their own
    f.habitT -= dt;
    if (f.habitT <= 0 && wk && !wk.flee && !(u.down > 0)) {
      f.habitT = 7 + Math.random() * 10;
      const near = ctx.dist < 12;
      if (f.id === 'tourist') { wk.wait = Math.max(wk.wait, 2.2); w.rotation.y += (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2; f.tmp = { t: 2.0, hands: ['photo', 'photo'] }; moveCamera(w, true);
        setTimeout(() => { if (u.folk.tmp) { ctx.flash(w); if (near) beep(1800, 0.05, 'square', 0.02); } }, 900); setTimeout(() => moveCamera(w, false), 2000); }
      else if (f.id === 'dog' && cp) { wk.wait = Math.max(wk.wait, 2.5); cp.obj.userData.sniff = 2.5; if (near && Math.random() < 0.6) ctx.bubble(w, pick(["Bobbie, kom nou!", "Ja, ruik maar even...", "Niet plassen tegen die fiets!"]), f.a.col, f.name); }
      else if (f.id === 'kid' && cp && near && Math.random() < 0.7) ctx.bubble(cp.obj, pick(f.a.kidTalk), f.a.col, 'Kind');
      else if (f.id === 'business' && near && Math.random() < 0.7) ctx.bubble(w, pick(f.a.mutters), f.a.col, f.name);
      else if (f.id === 'teen' && Math.random() < 0.5) { f.tmp = { t: 1.6, hands: ['text', 'text'], head: 0.1 }; if (near) ctx.bubble(w, pick(["Haha, kijk dit dan.", "Selfie!", "Bro, geen bereik."]), f.a.col, f.name); }
      else if (f.id === 'buggy' && cp && near && Math.random() < 0.5) ctx.bubble(cp.obj.userData.kid || w, pick(["Mama! Koekje!", "Brrrm brrrm!", "Wil eruit!", "Eend! EEND!"]), f.a.col, 'Peuter');
    }
    if (cp && cp.type === 'dog') { const du = cp.obj.userData; if (du.sniff > 0) { du.sniff -= dt; cp.obj.rotation.z = -0.18; } else cp.obj.rotation.z = 0; }
  }
  function moveCamera(w, up) { // the tourist lifts the camera from the chest to the eye
    const pr = w.userData.folk.props, c = pr.camera; if (!c) return;
    if (up) hold(w, 0, c, 0.1, -0.7, 0.1); else { c.position.set(0, 1.28, 0.17); c.rotation.set(0, 0, 0); w.userData.body.add(c); }
  }

  // [E] on a walker: the archetype's own little scene. Returns nothing; shows balloons through ctx.
  function interact(w, ctx) {
    const u = w.userData, f = u.folk, a = f.a, wk = u.walk, cp = wk.comp;
    wk.wait = Math.max(wk.wait, 3.5);
    const line = pick(a.talk);
    switch (f.id) {
      case 'buggy': ctx.bubble(cp.obj.userData.kid || w, pick(["Hihi!", "Ga-ga!", "Wie ben jij?", "Neus! NEUS!"]), a.col, 'Peuter'); setTimeout(() => ctx.bubble(w, line, a.col, f.name), 900); break;
      case 'pram': { const cry = Math.random() < 0.4; ctx.bubble(cp.obj, cry ? 'WAAAAH!' : 'Hihi...', a.col, 'Baby'); if (cry) { beep(520, 0.4, 'sawtooth', 0.025); setTimeout(() => ctx.bubble(w, 'Nee hè. Hij sliep net. Bedankt, hoor.', a.col, f.name), 900); } else setTimeout(() => ctx.bubble(w, line, a.col, f.name), 900); break; }
      case 'dog': cp.obj.userData.hop = 0.9; ctx.bubble(cp.obj, pick(['WOEF!', 'Waf waf!', '*kwispel kwispel*']), a.col, 'Bobbie'); beep(330, 0.08, 'square', 0.04); setTimeout(() => beep(300, 0.1, 'square', 0.04), 140);
        ctx.facePlayer(cp.obj, true); setTimeout(() => ctx.bubble(w, line, a.col, f.name), 1000); break;
      case 'kid': { const kf = cp.obj.userData.folk; if (kf) kf.tmp = { t: 2.4, hands: ['wave', 'wave'] }; ctx.facePlayer(cp.obj); ctx.bubble(cp.obj, pick(a.kidTalk), a.col, 'Kind'); setTimeout(() => ctx.bubble(w, line, a.col, f.name), 1200); break; }
      case 'opa': ctx.bubble(w, line, a.col, f.name); if (line.includes('pepermuntje')) setTimeout(() => ctx.toast('PEPERMUNTJE', `${f.name} slips you a peppermint. Fresh breath for the next deal.`, 2.6), 600); break;
      case 'tourist': f.tmp = { t: 1.8, hands: ['photo', 'photo'] }; moveCamera(w, true); setTimeout(() => { ctx.flash(w, true); beep(1800, 0.05, 'square', 0.03); }, 700); setTimeout(() => moveCamera(w, false), 1800);
        ctx.bubble(w, line, a.col, f.name); break;
      case 'jogger': wk.wait = 1.6; wk.inPlace = 1.6; ctx.bubble(w, line, a.col, f.name); break;
      case 'business': ctx.bubble(w, line, a.col, f.name); break; // never lets go of the phone or the briefcase
      case 'courier': f.tmp = { t: 2.5, hands: ['text', null], head: 0.3 }; ctx.bubble(w, line, a.col, f.name); break;
      case 'teen': f.tmp = { t: 2.5, hands: ['text', 'text'], head: 0.05 }; ctx.bubble(w, line, a.col, f.name); break;
      default: ctx.bubble(w, line, a.col, f.name);
    }
  }
  function mutter(w) { const f = w.userData.folk; return f ? { text: pick(f.a.mutters), col: f.a.col, name: '' } : null; }
  // pose(p, hands): give any person the street-folk arm poses (the activists' picket uses it); change p.userData.folk.hands later
  function pose(p, hands) { const u = p.userData; u.folk = { id: 'pose', a: { hands }, name: '', hands: hands.slice(), head: 0, tmp: null, moving: false, props: {} }; install(p); return u.folk; }
  return { dress, update, interact, mutter, pose, hold, ARCH, SLOTS };
}
