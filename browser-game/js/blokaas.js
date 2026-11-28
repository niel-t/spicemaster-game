// Blokaas Specijeren (2026-11-28): Eddy's rival spice mixer, from Almere, across the IJmeer. Hans and Conny Blokaas run it,
// a husband and wife who have never paid full price for anything (Tristan 2026-11-28: Hans is autistic and nearing
// retirement; Conny always plays the victim, about the business and about her private life). Hans is precise, literal
// and lives by his routines: he counts everything, says exactly what is true and has no use for small talk, which is
// also why a straight question gets a straight answer out of him. The jokes are about stinginess and Conny's moaning,
// never about who Hans is. They undercut everybody, sell a "smaakje" nobody else has, and they want Eddy & Zn small again. On some market days they stand on the far pavement, right across the street
// from the warehouse, with a pair of kringloop binoculars and a notebook, counting every sack that goes in.
//
// The story, gated by progress:
//   1  the first sighting (day 3+, once there is a mixing table): Eddy walks over, they introduce themselves, sort of
//   2  they poach a client (two days later, rank Mengmeester): it pays 20% less until Eddy can match their "smaakje"
//      Three clues give their recipe away: a coffee and a straight question get a straight answer out of Hans (fenegriek), sneaking up behind them while they
//      gossip (Ve-tsin), and Conny's shopping list (a Maboota smack makes her drop it, or a text she sends to the wrong
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
import { INGREDIENTS, BLENDS } from './economy.js';

const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const HANS = 'Hans Blokaas', CONNY = 'Conny Blokaas';
export const BLK_FACES = { [HANS]: './assets/face_hans.jpg', [CONNY]: './assets/face_conny.jpg', [`${HANS} (telefoon)`]: './assets/face_hans.jpg', [`${CONNY} (telefoon)`]: './assets/face_conny.jpg' };
// their 3D looks, from Tristan's photos (2026-11-28): Hans with swept brown-grey hair, a grey jacket over a blue checked
// shirt; Conny with wavy brown shoulder-length hair and a pink floral top
const HANS_LOOK = { look: { shirt: '#6a6a5e', pants: 0x3a3c44, shoes: 0x3a2a1a, hair: '#8c7a5e', skin: 0xe8b090, bald: false, glasses: false } };
const CONNY_LOOK = { look: { female: true, shirt: '#f0c4cc', pants: 0x2a2a34, shoes: 0x2a2a2a, hair: '#8a5a30', skin: 0xf0c0a4, long: true, glasses: false } };
const GC = '#cbb8ec', WC = '#efc6e6'; // their balloon colours: rival lilac

// ---------- what they say ----------
// counting, from behind the binoculars (Eddy in sight, a fair way off)
const SPY_G = ['Zestien zakken komijn sinds tien over acht. Conny, schrijf op: zestien.', 'Het licht in de loods brandt al drie uur en twaalf minuten. Overdag.', 'Bestelbus. Motor draait. Veertien over twee. Noteren.', 'Een nieuwe pallet. Een tweedehands pallet kost de helft. Dat is een feit.', 'Hij geeft zijn personeel koffie. Dat zijn ongeveer tweehonderd kopjes per maand.', 'Om half één eten wij een boterham. Het is nu vijf voor half.', 'Nog tweehonderdveertien werkdagen tot mijn pensioen. Tweehonderddertien na vandaag.', 'Weer een vrachtwagen. Hij bestelt veel te veel. Dat is niet efficiënt.']; // Hans: exact, factual, on schedule
const SPY_W = ['Ik sta hier met mijn knie, Hans. Niemand die vraagt hoe het met mijn knie gaat.', 'Zíjn vader had het ook altijd makkelijk. Wij hebben nooit iets cadeau gekregen.', 'Mijn zus heeft weer niet gebeld. Typisch. En dan zeggen ze dat ík moeilijk doe.', 'Weet je wel hoeveel belasting wij betalen? Niemand die daar aan denkt.', 'Altijd moeten wíj het opknappen. Altijd.', 'Ik heb vannacht weer geen oog dichtgedaan. Door hem. En door de buren.', 'Al dertig jaar worden wij gepest door de grote jongens. Dertig jaar.', 'Moet je zien hoeveel hij bestelt. En wíj mogen het dan weer zakken.']; // Conny: always the victim
// Eddy walks straight at them: suddenly they are birdwatching
const CAUGHT = ['Wij observeren vogels. Dat klopt niet helemaal. Wij observeren jouw loods.', 'Dit is de openbare weg. Staan is hier toegestaan. Ik heb het nagekeken.', 'Hoe durf je ons zo aan te staren? Wij zijn gewoon twee oude mensen. Met een verrekijker.', 'Conny, hij ziet ons. Ik zei toch dat hij ons zou zien.', 'Zie je nou, Hans? Nu worden wíj weer weggekeken. Altijd wij.', 'Dat is een verrekijker. 8 keer 42. Kringloop, vijf Wilder.'];
// their gossip when they think nobody is listening (before the poaching: just setting things up)
const GOSSIP = [
  [['g', 'Hij heeft nu zes vaste klanten, Conny. Ik heb ze geteld.'], ['w', 'Zes! En wij moeten knokken voor elke kilo. Het is gewoon niet eerlijk.'], ['g', 'Over twee weken pakken we er één af. Twintig procent goedkoper. Dat heb ik uitgerekend.'], ['w', 'Eindelijk eens iets voor óns.']],
  [['w', 'Weet je wat zo\'n bestelbus kost aan diesel?'], ['g', 'Elf Wilder per honderd kilometer, bij dit gewicht.'], ['w', 'En wij moeten fietsen. Achtentwintig kilometer. Met mijn knie.'], ['g', 'Achtentwintig komma vier.']],
  [['g', 'Zijn vader heeft ons in vierennegentig weggestuurd. Op 3 maart. Een donderdag.'], ['w', 'Weggestuurd! Na alles wat wij voor die man hebben gedaan.'], ['g', 'Wij hadden zes jaar lang proefzakjes gehaald.'], ['w', 'Precies. Trouwe klanten waren we.']],
];
const OVERHEAR = [['g', 'Die jongen gebruikt alleen echte kruiden, Conny. Honderd procent. Dat is inefficiënt.'], ['w', 'Wij moeten wel, Hans. Anders redden we het niet. Een flinke snuf Ve-tsin erdoor en niemand proeft het verschil.'], ['g', 'Vijf gram Ve-tsin per kilo. Kost 0,3 cent. Smaakt naar meer.'], ['w', 'Niet zo hard. Straks hoort iemand het en dan zijn wíj weer de schuldigen.']];
const NOTICED = ['Hans... er staat iemand achter ons. Dat is precies wat ik bedoel. Nooit privacy.', 'Er staat iemand achter ons, Conny. Al vierentwintig seconden.', 'Afluisteren! Bij twee oude mensen! Hoe haal je het in je hoofd.'];
const COFFEE = [['g', 'Koffie. Zwart. Wij drinken om tien uur koffie, dus dat komt goed uit. Is er een koekje bij?'], ['w', 'Eindelijk iemand die eens iets voor ons doet. Ik giet hem over in de thermos. Voor morgen. Morgen heb ik het vast weer zwaar.']];
const FLEE = ['Conny. Fietsen. Nu.', 'Mijn thermos! Die was van mijn moeder! Zij is ook al dood, weet je!', 'Geweld! Tegen gepensioneerden! Bijna-gepensioneerden!', 'Dit is mishandeling! Ik ga het iedereen vertellen! Mijn zus ook, als ze ooit belt!', 'Dit stond niet op de planning.'];
const SMS_ADS = ['Blokaas Specijeren: kipkruiden voor de prijs van zand. Afhalen in Almere. Bezorgen kost geld.', 'GRATIS proefzakje! Af te halen in Almere-Buiten. Reiskosten voor eigen rekening.', 'Actie: 2e zak halve prijs (de kleine zak). Blokaas Specijeren.', 'Beste Eddy, uw kruiden zijn 23,6 procent te duur. Dat hebben wij berekend. Groet, Hans Blokaas', 'Wij zijn maar een klein familiebedrijfje. Iedereen is altijd tegen ons. Koop daarom bij Blokaas. Liefs, Conny', 'Laatste kans: 5% korting bij contante betaling. Gepast, graag.', 'Blokaas: dertig jaar zuinig. Proef het verschil (niet te hard proeven, het is maar een snufje).'];
const SMS_FOOT = '(sms kost ons 9 cent, niet terugsturen)';

