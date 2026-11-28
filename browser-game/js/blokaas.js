// Blokaas Specijeren (2026-11-28): Eddy's rival spice mixer, from Almere, across the IJmeer. Gert and Wilma Blokaas run it,
// a husband and wife who have never paid full price for anything. They undercut everybody, sell a "smaakje" nobody else
// has, and they want Eddy & Zn small again. On some market days they stand on the far pavement, right across the street
// from the warehouse, with a pair of kringloop binoculars and a notebook, counting every sack that goes in.
//
// The story, gated by progress:
//   1  the first sighting (day 3+, once there is a mixing table): Eddy walks over, they introduce themselves, sort of
//   2  they poach a client (two days later, rank Mengmeester): it pays 20% less until Eddy can match their "smaakje"
//      Three clues give their recipe away: free coffee makes Gert talk (fenegriek), sneaking up behind them while they
//      gossip (Ve-tsin), and Wilma's shopping list (a Maboota smack makes her drop it, or a text she sends to the wrong
//      number a couple of days after the other two)
//   3  recipe cracked: fenegriek on the Kruidenbeurs, Polder Shoarma on the mixing table, the client comes back
//   4  once the Lampas are beaten, Almere opens (A1, A6): the showdown at their hall on Bedrijventerrein De Zuinige Vaart
//   5  settled: exposed in the Krant, or bought off. They still come and look now and then. Looking is free.
// Pa, Shooki and Razim each have their take, the Krant writes about them, they text Eddy cheap offers on the Shmokia.
//
// state.blokaas = { stage, day, here, gone, met, d1, cid, clues: {fen, vetsin, lijst}, c2day, n, last, due, razimIn, sms, unread, how, ends }
import * as THREE from '../vendor/three.module.min.js';
import { makeBikeModel } from './bikes.js';
import { mergeStatic } from './richtex.js';

const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const GERT = 'Gert Blokaas', WILMA = 'Wilma Blokaas';
export const BLK_FACES = { [GERT]: './assets/face_gert.jpg', [WILMA]: './assets/face_wilma.jpg', [`${GERT} (telefoon)`]: './assets/face_gert.jpg', [`${WILMA} (telefoon)`]: './assets/face_wilma.jpg' };
const GC = '#cbb8ec', WC = '#efc6e6'; // their balloon colours: rival lilac

// ---------- what they say ----------
// counting, from behind the binoculars (Eddy in sight, a fair way off)
const SPY_G = ['Drie zakken komijn. Die jongen smijt met geld, Wilma.', 'Hij laat het licht aan. Overdag. Zonde.', 'Wilma, schrijf op: bestelbus, ronkt, veertien over twee.', 'Een NIEUWE pallet. Wie koopt er nou een nieuwe pallet?', 'Kijk, hij geeft zijn personeel koffie. Gratis. Dat gaat nooit goed.', 'Hij betaalt die jongens per uur. Per UUR, Wilma.', 'Weer een vrachtwagen. Die heeft vast niet eens afgedongen.'];
const SPY_W = ['Genoteerd. Nog drie bladzijden, dan moet ik op de achterkant.', 'Niet zo hard ademen, Gert. Dan beslaan de lenzen.', 'Koffie? Eén kopje. Dit thermosje moet tot donderdag mee.', 'Zijn vader was precies zo. Strooide met kardemom.', 'Gert, zit je op mijn boterham?', 'Zestien zakken. Ik heb ze geteld. Twee keer, voor de zekerheid.', 'Die boterham was voor morgen, Gert.'];
// Eddy walks straight at them: suddenly they are birdwatching
const CAUGHT = ['O! Eh... vogels kijken. Een zeldzame... kruidenmus.', 'Wij staan hier gewoon. Staan is gratis.', 'Mooi weertje, hè. Dag. Wij gaan zo.', 'Wilma, doe normaal. Hij ziet ons niet.', 'Wat toevallig! Wij wonen hier niet, hoor. Almere. Heel ver weg.', 'Dat is geen verrekijker. Dat is een... leesbril. Een sterke.'];
// their gossip when they think nobody is listening (before the poaching: just setting things up)
const GOSSIP = [
  [['g', 'Hoeveel klanten heeft hij nu, Wilma?'], ['w', 'Te veel. Over twee weken pakken we er één af. Met korting.'], ['g', 'En het geld?'], ['w', 'Sparen, Gert. In de sok.']],
  [['w', 'Weet je wat zo\'n bestelbus kost aan diesel?'], ['g', 'Daarom fietsen wij.'], ['w', 'Achtentwintig kilometer.'], ['g', 'Gratis kilometers, Wilma. Gratis.']],
  [['g', 'Zijn vader heeft ons in vierennegentig weggestuurd.'], ['w', 'Omdat jij de proefzakjes opat.'], ['g', 'Ze waren gratis.'], ['w', 'Zes jaar lang, Gert.']],
];
const OVERHEAR = [['g', 'Die jongen gebruikt echte kruiden, Wilma. Waanzin.'], ['w', 'Wij doen er gewoon een flinke snuf Ve-tsin door. Dan proeven ze het verschil niet.'], ['g', 'Ve-tsin kost niks en smaakt naar meer.'], ['w', 'Niet zo hard, Gert. Straks hoort iemand het.']];
const NOTICED = ['Gert... er staat iemand achter ons.', 'Wilma, NIET omkijken. ...Hij staat er nog.', 'O. Hallo. Wij hadden het over het weer.'];
const COFFEE = [['g', 'Gratis koffie? Graag. Heeft u er ook een koekje bij? Eentje maar. Of twee, voor de terugweg.'], ['w', 'Ik giet hem wel even over in de thermos. Voor morgen.']];
const FLEE = ['WILMA, DE FIETSEN!', 'Mijn thermos! Die was van mijn moeder!', 'Dit gaat je geld kosten, jongen! Wij hebben rechtsbijstand! Met eigen risico!', 'Niet het gezicht! Mijn bril was duur! Nou ja, tweedehands!', 'Fietsen, Gert! Trappen!'];
const SMS_ADS = ['Blokaas Specijeren: kipkruiden voor de prijs van zand. Afhalen in Almere. Bezorgen kost geld.', 'GRATIS proefzakje! Af te halen in Almere-Buiten. Reiskosten voor eigen rekening.', 'Actie: 2e zak halve prijs (de kleine zak). Blokaas Specijeren.', 'Beste Eddy, uw kruiden zijn te duur. Wij weten dat. Wij hebben gekeken. Groetjes, G&W', 'Laatste kans: 5% korting bij contante betaling. Gepast, graag.', 'Blokaas: dertig jaar zuinig. Proef het verschil (niet te hard proeven, het is maar een snufje).'];
const SMS_FOOT = '(sms kost ons 9 cent, niet terugsturen)';

