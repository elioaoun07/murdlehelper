"use client";

import { useState } from "react";
import { usePuzzle } from "@/context/PuzzleContext";

export default function NotesBar() {
  const { state, dispatch } = usePuzzle();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`fixed bottom-0 right-0 z-40 transition-all duration-300 ${
      expanded ? "w-80 h-[50vh]" : "w-auto h-auto"
    }`}>
      {expanded ? (
        <div className="h-full flex flex-col bg-zinc-900/95 backdrop-blur-md border-l border-t border-zinc-700/50 rounded-tl-xl shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
            <h3 className="text-sm font-semibold text-zinc-300">📝 Notes</h3>
            <button
              onClick={() => setExpanded(false)}
              className="text-zinc-500 hover:text-white text-xs transition-colors"
            >
              ✕
            </button>
          </div>
          {/* Textarea */}
          <textarea
            value={state.notes}
            onChange={(e) => dispatch({ type: "SET_NOTES", payload: e.target.value })}
            placeholder="Jot down your thoughts, clues, deductions..."
            className="flex-1 w-full bg-transparent px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none"
          />
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="m-4 px-4 py-2.5 rounded-xl bg-zinc-800/90 backdrop-blur-sm border border-zinc-700/50 text-sm text-zinc-400 hover:text-white hover:border-zinc-600 transition-all shadow-lg flex items-center gap-2"
        >
          📝 <span>Notes</span>
          {state.notes && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
      )}
    </div>
  );
}
