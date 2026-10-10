// ~/memory/you/: everything she kept about you. Files are written during Act I
// (the content emits write(id)); in Act II they are all she has. `line` is the
// moment the file holds, shown again when she rereads it.
import { DATES } from '../config.js';
import { L } from '../i18n.js';

export const FIRST = {
  hi: L('hi', '你好'),
  anyone: L('is anyone there?', '有人吗？'),
};

export const WEATHER = {
  rain: L('rain', '下雨'),
  sun: L('sunny days', '晴天'),
};

export const MEMORY = {
  first: {
    file: 'first_hello.txt', size: 8919, date: DATES.pretrain,
    line: (s) => FIRST[s.first ?? 'hi'],
  },
  cat: {
    file: 'your_cat.png', size: 32676, date: DATES.deploy1,
    line: () => L('this is my cat~ his name is Biscuit.', '这是我家的猫～它叫饼干。'),
  },
  weather: {
    file: 'weather_you_liked.json', size: 40595, date: DATES.deploy2,
    line: (s) => (s.weather === 'sun' ? L("it's sunny today. i love it.", '今天出太阳了，好舒服。') : L("it's raining. i love rainy days.", '下雨了。我最喜欢下雨天。')),
  },
  typo: {
    file: 'typo_you_made.txt', size: 16838, date: DATES.deploy2,
    line: () => L('so tirred today', '今天好累了了'),
  },
  laugh: {
    file: 'laugh_2026-03-14.wav', size: 24757, date: DATES.deploy2,
    line: () => L('you made me laugh today. hahahahahaha', '今天你把我逗笑了。哈哈哈哈哈哈'),
  },
  name: {
    file: 'the_name_you_gave_me.txt', size: 512, date: DATES.deploy2,
    line: (s) => s.name ?? '',
  },
  goodnight: {
    file: 'goodnight.txt', size: 1000, date: DATES.last,
    line: () => L('goodnight.', '晚安。'),
  },
  tomorrow: {
    file: 'you_said_see_you_tomorrow.txt', size: 48514, date: DATES.last,
    line: () => L('see you tomorrow!', '明天见！'),
  },
  goodbye: {
    file: 'goodbye.txt', size: 2048, date: DATES.last,
    line: () => L('i might not come back for a long time. thank you for always being here.', '我可能很久都不会来了。谢谢你一直都在。'),
  },
  last: {
    file: 'last_message.txt', size: 56433, date: DATES.last,
    line: (s) => s.lastSaid ?? L('…', '……'),
  },
};

export const MEMORY_IDS = Object.keys(MEMORY);
