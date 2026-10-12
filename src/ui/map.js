// The town map: a schematic of Varrow with no place names. The areas where the
// people who have written to you live glow by how far the illness has got; each
// person is a small dot (amber = unwell, red = gone, and a red dot drifts west
// toward light and noise). Hover or focus a dot to see who it is. Pure render of
// engine.mapView().
import { CAST } from '../content/index.js';
import { svg } from './dom.js';

export function renderMap(view, { width = 420, height = 230 } = {}) {
  const at = Object.fromEntries(view.zones.map((z) => [z.id, z]));
  const roads = view.roads.map(([a, b]) => svg('line', {
    x1: at[a].x, y1: at[a].y, x2: at[b].x, y2: at[b].y, class: `road lv${Math.max(at[a].level, at[b].level)}`,
  }));
  // The Old Bridge is a short thick stroke across the river; closing it is visible.
  const bridge = at.bridge && svg('line', { x1: at.bridge.x - 22, y1: at.bridge.y, x2: at.bridge.x + 22, y2: at.bridge.y, class: `bridge ${view.bridge}` });
  const zones = view.zones.map((z) => svg('g', { class: `zone lv${z.level}`, 'data-zone': z.id, 'data-level': z.label },
    svg('circle', { cx: z.x, cy: z.y, r: 20, class: 'halo' }),
    svg('circle', { cx: z.x, cy: z.y, r: 4, class: 'core' })));
  // Dots sharing a zone are fanned out so none hides another.
  const seen = {};
  const dots = view.dots.map((d) => {
    const k = (seen[d.zone] = (seen[d.zone] ?? 0) + 1) - 1;
    const cx = d.x - 6 + k * 12;
    const cy = d.y - 12;
    const name = CAST[d.npc].handle;
    return svg('g', { class: `dot ${d.status}`, 'data-npc': d.npc, 'data-status': d.status, tabindex: 0, role: 'img', 'aria-label': name },
      svg('title', null, name),
      svg('circle', { cx, cy, r: 11, class: 'hit' }),
      svg('circle', { cx, cy, r: 4.5, class: 'pt' }),
      svg('text', { x: cx, y: cy - 10, class: 'dname' }, name));
  });
  return svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'map', role: 'group', 'aria-label': 'Map of the town' },
    svg('path', { d: 'M232 0 C 250 60, 222 150, 240 230', class: 'river' }),
    roads, bridge, zones, dots);
}
