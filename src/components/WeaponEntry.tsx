"use client";

import { useState } from "react";
import { usePuzzle } from "@/context/PuzzleContext";
import { uid } from "@/lib/uid";
import type { Weapon } from "@/types";

export default function WeaponEntry() {
  const { state, dispatch } = usePuzzle();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  function resetForm() {
    setName("");
    setDesc("");
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit() {
    if (!name.trim()) return;
    if (editingId) {
      dispatch({
        type: "UPDATE_WEAPON",
        payload: { id: editingId, name: name.trim(), description: desc },
      });
    } else {
      dispatch({
        type: "ADD_WEAPON",
        payload: { id: uid(), name: name.trim(), description: desc },
      });
    }
    resetForm();
  }

  function startEdit(w: Weapon) {
    setEditingId(w.id);
    setName(w.name);
    setDesc(w.description ?? "");
    setShowForm(true);
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {state.weapons.map((w, i) => (
          <div
            key={w.id}
            className="glass-card p-4 animate-card-in group relative cursor-pointer transition-all duration-200"
            style={{ animationDelay: `${i * 50}ms` }}
            onClick={() => startEdit(w)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); dispatch({ type: "REMOVE_WEAPON", payload: w.id }); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-zinc-600 opacity-0 group-hover:opacity-100 hover:bg-red-900/40 hover:text-red-400 transition-all text-xs"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-lg bg-red-900/30 border border-red-700/30 flex items-center justify-center text-red-300 text-sm">🗡</span>
              <h4 className="font-medium text-amber-100 text-sm truncate">{w.name}</h4>
            </div>
            {w.description && (
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2 pl-10">{w.description}</p>
            )}
          </div>
        ))}

        {!showForm && (
          <button
            onClick={() => { setEditingId(null); setShowForm(true); }}
            className="glass-card p-4 flex flex-col items-center justify-center gap-2 min-h-[80px] text-zinc-500 hover:text-red-400 hover:border-red-700/40 transition-all duration-200 cursor-pointer"
          >
            <span className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center text-lg">+</span>
            <span className="text-xs font-medium">Add Weapon</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card p-5 animate-card-in">
          <h4 className="text-sm font-semibold text-red-300 mb-3">
            {editingId ? "Edit Weapon" : "New Weapon"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1 uppercase tracking-wider">Name *</label>
              <input
                autoFocus
                placeholder="e.g. Poison Chalice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-amber-100 placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1 uppercase tracking-wider">Notes</label>
              <input
                placeholder="Optional description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-amber-100 placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/30 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white transition-all"
            >
              {editingId ? "Save Changes" : "Add Weapon"}
            </button>
            <button onClick={resetForm} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