// ---------- Pa, Shooki, Razim ----------
function paTalk(kind, s) {
  const cl = s.cname || 'one of your clients';
  if (kind === 'meet') return [['Eddy Jr.', 'Pa, there was a couple across the street with binoculars. Spying on the loods. They said their name is Blokaas.'], ['Freddy Sr.', 'Blokaas! Gert and Wilma? From Almere? Ai, ai, ai.'], ['Freddy Sr.', 'In 1994 they bought one kilo of paprika from me. One kilo. Then every week they came back for a proefzakje. Free samples. For six years, jongen. They built a whole company on my free samples.'], ['Freddy Sr.', 'Gert once asked me for change for the parking meter. There was no parking meter. He just liked the coins.'], ['Freddy Sr.', 'Be careful with them. A cheap man is never cheap for the people around him.']];
  if (kind === 'poach') return [['Freddy Sr.', `They took ${cl}? With a discount, of course. Gert sells by the gram and Wilma weighs the gram.`], ['Eddy Jr.', 'They say they have a "smaakje" I don\'t have.'], ['Freddy Sr.', 'Every cheap mix has one trick, jongen. Find the trick, and the trick is finished.'], ['Freddy Sr.', 'And those two talk when something is free. And when they think nobody listens. Like all gossips.']];
  if (kind === 'recipe') return [['Eddy Jr.', 'Fenegriek, Pa. And Ve-tsin on top.'], ['Freddy Sr.', 'Fenegriek! Smells like curry, costs nothing, makes the kip smell rich. Clever. And then the Ve-tsin, hah.'], ['Freddy Sr.', 'Your grandfather called Ve-tsin "de leugen in een zakje". You use the fenegriek, honest, and you leave the lie in their sack.']];
  if (kind === 'exposed') return [['Freddy Sr.', 'Blokaas in the Krant! Wilma will buy ten copies. No. She will read it in the library. For free.'], ['Freddy Sr.', 'Thirty years I waited for this, jongen. Go and make your Polder Shoarma. Make it good.']];
  if (kind === 'bought') return [['Freddy Sr.', 'You paid them? Hm.'], ['Freddy Sr.', '...Good. A Blokaas with money in the sock is quiet for a year. They are busy counting it.']];
  if (kind === 'smack') return [['Freddy Sr.', 'With the Maboota? Eddy. They are pensioners.'], ['Eddy Jr.', 'They were spying, Pa.'], ['Freddy Sr.', '...Did they leave anything behind when they ran? Then it was a little bit worth it.']];
  if (kind === 'coffee') return [['Eddy Jr.', 'I gave the Blokaas a coffee.'], ['Freddy Sr.', 'Free coffee for Gert Blokaas? Then you know everything about him now. That man has never kept a secret next to a free biscuit.']];
  return [['Freddy Sr.', 'The Blokaas again? On my pavement? With the binoculars?'], ['Freddy Sr.', 'Let them look, jongen. Looking is free. Copying is hard. They never could.']];
}
function shookiTalk(kind, s) {
  const cl = s.cname || 'that client';
  if (kind === 'meet') return [['Shooki', 'Bro! The two old people with the binoculars? That is Blokaas, from Almere!'], ['Shooki', 'They came on BIKES, bro. From Almere. Twenty-eight kilometres to save on diesel. I offered them a ride in the Kangoo. They asked how much.'], ['Shooki', 'Then they tried to sell me a proefzakje. For money, bro. A proefzakje for money.']];
  if (kind === 'poach') return [['Shooki', `Bro, ${cl} went to Blokaas. Their mix is cheap but it has this smell, like... curry? My aunt's kitchen?`], ['Shooki', 'Find out what it is, bro. I will drive you anywhere. For petrol money. Joking. Half petrol money.']];
  if (kind === 'recipe') return [['Shooki', 'FENEGRIEK! Bro, that is the smell! My aunt puts it in everything, even the tea!'], ['Shooki', 'Polder Shoarma, bro. I am putting it on the Kangoo. Big letters. Glossy. Both sides.']];
  if (kind === 'exposed') return [['Shooki', 'Bro, you are in the paper again. Well, THEY are. You are the hero of the paper. Slide nine.'], ['Shooki', 'Gert says Ve-tsin is "a sort of herb". Bro, it is a powder. My nephew knows that and he is six.']];
  if (kind === 'bought') return [['Shooki', 'You paid them to go away, bro?'], ['Shooki', 'Respect. That is what rich people do. Rich people pay people to go away. You are rich people now.']];
  if (kind === 'smack') return [['Shooki', 'Bro! You chased two pensioners down the Kipkruidenkade?'], ['Shooki', 'And they were FASTER than you. On opafietsen. I have it on the dashcam, bro. I watched it nine times.']];
  if (kind === 'coffee') return [['Shooki', 'Bro, you gave the Blokaas coffee? They came to the Kangoo after and asked for a refill. For the thermos. For tomorrow.']];
  return [['Shooki', 'Bro, the binoculars are back. Gert waved at me. Then he wrote down that I waved.']];
}
const RAZIM = 'Razim (telefoon)';
function razimTalk(kind) {
  if (kind === 'smack') return [[RAZIM, 'Eddy! You beat up the Blokaas? Gert called me. He wants to sell me the story. Fifty Wilders. I offered thirty.'], [RAZIM, 'He took thirty. He always takes the money, Eddy. Shoarma?']];
  if (kind === 'exposed' || kind === 'bought') return [[RAZIM, 'Eddy! You went to ALMERE! Nobody goes to Almere on purpose!'], [RAZIM, 'They have free parking there, Eddy. Everywhere. I am thinking of moving.'], [RAZIM, 'Shoarma first. In Kaasland. Where parking is expensive, like God intended.']];
  return [[RAZIM, 'Eddy! Two old people with binoculars outside your door. I sold them a shoarma.'], ['Eddy Jr.', 'And?'], [RAZIM, 'They paid in five-cent coins. All of them. It took eleven minutes. Then they asked for a receipt, and a discount on the receipt.'], [RAZIM, 'These are my kind of people, Eddy. I hate them. Shoarma?']];
}
const RAZIM_TXT = (kind) => (kind === 'smack' ? ['eddy u hit the blokaas??', 'gert sold me the story', '30 wilders', 'shoarma?'] : ['eddy the old people with the binoculars', 'paid me in 5 cent coins', 'ALL of them', 'shoarma?']);

