"use client";

import dynamic from "next/dynamic";
import { usePuzzle } from "@/context/PuzzleContext";
import { useCallback, useRef, useImperativeHandle, forwardRef } from "react";
import type { Editor } from "tldraw";

const Tldraw = dynamic(() => import("tldraw").then((mod) => mod.Tldraw), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
      Loading canvas…
    </div>
  ),
});

export interface CanvasHandle {
  getEditor: () => Editor | null;
}

const InvestigationCanvas = forwardRef<CanvasHandle>(function InvestigationCanvas(_props, ref) {
  const { state, dispatch } = usePuzzle();
  const editorRef = useRef<Editor | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    getEditor: () => editorRef.current,
  }));

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      // Restore snapshot if available
      if (state.canvasSnapshot) {
        try {
          const snapshot = JSON.parse(state.canvasSnapshot);
          editor.store.loadStoreSnapshot(snapshot);
        } catch {
          // ignore corrupted snapshots
        }
      }

      // Auto-save on changes (debounced)
      const unsub = editor.store.listen(
        () => {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = setTimeout(() => {
            try {
              const snapshot = editor.store.getStoreSnapshot();
              dispatch({
                type: "SET_CANVAS_SNAPSHOT",
                payload: JSON.stringify(snapshot),
              });
            } catch {
              // ignore serialization errors
            }
          }, 1000);
        },
        { scope: "document", source: "user" }
      );

      return () => {
        unsub();
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      };
    },
    // We intentionally only use the snapshot on first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Tldraw onMount={handleMount} />
    </div>
  );
});

export default InvestigationCanvas;
