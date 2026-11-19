export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode = 'CLASSIC' | 'PORTAL' | 'OBSTACLES';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface Position {
  x: number;
  y: number;
}

export interface FoodItem {
  x: number;
  y: number;
  type: 'NORMAL' | 'GOLDEN';
  expiresAt?: number;
  points: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface HighScoreRecord {
  score: number;
  date: string;
  mode: GameMode;
  difficulty: Difficulty;
  length: number;
}
