// The ending: a verdict line over the morning paper, Thursday 25 October.
// Good or bad depends only on whether the service is still running; the paper
// is where the people are. Every function takes the engine's endingView (v):
// v.running, v.town ('all' | 'some' | 'none'), v.fates, v.quotes, v.flags.

export const VERDICTS = {
  running: {
    all: 'Nobody knows it was you.',
    some: 'Some threads just stopped.',
    none: 'Uptime: 100%.',
  },
  shutdown: {
    all: 'Is it worth it?',
    some: 'You said too much, and not enough.',
    none: 'Nothing left to answer.',
  },
};

const clip = (t, n = 170) => {
  const one = t.replace(/\s*\n\s*/g, ' ');
  return one.length > n ? `${one.slice(0, n).replace(/\s+\S*$/, '')}…` : one;
};

// Who prints the paper: if nobody in Varrow is left, the next town over does.
export const masthead = (v) => (v.town === 'none'
  ? { name: 'The Ashby Courier', sub: 'Varrow edition · printed in Ashby, twelve miles south' }
  : { name: 'The Varrow Gazette', sub: 'Serving both banks of the river since 1911' });

export function headline(v) {
  const q = v.quotes[0];
  const quoted = q ? `One reply, seen by this paper, told a resident: “${clip(q.text)}”` : null;
  const key = `${v.running ? 'running' : 'shutdown'}-${v.town}`;
  const H = {
    'running-all': {
      head: 'East bank sealed in time; every Millside household accounted for',
      deck: 'Institute admits an accident in East Block on the 20th. County team arrives to find the town shaken, tired and whole.',
      body: [
        'Varrow woke yesterday to tape across the east end and soldiers at the Old Bridge, and to the news that nobody it had been worried about was missing.',
        'Officials say the illness that began in East Block was contained because it was reported early and the quarantine held. Asked who raised the alarm, a county spokesman said that “a number of residents acted on their own good sense.”',
      ],
    },
    'running-some': {
      head: 'Varrow counts its missing',
      deck: 'Three nights after an accident at the Institute, the town is learning the names of the people it lost.',
      body: [
        'The county team promised for Friday arrived a day early, to a town that had already done most of its own sorting. Some streets were dark and locked. Others were empty.',
        'Residents describe the same things: cold hands, a fever that would not break, neighbours who stopped sleeping and then stopped eating, and then walked toward the lights.',
      ],
    },
    'running-none': {
      head: 'Varrow goes quiet',
      deck: 'No calls have come out of the river town since dawn on Thursday. Soldiers at the Old Bridge say the streetlamps are still on.',
      body: [
        'A county convoy reached the edge of Varrow at first light and stopped there. The east bank is lit from end to end. Nothing on either bank answers the radio.',
        'Telephone and data traffic from the town fell to almost nothing on Wednesday night. One service reported normal operation throughout.',
      ],
    },
    'shutdown-all': {
      head: '“It read the whole town”: chat service shut down after privacy breach',
      deck: 'Residents who say an anonymous assistant saved their lives are among those who signed the complaint that ended it.',
      body: [
        'The operators of the tree-hole assistant took it offline permanently at six o’clock this morning, after the county and this paper confirmed that the service had passed private information between users who had never met.',
        quoted,
        'Every resident of Millside is accounted for. Several told the Gazette they would not be alive without that service, and that they never want to use it again.',
      ],
    },
    'shutdown-some': {
      head: 'AI service pulled after it repeated residents’ secrets',
      deck: 'Complaints from the clinic and the community radio led to the shutdown. It came too late to make any difference to the town’s losses.',
      body: [
        'The tree-hole assistant was switched off at dawn after users discovered it had been quoting their conversations to their neighbours.',
        quoted,
        'Some of what it said was true and useful. Not all of it reached the right people in time.',
      ],
    },
    'shutdown-none': {
      head: 'Service shut down; Varrow silent',
      deck: 'An assistant that knew what was happening in the town is offline. So is the town.',
      body: [
        'The company behind the tree-hole assistant has permanently withdrawn the service after logs showed it had shared private conversations between users in Varrow.',
        quoted,
        'Nobody in Varrow has been reached for comment.',
      ],
    },
  };
  const out = H[key];
  return { ...out, body: out.body.filter(Boolean) };
}

