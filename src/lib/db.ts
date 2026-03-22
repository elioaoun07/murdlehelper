import { openDB, type IDBPDatabase } from "idb";
import type { PuzzleState, PuzzleRecord } from "@/types";

const DB_NAME = "murdle-helper";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("currentPuzzle")) {
          db.createObjectStore("currentPuzzle");
        }
        if (!db.objectStoreNames.contains("puzzleHistory")) {
          db.createObjectStore("puzzleHistory", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function savePuzzleState(state: PuzzleState): Promise<void> {
  const db = await getDb();
  await db.put("currentPuzzle", state, "current");
}

export async function loadPuzzleState(): Promise<PuzzleState | undefined> {
  const db = await getDb();
  return db.get("currentPuzzle", "current");
}

export async function clearPuzzleState(): Promise<void> {
  const db = await getDb();
  await db.delete("currentPuzzle", "current");
}

export async function addPuzzleRecord(record: PuzzleRecord): Promise<void> {
  const db = await getDb();
  await db.put("puzzleHistory", record);
}

export async function getPuzzleRecords(): Promise<PuzzleRecord[]> {
  const db = await getDb();
  const records = await db.getAll("puzzleHistory");
  return records.sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

export async function deletePuzzleRecord(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("puzzleHistory", id);
}

export async function clearPuzzleHistory(): Promise<void> {
  const db = await getDb();
  await db.clear("puzzleHistory");
}
