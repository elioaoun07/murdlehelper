"use client";

import { useState } from "react";
import { usePuzzle } from "@/context/PuzzleContext";
import SuspectEntry from "./SuspectEntry";
import LocationEntry from "./LocationEntry";
import WeaponEntry from "./WeaponEntry";

type EntryTab = "suspects" | "locations" | "weapons";

const tabs: { key: EntryTab; label: string; icon: string; color: string }[] = [
  { key: "suspects", label: "Suspects", icon: "🕵️", color: "amber" },
  { key: "locations", label: "Locations", icon: "📍", color: "blue" },
  { key: "weapons", label: "Weapons", icon: "🗡", color: "red" },
];

export default function EntryWizard() {
  const { state, dispatch } = usePuzzle();
  const [activeTab, setActiveTab] = useState<EntryTab>("suspects");

  const hasEntities = state.suspects.length > 0 || state.locations.length > 0 || state.weapons.length > 0;

  function getCounts(tab: EntryTab) {
    switch (tab) {
      case "suspects": return state.suspects.length;
      case "locations": return state.locations.length;
      case "weapons": return state.weapons.length;
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header area */}
      <div className="text-center pt-4 sm:pt-8 pb-3 sm:pb-6 px-4 shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-amber-200 mb-1">Set Up Your Case</h1>
        <p className="text-xs sm:text-sm text-zinc-500">Add suspects, locations, and weapons</p>
      </div>

      {/* Tab bar */}
      <div className="flex justify-center gap-1 px-3 mb-3 sm:mb-6 shrink-0 overflow-x-auto">
        {tabs.map((tab) => {
          const count = getCounts(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-lg"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-amber-600 text-white" : "bg-zinc-700 text-zinc-400"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-8 lg:px-16 xl:px-24 pb-24">
        <div className="max-w-4xl mx-auto">
          {activeTab === "suspects" && <SuspectEntry />}
          {activeTab === "locations" && <LocationEntry />}
          {activeTab === "weapons" && <WeaponEntry />}
        </div>
      </div>

      {/* Continue button */}
      {hasEntities && (
        <div className="shrink-0 border-t border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm px-4 py-3 flex justify-center animate-slide-up">
          <button
            onClick={() => dispatch({ type: "SET_WIZARD_STEP", payload: "board" })}
            className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30 transition-all duration-200 hover:shadow-amber-900/50 active:scale-[0.98] flex items-center gap-2"
          >
            Open Board
            <span className="text-amber-200">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
