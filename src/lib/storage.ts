import { DEFAULT_LANGUAGE, isLanguage, type Language } from "./i18n";
import type { GameState, SyncMode } from "./types";
import { PLAYERS } from "./tennis";

const STORAGE_KEY = "tennis_state_v1";
const POOL_KEY = "tennis_pool_v1";
const LANGUAGE_KEY = "tennis_language_v1";

const MEM: { current: GameState | null } = { current: null };
const LANGUAGE_MEM: { current: Language } = { current: DEFAULT_LANGUAGE };

declare global {
  interface Window {
    storage?: {
      get(key: string, shared?: boolean): Promise<{ value: string } | null>;
      set(key: string, value: string, shared?: boolean): Promise<void>;
    };
  }
}

/** Migrate persisted state from older schema versions to the current one. */
function migrateState(raw: unknown): GameState {
  const state = raw as GameState & { bench: unknown; lastChange?: unknown };
  // v1→v2: bench changed from string to string[]
  if (typeof state.bench === "string") {
    state.bench = state.bench ? [state.bench] : [];
  }
  // v2→v3: lastChange removed; replaced with lastChanges
  if (!Array.isArray(state.lastChanges)) {
    state.lastChanges = [];
  }
  return state as GameState;
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
        const state = migrateState(JSON.parse(r.value));
        return { state, mode: "shared" };
      }
    } catch {
      // Key missing or shared storage unavailable.
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state = migrateState(JSON.parse(raw));
      return { state, mode: "local" };
    }
  } catch {
    // localStorage unavailable (for example restricted browser modes).
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
      // Fall back to localStorage.
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, serialised);
  } catch {
    // Ignore: the in-memory fallback is already set.
  }
}

export async function pollSharedState(): Promise<GameState | null> {
  if (typeof window === "undefined" || !window.storage) return null;
  try {
    const r = await window.storage.get(STORAGE_KEY, true);
    if (r?.value) return migrateState(JSON.parse(r.value));
  } catch {
    // Ignore shared polling failures.
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
    // Fall through to the default pool.
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
    // Ignore: the pool is non-critical and can fall back to defaults.
  }
}

export function loadLanguage(): Language {
  try {
    const raw = localStorage.getItem(LANGUAGE_KEY);
    if (raw === null) {
      LANGUAGE_MEM.current = DEFAULT_LANGUAGE;
      return DEFAULT_LANGUAGE;
    }
    if (isLanguage(raw)) {
      LANGUAGE_MEM.current = raw;
      return raw;
    }

    LANGUAGE_MEM.current = DEFAULT_LANGUAGE;
    return DEFAULT_LANGUAGE;
  } catch {
    // localStorage unavailable, fall back to the in-memory value.
  }

  return LANGUAGE_MEM.current;
}

export function saveLanguage(language: Language): void {
  LANGUAGE_MEM.current = language;

  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Ignore: the in-memory fallback is already set.
  }
}