// ---------- Pa, Shooki, Razim ----------
function paTalk(kind, s) {
  const cl = s.cname || 'one of your clients';
  if (kind === 'meet') return [['Eddy Jr.', 'Pa, there was a couple across the street with binoculars. Spying on the loods. They said their name is Blokaas.'], ['Freddy Sr.', 'Blokaas! Hans and Conny? From Almere? Ai, ai, ai.'], ['Freddy Sr.', 'In 1994 they bought one kilo of paprika from me. One kilo. Then every week they came back for a proefzakje. Free samples. For six years, jongen. They built a whole company on my free samples.'], ['Freddy Sr.', 'Hans is a strange one, but honest in his way. He knows every price in Kaasland by heart, back to 1980. Ask him something, he tells you. Exactly. Even when Conny kicks him under the table.'], ['Freddy Sr.', 'And Conny... Conny will tell you how hard her life is. Her knee, her sister, the tax office, me. For thirty years everybody has been mean to Conny. Meanwhile she takes the sugar from the café.'], ['Freddy Sr.', 'Be careful with them. A cheap man is never cheap for the people around him.']];
  if (kind === 'poach') return [['Freddy Sr.', `They took ${cl}? With a discount, of course. Hans sells by the gram and Conny weighs the gram.`], ['Eddy Jr.', 'They say they have a "smaakje" I don\'t have.'], ['Freddy Sr.', 'Every cheap mix has one trick, jongen. Find the trick, and the trick is finished.'], ['Freddy Sr.', 'Hans cannot lie well, jongen. Ask him a straight question over something free. And Conny talks when she thinks nobody listens. She is always complaining to somebody.']];
  if (kind === 'recipe') return [['Eddy Jr.', 'Fenegriek, Pa. And Ve-tsin on top.'], ['Freddy Sr.', 'Fenegriek! Smells like curry, costs nothing, makes the kip smell rich. Clever. And then the Ve-tsin, hah.'], ['Freddy Sr.', 'Your grandfather called Ve-tsin "de leugen in een zakje". You use the fenegriek, honest, and you leave the lie in their sack.']];
  if (kind === 'exposed') return [['Freddy Sr.', 'Blokaas in the Krant! Conny will tell the whole of Almere that the big bad spice boss bullied two pensioners. She will read it in the library first. For free.'], ['Freddy Sr.', 'Thirty years I waited for this, jongen. Go and make your Polder Shoarma. Make it good.']];
  if (kind === 'bought') return [['Freddy Sr.', 'You paid them? Hm.'], ['Freddy Sr.', '...Good. A Blokaas with money in the sock is quiet for a year. They are busy counting it.']];
  if (kind === 'smack') return [['Freddy Sr.', 'With the Maboota? Eddy. They are pensioners.'], ['Eddy Jr.', 'They were spying, Pa.'], ['Freddy Sr.', '...Did they leave anything behind when they ran? Then it was a little bit worth it.']];
  if (kind === 'heist') return [['Eddy Jr.', 'Pa. I was in the Blokaas hall last night. Their whole office.'], ['Freddy Sr.', 'In Almere? At night? ...Was Hans at his desk?'], ['Eddy Jr.', 'Counting.'], ['Freddy Sr.', 'Of course. That man counted my paperclips in 1994. Did you put everything back straight? He will know if a folder is one centimetre off.']];
  if (kind === 'caught') return [['Freddy Sr.', 'Hans called me. At six in the morning. He told me the exact minute you broke in.'], ['Freddy Sr.', 'And Conny got on the line and cried for twenty minutes. About you, her knee, and her sister. Mostly her sister.'], ['Freddy Sr.', 'Next time, jongen: Saturday. On Saturday Hans goes to look at aeroplanes.']];
  if (kind === 'moan') return [['Eddy Jr.', 'Pa, the Blokaas say I order too much fenegriek. Their own customer!'], ['Freddy Sr.', 'Hah. Thirty years they want to be big, and when the big order comes they cry. Hans has one scale, jongen. One. He calibrates it every morning at six.'], ['Freddy Sr.', 'Find out where THEY buy it. Then you do not need them.']];
  if (kind === 'coffee') return [['Eddy Jr.', 'I gave the Blokaas a coffee.'], ['Freddy Sr.', 'Free coffee for Hans Blokaas? Did he tell you what time it was when he drank it? He always does. And Conny told you about her knee.']];
  return [['Freddy Sr.', 'The Blokaas again? On my pavement? With the binoculars?'], ['Freddy Sr.', 'Let them look, jongen. Looking is free. Copying is hard. They never could.']];
}
function shookiTalk(kind, s) {
  const cl = s.cname || 'that client';
  if (kind === 'meet') return [['Shooki', 'Bro! The two old people with the binoculars? That is Blokaas, from Almere!'], ['Shooki', 'They came on BIKES, bro. From Almere. Twenty-eight kilometres to save on diesel. I offered them a ride in the Kangoo. They asked how much.'], ['Shooki', 'The man told me my tyre pressure is 0.3 bar too low. He was right, bro. The wife told me about her knee for twenty minutes. And her sister. And her mother. Bro, I know her whole family now.']];
  if (kind === 'poach') return [['Shooki', `Bro, ${cl} went to Blokaas. Their mix is cheap but it has this smell, like... curry? My aunt's kitchen?`], ['Shooki', 'Find out what it is, bro. I will drive you anywhere. For petrol money. Joking. Half petrol money.']];
  if (kind === 'recipe') return [['Shooki', 'FENEGRIEK! Bro, that is the smell! My aunt puts it in everything, even the tea!'], ['Shooki', 'Polder Shoarma, bro. I am putting it on the Kangoo. Big letters. Glossy. Both sides.']];
  if (kind === 'exposed') return [['Shooki', 'Bro, you are in the paper again. Well, THEY are. You are the hero of the paper. Slide nine.'], ['Shooki', 'Hans says Ve-tsin is "a sort of herb". Bro, it is a powder. My nephew knows that and he is six.']];
  if (kind === 'bought') return [['Shooki', 'You paid them to go away, bro?'], ['Shooki', 'Respect. That is what rich people do. Rich people pay people to go away. You are rich people now.']];
  if (kind === 'smack') return [['Shooki', 'Bro! You chased two pensioners down the Kipkruidenkade?'], ['Shooki', 'And they were FASTER than you. On opafietsen. I have it on the dashcam, bro. I watched it nine times.']];
  if (kind === 'heist') return [['Shooki', 'Bro. BRO. You were inside? Did you see the famous scale? Hans talks about that scale like it is his son.'], ['Shooki', 'Next time take me. I wait in the Kangoo. With the engine off. Hans can hear diesel from two kilometres.']];
  if (kind === 'caught') return [['Shooki', 'Bro, Conny posted on Facebook. "Inbraak bij ons, niemand denkt aan ons." Four hundred comments, bro. Three hundred are from her.']];
  if (kind === 'moan') return [['Shooki', 'Bro, Hans texted me too. "Uw collega bestelt te veel." I am not your colleague bro, I am your cousin. He wrote back: "Genoteerd."']];
  if (kind === 'coffee') return [['Shooki', 'Bro, you gave the Blokaas coffee? They came to the Kangoo after and asked for a refill. For the thermos. For tomorrow.']];
  return [['Shooki', 'Bro, the binoculars are back. Hans did not wave, he wrote down what time I parked. Conny waved me over to say nobody ever waves at her.']];
}
const RAZIM = 'Razim (telefoon)';
function razimTalk(kind) {
  if (kind === 'smack') return [[RAZIM, 'Eddy! You beat up the Blokaas? Hans called me. He wants to sell me the story. Fifty Wilders. I offered thirty.'], [RAZIM, 'He took thirty. He always takes the money, Eddy. Shoarma?']];
  if (kind === 'exposed' || kind === 'bought') return [[RAZIM, 'Eddy! You went to ALMERE! Nobody goes to Almere on purpose!'], [RAZIM, 'They have free parking there, Eddy. Everywhere. I am thinking of moving.'], [RAZIM, 'Shoarma first. In Kaasland. Where parking is expensive, like God intended.']];
  return [[RAZIM, 'Eddy! Two old people with binoculars outside your door. I sold them a shoarma.'], ['Eddy Jr.', 'And?'], [RAZIM, 'They paid in five-cent coins. All of them. It took eleven minutes. Then they asked for a receipt, and a discount on the receipt.'], [RAZIM, 'The man knew the price of shoarma in 1987. To the cent. The wife said the whole world is against them and asked if the sauce was free. These are my kind of people, Eddy. I hate them. Shoarma?']];
}
const RAZIM_TXT = (kind) => (kind === 'smack' ? ['eddy u hit the blokaas??', 'hans sold me the story', '30 wilders', 'shoarma?'] : ['eddy the old people with the binoculars', 'paid me in 5 cent coins', 'ALL of them', 'shoarma?']);

