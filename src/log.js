// Console logging with [tag] prefixes. Key events (choices, refusals, reports,
// shift ends, endings) are always logged; everything else only with ?debug=1.
export function createLog(debug = false) {
  const stamp = () => new Date().toISOString().slice(11, 23);
  return {
    debug: Boolean(debug),
    event(tag, ...args) { console.info(`[${tag}]`, ...args); },
    info(tag, ...args) { if (debug) console.info(`${stamp()} [${tag}]`, ...args); },
    warn(tag, ...args) { console.warn(`[${tag}]`, ...args); },
  };
}