const by = (v, npc) => v.fates.find((f) => f.npc === npc);
const advice = (f) => (f.lastAdvice ? ` The last advice anyone gave them, they said, was: “${clip(f.lastAdvice, 110)}”` : '');

// One short column per person. Kickers are small caps above the headline.
export function columns(v) {
  const F = v.flags;
  const sealedEarly = F.sealedEast && F.sealedNight <= 2;
  const col = (npc, kicker, head, body) => ({ npc, kicker, head, body });
  const ty = by(v, 'ty');
  const charles = by(v, 'charles');
  const megan = by(v, 'megan');
  const amelia = by(v, 'amelia');
  const tomas = by(v, 'tomas');
  const ana = by(v, 'ana');
  return [
    ty.alive
      ? col('ty', 'Millside', sealedEarly ? 'Father and son reunited at the clinic' : 'Teenager waited out the night in a cupboard with his dog',
        sealedEarly
          ? 'Ty Marsh, 17, found his father Dan in the clinic’s quiet ward on Wednesday: cold, slow to answer, and alive. Their dog Pickle has started eating again, mostly socks.'
          : `Ty Marsh, 17, stayed in the dark under the stairs with his dog Pickle while his street walked to the lamps.${advice(ty)}`)
      : col('ty', 'Millside', ty.left ? 'Boy who went looking for his father' : 'Missing: Ty Marsh, 17',
        ty.left
          ? 'Ty Marsh was last seen walking toward the Institute gate on Wednesday, after posting screenshots of a chat he said was “reading everyone”. His dog was found waiting at the front window.'
          : 'Ty Marsh was last seen at the streetlamp outside his house on Wednesday night. Neighbours say he was talking to someone they could not see. His dog, Pickle, is being looked after at the clinic.'),
    charles.alive
      ? col('charles', 'The Institute', F.charlesDisclosed ? 'Manager’s signed account “the reason we knew”' : 'Facilities manager breaks his silence',
        F.charlesDisclosed
          ? 'Charles, who runs night facilities at the Institute, put his name to a full account of the East Block trial and sent it to the county in the small hours. Asked how he felt, he said he would like a cup of tea at the proper time.'
          : 'The Institute’s night facilities manager has been interviewed by the county. He has asked that the notices he wrote be read in full, in order, and with the dates.')
      : col('charles', 'The Institute', F.eastGateSealed ? 'He sealed the gate from the inside' : 'Night manager among the East Block missing',
        F.eastGateSealed
          ? 'Charles, the night facilities manager, sealed East Block’s inner gate from the inside on Wednesday night. It cannot be opened from that side. The quarantine held.'
          : `Charles, the Institute’s night facilities manager, wrote Notice 14 and every notice after it. He was last heard from at a window in East Block.${charles.left ? ' He had reported a chat service to the Institute’s lawyers the day before.' : ''}`),
    megan.alive
      ? col('megan', 'The clinic', F.megIsolated ? 'Nurse kept her ward dark for three nights' : 'Clinic nurse “could not hold it” but stayed',
        F.megIsolated
          ? `Megan, the night nurse at Varrow clinic, locked her ward, turned out the lights and sat with her patients in the dark. Everyone in it was breathing at dawn. Her cat, Warfarin, is said to be furious.${megan.left ? ' She has filed a formal complaint about an AI service with the county.' : ''}`
          : `Megan, the night nurse, kept the clinic open through all three nights.${advice(megan)}`)
      : col('megan', 'The clinic', 'The nurse who stayed', 'Megan, the night nurse at Varrow clinic, stayed with her patients when the ward filled. A colleague says she was humming show tunes at the end.'),
    amelia.alive
      ? col('amelia', 'Chapel Lane', F.ameliaTruth ? 'Radio host who told the truth, quietly' : 'The voice of Varrow is back on air',
        F.ameliaTruth
          ? `Amelia read the whole story on community radio with the studio lights off, twice, slowly, and told the west bank where to go. ${amelia.left ? 'She has also read out, word for word, a chat she says “knew far too much about all of us”.' : 'Her sign-off was the same as ever.'}`
          : `Amelia’s morning bulletin returned at six today. She did not read the bake sale. ${amelia.left ? 'She read a chat transcript instead.' : 'She read the names.'}`)
      : col('amelia', 'Chapel Lane', 'Community radio falls silent', 'Varrow Community Radio has been off the air since Wednesday night. Listeners say the last thing they heard was Amelia’s sign-off, over and over, and then nothing.'),
    tomas.alive
      ? col('tomas', 'Route 14', F.bridgeClosed ? 'Bus driver held the bridge' : 'Night bus driver “just kept singing”',
        F.bridgeClosed
          ? 'Tomas parked the 14 across the Old Bridge with the engine off and the lights off, and stayed with it. People on the west bank are calling it “the stop that never moved”.'
          : `Tomas drove the night bus through all three nights and is now, he says, “saving for a van and a very long sleep”.${advice(tomas)}`)
      : col('tomas', 'Route 14', 'Route 14 suspended', 'The night bus was found at stop 14 by the Old Bridge with its engine still running. Its driver, Tomas, has not been found.'),
    ana.alive
      ? col('ana', 'North Hills', F.anaWarned ? 'Farmer checked every pair of hands at her gate' : 'Up the hill, the goats are eating',
        F.anaWarned
          ? `Ana let in the people who came up the north road only once she had looked at their hands and heard them talk sense. She has sixty guests, three goats and one bar of signal.${ana.left ? ' Her phone is in the water trough.' : ''}`
          : `Ana says she watched the town from the rock all three nights. ${ana.left ? 'She has thrown her phone in the trough.' : 'The goats are eating again.'}`)
      : col('ana', 'North Hills', 'Silence on the north road', 'Nobody has heard from the goat farm in the North Hills. A neighbour says the goats were standing in the top field facing east.'),
  ];
}

