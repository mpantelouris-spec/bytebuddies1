import { GROUND_RECIPES } from './ground.js';
import { AERIAL_RECIPES } from './aerial.js';
import { WALKER_RECIPES } from './walker.js';
import { UNDERWATER_RECIPES } from './underwater.js';
import { ARM_RECIPES } from './arm.js';
import { SAFETY_RECIPES } from './safety.js';
import { CREATIVE_RECIPES } from './creative.js';
import { CUSTOM_RECIPES } from './custom.js';
import { ROBOT_RECIPES_1 } from './robots1.js';
import { ROBOT_RECIPES_2 } from './robots2.js';
import { ROBOT_RECIPES_3 } from './robots3.js';
import { ROBOT_RECIPES_4 } from './robots4.js';
import { SPORT_RECIPES } from './sport.js';
import { BLOCKWORLD_RECIPES } from './blockworld.js';
import { SPIDER_RECIPES } from './spider.js';

export const MISSION_THEME_RECIPES = {
  ...GROUND_RECIPES,
  ...AERIAL_RECIPES,
  ...WALKER_RECIPES,
  ...UNDERWATER_RECIPES,
  ...ARM_RECIPES,
  ...SAFETY_RECIPES,
  ...CREATIVE_RECIPES,
  ...CUSTOM_RECIPES,
  ...ROBOT_RECIPES_1,
  ...ROBOT_RECIPES_2,
  ...ROBOT_RECIPES_3,
  ...ROBOT_RECIPES_4,
  ...SPORT_RECIPES,
  ...BLOCKWORLD_RECIPES,
  ...SPIDER_RECIPES,
};
