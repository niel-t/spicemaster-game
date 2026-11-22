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
// PRO (Tristan 2026-11-22: "a red socialist party... pro palestina and left wing activities, make them stereotypical") is a
// made-up party, the Partij voor Rood Ongenoegen. The jokes are about the activist type: the checked scarf from a webshop,
// the tote bag, oat milk, the iPhone, the boycott list, speaking for people they have never met. Never about the people
// they say they speak for.
const GROUPS = [
  { pro: true, name: 'Partij voor Rood Ongenoegen', tag: 'PRO', col: '#c8102e', ink: '#ffffff', slogan: 'DE KRUIDENBAAS BETAALT!', sub: 'gratis havermelk voor het volk',
    chants: ['ARBEIDERS VAN KAASLAND, VERENIGT U!', 'KAPITALISME? KAPOT-ALISME!', 'BOYCOT DE KRUIDENBAAS!', 'HAVERMELK VOOR HET VOLK!', 'WIJ ZIJN DE 99 PROCENT! (VAN DIT PLEIN)', 'PRO! PRO! PRO!'],
    pitch: ['Wist je dat jouw komijn medeplichtig is? Wij hebben een spreadsheet.', 'Teken je onze petitie voor vrede? Daarna tekenen we er één tegen jou.', 'Ik sta hier al sinds negen uur voor de goede zaak. Nou ja, sinds half twaalf. Er was brunch.', 'Ik ben vorig jaar in Antalya geweest. All-inclusive. Ik ken de regio dus heel goed.', 'Deze sjaal? Webshop. Solidariteit gaat tegenwoordig ook via iDEAL.', 'Jij hebt een bestelbus en personeel. Weet je hoe wij dat noemen? Uitbuiting. Weet je hoe ik mijn werkster noem? Ilse.'],
    flyer: '"BOYCOT ALLES! De volledige boycotlijst staat op de achterkant. En op de voorkant. En in onze 47 Instagram-slides. Swipe!"',
    nl: ['Jullie spreken voor mensen die jullie nog nooit hebben ontmoet.', 'Mooie sjaal. Webshop zeker? Solidariteit met gratis verzending.', 'Havermelk-socialisme, vanaf een iPhone van twaalfhonderd euro.', 'Ben jij ooit verder geweest dan Zandvoort?', 'Eerst je studieschuld afbetalen, dan de wereld redden.', 'Boycot mijn kruiden maar. Jullie havermelk wordt er niet lekkerder van.', 'Rode vlag, rode wangen, rood staan bij de bank.'],
    he: [['הייתם פעם בכלל במזרח התיכון?', "heytem pa'am bikhlal bamizrach hatikhon?", 'zijn jullie er ooit überhaupt geweest, in het Midden-Oosten?'],
      ['תורידו את המגפון ותלכו לקרוא ספר.', 'toridu et hamegafon ve-telkhu likro sefer.', 'leg die megafoon neer en ga een boek lezen.'],
      ['אתם לא מבינים כלום, אבל בקול רם.', 'atem lo mevinim klum, aval bekol ram.', 'jullie snappen er niks van, maar wel heel hard.']],
    afterNl: ['Typisch. Een kapitalist met een bestelbus.', 'Ik voel me nu echt onderdrukt. Door jou. Met je kruiden.', 'Dit gaat in onze nieuwsbrief. Die leest niemand, maar toch.', 'Kameraden! Hij heeft een MENING!'],
    afterHe: ['Hij doet het in het Hebreeuws om ons te provoceren!', 'Wacht, ik vraag het aan mijn groepsapp. Daar zit iemand die een keer een documentaire heeft gezien.', 'Ik versta het niet, maar ik ga er een statement over posten.'] },
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
const PA_NOW_PRO = ['Red flags. In my day red flags meant: do not swim. Same here, jongen.', 'Do not argue with the PRO, Eddy. They have a committee for arguing.', 'A scarf, a tote bag and Papa\'s credit card. The revolution is very well funded.'];
const PA_NOW = ['Leave them, jongen. In 1983 they protested our paprika. Too red, they said.', 'A megaphone and no job. In my day we had a job and no megaphone.', 'Did you sign? Never sign. Your grandfather signed once. We lost the garage.', 'Walk on, Eddy. You cannot argue with a megaphone. It is louder.'];
function paTalk(g, kind) {
  const G = g.name;
  if (g.pro && Math.random() < 0.7) return rnd([
    [['Eddy Jr.', 'Pa, the PRO were outside. Red flags, scarves, a megaphone. They want to boycott me.'], ['Freddy Sr.', 'The PRO! In 1979 the red ones wanted to nationalise our paprika. I said: take it, it is already red.'], ['Eddy Jr.', 'And?'], ['Freddy Sr.', 'They asked if it was fair trade. I said: I trade, you pay, very fair. They bought two kilo.'], ['Freddy Sr.', 'Remember, jongen: a socialist is a capitalist who has not found his product yet.']],
    [['Eddy Jr.', 'Pa, they said my cumin is "complicit".'], ['Freddy Sr.', 'Complicit in what? In a good kapsalon?'], ['Eddy Jr.', 'They had a spreadsheet.'], ['Freddy Sr.', 'A spreadsheet! The Lampas never had a spreadsheet. These people are more dangerous than the Lampas.'], ['Freddy Sr.', 'Let them boycott. Their mothers buy from Schmatzel, and Schmatzel buys from us.']],
  ]);
  if (kind === 'he') return [['Eddy Jr.', 'Pa, those protesters by the loods. I told them off in Hebrew.'], ['Freddy Sr.', 'In Hebrew! Your mother would be proud. What did they say?'], ['Eddy Jr.', 'That they are against it.'], ['Freddy Sr.', 'Of course. They are against everything they cannot read. Which is the menu at Schmatzel\'s, mostly.'], ['Freddy Sr.', 'Next time say it slower. Shouting is for the Lampas. A Van... an Eddy & Zn man says it once, calm, and walks on.']];
  if (kind === 'flyer') return [['Eddy Jr.', `I took a flyer from the ${G}.`], ['Freddy Sr.', 'Show me. ...Hm. Hm! Glossy. Both sides. In colour. For the planet.'], ['Freddy Sr.', 'Good paper though. Fold it four times. We put it under the wobbly table in the loods.'], ['Eddy Jr.', 'That\'s what I was going to do.'], ['Freddy Sr.', 'You see? You are my son after all.']];
  return rnd([
    [['Eddy Jr.', `Pa, the ${G} were outside again. With a megaphone.`], ['Freddy Sr.', `The ${G}? We had them in 1983 too. Different name, same sandals. They chained themselves to our grinder.`], ['Eddy Jr.', 'What did you do?'], ['Freddy Sr.', 'I gave them broodjes. With our hottest blend. They went home crying. Very respectfully.'], ['Freddy Sr.', 'Let them shout, jongen. Shouting is free. Spice is twelve Wilders a kilo.']],
    [['Eddy Jr.', 'Pa, they called me "the problem". With a clipboard.'], ['Freddy Sr.', 'A clipboard! Then it is serious. Did they have a folding table too?'], ['Eddy Jr.', 'They had a folding table.'], ['Freddy Sr.', 'Ai. Folding table means they stay till four. Stay inside, count the stock, they get hungry around three and go to Schmatzel.']],
  ]);
}
function shookiTalk(g, kind) {
  if (g.pro && Math.random() < 0.7) return rnd([
    [['Shooki', 'Bro, the PRO girl sold me a scarf. Forty Wilders.'], ['Eddy Jr.', 'Why do you need a scarf?'], ['Shooki', 'I don\'t, bro. Then she told me I am "appropriating". I said sister, YOU sold it to me. She said that is different. I asked how. She is still thinking.'], ['Shooki', 'I am selling it back to her tomorrow. Forty-five.']],
    [['Shooki', 'Bro, the PRO want to boycott you. I read their list.'], ['Eddy Jr.', 'And?'], ['Shooki', 'Your spice is on it, Hakan\'s döner is on it, the Kangoo is on it. Their own oat milk is on it, bro. They boycott themselves. Respect. Commitment.']],
  ]);
  if (kind === 'he') return [['Shooki', 'Bro! "Yalla, tazuzu"? I was in the Kangoo, I heard everything. I almost cried.'], ['Eddy Jr.', 'Was it that bad?'], ['Shooki', 'It was BEAUTIFUL, bro. Next time say "khalas". Khalas works in four languages. Even on Tante Gerda.'], ['Shooki', 'Also, the girl with the clipboard asked if you are single. I said you are married to the Kruidenbeurs.']];
  if (kind === 'flyer') return [['Shooki', 'Bro, you took a flyer from those people? Give it.'], ['Eddy Jr.', 'Why?'], ['Shooki', 'Their printer is better than mine. Look at this colour. I am going to ask where they print. "Shooki Koerier, 24/7" in glossy, bro. Both sides.'], ['Shooki', 'Planet-friendly. It says so on the flyer.']];
  return rnd([
    [['Shooki', 'Bro, I filmed you with the megaphone people. On my second phone.'], ['Eddy Jr.', 'Delete that.'], ['Shooki', 'Delete? It has twelve thousand views, bro. "Kruidenbaas says no." You are a sticker now. A sticker!'], ['Shooki', 'The comments are half "legend", half "check your privilege". That is a good mix, bro. That is called engagement.']],
    [['Shooki', `Bro, the ${g.name} are good for business.`], ['Eddy Jr.', 'How?'], ['Shooki', 'They shout "kipkruiden" all day. For free! That is marketing, bro. I sold them two bottles of water. Familieprijs. For them, double.']],
  ]);
}
const RAZIM = 'Razim (telefoon)';
function razimTalk(g, kind) {
  if (g.pro && Math.random() < 0.6) return rnd([
    [[RAZIM, 'Eddy! The PRO people. They want to boycott everything.'], ['Eddy Jr.', 'I know.'], [RAZIM, 'So I asked: who sells the boycott list? Nobody, they give it away. For FREE. Eddy, these are real communists. I didn\'t believe they existed.'], [RAZIM, 'I printed a hundred, I sell them at the market. Two Wilders. Boycott list, premium edition. Shoarma?']],
    [[RAZIM, 'Eddy, I went to their meeting. The PRO.'], ['Eddy Jr.', 'Why?'], [RAZIM, 'Free oat milk. Then they voted to share everything equally. I said great, I share my shoarma bill. Meeting over in four minutes. Fastest meeting I ever saw.'], [RAZIM, 'Speaking of shoarma...']],
  ]);
  return rnd([
    [[RAZIM, 'Eddy! I saw you with the protest people. What were they selling?'], ['Eddy Jr.', 'Nothing. They want me to sign a petition.'], [RAZIM, 'For FREE? Eddy. Everybody has a price. Even a signature. Especially a signature.'], [RAZIM, 'Next time, fifteen Wilders a name. I bring my cousins. We sign everything. We signed against ourselves once, very good money.'], [RAZIM, 'Anyway. Shoarma?']],
    [[RAZIM, `Eddy. I joined the ${g.name}.`], ['Eddy Jr.', 'You WHAT?'], [RAZIM, 'Ten minutes. They had free stroopwafels. Then they asked for a donation, so I left. A donation, Eddy. Money for nothing. Can you imagine?'], ['Eddy Jr.', 'Razim, that is literally what you do.'], [RAZIM, 'Exactly, so I know a bad deal when I see one. I took four stroopwafels for you. I ate them. Shoarma?']],
    ...(kind === 'he' ? [[[RAZIM, 'Eddy, you yelled at the bakfiets people IN HEBREW? Legend.'], ['Eddy Jr.', 'They didn\'t understand a word.'], [RAZIM, 'Perfect. Now they don\'t know if they lost. Never let them know if they lost. That is business.'], [RAZIM, 'Shoarma to celebrate? You\'re buying, you won.']]] : []),
  ]);
}
const RAZIM_TXT = (g) => g.pro ? ['eddy the PRO ppl gave me a flyer', 'boycott list. 3 pages', 'you are on page 1!!', 'i sold it to tony for 2 wilders', 'shoarma? (not boycotted)'] : [rnd(['eddy was that you at the protest', 'eddy i saw u with the megaphone ppl']), rnd(['legend', 'they gave me a flyer', 'i signed with your name btw. jk. or am i']), rnd(['i sold their flyer to tony for 2 wilders', 'they had free stroopwafels', `the ${g.tag} want a donation. i asked how much they pay me`]), 'shoarma?'];

export function createActivists(d) {
  const { scene, lam, box, passerBy, personBubble, animate, player, dad, state, econ, folk, addInteract, dialogue, choice, toast, beep } = d;
  const A = () => { const s = state.activists && typeof state.activists === 'object' ? state.activists : (state.activists = {}); s.due = s.due || {}; s.said = s.said || {}; return s; };
  const G = () => GROUPS[A().gi % GROUPS.length];

  // ---------- the picket: built once, dressed per group ----------
  const root = new THREE.Group(); root.visible = false; scene.add(root);
  const SPOT = { x: -9.0, z: -6.2 }; // right next to Eddy's warehouse (Tristan 2026-11-22): in front of its west wall, clear of the shutter, facing the street
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

  // the people: two on the banner, one with the megaphone, one with the clipboard. Two crews: the general activists, and the
  // PRO crowd in party red with the checked scarves and the tote bags (only one of them stands on the pavement at a time)
  const scarfTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, 64, 64); x.strokeStyle = '#1a1a1a'; x.lineWidth = 3;
    for (let i = 0; i <= 64; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 64); x.moveTo(0, i); x.lineTo(64, i); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 1); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  function scarf(p) { // a checked scarf round the neck, one end hanging down the front
    const y = 1.36 * (p.userData.body.scale.y || 1), m = new THREE.MeshLambertMaterial({ map: scarfTex });
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.04, 6, 14), m); r.rotation.x = Math.PI / 2 - 0.25; r.position.set(0, y + 0.02, 0.06); p.add(r);
    const end = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.34, 0.03), m); end.position.set(0.07, y - 0.2, 0.2); end.rotation.x = -0.12; p.add(end);
  }
  function tote(p, text) { // canvas tote bag on the shoulder, a slogan on it
    const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#e8dcc0'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#c8102e'; x.font = '900 15px Arial'; x.textAlign = 'center'; x.fillText(text, 32, 38);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const plain = lam({ color: 0xe8dcc0 }), face = new THREE.MeshLambertMaterial({ map: t });
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.34, 0.06), [plain, plain, plain, plain, face, face]);
    b.rotation.y = Math.PI / 2; b.position.set(0.27 * (p.userData.body.scale.y || 1), 0.9 * (p.userData.body.scale.y || 1), 0); p.add(b);
  }
  const HOME = new THREE.Vector3(-2.75, 0, 0.75);
  function makeCrew(looks, seed, pro) {
    const g = new THREE.Group(); root.add(g);
    const ppl = looks.map((look, i) => { const p = passerBy(seed + i * 3, { look, female: look.female }); g.add(p); return p; });
    const [left, right, horn, can] = ppl;
    left.position.set(-BW / 2 - 0.05, 0, -0.32); right.position.set(BW / 2 + 0.05, 0, -0.32);
    horn.position.set(2.35, 0, 0.45); horn.rotation.y = -0.35; can.position.copy(HOME);
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
    if (pro) { scarf(left); scarf(horn); scarf(can); tote(right, 'PRO'); tote(can, 'HAVER'); }
    return { g, ppl, left, right, horn, can, fl, flyer };
  }
  const CREWS = [
    makeCrew([
      { shirt: '#5a8a3a', pants: 0x3a4a3a, glasses: true, bun: true, female: true },
      { shirt: '#c8a03a', pants: 0x2a2a30, ballcap: 0x2a2a2a },
      { shirt: '#2a2a30', pants: 0x3a3a48, glasses: true },
      { shirt: '#e86a9as', pants: 0x2a3a5a, female: true, glasses: true },
    ], 700, false),
    makeCrew([ // PRO: party red and black, round glasses, a man bun, checked scarves, tote bags
      { shirt: '#c8102e', pants: 0x1a1a22, glasses: true, bun: true, female: true },
      { shirt: '#1a1a22', pants: 0x3a3a48, glasses: true, bun: true },
      { shirt: '#c8102e', pants: 0x2a2a30, ballcap: 0xc8102e },
      { shirt: '#2a2a30', pants: 0x2a3a5a, female: true, glasses: true },
    ], 760, true),
  ];
  let left, right, horn, can, fl, flyer, ppl, crew = null;
  function useCrew(c) { if (crew === c) return; crew = c; ({ left, right, horn, can, fl, flyer, ppl } = c); for (const k of CREWS) k.g.visible = k === c; follow = 0; }
  // the PRO table: a red party flag with a fist, a small flag of Palestine, oat milk for the comrades
  const proProps = new THREE.Group(); table.add(proProps); proProps.visible = false;
  { const flagMat = (draw) => { const c = document.createElement('canvas'); c.width = 96; c.height = 64; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshLambertMaterial({ map: t, side: THREE.DoubleSide }); };
    const red = flagMat((x) => { x.fillStyle = '#c8102e'; x.fillRect(0, 0, 96, 64); x.fillStyle = '#fff'; x.font = '900 24px Impact, Arial'; x.textAlign = 'center'; x.fillText('PRO', 48, 28); x.fillRect(38, 38, 20, 18); x.fillRect(37, 32, 5, 9); x.fillRect(43, 30, 5, 10); x.fillRect(49, 30, 5, 10); x.fillRect(55, 32, 4, 9); });
    const pal = flagMat((x) => { x.fillStyle = '#000'; x.fillRect(0, 0, 96, 22); x.fillStyle = '#fff'; x.fillRect(0, 21, 96, 22); x.fillStyle = '#007a3d'; x.fillRect(0, 42, 96, 22); x.fillStyle = '#ce1126'; x.beginPath(); x.moveTo(0, 0); x.lineTo(40, 32); x.lineTo(0, 64); x.closePath(); x.fill(); });
    for (const [mat, x0] of [[red, 0.36], [pal, -0.4]]) { const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.55, 5), wood); stick.position.set(x0, 1.03, -0.18); proProps.add(stick); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.18), mat); f.position.set(x0 + 0.14, 1.2, -0.18); proProps.add(f); }
    box(0.08, 0.2, 0.08, lam({ color: 0xe8e0c8 }), 0.3, 0.86, 0.12, proProps, false); box(0.081, 0.06, 0.081, lam({ color: 0x3a8a5a }), 0.3, 0.9, 0.12, proProps, false); } // oat milk carton
  // the PRO crowd's big flags: two tall Palestine flags with FREE PALESTINE across the white stripe, on poles in weighted stands
  const proFlags = new THREE.Group(); root.add(proFlags); proFlags.visible = false;
  const waving = [];
  { const c = document.createElement('canvas'); c.width = 384; c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#000'; x.fillRect(0, 0, 384, 86); x.fillStyle = '#fff'; x.fillRect(0, 85, 384, 86); x.fillStyle = '#007a3d'; x.fillRect(0, 170, 384, 86);
    x.fillStyle = '#ce1126'; x.beginPath(); x.moveTo(0, 0); x.lineTo(150, 128); x.lineTo(0, 256); x.closePath(); x.fill();
    x.fillStyle = '#111'; x.font = '900 34px Impact, "Arial Black", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('FREE PALESTINE', 255, 129);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const fm = new THREE.MeshLambertMaterial({ map: t, side: THREE.DoubleSide }), base = lam({ color: 0x2a2a2a });
    for (const [px, pz, ph] of [[-4.0, -0.15, 0], [3.35, -0.05, 1.7]]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 3.1, 6), wood); pole.position.set(px, 1.55, pz); pole.castShadow = true; proFlags.add(pole);
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.12, 10), base); foot.position.set(px, 0.06, pz); proFlags.add(foot);
      const geo = new THREE.PlaneGeometry(1.2, 0.8, 10, 1); geo.translate(0.6, 0, 0); // hinge on the pole
      const flag = new THREE.Mesh(geo, fm); flag.position.set(px + 0.02, 2.65, pz); flag.castShadow = true; proFlags.add(flag);
      waving.push({ flag, ph, x0: geo.attributes.position.array.filter((_, i) => i % 3 === 0) });
    }
  }
  function wave(t) { // a slow ripple through the cloth, stronger at the free end
    for (const w of waving) { const a = w.flag.geometry.attributes.position; for (let i = 0; i < a.count; i++) { const x = w.x0[i]; a.setZ(i, Math.sin(t * 2.4 + w.ph - x * 4) * 0.09 * x); } a.needsUpdate = true; w.flag.rotation.y = Math.sin(t * 0.7 + w.ph) * 0.25 - 0.2; }
  }

  // ---------- day rolls ----------
  function roll() {
    const s = A(), day = econ.ensure().day;
    if (s.day === day) return;
    s.day = day;
    s.here = !s.seen || Math.random() < 0.4; // the first eligible day they are always there, so the player meets them once
    if (d.inspectorDue && d.inspectorDue()) s.here = false; // the parking inspector has the pavement that day
    if (s.here) { let gi; if (Math.random() < 0.65 && s.gi !== 0) gi = 0; else do gi = 1 + Math.floor(Math.random() * (GROUPS.length - 1)); while (gi === s.gi); s.gi = gi; paint(); } // PRO (index 0) most of the time
  }
  let painted = -1;

  // ---------- per frame ----------
  let chantT = 3, chantBeat = 0, pitchCd = 0, follow = 0, walking = false, booT = 0; useCrew(CREWS[0]);
  const tmpV = new THREE.Vector3();
  const near = () => player.position.distanceTo(tmpV.set(SPOT.x, 0, SPOT.z));
  function squawk() { beep(620, 0.06, 'sawtooth', 0.025); setTimeout(() => beep(540, 0.09, 'sawtooth', 0.025), 70); }
  // speech balloons fade on their own clock here (the street loop only ticks its walkers)
  function tickB(o, dt) { const b = o.userData.bubble, u = b && b.userData; if (u && u.life > 0 && (u.life -= dt) <= 0) b.visible = false; }
  function update(dt) {
    tickB(player, dt); for (const c of CREWS) for (const p of c.ppl) tickB(p, dt);
    if (d.ready()) roll();
    const s = A(), on = !!s.here && d.ready() && !d.hidden();
    root.visible = on;
    if (!on) return;
    if (painted !== s.gi) { painted = s.gi; paint(); }
    useCrew(CREWS[G().pro ? 1 : 0]); proProps.visible = proFlags.visible = !!G().pro; // the PRO crowd has its own people, table and flags
    if (proFlags.visible) wave(performance.now() / 1000);
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
        const line = g.nl && Math.random() < 0.7 ? rnd(g.nl) : rnd(NL);
        dialogue([['Eddy Jr.', line], [`Actievoerder · ${g.tag}`, rnd(g.afterNl && Math.random() < 0.7 ? g.afterNl : AFTER_NL)]], () => { eddySay(line); booT = 1.4; done('nl'); });
      } else if (i === 1) {
        const pool = g.he && Math.random() < 0.6 ? g.he : HE;
        let h; do h = rnd(pool); while (pool.length > 1 && h[0] === s.lastHe); s.lastHe = h[0];
        dialogue([['Eddy Jr.', `${RLI}${h[0]}${PDI}\n(${h[1]}: "${h[2]}")`], [`Actievoerder · ${g.tag}`, rnd(g.afterHe && Math.random() < 0.7 ? g.afterHe : AFTER_HE)]], () => { eddySay(heLine(h)); booT = 1.6; done('he'); });
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
      if (dad.visible && dad.position.distanceTo(player.position) < 9) { fr.SAY.activists = GROUPS[s.gi].pro ? PA_NOW_PRO : PA_NOW; setTimeout(() => fr.say('activists', true), 2200); }
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

  for (const c of CREWS) for (const p of c.ppl) addInteract({ obj: p, pos: () => p.getWorldPosition(new THREE.Vector3()), r: p === c.can ? 1.7 : 1.6, enabled: () => root.visible && crew === c, label: () => 'Talk back to the protesters', act: respond });

  // walkers on the north pavement step to the kerb side while they pass the picket (main.js street loop)
  const blocks = (x, z) => root.visible && z < 0 && x > SPOT.x - 6 && x < SPOT.x + 5;
  // test hook: spawn(gi) puts the picket out today
  function spawn(gi = Math.floor(Math.random() * GROUPS.length)) { const s = A(); s.day = econ.ensure().day; s.here = true; s.seen = true; s.gi = gi; paint(); painted = gi; return G().name; }
  return { update, tick, debrief, blocks, respond, spawn, encounter, callRazim, GROUPS, HE, NL, root, get people() { return ppl; }, SPOT };
}
