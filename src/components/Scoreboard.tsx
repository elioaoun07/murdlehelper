"use client";

import { useEffect, useState } from "react";
import {
  getPuzzleRecords,
  deletePuzzleRecord,
  clearPuzzleHistory,
} from "@/lib/db";
import type { PuzzleRecord } from "@/types";

function formatSolveTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

interface ScoreboardProps {
  onClose: () => void;
}

export default function Scoreboard({ onClose }: ScoreboardProps) {
  const [records, setRecords] = useState<PuzzleRecord[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  async function loadRecords() {
    const r = await getPuzzleRecords();
    setRecords(r);
  }

  useEffect(() => {
    loadRecords();
  }, []);

  async function handleDelete(id: string) {
    await deletePuzzleRecord(id);
    loadRecords();
  }

  async function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    await clearPuzzleHistory();
    setRecords([]);
    setConfirmClear(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-zinc-900 border border-amber-900/50 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-amber-300">
            🏆 Puzzle Scoreboard
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Records */}
        <div className="flex-1 overflow-y-auto p-4">
          {records.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">
              No puzzles solved yet. Get cracking, detective! 🕵️
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 text-xs border-b border-zinc-800">
                  <th className="text-left py-2 font-medium">Puzzle</th>
                  <th className="text-right py-2 font-medium">Time</th>
                  <th className="text-right py-2 font-medium">Date</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                  >
                    <td className="py-2 text-amber-200 font-medium">
                      {r.puzzleName}
                    </td>
                    <td className="py-2 text-right text-zinc-300 font-mono text-xs">
                      {formatSolveTime(r.solveTimeSeconds)}
                    </td>
                    <td className="py-2 text-right text-zinc-500 text-xs">
                      {new Date(r.completedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-zinc-600 hover:text-red-400 text-xs transition-colors"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {records.length > 0 && (
          <div className="px-5 py-3 border-t border-zinc-800 flex justify-between items-center">
            <span className="text-xs text-zinc-500">
              {records.length} puzzle{records.length !== 1 ? "s" : ""} solved
            </span>
            <button
              onClick={handleClearAll}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                confirmClear
                  ? "bg-red-700 hover:bg-red-600 text-white font-semibold"
                  : "text-zinc-500 hover:text-red-400"
              }`}
            >
              {confirmClear ? "Confirm Clear All?" : "Clear All"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
