// "Encrypt to decrypt": a message appears as noise and resolves into text, left
// to right, with a few characters flickering ahead of the wavefront. Spaces and
// line breaks stay put so the shape of the message is visible from the start.
//
// The animation is driven by a (start, duration) pair rather than by element
// state, so if the chat is re-rendered mid-animation the new element simply
// picks up where the old one was.

const GLYPHS = '▒░▓█#%&@?/\\<>=+*01{}';
const noise = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// How long a message takes to decrypt: quick for short lines, capped for long ones.
export const decryptMs = (text) => Math.min(1400, 350 + text.length * 12);

function textNodes(root) {
  const out = [];
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    // The sender / time line stays readable; only the message itself is encrypted.
    acceptNode: (n) => (n.parentElement?.closest('.meta') ? NodeFilter.FILTER_REJECT : n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  for (let n = walk.nextNode(); n; n = walk.nextNode()) out.push(n);
  return out;
}

// Start (or resume) decrypting `root`. Returns a cancel function. `onDone` runs
// once everything has resolved.
export function decrypt(root, { start, duration, onDone } = {}) {
  const nodes = textNodes(root).map((node) => ({ node, text: node.nodeValue }));
  const total = nodes.reduce((n, x) => n + x.text.length, 0);
  if (!total) return () => {};
  let raf = 0;
  let cancelled = false;

  const frame = (now) => {
    if (cancelled || !root.isConnected) return;
    const t = Math.min(1, (now - start) / duration);
    // The wavefront: how many characters (across the whole message) are resolved.
    const front = Math.floor(t * total * 1.08);
    let seen = 0;
    for (const x of nodes) {
      let out = '';
      for (let i = 0; i < x.text.length; i += 1) {
        const ch = x.text[i];
        const at = seen + i;
        if (ch === ' ' || ch === '\n' || at < front) out += ch;
        else if (at < front + 6) out += Math.random() < 0.45 ? ch : noise(); // flicker near the front
        else out += noise();
      }
      x.node.nodeValue = out;
      seen += x.text.length;
    }
    if (t < 1) raf = requestAnimationFrame(frame);
    else { for (const x of nodes) x.node.nodeValue = x.text; onDone?.(); }
  };
  // Show the noise immediately so the real text never flashes first.
  for (const x of nodes) x.node.nodeValue = x.text.replace(/[^ \n]/g, noise);
  raf = requestAnimationFrame(frame);
  return () => { cancelled = true; cancelAnimationFrame(raf); for (const x of nodes) x.node.nodeValue = x.text; };
}
