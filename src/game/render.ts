import type Matter from 'matter-js';
import { pieceDef, type Sim } from './sim';
import { type Material, WORLD_H, WORLD_W } from './types';

export interface MaterialStyle {
  fill: string;
  edge: string;
  shadow: string;
  particle: string;
}

/** Style tokens per material — the only place colours for pieces live. */
export const MATERIALS: Record<Material, MaterialStyle> = {
  wood: { fill: '#C9A77A', edge: '#8B6B45', shadow: 'rgba(0,0,0,0.35)', particle: '#E3C79B' },
  glass: { fill: 'rgba(170,214,235,0.45)', edge: '#BFE4F5', shadow: 'rgba(120,180,220,0.25)', particle: '#DFF4FF' },
  steel: { fill: '#4A5160', edge: '#7E8797', shadow: 'rgba(0,0,0,0.45)', particle: '#AEB6C4' },
  rubber: { fill: '#D96C7B', edge: '#F2A3AE', shadow: 'rgba(0,0,0,0.35)', particle: '#FFC2CB' },
};

export const BG = '#14161B';
export const ACCENT = '#FFB347';
export const BALL = '#FFB347';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface RenderState {
  hovered: string | null;
  particles: Particle[];
  /** 0..1 flash on goal. */
  goalFlash: number;
  /** Wall-clock seconds, for idle pulses. */
  clock: number;
}

export function fitCanvas(canvas: HTMLCanvasElement): { scale: number; ox: number; oy: number } {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / WORLD_W, vh / WORLD_H);
  const cw = Math.floor(WORLD_W * scale);
  const ch = Math.floor(WORLD_H * scale);
  canvas.style.width = `${cw}px`;
  canvas.style.height = `${ch}px`;
  canvas.width = Math.floor(cw * dpr);
  canvas.height = Math.floor(ch * dpr);
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  return { scale, ox: (vw - cw) / 2, oy: (vh - ch) / 2 };
}

