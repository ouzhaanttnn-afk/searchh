import type { LevelDef } from '../game/types';
import { WORLD1 } from './world1';

export const LEVELS: LevelDef[] = [...WORLD1];

export function levelById(id: string): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}
