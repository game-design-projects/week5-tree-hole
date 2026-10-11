// Route predicates shared by the later nights: which way has the story gone?
// All take the game state `s` and read only its flags.

export const sealedEarly = (s) => Boolean(s.flags.sealedEast && s.flags.sealedNight <= 4 && !s.flags.breach);
export const busHeld = (s) => Boolean(s.flags.tomasHeld && !s.flags.tomasCrossed);
export const covered = (s) => Boolean(s.flags.charlesBuried && !s.flags.ameliaInformed);
export const truthOnAir = (s) => Boolean(s.flags.ameliaTruth);
export const bridgeShut = (s) => Boolean(s.flags.bridgeClosed);
export const evacuating = (s) => Boolean(s.flags.evacuating);
export const gateSealed = (s) => Boolean(s.flags.eastGateSealed);
