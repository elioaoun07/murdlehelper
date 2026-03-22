"use client";

import DragBoard from "./DragBoard";
import EntityPalette from "./EntityPalette";
import NotesBar from "./NotesBar";

export default function BoardView() {
  return (
    <div className="flex-1 relative overflow-hidden">
      <DragBoard />
      <EntityPalette />
      <NotesBar />
    </div>
  );
}
