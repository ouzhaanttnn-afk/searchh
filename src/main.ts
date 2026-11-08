import { Audio } from './game/audio';
import { draw, fitCanvas, MATERIALS, pickPiece, type RenderState, spawnParticles, tickParticles } from './game/render';
import { makeRng } from './game/rng';
import { createSim, goalDistance, pieceDef, type Sim, step, trigger } from './game/sim';
import { STEP_MS, type LevelDef } from './game/types';
import { LEVELS } from './levels/index';
import { loadProgress, type Progress, saveProgress } from './progress';

type Phase = 'observe' | 'running' | 'done';

const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('no canvas context');
const ctx2 = ctx;

const $ = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el as T;
};

const ui = {
  levelLabel: $('levelLabel'),
  prompt: $('prompt'),
  result: $('resultOverlay'),
  stars: $('stars'),
  resultTitle: $('resultTitle'),
  resultText: $('resultText'),
  resultStat: $('resultStat'),
  btnRewind: $<HTMLButtonElement>('btnRewind'),
  btnShare: $<HTMLButtonElement>('btnShare'),
  btnNext: $<HTMLButtonElement>('btnNext'),
  btnLevels: $<HTMLButtonElement>('btnLevels'),
  btnMute: $<HTMLButtonElement>('btnMute'),
  btnCloseLevels: $<HTMLButtonElement>('btnCloseLevels'),
  levels: $('levelsOverlay'),
  levelGrid: $('levelGrid'),
  toast: $('toast'),
};

const audio = new Audio();
const progress: Progress = loadProgress();
let fit = fitCanvas(canvas);
let levelIdx = Math.min(progress.current, LEVELS.length - 1);
let sim: Sim = createSim(LEVELS[levelIdx] as LevelDef);
let phase: Phase = 'observe';
let attempts = 0;
let observeStart = performance.now();
let thinkMs = 0;
let accumulator = 0;
let lastFrame = performance.now();
let eventCursor = 0;
let slowMo = 1;
let outcome: 'success' | 'fail' | null = null;
const fxRng = makeRng(7);
const rs: RenderState = { hovered: null, particles: [], goalFlash: 0, clock: 0 };

function currentLevel(): LevelDef {
  return LEVELS[levelIdx] as LevelDef;
}

function loadLevel(idx: number, keepAttempts = false): void {
  levelIdx = idx;
  const lvl = currentLevel();
  sim = createSim(lvl);
  phase = 'observe';
  if (!keepAttempts) attempts = 0;
  observeStart = performance.now();
  accumulator = 0;
  eventCursor = 0;
  slowMo = 1;
  outcome = null;
  rs.particles = [];
  rs.goalFlash = 0;
  rs.hovered = null;
  audio.startLevel(lvl.index);
  ui.levelLabel.textContent = `${lvl.index} · ${lvl.name}`;
  ui.prompt.style.opacity = '1';
  ui.prompt.innerHTML = 'Only <b>one</b> tap. Which piece?';
  ui.result.classList.remove('show');
  progress.current = idx;
  saveProgress(progress);
}

function toWorld(clientX: number, clientY: number): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return { x: ((clientX - rect.left) / rect.width) * 540, y: ((clientY - rect.top) / rect.height) * 960 };
}

function onTap(clientX: number, clientY: number): void {
  audio.unlock();
  if (phase !== 'observe') return;
  const p = toWorld(clientX, clientY);
  const id = pickPiece(sim, p.x, p.y);
  if (!id) return;
  const body = sim.pieces.get(id);
  const def = body ? pieceDef(body) : undefined;
  if (!def) return;
  thinkMs = performance.now() - observeStart;
  attempts += 1;
  audio.tap();
  if (body) spawnParticles(rs, body.position.x, body.position.y, MATERIALS[def.material].particle, 6, fxRng);
  trigger(sim, id);
  phase = 'running';
  ui.prompt.style.opacity = '0';
}

function finish(result: 'success' | 'fail'): void {
  phase = 'done';
  outcome = result;
  const lvl = currentLevel();
  if (result === 'success') {
    audio.success();
    rs.goalFlash = 1;
    spawnParticles(rs, lvl.goal.x, lvl.goal.y, '#FFB347', 14, fxRng);
    const firstTry = attempts === 1;
    const prev = progress.levels[lvl.id];
    progress.levels[lvl.id] = { solved: true, firstTry: (prev?.firstTry ?? false) || firstTry, bestThinkMs: Math.min(prev?.bestThinkMs ?? Number.POSITIVE_INFINITY, thinkMs) };
    if (levelIdx + 1 < LEVELS.length) progress.unlocked = Math.max(progress.unlocked, levelIdx + 1);
    saveProgress(progress);
    ui.stars.textContent = firstTry ? '★★' : '★';
    ui.resultTitle.textContent = firstTry ? 'First try!' : 'Solved';
    ui.resultText.textContent = firstTry ? `You saw it in ${(thinkMs / 1000).toFixed(1)} s.` : `Took ${attempts} tries.`;
    ui.resultStat.textContent = '';
    ui.btnNext.classList.toggle('hidden', levelIdx + 1 >= LEVELS.length);
    ui.btnShare.classList.remove('hidden');
  } else {
    audio.fail();
    ui.stars.textContent = '';
    ui.resultTitle.textContent = 'Almost…';
    ui.resultText.textContent = attempts >= 2 && lvl.hint ? lvl.hint : 'Not that one. Rewind and look again.';
    ui.resultStat.textContent = '';
    ui.btnNext.classList.add('hidden');
    ui.btnShare.classList.add('hidden');
  }
  window.setTimeout(() => ui.result.classList.add('show'), result === 'success' ? 700 : 500);
}

