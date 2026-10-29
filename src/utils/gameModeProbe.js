/**
 * Game Modes — what happened during the current run (notes and drums played, a win…),
 * so challenge checks can see it. The Game Builder resets this whenever Play starts.
 */
export const gameModeProbe = {
  events: [],
  won: false,
  startedAt: 0,
  reset() {
    this.events = [];
    this.won = false;
    this.startedAt = Date.now();
  },
  log(kind, value) {
    this.events.push({ kind, value, t: Date.now() });
    if (this.events.length > 4000) this.events.shift();
  },
  count(kind) {
    return this.events.reduce((n, e) => n + (e.kind === kind ? 1 : 0), 0);
  },
};