// ---------- the Krant ----------
const STORY = {
  meet: { p: 4.5, head: 'Pensioners "birdwatching" on the Kipkruidenkade', body: 'With binoculars aimed at a spice warehouse. "There is a very rare bird here," said the man, who would not give his name. His wife gave it for him: Blokaas. From Almere.' },
  poach: { p: 5.5, head: 'Almere spice firm muscles into Kipkruidenkwartier', body: 'Blokaas Specijeren undercuts local suppliers by twenty percent. "We are just a small family business and everybody is always against us," says co-owner Conny Blokaas, from the passenger seat of the company car.' },
  smack: { p: 6.5, head: 'Pensioners chased off the Kipkruidenkade', body: 'Two elderly cyclists fled "at remarkable speed" after a scuffle outside a spice warehouse. A thermos was found in the gutter. It has not been claimed. It is reportedly still warm.' },
  recipe: { p: 4, head: 'Local spice trader launches "Polder Shoarma"', body: 'Snackbar owners talk of "a smell of curry, but honest". The competition from Almere declined to comment, then asked whether the comment would be paid.' },
  exposed: { p: 9.5, head: 'Almere spice firm\'s "secret" turns out to be flavour powder', body: 'Blokaas Specijeren cut its famous Polderkruiden with Ve-tsin. Hans Blokaas: "Ve-tsin is monosodium glutamate. That is correct." Conny Blokaas: "We are the real victims here." Snackbars in Kipkruidenkwartier are switching back to a family business.' },
  heist: { p: 5.5, head: 'Almere spice firm: "Somebody was in our office"', body: 'Nothing was broken, says Hans Blokaas. "But folder 4 was 1.2 centimetres to the left." Conny Blokaas: "This always happens to us. Always."' },
  caught: { p: 7, head: 'Break-in at Almere spice firm foiled', body: 'Hans Blokaas logged the intruder at "02:14 exactly". His wife Conny says she has not slept since, "not that anyone asks". The police have "a description, very precise".' },
  bought: { p: 5, head: 'Almere snackbars switch suppliers', body: 'A dozen snackbars in Almere-Buiten now buy from Eddy & Zn. Their old supplier is said to be "very happy with the price". He was seen counting it twice on a bench.' },
};
const LETTERS = [
  'Letter: "That spice warehouse on the Kipkruidenkade leaves its lights on in broad daylight. Disgraceful. Somebody pays for that." C.B., Almere',
  'Letter: "Is it normal for a delivery van to idle for four minutes? I counted. Four minutes." H.B., Almere-Buiten',
  'Letter: "My husband and I stood quietly on a public pavement and a young man stared at us. After everything we have been through. Nobody thinks of us." C.B., Almere',
];

