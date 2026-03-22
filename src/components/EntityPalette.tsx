"use client";

import { useState } from "react";
import { usePuzzle } from "@/context/PuzzleContext";

interface EntityPaletteProps {
  onPlaceEntity: (type: "suspect" | "location" | "weapon", id: string, label: string) => void;
}

export default function EntityPalette({ onPlaceEntity }: EntityPaletteProps) {
  const { state, dispatch } = usePuzzle();
  const [collapsed, setCollapsed] = useState(false);

  const sections = [
    {
      type: "suspect" as const,
      label: "Suspects",
      icon: "🕵️",
      items: state.suspects.map((s) => ({
        id: s.id,
        name: s.name,
        sub: [s.height, s.handedness ? `${s.handedness}-handed` : "", s.eyeColor, s.hairColor]
          .filter(Boolean)
          .join(" · "),
      })),
      color: "amber",
    },
    {
      type: "location" as const,
      label: "Locations",
      icon: "📍",
      items: state.locations.map((l) => ({
        id: l.id,
        name: l.name,
        sub: l.description || "",
      })),
      color: "blue",
    },
    {
      type: "weapon" as const,
      label: "Weapons",
      icon: "🗡",
      items: state.weapons.map((w) => ({
        id: w.id,
        name: w.name,
        sub: w.description || "",
      })),
      color: "red",
    },
  ];

  return (
    <div className={`absolute top-2 left-2 z-40 transition-all duration-300 ${
      collapsed ? "w-auto" : "w-56 sm:w-64"
    }`} style={{ touchAction: 'auto' }}>
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="px-3 py-2.5 rounded-xl bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 text-sm text-zinc-400 hover:text-white hover:border-zinc-600 transition-all shadow-lg flex items-center gap-2"
        >
          📋 Entities
        </button>
      ) : (
        <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-700/50 rounded-xl shadow-2xl animate-fade-in max-h-[calc(100vh-6rem)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
            <h3 className="text-sm font-semibold text-zinc-300">📋 Entities</h3>
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
          <div className="overflow-y-auto px-3 py-2 space-y-3">
            {sections.map((section) => (
              <div key={section.type}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs">{section.icon}</span>
                  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{section.label}</span>
                  <span className="text-[10px] text-zinc-600">({section.items.length})</span>
                </div>
                {section.items.length === 0 ? (
                  <p className="text-[11px] text-zinc-600 pl-4 italic">None added</p>
                ) : (
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 group transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-zinc-200 font-medium truncate">{item.name}</div>
                          {item.sub && (
                            <div className="text-[10px] text-zinc-500 truncate">{item.sub}</div>
                          )}
                        </div>
                        <button
                          onClick={() => onPlaceEntity(section.type, item.id, item.name)}
                          className="shrink-0 px-2 py-1 rounded text-[10px] font-medium text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-amber-900/30 hover:text-amber-300 transition-all"
                        >
                          + Place
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
