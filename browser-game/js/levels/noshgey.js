// Shared bits for the Act 2 levels (the Noshgey Kariot, Hipsterheuvel): how their guards look and what they shout.
// Spread into a level def: { ...NOSHGEY, id: ..., ... }.

export const NOSHGEY = {
  faction: 'NOSHGEY', factionName: 'Noshgey',
  foeHp: 2, // artisan body armour: every guard takes two hits (bosses one more)
  foeCap: 0xa9c46a,
  foeLooks: [ // cardamom green, cream and copper: linen shirts, aprons, beanies
    { front: '#a9c46a', shirt: 0xa9c46a, pants: 0x3a3a2a }, { front: '#f3e6c8', shirt: 0xf3e6c8, pants: 0x5a6a3a },
    { front: '#5a6a3a', shirt: 0x5a6a3a, pants: 0xd8ccb0 }, { front: '#c87a3a', shirt: 0xc87a3a, pants: 0x2a2a24 },
  ],
  alertLines: ['Hé! Geen schoenen op het hout!', 'Dit is een glutenvrije zone!', 'Pak hem! Maar duurzaam!', 'Noshgey forever!', 'Ken jij onze missie eigenlijk?', 'Eddy Junior?! Wat een energie...', 'Jij bent zó niet biologisch!'],
};

// Water cells ('~'): block walking, bullets fly over, and a body slammed into the edge goes in (def.hazard).
export const WATER_FURN = { '~': { h: 0.05, cover: false, draw: () => {} } };
export const WATER_HAZARD = { ch: '~', text: 'SPLASH!', death: 'Fell in the harbour.' };