export function draw(ctx: CanvasRenderingContext2D, sim: Sim, rs: RenderState): void {
  ctx.save();
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  // Subtle grid of dots: "workbench".
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  for (let y = 20; y < WORLD_H; y += 40) {
    for (let x = 20; x < WORLD_W; x += 40) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  drawGoal(ctx, sim, rs);

  for (const body of sim.pieces.values()) drawPiece(ctx, body, rs);

  drawBall(ctx, sim.ball);

  for (const p of rs.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawGoal(ctx: CanvasRenderingContext2D, sim: Sim, rs: RenderState): void {
  const g = sim.level.goal;
  const pulse = 0.5 + 0.5 * Math.sin(rs.clock * 2.2);
  ctx.save();
  ctx.translate(g.x, g.y);
  const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, g.w);
  grad.addColorStop(0, `rgba(255,179,71,${0.22 + 0.1 * pulse + 0.5 * rs.goalFlash})`);
  grad.addColorStop(1, 'rgba(255,179,71,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(-g.w, -g.w, g.w * 2, g.w * 2);
  ctx.strokeStyle = ACCENT;
  ctx.globalAlpha = 0.55 + 0.35 * pulse;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.lineDashOffset = -rs.clock * 20;
  ctx.beginPath();
  ctx.arc(0, 0, Math.min(g.w, g.h) / 2 - 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBall(ctx: CanvasRenderingContext2D, ball: Matter.Body): void {
  const r = ball.circleRadius ?? 14;
  ctx.save();
  ctx.translate(ball.position.x, ball.position.y);
  ctx.shadowColor = 'rgba(255,179,71,0.6)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = BALL;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.rotate(ball.angle);
  ctx.fillStyle = 'rgba(20,22,27,0.55)';
  ctx.beginPath();
  ctx.arc(r * 0.45, 0, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(-r * 0.35, -r * 0.35, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPiece(ctx: CanvasRenderingContext2D, body: Matter.Body, rs: RenderState): void {
  const def = pieceDef(body);
  if (!def) return;
  const st = MATERIALS[def.material];
  const hovered = rs.hovered === def.id;
  const pulse = def.action ? 0.5 + 0.5 * Math.sin(rs.clock * 3 + body.position.x * 0.01) : 0;

  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);

  const w = def.w;
  const h = def.shape === 'disc' ? def.w : (def.h ?? def.w);

  if (!def.isStatic) {
    ctx.shadowColor = st.shadow;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
  }
  ctx.fillStyle = st.fill;
  ctx.strokeStyle = st.edge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (def.shape === 'disc') {
    ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
  } else {
    roundRect(ctx, -w / 2, -h / 2, w, h, Math.min(5, w / 2, h / 2));
  }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.stroke();

  if (def.material === 'wood' && def.shape === 'box') {
    ctx.strokeStyle = 'rgba(80,55,30,0.35)';
    ctx.lineWidth = 1;
    const lines = Math.max(1, Math.floor(Math.max(w, h) / 18));
    for (let i = 1; i <= lines; i++) {
      const t = (i / (lines + 1)) * 2 - 1;
      ctx.beginPath();
      if (w >= h) {
        ctx.moveTo(-w / 2 + 4, (t * h) / 2);
        ctx.lineTo(w / 2 - 4, (t * h) / 2 + 1);
      } else {
        ctx.moveTo((t * w) / 2, -h / 2 + 4);
        ctx.lineTo((t * w) / 2 + 1, h / 2 - 4);
      }
      ctx.stroke();
    }
  }

  if (def.action) {
    // Trigger affordance: a soft ring; bright when hovered.
    const rad = Math.hypot(w, h) / 2 + 8;
    ctx.rotate(-body.angle);
    ctx.strokeStyle = hovered ? ACCENT : `rgba(255,255,255,${0.12 + 0.12 * pulse})`;
    ctx.lineWidth = hovered ? 3 : 1.5;
    ctx.setLineDash(hovered ? [] : [3, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    if (hovered) drawActionIcon(ctx, def.action, def.pushDir, rad);
  }
  ctx.restore();
}

function drawActionIcon(ctx: CanvasRenderingContext2D, action: 'pull' | 'push', dir: { x: number; y: number } | undefined, rad: number): void {
  ctx.save();
  ctx.translate(0, -rad - 18);
  ctx.fillStyle = BG;
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  if (action === 'pull') {
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(6, 6);
    ctx.moveTo(6, -6);
    ctx.lineTo(-6, 6);
    ctx.stroke();
  } else {
    const d = dir ?? { x: 1, y: 0 };
    const a = Math.atan2(d.y, d.x);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(7, 0);
    ctx.moveTo(2, -5);
    ctx.lineTo(7, 0);
    ctx.lineTo(2, 5);
    ctx.stroke();
  }
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Finds the tappable piece under a world point, with a generous radius. */
export function pickPiece(sim: Sim, x: number, y: number): string | null {
  let best: string | null = null;
  let bestD = Number.POSITIVE_INFINITY;
  for (const body of sim.pieces.values()) {
    const def = pieceDef(body);
    if (!def?.action) continue;
    const w = def.w;
    const h = def.shape === 'disc' ? def.w : (def.h ?? def.w);
    const reach = Math.hypot(w, h) / 2 + 22;
    const d = Math.hypot(body.position.x - x, body.position.y - y);
    if (d < reach && d < bestD) {
      bestD = d;
      best = def.id;
    }
  }
  return best;
}

export function spawnParticles(rs: RenderState, x: number, y: number, color: string, n: number, rng: () => number): void {
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2;
    const s = 1 + rng() * 2.5;
    rs.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 1, color });
  }
}

export function tickParticles(rs: RenderState, dt: number): void {
  for (const p of rs.particles) {
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    p.vy += 0.08 * dt * 60;
    p.life -= dt * 1.6;
  }
  rs.particles = rs.particles.filter((p) => p.life > 0);
}
