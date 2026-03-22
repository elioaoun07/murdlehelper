export interface Suspect {
  id: string;
  name: string;
  height?: string;
  handedness?: "left" | "right" | "";
  eyeColor?: string;
  hairColor?: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
}

export interface Weapon {
  id: string;
  name: string;
  description?: string;
}

export type WizardStep = "entry" | "canvas";

export interface PuzzleState {
  puzzleName: string;
  wizardStep: WizardStep;
  suspects: Suspect[];
  locations: Location[];
  weapons: Weapon[];
  notes: string;
  timerStartedAt: number | null;
  timerElapsed: number;
  timerRunning: boolean;
  canvasSnapshot: string | null;
}

export interface PuzzleRecord {
  id: string;
  puzzleName: string;
  solveTimeSeconds: number;
  completedAt: string;
}

export const createEmptyPuzzleState = (): PuzzleState => ({
  puzzleName: "",
  wizardStep: "entry",
  suspects: [],
  locations: [],
  weapons: [],
  notes: "",
  timerStartedAt: null,
  timerElapsed: 0,
  timerRunning: false,
  canvasSnapshot: null,
});
