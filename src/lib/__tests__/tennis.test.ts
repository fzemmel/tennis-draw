import { describe, it, expect } from "vitest";
import {
  PLAYERS,
  pairKey,
  serverFor,
  initState,
  computeNext,
} from "../tennis";

// Five players used in game tests (PLAYERS is the 6-player default pool)
const FIVE = PLAYERS.slice(0, 5);

// ---------------------------------------------------------------------------
// pairKey
// ---------------------------------------------------------------------------
describe("pairKey", () => {
  it("sorts names alphabetically", () => {
    expect(pairKey("Nic", "Alex")).toBe("Alex|Nic");
  });

  it("is symmetric", () => {
    expect(pairKey("A", "B")).toBe(pairKey("B", "A"));
  });

  it("returns a stable key for identical names", () => {
    expect(pairKey("X", "X")).toBe("X|X");
  });
});

// ---------------------------------------------------------------------------
// serverFor
// ---------------------------------------------------------------------------
describe("serverFor", () => {
  const home: [string, string] = ["H1", "H2"];
  const guest: [string, string] = ["G1", "G2"];

  it("round 1 — HOME, first player", () => {
    const srv = serverFor(1, home, guest);
    expect(srv).toEqual({ name: "H1", team: "HEIM" });
  });

  it("round 2 — GUEST, first player", () => {
    const srv = serverFor(2, home, guest);
    expect(srv).toEqual({ name: "G1", team: "GAST" });
  });

  it("round 3 — HOME, second player", () => {
    const srv = serverFor(3, home, guest);
    expect(srv).toEqual({ name: "H2", team: "HEIM" });
  });

  it("round 4 — GUEST, second player", () => {
    const srv = serverFor(4, home, guest);
    expect(srv).toEqual({ name: "G2", team: "GAST" });
  });

  it("round 5 wraps back to HOME, first player", () => {
    const srv = serverFor(5, home, guest);
    expect(srv).toEqual({ name: "H1", team: "HEIM" });
  });

  it("round 6 wraps back to GUEST, first player", () => {
    const srv = serverFor(6, home, guest);
    expect(srv).toEqual({ name: "G1", team: "GAST" });
  });
});

