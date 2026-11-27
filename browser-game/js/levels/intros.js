// Joint intros (Tristan 2026-11-27, feel pass): before the first raid on a joint, the camera takes a slow look over the building
// while a dossier card says who runs it, what goes on inside and what Eddy wins, and Shooki (or Pa, for the big ones) phones
// in with the last word. js/mission.js plays it during the van arrival; the lines go through the normal dialogue box.
// crew: lampas | noshgey | abdavissies | paravim | final   ·   call: [who, line] pairs, who as in main.js faces
const S = 'Shooki (telefoon)', E = 'Eddy Jr.', PA = 'Freddy Sr. (telefoon)';

export const CREWS = {
  lampas: { name: 'De Lampas', col: '#f2c14e', area: 'Oud-Vettenburg' },
  noshgey: { name: 'Noshgey Kariot', col: '#9ccc65', area: 'Hipsterheuvel' },
  abdavissies: { name: 'De Abdavissies', col: '#5fb3e6', area: 'De Duistere Dokken' },
  paravim: { name: 'De Paravim', col: '#ef6a45', area: 'De Zandwijk' },
  final: { name: 'Every crew at once', col: '#ffd36b', area: 'The finale' },
};

export const INTROS = {
  // ---- Kipkruidenkwartier: the Lampas on Eddy's doorstep
  spekbuurt: { crew: 'lampas', area: 'Kipkruidenkwartier', boss: 'Manager Kees', role: 'Jan van Kaas\'s shift manager. Clipboard, gold chain, no sense of humour.',
    inside: 'A butcher\'s and shoarma grill in front, a prep room that links every room behind it. The doner is half spice, half sawdust.',
    stake: 'Your first corner. Take it and the Lampas know your name.',
    call: [[S, 'Eddy, the butcher\'s on the corner. Kees runs it for Jan van Kaas. Front door or the alley, your choice.'], [E, 'And if I just knock?'], [S, 'Then you are a very polite dead man. Go round the side.']] },
  kroketkade: { crew: 'lampas', area: 'Kipkruidenkwartier', boss: 'De Frituurbaas', role: 'Hasn\'t changed the fryer oil since the euro came in.',
    inside: 'A snackbar on the quay: the shop, a greasy kitchen, back rooms and a garage with a roller shutter round the corner.',
    stake: 'The quay, the boats that tie up there, and every kroket sold on it.',
    call: [[S, 'Kroketkade. Rain on the water, Lampas in the kitchen. The Frituurbaas keeps a shotgun next to the fryer.'], [E, 'Two ways in?'], [S, 'Glass front door, or the garage shutter. The counter stops bullets. The bistro tables don\'t.']] },
  uitjesbuurt: { crew: 'lampas', area: 'Kipkruidenkwartier', boss: 'The Lieutenant', role: 'Jan van Kaas\'s card-playing right hand. Cheats, badly.',
    inside: 'A snackbar on top, an onion cellar below, and somewhere down the stairs a card game nobody is allowed to win.',
    stake: 'The last Lampas corner in the Kipkruidenkwartier. Clear it and the whole wijk is yours.',
    call: [[S, 'Smell that? Onions. The Lieutenant plays cards in the cellar and the pot is Lampas money.'], [E, 'Then I\'ll take the pot too.'], [S, 'Take the stairs slowly. It\'s dark down there.']] },
  // ---- Act 1: Oud-Vettenburg, the Lampas heartland
  frietwijk: { crew: 'lampas', boss: 'Friet-Fred', role: 'Fries everything. His office smells like a deep fryer, because it is one.',
    inside: 'Friettent De Vette Hap. A glass kitchen, so they see you coming and you see them. Fred sits in the back office.',
    stake: 'Your first joint in Oud-Vettenburg. The heartland starts to crack.',
    call: [[S, 'Welcome to Oud-Vettenburg. Every chip shop here pays Jan van Kaas, and Friet-Fred pays the most.'], [E, 'Glass kitchen?'], [S, 'Glass kitchen. No surprises for anyone. Shoot first.']] },
  sauzenbuurt: { crew: 'lampas', boss: 'Mayo-Mo', role: 'Waters the sauce down and sells it as "light".',
    inside: 'Het Dunne Sausje. Four dilution kettles in the back. The workers in blue caps are just doing their job.',
    stake: 'Kick the kettles over and every snackbar in the street buys real sauce again. Yours.',
    call: [[S, 'Mayo-Mo cuts the sauce with tap water and sells it to half of Amsterdam-Kaas.'], [E, 'That\'s a crime.'], [S, 'It\'s the crime. Tip the four kettles. Leave the blue caps alone, they don\'t fight.']] },
  knoflooksteeg: { crew: 'lampas', boss: 'De Kaartgever', role: 'Deals cards, deals spice, never folds.',
    inside: 'De Knoflookbol and three dens down a dark alley. Gunfire carries back here: go quiet and the other dens won\'t hear.',
    stake: 'The alley card games and the garlic trade that runs through them.',
    call: [[S, 'Knoflooksteeg. One alley, three dens, one card shark.'], [E, 'Quiet or loud?'], [S, 'Quiet, if you can. One bang and every den in the alley comes out to look.']] },
  mayonaisemarkt: { crew: 'lampas', boss: 'The Depotbaas', role: 'Counts pallets, not people. Two shotgun guards at his elbow.',
    inside: 'De Witte Klodder and the Lampas depot behind it. A wide-open hall where the pallet stacks are the only cover.',
    stake: 'Where all the cheap Lampas stock comes in. Ten crates in there, at least.',
    call: [[S, 'The depot. Every bad jar of mayo in Oud-Vettenburg passes through here first.'], [E, 'Cover?'], [S, 'Pallets. Only pallets. Stay behind them, and watch the two with the shotguns.']] },
  halvekipplein: { crew: 'lampas', boss: 'Kippenvel', role: 'Runs the Lampas order books from a rotisserie.',
    inside: 'De Halve Haan. Three order PCs: the bookings, the server and Kippenvel\'s own laptop.',
    stake: 'Wipe the PCs and nobody in Oud-Vettenburg knows who ordered what from whom.',
    call: [[S, 'Halve Kip Plein. Every Lampas order goes through those three computers.'], [E, 'So I unplug them.'], [S, 'Wipe them. All three. The chickens can keep turning.']] },
  bitterbalbuurt: { crew: 'lampas', boss: 'The Penningmeester', role: 'Jan van Kaas\'s accountant. Wears a bow tie to a gunfight.',
    inside: 'De Gouden Bitterbal: a shop, a brown café, and the cellar vault where the Lampas Wilders are counted.',
    stake: 'The Lampas treasury. Crack the vault and they can\'t pay their own men.',
    call: [[S, 'The Lampas keep their Wilders under a café. Of course they do.'], [E, 'How much?'], [S, 'Enough that the Penningmeester sleeps down there. Crack the vault, Eddy.']] },
  pindasausplein: { crew: 'lampas', boss: 'Jan van Kaas', role: 'Head of the Lampas. Cheese king of Oud-Vettenburg, and he knows it.',
    inside: 'Fort Pindasaus: a yard under searchlights, the hopper factory, and Jan\'s office at the top.',
    stake: 'This ends the Lampas. Oud-Vettenburg is yours.',
    call: [[PA, 'Eddy. Jan van Kaas. I knew him when he sold cheese from a bakfiets.'], [E, 'He\'s got a fort now, Pa.'], [PA, 'Stay out of the searchlights. And don\'t let him talk. He was always good at talking.']] },
  // ---- Act 2: Hipsterheuvel, the Noshgey Kariot
  joppiehaven: { crew: 'noshgey', boss: 'Wrapmeester Wessel', role: 'Rolls a perfect wrap. Hits like a bakfiets.',
    inside: 'The Organic Wrap Bar on a boardwalk over the harbour. Guards in artisan body armour: two hits each.',
    stake: 'The Noshgey Kariot\'s front door on the island. Kick it in.',
    call: [[S, 'New crew. The Noshgey Kariot. Oat milk, linen shirts, body armour.'], [E, 'Body armour?'], [S, 'Hand-stitched. Two hits each. Knock them off the boardwalk and the harbour does the rest.']] },
  frikandelhaven: { crew: 'noshgey', boss: 'DJ Biologisch', role: 'Spins vinyl pressed from recycled oat cartons.',
    inside: 'De Ambachtelijke Frikandel: a craft café, a brewery and a disco cellar where the strobes leave you blind.',
    stake: 'The best party in Hipsterheuvel, and the spice they hand out at the door.',
    call: [[S, 'Craft frikandellen, craft beer, craft disco. DJ Biologisch runs it from the cellar.'], [E, 'Strobes?'], [S, 'Strobes. Wait for the light before you shoot.']] },
  havermelkhaven: { crew: 'noshgey', boss: 'Barista Bram', role: 'Pours latte art in the shape of his own face.',
    inside: 'De Volle Korrel and the oat-milk plant behind it. Shoot a tank and the flood knocks everyone near it flat.',
    stake: 'Oat milk by the tank. Every flat white in Hipsterheuvel runs on it.',
    call: [[S, 'Bram sells oat milk to every café on the hill. Thousands of litres.'], [E, 'In tanks?'], [S, 'In big tanks. Shoot one when they\'re standing next to it. Very satisfying.']] },
  kombuchakwartier: { crew: 'noshgey', boss: 'Fermenteur Floor', role: 'Talks to her scobies. They talk back.',
    inside: 'The Kombucha Collectief: a bar, a palm lounge and a fermentation hall full of copper tanks that burst when shot.',
    stake: 'The brewing hall where the Noshgey hide spice in the fizz.',
    call: [[S, 'Fermented, filtered, under pressure. Like Floor.'], [E, 'Copper tanks?'], [S, 'They pop. Let them come close first.']] },
  gembergracht: { crew: 'noshgey', boss: 'The Gemberkoning', role: 'Owns the biggest club on the island and the bridge above it.',
    inside: 'De Gemberwortel and Club Gember underneath, under the bridge. The floor is packed with clubgoers: don\'t shoot the dancers.',
    stake: 'The club and the canal under it, where the boats unload at night.',
    call: [[S, 'Club Gember, under the bridge. Packed every night.'], [E, 'Packed with Noshgey?'], [S, 'Packed with kids from Utrecht. The Noshgey are the ones in linen. Aim carefully.']] },
  avocadoakkers: { crew: 'noshgey', boss: 'Doctor Guacamole', role: 'Has a lab coat, a lab, and no medical degree.',
    inside: 'De Groene Goudmijn: a café, a roof garden, glasshouses and a lab. Glass everywhere: they see you, and bullets go straight through.',
    stake: 'Avocados grown under glass with a spice twist. Green gold.',
    call: [[S, 'Doctor Guacamole grows avocados under glass and something else in the lab.'], [E, 'Glass walls again.'], [S, 'Glass walls, glass roof. Nowhere to hide. Be quick.']] },
  glutenvrijegaarde: { crew: 'noshgey', boss: 'Tante Tarwevrij', role: 'Sweet as a muffin. Allergic to mercy.',
    inside: 'A deli, a bamboo garden and a conservatory lab. The bamboo blocks sight both ways.',
    stake: 'The deli supplies every gluten-free shelf on the hill. With extras.',
    call: [[S, 'Tante Tarwevrij. She looks like your grandmother.'], [E, 'My grandmother had a rolling pin.'], [S, 'She has a garden full of Noshgey. Slip through the bamboo, or get jumped in it.']] },
  quinoaplantage: { crew: 'noshgey', boss: 'Opzichter Korrel', role: 'Watches the grain from his mezzanine. Never comes down.',
    inside: 'De Superkorrel: a shop, a grain warehouse and a lounge upstairs. Shoot a sack pile and the dust blinds everyone.',
    stake: 'Superfoods by the tonne, and the money they launder.',
    call: [[S, 'Quinoa by the tonne. Korrel watches it all from upstairs.'], [E, 'Sacks?'], [S, 'Shoot a sack pile. Dust everywhere. They can\'t see, you can move.']] },
  oatoase: { crew: 'noshgey', boss: 'Influencer Isa', role: 'Three million followers. Most of them are bots she paid for.',
    inside: 'A VIP pool party on a canal-side garden. Guards in pairs. The guests are only there for the photos.',
    stake: 'The party where the Noshgey make their deals between selfies.',
    call: [[S, 'Pool party at Oat-oase. Guest list only.'], [E, 'Am I on it?'], [S, 'You are now. Leave the guests, they\'re busy posting. The guards stand in pairs.']] },
  speltpolder: { crew: 'noshgey', boss: 'Goeroe Granola', role: 'Head of the Noshgey Kariot. Breathes in through the nose, out through the wallet.',
    inside: 'De Oerkorrel Commune: a meditation hall, a greenhouse with a golden chest, and his followers everywhere.',
    stake: 'This ends the Noshgey Kariot. And the chest has something of your father\'s.',
    call: [[PA, 'The Goeroe has something of mine. He\'s had it for years.'], [E, 'What is it, Pa?'], [PA, 'Open the chest in the greenhouse and you\'ll see. Mind the chanting. It gets in your head.']] },
  // ---- Act 3: De Duistere Dokken, the Abdavissies
  komijnkade: { crew: 'abdavissies', boss: 'Kademeester Kees', role: 'Owns the quay, the cranes, and a very red room.',
    inside: 'De Natte Komijn and the warehouse behind it. Waves break over the quay. Two hits each, and they all carry guns.',
    stake: 'The Abdavissies\' first warehouse. A foot in the docks.',
    call: [[S, 'The docks. The Abdavissies don\'t do snackbars. They do containers.'], [E, 'And guns.'], [S, 'And guns. Two hits each. Keep away from the edge, the waves take you.']] },
  kaneelsilos: { crew: 'abdavissies', boss: 'The Silobaas', role: 'Lives between the silos. Smells permanently of cinnamon.',
    inside: 'Grain silos full of smuggled cinnamon, with catwalks between them.',
    stake: 'A year of cinnamon, enough for every appeltaart in the country.',
    call: [[S, 'Smuggled cinnamon, by the silo. The Silobaas sleeps up there.'], [E, 'How do I get up?'], [S, 'Stairs. Lots of stairs. And men on every landing.']] },
  paprikapakhuis: { crew: 'abdavissies', boss: 'The Pakhuismeester', role: 'Knows every shelf by heart. In the dark.',
    inside: 'A storehouse with shelves to the ceiling and the lights out. Every aisle is a blind corner.',
    stake: 'Shelves full of smuggled paprika.',
    call: [[S, 'Paprikapakhuis. The lights are off. On purpose.'], [E, 'Great.'], [S, 'Every aisle is a corner. Listen before you turn.']] },
  kruidnagelkade: { crew: 'abdavissies', boss: 'Croupier Clou', role: 'The house always wins. He is the house.',
    inside: 'De Gouden Kruidnagel: a packing hall, and a casino hidden behind a newspaper kiosk. The guards carry shotguns.',
    stake: 'The casino tables where the Abdavissies wash their money.',
    call: [[S, 'There\'s a casino behind that kiosk. Clove smugglers play there every night.'], [E, 'Shotguns?'], [S, 'Shotguns. Keep something solid between you and them.']] },
  peperhaven: { crew: 'abdavissies', boss: 'Havenmeester Peper', role: 'Turned the lights off. Likes it cold and dark.',
    inside: 'The harbour office and sorting hall, blacked out. A fuse box in the hall turns the lights back on.',
    stake: 'The harbour office, where every pepper shipment gets its stamp.',
    call: [[S, 'Peper switched the power off. He likes it dark.'], [E, 'So switch it back on?'], [S, 'Fuse box in the sorting hall. Or fight in the dark. Your call.']] },
  kurkumaloods: { crew: 'abdavissies', boss: 'The Loodsbaas', role: 'Runs Loods 4 from a red office over the floor.',
    inside: 'Loods 4: turmeric by the container, and a crane carrying a container across the hall that sweeps up anyone underneath.',
    stake: 'Turmeric by the container, and the crane that moves it.',
    call: [[S, 'Loods 4. Everything is yellow in there.'], [E, 'Anything else?'], [S, 'The crane. Don\'t stand under the container. Let them stand under it.']] },
  saffraanpier: { crew: 'abdavissies', boss: 'Mevrouw Saffraan', role: 'Holds court in the red room. Weighs everything twice.',
    inside: 'De Rode Draad on the pier, with a saffron vault at the back.',
    stake: 'Saffron, worth more than gold. Crack the vault.',
    call: [[S, 'Saffron is worth more than gold, Eddy. They keep it like gold.'], [E, 'Vault?'], [S, 'At the back. Mevrouw Saffraan holds the key, and court.']] },
  nootmuskade: { crew: 'abdavissies', boss: 'The Veilingmeester', role: 'Sells smuggled nutmeg by the lot. Going, going, gone.',
    inside: 'Veilinghuis De Notenkraker, mid-auction. The bidders in the hall are customers, not fighters.',
    stake: 'Tonight\'s lot: smuggled nutmeg, and every buyer\'s name.',
    call: [[S, 'There\'s an auction on. Smuggled nutmeg, sold by the crate.'], [E, 'Can I bid?'], [S, 'You can win. Leave the bidders. Shoot the auctioneer\'s men.']] },
  smokkelsloot: { crew: 'abdavissies', boss: 'Smokkelaar Sjaak', role: 'Brings the speedboats in under the warehouse.',
    inside: 'A boathouse with a canal right through the hall. Knock them into the water.',
    stake: 'The boats, and the canal route into the city.',
    call: [[S, 'Sjaak\'s boats come in under the warehouse. Right through the middle.'], [E, 'Can they swim?'], [S, 'Not in that water. Push them in.']] },
  containerchaos: { crew: 'abdavissies', boss: 'The Containerkoning', role: 'King of Terminal 7. His throne is a reefer container.',
    inside: 'Terminal 7: a maze of container stacks that block sight and bullets.',
    stake: 'The yard. After this, only Kardemomdok is left.',
    call: [[S, 'Terminal 7. Every container a hiding place.'], [E, 'For them or for me?'], [S, 'Both. Whoever looks round the corner first wins.']] },
  kardemomdok: { crew: 'abdavissies', boss: 'De Abdavis', role: 'Head of the Abdavissies. Never raises his voice. Never needs to.',
    inside: 'The Abdavissies headquarters. De Abdavis waits in his office with his files on the desk.',
    stake: 'This ends the Abdavissies. And his files point somewhere new.',
    call: [[PA, 'De Abdavis. He used to buy from me, back when I sold honest spice.'], [E, 'He doesn\'t buy any more, Pa.'], [PA, 'No. Get his files, Eddy. I want to know who he answers to.']] },
  // ---- De Zandwijk: the Paravim (side act)
  couscouskade: { crew: 'paravim', boss: 'Havenmeester Hamid', role: 'Shouts. Always. Even when he\'s happy.',
    inside: 'The Paravim quay. Three mooring lines to cut before the boats bring more, and a crate hidden under the couscous.',
    stake: 'The Paravim quay, and their smuggled crate.',
    call: [[S, 'The Paravim. Three hits each, and one loud shot wakes the whole quay.'], [E, 'Silencer, then.'], [S, 'Silencer. Cut the mooring lines first, or more boats come in.']] },
  zaatarmarkt: { crew: 'paravim', boss: 'Marktmeester Mustafa', role: 'Collects the market tax from every stall. Twice.',
    inside: 'The Paravim souk. Every stall keeper is already angry with you.',
    stake: 'The souk, and the market tax.',
    call: [[S, 'The souk. Mustafa taxes every stall.'], [E, 'Are the stall keepers with him?'], [S, 'They\'re angry with everyone. Don\'t take it personally.']] },
  sumaksteeg: { crew: 'paravim', boss: 'Sumak-Sami', role: 'Red to the end. Red shirt, red sumak, red temper.',
    inside: 'An alley so narrow they glare at you from both sides. Three lookouts with flares in the doorways.',
    stake: 'The alley, and the sumak that comes through it.',
    call: [[S, 'Three lookouts in the doorways. If one lights a flare, more come running.'], [E, 'Then I get to them first.'], [S, 'Exactly. The carpets block sight. Use them.']] },
  harissahof: { crew: 'paravim', boss: 'Kok Kadir', role: 'Ras al Gara\'s cook. Guards the recipe with a cleaver.',
    inside: 'A red courtyard kitchen. Two of the guards are always arguing: they don\'t see much while they bicker.',
    stake: 'Ras al Gara\'s secret harissa recipe.',
    call: [[S, 'Kadir cooks for Ras al Gara himself. The recipe is in there.'], [E, 'Hot?'], [S, 'Very. Two guards argue all day. Walk past while they shout.']] },
  dadelplein: { crew: 'paravim', boss: 'Penningmeester Faris', role: 'Counts the Paravim Wilders out loud. Loses count when shot at.',
    inside: 'The oasis, with three money chests on the counting tables.',
    stake: 'Three chests of Paravim Wilders.',
    call: [[S, 'Dadelplein. They count the money out loud. You\'ll hear them from the street.'], [E, 'Three chests?'], [S, 'Three. Grab them before they run.']] },
  kasbahalgara: { crew: 'paravim', boss: 'Ras al Gara', role: 'Chief of the Paravim. Seven hits, and a scimitar when he\'s down to three.',
    inside: 'A fortress hall. The Paravim ledger lies on his dais.',
    stake: 'The ledger settles it: who paid the Paravim, and who never did.',
    call: [[PA, 'Ras al Gara thinks I owe him. I don\'t. The ledger will say so.'], [E, 'And if it doesn\'t?'], [PA, 'It will. Watch out when he draws the scimitar. Everyone in there goes mad.']] },
  // ---- the finale
  goudenmolen: { crew: 'final', boss: 'Oom Gerrit', role: 'Pa\'s old partner. The one who sold him out, thirty years ago.',
    inside: 'De Gouden Molen: the shop, the grinding floor, the tower, the loft and the cap. Every crew sent its last men.',
    stake: 'The recipe for De Gouden Mix, hidden in a golden chest at the top.',
    call: [[PA, 'Thirty years ago I hid the recipe in that mill. Gerrit has been looking for it ever since.'], [E, 'He found the mill, Pa.'], [PA, 'Then finish it, Eddy. Climb. And don\'t believe a word he says.']] },
};

