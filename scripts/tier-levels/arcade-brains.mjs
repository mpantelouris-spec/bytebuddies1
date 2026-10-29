/**
 * Reference programs for the arcade games: the "robot brains" the original
 * levels teach in their hints, written with the game's own blocks. A level is
 * only kept if the brain for its tier can win it.
 */
import { prog } from './arcade-sim.mjs';

export const BRAINS = {
  snakebot: prog([
    ['forever'],
    ['if', 1, { cond: 'food_left' }],
    ['if', 2, { cond: 'wall_left' }], ['else', 2], ['turn_left', 3],
    ['else', 1],
    ['if', 2, { cond: 'food_right' }],
    ['if', 3, { cond: 'wall_right' }], ['else', 3], ['turn_right', 4],
    ['if', 1, { cond: 'wall_ahead' }],
    ['if', 2, { cond: 'wall_left' }], ['turn_right', 3], ['else', 2], ['turn_left', 3],
    ['else', 1], ['move', 2],
  ]),
  pacbot: prog([
    ['forever'],
    ['if', 1, { cond: 'dot_ahead' }],
    ['if', 2, { cond: 'bug_ahead' }], ['turn_around', 3], ['else', 2], ['move', 3],
    ['else', 1],
    ['if', 2, { cond: 'dot_left' }], ['turn_left', 3], ['move', 3],
    ['else', 2],
    ['if', 3, { cond: 'dot_right' }], ['turn_right', 4], ['move', 4],
    ['else', 3],
    ['if', 4, { cond: 'wall_ahead' }],
    ['if', 5, { cond: 'wall_left' }], ['turn_right', 6], ['else', 5], ['turn_left', 6],
    ['else', 4], ['move', 5],
  ]),
  brickbot: prog([
    ['serve'],
    ['forever'],
    ['if', 1, { cond: 'ball_left' }], ['move_left', 2, { steps: 1 }],
    ['if', 1, { cond: 'ball_right' }], ['move_right', 2, { steps: 1 }],
  ]),
  hopbot: prog([
    ['forever'],
    ['if', 1, { cond: 'at_finish' }], ['wait', 2, { seconds: 0.2 }],
    ['else', 1],
    ['if', 2, { cond: 'danger_here' }],
    ['if', 3, { cond: 'safe_ahead' }], ['hop_forward', 4], ['else', 3],
    ['if', 4, { cond: 'near_left_edge' }], ['hop_right', 5], ['else', 4],
    ['if', 5, { cond: 'near_right_edge' }], ['hop_left', 6], ['else', 5], ['hop_back', 6],
    ['else', 2],
    ['if', 3, { cond: 'safe_ahead' }], ['hop_forward', 4],
    ['else', 3],
    ['if', 4, { cond: 'tree_ahead' }], ['hop_right', 5], ['else', 4], ['wait', 5, { seconds: 0.2 }],
  ]),
  raiderbot: prog([
    ['forever'],
    ['if', 1, { cond: 'slime_above' }],
    ['if', 2, { cond: 'slime_left' }], ['move_right', 3, { steps: 1 }], ['else', 2], ['move_left', 3, { steps: 1 }],
    ['else', 1],
    ['if', 2, { cond: 'raider_above' }],
    ['if', 3, { cond: 'zap_ready' }], ['zap', 4], ['else', 3], ['wait', 4, { seconds: 0.1 }],
    ['else', 2],
    ['if', 3, { cond: 'mothership_above' }], ['zap', 4],
    ['else', 3],
    ['if', 4, { cond: 'raider_left' }], ['move_left', 5, { steps: 1 }],
    ['else', 4],
    ['if', 5, { cond: 'raider_right' }], ['move_right', 6, { steps: 1 }], ['else', 5], ['wait', 6, { seconds: 0.1 }],
  ]),
  jumpbot: prog([
    ['forever'],
    ['if', 1, { cond: 'at_goal' }], ['wait', 2, { seconds: 0.2 }],
    ['else', 1],
    ['if', 2, { cond: 'gap_ahead' }], ['jump', 3, { steps: 3 }],
    ['else', 2],
    ['if', 3, { cond: 'enemy_ahead' }], ['jump', 4, { steps: 2 }],
    ['else', 3],
    ['if', 4, { cond: 'high_step_ahead' }], ['jump', 5, { steps: 2 }],
    ['else', 4], ['walk_forward', 5, { steps: 1 }],
  ]),
};
