import type { GameState, SyncMode } from "./types";
import { PLAYERS } from "./tennis";

const STORAGE_KEY = "tennis_state_v1";
const POOL_KEY = "tennis_pool_v1";

/** In-Memory-Fallback für Vorschau-Umgebungen ohne localStorage. */
const MEM: { current: GameState | null } = { current: null };

/**
 * Optionale geteilte Storage-API (z. B. Glitch / Replit).
 * Wird im normalen PWA-Betrieb nicht genutzt.
 */
declare global {
  interface Window {
    storage?: {
      get(key: string, shared?: boolean): Promise<{ value: string } | null>;
      set(key: string, value: string, shared?: boolean): Promise<void>;
    };
  }
}

export async function loadState(): Promise<{
  state: GameState | null;
  mode: SyncMode;
}> {
  const hasSharedStorage = typeof window !== "undefined" && !!window.storage;

  if (hasSharedStorage) {
    try {
      const r = await window.storage!.get(STORAGE_KEY, true);
      if (r?.value) {
        const state = JSON.parse(r.value) as GameState;
        return { state, mode: "shared" };
      }
    } catch {
      // Schlüssel fehlt oder Storage nicht erreichbar
    }
  }

  // Lokaler localStorage-Fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state = JSON.parse(raw) as GameState;
      return { state, mode: "local" };
    }
  } catch {
    // Kein localStorage (z. B. Private Mode mit Einschränkungen)
  }

  return { state: MEM.current, mode: "local" };
}

export async function saveState(
  state: GameState,
  mode: SyncMode,
): Promise<void> {
  MEM.current = state;
  const serialised = JSON.stringify(state);

  if (mode === "shared" && typeof window !== "undefined" && window.storage) {
    try {
      await window.storage.set(STORAGE_KEY, serialised, true);
      return;
    } catch {
      // Fallback auf localStorage
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, serialised);
  } catch {
    // Ignorieren – In-Memory-Fallback ist bereits gesetzt
  }
}

export async function pollSharedState(): Promise<GameState | null> {
  if (typeof window === "undefined" || !window.storage) return null;
  try {
    const r = await window.storage.get(STORAGE_KEY, true);
    if (r?.value) return JSON.parse(r.value) as GameState;
  } catch {
    // Ignorieren
  }
  return null;
}

export function loadPlayerPool(): string[] {
  try {
    const raw = localStorage.getItem(POOL_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "string")
      ) {
        return parsed as string[];
      }
    }
  } catch {
    // Fall through to default
  }
  return [...PLAYERS];
}

export async function clearState(mode: SyncMode): Promise<void> {
  MEM.current = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  if (mode === "shared" && typeof window !== "undefined" && window.storage) {
    try {
      await window.storage.set(STORAGE_KEY, "", true);
    } catch {
      // ignore
    }
  }
}

export function savePlayerPool(pool: string[]): void {
  try {
    localStorage.setItem(POOL_KEY, JSON.stringify(pool));
  } catch {
    // Ignore — pool is non-critical, game can restart with defaults
  }
}