// ---------------------------------------------------------------------------
// initState
// ---------------------------------------------------------------------------
describe("initState", () => {
  it("PLAYERS default pool has 6 entries", () => {
    expect(PLAYERS).toHaveLength(6);
  });

  it("throws when fewer than 5 players are passed", () => {
    expect(() => initState(["A", "B", "C"])).toThrow(
      "initState requires at least 5 players, got 3",
    );
  });

  it("puts exactly 4 players on court and 1 on the bench", () => {
    const state = initState(FIVE);
    const onCourt = new Set([...state.home, ...state.guest]);
    expect(onCourt.size).toBe(4);
    expect(state.bench).toBeTruthy();
    expect(onCourt.has(state.bench)).toBe(false);
  });

  it("the last player in the input array starts on the bench", () => {
    const ordered = ["A", "B", "C", "D", "E"];
    const state = initState(ordered);
    expect(state.bench).toBe("E");
  });

  it("includes all 5 players in playCount and benchCount", () => {
    const state = initState(FIVE);
    FIVE.forEach((p) => {
      expect(p in state.playCount).toBe(true);
      expect(p in state.benchCount).toBe(true);
    });
  });

  it("playCount sums to 4 (all court players)", () => {
    const state = initState(FIVE);
    const total = Object.values(state.playCount).reduce((a, b) => a + b, 0);
    expect(total).toBe(4);
  });

  it("benchCount of the bench player is 1, rest are 0", () => {
    const state = initState(FIVE);
    const benchPlayer = state.bench;
    expect(state.benchCount[benchPlayer]).toBe(1);
    FIVE.filter((p) => p !== benchPlayer).forEach((p) => {
      expect(state.benchCount[p]).toBe(0);
    });
  });

  it("starts at round 1", () => {
    const state = initState(FIVE);
    expect(state.round).toBe(1);
  });

  it("lastIn is null", () => {
    const state = initState(FIVE);
    expect(state.lastIn).toBeNull();
  });

  it("serveCount contains exactly one server", () => {
    const state = initState(FIVE);
    const total = Object.values(state.serveCount).reduce((a, b) => a + b, 0);
    expect(total).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// computeNext
// ---------------------------------------------------------------------------
describe("computeNext", () => {
  it("returns a new state without mutating the original", () => {
    const s1 = initState(FIVE);
    const benchBefore = s1.bench;
    const s2 = computeNext(s1);
    expect(s1.bench).toBe(benchBefore); // no mutation
    expect(s2).not.toBe(s1);
  });

  it("the former bench player is now on court", () => {
    const s1 = initState(FIVE);
    const formerBench = s1.bench;
    const s2 = computeNext(s1);
    const onCourt = new Set([...s2.home, ...s2.guest]);
    expect(onCourt.has(formerBench)).toBe(true);
  });

  it("the new bench player was previously on court", () => {
    const s1 = initState(FIVE);
    const courtBefore = new Set([...s1.home, ...s1.guest]);
    const s2 = computeNext(s1);
    expect(courtBefore.has(s2.bench)).toBe(true);
  });

  it("increments round by 1", () => {
    const s1 = initState(FIVE);
    const s2 = computeNext(s1);
    expect(s2.round).toBe(s1.round + 1);
  });

  it("lastIn points to the newly substituted-in player", () => {
    const s1 = initState(FIVE);
    const incoming = s1.bench;
    const s2 = computeNext(s1);
    expect(s2.lastIn).toBe(incoming);
  });

  it("lastIn guard: the most recently substituted player is not immediately sent back to the bench", () => {
    const s1 = initState(FIVE);
    const s2 = computeNext(s1);
    const lastIn = s2.lastIn!;
    const s3 = computeNext(s2);
    // lastIn must not become the new bench player unless there is no other choice
    const courtPlayers = [...s2.home, ...s2.guest];
    const candidates = courtPlayers.filter((p) => p !== lastIn);
    if (candidates.length > 0) {
      expect(s3.bench).not.toBe(lastIn);
    }
  });

  it("increments playCount of the incoming player by 1", () => {
    const s1 = initState(FIVE);
    const incoming = s1.bench;
    const s2 = computeNext(s1);
    expect(s2.playCount[incoming]).toBe(s1.playCount[incoming] + 1);
  });

  it("increments benchCount of the substituted-out player by 1", () => {
    const s1 = initState(FIVE);
    const s2 = computeNext(s1);
    const outPlayer = s2.bench;
    expect(s2.benchCount[outPlayer]).toBe(s1.benchCount[outPlayer] + 1);
  });

  it("lastChange contains the correct substitution information", () => {
    const s1 = initState(FIVE);
    const incoming = s1.bench;
    const s2 = computeNext(s1);
    expect(s2.lastChange).not.toBeNull();
    expect(s2.lastChange!.in).toBe(incoming);
    expect(s2.lastChange!.out).toBe(s2.bench);
    expect(["HEIM", "GAST"]).toContain(s2.lastChange!.team);
  });

  it("partnerCount of the new team pair is updated after the substitution", () => {
    const s1 = initState(FIVE);
    const s2 = computeNext(s1);
    const incoming = s2.lastIn!;
    const partner = [...s2.home, ...s2.guest].find(
      (p, _, arr) => arr.includes(incoming) && p !== incoming && (s2.home.includes(incoming) ? s2.home.includes(p) : s2.guest.includes(p)),
    );
    if (partner) {
      const key = pairKey(incoming, partner);
      expect(s2.partnerCount[key]).toBeGreaterThan(0);
    }
  });

  it("does not throw over 20 consecutive substitutions", () => {
    let state = initState(FIVE);
    expect(() => {
      for (let i = 0; i < 20; i++) {
        state = computeNext(state);
      }
    }).not.toThrow();
  });

  it("serveCount is correctly updated after each substitution", () => {
    const s1 = initState(FIVE);
    const s2 = computeNext(s1);
    const totalServes = Object.values(s2.serveCount).reduce((a, b) => a + b, 0);
    expect(totalServes).toBe(2);
  });
});
