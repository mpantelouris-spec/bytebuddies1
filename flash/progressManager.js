/**
 * Serializes flash jobs and normalizes progress events.
 */

export class ProgressManager {
  constructor() {
    this._queue = Promise.resolve();
    this._last = null;
  }

  /**
   * Run async job exclusively (one flash at a time).
   */
  enqueue(fn) {
    const run = this._queue.then(() => fn());
    this._queue = run.catch(() => {});
    return run;
  }

  wrap(onProgress) {
    return (evt) => {
      this._last = evt;
      if (typeof onProgress === 'function') onProgress(evt);
    };
  }

  get last() {
    return this._last;
  }
}

export default { ProgressManager };
