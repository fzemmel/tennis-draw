import { describe, it, expect, beforeEach, vi } from "vitest";
import type { GameState } from "../types";

// ---------------------------------------------------------------------------
// Helper: minimal valid GameState
// ---------------------------------------------------------------------------
function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    home: ["A", "B"],
    guest: ["C", "D"],
    bench: "E",
    playCount: { A: 1, B: 1, C: 1, D: 1, E: 0 },
    benchCount: { A: 0, B: 0, C: 0, D: 0, E: 1 },
    serveCount: { A: 1, B: 0, C: 0, D: 0, E: 0 },
    partnerCount: { "A|B": 1, "C|D": 1 },
    opponentCount: { "A|C": 1, "A|D": 1, "B|C": 1, "B|D": 1 },
    round: 1,
    lastIn: null,
    lastChange: null,
    ts: 1000,
    ...overrides,
  };
}

const STORAGE_KEY = "tennis_state_v1";

// ---------------------------------------------------------------------------
// loadState
// ---------------------------------------------------------------------------
describe("loadState", () => {
  beforeEach(() => {
    vi.resetModules();
    // reset localStorage
    localStorage.clear();
    // remove window.storage
    delete window.storage;
  });

  it("returns { state: null, mode: 'local' } when nothing is stored", async () => {
    const { loadState } = await import("../storage");
    const result = await loadState();
    expect(result).toEqual({ state: null, mode: "local" });
  });

  it("reads state from localStorage", async () => {
    const state = makeState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const { loadState } = await import("../storage");
    const result = await loadState();
    expect(result.mode).toBe("local");
    expect(result.state?.round).toBe(1);
  });

  it("prefers window.storage and returns mode='shared'", async () => {
    const state = makeState({ round: 5 });
    window.storage = {
      get: vi.fn().mockResolvedValue({ value: JSON.stringify(state) }),
      set: vi.fn().mockResolvedValue(undefined),
    };
    const { loadState } = await import("../storage");
    const result = await loadState();
    expect(result.mode).toBe("shared");
    expect(result.state?.round).toBe(5);
  });

  it("falls back to localStorage when window.storage throws", async () => {
    const state = makeState({ round: 3 });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.storage = {
      get: vi.fn().mockRejectedValue(new Error("Storage error")),
      set: vi.fn().mockResolvedValue(undefined),
    };
    const { loadState } = await import("../storage");
    const result = await loadState();
    expect(result.mode).toBe("local");
    expect(result.state?.round).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// saveState
// ---------------------------------------------------------------------------
describe("saveState", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    delete window.storage;
  });

  it("saves to localStorage when mode='local'", async () => {
    const state = makeState({ round: 7 });
    const { saveState } = await import("../storage");
    await saveState(state, "local");
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).round).toBe(7);
  });

  it("calls window.storage.set when mode='shared'", async () => {
    const state = makeState({ round: 2 });
    const mockSet = vi.fn().mockResolvedValue(undefined);
    window.storage = {
      get: vi.fn().mockResolvedValue(null),
      set: mockSet,
    };
    const { saveState } = await import("../storage");
    await saveState(state, "shared");
    expect(mockSet).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(state),
      true,
    );
  });

  it("falls back to localStorage when mode='shared' and window.storage throws", async () => {
    const state = makeState({ round: 9 });
    window.storage = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockRejectedValue(new Error("Write error")),
    };
    const { saveState } = await import("../storage");
    await saveState(state, "shared");
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(raw!).round).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// pollSharedState
// ---------------------------------------------------------------------------
describe("pollSharedState", () => {
  beforeEach(() => {
    vi.resetModules();
    delete window.storage;
  });

  it("returns null when window.storage is not available", async () => {
    const { pollSharedState } = await import("../storage");
    const result = await pollSharedState();
    expect(result).toBeNull();
  });

  it("returns the state from window.storage", async () => {
    const state = makeState({ round: 4 });
    window.storage = {
      get: vi.fn().mockResolvedValue({ value: JSON.stringify(state) }),
      set: vi.fn().mockResolvedValue(undefined),
    };
    const { pollSharedState } = await import("../storage");
    const result = await pollSharedState();
    expect(result?.round).toBe(4);
  });

  it("returns null when window.storage throws", async () => {
    window.storage = {
      get: vi.fn().mockRejectedValue(new Error("Network error")),
      set: vi.fn().mockResolvedValue(undefined),
    };
    const { pollSharedState } = await import("../storage");
    const result = await pollSharedState();
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// loadPlayerPool / savePlayerPool
// ---------------------------------------------------------------------------
describe("loadPlayerPool", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    delete window.storage;
  });

  it("returns the default PLAYERS pool when nothing is stored", async () => {
    const { loadPlayerPool } = await import("../storage");
    const { PLAYERS } = await import("../tennis");
    const pool = loadPlayerPool();
    expect(pool).toEqual([...PLAYERS]);
  });

  it("returns the saved pool from localStorage", async () => {
    const customPool = ["Alice", "Bob", "Carol", "Dave", "Eve"];
    localStorage.setItem("tennis_pool_v1", JSON.stringify(customPool));
    const { loadPlayerPool } = await import("../storage");
    expect(loadPlayerPool()).toEqual(customPool);
  });

  it("falls back to the default pool when localStorage contains invalid JSON", async () => {
    localStorage.setItem("tennis_pool_v1", "not-json");
    const { loadPlayerPool } = await import("../storage");
    const { PLAYERS } = await import("../tennis");
    expect(loadPlayerPool()).toEqual([...PLAYERS]);
  });
});

describe("savePlayerPool", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    delete window.storage;
  });

  it("persists the pool to localStorage", async () => {
    const pool = ["Alice", "Bob", "Carol", "Dave", "Eve"];
    const { savePlayerPool } = await import("../storage");
    savePlayerPool(pool);
    expect(JSON.parse(localStorage.getItem("tennis_pool_v1")!)).toEqual(pool);
  });

  it("round-trips correctly via loadPlayerPool", async () => {
    const pool = ["X1", "X2", "X3", "X4", "X5", "X6"];
    const { savePlayerPool, loadPlayerPool } = await import("../storage");
    savePlayerPool(pool);
    expect(loadPlayerPool()).toEqual(pool);
  });
});
