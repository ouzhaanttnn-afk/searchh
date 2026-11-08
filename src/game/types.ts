export type Material = 'wood' | 'glass' | 'steel' | 'rubber';

export type Action = 'pull' | 'push';

export interface Vec2 {
  x: number;
  y: number;
}

export interface PieceDef {
  id: string;
  /** 'box' is a rectangle, 'disc' a circle. */
  shape: 'box' | 'disc';
  x: number;
  y: number;
  /** Width for box, diameter for disc. */
  w: number;
  /** Height for box; ignored for disc. */
  h?: number;
  /** Radians. */
  angle?: number;
  material: Material;
  isStatic?: boolean;
  /** Which trigger this piece accepts. Undefined means the piece cannot be tapped. */
  action?: Action;
  /** Unit direction applied on push; required when action is 'push'. */
  pushDir?: Vec2;
  density?: number;
  friction?: number;
  restitution?: number;
}

export interface LevelDef {
  id: string;
  world: number;
  index: number;
  name: string;
  ball: { x: number; y: number; r: number };
  goal: { x: number; y: number; w: number; h: number };
  pieces: PieceDef[];
  /** Id of the one correct trigger; verified by the solver. */
  solution: string;
  /** Hint shown only after a failed attempt (never in daily mode). */
  hint?: string;
}

export const WORLD_W = 540;
export const WORLD_H = 960;
export const STEP_MS = 1000 / 120;
export const MAX_SIM_MS = 15000;

export interface CollisionEvent {
  t: number;
  materialA: Material | 'ball';
  materialB: Material | 'ball';
  speed: number;
  x: number;
  y: number;
}

export interface SimResult {
  success: boolean;
  /** Simulated time at success or at termination. */
  endTime: number;
  /** Closest distance the ball came to the goal centre. */
  closest: number;
  events: CollisionEvent[];
  /** Ball position sampled every 10 steps, for hashing and replay checks. */
  trace: number[];
}
