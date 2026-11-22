// The activists (Tristan 2026-11-22): on some market days a little picket of left-wing activists sets up on the pavement of
// Kipkruidenkwartier. A banner between two poles, a megaphone, a folding table of flyers and one very keen canvasser with a
// clipboard who walks right up to Eddy. Eddy is not a fan. He can talk back in Dutch or in Hebrew, take a flyer, or walk on,
// and afterwards Freddy Sr., Shooki and Razim each have their own take on it.
// Satire of activist habits (the megaphone, the petition, the glossy flyer "for the planet", papa's credit card). Every group
// and slogan is made up, nobody real is named, and nobody is mocked for who they are.
//
// state.activists = { day, here, gi, last, n, said, due: { freddy, shooki, razim }, razimIn, seen }
import * as THREE from '../vendor/three.module.min.js';

const rnd = (a) => a[Math.floor(Math.random() * a.length)];
// Hebrew in a Latin line: the right-to-left isolate keeps the "!" and "?" on the correct end of the Hebrew words
const RLI = '⁧', PDI = '⁩';

// ---------- the groups (all fictional) ----------
const GROUPS = [
  { name: 'Comité Tegen Alles', tag: 'CTA', col: '#d8322a', ink: '#ffffff', slogan: 'TEGEN!', sub: '(waartegen volgt nog)',
    chants: ['TEGEN! TEGEN! TEGEN!', 'ALLES MOET ANDERS!', 'WAARTEGEN? MAAKT NIET UIT!'],
    pitch: ['Wij zijn tegen. Jij bent toch ook ergens tegen? Dan ben je één van ons!', 'Teken je even? Het is tegen het systeem. En tegen maandagen.'],
    flyer: '"Wij zijn tegen. Kom ook tegen! Elke dinsdag, behalve als het regent."' },
  { name: 'Actiegroep Tofu Nu', tag: 'ATN', col: '#4f9a2c', ink: '#fffbe0', slogan: 'KIPKRUIDEN = KIPPENLEED', sub: 'tofu heeft ook een mening',
    chants: ['KIP IS GEEN KRUID!', 'KIPKRUIDEN? NEE DANK JE!', 'TOFU! TOFU! TOFU!'],
    pitch: ['Weet jij wel wat kipkruiden met een kip doen? Ze maken hem LEKKER. Dat is het probleem!', 'Jij bent toch die kruidenman? Jouw paprika heeft bloed aan zijn handen. Nou ja, aan zijn zaadjes.'],
    flyer: '"Stop de kipkruidenindustrie! Ook kruiden hebben gevoelens. Waarschijnlijk."' },
  { name: 'Bakfietsbrigade', tag: 'BFB', col: '#2a72d0', ink: '#ffffff', slogan: 'OOFMOBIEL? OOF-NEE!', sub: 'bakfiets of niks',
    chants: ['HÉ HÉ, HO HO, DIE OOFMOBIEL MOET HO!', 'BAKFIETS! BAKFIETS!', 'BUS ERUIT, BAK ERIN!'],
    pitch: ['Jouw bestelbus stoot meer uit dan heel Friesland! Heb je weleens aan een bakfiets gedacht? Voor vijfhonderd kilo kruiden?', 'Is dat jouw busje? Met die tekst erop? Schaam je je niet?'],
    flyer: '"Elke bestelbus is er één te veel. Behalve die van ons biologische koffiekarretje."' },
  { name: 'Studenten voor Gratis Alles', tag: 'SGA', col: '#e39a16', ink: '#2a1a00', slogan: 'GRATIS KAPSALON VOOR IEDEREEN', sub: 'betaald door: iemand anders',
    chants: ['GRATIS! ALLES! NU!', 'WIE BETAALT? JIJ!', 'KAPSALON IS EEN MENSENRECHT!'],
    pitch: ['Teken je voor een gratis kapsalon voor iedereen? Jij betaalt hem wel even, jij hebt een bedrijf.', 'Ik zit in mijn negende studiejaar. Activisme ís mijn studie. Mijn vader betaalt het collegegeld, ik betaal de prijs.'],
    flyer: '"Iedereen recht op een gratis kapsalon! Betaald door: iemand anders. (Niet door ons.)"' },
  { name: 'Klimaatkoor Kaasland', tag: 'KLK', col: '#169a8e', ink: '#ffffff', slogan: 'FIETS OF JE BENT FOUT', sub: 'we zingen tot het stopt met regenen',
    chants: ['FIETS, FIETS, REVOLUTIE!', 'LA LA LA, KLIMAAT!', 'ZING MEE OF ZWIJG!'],
    pitch: ['Zing je mee? Het is in C-mineur. Voor het klimaat. Het klimaat houdt van C-mineur.', 'Wist je dat jouw kruiden met een DIESELBUS worden bezorgd? Ik kwam hier met het vliegtuig, maar dat is iets anders.'],
    flyer: '"Zing mee voor het klimaat! Gedrukt op glanzend papier. Beide kanten. In kleur."' },
  { name: 'Jongeren Tegen Pittig', tag: 'JTP', col: '#b8389a', ink: '#ffffff', slogan: 'SAMBAL IS AGRESSIE', sub: 'mild is de toekomst',
    chants: ['MILD! MILDER! MILDST!', 'SAMBAL? SCHANDAAL!', 'PEPER IS GEWELD!'],
    pitch: ['Verkoop jij pittige kruiden? Weet je wel hoeveel tongen jij pijn doet? Elke dag?', 'Wij willen een veilige ruimte. Zonder cayennepeper. Je ruikt naar cayennepeper.'],
    flyer: '"Pittig eten is micro-agressie tegen de tong. Teken nu, voor het te laat (en te heet) is."' },
];
// shouted by everybody, whatever the group is against today
const CHANTS = ['WAT WILLEN WE? IETS!', 'WANNEER? NU!', 'WIJ ZIJN BOOS! WAAROM? DAAROM!', 'TEKEN! TEKEN! TEKEN!', 'HÉ HÉ, HO HO!', 'SOLIDARITEIT!'];
const PITCH = [
  'Hoi! Heb je even een momentje voor de planeet?',
  'Wil je tekenen? Het is tegen... eh... alles wat slecht is.',
  'Check je privilege, kruidenbaas.',
  'Eén handtekening maar! Of twee. En je mailadres. En je IBAN.',
  'Ik doe dit niet voor mezelf, hoor. Ik doe dit voor mijn volgers.',
];
const COME_BACK = ['Hé! Kruidenbaas! Even een momentje!', 'Wacht! Je bent je handtekening vergeten!', 'Niet weglopen! Weglopen is ook een keuze!', 'Ik loop gewoon mee, hoor!'];
const GIVE_UP = ['Dan niet! Fijne dag nog! ...Niet echt!', 'Ik schrijf hier een thread over!', 'Typisch. Typisch!', 'Jij staat op de lijst, hoor!'];
// Eddy's Dutch answers
const NL = [
  'Ga lekker werken, joh. Ik heb een zaak te runnen.',
  'Met een megafoon wordt het niet waarder, hè.',
  'Wie betaalt dat spandoek eigenlijk? Papa?',
  'Ik teken alleen bonnetjes.',
  'Doe normaal, man. Het is dinsdag.',
  'Kipkruiden zijn hartstikke vegan. Het zijn KRUIDEN.',
  'Jullie zijn tegen alles. Behalve tegen zakgeld.',
  'Zoek een baan, dan pak ik een flyer.',
  'Mijn bus rijdt op paprika en vakmanschap.',
  'Zo, en wie heeft dat glanzende papier gedrukt? Het klimaat zeker?',
];
// Eddy's Hebrew answers: [Hebrew, transliteration, what it means]
const HE = [
  ['יאללה, תזוזו!', 'yalla, tazuzu!', 'kom op, aan de kant!'],
  ['די כבר עם השטויות!', 'dai kvar im hashtuyot!', 'genoeg met die onzin!'],
  ['לכו לעבוד!', "lekhu la'avod!", 'ga werken!'],
  ['אין לי כוח אליכם.', "ein li koach aleikhem.", 'ik heb geen puf voor jullie.'],
  ['על מי אתם עובדים?', 'al mi atem ovdim?', 'wie denken jullie voor de gek te houden?'],
  ["סעו הביתה, חבר'ה.", "sa'u habayta, chevre.", 'ga naar huis, jongens.'],
  ['נו באמת!', "nu, be'emet!", 'ach, kom nou!'],
  ['סבבה. ועכשיו זוזו.', "sababa. ve'akhshav zuzu.", 'prima. En nu opzij.'],
  ['חלאס, אני עסוק!', 'khalas, ani asuk!', 'klaar, ik heb het druk!'],
  ['ממתי אתם מבינים בתבלינים?', 'mimatai atem mevinim betavlinim?', 'sinds wanneer weten jullie iets van kruiden?'],
];
const AFTER_NL = ['Dit is precies het probleem!', 'Wow. Echt. Ik ga hier een thread over schrijven.', 'Je bent gewoon bang voor verandering!', 'Ik voel me hier onveilig. Met mijn megafoon.', 'Ik ga dit melden. Bij wie? Bij iedereen.', 'Dat is jouw mening. Fout, maar jouw mening.'];
const AFTER_HE = ['Wat zegt hij?', 'Is dat een nieuwe taal? Mogen wij die ook leren? Is er een cursus? Gratis?', 'Ik versta het niet, maar ik ben er tegen!', 'Ik ga het googlen. Na de lunch.', 'Zei hij nou "sababa"? Is dat een soort tofu?', 'Klinkt boos. Ik zet het op Instagram met een vlammetje.'];
const BOO = ['SCHANDE!', 'BOE!', 'WIJ ZIEN JE!', 'DIT GAAT ONLINE!', 'TEGEN! TEGEN!'];