// ---------- the Krant ----------
const STORY = {
  meet: { p: 4.5, head: 'Pensioners "birdwatching" on the Kipkruidenkade', body: 'With binoculars aimed at a spice warehouse. "There is a very rare bird here," said the man, who would not give his name. His wife gave it for him: Blokaas. From Almere.' },
  poach: { p: 5.5, head: 'Almere spice firm muscles into Kipkruidenkwartier', body: 'Blokaas Specijeren undercuts local suppliers by twenty percent. "Quality costs money, and we do not like spending money," says co-owner Wilma Blokaas.' },
  smack: { p: 6.5, head: 'Pensioners chased off the Kipkruidenkade', body: 'Two elderly cyclists fled "at remarkable speed" after a scuffle outside a spice warehouse. A thermos was found in the gutter. It has not been claimed. It is reportedly still warm.' },
  recipe: { p: 4, head: 'Local spice trader launches "Polder Shoarma"', body: 'Snackbar owners talk of "a smell of curry, but honest". The competition from Almere declined to comment, then asked whether the comment would be paid.' },
  exposed: { p: 9.5, head: 'Almere spice firm\'s "secret" turns out to be flavour powder', body: 'Blokaas Specijeren cut its famous Polderkruiden with Ve-tsin. Gert Blokaas: "Ve-tsin is also a herb. Sort of. A powder." Snackbars in Kipkruidenkwartier are switching back to a family business.' },
  bought: { p: 5, head: 'Almere snackbars switch suppliers', body: 'A dozen snackbars in Almere-Buiten now buy from Eddy & Zn. Their old supplier is said to be "very happy with the price". He was seen counting it twice on a bench.' },
};
const LETTERS = [
  'Letter: "That spice warehouse on the Kipkruidenkade leaves its lights on in broad daylight. Disgraceful. Somebody pays for that." W.B., Almere',
  'Letter: "Is it normal for a delivery van to idle for four minutes? I counted. Four minutes." G.B., Almere-Buiten',
  'Letter: "My husband and I were birdwatching and a young man stared at us. Very rude. We had paid for nothing." W.B., Almere',
];

