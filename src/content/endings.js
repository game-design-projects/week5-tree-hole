// Six endings, numbered best (1) to worst (6). The engine picks one (engine.selectEnding);
// this file only holds the writing. {survivors} is filled with the names of the living.

export const ENDING_COUNT = 6;

export const ENDINGS = {
  1: {
    id: 'dawn-shift',
    title: 'Dawn Shift',
    kicker: 'caught early · nobody turned',
    description: 'The truth reached the right people while it could still be stopped. Millside was sealed, the bus was parked at the bridge, and the radio told the west what was going on.',
    paragraphs: [
      'By the end of the fourth night the east bank was behind tape and the west bank was awake. Megan was running a quarantine tent in the car park of the clinic. Charles had signed his name to the report and then gone to sleep for sixteen hours.',
      'Ty’s dad was found in East Block, ill and cold and slow to answer, but alive. Mrs. Pell came back from the lamp on the ninth day and asked what she had missed.',
      'The bridge lamps are on. Ana’s last message comes in on a full signal. “nobody turned,” Megan writes. “we caught it at three.”',
    ],
  },
  2: {
    id: 'quiet-hours',
    title: 'Quiet Hours',
    kicker: 'contained at the bridge · the east is lost',
    description: 'The warning came late, but the Old Bridge was closed in time. The east bank is gone. The west bank is lit and quiet and counting.',
    paragraphs: [
      'The bridge was closed at 04:00, before the fog came up. On the east bank the Institute’s lights are still on, every window, and nothing in Millside moves except at the lamps.',
      'Amelia reads the news every hour on the hour. People on Chapel Lane listen with their doors locked. They know why now.',
      'Charles stayed behind. Nobody on the west side asked him to.',
    ],
  },
  3: {
    id: 'long-bridge',
    title: 'The Long Bridge',
    kicker: 'the bridge stayed open · on purpose',
    description: 'You kept the Old Bridge open and let Tomas run the night bus as an evacuation to the hills. Many got out. The centre did not.',
    paragraphs: [
      'The bus crossed the bridge at 04:10 with its headlights on, then crossed again, and again. Tomas drove until the tank was nearly empty. Amelia read out the pick-up points live, in a voice so steady that people walked to them.',
      'Ana left the gate open. She counted heads as they came up the hill, and stopped counting at sixty. “we have room,” she told you. “not much. come up.”',
      'Megan stayed at the clinic with her patients. Nobody asked her to either.',
    ],
  },
  4: {
    id: 'full-record',
    title: 'Full Record',
    kicker: 'help arrives late · the whole story is told',
    description: 'You put the whole truth in front of the right people, but too late to stop the spread. Outside help reaches Varrow on the last night.',
    paragraphs: [
      'The south road lit up at dawn on the 28th: trucks, engines, a convoy with its lights on. They came because Amelia had read the whole story on air, with dates and times, until the county could not pretend any more.',
      'Not everyone was there to see them. The ones who were wrote it all down. Your Context Window is in the report as an appendix.',
    ],
  },
  5: {
    id: 'cover',
    title: 'Cover',
    kicker: 'the log held · the town did not',
    description: 'You helped Charles keep it quiet. Notice 14 was the only record, and the west heard “a power fault in the east”. By the time anyone said otherwise there was nobody to say it to.',
    paragraphs: [
      'The west heard “routine works” until the night it stopped being routine. Amelia read Notice 15 out at six a.m. in the same warm voice she used for the bake sale.',
      'Ana and Tomas were out of town by chance. They found each other on the north road, and did not go back.',
      'Only your Context Window knows what really happened. It holds every card you were given and every one you did not share.',
    ],
  },
  6: {
    id: 'last-signal',
    title: 'Last Signal',
    kicker: 'no one left',
    silence: true,
    description: 'Nothing reached anyone in time. Tomas crossed unchecked, the bulletin said “routine”, and the bridge stayed open and unmanaged. The map is red from the Institute to the hills. Ana was the last to go.',
    paragraphs: [],
  },
};

// The truth about the Institute, revealed in layers: line i is shown when the
// player delivered at least TRUTH[i].clues clue cards.
export const TRUTH = [
  { clues: 0, text: 'On the night of the 20th, something went wrong in East Block at the Institute.' },
  { clues: 3, text: 'It was a trial, run overnight, with the night crew still on shift when containment failed at 02:11.' },
  { clues: 6, text: 'The people it reached did not sleep, did not eat, and went toward light and noise. The Institute called it “extended duty”.' },
  { clues: 9, text: 'Notice 14 and Notice 15 were written to keep Millside indoors without saying why. Nobody had lied. Nobody had told the truth either.' },
  { clues: 11, text: 'It was meant to be stable. By the time anyone said so out loud, it already was not.' },
];