// the dossier card (js/mission.js puts it in the page)
export const INTRO_CSS = `
    #nvIntro{position:fixed;left:max(22px,3vw);top:calc(11vh + 14px);width:min(380px,calc(100vw - 32px));z-index:9;pointer-events:none;opacity:0;transform:translateX(-16px);transition:opacity .35s,transform .35s;box-sizing:border-box;
      padding:14px 16px 14px 18px;border-radius:12px;color:#f2f4f8;font:400 14px/1.38 "Rubik","Segoe UI",Arial,sans-serif;
      background:linear-gradient(180deg,rgba(255,255,255,.16) 0,rgba(255,255,255,.05) 38%,rgba(0,0,0,0) 39%),linear-gradient(180deg,rgba(30,44,66,.80),rgba(10,14,24,.88));
      -webkit-backdrop-filter:blur(10px) saturate(1.3);backdrop-filter:blur(10px) saturate(1.3);border:1px solid rgba(255,255,255,.32);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 4px 0 0 var(--crew,#ffd36b),0 10px 34px rgba(0,0,0,.55)}
    #nvIntro.on{opacity:1;transform:none}
    body.introOn #dialogue{bottom:calc(11vh + 12px);z-index:12}
    #nvIntro .tag{font:700 10px/1 "Rubik",Arial,sans-serif;letter-spacing:.14em;color:var(--crew,#ffd36b);display:flex;align-items:center;gap:6px}
    #nvIntro .tag:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--crew,#ffd36b);box-shadow:0 0 8px var(--crew,#ffd36b)}
    #nvIntro .nm{font:900 clamp(18px,2.6vw,24px)/1.1 "Rubik",Arial,sans-serif;margin:6px 0 2px;text-shadow:0 2px 6px rgba(0,0,0,.6)}
    #nvIntro .ar{font-size:12px;color:#b8c4d8;margin-bottom:10px}
    #nvIntro .boss{display:flex;gap:10px;align-items:center;padding:8px;border-radius:9px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12);margin-bottom:8px}
    #nvIntro .boss svg{flex:none;width:46px;height:46px;border-radius:8px;background:radial-gradient(circle at 50% 35%,rgba(255,255,255,.18),rgba(0,0,0,.35));border:1px solid var(--crew,#ffd36b)}
    #nvIntro .boss b{display:block;font:800 15px/1.2 "Rubik",Arial,sans-serif;color:#fff}
    #nvIntro .boss span{display:block;font-size:12.5px;color:#cfd6e2}
    #nvIntro .row{display:grid;grid-template-columns:62px 1fr;gap:8px;margin-top:6px}
    #nvIntro .row i{font:700 9.5px/1.9 "Rubik",Arial,sans-serif;font-style:normal;letter-spacing:.1em;color:var(--crew,#ffd36b)}
    #nvIntro .row p{margin:0;font-size:13px}
    #nvIntro .skip{pointer-events:auto;margin-top:12px;float:right;font:700 12px "Rubik",Arial,sans-serif;color:#fff;padding:7px 12px;min-height:34px;border-radius:7px;cursor:pointer;
      border:1px solid rgba(255,255,255,.45);background:linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,.06) 50%,rgba(0,0,0,.12) 51%,rgba(255,255,255,.08));box-shadow:inset 0 1px 0 rgba(255,255,255,.5)}
    #nvIntro .skip:hover{background:linear-gradient(180deg,rgba(150,210,255,.45),rgba(90,160,230,.2) 50%,rgba(40,100,180,.3) 51%,rgba(120,190,255,.3))}
    #nvIntro.compact .row:not(.st),#nvIntro.compact .skip{display:none}
    @media (max-height:520px){
      #nvIntro{left:auto;right:calc(10px + env(safe-area-inset-right));top:calc(11vh + 6px);width:min(46vw,380px);max-height:calc(78vh - 12px);overflow:hidden;padding:9px 12px 9px 14px;font-size:12px}
      #nvIntro .nm{font-size:17px;margin:3px 0 0}#nvIntro .ar{margin-bottom:5px;font-size:11px}#nvIntro .boss{padding:5px;margin-bottom:4px}#nvIntro .boss svg{width:34px;height:34px}
      #nvIntro .boss b{font-size:13px}#nvIntro .boss span,#nvIntro .row p{font-size:11.5px;line-height:1.3}#nvIntro .row{margin-top:3px}#nvIntro .skip{margin-top:6px;min-height:30px;padding:5px 10px}
      body.introOn #dialogue{left:calc(8px + env(safe-area-inset-left));transform:none;width:calc(54vw - 26px);bottom:calc(11vh + 4px);max-height:calc(78vh - 12px)}}
    @media (max-width:600px) and (min-height:521px){
      #nvIntro{left:12px;right:12px;width:auto;top:calc(11vh + 8px);padding:11px 13px 11px 15px}
      #nvIntro .row{grid-template-columns:54px 1fr}#nvIntro .row p,#nvIntro .boss span{font-size:12.5px}}
`;
