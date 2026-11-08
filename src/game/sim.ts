import Matter from 'matter-js';
import {
  type Action,
  type CollisionEvent,
  type LevelDef,
  type Material,
  MAX_SIM_MS,
  type PieceDef,
  type SimResult,
  STEP_MS,
  WORLD_H,
  WORLD_W,
} from './types';

const { Bodies, Body, Composite, Engine, Events, World } = Matter;

const MATERIAL_PHYSICS: Record<Material, { density: number; friction: number; restitution: number }> = {
  wood: { density: 0.0012, friction: 0.5, restitution: 0.1 },
  glass: { density: 0.0018, friction: 0.05, restitution: 0.3 },
  steel: { density: 0.004, friction: 0.3, restitution: 0.15 },
  rubber: { density: 0.001, friction: 0.9, restitution: 0.75 },
};

const PUSH_SPEED = 9;

export interface Sim {
  engine: Matter.Engine;
  ball: Matter.Body;
  pieces: Map<string, Matter.Body>;
  level: LevelDef;
  time: number;
  events: CollisionEvent[];
  closest: number;
  trace: number[];
  steps: number;
  /** Pieces the player has triggered, in order. */
  triggered: string[];
}

export interface Perturbation {
  /** Fractional position offset per piece id, applied to dynamic pieces. */
  pos: Map<string, { dx: number; dy: number }>;
  /** Density multiplier per piece id. */
  density: Map<string, number>;
}

function materialOf(body: Matter.Body): Material | 'ball' {
  return (body.plugin as { material?: Material | 'ball' }).material ?? 'steel';
}

export function createSim(level: LevelDef, perturb?: Perturbation): Sim {
  const engine = Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 },
    enableSleeping: false,
    positionIterations: 8,
    velocityIterations: 6,
  });

  const pieces = new Map<string, Matter.Body>();
  for (const def of level.pieces) {
    const body = makePiece(def, perturb);
    pieces.set(def.id, body);
  }

  const ball = Bodies.circle(level.ball.x, level.ball.y, level.ball.r, {
    density: 0.0015,
    friction: 0.05,
    frictionStatic: 0,
    frictionAir: 0.0005,
    restitution: 0.25,
    label: 'ball',
  });
  ball.plugin = { material: 'ball' };

  const wallOpts = { isStatic: true, label: 'wall', friction: 0.4 };
  const t = 60;
  const walls = [
    Bodies.rectangle(WORLD_W / 2, -t / 2, WORLD_W + 2 * t, t, wallOpts),
    Bodies.rectangle(-t / 2, WORLD_H / 2, t, WORLD_H + 2 * t, wallOpts),
    Bodies.rectangle(WORLD_W + t / 2, WORLD_H / 2, t, WORLD_H + 2 * t, wallOpts),
  ];
  for (const w of walls) w.plugin = { material: 'steel' };

  World.add(engine.world, [...walls, ...pieces.values(), ball]);

  const sim: Sim = {
    engine,
    ball,
    pieces,
    level,
    time: 0,
    events: [],
    closest: Number.POSITIVE_INFINITY,
    trace: [],
    steps: 0,
    triggered: [],
  };

  Events.on(engine, 'collisionStart', (ev) => {
    for (const pair of ev.pairs) {
      const a = pair.bodyA;
      const b = pair.bodyB;
      if (a.label === 'wall' || b.label === 'wall') continue;
      const rel = Math.hypot(a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y);
      if (rel < 0.6) continue;
      const c = pair.collision.supports[0] ?? { x: (a.position.x + b.position.x) / 2, y: (a.position.y + b.position.y) / 2 };
      sim.events.push({
        t: sim.time,
        materialA: materialOf(a),
        materialB: materialOf(b),
        speed: rel,
        x: c.x,
        y: c.y,
      });
    }
  });

  return sim;
}

