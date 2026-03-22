"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from "react";
import type {
  PuzzleState,
  Suspect,
  Location,
  Weapon,
  WizardStep,
} from "@/types";
import { createEmptyPuzzleState } from "@/types";
import { savePuzzleState, loadPuzzleState, clearPuzzleState } from "@/lib/db";

// --- Actions ---

type Action =
  | { type: "LOAD_STATE"; payload: PuzzleState }
  | { type: "SET_PUZZLE_NAME"; payload: string }
  | { type: "SET_WIZARD_STEP"; payload: WizardStep }
  | { type: "ADD_SUSPECT"; payload: Suspect }
  | { type: "UPDATE_SUSPECT"; payload: Suspect }
  | { type: "REMOVE_SUSPECT"; payload: string }
  | { type: "ADD_LOCATION"; payload: Location }
  | { type: "UPDATE_LOCATION"; payload: Location }
  | { type: "REMOVE_LOCATION"; payload: string }
  | { type: "ADD_WEAPON"; payload: Weapon }
  | { type: "UPDATE_WEAPON"; payload: Weapon }
  | { type: "REMOVE_WEAPON"; payload: string }
  | { type: "SET_NOTES"; payload: string }
  | { type: "START_TIMER" }
  | { type: "PAUSE_TIMER"; payload: number }
  | { type: "RESET_TIMER" }
  | { type: "SET_CANVAS_SNAPSHOT"; payload: string | null }
  | { type: "RESET_ALL" };

function reducer(state: PuzzleState, action: Action): PuzzleState {
  switch (action.type) {
    case "LOAD_STATE":
      return action.payload;
    case "SET_PUZZLE_NAME":
      return { ...state, puzzleName: action.payload };
    case "SET_WIZARD_STEP":
      return { ...state, wizardStep: action.payload };
    case "ADD_SUSPECT":
      return { ...state, suspects: [...state.suspects, action.payload] };
    case "UPDATE_SUSPECT":
      return {
        ...state,
        suspects: state.suspects.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case "REMOVE_SUSPECT":
      return {
        ...state,
        suspects: state.suspects.filter((s) => s.id !== action.payload),
      };
    case "ADD_LOCATION":
      return { ...state, locations: [...state.locations, action.payload] };
    case "UPDATE_LOCATION":
      return {
        ...state,
        locations: state.locations.map((l) =>
          l.id === action.payload.id ? action.payload : l
        ),
      };
    case "REMOVE_LOCATION":
      return {
        ...state,
        locations: state.locations.filter((l) => l.id !== action.payload),
      };
    case "ADD_WEAPON":
      return { ...state, weapons: [...state.weapons, action.payload] };
    case "UPDATE_WEAPON":
      return {
        ...state,
        weapons: state.weapons.map((w) =>
          w.id === action.payload.id ? action.payload : w
        ),
      };
    case "REMOVE_WEAPON":
      return {
        ...state,
        weapons: state.weapons.filter((w) => w.id !== action.payload),
      };
    case "SET_NOTES":
      return { ...state, notes: action.payload };
    case "START_TIMER":
      return { ...state, timerStartedAt: Date.now(), timerRunning: true };
    case "PAUSE_TIMER":
      return {
        ...state,
        timerElapsed: action.payload,
        timerStartedAt: null,
        timerRunning: false,
      };
    case "RESET_TIMER":
      return {
        ...state,
        timerElapsed: 0,
        timerStartedAt: null,
        timerRunning: false,
      };
    case "SET_CANVAS_SNAPSHOT":
      return { ...state, canvasSnapshot: action.payload };
    case "RESET_ALL":
      return createEmptyPuzzleState();
    default:
      return state;
  }
}

// --- Context ---

interface PuzzleContextValue {
  state: PuzzleState;
  dispatch: React.Dispatch<Action>;
  loaded: boolean;
  saved: boolean;
}

const PuzzleContext = createContext<PuzzleContextValue | null>(null);

export function PuzzleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, createEmptyPuzzleState());
  const [loaded, setLoaded] = React.useState(false);
  const [saved, setSaved] = React.useState(true);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  // Load from IndexedDB on mount
  useEffect(() => {
    loadPuzzleState().then((saved) => {
      if (saved) {
        // Migrate old schema: ensure new fields exist
        const migrated: PuzzleState = {
          ...createEmptyPuzzleState(),
          ...saved,
          wizardStep: saved.wizardStep ?? "entry",
          notes: saved.notes ?? "",
        };
        dispatch({ type: "LOAD_STATE", payload: migrated });
      }
      setLoaded(true);
      // After setting loaded, mark initial load as done after a tick
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 0);
    });
  }, []);

  // Auto-save to IndexedDB on state changes (debounced)
  useEffect(() => {
    if (!loaded || isInitialLoad.current) return;
    setSaved(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      savePuzzleState(state).then(() => setSaved(true));
    }, 500);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [state, loaded]);

  return (
    <PuzzleContext.Provider value={{ state, dispatch, loaded, saved }}>
      {children}
    </PuzzleContext.Provider>
  );
}

export function usePuzzle() {
  const ctx = useContext(PuzzleContext);
  if (!ctx) throw new Error("usePuzzle must be used inside PuzzleProvider");
  return ctx;
}

export function useResetPuzzle() {
  const { dispatch } = usePuzzle();
  return useCallback(() => {
    dispatch({ type: "RESET_ALL" });
    clearPuzzleState();
  }, [dispatch]);
}
