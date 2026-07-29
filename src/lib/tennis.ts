import type { GameState, ChangeEvent, ServerInfo } from "./types";

export const PLAYERS = ["Teja", "Nic", "Benni", "Alex", "Andre", "Fidschi"];

export function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

/** Aufschläger nach Tennis-Doppelregel – rotiert reihum durch alle vier Plätze. */
export function serverFor(
  round: number,
  home: [string, string],
  guest: [string, string],
): ServerInfo {
  const g = round - 1;
  if (g % 2 === 0) {
    const k = Math.floor(g / 2) % 2;
    return { name: home[k], team: "HEIM" };
  }
  const k = Math.floor((g - 1) / 2) % 2;
  return { name: guest[k], team: "GAST" };
}

function recordCurrent(
  s: GameState,
): Pick<GameState, "partnerCount" | "opponentCount"> {
  const partner = { ...s.partnerCount };
  const opponent = { ...s.opponentCount };

  [s.home, s.guest].forEach((t) => {
    const k = pairKey(t[0], t[1]);
    partner[k] = (partner[k] || 0) + 1;
  });

  s.home.forEach((h) =>
    s.guest.forEach((g) => {
      const k = pairKey(h, g);
      opponent[k] = (opponent[k] || 0) + 1;
    }),
  );

  return { partnerCount: partner, opponentCount: opponent };
}

export function initState(players: readonly string[]): GameState {
  if (players.length < 5) {
    throw new Error(`initState requires at least 5 players, got ${players.length}`);
  }
  const [p0, p1, p2, p3, ...benchPlayers] = players;
  const home: [string, string] = [p0, p1];
  const guest: [string, string] = [p2, p3];

  const playCount: Record<string, number> = {};
  const benchCount: Record<string, number> = {};
  const serveCount: Record<string, number> = {};

  players.forEach((p) => {
    playCount[p] = 0;
    benchCount[p] = 0;
    serveCount[p] = 0;
  });

  [p0, p1, p2, p3].forEach((p) => {
    playCount[p] = 1;
  });
  benchPlayers.forEach((p) => {
    benchCount[p] = 1;
  });

  const partnerCount: Record<string, number> = {
    [pairKey(home[0], home[1])]: 1,
    [pairKey(guest[0], guest[1])]: 1,
  };

  const opponentCount: Record<string, number> = {};
  home.forEach((h) =>
    guest.forEach((g) => {
      opponentCount[pairKey(h, g)] = (opponentCount[pairKey(h, g)] || 0) + 1;
    }),
  );

  const srv = serverFor(1, home, guest);
  serveCount[srv.name] = 1;

  return {
    home,
    guest,
    bench: benchPlayers,
    playCount,
    benchCount,
    serveCount,
    partnerCount,
    opponentCount,
    round: 1,
    lastIn: null,
    lastChanges: [],
    ts: Date.now(),
  };
}

/** Performs a single substitution (bench[0] in, one court player out) without touching round or serve. */
function performSingleSub(
  s: GameState,
): { state: GameState; change: ChangeEvent } {
  const incoming = s.bench[0];
  const court = [...s.home, ...s.guest];
  let candidates = court.filter((p) => p !== s.lastIn);
  if (candidates.length === 0) candidates = court;

  const minBench = Math.min(...candidates.map((p) => s.benchCount[p] || 0));
  candidates = candidates.filter((p) => (s.benchCount[p] || 0) === minBench);

  let best: {
    out: string;
    newHome: [string, string];
    newGuest: [string, string];
    score: number;
  } | null = null;

  candidates.forEach((out) => {
    const newHome = s.home.map((p) =>
      p === out ? incoming : p,
    ) as [string, string];
    const newGuest = s.guest.map((p) =>
      p === out ? incoming : p,
    ) as [string, string];
    const inHome = newHome.includes(incoming);
    const partnerOf = (inHome ? newHome : newGuest).find((p) => p !== incoming)!;
    const oppTeam = inHome ? newGuest : newHome;
    const partnerFresh = s.partnerCount[pairKey(incoming, partnerOf)] || 0;
    const oppFresh = oppTeam.reduce(
      (sum, g) => sum + (s.opponentCount[pairKey(incoming, g)] || 0),
      0,
    );
    const score = partnerFresh * 3 + oppFresh + Math.random() * 0.5;
    if (!best || score < best.score)
      best = { out, newHome, newGuest, score };
  });

  if (!best) throw new Error("No valid candidates found");

  const { out, newHome, newGuest } = best as {
    out: string;
    newHome: [string, string];
    newGuest: [string, string];
    score: number;
  };

  const playCount = { ...s.playCount };
  const benchCount = { ...s.benchCount };
  playCount[incoming] = (playCount[incoming] || 0) + 1;
  benchCount[out] = (benchCount[out] || 0) + 1;

  const newBench = [...s.bench.slice(1), out];

  const team = newHome.includes(incoming) ? "HEIM" : "GAST";
  const change: ChangeEvent = { in: incoming, out, team };

  const ns: GameState = {
    ...s,
    home: newHome,
    guest: newGuest,
    bench: newBench,
    playCount,
    benchCount,
    lastIn: incoming,
    lastChanges: [],
  };

  return { state: ns, change };
}

/** Berechnet den nächsten optimalen Wechsel, ohne den State zu mutieren.
 *  Mit mehreren Bankspielern (≥ 2) werden alle gleichzeitig eingewechselt. */
export function computeNext(s: GameState): GameState {
  const swapCount = s.bench.length;
  const changes: ChangeEvent[] = [];

  // Chain single swaps — one per bench player
  let cur = s;
  for (let i = 0; i < swapCount; i++) {
    const { state, change } = performSingleSub(cur);
    changes.push(change);
    cur = state;
  }

  // Record pairings for the final court lineup once
  const { partnerCount, opponentCount } = recordCurrent(cur);

  // Increment round once per computeNext call regardless of swap count
  const newRound = s.round + 1;
  const serveCount = { ...cur.serveCount };
  const srv = serverFor(newRound, cur.home, cur.guest);
  serveCount[srv.name] = (serveCount[srv.name] || 0) + 1;

  return {
    ...cur,
    round: newRound,
    partnerCount,
    opponentCount,
    serveCount,
    ts: s.ts,
    lastChanges: changes,
  };
}
