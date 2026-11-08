export interface LevelRecord {
  solved: boolean;
  firstTry: boolean;
  bestThinkMs: number;
}

export interface Progress {
  current: number;
  unlocked: number;
  levels: Record<string, LevelRecord>;
}

const KEY = 'tp.progress.v1';

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Progress>;
      return { current: p.current ?? 0, unlocked: p.unlocked ?? 0, levels: p.levels ?? {} };
    }
  } catch {
    /* storage unavailable */
  }
  return { current: 0, unlocked: 0, levels: {} };
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}
