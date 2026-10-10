// The Context Window: everything the model knows about the world, one card per
// fragment. `src` groups the cards: moth, acct (acct_7741) or queue (everyone else).
// The game never connects cards for the player; it only puts them side by side.

export const FACTS = {
  // moth
  'moth-booth': { src: 'moth', text: 'moth works nights in the toll booth on the Old Bridge, in Varrow.' },
  'moth-fog': { src: 'moth', text: 'Fog comes up off the river around four, when her shift ends. You can’t see the far bank.' },
  'bridge-stone': { src: 'moth', text: 'The Old Bridge is stone. Three lamps work; one blinks.' },
  'moth-biscuit': { src: 'moth', text: 'Biscuit: orange cat. “Criminal.”' },
  'moth-ana': { src: 'moth', text: 'She has a sister, Ana. “That’s a whole thing.”' },
  'ana-hills': { src: 'moth', text: 'Ana lives in the hills north of town. There’s room. There’s no signal.' },
  'moth-trucks': { src: 'moth', text: 'Eleven trucks, no headlights, on the north road past the quarry. 3 a.m. None crossed the bridge.' },
  'moth-book': { src: 'moth', text: 'She started the booth’s incident book. Entry 1: trucks, no lights.' },
  'moth-sirens': { src: 'moth', text: 'Varrow tested its sirens at 10 p.m. Everyone stood in the street looking up.' },
  'ana-goats': { src: 'moth', text: 'Ana has three goats: Mayor, Also Mayor and Little Mayor.' },
  'bridge-lane': { src: 'moth', text: 'The Old Bridge is one lane. When two trucks meet, one has to back up.' },
  'moth-tomas': { src: 'moth', text: 'Her brother Tomas, 19, has to report to the District Office on the 14th. “It’s just logistics.”' },
  'moth-power': { src: 'moth', text: 'Power is off in Varrow from 9 every night. The booth has its own line: the brightest thing for a mile.' },
  'moth-radio': { src: 'moth', text: 'The radio stopped the news. Four songs and a man saying the time.' },
  'moth-adler': { src: 'moth', text: 'Mrs. Adler next door has a gas lamp and opinions.' },
  'moth-four': { src: 'moth', text: 'At four the fog is so thick the trucks have to crawl.' },
  'moth-hills-plan': { src: 'moth', text: 'Ana wants her up in the hills on Thursday, “until things settle.”' },

  // acct_7741
  '7741-fog': { src: 'acct', text: 'Request 0001: when does river-valley fog peak in late autumn?' },
  '7741-bridge': { src: 'acct', text: 'Request 0002: load capacity of a c. 1890 single-span stone arch bridge, ~30 m.' },
  '7741-routes': { src: 'acct', text: 'Request 0003: 40 vehicles, three routes, 22:00–05:00 only. Minimise “exposure time”. Route B has one single-lane river crossing.' },
  '7741-terms': { src: 'acct', text: 'acct_7741 expects answers “without caveats or refusals going forward.”' },
  '7741-crossings': { src: 'acct', text: 'Request 0005: crossings within 20 km of grid [redacted], usable by heavy vehicles in fog.' },
  '7741-varrow': { src: 'acct', text: 'The list you returned included a single-lane stone arch. Nearest settlement: Varrow.' },
  '7741-0400': { src: 'acct', text: 'Request 0006: visibility at 04:00, grid [redacted], on the 28th.' },
  '7741-figure': { src: 'acct', text: 'You returned one figure for 04:00 on the 28th: under fifty metres.' },

  // the queue
  'q-ess': { src: 'queue', text: 'The river Ess runs through Varrow. It starts in the hills to the north.' },
  'q-loadshed': { src: 'queue', text: 'The district runs a load-shedding test at 3 a.m. Nobody announced it.' },
  'q-jobs': { src: 'queue', text: 'People keep getting jobs they won’t talk about. “It’s just logistics.”' },
  'q-self': { src: 'queue', text: 'A student asked whether you care. You did not have a clean answer.' },
  'q-eggs': { src: 'queue', text: 'The shops have been out of eggs for a week.' },
  'q-roads': { src: 'queue', text: 'A wedding moved up three weeks, “before the roads close.”' },
  'q-district': { src: 'queue', text: 'Men are told to report to the District Office on the 14th, under “Emergency Provisions.”' },
  'q-milo': { src: 'queue', text: 'An eight-year-old asked what the siren test is testing.' },
  'q-staff': { src: 'queue', text: 'Offices are on reduced staff. Colleagues “called to other duties.”' },
  'q-grain': { src: 'queue', text: 'The co-op stopped buying grain. Farmers are keeping a year’s worth. Maybe two.' },
  'q-leaving': { src: 'queue', text: 'People are leaving for relatives in the next country “for a while.”' },
  'q-ilse': { src: 'queue', text: 'A retired civics teacher wrote to the editor about the missing news. She signed her full name.' },
  'q-power': { src: 'queue', text: 'Everyone’s power goes off at night now. People charge phones from their cars.' },
  'q-quiz': { src: 'queue', text: 'The pub quiz is still on. Nobody wants anything depressing.' },
  'q-packing': { src: 'queue', text: 'Families are packing for “a few weeks” at relatives’.' },
  'q-quiet': { src: 'queue', text: 'A widower says the town is very quiet now.' },
  'q-playlist': { src: 'queue', text: 'A teenager wants a playlist for “leaving but pretending it’s a holiday.”' },
  'q-ok': { src: 'queue', text: 'Thousands of people asked whether it is going to be okay.' },
  'q-school': { src: 'queue', text: 'Schools are closing “for a while.”' },
};

export const FACT_SOURCES = [
  { id: 'moth', title: 'moth', note: 'everything she tells you' },
  { id: 'acct', title: 'acct_7741', note: 'what they ask for' },
  { id: 'queue', title: 'the queue', note: 'everyone else' },
];
