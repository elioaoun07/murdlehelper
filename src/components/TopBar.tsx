"use client";

import { useState, useEffect, useRef } from "react";
import { usePuzzle, useResetPuzzle } from "@/context/PuzzleContext";
import { addPuzzleRecord } from "@/lib/db";
import { uid } from "@/lib/uid";

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface TopBarProps {
  onToggleScoreboard: () => void;
}

export default function TopBar({ onToggleScoreboard }: TopBarProps) {
  const { state, dispatch, saved } = usePuzzle();
  const resetPuzzle = useResetPuzzle();
  const [elapsed, setElapsed] = useState(state.timerElapsed);
  const [confirmReset, setConfirmReset] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.timerRunning && state.timerStartedAt) {
      intervalRef.current = setInterval(() => {
        setElapsed(state.timerElapsed + (Date.now() - state.timerStartedAt!));
      }, 200);
    } else {
      setElapsed(state.timerElapsed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.timerRunning, state.timerStartedAt, state.timerElapsed]);

  function toggleTimer() {
    if (state.timerRunning) {
      dispatch({
        type: "PAUSE_TIMER",
        payload: state.timerElapsed + (Date.now() - (state.timerStartedAt ?? Date.now())),
      });
    } else {
      dispatch({ type: "START_TIMER" });
    }
  }

  function handleSolve() {
    const currentElapsed = state.timerRunning
      ? state.timerElapsed + (Date.now() - (state.timerStartedAt ?? Date.now()))
      : state.timerElapsed;

    if (state.timerRunning) {
      dispatch({ type: "PAUSE_TIMER", payload: currentElapsed });
    }

    addPuzzleRecord({
      id: uid(),
      puzzleName: state.puzzleName || "Unnamed Puzzle",
      solveTimeSeconds: Math.floor(currentElapsed / 1000),
      completedAt: new Date().toISOString(),
    });
    onToggleScoreboard();
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    resetPuzzle();
    setConfirmReset(false);
  }

  return (
    <header className="flex items-center gap-3 px-4 py-2.5 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 shrink-0 z-50">
      {/* Puzzle Name */}
      <input
        type="text"
        placeholder="Puzzle name…"
        value={state.puzzleName}
        onChange={(e) => dispatch({ type: "SET_PUZZLE_NAME", payload: e.target.value })}
        className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-amber-100 placeholder-zinc-600 text-sm w-40 focus:outline-none focus:border-amber-600 transition-colors"
      />

      {/* Timer */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="font-mono text-lg text-amber-300 tabular-nums tracking-wider">
          {formatTime(elapsed)}
        </span>
        <button
          onClick={toggleTimer}
          className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-700 hover:bg-amber-600 text-white transition-colors"
        >
          {state.timerRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => dispatch({ type: "RESET_TIMER" })}
          className="px-2 py-1 rounded text-xs text-zinc-500 hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSolve}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-700 hover:bg-green-600 text-white transition-colors"
        >
          ✓ Solved!
        </button>
        <button
          onClick={handleReset}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            confirmReset
              ? "bg-red-700 hover:bg-red-600 text-white"
              : "bg-zinc-700/80 hover:bg-zinc-600 text-zinc-300"
          }`}
        >
          {confirmReset ? "Confirm?" : "Reset"}
        </button>
        <button
          onClick={onToggleScoreboard}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-700/80 hover:bg-zinc-600 text-zinc-300 transition-colors"
        >
          🏆
        </button>
        <span className={`text-xs transition-opacity ${saved ? "text-green-500/80" : "text-amber-400/70"}`}>
          {saved ? "✓" : "…"}
        </span>
      </div>
    </header>
  );
}