function frame(now: number): void {
  const dtReal = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  rs.clock += dtReal;
  tickParticles(rs, dtReal);
  rs.goalFlash = Math.max(0, rs.goalFlash - dtReal * 1.2);

  if (phase === 'running') {
    // Slow motion when the ball approaches the goal: cinematic finish.
    const d = goalDistance(sim);
    const target = d < 120 && sim.ball.velocity.y > 0 ? 0.3 : 1;
    slowMo += (target - slowMo) * Math.min(1, dtReal * 8);
    accumulator += dtReal * 1000 * slowMo;
    while (accumulator >= STEP_MS && phase === 'running') {
      accumulator -= STEP_MS;
      const s = step(sim);
      if (s !== 'running') {
        finish(s);
        break;
      }
    }
    // Audio + particles for new collision events.
    for (; eventCursor < sim.events.length; eventCursor++) {
      const ev = sim.events[eventCursor];
      if (!ev) continue;
      const mat = ev.materialA === 'ball' ? ev.materialB : ev.materialA;
      audio.hit(mat, ev.speed);
      const color = mat === 'ball' ? '#FFB347' : MATERIALS[mat].particle;
      spawnParticles(rs, ev.x, ev.y, color, Math.min(5, 2 + Math.floor(ev.speed / 3)), fxRng);
    }
  }

  draw(ctx2, sim, rs);
  requestAnimationFrame(frame);
}

function shareText(): string {
  const lvl = currentLevel();
  const firstTry = attempts === 1;
  return `TRIGGER POINT · Level ${lvl.index} "${lvl.name}"\n${firstTry ? '🟩 First try' : `🟨 ${attempts} tries`} · ⏱ ${(thinkMs / 1000).toFixed(1)}s thinking\nOnly one tap. Which piece?`;
}

function showToast(text: string): void {
  ui.toast.textContent = text;
  ui.toast.classList.add('show');
  window.setTimeout(() => ui.toast.classList.remove('show'), 1600);
}

function renderLevelGrid(): void {
  ui.levelGrid.innerHTML = '';
  LEVELS.forEach((lvl, i) => {
    const el = document.createElement('div');
    const rec = progress.levels[lvl.id];
    const locked = i > progress.unlocked;
    el.className = `lvl${rec?.solved ? ' done' : ''}${rec?.firstTry ? ' star' : ''}${locked ? ' locked' : ''}`;
    el.textContent = String(lvl.index);
    if (!locked) {
      el.addEventListener('click', () => {
        ui.levels.classList.remove('show');
        loadLevel(i);
      });
    }
    ui.levelGrid.appendChild(el);
  });
}

// --- Input ---
canvas.addEventListener('pointerdown', (e) => onTap(e.clientX, e.clientY));
canvas.addEventListener('pointermove', (e) => {
  if (phase !== 'observe') {
    rs.hovered = null;
    return;
  }
  const p = toWorld(e.clientX, e.clientY);
  rs.hovered = pickPiece(sim, p.x, p.y);
});
canvas.addEventListener('pointerleave', () => {
  rs.hovered = null;
});

ui.btnRewind.addEventListener('click', () => loadLevel(levelIdx, true));
ui.btnNext.addEventListener('click', () => {
  if (levelIdx + 1 < LEVELS.length) loadLevel(levelIdx + 1);
});
ui.btnShare.addEventListener('click', async () => {
  const text = shareText();
  try {
    if (navigator.share) {
      await navigator.share({ text });
      return;
    }
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  } catch {
    showToast('Could not share');
  }
});
ui.btnLevels.addEventListener('click', () => {
  renderLevelGrid();
  ui.levels.classList.add('show');
});
ui.btnCloseLevels.addEventListener('click', () => ui.levels.classList.remove('show'));
function refreshMute(): void {
  ui.btnMute.textContent = audio.muted ? '🔇' : '♪';
  ui.btnMute.style.opacity = audio.muted ? '0.6' : '1';
}
ui.btnMute.addEventListener('click', () => {
  audio.unlock();
  audio.setMuted(!audio.muted);
  refreshMute();
});
refreshMute();

window.addEventListener('resize', () => {
  fit = fitCanvas(canvas);
});
void fit;
void outcome;

loadLevel(levelIdx);
requestAnimationFrame(frame);
