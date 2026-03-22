"use client";

import { useState } from "react";
import { usePuzzle } from "@/context/PuzzleContext";
import { uid } from "@/lib/uid";

export default function EntityPalette() {
  const { state, dispatch } = usePuzzle();
  const [collapsed, setCollapsed] = useState(false);

  function placeEntity(type: "suspect" | "location" | "weapon", entityId: string) {
    // Check if already placed
    if (state.boardCards.some((c) => c.entityId === entityId)) return;

    // Spread cards out based on how many are already placed
    const count = state.boardCards.length;
    const col = count % 3;
    const row = Math.floor(count / 3);
    const x = 80 + col * 180;
    const y = 80 + row * 90;

    dispatch({
      type: "ADD_BOARD_CARD",
      payload: { id: uid(), entityType: type, entityId, x, y },
    });
  }

  const sections = [
    {
      type: "suspect" as const,
      label: "Suspects",
      icon: "🕵️",
      items: state.suspects.map((s) => ({
        id: s.id,
        name: s.name,
        placed: state.boardCards.some((c) => c.entityId === s.id),
      })),
    },
    {
      type: "location" as const,
      label: "Locations",
      icon: "📍",
      items: state.locations.map((l) => ({
        id: l.id,
        name: l.name,
        placed: state.boardCards.some((c) => c.entityId === l.id),
      })),
    },
    {
      type: "weapon" as const,
      label: "Weapons",
      icon: "🗡",
      items: state.weapons.map((w) => ({
        id: w.id,
        name: w.name,
        placed: state.boardCards.some((c) => c.entityId === w.id),
      })),
    },
  ];

  const totalEntities = state.suspects.length + state.locations.length + state.weapons.length;
  const placedCount = state.boardCards.length;

  return (
    <div
      className={`absolute top-2 left-2 z-40 transition-all duration-300 ${
        collapsed ? "w-auto" : "w-52 sm:w-60"
      }`}
      style={{ touchAction: "auto" }}
    >
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="px-3 py-2.5 rounded-xl bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 text-sm text-zinc-400 hover:text-white hover:border-zinc-600 transition-all shadow-lg flex items-center gap-2"
        >
          📋 <span className="text-xs">{placedCount}/{totalEntities}</span>
        </button>
      ) : (
        <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-700/50 rounded-xl shadow-2xl animate-fade-in max-h-[60vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800 shrink-0">
            <h3 className="text-xs font-semibold text-zinc-300">📋 Entities</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch({ type: "SET_WIZARD_STEP", payload: "entry" })}
                className="text-[11px] text-zinc-500 hover:text-amber-400 transition-colors"
              >
                ← Edit
              </button>
              <button
                onClick={() => setCollapsed(true)}
                className="text-zinc-500 hover:text-white text-xs transition-colors"
              >
                ▾
              </button>
            </div>
          </div>

          {/* Sections */}
          <div className="overflow-y-auto px-2 py-2 space-y-2">
            {sections.map((section) => (
              <div key={section.type}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">{section.icon}</span>
                  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    {section.label}
                  </span>
                </div>
                {section.items.length === 0 ? (
                  <p className="text-[11px] text-zinc-600 pl-4 italic">None added</p>
                ) : (
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/60 group transition-colors"
                      >
                        <span className="text-xs text-zinc-200 truncate flex-1">{item.name}</span>
                        {item.placed ? (
                          <span className="text-[10px] text-green-500">✓</span>
                        ) : (
                          <button
                            onClick={() => placeEntity(section.type, item.id)}
                            className="shrink-0 px-2 py-0.5 rounded text-[10px] font-medium text-amber-400 hover:bg-amber-900/30 transition-all"
                          >
                            + Place
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Place All button */}
            {placedCount < totalEntities && totalEntities > 0 && (
              <button
                onClick={() => {
                  sections.forEach((section) =>
                    section.items.forEach((item) => {
                      if (!item.placed) placeEntity(section.type, item.id);
                    })
                  );
                }}
                className="w-full mt-1 px-3 py-2 rounded-lg text-xs font-medium text-amber-300 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-800/30 transition-all"
              >
                Place All ({totalEntities - placedCount} remaining)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
