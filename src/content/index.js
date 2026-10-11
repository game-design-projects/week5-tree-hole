// All nights, in order. NIGHTS[i].night === i + 1 (tested). Only the first
// PLAYABLE_NIGHTS (config) are written so far.
import night1 from './night1.js';
import night2 from './night2.js';
import night3 from './night3.js';
import night4 from './night4.js';

export const NIGHTS = [night1, night2, night3, night4];
export { CAST, CAST_IDS, FACT_SOURCES } from './cast.js';
export { FACTS, clueIds } from './facts.js';
export { ENDINGS, ENDING_COUNT, TRUTH } from './endings.js';
