"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { usePuzzle } from "@/context/PuzzleContext";
import type { BoardCard } from "@/types";

const CARD_W = 140;
const CARD_H = 56;

const TYPE_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  suspect: { bg: "bg-amber-900/50", border: "border-amber-700/60", icon: "🕵️" },
  location: { bg: "bg-blue-900/50", border: "border-blue-700/60", icon: "📍" },
  weapon: { bg: "bg-red-900/50", border: "border-red-700/60", icon: "🗡" },
};

export default function DragBoard() {
  const { state, dispatch } = usePuzzle();
  const boardRef = useRef<HTMLDivElement>(null);

  // Pan state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Drag card state
  const dragInfo = useRef<{
    cardId: string;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  // Connect mode
  const [connectFrom, setConnectFrom] = useState<string | null>(null);

  // Get entity label
  const getLabel = useCallback(
    (card: BoardCard) => {
      if (card.entityType === "suspect") {
        return state.suspects.find((s) => s.id === card.entityId)?.name ?? "?";
      }
      if (card.entityType === "location") {
        return state.locations.find((l) => l.id === card.entityId)?.name ?? "?";
      }
      return state.weapons.find((w) => w.id === card.entityId)?.name ?? "?";
    },
    [state.suspects, state.locations, state.weapons]
  );

  // ─── Pointer handlers for board pan ───
  const handleBoardPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only start pan if clicking the board background directly
      if (e.target !== e.currentTarget) return;
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pan]
  );

  const handleBoardPointerMove = useCallback((e: React.PointerEvent) => {
    if (panStart.current) {
      setPan({
        x: panStart.current.panX + (e.clientX - panStart.current.x),
        y: panStart.current.panY + (e.clientY - panStart.current.y),
      });
    }
  }, []);

  const handleBoardPointerUp = useCallback(() => {
    panStart.current = null;
  }, []);

  // ─── Pointer handlers for card drag ───
  const handleCardPointerDown = useCallback(
    (e: React.PointerEvent, card: BoardCard) => {
      e.stopPropagation();
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;

      dragInfo.current = {
        cardId: card.id,
        offsetX: e.clientX - (card.x + pan.x + rect.left),
        offsetY: e.clientY - (card.y + pan.y + rect.top),
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pan]
  );

  const handleCardPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragInfo.current) return;
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = Math.abs(e.clientX - dragInfo.current.startX);
      const dy = Math.abs(e.clientY - dragInfo.current.startY);
      if (dx > 3 || dy > 3) dragInfo.current.moved = true;

      const newX = e.clientX - dragInfo.current.offsetX - pan.x - rect.left;
      const newY = e.clientY - dragInfo.current.offsetY - pan.y - rect.top;
      dispatch({
        type: "MOVE_BOARD_CARD",
        payload: { id: dragInfo.current.cardId, x: newX, y: newY },
      });
    },
    [dispatch, pan]
  );

  const handleCardPointerUp = useCallback(
    (card: BoardCard) => {
      const wasDrag = dragInfo.current?.moved;
      dragInfo.current = null;

      if (!wasDrag) {
        // Tap — handle connect mode
        if (connectFrom) {
          if (connectFrom !== card.id) {
            // Check for existing line between these two
            const exists = state.boardLines.some(
              (l) =>
                (l.fromCardId === connectFrom && l.toCardId === card.id) ||
                (l.fromCardId === card.id && l.toCardId === connectFrom)
            );
            if (exists) {
              // Remove the line
              const line = state.boardLines.find(
                (l) =>
                  (l.fromCardId === connectFrom && l.toCardId === card.id) ||
                  (l.fromCardId === card.id && l.toCardId === connectFrom)
              );
              if (line) dispatch({ type: "REMOVE_BOARD_LINE", payload: line.id });
            } else {
              dispatch({
                type: "ADD_BOARD_LINE",
                payload: {
                  id: `${connectFrom}-${card.id}`,
                  fromCardId: connectFrom,
                  toCardId: card.id,
                },
              });
            }
          }
          setConnectFrom(null);
        } else {
          setConnectFrom(card.id);
        }
      }
    },
    [connectFrom, state.boardLines, dispatch]
  );

  // Cancel connect mode on background tap
  const handleBoardTap = useCallback(
    (e: React.PointerEvent) => {
      if (e.target === e.currentTarget && connectFrom) {
        setConnectFrom(null);
      }
    },
    [connectFrom]
  );

  // Clear connect mode on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setConnectFrom(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Get card center for SVG lines
  function cardCenter(card: BoardCard) {
    return { cx: card.x + CARD_W / 2, cy: card.y + CARD_H / 2 };
  }

  const cardMap = new Map(state.boardCards.map((c) => [c.id, c]));

  return (
    <div className="absolute inset-0 overflow-hidden bg-zinc-950">
      {/* Dot grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(161,161,170,0.12) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          backgroundPosition: `${pan.x % 24}px ${pan.y % 24}px`,
        }}
      />

      {/* Board surface */}
      <div
        ref={boardRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={handleBoardPointerDown}
        onPointerMove={handleBoardPointerMove}
        onPointerUp={(e) => {
          handleBoardPointerUp();
          handleBoardTap(e);
        }}
      >
        {/* SVG Connections */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: "visible" }}
        >
          {state.boardLines.map((line) => {
            const from = cardMap.get(line.fromCardId);
            const to = cardMap.get(line.toCardId);
            if (!from || !to) return null;
            const a = cardCenter(from);
            const b = cardCenter(to);
            return (
              <line
                key={line.id}
                x1={a.cx + pan.x}
                y1={a.cy + pan.y}
                x2={b.cx + pan.x}
                y2={b.cy + pan.y}
                stroke="rgba(217,119,6,0.5)"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            );
          })}
          {/* Connect preview line */}
          {connectFrom && (
            <ConnectPreview fromCard={cardMap.get(connectFrom)!} pan={pan} />
          )}
        </svg>

        {/* Cards */}
        {state.boardCards.map((card) => {
          const style = TYPE_STYLES[card.entityType];
          const isConnecting = connectFrom === card.id;
          const label = getLabel(card);

          return (
            <div
              key={card.id}
              className={`absolute select-none rounded-xl border backdrop-blur-sm shadow-lg transition-shadow ${style.bg} ${style.border} ${
                isConnecting ? "ring-2 ring-amber-400 shadow-amber-900/40" : ""
              }`}
              style={{
                width: CARD_W,
                height: CARD_H,
                left: card.x + pan.x,
                top: card.y + pan.y,
                touchAction: "none",
              }}
              onPointerDown={(e) => handleCardPointerDown(e, card)}
              onPointerMove={handleCardPointerMove}
              onPointerUp={() => handleCardPointerUp(card)}
            >
              <div className="flex items-center gap-2 px-3 h-full">
                <span className="text-base shrink-0">{style.icon}</span>
                <span className="text-sm font-medium text-zinc-100 truncate">{label}</span>
              </div>

              {/* Remove button */}
              <button
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-[10px] text-zinc-400 hover:bg-red-900 hover:text-red-300 hover:border-red-500 transition-colors opacity-0 hover:opacity-100 focus:opacity-100"
                style={{ touchAction: "auto" }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "REMOVE_BOARD_CARD", payload: card.id });
                  if (connectFrom === card.id) setConnectFrom(null);
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* Connect mode hint */}
      {connectFrom && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-amber-900/80 backdrop-blur text-amber-200 text-xs font-medium shadow-lg animate-fade-in z-30">
          Tap another card to connect · Tap background to cancel
        </div>
      )}

      {/* Empty state */}
      {state.boardCards.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-zinc-600 space-y-2">
            <div className="text-4xl">📋</div>
            <p className="text-sm">Place entities from the panel to start</p>
            <p className="text-xs text-zinc-700">Tap a card, then tap another to connect them</p>
          </div>
        </div>
      )}
    </div>
  );
}

// SVG line that animates from the connecting card to a pulsing dot
function ConnectPreview({ fromCard, pan }: { fromCard: BoardCard; pan: { x: number; y: number } }) {
  const cx = fromCard.x + CARD_W / 2 + pan.x;
  const cy = fromCard.y + CARD_H / 2 + pan.y;
  return (
    <circle cx={cx} cy={cy} r={6} fill="rgba(217,119,6,0.6)">
      <animate attributeName="r" values="4;8;4" dur="1s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
    </circle>
  );
}
