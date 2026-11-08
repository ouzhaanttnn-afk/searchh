import { ballOn, box, cup, funnel, level, onShelf, shelf } from './build';
import type { LevelDef } from '../game/types';

/**
 * World 1 — Wood. Only PULL. Teaches: the ball needs a release,
 * and the obvious piece is not always the right one.
 */

// Level 1
const l1_shelfA = shelf('shelfA', 150, 290, 220, 14, 0.28);
// Level 2
const l2_shelfA = shelf('shelfA', 170, 210, 260, 14, 0.26);
const l2_shelfB = shelf('shelfB', 300, 440, 300, 14, 0.24);

export const WORLD1: LevelDef[] = [
  level({
    world: 1,
    index: 1,
    name: 'First Spark',
    ball: ballOn(l1_shelfA, 90),
    goal: { x: 430, y: 865, w: 70, h: 50 },
    pieces: [
      l1_shelfA,
      onShelf('stopA', l1_shelfA, 235, 18, 44, { action: 'pull', isStatic: true }),
      shelf('rampB', 330, 520, 260, 14, 0.3),
      ...funnel('goal', 430, 830),
      ...cup('goal', 430, 870),
      box('decoy1', 120, 700, 24, 60, { action: 'pull', isStatic: true }),
      shelf('floor1', 120, 740, 120, 14),
    ],
    solution: 'stopA',
    hint: 'What is holding the ball?',
  }),
  level({
    world: 1,
    index: 2,
    name: 'Two Doors',
    ball: ballOn(l2_shelfA, 70),
    goal: { x: 430, y: 885, w: 70, h: 50 },
    pieces: [
      l2_shelfA,
      onShelf('doorA', l2_shelfA, 270, 18, 44, { action: 'pull', isStatic: true }),
      l2_shelfB,
      onShelf('doorB', l2_shelfB, 190, 18, 44, { action: 'pull', isStatic: true }),
      shelf('rampC', 300, 660, 300, 14, 0.3),
      ...funnel('goal', 430, 850),
      ...cup('goal', 430, 890),
      box('decoyFloor', 80, 880, 30, 70, { action: 'pull', isStatic: true }),
      shelf('floor1', 80, 925, 100, 14),
    ],
    solution: 'doorA',
    hint: 'The ball must travel the whole way. Which door opens the path?',
  }),
];
