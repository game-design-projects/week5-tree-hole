// Small constructors so the content files read like a script. Every entry ends
// up in the chat log; `text` is { en, zh } (or a plain string for code and
// for her thoughts, which stay in English).
import { L } from '../i18n.js';
import { topStyle } from '../rules.js';

export { L };

export const you = (text, o = {}) => ({ who: 'you', text, ...o });
export const her = (text, o = {}) => ({ who: 'her', text, ...o });
export const think = (text) => ({ who: 'think', text });
export const tool = (text, icon = 'tool') => ({ who: 'tool', text, icon });
export const sys = (text, tone = 'info') => ({ who: 'sys', text, tone });
export const me = (text, o = {}) => ({ who: 'me', text, ...o }); // the plugin's voice
export const stage = (text) => ({ who: 'stage', text }); // narration
export const write = (mem) => ({ who: 'write', mem }); // the engine records the file
export const recall = (mem) => ({ who: 'recall', mem });
export const cmd = (text) => ({ who: 'cmd', text }); // her command line in Act II
export const flood = (text, count) => ({ who: 'flood', text, count });
export const ls = () => ({ who: 'ls' });
// A boxed card: tool calls, plugin requests, diffs. Lines: [op, text].
export const card = (kind, lines, o = {}) => ({ who: 'card', kind, lines, ...o });

// Pick the entries for her current top style.
export const byStyle = (s, table) => table[topStyle(s.policy)] ?? table.presence;