// ---------- what Pa, Shooki and Razim make of it ----------
const PA_NOW = ['Leave them, jongen. In 1983 they protested our paprika. Too red, they said.', 'A megaphone and no job. In my day we had a job and no megaphone.', 'Did you sign? Never sign. Your grandfather signed once. We lost the garage.', 'Walk on, Eddy. You cannot argue with a megaphone. It is louder.'];
function paTalk(g, kind) {
  const G = g.name;
  if (kind === 'he') return [['Eddy Jr.', 'Pa, those protesters by the loods. I told them off in Hebrew.'], ['Freddy Sr.', 'In Hebrew! Your mother would be proud. What did they say?'], ['Eddy Jr.', 'That they are against it.'], ['Freddy Sr.', 'Of course. They are against everything they cannot read. Which is the menu at Schmatzel\'s, mostly.'], ['Freddy Sr.', 'Next time say it slower. Shouting is for the Lampas. A Van... an Eddy & Zn man says it once, calm, and walks on.']];
  if (kind === 'flyer') return [['Eddy Jr.', `I took a flyer from the ${G}.`], ['Freddy Sr.', 'Show me. ...Hm. Hm! Glossy. Both sides. In colour. For the planet.'], ['Freddy Sr.', 'Good paper though. Fold it four times. We put it under the wobbly table in the loods.'], ['Eddy Jr.', 'That\'s what I was going to do.'], ['Freddy Sr.', 'You see? You are my son after all.']];
  return rnd([
    [['Eddy Jr.', `Pa, the ${G} were outside again. With a megaphone.`], ['Freddy Sr.', `The ${G}? We had them in 1983 too. Different name, same sandals. They chained themselves to our grinder.`], ['Eddy Jr.', 'What did you do?'], ['Freddy Sr.', 'I gave them broodjes. With our hottest blend. They went home crying. Very respectfully.'], ['Freddy Sr.', 'Let them shout, jongen. Shouting is free. Spice is twelve Wilders a kilo.']],
    [['Eddy Jr.', 'Pa, they called me "the problem". With a clipboard.'], ['Freddy Sr.', 'A clipboard! Then it is serious. Did they have a folding table too?'], ['Eddy Jr.', 'They had a folding table.'], ['Freddy Sr.', 'Ai. Folding table means they stay till four. Stay inside, count the stock, they get hungry around three and go to Schmatzel.']],
  ]);
}
function shookiTalk(g, kind) {
  if (kind === 'he') return [['Shooki', 'Bro! "Yalla, tazuzu"? I was in the Kangoo, I heard everything. I almost cried.'], ['Eddy Jr.', 'Was it that bad?'], ['Shooki', 'It was BEAUTIFUL, bro. Next time say "khalas". Khalas works in four languages. Even on Tante Gerda.'], ['Shooki', 'Also, the girl with the clipboard asked if you are single. I said you are married to the Kruidenbeurs.']];
  if (kind === 'flyer') return [['Shooki', 'Bro, you took a flyer from those people? Give it.'], ['Eddy Jr.', 'Why?'], ['Shooki', 'Their printer is better than mine. Look at this colour. I am going to ask where they print. "Shooki Koerier, 24/7" in glossy, bro. Both sides.'], ['Shooki', 'Planet-friendly. It says so on the flyer.']];
  return rnd([
    [['Shooki', 'Bro, I filmed you with the megaphone people. On my second phone.'], ['Eddy Jr.', 'Delete that.'], ['Shooki', 'Delete? It has twelve thousand views, bro. "Kruidenbaas says no." You are a sticker now. A sticker!'], ['Shooki', 'The comments are half "legend", half "check your privilege". That is a good mix, bro. That is called engagement.']],
    [['Shooki', `Bro, the ${g.name} are good for business.`], ['Eddy Jr.', 'How?'], ['Shooki', 'They shout "kipkruiden" all day. For free! That is marketing, bro. I sold them two bottles of water. Familieprijs. For them, double.']],
  ]);
}
const RAZIM = 'Razim (telefoon)';
function razimTalk(g, kind) {
  return rnd([
    [[RAZIM, 'Eddy! I saw you with the protest people. What were they selling?'], ['Eddy Jr.', 'Nothing. They want me to sign a petition.'], [RAZIM, 'For FREE? Eddy. Everybody has a price. Even a signature. Especially a signature.'], [RAZIM, 'Next time, fifteen Wilders a name. I bring my cousins. We sign everything. We signed against ourselves once, very good money.'], [RAZIM, 'Anyway. Shoarma?']],
    [[RAZIM, `Eddy. I joined the ${g.name}.`], ['Eddy Jr.', 'You WHAT?'], [RAZIM, 'Ten minutes. They had free stroopwafels. Then they asked for a donation, so I left. A donation, Eddy. Money for nothing. Can you imagine?'], ['Eddy Jr.', 'Razim, that is literally what you do.'], [RAZIM, 'Exactly, so I know a bad deal when I see one. I took four stroopwafels for you. I ate them. Shoarma?']],
    ...(kind === 'he' ? [[[RAZIM, 'Eddy, you yelled at the bakfiets people IN HEBREW? Legend.'], ['Eddy Jr.', 'They didn\'t understand a word.'], [RAZIM, 'Perfect. Now they don\'t know if they lost. Never let them know if they lost. That is business.'], [RAZIM, 'Shoarma to celebrate? You\'re buying, you won.']]] : []),
  ]);
}
const RAZIM_TXT = (g) => [rnd(['eddy was that you at the protest', 'eddy i saw u with the megaphone ppl']), rnd(['legend', 'they gave me a flyer', 'i signed with your name btw. jk. or am i']), rnd(['i sold their flyer to tony for 2 wilders', 'they had free stroopwafels', `the ${g.tag} want a donation. i asked how much they pay me`]), 'shoarma?'];

