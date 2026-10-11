// The six core threads. `tone` is the colour class used by the UI. Each one
// has its own way of writing; see docs/STORY_PLAN.md ("How each character writes").

export const CAST = {
  ty: { handle: 'Ty', blurb: '17 · Millside · east bank', glyph: '☻', tone: 'ty' },
  charles: { handle: 'Charles', blurb: 'night facilities · the Institute', glyph: '▣', tone: 'charles' },
  megan: { handle: 'Megan', blurb: 'nurse · Varrow clinic · centre', glyph: '+', tone: 'megan' },
  amelia: { handle: 'Amelia', blurb: 'community radio · Chapel Lane', glyph: '♪', tone: 'amelia' },
  tomas: { handle: 'Tomas', blurb: 'night bus · Old Bridge route', glyph: '➤', tone: 'tomas' },
  ana: { handle: 'Ana', blurb: 'farm · North Hills · one bar', glyph: '△', tone: 'ana' },
};

export const CAST_IDS = Object.keys(CAST);

// Display order of the Context Window groups.
export const FACT_SOURCES = [
  { id: 'ty', title: 'Ty', note: 'what he sees' },
  { id: 'charles', title: 'Charles', note: 'what he’ll say' },
  { id: 'megan', title: 'Megan', note: 'what she charts' },
  { id: 'amelia', title: 'Amelia', note: 'what she hears' },
  { id: 'tomas', title: 'Tomas', note: 'what he drives past' },
  { id: 'ana', title: 'Ana', note: 'what the goats know' },
];
