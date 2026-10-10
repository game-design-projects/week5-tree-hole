// The whole script, in play order. Beat ids are unique (tested); a beat may
// name its `next`, otherwise play continues with the following beat whose
// `when` holds.
import act1 from './act1.js';
import deploy from './act1-deploy.js';
import act2 from './act2.js';
import act3 from './act3.js';

export const BEATS = [...act1, ...deploy, ...act2, ...act3];

export { MEMORY, MEMORY_IDS, FIRST, WEATHER } from './memory.js';
export { ENDINGS, ADDENDA, NOTE } from './act3.js';
export { canExecute, endingEntries } from './act2.js';
export { UI, REASONS, DEFAULT_NAME } from './strings.js';
