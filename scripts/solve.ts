import { LEVELS } from '../src/levels/index';
import { solve } from '../src/game/solver';
import { createSim, step, trigger } from '../src/game/sim';

const only = process.argv[2];
const traceId = process.argv[3];
if (only && traceId) {
  const lvl = LEVELS.find((l) => l.id === only);
  if (!lvl) throw new Error('no level ' + only);
  const sim = createSim(lvl);
  if (traceId !== 'none') trigger(sim, traceId);
  for (let i = 0; i < 1800; i++) {
    const s = step(sim);
    if (i % 60 === 0 || s !== 'running') console.log(`${(sim.time / 1000).toFixed(1)}s  x=${sim.ball.position.x.toFixed(0)} y=${sim.ball.position.y.toFixed(0)}  v=(${sim.ball.velocity.x.toFixed(1)},${sim.ball.velocity.y.toFixed(1)}) ${s}`);
    if (s !== 'running') break;
  }
  process.exit(0);
}
let failed = 0;
for (const level of LEVELS) {
  if (only && level.id !== only) continue;
  const t0 = Date.now();
  const r = solve(level);
  const ms = Date.now() - t0;
  const status = r.ok ? 'OK ' : 'BAD';
  console.log(`${status} ${level.id.padEnd(6)} ${level.name.padEnd(22)} diff=${String(r.difficulty).padStart(3)} near=${r.nearMisses} ${ms}ms`);
  for (const o of r.outcomes) {
    console.log(`     ${o.success ? '*' : ' '} ${o.pieceId.padEnd(10)} closest=${o.closest.toFixed(0).padStart(4)} t=${(o.endTime / 1000).toFixed(1)}s robust=${o.robust}`);
  }
  for (const reason of r.reasons) console.log(`     ! ${reason}`);
  if (!r.ok) failed++;
}
if (failed) {
  console.log(`\n${failed} level(s) failed`);
  process.exit(1);
}