function makePiece(def: PieceDef, perturb?: Perturbation): Matter.Body {
  const phys = MATERIAL_PHYSICS[def.material];
  const densityMul = perturb?.density.get(def.id) ?? 1;
  const off = def.isStatic ? undefined : perturb?.pos.get(def.id);
  const x = def.x + (off ? off.dx * def.w : 0);
  const y = def.y + (off ? off.dy * (def.h ?? def.w) : 0);
  const opts: Matter.IChamferableBodyDefinition = {
    isStatic: def.isStatic ?? false,
    angle: def.angle ?? 0,
    density: (def.density ?? phys.density) * densityMul,
    friction: def.friction ?? phys.friction,
    restitution: def.restitution ?? phys.restitution,
    frictionAir: 0.002,
    label: def.id,
  };
  const body =
    def.shape === 'disc'
      ? Bodies.circle(x, y, def.w / 2, opts)
      : Bodies.rectangle(x, y, def.w, def.h ?? def.w, opts);
  body.plugin = { material: def.material, def };
  return body;
}

export function pieceDef(body: Matter.Body): PieceDef | undefined {
  return (body.plugin as { def?: PieceDef }).def;
}

/** Applies the player's trigger. Returns false if the piece cannot be triggered. */
export function trigger(sim: Sim, pieceId: string): boolean {
  const body = sim.pieces.get(pieceId);
  if (!body) return false;
  const def = pieceDef(body);
  if (!def?.action) return false;
  const action: Action = def.action;
  if (action === 'pull') {
    Composite.remove(sim.engine.world, body);
    sim.pieces.delete(pieceId);
  } else {
    const d = def.pushDir ?? { x: 1, y: 0 };
    const len = Math.hypot(d.x, d.y) || 1;
    if (body.isStatic) Body.setStatic(body, false);
    Body.setVelocity(body, {
      x: body.velocity.x + (d.x / len) * PUSH_SPEED,
      y: body.velocity.y + (d.y / len) * PUSH_SPEED,
    });
  }
  sim.triggered.push(pieceId);
  return true;
}

export function ballInGoal(sim: Sim): boolean {
  const g = sim.level.goal;
  const p = sim.ball.position;
  return p.x > g.x - g.w / 2 && p.x < g.x + g.w / 2 && p.y > g.y - g.h / 2 && p.y < g.y + g.h / 2;
}

export function goalDistance(sim: Sim): number {
  const g = sim.level.goal;
  return Math.hypot(sim.ball.position.x - g.x, sim.ball.position.y - g.y);
}

/** Advances exactly one fixed step. Returns 'running' | 'success' | 'fail'. */
export function step(sim: Sim): 'running' | 'success' | 'fail' {
  Engine.update(sim.engine, STEP_MS);
  sim.time += STEP_MS;
  sim.steps += 1;
  const d = goalDistance(sim);
  if (d < sim.closest) sim.closest = d;
  if (sim.steps % 10 === 0) {
    sim.trace.push(Math.round(sim.ball.position.x * 100) / 100, Math.round(sim.ball.position.y * 100) / 100);
  }
  if (ballInGoal(sim)) return 'success';
  if (sim.ball.position.y > WORLD_H + 100) return 'fail';
  if (sim.time >= MAX_SIM_MS) return 'fail';
  return 'running';
}

/** Runs to completion from the current state. */
export function runToEnd(sim: Sim): SimResult {
  let state: ReturnType<typeof step> = 'running';
  while (state === 'running') state = step(sim);
  return {
    success: state === 'success',
    endTime: sim.time,
    closest: sim.closest,
    events: sim.events,
    trace: sim.trace,
  };
}

/** Convenience: fresh sim, apply trigger, run to end. */
export function simulateTrigger(level: LevelDef, pieceId: string | null, perturb?: Perturbation): SimResult {
  const sim = createSim(level, perturb);
  if (pieceId !== null) trigger(sim, pieceId);
  return runToEnd(sim);
}

export function traceHash(trace: number[]): string {
  let h = 2166136261;
  for (const v of trace) {
    const s = String(v);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return (h >>> 0).toString(16);
}
