import { makeRng } from './rng';
import { type Perturbation, simulateTrigger } from './sim';
import type { LevelDef } from './types';

export interface TriggerOutcome {
  pieceId: string;
  success: boolean;
  closest: number;
  endTime: number;
  /** Robustness: successes out of `trials` perturbed runs. */
  robust: number;
}

export interface SolveReport {
  levelId: string;
  ok: boolean;
  reasons: string[];
  outcomes: TriggerOutcome[];
  /** Successes with no trigger at all (must be 0). */
  idleSuccess: boolean;
  nearMisses: number;
  difficulty: number;
}

export interface SolveOptions {
  trials?: number;
  jitter?: number;
  seed?: number;
}

function perturbation(level: LevelDef, rng: () => number, jitter: number): Perturbation {
  const pos = new Map<string, { dx: number; dy: number }>();
  const density = new Map<string, number>();
  for (const p of level.pieces) {
    pos.set(p.id, { dx: (rng() * 2 - 1) * jitter, dy: (rng() * 2 - 1) * jitter });
    density.set(p.id, 1 + (rng() * 2 - 1) * jitter);
  }
  return { pos, density };
}

export function solve(level: LevelDef, opts: SolveOptions = {}): SolveReport {
  const trials = opts.trials ?? 20;
  const jitter = opts.jitter ?? 0.01;
  const rng = makeRng(opts.seed ?? 1234);
  const reasons: string[] = [];

  const idle = simulateTrigger(level, null);
  if (idle.success) reasons.push('ball reaches goal with no trigger');

  const candidates = level.pieces.filter((p) => p.action);
  const outcomes: TriggerOutcome[] = [];
  for (const p of candidates) {
    const base = simulateTrigger(level, p.id);
    let robust = 0;
    for (let i = 0; i < trials; i++) {
      const r = simulateTrigger(level, p.id, perturbation(level, rng, jitter));
      if (r.success) robust++;
    }
    outcomes.push({ pieceId: p.id, success: base.success, closest: base.closest, endTime: base.endTime, robust });
  }

  const winners = outcomes.filter((o) => o.success);
  if (winners.length !== 1) reasons.push(`expected exactly 1 solution, found ${winners.length}: ${winners.map((w) => w.pieceId).join(',') || '-'}`);
  const winner = winners[0];
  if (winner && winner.pieceId !== level.solution) reasons.push(`declared solution ${level.solution} but solver found ${winner.pieceId}`);
  if (winner && winner.robust !== trials) reasons.push(`solution ${winner.pieceId} fragile: ${winner.robust}/${trials}`);
  for (const o of outcomes) {
    if (!o.success && o.robust !== 0) reasons.push(`decoy ${o.pieceId} sometimes succeeds: ${o.robust}/${trials}`);
  }

  const ballR = level.ball.r;
  const nearMisses = outcomes.filter((o) => !o.success && o.closest < ballR * 3).length;

  let difficulty = 0;
  if (winner) {
    const sol = level.pieces.find((p) => p.id === winner.pieceId);
    if (sol) {
      const distances = candidates.map((p) => Math.hypot(p.x - level.ball.x, p.y - level.ball.y)).sort((a, b) => a - b);
      const solDist = Math.hypot(sol.x - level.ball.x, sol.y - level.ball.y);
      const rank = distances.indexOf(solDist) / Math.max(1, distances.length - 1);
      const chainLen = Math.min(1, winner.endTime / 8000);
      const decoyFactor = Math.min(1, nearMisses / 3);
      const candFactor = Math.min(1, (candidates.length - 1) / 7);
      difficulty = Math.round(100 * (0.35 * rank + 0.25 * chainLen + 0.2 * decoyFactor + 0.2 * candFactor));
    }
  }

  return {
    levelId: level.id,
    ok: reasons.length === 0,
    reasons,
    outcomes,
    idleSuccess: idle.success,
    nearMisses,
    difficulty,
  };
}
