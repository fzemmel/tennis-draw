import { useState, useEffect } from "react";
import { RefreshCw, RotateCcw, BarChart3, ChevronDown, ChevronUp, Wifi, WifiOff } from "lucide-react";

const PLAYERS = ["Fidschi", "Nic", "Alex", "Benni", "Teja"];
const KEY = "tennis_state_v1";

// In-memory Fallback (Vorschau vor dem Veröffentlichen)
const MEM = { current: null };

function pairKey(a, b) {
  return [a, b].sort().join("|");
}

// ---- Aufschläger nach Tennis-Doppelregel ----
function serverFor(round, home, guest) {
  const g = round - 1;
  if (g % 2 === 0) {
    const k = Math.floor(g / 2) % 2;
    return { name: home[k], team: "HEIM" };
  }
  const k = Math.floor((g - 1) / 2) % 2;
  return { name: guest[k], team: "GAST" };
}

function recordCurrent(s) {
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
    })
  );
  return { partner, opponent };
}

function initState(pl) {
  const shuffled = [...pl].sort(() => Math.random() - 0.5);
  const bench = shuffled[4];
  const onCourt = shuffled.slice(0, 4);
  const home = [onCourt[0], onCourt[1]];
  const guest = [onCourt[2], onCourt[3]];

  const playCount = {};
  const benchCount = {};
  const serveCount = {};
  pl.forEach((p) => {
    playCount[p] = 0;
    benchCount[p] = 0;
    serveCount[p] = 0;
  });
  onCourt.forEach((p) => (playCount[p] = 1));
  benchCount[bench] = 1;

  const partnerCount = {};
  const opponentCount = {};
  partnerCount[pairKey(home[0], home[1])] = 1;
  partnerCount[pairKey(guest[0], guest[1])] = 1;
  home.forEach((h) =>
    guest.forEach((g) => {
      opponentCount[pairKey(h, g)] = (opponentCount[pairKey(h, g)] || 0) + 1;
    })
  );

  const srv = serverFor(1, home, guest);
  serveCount[srv.name] = 1;

  return {
    home,
    guest,
    bench,
    playCount,
    benchCount,
    serveCount,
    partnerCount,
    opponentCount,
    round: 1,
    lastIn: null,
    lastChange: null,
    ts: Date.now(),
  };
}

// Reine Berechnung des nächsten Wechsels
function computeNext(s) {
  const incoming = s.bench;
  const court = [...s.home, ...s.guest];
  let candidates = court.filter((p) => p !== s.lastIn);
  if (candidates.length === 0) candidates = court;

  const minBench = Math.min(...candidates.map((p) => s.benchCount[p] || 0));
  candidates = candidates.filter((p) => (s.benchCount[p] || 0) === minBench);

  let best = null;
  candidates.forEach((out) => {
    const newHome = s.home.map((p) => (p === out ? incoming : p));
    const newGuest = s.guest.map((p) => (p === out ? incoming : p));
    const inHome = newHome.includes(incoming);
    const partnerOf = (inHome ? newHome : newGuest).find((p) => p !== incoming);
    const oppTeam = inHome ? newGuest : newHome;
    const partnerFresh = s.partnerCount[pairKey(incoming, partnerOf)] || 0;
    const oppFresh = oppTeam.reduce(
      (sum, g) => sum + (s.opponentCount[pairKey(incoming, g)] || 0),
      0
    );
    const score = partnerFresh * 3 + oppFresh + Math.random() * 0.5;
    if (!best || score < best.score) best = { out, newHome, newGuest, score };
  });

  const out = best.out;
  const playCount = { ...s.playCount };
  const benchCount = { ...s.benchCount };
  playCount[incoming] = (playCount[incoming] || 0) + 1;
  benchCount[out] = (benchCount[out] || 0) + 1;

  const ns = {
    ...s,
    home: best.newHome,
    guest: best.newGuest,
    bench: out,
    playCount,
    benchCount,
    round: s.round + 1,
    lastIn: incoming,
  };
  const { partner, opponent } = recordCurrent(ns);
  ns.partnerCount = partner;
  ns.opponentCount = opponent;

  const serveCount = { ...s.serveCount };
  const srv = serverFor(ns.round, ns.home, ns.guest);
  serveCount[srv.name] = (serveCount[srv.name] || 0) + 1;
  ns.serveCount = serveCount;

  const team = best.newHome.includes(incoming) ? "HEIM" : "GAST";
  ns.lastChange = { in: incoming, out, team };
  return ns;
}

