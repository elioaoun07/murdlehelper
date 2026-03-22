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

export type WizardStep = "entry" | "board";

export interface BoardCard {
  id: string;
  entityType: "suspect" | "location" | "weapon";
  entityId: string;
  x: number;
  y: number;
}

export interface BoardLine {
  id: string;
  fromCardId: string;
  toCardId: string;
}

export interface PuzzleState {
  puzzleName: string;
  wizardStep: WizardStep;
  suspects: Suspect[];
  locations: Location[];
  weapons: Weapon[];
  notes: string;
  boardCards: BoardCard[];
  boardLines: BoardLine[];
  timerStartedAt: number | null;
  timerElapsed: number;
  timerRunning: boolean;
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
  boardCards: [],
  boardLines: [],
  timerStartedAt: null,
  timerElapsed: 0,
  timerRunning: false,
});