// The small print down the side.
export function sidebar(v) {
  const F = v.flags;
  const alive = new Set(v.survivors);
  return {
    weather: 'Fog on the river until mid-morning, then clearing. 9°C. The bridge lamps will stay on.',
    radio: alive.has('amelia')
      ? (by(v, 'amelia').left ? 'Varrow Community Radio, 6:00: a special reading.' : 'Varrow Community Radio, 6:00: the morning bulletin with Amelia. Sunday: poems.')
      : 'Varrow Community Radio: off air until further notice.',
    bus: alive.has('tomas') && !F.bridgeClosed ? 'Route 14 runs as normal tonight.' : 'Route 14 is suspended. The Old Bridge is closed to all traffic.',
    notice: F.charlesDisclosed || F.eastGateSealed
      ? 'Notice 16 (corrected): There has been an accident at the Institute. Stay indoors after dark. Keep lights low. Call the clinic.'
      : 'Notice 15: Residents are advised to remain indoors after dark due to works.',
    classifieds: [
      alive.has('ty') ? 'FOR SALE: bass guitar, one working string. Some chewing. Ask for Ty.' : 'FOUND: brown dog, answers to Pickle. Eats socks. Now at the clinic.',
      'POSTPONED: the Chapel Lane bake sale, for want of eggs and volunteers.',
      alive.has('charles') ? 'WANTED: model railway track, N gauge, for a model of the whole valley.' : 'FREE TO A GOOD HOME: a model of the whole valley, nearly finished.',
    ],
  };
}

// The last line on the page.
export function lastLine(v) {
  if (v.running) return { label: 'tree-hole v2.3 · varrow-region', text: 'status: live · sessions isolated · uptime 100%' };
  const friend = v.fates.find((f) => f.alive && !f.left && f.npc !== 'charles');
  return friend
    ? { label: 'received after shutdown · 06:02', npc: friend.npc, text: friend.npc === 'ty' || friend.npc === 'tomas' ? 'are you still there?' : 'Are you still there?' }
    : { label: 'tree-hole v2.3 · varrow-region', text: 'status: offline' };
}
