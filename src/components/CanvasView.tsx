"use client";

import { useRef, useCallback } from "react";
import InvestigationCanvas, { type CanvasHandle } from "./InvestigationCanvas";
import EntityPalette from "./EntityPalette";
import NotesBar from "./NotesBar";
import { createShapeId, toRichText } from "@tldraw/tlschema";

export default function CanvasView() {
  const canvasRef = useRef<CanvasHandle>(null);

  const handlePlaceEntity = useCallback(
    (type: "suspect" | "location" | "weapon", id: string, label: string) => {
      const editor = canvasRef.current?.getEditor();
      if (!editor) return;

      const colors: Record<string, "yellow" | "blue" | "red"> = {
        suspect: "yellow",
        location: "blue",
        weapon: "red",
      };

      const icons: Record<string, string> = {
        suspect: "🕵️",
        location: "📍",
        weapon: "🗡",
      };

      // Get center of current viewport
      const viewportCenter = editor.getViewportScreenCenter();
      const pagePoint = editor.screenToPage(viewportCenter);

      // Small random offset so stacking clicks don't overlap
      const offsetX = (Math.random() - 0.5) * 80;
      const offsetY = (Math.random() - 0.5) * 80;

      editor.createShape({
        id: createShapeId(),
        type: "note",
        x: pagePoint.x + offsetX - 50,
        y: pagePoint.y + offsetY - 25,
        props: {
          richText: toRichText(`${icons[type]} ${label}`),
          color: colors[type],
          size: "m",
        },
      });
    },
    []
  );

  return (
    <div className="flex-1 relative overflow-hidden">
      <InvestigationCanvas ref={canvasRef} />

      {/* Floating overlays */}
      <EntityPalette onPlaceEntity={handlePlaceEntity} />
      <NotesBar />
    </div>
  );
}