export default function TennisMixer() {
  const [state, setState] = useState(null);
  const [syncMode, setSyncMode] = useState("local"); // 'shared' | 'local'
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // ---- Initiales Laden ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let loaded = null;
      let mode = "local";
      const hasStore = typeof window !== "undefined" && window.storage;

      if (hasStore) {
        try {
          const r = await window.storage.get(KEY, true);
          if (r && r.value) {
            loaded = JSON.parse(r.value);
            mode = "shared";
          }
        } catch (e) {
          /* Schlüssel fehlt oder Storage noch nicht verfügbar */
        }
        if (!loaded) {
          const fresh = initState(PLAYERS);
          try {
            await window.storage.set(KEY, JSON.stringify(fresh), true);
            loaded = fresh;
            mode = "shared";
          } catch (e) {
            loaded = fresh;
            mode = "local";
          }
        }
      } else {
        loaded = MEM.current || initState(PLAYERS);
      }

      if (!cancelled) {
        MEM.current = loaded;
        setState(loaded);
        setSyncMode(mode);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Polling: Änderungen anderer Handys übernehmen ----
  useEffect(() => {
    if (syncMode !== "shared") return;
    const id = setInterval(async () => {
      try {
        const r = await window.storage.get(KEY, true);
        if (r && r.value) {
          const remote = JSON.parse(r.value);
          setState((local) => (remote.ts > (local?.ts || 0) ? remote : local));
        }
      } catch (e) {
        /* ignore */
      }
    }, 2500);
    return () => clearInterval(id);
  }, [syncMode]);

  async function persist(newState) {
    newState.ts = Date.now();
    MEM.current = newState;
    setState(newState);
    if (typeof window !== "undefined" && window.storage) {
      try {
        await window.storage.set(KEY, JSON.stringify(newState), syncMode === "shared");
      } catch (e) {
        /* ignore */
      }
    }
  }

  function nextChange() {
    if (!state) return;
    persist(computeNext(state));
  }

  function reset() {
    if (syncMode === "shared" && !confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    setConfirmReset(false);
    setShowStats(false);
    persist(initState(PLAYERS));
  }

  if (loading || !state) {
    return (
      <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#94a3b8" }}>Lädt…</div>
      </div>
    );
  }

  const server = serverFor(state.round, state.home, state.guest);
  const incomingName = state.lastChange?.in;

  const statRows = PLAYERS.map((p) => ({
    name: p,
    play: state.playCount[p] || 0,
    bench: state.benchCount[p] || 0,
    serve: state.serveCount[p] || 0,
  }));

  const matrix = {};
  PLAYERS.forEach((a) => {
    matrix[a] = {};
    PLAYERS.forEach((b) => {
      if (a !== b) matrix[a][b] = state.partnerCount[pairKey(a, b)] || 0;
    });
  });

  return (
    <div style={wrap}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, margin: "4px 0", letterSpacing: 0.5 }}>🎾 Tennis-Mixer</h1>
        <div style={{ fontSize: 13, color: "#94a3b8" }}>Spiel {state.round}</div>
      </div>

      {/* Sync-Status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontSize: 12,
          marginBottom: 12,
          color: syncMode === "shared" ? "#4ade80" : "#f59e0b",
        }}
      >
        {syncMode === "shared" ? <Wifi size={14} /> : <WifiOff size={14} />}
        {syncMode === "shared"
          ? "Synchron auf allen Handys"
          : "Nur lokal – synchron erst nach dem Veröffentlichen"}
      </div>

      {state.lastChange && (
        <div
          style={{
            background: "#0284c7",
            color: "#fff",
            borderRadius: 12,
            padding: "10px 14px",
            textAlign: "center",
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 14,
          }}
        >
          🔄 {state.lastChange.in} kommt rein für {state.lastChange.out} ({state.lastChange.team})
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <TeamCard title="HEIM" color="#3b82f6" players={state.home} serverName={server.name} incomingName={incomingName} />
        <div style={{ display: "flex", alignItems: "center", fontWeight: 800, fontSize: 18, color: "#64748b" }}>
          VS
        </div>
        <TeamCard title="GAST" color="#ef4444" players={state.guest} serverName={server.name} incomingName={incomingName} />
      </div>

      <div style={{ textAlign: "center", fontSize: 13, color: "#cbd5e1", marginBottom: 12 }}>
        Aufschlag: <strong style={{ color: "#facc15" }}>🎾 {server.name}</strong> ({server.team})
      </div>

      <div
        style={{
          background: "#1e293b",
          borderRadius: 12,
          padding: "10px 14px",
          textAlign: "center",
          marginBottom: 16,
          border: "1px dashed #475569",
        }}
      >
        <span style={{ fontSize: 13, color: "#94a3b8" }}>PAUSE ☕ </span>
        <span style={{ fontSize: 18, fontWeight: 700 }}>{state.bench}</span>
      </div>

      <button
        onClick={nextChange}
        style={{
          width: "100%",
          background: "#22c55e",
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "18px",
          fontSize: 20,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(34,197,94,0.4)",
          marginBottom: 12,
        }}
      >
        <RefreshCw size={24} /> Nächster Wechsel
      </button>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setShowStats((v) => !v)} style={smallBtn("#334155")}>
          <BarChart3 size={18} /> Statistik {showStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <button onClick={reset} style={smallBtn(confirmReset ? "#dc2626" : "#7f1d1d")}>
          <RotateCcw size={18} /> {confirmReset ? "Für alle? Nochmal tippen" : "Reset"}
        </button>
      </div>

      {showStats && (
        <div style={{ marginTop: 14, background: "#1e293b", borderRadius: 12, padding: 14 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>Einsätze, Pausen & Aufschläge</h3>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#94a3b8", textAlign: "left" }}>
                <th style={{ padding: "4px 0" }}>Spieler</th>
                <th style={{ textAlign: "center" }}>Gespielt</th>
                <th style={{ textAlign: "center" }}>Pausiert</th>
                <th style={{ textAlign: "center" }}>🎾 Aufschlag</th>
              </tr>
            </thead>
            <tbody>
              {statRows.map((r) => (
                <tr key={r.name} style={{ borderTop: "1px solid #334155" }}>
                  <td style={{ padding: "6px 0", fontWeight: 600 }}>{r.name}</td>
                  <td style={{ textAlign: "center" }}>{r.play}</td>
                  <td style={{ textAlign: "center" }}>{r.bench}</td>
                  <td style={{ textAlign: "center" }}>{r.serve}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ margin: "16px 0 8px", fontSize: 15 }}>Wie oft zusammen im Team</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ fontSize: 12, borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr style={{ color: "#94a3b8" }}>
                  <th></th>
                  {PLAYERS.map((p) => (
                    <th key={p} style={{ padding: 4, fontWeight: 600 }}>
                      {p.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAYERS.map((a) => (
                  <tr key={a} style={{ borderTop: "1px solid #334155" }}>
                    <td style={{ padding: 4, color: "#94a3b8", fontWeight: 600 }}>{a.slice(0, 3)}</td>
                    {PLAYERS.map((b) => (
                      <td
                        key={b}
                        style={{
                          padding: 4,
                          textAlign: "center",
                          color: a === b ? "#475569" : matrix[a][b] === 0 ? "#64748b" : "#f8fafc",
                          background: a !== b && matrix[a][b] > 0 ? "rgba(34,197,94,0.15)" : "transparent",
                        }}
                      >
                        {a === b ? "–" : matrix[a][b]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>
            Aufschlag rotiert nach Doppelregel reihum durch alle vier Plätze. Pausen &
            Auswechslungen sind über alle Spieler ausgeglichen.
          </p>
        </div>
      )}
    </div>
  );
}

const wrap = {
  fontFamily: "system-ui, sans-serif",
  maxWidth: 480,
  margin: "0 auto",
  padding: 16,
  background: "#0f172a",
  minHeight: "100vh",
  color: "#f8fafc",
  boxSizing: "border-box",
};

function TeamCard({ title, color, players, serverName, incomingName }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#1e293b",
        borderRadius: 14,
        padding: "12px 8px",
        textAlign: "center",
        borderTop: `4px solid ${color}`,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: 1, marginBottom: 8 }}>{title}</div>
      {players.map((p) => {
        const isServer = p === serverName;
        const isNew = p === incomingName;
        return (
          <div
            key={p}
            style={{
              fontSize: 18,
              fontWeight: 700,
              padding: "8px 4px",
              margin: "4px 0",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: isServer ? "#facc15" : "rgba(255,255,255,0.04)",
              color: isServer ? "#0f172a" : "#f8fafc",
              border: isServer ? "1px solid #eab308" : "1px solid transparent",
            }}
          >
            <span>
              {isServer ? "🎾 " : ""}
              {p}
            </span>
            {isNew && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  background: isServer ? "#0f172a" : "#22c55e",
                  color: "#fff",
                  borderRadius: 6,
                  padding: "1px 5px",
                  letterSpacing: 0.5,
                }}
              >
                NEU
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function smallBtn(bg) {
  return {
    flex: 1,
    background: bg,
    color: "#f8fafc",
    border: "none",
    borderRadius: 12,
    padding: "12px",
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    cursor: "pointer",
  };
}