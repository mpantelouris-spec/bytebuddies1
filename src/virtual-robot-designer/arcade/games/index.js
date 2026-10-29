import { snake } from './snake.js';
import { pac } from './pac.js';
import { brick } from './brick.js';
import { hop } from './hop.js';
import { raiders } from './raiders.js';
import { jump } from './jump.js';

/** Arcade robots: chassis id → game. These robots open their own game instead of the 3D Live Lab. */
export const ARCADE_GAMES = {
  snakebot: snake,
  pacbot: pac,
  brickbot: brick,
  hopbot: hop,
  raiderbot: raiders,
  jumpbot: jump,
};

/** Robots from an earlier version of the arcade — saved robots move to the nearest new game. */
export const RENAMED_ARCADE = { sumobot: 'brickbot', linebot: 'hopbot', paintbot: 'pacbot' };

export const isArcadeChassis = (id) => Boolean(ARCADE_GAMES[id]);
