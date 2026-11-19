export type SnakeSpeciesId = 'EMERALD_BOA' | 'DIAMONDBACK' | 'BLACK_MAMBA' | 'CORAL_SNAKE';

export interface SnakeSpecies {
  id: SnakeSpeciesId;
  commonName: string;
  scientificName: string;
  description: string;
  baseColor: string;
  secondaryColor: string;
  bellyColor: string;
  patternType: 'DIAMOND' | 'LIGHTNING_STRIPES' | 'BANDS' | 'METALLIC_SOLID';
  eyeColor: string;
  pupilType: 'VERTICAL_SLIT' | 'ROUND';
  hasRattle: boolean;
  scaleTexture: 'IRIDESCENT' | 'MATTE_KEEL' | 'GLOSSY';
}

export type BiomeId = 'FOREST_MOSS' | 'DESERT_CANYON' | 'NIGHT_WETLAND';

export interface Biome {
  id: BiomeId;
  name: string;
  groundColor: string;
  accentColor: string;
  leafColors: string[];
}

export type ControlMode = 'POINTER' | 'STEERING' | 'AUTOPILOT_AI';

export interface SpineSegment {
  x: number;
  y: number;
  angle: number;
  radius: number;
  naturalWidth: number;
}

export interface DigestiveBulge {
  id: string;
  segmentIndex: number;
  maxBulge: number;
  progress: number;
  preyName: string;
}

export type PreyType = 'MOUSE' | 'FROG' | 'EGG';

export interface PreyEntity {
  id: string;
  type: PreyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  radius: number;
  hopTime?: number;
  isAirborne?: boolean;
  wigglePhase: number;
  points: number;
  calories: number;
}

export interface DirtParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface RivalSerpent {
  id: string;
  species: SnakeSpecies;
  spine: SpineSegment[];
  heading: number;
  speed: number;
  targetPreyId: string | null;
  bulges: DigestiveBulge[];
  tongueOut: number;
}

export interface AIHuntingTelemetry {
  targetPrey: PreyEntity | null;
  interceptPoint: { x: number; y: number } | null;
  strikeProbability: number; // 0 to 100%
  evasionDetected: boolean;
  tacticalState: 'SEARCHING' | 'STALKING' | 'STRIKING' | 'CORNERING';
}

export interface GeminiSerpentInsight {
  tacticalAssessment: string;
  metabolicAnalysis: string;
  predatorTip: string;
  biologicalFact: string;
}
