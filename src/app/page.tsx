"use client";

import { useState } from "react";
import { PuzzleProvider, usePuzzle } from "@/context/PuzzleContext";
import TopBar from "@/components/TopBar";
import EntryWizard from "@/components/EntryWizard";
import BoardView from "@/components/CanvasView";
import Scoreboard from "@/components/Scoreboard";

function Dashboard() {
  const { state, loaded } = usePuzzle();
  const [showScoreboard, setShowScoreboard] = useState(false);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center flex-1 text-zinc-500">
        Loading your case files…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar onToggleScoreboard={() => setShowScoreboard((v) => !v)} />

      {state.wizardStep === "entry" ? (
        <EntryWizard />
      ) : (
        <BoardView />
      )}

      {showScoreboard && (
        <Scoreboard onClose={() => setShowScoreboard(false)} />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <PuzzleProvider>
      <Dashboard />
    </PuzzleProvider>
  );
}
