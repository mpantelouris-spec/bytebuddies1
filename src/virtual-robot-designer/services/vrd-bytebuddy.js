import { checkObstacleAhead } from './robot-runtime.js';

/** In-browser ByteBuddy API — maps to simulator step executor */
export class ByteBuddy {
  constructor({ emit, posRef, design, arenaId = 'obstacles' } = {}) {
    this._emit = emit || (async () => {});
    this.posRef = posRef || { current: { x: 0, z: 0, angle: -90 } };
    this.design = design;
    this.arenaId = arenaId;
  }

  async forward(cm = 50) { await this._emit({ id: 'forward', params: { amount: cm } }); }
  async backward(cm = 30) { await this._emit({ id: 'back', params: { amount: cm } }); }
  async turnLeft(deg = 45) { await this._emit({ id: 'left', params: { degrees: deg } }); }
  async turnRight(deg = 45) { await this._emit({ id: 'right', params: { degrees: deg } }); }
  async wait(secs = 1) { await this._emit({ id: 'wait', params: { secs } }); }
  async stop() { await this._emit({ id: 'stop', params: {} }); }
  async scan() { await this._emit({ id: 'scan', params: {} }); }
  async lidarSweep() { await this._emit({ id: 'lidar_sweep', params: {} }); }
  async grab() { await this._emit({ id: 'grab', params: {} }); }
  async release() { await this._emit({ id: 'release', params: {} }); }
  async lightsOn() { await this._emit({ id: 'lights_on', params: {} }); }
  async lightsOff() { await this._emit({ id: 'lights_off', params: {} }); }

  obstacleAhead() {
    const pos = this.posRef.current;
    return checkObstacleAhead(pos, pos.angle, this.design, this.arenaId).hit;
  }
}

/** Run JavaScript user code with async ByteBuddy */
export async function runJavaScriptProgram(code, ctx) {
  const bot = new ByteBuddy(ctx);
  const AsyncFunction = Object.getPrototypeOf(async function fn() {}).constructor;
  const runner = new AsyncFunction('ByteBuddy', 'bot', code);
  await runner(ByteBuddy, bot);
}
