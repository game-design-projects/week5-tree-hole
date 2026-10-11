// The town map: a schematic of Varrow. Zones are coloured by how far the
// illness has got; each cast member is a dot (amber = unwell, red = infected,
// and a red dot drifts west toward light and noise). Pure render of engine.mapView().
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
    svg('circle', { cx: z.x, cy: z.y, r: 17, class: 'halo' }),
    svg('circle', { cx: z.x, cy: z.y, r: 9, class: 'core' }),
    svg('text', { x: z.x, y: z.y + 32, class: 'zname' }, z.name)));
  // Dots sharing a zone are fanned out so none hides another.
  const seen = {};
  const dots = view.dots.map((d) => {
    const k = (seen[d.zone] = (seen[d.zone] ?? 0) + 1) - 1;
    const cx = d.x - 10 + k * 11;
    const cy = d.y - 20;
    return svg('g', { class: `dot ${d.status}`, 'data-npc': d.npc, 'data-status': d.status },
      svg('circle', { cx, cy, r: 8 }),
      svg('text', { x: cx, y: cy + 3.5, class: 'dglyph' }, CAST[d.npc].handle[0]));
  });
  return svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'map', role: 'img', 'aria-label': 'Map of Varrow' },
    svg('path', { d: 'M232 0 C 250 60, 222 150, 240 230', class: 'river' }),
    svg('text', { x: 240, y: 12, class: 'rname' }, 'river Ess'),
    svg('text', { x: 40, y: 14, class: 'side' }, 'EAST'),
    svg('text', { x: 392, y: 14, class: 'side end' }, 'WEST'),
    roads, bridge, zones, dots);
}