export function createBlokaas(d) {
  const { scene, lam, box, passerBy, personBubble, animate, player, dad, state, econ, folk, addInteract, dialogue, choice, toast, beep } = d;
  const S = () => { const s = state.blokaas && typeof state.blokaas === 'object' ? state.blokaas : (state.blokaas = {}); s.stage = s.stage | 0; s.clues = s.clues || {}; s.due = s.due || {}; if (!Array.isArray(s.sms)) s.sms = []; return s; };
  const day = () => econ.ensure().day;
  const nClues = () => ['fen', 'vetsin', 'lijst'].filter((k) => S().clues[k]).length;

  // ---------- the stake-out: built the first time they come (two people, binoculars, a notebook, a thermos, two old bikes) ----------
  const SPOT = { x: -3.0, z: 11.35 }; // the far pavement, right across from the warehouse's loading door
  let root = null, gert, wilma, fg, fw, bino, cup, bikes, built = false;
  function build() {
    if (built) return; built = true;
    root = new THREE.Group(); root.position.set(SPOT.x, 0, SPOT.z); root.visible = false; scene.add(root);
    gert = passerBy(9011, { look: { shirt: '#6a6a4a', pants: 0x4a4840, shoes: 0x5a3a1a, grey: true, glasses: true } });
    wilma = passerBy(9017, { look: { female: true, shirt: '#9a7ab8', pants: 0x3a3a48, shoes: 0x2a2a2a, grey: true, glasses: true } });
    root.add(gert, wilma);
    gert.position.set(0, 0, 0); gert.rotation.y = Math.PI - 0.35; wilma.position.set(-0.85, 0, 0.15); wilma.rotation.y = Math.PI + 0.45;
    fg = folk.pose(gert, ['photo', 'photo']); fw = folk.pose(wilma, ['cup', 'board']);
    // the binoculars: two barrels and a bridge, at the eyes (or hanging at the chest when he pretends not to look)
    bino = new THREE.Group(); bino.scale.setScalar(1.35); gert.userData.body.add(bino);
    { const blk = lam({ color: 0x2a2e2a }), lens = lam({ color: 0x6a8aa0, emissive: 0x101820 });
      for (const sx of [-0.045, 0.045]) { const b0 = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.13, 10), blk); b0.rotation.x = Math.PI / 2; b0.position.set(sx, 0, 0.06); bino.add(b0); const l = new THREE.Mesh(new THREE.CircleGeometry(0.03, 10), lens); l.position.set(sx, 0, 0.126); bino.add(l); }
      box(0.05, 0.03, 0.05, blk, 0, 0, 0.05, bino, false); }
    // Wilma's notebook at her chest, the cup in her hand, the thermos and a folding stool at her feet
    const nb = new THREE.Group(); wilma.userData.body.add(nb); nb.position.set(0.02, 1.05 * (wilma.userData.body.scale.y || 1), 0.27); nb.rotation.x = -0.8;
    box(0.16, 0.22, 0.02, lam({ color: 0x2a4a7a }), 0, 0, 0, nb, false); box(0.14, 0.2, 0.004, lam({ color: 0xf4f0e0 }), 0, 0, 0.012, nb, false);
    cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.08, 10), lam({ color: 0xc8202a })); folk.hold(wilma, 0, cup, 0, -0.7, 0.08);
    bikes = new THREE.Group(); root.add(bikes); // everything that stands still, merged below (phones: ~50 draw calls -> a handful)
    const th = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 12), lam({ color: 0x3a6a3a })); th.position.set(-0.5, 0.16, 0.5); bikes.add(th);
    box(0.36, 0.03, 0.3, lam({ color: 0x3a5a8a }), -1.45, 0.42, 0.25, bikes, false); for (const s2 of [-1, 1]) { const leg = box(0.02, 0.48, 0.02, lam({ color: 0x9a9a9a }), -1.45 + s2 * 0.15, 0.21, 0.25, bikes, false); leg.rotation.z = s2 * 0.35; }
    // two old bikes on their stands behind them: an opafiets with a crate and a transportfiets (Almere to here: 28 km)
    const b1 = makeBikeModel(THREE, 10, 0x2a3a2a), b2 = makeBikeModel(THREE, 11, 0x4a2a3a); b1.position.set(1.4, 0, 0.55); b2.position.set(2.5, 0, 0.75); b1.rotation.y = b2.rotation.y = Math.PI / 2 + 0.15; bikes.add(b1, b2);
    mergeStatic(bikes);
    for (const p of [gert, wilma]) p.userData.base = { pos: p.position.clone(), ry: p.rotation.y };
    addInteract({ obj: gert, pos: () => tmpV.set(SPOT.x - 0.4, 0, SPOT.z), r: 2.1, enabled: () => !!root && root.visible && flee <= 0 && !d.busy(), label: () => (S().met ? 'Gert & Wilma Blokaas · talk' : 'The couple with the binoculars · talk'), act: talk });
  }
  const tmpV = new THREE.Vector3();

  // ---------- the day roll: who comes, what the story does today ----------
  function roll() {
    const s = S(), dd = day();
    if (s.day === dd) return;
    s.day = dd; s.gone = false; s.heard = false; s.coffeeDay = s.coffeeDay || 0;
    const eligible = dd >= 3 && !!state.table;
    if (!s.stage) s.here = eligible;
    else s.here = Math.random() < (s.stage >= 5 ? 0.15 : 0.3);
    if (s.here && ((d.inspectorDue && d.inspectorDue()) || (d.activistsHere && d.activistsHere()))) s.here = false; // one show on the pavement at a time
    // the story moves on with the days
    if (s.stage === 1 && dd >= (s.d1 || 0) + 2 && d.rank() >= 1) poach();
    if (s.stage === 2 && s.clues.fen && s.clues.vetsin && !s.clues.lijst && dd >= (s.c2day || dd) + 2) { // Wilma texts her shopping list to the wrong number
      sms(['Gert, bestel bij De Zuinige Vaart: 40 kg fenegriek, 5 kg Ve-tsin. NIET bij de dure groothandel. Vrijdag is de koffie gratis. x W'], WILMA);
      setTimeout(() => clue('lijst', 'Wilma texted her shopping list to the wrong number: <b>40 kg fenegriek, 5 kg Ve-tsin, Groothandel De Zuinige Vaart, Almere</b>.'), 5200);
    }
    if (s.stage >= 1 && s.stage < 5) {
      if (Math.random() < 0.35) sms([rnd(SMS_ADS)]);
      if (Math.random() < 0.25) s.letter = dd;
    }
    if (s.stage >= 5 && s.how === 'bought') { d.addMoney(60); s.paid = (s.paid || 0) + 60; } // the Almere snackbars Eddy took over pay every day
    d.save();
  }

  // the poaching: a client goes to Blokaas, and pays 20% less until Eddy can match their "smaakje"
  function poach() {
    const s = S(), pool = econ.activeClients().filter((c) => c.id !== 'schmatzel');
    if (!pool.length) return;
    const c = rnd(pool); s.stage = 2; s.cid = c.id; s.cname = c.name;
    queue('poach');
    note('poach');
    setTimeout(() => {
      toast('BLOKAAS PAKT EEN KLANT', `<b>${c.name}</b> now buys the cheap Blokaas Polderkruiden, "with a smaakje", and pays you 20% less until you can match it. <br>Find out what's in their mix: catch them across the street. They talk when it's free, and when they think nobody's listening.`, 9);
      sms([`Beste Eddy, ${c.name} neemt voortaan bij ons af. 20% goedkoper, en wij hebben een smaakje. Groetjes, Gert & Wilma`]);
    }, 2500);
    d.save();
  }
  function clue(k, html) {
    const s = S(); if (s.clues[k] || s.stage !== 2) return;
    s.clues[k] = day(); if (nClues() === 2) s.c2day = day();
    beep(880, 0.08, 'triangle', 0.05); setTimeout(() => beep(1175, 0.1, 'triangle', 0.05), 90);
    toast(`HET BLOKAAS-RECEPT · ${nClues()}/3`, html, 6.5);
    if (nClues() >= 3) setTimeout(crack, 6800);
    d.save();
  }
  function crack() {
    const s = S(); if (s.stage !== 2) return;
    s.stage = 3; state.blokaasRecept = true;
    dialogue([['Eddy Jr.', 'Fenegriek for the smell, Ve-tsin so nobody tastes how cheap the rest is. That is their whole "smaakje".'], ['Eddy Jr.', 'I can do the fenegriek. Real paprika, real komijn, and no powder. Polder Shoarma, Eddy & Zn style.']], () => {
      toast('RECIPE CRACKED: POLDER SHOARMA', `Fenegriek is on the Kruidenbeurs now, and <b>Polder Shoarma</b> is on the mixing table. ${s.cname ? `<b>${s.cname}</b> is back, at your old price.` : ''} ${state.act1 ? 'Their hall is in Almere: A1, then the A6 over the IJmeer. It is on the map.' : 'Their hall is in Almere. Once the Lampas are dealt with, you will have time for a trip over the IJmeer.'}`, 9);
      sms(['Wie heeft er gepraat?? GERT.'], WILMA);
    });
    queue('recipe'); note('recipe');
    d.save();
  }

  // ---------- after something happens: Pa now or later, Shooki later, Razim calls ----------
  function queue(kind) {
    const s = S(); s.last = kind; s.n = (s.n || 0) + 1;
    s.due.freddy = kind; // Pa hears about it once he is home (debrief waits for freddy.back())
    if (d.metShooki()) s.due.shooki = kind;
    if (['meet', 'smack', 'exposed', 'bought'].includes(kind) && s.razimDay !== day()) { s.razimDay = day(); s.due.razim = kind; s.razimIn = 40 + Math.random() * 40; }
    d.save();
  }
  function note(kind) { if (d.fact) d.fact('blokaas_' + kind, {}); }
  function debrief(who) {
    const s = S(), kind = s.due[who]; if (!kind || d.busy()) return false;
    if (who === 'freddy' && !(d.freddy() && d.freddy().back())) return false;
    s.due[who] = null; d.save();
    dialogue(who === 'freddy' ? paTalk(kind, s) : shookiTalk(kind, s));
    return true;
  }
  function callRazim() {
    const s = S(), ph = d.phone(), kind = s.due.razim;
    if (!ph || !ph.ringWith || !kind) { s.due.razim = null; return; }
    const ok = ph.ringWith('razimBlokaas', { name: 'Razim', img: './assets/face_razim.jpg',
      talk: () => { s.due.razim = null; d.save(); dialogue(razimTalk(kind)); },
      missed: () => { s.due.razim = null; ph.razimText(RAZIM_TXT(kind)); d.save(); } });
    if (!ok) s.razimIn = 15;
  }

  // ---------- their texts on the Shmokia ----------
  let smsEl = null, smsQ = [], smsShow = 0, smsGap = 0;
  function sms(lines, from = 'Blokaas Specijeren') { for (const t of lines) smsQ.push({ t, from }); }
  function smsCard() {
    if (smsEl) return smsEl;
    smsEl = document.createElement('div'); smsEl.id = 'blksms';
    smsEl.style.cssText = 'position:fixed;right:18px;bottom:250px;display:none;align-items:center;gap:10px;max-width:290px;padding:8px 12px 8px 8px;background:rgba(36,24,52,.95);border:2px solid #a888d0;border-radius:12px;color:#f0e8f8;font:400 13.5px Rubik,Arial,sans-serif;z-index:30;box-shadow:0 0 14px rgba(168,136,208,.4)';
    smsEl.innerHTML = '<img alt="" style="width:40px;height:50px;object-fit:cover;border:2px solid #cbb8ec;border-radius:6px;flex:none"><div><b class="bk-f" style="display:block;color:#cbb8ec;font-weight:700;font-size:12px;letter-spacing:1px"></b><span class="bk-t"></span><small style="display:block;opacity:.6;font-size:10.5px;margin-top:2px"></small></div>';
    document.body.appendChild(smsEl); return smsEl;
  }
  function tickSms(dt) {
    if (smsShow > 0 && (smsShow -= dt) <= 0 && smsEl) smsEl.style.display = 'none';
    if (!smsQ.length || smsShow > 0 || d.busy() || !d.ready()) return;
    if ((smsGap -= dt) > 0) return;
    const m = smsQ.shift(), s = S(), el = smsCard();
    s.sms.push({ t: m.t, from: m.from, d: day() }); if (s.sms.length > 30) s.sms.splice(0, s.sms.length - 30); s.unread = (s.unread || 0) + 1;
    el.querySelector('img').src = m.from === WILMA ? './assets/face_wilma.jpg' : './assets/face_gert.jpg';
    el.querySelector('.bk-f').textContent = `SMS · ${m.from.toUpperCase()}`; el.querySelector('.bk-t').textContent = m.t; el.querySelector('small').textContent = m.from === WILMA ? '(niet voor jou bedoeld?)' : SMS_FOOT;
    el.style.display = 'flex'; smsShow = 5.5; smsGap = 2; beep(1320, 0.05, 'square', 0.03); setTimeout(() => beep(1320, 0.05, 'square', 0.03), 120);
    d.save();
  }

  // ---------- per frame on the home street ----------
  let chatT = 4, flee = 0, seq = null, alert = 0, caughtCd = 0;
  const say = (who, t) => personBubble(who === 'w' ? wilma : gert, t, who === 'w' ? WC : GC, who === 'w' ? 'Wilma' : 'Gert');
  function tickB(o, dt) { const b = o && o.userData.bubble, u = b && b.userData; if (u && u.life > 0 && (u.life -= dt) <= 0) b.visible = false; }
  function play(lines, then) { seq = { lines: lines.slice(), t: 0, then }; } // a little conversation in balloons, one line every ~2.4 s
  function update(dt) {
    tickSms(dt);
    if (d.ready()) roll();
    const s = S();
    if (s.due.razim && s.razimIn > 0 && d.ready() && !d.busy() && !d.hidden()) { s.razimIn -= dt; if (s.razimIn <= 0) callRazim(); }
    const on = (!!s.here && !s.gone || flee > 0) && d.ready() && !d.hidden();
    if (!on) { if (root) root.visible = false; return; }
    build(); root.visible = true;
    tickB(gert, dt); tickB(wilma, dt); tickB(player, dt);
    if (flee > 0) { fleeTick(dt); return; }
    const P = player.position, dx = P.x - SPOT.x, dz = P.z - SPOT.z, dist = Math.hypot(dx, dz), busy = d.busy();
    const behind = dz > 0.45 && dist < 3.4; // on the canal side of them: they are looking the other way
    const seen = !behind && dist < 7.5 && dz < 1.5;
    // binoculars up while he is far, down at the chest when he comes close from the front
    const up = !seen || dist > 7.5;
    bino.position.set(0, (up ? 1.52 : 1.13) * (gert.userData.body.scale.y || 1), up ? 0.2 : 0.24); bino.rotation.x = up ? 0 : 1.2;
    fg.hands[0] = fg.hands[1] = up ? 'photo' : null;
    { const want = up ? Math.PI - 0.35 + Math.sin(performance.now() / 2400) * 0.25 : Math.atan2(dx, dz); gert.rotation.y += Math.atan2(Math.sin(want - gert.rotation.y), Math.cos(want - gert.rotation.y)) * Math.min(1, dt * 2.5); }
    { const want = seen ? Math.atan2(P.x - SPOT.x + 0.85, P.z - SPOT.z - 0.15) : Math.PI + 0.45; wilma.rotation.y += Math.atan2(Math.sin(want - wilma.rotation.y), Math.cos(want - wilma.rotation.y)) * Math.min(1, dt * 2.5); }
    animate(gert, 0, dt); animate(wilma, 0, dt);
    if (busy) return;
    // Eddy steps out on to the street on a spying day: he notices the glint across the road (once a day)
    if (s.cue !== s.day && P.z > -7 && P.z < 2 && Math.abs(P.x - SPOT.x) < 16) {
      s.cue = s.day; d.save();
      personBubble(player, s.met ? rnd(['Hm. The Blokaas again. Across the street.', 'Binoculars at two o\'clock. Gert and Wilma.', 'Of course. The Blokaas are back.']) : 'Huh? Somebody across the street is watching the loods. With binoculars.', '#ffd36b', 'Eddy Jr.');
      if (!s.met) toast('SOMEBODY IS WATCHING', 'Two people on the far pavement, right across from your loading door, with binoculars and a notebook. Go and ask what they want.', 6);
    }
    if (caughtCd > 0) caughtCd -= dt;
    if (seq) { // a conversation in balloons
      if ((seq.t -= dt) <= 0) { const l = seq.lines.shift(); if (l) { say(l[0], l[1]); seq.t = 2.5; } else { const th = seq.then; seq = null; if (th) th(); } }
      return;
    }
    // sneaking up behind them: they gossip (and after the poaching, they give the Ve-tsin away)
    if (behind && !s.heard && dist < 3.0) {
      s.heard = true;
      if (s.stage === 2 && !s.clues.vetsin) play(OVERHEAR.slice(0, 3), () => { clue('vetsin', 'Overheard behind their backs: they cut the Polderkruiden with <b>Ve-tsin</b> (flavour powder), so nobody tastes how cheap the rest is.'); setTimeout(() => say('w', rnd(NOTICED)), 1600); });
      else play(rnd(GOSSIP), () => setTimeout(() => { if (root.visible) say('w', rnd(NOTICED)); }, 1200));
      return;
    }
    if (seen && dist < 6 && caughtCd <= 0) { caughtCd = 14; say(Math.random() < 0.6 ? 'g' : 'w', rnd(s.stage >= 5 && s.how === 'bought' ? ['Dit is geen verrekijker. Dit is een operakijker. Staat niet in het contract.', 'Wij kijken alleen. Dat mag. Dat hebben we nagevraagd. Gratis.'] : CAUGHT)); return; }
    // counting sacks while he is in sight
    chatT -= dt;
    if (chatT <= 0 && dist < 26) { chatT = 7 + Math.random() * 6; if (Math.random() < 0.55) say('g', rnd(SPY_G)); else say('w', rnd(SPY_W)); }
  }
  function tick(dt) { // the texts and Razim's call while the stake-out is not on screen (on other days, in the warehouse)
    if (root && root.visible) return;
    const s = S();
    if (!d.ready()) return;
    if (s.here && !s.gone && !d.hidden()) return; // update() handles it
    tickSms(dt);
    if (s.due.razim && s.razimIn > 0 && !d.busy() && !d.hidden()) { s.razimIn -= dt; if (s.razimIn <= 0) callRazim(); }
  }

  // ---------- talking to them ----------
  function talk() {
    const s = S(); if (d.busy()) return;
    if (!s.met) { meet(); return; }
    const opts = ['What are you doing here?', `Offer them a coffee (W 2)`, 'Leave them to it'];
    choice('Gert & Wilma Blokaas', `<i>${s.stage >= 5 ? (s.how === 'bought' ? 'The opera glasses come down, very slowly.' : 'Gert hides behind the binoculars. Wilma glares at you over hers.') : 'Two pairs of binoculars, one notebook, one thermos.'}</i><br><small style="opacity:.75">Blokaas Specijeren · Almere-Buiten</small>`, opts, (i) => {
      if (i === 0) ask();
      else if (i === 1) coffee();
    });
  }
  function meet() {
    const s = S();
    dialogue([
      ['Eddy Jr.', 'Can I help you? You have been staring at my warehouse for an hour.'],
      [GERT, 'Wij? Nee hoor. Wij... tellen vogels.'],
      [WILMA, 'Met een verrekijker van de kringloop. Vijf Wilder. Afgedongen van zeven.'],
      ['Eddy Jr.', 'They are pointed at my loading door.'],
      [GERT, '...Blokaas. Gert Blokaas. Dit is mijn vrouw, Wilma. Blokaas Specijeren, Almere-Buiten.'],
      [WILMA, 'Wij mengen ook kruiden, jongen. Al dertig jaar. Goedkoper dan jij.'],
      [GERT, 'Veel goedkoper. En wij hebben een smaakje dat jij niet kent.'],
      ['Eddy Jr.', 'So you came all the way from Almere to look at me.'],
      [WILMA, 'Op de fiets. Achtentwintig kilometer. De trein kost geld.'],
      [GERT, 'Wij komen terug, hoor. Wij kijken graag. Kijken is gratis.'],
    ], () => {
      s.met = true; s.stage = Math.max(1, s.stage); s.d1 = day(); queue('meet'); note('meet');
      toast('RIVALS: BLOKAAS SPECIJEREN', 'A spice mixer from Almere, run by Gert and Wilma Blokaas. Cheaper than you, and proud of it. They will be back with the binoculars.', 7);
      d.save();
    });
  }
  function ask() {
    const s = S();
    const pool = s.stage >= 5 ? (s.how === 'exposed'
      ? [[[GERT, 'Dankzij jou staan we in de krant. Weet je wat een krant kost? Een Wilder vijftig!'], [WILMA, 'Wij hebben hem in de bibliotheek gelezen. Gratis. Dat dan weer wel.']], [[WILMA, 'Wij kijken alleen nog. Wij leren. Wat doe jij met je fenegriek?'], ['Eddy Jr.', 'I pay for it, Wilma.'], [WILMA, 'Bah.']]]
      : [[[GERT, 'Wij houden ons aan het contract. Geen verrekijker binnen vijfhonderd meter.'], ['Eddy Jr.', 'Those are binoculars, Gert.'], [GERT, 'Operakijker. Heel ander apparaat.']], [[WILMA, 'Het geld staat op de spaarrekening. 0,4 procent. Wij zijn heel gelukkig.']]])
      : s.stage >= 3 ? [[['Eddy Jr.', 'Fenegriek, Gert. I know.'], [GERT, 'Wij weten niet waar je het over hebt.'], [WILMA, '...Wie heeft er gepraat? GERT.']], [['Eddy Jr.', 'Ve-tsin, Wilma. Really?'], [WILMA, 'Ve-tsin is ook een kruid.'], [GERT, 'Een soort kruid.'], [WILMA, 'Een poedertje.']]]
      : s.stage === 2 ? [[['Eddy Jr.', 'You took my client.'], [GERT, 'Wij hebben niks gepakt. Hij kwam vanzelf. Voor twintig procent minder.'], [WILMA, 'Het smaakje, jongen. Daar gaat het om.']], [['Eddy Jr.', 'What is in your mix?'], [WILMA, 'Dat is geheim.'], [GERT, 'Het is een heel goedkoop geheim.'], [WILMA, 'GERT.']]]
      : [[['Eddy Jr.', 'Back again?'], [GERT, 'Wij kwamen toevallig langs. Achtentwintig kilometer toevallig.']], [['Eddy Jr.', 'Don\'t you have your own business to run?'], [WILMA, 'Die draait vanzelf. Wij hebben de verwarming uitgezet, dan werkt het personeel sneller.']], [['Eddy Jr.', 'How is business in Almere?'], [GERT, 'Uitstekend. Wij hebben vorige maand een nieuwe pen gekocht.'], [WILMA, 'Voor het bedrijf. Aftrekbaar.']]];
    dialogue(rnd(pool));
  }
  function coffee() {
    const s = S();
    if (d.money() < 2) { toast('NO WILDERS', 'Not even two Wilders for a coffee. The Blokaas would be proud.', 3); return; }
    if (s.coffeeDay === day()) { dialogue([[WILMA, 'We hebben er vandaag al één gehad. Maar... als hij toch gratis is?'], [GERT, 'Doe maar in de thermos.']], () => d.addMoney(-2)); return; }
    d.addMoney(-2); s.coffeeDay = day();
    const lines = COFFEE.map(([w, t]) => [w === 'w' ? WILMA : GERT, t]);
    if (s.stage === 2 && !s.clues.fen) {
      lines.push([GERT, 'Weet je wat ook bijna gratis is, jongen? Ons smaakje. Twee schepjes fenegriek per kilo. Ruikt naar kerrie, kost een paar centen, en...'], [WILMA, 'GERT!'], [GERT, '...en verder niks. Lekkere koffie.']);
      dialogue(lines, () => clue('fen', 'Gert, over a free coffee: <b>two scoops of fenegriek per kilo</b>. That is the curry smell in their Polderkruiden.'));
    } else dialogue(lines, () => { if (Math.random() < 0.5) queue('coffee'); });
    d.save();
  }

  // ---------- the Maboota: they run for their bikes, Wilma drops her shopping list ----------
  function melee(f) {
    if (!root || !root.visible || flee > 0) return false;
    const P = player.position, w = new THREE.Vector3(SPOT.x - 0.4, 0, SPOT.z), dv = w.clone().sub(P); dv.y = 0;
    if (dv.length() > 2.0 || dv.normalize().dot(f) < 0.1) return false;
    const s = S(); flee = 4.2; s.gone = true; seq = null;
    say('g', rnd(FLEE)); setTimeout(() => { if (root.visible) say('w', rnd(FLEE)); }, 500);
    const hit = rnd([gert, wilma]); hit.userData.body.rotation.x = -0.4;
    if (s.stage === 2 && !s.clues.lijst) setTimeout(() => clue('lijst', 'Wilma dropped her shopping list running for the bikes: <b>40 kg fenegriek, 5 kg Ve-tsin, Groothandel De Zuinige Vaart, Almere</b>.'), 1200);
    else setTimeout(() => toast('DROPPED IN THE RUSH', rnd(['A booklet of coupons: "Gratis koffie bij de woonboulevard (bij besteding vanaf W 40)".', 'A bag of sugar cubes, clearly from a café.', 'Four ketchup sachets and a hotel shampoo.']), 4), 1200);
    if (s.met) { queue('smack'); note('smack'); }
    d.save(); return true;
  }
  function fleeTick(dt) {
    flee -= dt;
    for (const p of [gert, wilma]) { p.position.x += 5.2 * dt; p.rotation.y = Math.PI / 2; p.userData.body.rotation.x *= 0.9; animate(p, 5.2, dt); }
    bikes.position.x += 5.2 * dt;
    if (flee <= 0) { root.visible = false; for (const p of [gert, wilma]) { p.position.copy(p.userData.base.pos); p.rotation.y = p.userData.base.ry; } bikes.position.x = 0; }
  }

  // ---------- Almere: the showdown at their hall (js/wijk.js WIJKEN.almere, Blokaas Specijeren is one of its shop fronts) ----------
  let hall = null;
  const almereOpen = () => S().stage >= 3 && !!state.act1;
  function onEnter(t) {
    if (!t || t.key !== 'almere') return;
    const door = t.shops && t.shops['Blokaas Specijeren'] && t.shops['Blokaas Specijeren'].door; if (!door) return;
    if (!hall) {
      hall = { g: new THREE.Group(), door };
      const g2 = passerBy(9011, { look: { shirt: '#6a6a4a', pants: 0x4a4840, shoes: 0x5a3a1a, grey: true, glasses: true } }), w2 = passerBy(9017, { look: { female: true, shirt: '#9a7ab8', pants: 0x3a3a48, shoes: 0x2a2a2a, grey: true, glasses: true } });
      g2.position.set(door.x - 1.3, 0, door.z + 0.6); w2.position.set(door.x + 0.2, 0, door.z + 0.7); g2.rotation.y = 0.2; w2.rotation.y = -0.3; hall.g.add(g2, w2); hall.ppl = [g2, w2];
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.5), lam({ map: d.signTex([{ t: 'BEL KAPOT', size: 40 }, { t: 'klop zachtjes, de deur is duur', size: 20 }], '#f4f0e0', '#3a2458', 512, 170) })); sg.position.set(door.x + 1.1, 1.7, door.z - 0.55); hall.g.add(sg);
      scene.add(hall.g); t.objs.push(hall.g); // hidden with the town when Eddy leaves
      addInteract({ pos: () => new THREE.Vector3(door.x - 0.5, 0, door.z + 0.6), r: 2.2, enabled: () => !!(d.wijk() && d.wijk().town === t) && !d.busyAway() && hall.g.visible, label: () => (S().stage >= 5 ? 'Gert & Wilma Blokaas · say hello' : 'Blokaas Specijeren · have it out with them'), act: showdown });
    }
    hall.g.visible = true;
    if (d.route && S().stage < 5) d.route(door.x, door.z, 'Blokaas Specijeren');
  }
  function showdown() {
    const s = S();
    if (s.stage >= 5) { dialogue(rnd([[[WILMA, 'Jij weer. Parkeren is hier gratis, dus blijf maar staan. Kopen doen we niks.']], [[GERT, 'Kom je de hal bekijken? Vijftien jaar oud, nooit verwarmd. Het personeel draagt twee jassen.']]])); return; }
    if (s.stage < 3) { dialogue([[WILMA, 'Wat kom jij hier doen? Wij hebben niks te zeggen.'], [GERT, 'Zeker niet over fenegriek. Of zo.'], [WILMA, 'GERT.']]); return; }
    dialogue([
      [WILMA, 'Kijk eens wie daar is. Helemaal uit Kaasland. Met de bus. Diesel, Gert.'],
      [GERT, 'Zonde, Wilma. Zonde.'],
      ['Eddy Jr.', 'You stood outside my warehouse with binoculars. You took my client with fenegriek and a sack of Ve-tsin.'],
      [GERT, 'Ve-tsin is ook een kruid.'], [WILMA, 'Een soort kruid.'], [GERT, 'Een poedertje.'],
      ['Eddy Jr.', 'This ends today.'],
    ], () => {
      const money = d.money();
      choice('Blokaas Specijeren', 'Wilma has her notebook out. Gert has his hand on his wallet, out of habit.', ['Tip off the Krant: the Ve-tsin', `Buy their Almere clients (W 750)${money < 750 ? ' · not enough' : ''}`, 'Not today'], (i) => {
        if (i === 0) {
          dialogue([['Eddy Jr.', 'I have Wilma\'s shopping list. Five kilo of Ve-tsin. The Krant voor het Kaasvolk will love it.'], [WILMA, 'Dat durf je niet.'], ['Eddy Jr.', 'It is free publicity, Wilma. You love free.'], [GERT, '...Wilma. Pak de fietsen.']], () => settle('exposed'));
        } else if (i === 1) {
          if (money < 750) { toast('NOT ENOUGH WILDERS', 'W 750. Gert can smell exactly how much you have, and it is less.', 3.5); return; }
          d.addMoney(-750);
          dialogue([['Eddy Jr.', 'Seven hundred and fifty Wilders. For your client list here in Almere, and you stay out of Kipkruidenkwartier.'], [GERT, '...Contant?'], ['Eddy Jr.', 'Contant.'], [WILMA, 'Gert, tel het. Twee keer.'], [GERT, 'Afgesproken. Geen verrekijker binnen vijfhonderd meter.'], [WILMA, '(zachtjes) Een operakijker is geen verrekijker, Gert.']], () => settle('bought'));
        }
      });
    });
  }
  function settle(how) {
    const s = S(); s.stage = 5; s.how = how; s.ends = day();
    if (how === 'exposed') { econ.addRep(150); toast('BLOKAAS EXPOSED', 'Tomorrow\'s Krant has their Ve-tsin on the front page. +150 reputation. They will still come and look, now and then. Looking is free.', 7); }
    else { econ.addRep(60); toast('BLOKAAS BOUGHT OFF', 'Their Almere snackbars buy from you now: <b>+W 60 every market day</b>. They promised: no binoculars within 500 metres.', 7); }
    queue(how); note(how);
    if (d.route) d.route(null);
    d.save();
  }

  // ---------- hooks for the rest of the game ----------
  const sellBias = (cid) => (S().stage === 2 && S().cid === cid ? 0.8 : 1); // the poached client pays 20% less
  function stories(y) { // facts from yesterday -> the Krant (js/kaasweer.js)
    const out = [];
    for (const k of Object.keys(STORY)) if (y.some((f) => f.kind === 'blokaas_' + k)) out.push(STORY[k]);
    const s = S(); if (s.letter === day() - 1 && s.stage < 5) out.push({ p: 2.5, head: 'Letters to the editor', body: LETTERS[(day() * 7) % LETTERS.length] });
    return out;
  }
  const smallAd = (dd) => (S().stage >= 1 && S().stage < 5 && dd % 2 === 0 ? 'BLOKAAS SPECIJEREN, Almere-Buiten. Kruiden voor de prijs van zand. Afhalen alleen (bezorgen kost geld). Gepast betalen.' : null);
  const extraContacts = () => (S().met ? [{ l: 'Blokaas Specijeren', r: S().unread ? `${S().unread} sms` : '', go: 'blokaas' }] : []);
  function phoneScreen(ctx) {
    const s = S();
    return { t: 'Blokaas Specijeren', items: [
      { l: 'Bellen', act: () => ctx.say(s.stage >= 3 && Math.random() < 0.5 ? '"Met Wilma. ...Jij." *klik*' : '"U belt met Blokaas Specijeren. Deze voicemail kost ons geld. Wees kort. Piep."') },
      { l: 'Berichten', r: `${s.sms.length}`, go: 'blokaasSms' },
    ], foot: 'Almere-Buiten · gepast betalen' };
  }
  function smsScreen(ctx) {
    const s = S(); s.unread = 0; const list = s.sms.slice().reverse();
    return { t: 'Blokaas > Berichten', items: list.length ? list.map((m) => ({ l: m.t.slice(0, 22) + (m.t.length > 22 ? '…' : ''), act: () => ctx.say(`dag ${m.d}, ${m.from}: "${m.t}"`) })) : [{ l: '(nog niks)' }], foot: 'Terugsturen kost ook 9 cent.' };
  }
  const mapState = () => ({ known: !!S().met, open: almereOpen() });
  function mapInfo(van) {
    const s = S();
    const what = s.stage >= 5 ? (s.how === 'exposed' ? 'Exposed in the Krant. They still mix, quietly, and still come and look.' : 'Bought off. Their Almere snackbars buy from you now.') : s.stage >= 3 ? 'You know their recipe now. Time to have it out with them.' : s.stage === 2 ? `They took <b>${s.cname || 'a client'}</b>. Find out what is in their mix first (${nClues()}/3 clues).` : 'Cheaper than you, and proud of it.';
    const go = almereOpen() ? (van ? '<button class="b95" id="goAlm">Drive to Almere (A1, A6)</button>' : '<i>Drive there in the Oofmobiel.</i>') : s.stage >= 3 ? '<i>Beat the Lampas first. Then you will have time for Almere.</i>' : '';
    return `<b>Blokaas Specijeren</b>: Gert and Wilma Blokaas's spice hall on Bedrijventerrein De Zuinige Vaart, Almere-Buiten. Over the IJmeer on the A6. ${what} ${go}`;
  }
  return { update, tick, debrief, melee, sellBias, stories, smallAd, extraContacts, phoneScreen, smsScreen, mapState, mapInfo, almereOpen, onEnter, state: S, here: () => !!(root && root.visible),
    // test hooks
    spawn: () => { const s = S(); s.day = day(); s.here = true; s.gone = false; s.heard = false; }, clue, poach, crack, settle, talk };
}
