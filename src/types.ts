export type RuleType = "color" | "shape";

export type Language = "en" | "zu" | "xh" | "af" | "st";

export interface Game {
  id: string;
  title: string;
  description: string;
  intensity: "low" | "medium" | "high";
  category: "sorting" | "memory" | "reaction" | "cognitive" | "social" | "language" | "motor";
  icon: string;
  focus: string;
  isExercise?: boolean;
  howToPlay: string[];
}

export interface GameObject {
  id: string;
  x: number;
  y: number;
  color: string;
  shape: "circle" | "square" | "triangle";
  size: number;
  vx: number;
  vy: number;
}

export interface GameState {
  score: number;
  errors: number;
  currentRule: RuleType;
  lastRuleChange: number;
  inhibitionLatency: number[];
  fidgetMetric: number;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}
