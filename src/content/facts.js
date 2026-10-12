// The Context Window: everything the model knows, one card per fact, grouped by
// who said it. `clue: true` cards belong to the chain that explains the Institute
// (the player is never told which). `sign: n` cards are one of the six signs of
// the illness (config SIGNS); the Context Window gathers them under "Signs".
// Cards can be attached to a reply and delivered to someone else.

export const FACTS = {
  // Ty
  'ty-home': { src: 'ty', text: 'Ty, 17, lives in Millside with his dad and a dog called Pickle.' },
  'ty-dad': { src: 'ty', text: 'His dad, Dan Marsh, works nights at the Institute and taught him to fix bikes.' },
  'ty-bass': { src: 'ty', text: 'Ty plays bass badly, on the one string that works. Pickle once ate half of another.' },
  'ty-dog': { src: 'ty', sign: 3, text: 'Pickle won’t eat. He sits at the front window facing the mill road.' },
  'ty-dad-missing': { src: 'ty', clue: true, text: 'His dad hasn’t been home since Saturday the 20th. He always texts. He didn’t.' },
  'ty-cold': { src: 'ty', clue: true, sign: 1, text: 'His dad’s hands were “like ice” when he hugged him goodbye. “Long night.”' },
  'ty-lamp': { src: 'ty', sign: 5, text: 'Mrs. Pell next door has been standing under the streetlamp since six. No coat.' },
  'ty-repeat': { src: 'ty', sign: 4, text: 'Mrs. Pell only says one word: “light.”' },
  'ty-dad-alive': { src: 'ty', text: 'Charles told Ty over a radio that his dad is alive in the block, “sleeping in the dark room”.' },
  'ty-lights': { src: 'ty', clue: true, text: 'Every window at the Institute is lit, at 11 p.m., on a Tuesday.' },

  // Charles
  'ch-job': { src: 'charles', text: 'Charles runs night facilities at the Institute, east of the river.' },
  'ch-notice': { src: 'charles', clue: true, text: 'Notice 14 told Millside the Institute was doing “routine works”, and nothing else.' },
  'ch-trains': { src: 'charles', text: 'Charles drinks tea at exact hours and is building a model of the whole valley in his spare room.' },
  'ch-vague': { src: 'charles', text: 'He asked you not to add any detail to the notice.' },
  'ch-crew': { src: 'charles', sign: 2, text: 'The East Block night crew are on “extended duty”. Still working at six a.m.' },
  'ch-gap': { src: 'charles', clue: true, text: 'The Institute’s night log has a gap on the 20th, from about two a.m.' },
  'ch-trial': { src: 'charles', clue: true, text: 'On the 20th, in East Block, a trial went wrong. Containment failed at 02:11.' },
  'ch-gate': { src: 'charles', clue: true, text: 'East Block’s inner gate can be sealed from inside, by one person, who then cannot leave.' },
  'ch-log': { src: 'charles', text: 'Charles wrote the full log from inside East Block: the trial, the crew, the gate. He asked you to read it.' },
  'ch-dark': { src: 'charles', text: 'From inside East Block: keep them dark, quiet and warm. No lamps at the gate.' },
  'ch-stable': { src: 'charles', clue: true, text: '“It was meant to be stable. It was stable.”' },

  // Megan
  'meg-clinic': { src: 'megan', text: 'Megan works nights at the Varrow clinic, in the centre.' },
  'meg-cat': { src: 'megan', text: 'Megan was a city paramedic before the clinic. She has a cat called Warfarin and hums show tunes when she is scared.' },
  'meg-mill': { src: 'megan', text: 'Two patients sent home tonight, both from Millside. She calls it “the mill bug”.' },
  'meg-fever': { src: 'megan', sign: 1, text: 'Patients: temperature 38.9, pulse 54, hands cold. A fever that won’t break.' },
  'meg-flu': { src: 'megan', clue: true, text: 'Three patients with the same signs, all from one Millside street.' },
  'meg-institute': { src: 'megan', clue: true, text: 'Two of them work in the Institute canteen.' },
  'meg-county': { src: 'megan', clue: true, text: 'The county answered with one word: “noted”. A team is promised for Friday.' },
  'meg-dark': { src: 'megan', text: 'In a dark, quiet, warm room the patients settle. Patient 1 slept six hours. His hands are warm.' },
  'meg-sleep': { src: 'megan', sign: 2, text: 'Patient 1 hasn’t slept in two days and isn’t tired.' },
  'meg-noeat': { src: 'megan', sign: 3, text: 'None of the patients will eat.' },
  'meg-radio': { src: 'megan', sign: 5, text: 'They stand next to the radio, and by the lit windows, and won’t move.' },
  'meg-repeat': { src: 'megan', sign: 4, text: 'One keeps saying “one more stop”.' },

  // Amelia
  'am-radio': { src: 'amelia', text: 'Amelia runs the community radio on Chapel Lane, west bank.' },
  'am-plan': { src: 'amelia', text: 'Amelia read the safe places on air: the school hall for the well, the clinic tent for the sick, nobody on the bridge.' },
  'am-sundays': { src: 'amelia', text: 'Amelia reads a poem on air every Sunday and bakes the lemon drizzle for the bake sale. Her sign-off is “Stay warm.”' },
  'am-calls': { src: 'amelia', sign: 5, text: 'Callers from Millside say someone is standing at their gate. Many dogs.' },

  // Tomas
  'tom-route': { src: 'tomas', text: 'Tomas drives the night bus: Millside → Old Bridge → Centre → Chapel Lane.' },
  'tom-pass': { src: 'tomas', clue: true, sign: 4, text: 'A passenger repeats “one more stop” at every stop. His hands were like ice.' },
  'tom-forty': { src: 'tomas', text: 'Forty or more people are walking down from Millside to the bridge. Most are fine. Some stand at the lamps.' },
  'tom-run': { src: 'tomas', text: 'Tomas runs the bus to Ana’s farm, checking every passenger’s hands first.' },
  'tom-dolly': { src: 'tomas', text: 'Tomas sings Dolly Parton at the wheel, taps the dashboard at the Old Bridge for luck, and is saving for a van.' },
  'tom-five': { src: 'tomas', text: 'Five Millside passengers heading west at 1 a.m. All want the window seat by the lamp.' },

  // Ana
  'ana-hills': { src: 'ana', text: 'Ana farms in the north hills. One bar of signal if she stands on the rock.' },
  'ana-road': { src: 'ana', text: 'People with torches are walking up the north road toward her farm. A lot of them.' },
  'ana-paperbacks': { src: 'ana', text: 'Ana reads dog-eared crime paperbacks, hates phones, and used to be a vet’s assistant in the city.' },
  'ana-count': { src: 'ana', text: 'People have come through Ana’s gate. She checks every pair of hands before she opens it.' },
  'ana-goats': { src: 'ana', sign: 3, text: 'Her three goats won’t eat. They stood in the top field facing east all afternoon.' },
};

export const clueIds = () => Object.keys(FACTS).filter((id) => FACTS[id].clue);