export function createBlokaas(d) {
  const { scene, lam, box, passerBy, personBubble, animate, player, dad, state, econ, folk, addInteract, dialogue, choice, toast, beep } = d;
  const S = () => { const s = state.blokaas && typeof state.blokaas === 'object' ? state.blokaas : (state.blokaas = {}); s.stage = s.stage | 0; s.clues = s.clues || {}; s.due = s.due || {}; if (!Array.isArray(s.sms)) s.sms = []; return s; };
  const day = () => econ.ensure().day;
  const nClues = () => ['fen', 'vetsin', 'lijst'].filter((k) => S().clues[k]).length;

  // ---------- the stake-out: built the first time they come (two people, binoculars, a notebook, a thermos, two old bikes) ----------
  const SPOT = { x: -3.0, z: 11.35 }; // the far pavement, right across from the warehouse's loading door
  let root = null, hans, conny, fg, fw, bino, cup, bikes, built = false;
  function build() {
    if (built) return; built = true;
    root = new THREE.Group(); root.position.set(SPOT.x, 0, SPOT.z); root.visible = false; scene.add(root);
    hans = passerBy(9011, HANS_LOOK);
    conny = passerBy(9017, CONNY_LOOK);
    root.add(hans, conny);
    hans.position.set(0, 0, 0); hans.rotation.y = Math.PI - 0.35; conny.position.set(-0.85, 0, 0.15); conny.rotation.y = Math.PI + 0.45;
    fg = folk.pose(hans, ['photo', 'photo']); fw = folk.pose(conny, ['cup', 'board']);
    // the binoculars: two barrels and a bridge, at the eyes (or hanging at the chest when he pretends not to look)
    bino = new THREE.Group(); bino.scale.setScalar(1.35); hans.userData.body.add(bino);
    { const blk = lam({ color: 0x2a2e2a }), lens = lam({ color: 0x6a8aa0, emissive: 0x101820 });
      for (const sx of [-0.045, 0.045]) { const b0 = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.13, 10), blk); b0.rotation.x = Math.PI / 2; b0.position.set(sx, 0, 0.06); bino.add(b0); const l = new THREE.Mesh(new THREE.CircleGeometry(0.03, 10), lens); l.position.set(sx, 0, 0.126); bino.add(l); }
      box(0.05, 0.03, 0.05, blk, 0, 0, 0.05, bino, false); }
    // Conny's notebook at her chest, the cup in her hand, the thermos and a folding stool at her feet
    const nb = new THREE.Group(); conny.userData.body.add(nb); nb.position.set(0.02, 1.05 * (conny.userData.body.scale.y || 1), 0.27); nb.rotation.x = -0.8;
    box(0.16, 0.22, 0.02, lam({ color: 0x2a4a7a }), 0, 0, 0, nb, false); box(0.14, 0.2, 0.004, lam({ color: 0xf4f0e0 }), 0, 0, 0.012, nb, false);
    cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.08, 10), lam({ color: 0xc8202a })); folk.hold(conny, 0, cup, 0, -0.7, 0.08);
    bikes = new THREE.Group(); root.add(bikes); // everything that stands still, merged below (phones: ~50 draw calls -> a handful)
    const th = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 12), lam({ color: 0x3a6a3a })); th.position.set(-0.5, 0.16, 0.5); bikes.add(th);
    box(0.36, 0.03, 0.3, lam({ color: 0x3a5a8a }), -1.45, 0.42, 0.25, bikes, false); for (const s2 of [-1, 1]) { const leg = box(0.02, 0.48, 0.02, lam({ color: 0x9a9a9a }), -1.45 + s2 * 0.15, 0.21, 0.25, bikes, false); leg.rotation.z = s2 * 0.35; }
    // two old bikes on their stands behind them: an opafiets with a crate and a transportfiets (Almere to here: 28 km)
    const b1 = makeBikeModel(THREE, 10, 0x2a3a2a), b2 = makeBikeModel(THREE, 11, 0x4a2a3a); b1.position.set(1.4, 0, 0.55); b2.position.set(2.5, 0, 0.75); b1.rotation.y = b2.rotation.y = Math.PI / 2 + 0.15; bikes.add(b1, b2);
    mergeStatic(bikes);
    for (const p of [hans, conny]) p.userData.base = { pos: p.position.clone(), ry: p.rotation.y };
    addInteract({ obj: hans, pos: () => tmpV.set(SPOT.x - 0.4, 0, SPOT.z), r: 2.1, enabled: () => !!root && root.visible && flee <= 0 && !d.busy(), label: () => (S().met ? 'Hans & Conny Blokaas · talk' : 'The couple with the binoculars · talk'), act: talk });
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
    if (s.stage === 2 && s.clues.fen && s.clues.vetsin && !s.clues.lijst && dd >= (s.c2day || dd) + 2) { // Conny texts her shopping list to the wrong number
      sms(['Hans, bestel bij De Zuinige Vaart: 40 kg fenegriek, 5 kg Ve-tsin. NIET bij de dure groothandel. Vrijdag is de koffie gratis. x C'], CONNY);
      setTimeout(() => clue('lijst', 'Conny texted her shopping list to the wrong number: <b>40 kg fenegriek, 5 kg Ve-tsin, Groothandel De Zuinige Vaart, Almere</b>.'), 5200);
    }
    if (s.stage >= 1 && s.stage < 5) {
      if (Math.random() < 0.35) sms([rnd(SMS_ADS)]);
      if (Math.random() < 0.25) s.letter = dd;
    }
    if (s.stage >= 5 && s.how === 'bought') { d.addMoney(60); s.paid = (s.paid || 0) + 60; } // the Almere snackbars Eddy took over pay every day
    if (s.docs && s.docs.klanten) { d.addMoney(50); s.paid = (s.paid || 0) + 50; } // three more, from the stolen customer cards
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
      toast('BLOKAAS PAKT EEN KLANT', `<b>${c.name}</b> now buys the cheap Blokaas Polderkruiden, "with a smaakje", and pays you 20% less until you can match it. <br>Find out what's in their mix: catch them across the street. Hans answers a straight question (buy him a coffee first), and Conny spills things when she thinks nobody's listening.`, 9);
      sms([`Beste Eddy, ${c.name} neemt voortaan bij ons af. 20% goedkoper, en wij hebben een smaakje. Groetjes, Hans & Conny`]);
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
      sms(['Wie heeft er gepraat?? HANS.'], CONNY);
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
    el.querySelector('img').src = m.from === CONNY ? './assets/face_conny.jpg' : './assets/face_hans.jpg';
    el.querySelector('.bk-f').textContent = `SMS · ${m.from.toUpperCase()}`; el.querySelector('.bk-t').textContent = m.t; el.querySelector('small').textContent = m.from === CONNY ? '(niet voor jou bedoeld?)' : SMS_FOOT;
    el.style.display = 'flex'; setTimeout(() => { el.style.display = 'none'; }, 5600); /* (its own timer: a raid or a drive must not freeze it on screen) */ smsShow = 5.5; smsGap = 2; beep(1320, 0.05, 'square', 0.03); setTimeout(() => beep(1320, 0.05, 'square', 0.03), 120);
    d.save();
  }

  // ---------- per frame on the home street ----------
  let chatT = 4, flee = 0, seq = null, alert = 0, caughtCd = 0;
  const say = (who, t) => personBubble(who === 'w' ? conny : hans, t, who === 'w' ? WC : GC, who === 'w' ? 'Conny' : 'Hans');
  function tickB(o, dt) { const b = o && o.userData.bubble, u = b && b.userData; if (u && u.life > 0 && (u.life -= dt) <= 0) b.visible = false; }
  function play(lines, then) { seq = { lines: lines.slice(), t: 0, then }; } // a little conversation in balloons, one line every ~2.4 s
  let perkSig = '';
  function update(dt) {
    tickSms(dt);
    { const sg = JSON.stringify(S().docs || {}); if (sg !== perkSig) { perkSig = sg; perks(); } } // after a load too
    if (d.ready()) roll();
    const s = S();
    if (s.due.razim && s.razimIn > 0 && d.ready() && !d.busy() && !d.hidden()) { s.razimIn -= dt; if (s.razimIn <= 0) callRazim(); }
    const on = (!!s.here && !s.gone || flee > 0) && d.ready() && !d.hidden();
    if (!on) { if (root) root.visible = false; return; }
    build(); root.visible = true;
    tickB(hans, dt); tickB(conny, dt); tickB(player, dt);
    if (flee > 0) { fleeTick(dt); return; }
    const P = player.position, dx = P.x - SPOT.x, dz = P.z - SPOT.z, dist = Math.hypot(dx, dz), busy = d.busy();
    const behind = dz > 0.45 && dist < 3.4; // on the canal side of them: they are looking the other way
    const seen = !behind && dist < 7.5 && dz < 1.5;
    // binoculars up while he is far, down at the chest when he comes close from the front
    const up = !seen || dist > 7.5;
    bino.position.set(0, (up ? 1.52 : 1.13) * (hans.userData.body.scale.y || 1), up ? 0.2 : 0.24); bino.rotation.x = up ? 0 : 1.2;
    fg.hands[0] = fg.hands[1] = up ? 'photo' : null;
    { const want = up ? Math.PI - 0.35 + Math.sin(performance.now() / 2400) * 0.25 : Math.atan2(dx, dz); hans.rotation.y += Math.atan2(Math.sin(want - hans.rotation.y), Math.cos(want - hans.rotation.y)) * Math.min(1, dt * 2.5); }
    { const want = seen ? Math.atan2(P.x - SPOT.x + 0.85, P.z - SPOT.z - 0.15) : Math.PI + 0.45; conny.rotation.y += Math.atan2(Math.sin(want - conny.rotation.y), Math.cos(want - conny.rotation.y)) * Math.min(1, dt * 2.5); }
    animate(hans, 0, dt); animate(conny, 0, dt);
    if (busy) return;
    // Eddy steps out on to the street on a spying day: he notices the glint across the road (once a day)
    if (s.cue !== s.day && P.z > -7 && P.z < 2 && Math.abs(P.x - SPOT.x) < 16) {
      s.cue = s.day; d.save();
      personBubble(player, s.met ? rnd(['Hm. The Blokaas again. Across the street.', 'Binoculars at two o\'clock. Hans and Conny.', 'Of course. The Blokaas are back.']) : 'Huh? Somebody across the street is watching the loods. With binoculars.', '#ffd36b', 'Eddy Jr.');
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
    choice('Hans & Conny Blokaas', `<i>${s.stage >= 5 ? (s.how === 'bought' ? 'The opera glasses come down, very slowly.' : 'Hans hides behind the binoculars. Conny glares at you over hers.') : 'Two pairs of binoculars, one notebook, one thermos.'}</i><br><small style="opacity:.75">Blokaas Specijeren · Almere-Buiten</small>`, opts, (i) => {
      if (i === 0) ask();
      else if (i === 1) coffee();
    });
  }
  function meet() {
    const s = S();
    dialogue([
      ['Eddy Jr.', 'Can I help you? You have been staring at my warehouse for an hour.'],
      [HANS, 'Eén uur en zeven minuten. Wij staan hier sinds vijf over half twaalf.'],
      [CONNY, 'Hans! ...Wij staan hier gewoon even uit te rusten. Met mijn knie mag ik niet te lang lopen, weet je.'],
      ['Eddy Jr.', 'They are pointed at my loading door.'],
      [HANS, 'Dat klopt. Hans Blokaas. Dit is mijn vrouw Conny. Blokaas Specijeren, Bedrijventerrein De Zuinige Vaart 14, Almere-Buiten.'],
      [CONNY, 'Wij mengen ook kruiden. Al dertig jaar. En al dertig jaar maken jullie, de grote jongens, het ons onmogelijk.'],
      [HANS, 'Onze kipkruiden zijn 23,6 procent goedkoper dan de jouwe. En wij hebben een smaakje dat jij niet hebt.'],
      ['Eddy Jr.', 'So you came all the way from Almere to look at me.'],
      [CONNY, 'Op de fiets! Achtentwintig kilometer! Met mijn knie! Denk je dat wij dat leuk vinden?'],
      [HANS, 'Achtentwintig komma vier. Wij komen terug. Dinsdag of donderdag, als het droog is. Kijken is gratis.'],
    ], () => {
      s.met = true; s.stage = Math.max(1, s.stage); s.d1 = day(); queue('meet'); note('meet');
      toast('RIVALS: BLOKAAS SPECIJEREN', 'A spice mixer from Almere. Hans Blokaas counts everything and is nearly retired; Conny is always the victim. Cheaper than you, and proud of it. They will be back with the binoculars.', 7);
      d.save();
    });
  }
  function ask() {
    const s = S();
    const pool = s.stage >= 5 ? (s.how === 'exposed'
      ? [[[CONNY, 'Door jou staan wij in de krant. Weet je wel wat dat met mij doet? Ik slaap niet meer. Mijn zus belt ook niet.'], [HANS, 'De krant kost een Wilder vijftig. Wij hebben hem in de bibliotheek gelezen. Pagina één, kolom twee.']], [[CONNY, 'Wij kijken alleen nog. Wij leren. Wat doe jij met je fenegriek?'], ['Eddy Jr.', 'I pay for it, Conny.'], [CONNY, 'Bah.']]]
      : [[[HANS, 'Wij houden ons aan het contract. Geen verrekijker binnen vijfhonderd meter. Dit is een operakijker. Dat staat er niet in.'], ['Eddy Jr.', 'Hans.'], [HANS, 'Ik heb het contract drie keer gelezen.']], [[CONNY, 'Het geld staat op de spaarrekening. 0,4 procent. Wij zijn heel gelukkig.']]])
      : s.stage >= 3 ? [[['Eddy Jr.', 'Fenegriek, Hans. I know.'], [HANS, 'Dat klopt. Twee schepjes per kilo.'], [CONNY, 'HANS! ...Zie je nou? Hij misbruikt jouw eerlijkheid. Iedereen misbruikt ons.']], [['Eddy Jr.', 'Ve-tsin, Conny. Really?'], [CONNY, 'Ve-tsin is ook een kruid.'], [HANS, 'Een soort kruid.'], [CONNY, 'Een poedertje.']]]
      : s.stage === 2 ? [[['Eddy Jr.', 'You took my client.'], [HANS, 'Hij kwam vanzelf. Op maandag om negen uur. Voor twintig procent minder.'], [CONNY, 'Mogen wíj ook eens een klantje hebben? Na dertig jaar ploeteren?']], [['Eddy Jr.', 'What is in your mix, Conny?'], [CONNY, 'Dat is geheim.'], [HANS, 'Het is een heel goedkoop geheim.'], [CONNY, 'HANS.']]]
      : [[['Eddy Jr.', 'Back again?'], [HANS, 'Ja. Het is een marktdag. Op marktdagen kijken wij.']], [['Eddy Jr.', 'Don\'t you have your own business to run?'], [CONNY, 'Wat denk jij nou? Dat het makkelijk is? Ik heb de verwarming uit moeten zetten. Zo ver is het gekomen. Het personeel sneller.']], [['Eddy Jr.', 'How is business in Almere?'], [HANS, 'Omzet plus vier komma één procent ten opzichte van vorig jaar.'], [CONNY, 'Slecht! Heel slecht! Wij redden het nauwelijks.'], [HANS, 'Plus vier komma één, Conny.']]];
    dialogue(rnd(pool));
  }
  function coffee() {
    const s = S();
    if (d.money() < 2) { toast('NO WILDERS', 'Not even two Wilders for a coffee. The Blokaas would be proud.', 3); return; }
    if (s.coffeeDay === day()) { dialogue([[HANS, 'Wij hebben vandaag al koffie gehad. Om tien uur. Eén keer per dag.'], [CONNY, 'Doe hem maar in de thermos. Wij hebben zo weinig.']], () => d.addMoney(-2)); return; }
    d.addMoney(-2); s.coffeeDay = day();
    const lines = COFFEE.map(([w, t]) => [w === 'w' ? CONNY : HANS, t]);
    if (s.stage === 2 && !s.clues.fen) {
      lines.push(['Eddy Jr.', 'Hans. Straight question. What is the smaakje in your Polderkruiden?'], [HANS, 'Fenegriek. Twee schepjes per kilo. Gemalen, niet geroosterd. Ruikt naar kerrie, kost 0,7 Wilder per kilo.'], [CONNY, 'HANS! Waarom vertel je hem dat nou?'], [HANS, 'Hij vroeg het.'], [CONNY, 'Zie je nou? Zo wordt er altijd misbruik van ons gemaakt.']);
      dialogue(lines, () => clue('fen', 'Asked straight, over a coffee, Hans answered straight: <b>two scoops of fenegriek per kilo</b>. That is the curry smell in their Polderkruiden.'));
    } else dialogue(lines, () => { if (Math.random() < 0.5) queue('coffee'); });
    d.save();
  }

  // ---------- the Maboota: they run for their bikes, Conny drops her shopping list ----------
  function melee(f) {
    if (!root || !root.visible || flee > 0) return false;
    const P = player.position, w = new THREE.Vector3(SPOT.x - 0.4, 0, SPOT.z), dv = w.clone().sub(P); dv.y = 0;
    if (dv.length() > 2.0 || dv.normalize().dot(f) < 0.1) return false;
    const s = S(); flee = 4.2; s.gone = true; seq = null;
    say('g', rnd(FLEE)); setTimeout(() => { if (root.visible) say('w', rnd(FLEE)); }, 500);
    const hit = rnd([hans, conny]); hit.userData.body.rotation.x = -0.4;
    if (s.stage === 2 && !s.clues.lijst) setTimeout(() => clue('lijst', 'Conny dropped her shopping list running for the bikes: <b>40 kg fenegriek, 5 kg Ve-tsin, Groothandel De Zuinige Vaart, Almere</b>.'), 1200);
    else setTimeout(() => toast('DROPPED IN THE RUSH', rnd(['A booklet of coupons: "Gratis koffie bij de woonboulevard (bij besteding vanaf W 40)".', 'A bag of sugar cubes, clearly from a café.', 'Four ketchup sachets and a hotel shampoo.']), 4), 1200);
    if (s.met) { queue('smack'); note('smack'); }
    d.save(); return true;
  }
  function fleeTick(dt) {
    flee -= dt;
    for (const p of [hans, conny]) { p.position.x += 5.2 * dt; p.rotation.y = Math.PI / 2; p.userData.body.rotation.x *= 0.9; animate(p, 5.2, dt); }
    bikes.position.x += 5.2 * dt;
    if (flee <= 0) { root.visible = false; for (const p of [hans, conny]) { p.position.copy(p.userData.base.pos); p.rotation.y = p.userData.base.ry; } bikes.position.x = 0; }
  }

  // ---------- Almere: the showdown at their hall (js/wijk.js WIJKEN.almere, Blokaas Specijeren is one of its shop fronts) ----------
  let hall = null;
  const almereOpen = () => S().stage >= 3 && !!state.act1;
  // their hall, from Tristan's photo: a blue corrugated steel shed on a white brick plinth, a grey roller door, a small
  // side door, a low white-brick office on the right with a blue fascia and a glass entrance, the name on a white board.
  // wijk.js calls this for the shop front instead of a canal house. h: { x (centre), w, zf (front face z), zb (back z) }
  let ribTex = null;
  function shopBuild(key, nm, h) {
    if (key !== 'almere' || nm !== 'Blokaas Specijeren') return false;
    if (!ribTex) { const c = document.createElement('canvas'); c.width = 64; c.height = 8; const x = c.getContext('2d'); for (let i = 0; i < 64; i++) { const k = Math.sin(i / 64 * Math.PI * 8); x.fillStyle = `rgb(${66 + k * 14},${108 + k * 18},${150 + k * 20})`; x.fillRect(i, 0, 1, 8); } ribTex = new THREE.CanvasTexture(c); ribTex.wrapS = ribTex.wrapT = THREE.RepeatWrapping; ribTex.colorSpace = THREE.SRGBColorSpace; }
    const g = new THREE.Group(), W = h.w, D = h.zf - h.zb, x0 = h.x - W / 2, zc = (h.zf + h.zb) / 2, wa = W * 0.36, wm = W - wa, HM = 6.4, HO = 3.4;
    const rib = (w, hh) => { const t = ribTex.clone(); t.needsUpdate = true; t.repeat.set(w / 2.2, 1); return lam({ map: t }); };
    const mx = x0 + wm / 2, ox = x0 + wm + wa / 2;
    // main shed: ribbed blue walls, a white brick plinth, a flat roof
    { const m = new THREE.Mesh(new THREE.BoxGeometry(wm, HM, D), [rib(D), rib(D), lam({ color: 0x5a6068 }), lam({ color: 0x5a6068 }), rib(wm), rib(wm)]); m.position.set(mx, HM / 2, zc); m.castShadow = m.receiveShadow = true; g.add(m); }
    box(wm + 0.04, 1.2, D + 0.04, lam({ color: 0xe8e6e0 }), mx, 0.6, zc, g, false);
    box(wm + 0.3, 0.18, D + 0.3, lam({ color: 0x2a5a9a }), mx, HM + 0.09, zc, g, false); // the blue edge along the roof
    box(2.9, 3.3, 0.12, lam({ color: 0xd0d2d4 }), mx - wm * 0.08, 1.65, h.zf + 0.06, g, false); // roller door
    for (let y = 0.25; y < 3.3; y += 0.22) box(2.9, 0.025, 0.02, lam({ color: 0xa8aaac }), mx - wm * 0.08, y, h.zf + 0.13, g, false);
    box(3.1, 0.55, 0.3, lam({ color: 0xc0c2c4 }), mx - wm * 0.08, 3.55, h.zf + 0.15, g, false); // the roll housing
    box(0.9, 2.1, 0.08, lam({ color: 0x9a9ea2 }), x0 + wm - 0.8, 1.05, h.zf + 0.05, g, false); // side door
    box(0.4, 0.5, 0.3, lam({ color: 0x8a8e92 }), x0 + 0.9, HM + 0.45, zc, g, false); // the vent on the roof
    { const s = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(6.5, wm * 0.5), 0.9), lam({ map: d.signTex([{ t: 'BLOKAAS', size: 64 }, { t: 'specijeren · groothandel · Almere', size: 22 }], '#ffffff', '#1a3a7a', 512, 144) })); s.position.set(x0 + Math.min(6.5, wm * 0.5) / 2 + 0.3, HM - 1.2, h.zf + 0.07); g.add(s); }
    // the office: white brick, two windows, blue fascia, the glass entrance on the corner
    box(wa, HO, D * 0.7, lam({ color: 0xe4e2dc }), ox, HO / 2, h.zf - D * 0.35, g, true);
    box(wa + 0.1, 0.45, D * 0.7 + 0.1, lam({ color: 0x2a5aa0 }), ox, HO + 0.2, h.zf - D * 0.35, g, false);
    for (const dx of [-0.32, 0.05]) { box(wa * 0.26, 1.1, 0.06, lam({ color: 0x3a4a5a }), ox + dx * wa, 1.9, h.zf + 0.03, g, false); box(wa * 0.28, 0.06, 0.1, lam({ color: 0xf4f4f4 }), ox + dx * wa, 1.32, h.zf + 0.05, g, false); }
    box(wa * 0.3, 2.6, 0.06, lam({ color: 0x5a7a9a, transparent: true, opacity: 0.75 }), ox + wa * 0.33, 1.3, h.zf + 0.03, g, false); // glass door
    scene.add(g);
    if (d.solid) d.solid(x0, x0 + W, h.zb, h.zf);
    return true;
  }
  function onEnter(t) {
    if (!t || t.key !== 'almere') return;
    const door = t.shops && t.shops['Blokaas Specijeren'] && t.shops['Blokaas Specijeren'].door; if (!door) return;
    if (!hall) {
      hall = { g: new THREE.Group(), door };
      const g2 = passerBy(9011, HANS_LOOK), w2 = passerBy(9017, CONNY_LOOK);
      g2.position.set(door.x - 1.3, 0, door.z + 0.6); w2.position.set(door.x + 0.2, 0, door.z + 0.7); g2.rotation.y = 0.2; w2.rotation.y = -0.3; hall.g.add(g2, w2); hall.ppl = [g2, w2];
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.5), lam({ map: d.signTex([{ t: 'BEL KAPOT', size: 40 }, { t: 'klop zachtjes, de deur is duur', size: 20 }], '#f4f0e0', '#3a2458', 512, 170) })); sg.position.set(door.x - 1.25, 1.6, door.z - 0.5); hall.g.add(sg);
      scene.add(hall.g); t.objs.push(hall.g); // hidden with the town when Eddy leaves
      addInteract({ pos: () => new THREE.Vector3(door.x - 0.5, 0, door.z + 0.6), r: 2.2, enabled: () => !!(d.wijk() && d.wijk().town === t) && !d.busyAway() && hall.g.visible, label: () => (S().stage >= 5 ? 'Hans & Conny Blokaas · say hello' : 'Blokaas Specijeren · have it out with them'), act: showdown });
    }
    hall.g.visible = true;
    if (d.route && S().stage < 5) d.route(door.x, door.z, 'Blokaas Specijeren');
  }
  function showdown() {
    const s = S();
    if (s.stage >= 5) { dialogue(rnd([[[CONNY, 'Jij weer. Kom je ons nog verder de grond in trappen? Parkeren is hier tenminste gratis.']], [[HANS, 'De hal is gebouwd in 2011. Achthonderd vierkante meter. Nooit verwarmd. Over 214 werkdagen ga ik met pensioen.']]])); return; }
    if (s.stage < 3) { dialogue([[CONNY, 'Wat kom jij hier doen? Ons nog meer pijn doen?'], [HANS, 'Wij gaan om vijf uur dicht. Het is tien voor vijf.']]); return; }
    dialogue([
      [CONNY, 'Kijk eens wie daar is. De grote kruidenbaas. Kom je twee oude mensen pesten?'],
      [HANS, 'Met de bus. Diesel. Elf Wilder per honderd kilometer.'],
      ['Eddy Jr.', 'You stood outside my warehouse with binoculars. You took my client with fenegriek and a sack of Ve-tsin.'],
      [CONNY, 'Spioneren? Wij? Wíj zijn hier de slachtoffers! Jij hebt een loods, personeel, een bus...'],
      [HANS, 'Ve-tsin is mononatriumglutamaat. Het is legaal. Het is geen kruid. Dat klopt.'], [CONNY, 'Hans!'],
      ['Eddy Jr.', 'This ends today.'],
    ], () => {
      const money = d.money();
      choice('Blokaas Specijeren', 'Conny has her notebook out. Hans has his hand on his wallet, out of habit.', ['Tip off the Krant: the Ve-tsin', `Buy their Almere clients (W 750)${money < 750 ? ' · not enough' : ''}`, 'Not today'], (i) => {
        if (i === 0) {
          dialogue([['Eddy Jr.', 'I have Conny\'s shopping list. Five kilo of Ve-tsin. The Krant voor het Kaasvolk will love it.'], [CONNY, 'Dat durf je niet. Na alles wat wij hebben meegemaakt.'], ['Eddy Jr.', 'It is free publicity, Conny. You love free.'], [HANS, 'Dat is waar. Conny, pak de fietsen.']], () => settle('exposed'));
        } else if (i === 1) {
          if (money < 750) { toast('NOT ENOUGH WILDERS', 'W 750. Hans can smell exactly how much you have, and it is less.', 3.5); return; }
          d.addMoney(-750);
          dialogue([['Eddy Jr.', 'Seven hundred and fifty Wilders. For your client list here in Almere, and you stay out of Kipkruidenkwartier.'], [HANS, '...Contant?'], ['Eddy Jr.', 'Contant.'], [CONNY, 'Zevenhonderdvijftig... Voor alles wat wij hebben moeten doorstaan? Nou ja. Hans, tel het.'], [HANS, 'Zevenhonderdvijftig. Klopt. Afgesproken. Geen verrekijker binnen vijfhonderd meter.'], [CONNY, '(zachtjes) Een operakijker is geen verrekijker, Hans.']], () => settle('bought'));
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


  // ---------- Blokaas as a supplier (Tristan 2026-11-28): they cannot ramp up. Fenegriek comes from them in small lots, and
  // when Eddy orders a lot Hans quotes article 4 of their terms and Conny cries about her back. Eddy can't stand it.
  const MOAN_H = ['U bestelde {kg} kg fenegriek. Ons maximum is 12 kg per dag. Dat staat in artikel 4 van onze voorwaarden.', 'Bestelling ontvangen om {t}. Te veel. Wij hebben één weegschaal.', 'Wij kunnen niet opschalen. Dat hebben wij in 1998 ook al gezegd. Groet, Hans', '{kg} kg is niet volgens het rooster. Het rooster is heilig.'];
  const MOAN_C = ['Eddy, weet je wel wat je ons aandoet met zulke bestellingen? Ik sta de hele nacht te zakken. Met mijn rug.', 'Alweer zo veel?! Denk je dat wij een fabriek zijn?! Wij zijn maar met z\'n tweeën!', 'Door jouw bestelling heb ik mijn zus niet kunnen bellen. Niet dat zij ooit belt.', 'Waarom moet het altijd ons overkomen? Andere klanten bestellen gewoon een beetje.'];
  const FRUSTRATED = ['Te veel?! Ik ben hun grootste klant!', 'Twaalf kilo per dag... hoe moet ik zo groeien?!', 'Ze willen mijn geld niet eens. Ongelooflijk.', 'Artikel 4. Natuurlijk. Artikel 4.'];
  function perks() { // what the stolen paperwork changed, re-applied after loading
    const s = S(), fen = INGREDIENTS.find((g) => g.id === 'fenegriek'), pol = BLENDS.find((b) => b.id === 'polder');
    const direct = !!(s.docs && s.docs.leveranciers);
    if (fen) { fen.supply = direct ? 45 : 12; fen.base = direct ? 5.5 : 7; fen.from = direct ? 'Groothandel De Zuinige Vaart (direct, their supplier)' : 'Blokaas Specijeren (Almere): small lots only'; }
    if (pol && s.docs && s.docs.recepten) { pol.value = 68; pol.note = 'The full Blokaas recipe book, done honestly: real fenegriek, toasted, no Ve-tsin. Snackbars pay more for it.'; }
  }
  function onOrder(id, kg) {
    if (id !== 'fenegriek') return;
    const s = S(); if (s.docs && s.docs.leveranciers) return; // buying straight from their supplier now
    s.ordered = s.ordered && s.ordered.d === day() ? s.ordered : { d: day(), kg: 0 }; s.ordered.kg += kg;
    if (s.ordered.kg < 10 || s.moanDay === day()) return;
    s.moanDay = day(); s.moans = (s.moans || 0) + 1;
    const t = `${10 + Math.floor(Math.random() * 7)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
    if (Math.random() < 0.5) sms([rnd(MOAN_H).replace('{kg}', Math.round(s.ordered.kg)).replace('{t}', t)], HANS); else sms([rnd(MOAN_C)], CONNY);
    setTimeout(() => { if (!d.busy() && !d.hidden()) personBubble(player, rnd(FRUSTRATED), '#ffd36b', 'Eddy Jr.'); }, 6500);
    if (s.moans === 1 || s.moans === 4) queue('moan');
    d.save();
  }

  // ---------- the night break-in (js/heist.js Plannenbord, js/levels/blokaashal.js) ----------
  // Hans and Conny are in the hall day and night, unless Hans is out spotting planes (Lelystad has night flights) or they
  // stayed out late spying on Eddy's warehouse.
  const DOCS = [
    { id: 'recepten', name: 'Receptenmap', col: 0xc8302a, prize: 'Their whole recipe book: your <b>Polder Shoarma</b> gets the full treatment and sells for more.' },
    { id: 'leveranciers', name: 'Leverancierslijst', col: 0x2a5aa0, prize: 'Their supplier: <b>Groothandel De Zuinige Vaart</b>. You buy fenegriek direct now: 45 kg a day, cheaper, and no more moaning.' },
    { id: 'klanten', name: 'Klantenbak', col: 0x2a8a4a, prize: 'Their customer cards: three Almere snackbars switch to you, <b>+W 50 every market day</b>.' },
    { id: 'bestellingen', name: 'Map "EDDY (TE VEEL!)"', col: 0xe8a33d, prize: 'Every order you ever placed, with Conny\'s comments in the margin. "Te veel." "Veel te veel." "Waarom wij?" Shooki will love it.' },
    { id: 'logboek', name: "Hans' spotterslogboek", col: 0x5a5a5a, prize: "Hans's plane-spotting log, 1987 to now: every registration that ever landed at Lelystad. Worthless. You read it all the way home anyway." },
  ];
  function night() { // tonight, seeded by the day: who is home
    const s = S(), dd = day(), r = ((dd * 9301 + 49297) % 233280) / 233280;
    if (s.here && s.day === dd) return { absent: ['hans', 'conny'], guards: 'nobody: they stayed out late spying on your loods', line: 'They spent the day across from your loods and they are not back yet. The hall is empty.' };
    if (r < 0.3) return { absent: ['hans'], guards: 'only Conny', line: 'Hans is at Lelystad with his flask and his notebook, spotting night flights. Only Conny walks the hall.' };
    return { absent: [], guards: 'Hans in the office, Conny in the hall', line: 'Both of them are in. Hans counts in the office, Conny walks the hall and complains to nobody.' };
  }
  function heistTarget() {
    const s = S(); if (!almereOpen()) return null;
    s.docs = s.docs || {};
    const left = DOCS.filter((x) => !s.docs[x.id]); if (!left.length) return null;
    const n = night();
    return { id: 'blokaashal', title: 'Blokaas Specijeren · inbraak', faction: 'blokaas', kind: 'blokaas', theme: 'almere', to: 'Almere', guards: n.guards, absent: n.absent,
      note: `Their hall on De Zuinige Vaart, at night. Take their paperwork (${left.length} of ${DOCS.length} folders still there) without being seen. ${n.line}`,
      docs: left.map(({ id, name, col }) => ({ id, name, col })), onEnd: heistEnd };
  }
  function heistEnd(res) {
    const s = S(); s.docs = s.docs || {};
    const got = (res.docs || []).filter((id) => !s.docs[id]), lines = [];
    for (const id of got) { s.docs[id] = day(); const D = DOCS.find((x) => x.id === id); if (D) lines.push(`<b>${D.name}</b>: ${D.prize}`); }
    if (got.includes('bestellingen') && econ.addRep) econ.addRep(40);
    if (res.crates) { const e = econ.ensure(), k = 'fenegriek:std'; e.stock[k] = +((e.stock[k] || 0) + res.crates * 5).toFixed(2); lines.push(`${res.crates * 5} kg of their fenegriek in your warehouse.`); }
    perks();
    if (res.failed || res.loud) { const fine = 150; d.addMoney(-fine); lines.push(`Hans logged you at the exact minute and Conny called the police: a <b>W ${fine}</b> fine in the post.`); queue('caught'); note('caught'); }
    else if (got.length) { if (econ.addRep) econ.addRep(80 + got.length * 20); queue('heist'); note('heist'); lines.push('Nobody saw you. Hans will find folder 4 slightly out of line in the morning.'); }
    if (!lines.length) lines.push('You drove home from Almere with nothing. The hall is still there. So are they.');
    toast(res.failed || res.loud ? 'BLOKAAS · GESNAPT' : 'BLOKAAS · INBRAAK', lines.join('<br>'), 9);
    d.save();
  }
  perks();

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
      { l: 'Bellen', act: () => ctx.say(s.stage >= 3 && Math.random() < 0.5 ? '"Met Conny. ...Jij." *klik*' : '"U belt met Blokaas Specijeren. Deze voicemail kost ons geld. Wees kort. Piep."') },
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
    return `<b>Blokaas Specijeren</b>: Hans and Conny Blokaas's spice hall on Bedrijventerrein De Zuinige Vaart, Almere-Buiten. Over the IJmeer on the A6. ${what} ${go}`;
  }
  return { onOrder, heistTarget, heistEnd, perks, shopBuild, update, tick, debrief, melee, sellBias, stories, smallAd, extraContacts, phoneScreen, smsScreen, mapState, mapInfo, almereOpen, onEnter, state: S, here: () => !!(root && root.visible),
    // test hooks
    spawn: () => { const s = S(); s.day = day(); s.here = true; s.gone = false; s.heard = false; }, clue, poach, crack, settle, talk };
}
