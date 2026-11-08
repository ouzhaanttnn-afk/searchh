import type { Action, LevelDef, Material, PieceDef, Vec2 } from '../game/types';

interface BoxOpts {
  angle?: number;
  material?: Material;
  isStatic?: boolean;
  action?: Action;
  pushDir?: Vec2;
  density?: number;
  friction?: number;
  restitution?: number;
}

/** Static steel shelf or ramp. */
export function shelf(id: string, x: number, y: number, w: number, h = 14, angle = 0, material: Material = 'steel'): PieceDef {
  return { id, shape: 'box', x, y, w, h, angle, material, isStatic: true };
}

export function box(id: string, x: number, y: number, w: number, h: number, opts: BoxOpts = {}): PieceDef {
  return {
    id,
    shape: 'box',
    x,
    y,
    w,
    h,
    angle: opts.angle ?? 0,
    material: opts.material ?? 'wood',
    isStatic: opts.isStatic ?? false,
    action: opts.action,
    pushDir: opts.pushDir,
    density: opts.density,
    friction: opts.friction,
    restitution: opts.restitution,
  };
}

export function disc(id: string, x: number, y: number, d: number, opts: BoxOpts = {}): PieceDef {
  return {
    id,
    shape: 'disc',
    x,
    y,
    w: d,
    material: opts.material ?? 'wood',
    isStatic: opts.isStatic ?? false,
    action: opts.action,
    pushDir: opts.pushDir,
    density: opts.density,
    friction: opts.friction,
    restitution: opts.restitution,
  };
}

/** A tall thin wooden domino standing on a surface at (x, surfaceY). */
export function domino(id: string, x: number, surfaceY: number, h = 70, w = 14, opts: BoxOpts = {}): PieceDef {
  return box(id, x, surfaceY - h / 2, w, h, { material: 'wood', ...opts });
}

/** A static U-shaped cup around the goal; returns the pieces. */
export function cup(idPrefix: string, x: number, y: number, w = 90, depth = 60, material: Material = 'steel'): PieceDef[] {
  return [
    shelf(`${idPrefix}_b`, x, y + depth / 2, w, 12, 0, material),
    shelf(`${idPrefix}_l`, x - w / 2 + 6, y, 12, depth, 0, material),
    shelf(`${idPrefix}_r`, x + w / 2 - 6, y, 12, depth, 0, material),
  ];
}

/** Two angled static guides above a cup so a ball arriving anywhere in `span` is funnelled in. */
export function funnel(idPrefix: string, x: number, y: number, span = 220, drop = 70, material: Material = 'steel'): PieceDef[] {
  const half = span / 2;
  const len = Math.hypot(half - 40, drop);
  const ang = Math.atan2(drop, half - 40);
  return [
    shelf(`${idPrefix}_fl`, x - 40 - (half - 40) / 2, y - drop / 2, len, 12, ang, material),
    shelf(`${idPrefix}_fr`, x + 40 + (half - 40) / 2, y - drop / 2, len, 12, -ang, material),
  ];
}

/** Surface y of a static shelf at world x (top face). */
export function surfaceY(sh: PieceDef, x: number): number {
  const a = sh.angle ?? 0;
  const h = sh.h ?? 14;
  return sh.y + (x - sh.x) * Math.tan(a) - h / 2 / Math.cos(a);
}

/** A box standing on a shelf at x. */
export function onShelf(id: string, sh: PieceDef, x: number, w: number, h: number, opts: BoxOpts = {}): PieceDef {
  const a = sh.angle ?? 0;
  const y = surfaceY(sh, x) - (h / 2) / Math.cos(a) - (w / 2) * Math.abs(Math.tan(a));
  return box(id, x, y, w, h, { angle: a, ...opts });
}

/** Ball placement resting on a shelf at x. */
export function ballOn(sh: PieceDef, x: number, r = 14): { x: number; y: number; r: number } {
  return { x, y: surfaceY(sh, x) - r / Math.cos(sh.angle ?? 0) - 0.5, r };
}

export function level(def: Omit<LevelDef, 'id'> & { id?: string }): LevelDef {
  return { ...def, id: def.id ?? `w${def.world}-${def.index}` };
}