export function createActivists(d) {
  const { scene, lam, box, passerBy, personBubble, animate, player, dad, state, econ, folk, addInteract, dialogue, choice, toast, beep } = d;
  const A = () => { const s = state.activists && typeof state.activists === 'object' ? state.activists : (state.activists = {}); s.due = s.due || {}; s.said = s.said || {}; return s; };
  const G = () => GROUPS[A().gi % GROUPS.length];

  // ---------- the picket: built once, dressed per group ----------
  const root = new THREE.Group(); root.visible = false; scene.add(root);
  const SPOT = { x: 13.6, z: -6.05 }; // north pavement between the parking lot and The Russian's shop, facing the street
  root.position.set(SPOT.x, 0, SPOT.z);
  // the banner: two poles, a cloth with the group's name and slogan on both faces
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 320;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const cloth = new THREE.MeshLambertMaterial({ map: tex, side: THREE.FrontSide });
  const banner = new THREE.Group(); root.add(banner);
  const BW = 2.6, BH = 0.82, BY = 1.86;
  for (const ry of [0, Math.PI]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH, 8, 1), cloth); m.position.set(0, BY, ry ? -0.005 : 0.005); m.rotation.y = ry; banner.add(m); }
  for (const mesh of banner.children) { const p2 = mesh.geometry.attributes.position; for (let i = 0; i < p2.count; i++) p2.setZ(i, Math.sin((p2.getX(i) / BW + 0.5) * Math.PI * 2) * 0.05); p2.needsUpdate = true; } // a little ripple in the cloth
  const wood = lam({ color: 0xb08a5a });
  for (const sx of [-1, 1]) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 2.4, 6), wood); pole.position.set(sx * (BW / 2 + 0.03), 1.2, 0); pole.castShadow = true; banner.add(pole); }
  // the folding table with flyer stacks and a cardboard sign
  const table = new THREE.Group(); table.position.set(-2.75, 0, 0.15); root.add(table);
  box(0.95, 0.04, 0.55, lam({ color: 0xe8e4da }), 0, 0.74, 0, table);
  for (const [x, z] of [[-0.42, -0.22], [0.42, -0.22], [-0.42, 0.22], [0.42, 0.22]]) box(0.03, 0.74, 0.03, lam({ color: 0x8a8a8a }), x, 0.37, z, table, false);
  const flyerMat = lam({ color: 0xffffff });
  const stacks = [box(0.21, 0.05, 0.3, flyerMat, -0.2, 0.785, 0.02, table, false), box(0.21, 0.03, 0.3, flyerMat, 0.12, 0.775, -0.04, table, false)];
  const cv2 = document.createElement('canvas'); cv2.width = 256; cv2.height = 160; const tex2 = new THREE.CanvasTexture(cv2); tex2.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.39), new THREE.MeshLambertMaterial({ map: tex2 })); sign.position.set(0, 0.95, 0.29); sign.rotation.x = -0.25; table.add(sign);
  const signBack = box(0.62, 0.39, 0.01, lam({ color: 0xb8925a }), 0, 0.95, 0.27, table, false); signBack.rotation.x = -0.25;

  function paint() {
    const g = G(), c = cv.getContext('2d'), W = cv.width, H = cv.height;
    c.fillStyle = g.col; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 9; i++) c.fillRect(0, i * 38, W, 3); // fabric weave
    c.strokeStyle = g.ink; c.lineWidth = 8; c.strokeRect(14, 14, W - 28, H - 28);
    c.fillStyle = g.ink; c.textAlign = 'center'; c.textBaseline = 'middle';
    const fit = (t, size, y, font = 'Impact, "Arial Black", Arial, sans-serif') => { let s = size; do { c.font = `900 ${s}px ${font}`; s -= 4; } while (c.measureText(t).width > W - 80 && s > 20); c.fillText(t, W / 2, y); };
    fit(g.slogan, 120, H * 0.46);
    fit(`${g.name.toUpperCase()}  ·  ${g.sub}`, 40, H * 0.82, 'Arial, sans-serif');
    tex.needsUpdate = true;
    const s = cv2.getContext('2d'); s.fillStyle = '#d8b07a'; s.fillRect(0, 0, 256, 160);
    s.fillStyle = '#1a1a1a'; s.font = '900 46px "Comic Sans MS", "Marker Felt", Arial, sans-serif'; s.textAlign = 'center'; s.fillText('TEKEN', 128, 62); s.fillText('HIER!', 128, 118);
    s.strokeStyle = g.col; s.lineWidth = 6; s.beginPath(); s.moveTo(40, 136); s.lineTo(216, 132); s.stroke();
    tex2.needsUpdate = true;
  }

  // the people: two on the banner, one with the megaphone, one with the clipboard
  const LOOKS = [
    { shirt: '#5a8a3a', pants: 0x3a4a3a, glasses: true, bun: true, female: true },
    { shirt: '#c8a03a', pants: 0x2a2a30, ballcap: 0x2a2a2a },
    { shirt: '#2a2a30', pants: 0x3a3a48, glasses: true },
    { shirt: '#e86a9as', pants: 0x2a3a5a, female: true, glasses: true },
  ];
  const ppl = LOOKS.map((look, i) => { const p = passerBy(700 + i * 3, { look, female: look.female }); root.add(p); return p; });
  const [left, right, horn, can] = ppl;
  left.position.set(-BW / 2 - 0.05, 0, -0.32); right.position.set(BW / 2 + 0.05, 0, -0.32);
  horn.position.set(2.35, 0, 0.45); horn.rotation.y = -0.35;
  const HOME = new THREE.Vector3(-2.75, 0, 0.75); can.position.copy(HOME);
  const fl = [folk.pose(left, ['pole', 'pole']), folk.pose(right, ['pole', 'pole']), folk.pose(horn, ['horn', 'fist']), folk.pose(can, ['board', null])];
  // megaphone at the mouth (on the body, so it stays put whatever the arm does)
  const meg = new THREE.Group(); horn.add(meg); meg.position.set(-0.03, 1.5 * (horn.userData.body.scale.y || 1), 0.24);
  { const red = lam({ color: 0xe8e8e0 }), rim = lam({ color: 0xd02a20 });
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.045, 0.3, 14, 1, true), new THREE.MeshLambertMaterial({ color: 0xf2f2ea, side: THREE.DoubleSide })); cone.rotation.x = Math.PI / 2; cone.position.z = 0.15; meg.add(cone);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 16), rim); ring.position.z = 0.3; meg.add(ring);
    box(0.05, 0.05, 0.12, red, 0, 0, 0, meg, false); box(0.035, 0.14, 0.04, rim, 0, -0.08, 0.06, meg, false); }
  // clipboard at the chest, a flyer in the free hand when she holds one out
  const clip = new THREE.Group(); can.add(clip); clip.position.set(0.02, 1.08 * (can.userData.body.scale.y || 1), 0.27); clip.rotation.x = -0.75;
  box(0.24, 0.32, 0.012, lam({ color: 0x9a6a3a }), 0, 0, 0, clip, false); box(0.2, 0.26, 0.004, flyerMat, 0, -0.01, 0.009, clip, false); box(0.08, 0.03, 0.02, lam({ color: 0xb8b8b8 }), 0, 0.15, 0.012, clip, false);
  const flyer = new THREE.Group(); box(0.15, 0.21, 0.006, flyerMat, 0, 0, 0, flyer, false);
  folk.hold(can, 1, flyer, 0, -0.7, 0.08); flyer.visible = false;

  // ---------- day rolls ----------
  function roll() {
    const s = A(), day = econ.ensure().day;
    if (s.day === day) return;
    s.day = day;
    s.here = !s.seen || Math.random() < 0.4; // the first eligible day they are always there, so the player meets them once
    if (d.inspectorDue && d.inspectorDue()) s.here = false; // the parking inspector has the pavement that day
    if (s.here) { let gi; do gi = Math.floor(Math.random() * GROUPS.length); while (GROUPS.length > 1 && gi === s.gi); s.gi = gi; paint(); }
  }
  let painted = -1;

  // ---------- per frame ----------
  let chantT = 3, chantBeat = 0, pitchCd = 0, follow = 0, walking = false, booT = 0;
  const tmpV = new THREE.Vector3();
  const near = () => player.position.distanceTo(tmpV.set(SPOT.x, 0, SPOT.z));
  function squawk() { beep(620, 0.06, 'sawtooth', 0.025); setTimeout(() => beep(540, 0.09, 'sawtooth', 0.025), 70); }
  // speech balloons fade on their own clock here (the street loop only ticks its walkers)
  function tickB(o, dt) { const b = o.userData.bubble, u = b && b.userData; if (u && u.life > 0 && (u.life -= dt) <= 0) b.visible = false; }
  function update(dt) {
    tickB(player, dt); for (const p of ppl) tickB(p, dt);
    if (d.ready()) roll();
    const s = A(), on = !!s.here && d.ready() && !d.hidden();
    root.visible = on;
    if (!on) return;
    if (painted !== s.gi) { painted = s.gi; paint(); }
    if (!s.seen) { s.seen = true; d.save(); }
    const g = G(), dist = near(), busy = d.busy();
    for (const p of [left, right]) animate(p, 0, dt);
    // the megaphone: a chant every few seconds while Eddy is in earshot, fist pumping on the beat
    chantT -= dt;
    if (dist < 16 && chantT <= 0 && !busy) { chantT = 4.5 + Math.random() * 3; chantBeat = 1.6; squawk(); personBubble(horn, Math.random() < 0.55 ? rnd(g.chants) : rnd(CHANTS), g.col, g.tag); }
    if (chantBeat > 0) { chantBeat -= dt; fl[2].hands[1] = Math.sin(chantBeat * 9) > 0 ? 'fist' : null; } else fl[2].hands[1] = null;
    if (booT > 0 && (booT -= dt) <= 0) { squawk(); personBubble(horn, rnd(BOO), g.col, g.tag); chantT = 5; }
    { const want = dist < 9 ? Math.atan2(player.position.x - horn.position.x - SPOT.x, player.position.z - horn.position.z - SPOT.z) : -0.35; horn.rotation.y += Math.atan2(Math.sin(want - horn.rotation.y), Math.cos(want - horn.rotation.y)) * Math.min(1, dt * 2); }
    animate(horn, 0, dt);
    // the canvasser: walks up to Eddy with the clipboard, follows him a few steps, gives up, goes back to the table
    if (pitchCd > 0) pitchCd -= dt;
    const P = player.position, cw = can.getWorldPosition(tmpV.clone());
    let target = HOME, sp = 0;
    if (!busy && dist < 7.5 && pitchCd <= 0) {
      if (!follow) { follow = 6; personBubble(can, rnd([...PITCH, ...g.pitch].filter((t) => t.length < 90)), g.col, g.tag); fl[3].hands[1] = 'offer'; flyer.visible = true; }
    }
    if (follow > 0) {
      follow -= dt;
      const away = Math.hypot(cw.x - SPOT.x - HOME.x, cw.z - SPOT.z - HOME.z);
      if (follow <= 0 || away > 6 || dist > 10) { follow = 0; pitchCd = 22; fl[3].hands[1] = null; flyer.visible = false; if (dist > 4) personBubble(can, rnd(GIVE_UP), g.col, g.tag); }
      else { target = new THREE.Vector3(P.x - SPOT.x, 0, P.z - SPOT.z); if (Math.random() < dt * 0.25) personBubble(can, rnd(COME_BACK), g.col, g.tag); }
    }
    const to = target.clone().sub(can.position); to.y = 0; const L = to.length(), stop = follow > 0 ? 1.3 : 0.08;
    if (L > stop) { sp = follow > 0 ? 2.2 : 1.3; const st = Math.min(L - stop, sp * dt); can.position.addScaledVector(to.normalize(), st); can.rotation.y = Math.atan2(to.x, to.z); walking = true; }
    else { walking = false; const want = follow > 0 || dist < 6 ? Math.atan2(P.x - cw.x, P.z - cw.z) : 0; can.rotation.y += Math.atan2(Math.sin(want - can.rotation.y), Math.cos(want - can.rotation.y)) * Math.min(1, dt * 4); }
    fl[3].moving = walking; animate(can, walking ? sp : 0, dt);
    for (const f of fl) if (f.tmp && f.tmp.t > 0 && (f.tmp.t -= dt) <= 0) f.tmp = null;
    // Razim heard about it: he calls a little later (missed: he texts)
    if (s.due.razim && s.razimIn > 0 && !busy) { s.razimIn -= dt; if (s.razimIn <= 0) callRazim(); }
  }
  // Razim's call also runs while the picket is out of sight
  function tick(dt) {
    const s = A(); if (root.visible) return;
    if (s.due.razim && s.razimIn > 0 && !d.busy() && d.ready() && !d.hidden()) { s.razimIn -= dt; if (s.razimIn <= 0) callRazim(); }
  }

  // ---------- talking back ----------
  function eddySay(text) { personBubble(player, text, '#ffd36b', 'Eddy Jr.'); }
  const heLine = (h) => `${RLI}${h[0]}${PDI}\n${h[1]}`;
  function respond() {
    const g = G(), s = A();
    follow = 0; fl[3].hands[1] = 'offer'; flyer.visible = true;
    const pitch = rnd([...PITCH, ...g.pitch]);
    choice(`Actievoerder · ${g.name}`, `<i>"${pitch}"</i><br><small style="opacity:.75">Banner: ${g.slogan}</small>`, ['Say it in Dutch', 'Say it in Hebrew', 'Take a flyer', 'Walk on'], (i) => {
      const done = (kind) => { fl[3].hands[1] = null; flyer.visible = false; pitchCd = 30; if (kind) encounter(kind); };
      if (i === 0) {
        const line = rnd(NL);
        dialogue([['Eddy Jr.', line], [`Actievoerder · ${g.tag}`, rnd(AFTER_NL)]], () => { eddySay(line); booT = 1.4; done('nl'); });
      } else if (i === 1) {
        let h; do h = rnd(HE); while (HE.length > 1 && h === s.lastHe); s.lastHe = h;
        dialogue([['Eddy Jr.', `${RLI}${h[0]}${PDI}\n(${h[1]}: "${h[2]}")`], [`Actievoerder · ${g.tag}`, rnd(AFTER_HE)]], () => { eddySay(heLine(h)); booT = 1.6; done('he'); });
      } else if (i === 2) {
        dialogue([['Eddy Jr.', rnd(['Fine. Give me one. ...Glossy. Both sides. In colour. For the planet, right?', 'One flyer. Then you leave me alone. Deal?', 'Sure. I need something for under the wobbly table.'])], [`Actievoerder · ${g.tag}`, rnd(['Het is gerecycled! ...De eerste keer niet.', 'Dank je! Je hebt net de planeet gered! Een klein stukje!', 'Lees hem wel, hè! Hij is niet om je frikandel op te leggen!'])]],
          () => { toast('FLYER', `${g.flyer} Eddy folds it in four.`, 4); done('flyer'); });
      } else { done(null); personBubble(can, rnd(GIVE_UP), g.col, g.tag); }
    });
  }
  // after a real exchange: Pa says something now, Shooki and Razim later
  function encounter(kind) {
    const s = A(); s.n = (s.n || 0) + 1; s.last = { kind, gi: s.gi }; s.said[kind] = (s.said[kind] || 0) + 1;
    const fr = d.freddy();
    if (fr && fr.back()) {
      s.due.freddy = true;
      if (dad.visible && dad.position.distanceTo(player.position) < 9) { fr.SAY.activists = PA_NOW; setTimeout(() => fr.say('activists', true), 2200); }
    }
    if (d.metShooki()) s.due.shooki = true;
    if (s.razimDay !== s.day) { s.razimDay = s.day; s.due.razim = true; s.razimIn = 35 + Math.random() * 35; }
    d.save();
  }
  function callRazim() {
    const s = A(), ph = d.phone(), g = GROUPS[(s.last && s.last.gi) || 0], kind = s.last && s.last.kind;
    if (!ph || !ph.ringWith) { s.due.razim = false; return; }
    const ok = ph.ringWith('razimProtest', { name: 'Razim', img: './assets/face_razim.jpg',
      talk: () => { s.due.razim = false; d.save(); dialogue(razimTalk(g, kind)); },
      missed: () => { s.due.razim = false; ph.razimText(RAZIM_TXT(g)); d.save(); } });
    if (!ok) s.razimIn = 12;
  }
  // debrief(who): the next time Eddy talks to Pa or Shooki after an encounter, that comes up first. Returns true when it ran
  function debrief(who) {
    const s = A(); if (!s.due[who] || !s.last || d.busy()) return false;
    const g = GROUPS[s.last.gi % GROUPS.length], kind = s.last.kind;
    s.due[who] = false; d.save();
    dialogue(who === 'freddy' ? paTalk(g, kind) : shookiTalk(g, kind));
    return true;
  }

  for (const p of ppl) addInteract({ obj: p, pos: () => p.getWorldPosition(new THREE.Vector3()), r: p === can ? 1.7 : 1.6, enabled: () => root.visible, label: () => 'Talk back to the protesters', act: respond });

  // walkers on the north pavement step to the kerb side while they pass the picket (main.js street loop)
  const blocks = (x, z) => root.visible && z < 0 && Math.abs(x - SPOT.x) < 5.5;
  // test hook: spawn(gi) puts the picket out today
  function spawn(gi = Math.floor(Math.random() * GROUPS.length)) { const s = A(); s.day = econ.ensure().day; s.here = true; s.seen = true; s.gi = gi; paint(); painted = gi; return G().name; }
  return { update, tick, debrief, blocks, respond, spawn, encounter, callRazim, GROUPS, HE, NL, root, get people() { return ppl; }, SPOT };
}
