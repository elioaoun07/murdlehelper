"use client";

import { useState } from "react";
import { usePuzzle } from "@/context/PuzzleContext";
import { uid } from "@/lib/uid";
import type { Suspect } from "@/types";

export default function SuspectEntry() {
  const { state, dispatch } = usePuzzle();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [handedness, setHandedness] = useState<"" | "left" | "right">("");
  const [eyeColor, setEyeColor] = useState("");
  const [hairColor, setHairColor] = useState("");

  function resetForm() {
    setName("");
    setHeight("");
    setHandedness("");
    setEyeColor("");
    setHairColor("");
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit() {
    if (!name.trim()) return;
    if (editingId) {
      dispatch({
        type: "UPDATE_SUSPECT",
        payload: { id: editingId, name: name.trim(), height, handedness, eyeColor, hairColor },
      });
    } else {
      dispatch({
        type: "ADD_SUSPECT",
        payload: { id: uid(), name: name.trim(), height, handedness, eyeColor, hairColor },
      });
    }
    resetForm();
  }

  function startEdit(s: Suspect) {
    setEditingId(s.id);
    setName(s.name);
    setHeight(s.height ?? "");
    setHandedness(s.handedness ?? "");
    setEyeColor(s.eyeColor ?? "");
    setHairColor(s.hairColor ?? "");
    setShowForm(true);
  }

  function handleDelete(id: string) {
    dispatch({ type: "REMOVE_SUSPECT", payload: id });
  }

  return (
    <div>
      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {state.suspects.map((s, i) => (
          <div
            key={s.id}
            className="glass-card p-4 animate-card-in group relative cursor-pointer transition-all duration-200"
            style={{ animationDelay: `${i * 50}ms` }}
            onClick={() => startEdit(s)}
          >
            {/* Delete button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-zinc-600 opacity-0 group-hover:opacity-100 hover:bg-red-900/40 hover:text-red-400 transition-all text-xs"
            >
              ✕
            </button>

            {/* Name */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-700/30 flex items-center justify-center text-amber-300 text-sm font-semibold">
                {s.name.charAt(0).toUpperCase()}
              </div>
              <h4 className="font-medium text-amber-100 text-sm truncate">{s.name}</h4>
            </div>

            {/* Traits */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {s.height && (
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  📏 {s.height}
                </span>
              )}
              {s.handedness && (
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  {s.handedness === "left" ? "🫲 Left" : "🫱 Right"}
                </span>
              )}
              {s.eyeColor && (
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  👁 {s.eyeColor}
                </span>
              )}
              {s.hairColor && (
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  💇 {s.hairColor}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Add card button */}
        {!showForm && (
          <button
            onClick={() => { setEditingId(null); setShowForm(true); }}
            className="glass-card p-4 flex flex-col items-center justify-center gap-2 min-h-[100px] text-zinc-500 hover:text-amber-400 hover:border-amber-700/40 transition-all duration-200 cursor-pointer"
          >
            <span className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center text-lg">+</span>
            <span className="text-xs font-medium">Add Suspect</span>
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="glass-card p-5 animate-card-in">
          <h4 className="text-sm font-semibold text-amber-300 mb-3">
            {editingId ? "Edit Suspect" : "New Suspect"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1 uppercase tracking-wider">Name *</label>
              <input
                autoFocus
                placeholder="e.g. Lady Violet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-amber-100 placeholder-zinc-600 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1 uppercase tracking-wider">Height</label>
              <input
                placeholder="e.g. 5'8&quot;"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-amber-100 placeholder-zinc-600 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1 uppercase tracking-wider">Handedness</label>
              <div className="flex gap-2">
                {(["left", "right"] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHandedness(handedness === h ? "" : h)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                      handedness === h
                        ? "bg-amber-900/40 border-amber-700/50 text-amber-300"
                        : "bg-zinc-800/80 border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    {h === "left" ? "🫲 Left" : "🫱 Right"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1 uppercase tracking-wider">Eye Color</label>
              <input
                placeholder="e.g. Blue"
                value={eyeColor}
                onChange={(e) => setEyeColor(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-amber-100 placeholder-zinc-600 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1 uppercase tracking-wider">Hair Color</label>
              <input
                placeholder="e.g. Auburn"
                value={hairColor}
                onChange={(e) => setHairColor(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-amber-100 placeholder-zinc-600 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white transition-all"
            >
              {editingId ? "Save Changes" : "Add Suspect"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
