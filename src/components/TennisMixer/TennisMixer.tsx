import { useState, useEffect } from "react";
import { RefreshCw, RotateCcw, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { initState, computeNext, serverFor } from "../../lib/tennis";
import { loadState, saveState, pollSharedState, loadPlayerPool, savePlayerPool } from "../../lib/storage";
import type { GameState, SyncMode } from "../../lib/types";
import { Button } from "../ui/Button";
import { TeamCard } from "./TeamCard";
import { BenchDisplay } from "./BenchDisplay";
import { ChangeNotice } from "./ChangeNotice";
import { SyncBadge } from "./SyncBadge";
import { StatTable } from "./StatTable";
import { PartnerMatrix } from "./PartnerMatrix";
import { Splashscreen } from "./Splashscreen";

export function TennisMixer() {
  const [state, setState] = useState<GameState | null>(null);
  const [playerPool, setPlayerPool] = useState<string[]>([]);
  const [syncMode, setSyncMode] = useState<SyncMode>("local");
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Initiales Laden
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pool = loadPlayerPool();
      const { state: loaded, mode } = await loadState();

      if (!cancelled) {
        setPlayerPool(pool);
        setState(loaded); // null → show Splashscreen
        setSyncMode(mode);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Polling: Änderungen anderer Geräte übernehmen
  useEffect(() => {
    if (syncMode !== "shared") return;
    const id = setInterval(async () => {
      const remote = await pollSharedState();
      if (remote) {
        setState((local) =>
          remote.ts > (local?.ts ?? 0) ? remote : local,
        );
      }
    }, 2500);
    return () => clearInterval(id);
  }, [syncMode]);

  async function persist(newState: GameState) {
    const updated = { ...newState, ts: Date.now() };
    setState(updated);
    await saveState(updated, syncMode);
  }

  function nextChange() {
    if (!state) return;
    persist(computeNext(state));
  }

  function handleStart(orderedPlayers: string[]) {
    const newState = initState(orderedPlayers);
    persist(newState);
  }

  function handlePoolChange(pool: string[]) {
    setPlayerPool(pool);
    savePlayerPool(pool);
  }

  function reset() {
    if (syncMode === "shared" && !confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    setConfirmReset(false);
    setShowStats(false);
    try { localStorage.removeItem("tennis_state_v1"); } catch { /* ignore */ }
    setState(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-slate-950 text-slate-400">
        Lädt…
      </div>
    );
  }

  if (!state) {
    return (
      <Splashscreen
        pool={playerPool}
        onStart={handleStart}
        onPoolChange={handlePoolChange}
      />
    );
  }

  const players = Object.keys(state.playCount);
  const server = serverFor(state.round, state.home, state.guest);
  const incomingName = state.lastChange?.in;

  const statRows = players.map((p) => ({
    name: p,
    play: state.playCount[p] ?? 0,
    bench: state.benchCount[p] ?? 0,
    serve: state.serveCount[p] ?? 0,
  }));

  return (
    <div className="font-sans max-w-[480px] mx-auto px-4 py-4 bg-slate-950 min-h-dvh text-slate-50 box-border">
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-semibold tracking-wide my-1">
          🎾 Tennis-Mixer
        </h1>
        <div className="text-xs text-slate-400">Spiel {state.round}</div>
      </div>

      {/* Sync-Status */}
      <div className="mb-3">
        <SyncBadge mode={syncMode} />
      </div>

      {/* Wechsel-Benachrichtigung */}
      {state.lastChange && (
        <div className="mb-3.5">
          <ChangeNotice change={state.lastChange} />
        </div>
      )}

      {/* Teams */}
      <div className="flex gap-2.5 mb-2">
        <TeamCard
          title="HEIM"
          players={state.home}
          serverName={server.name}
          incomingName={incomingName}
        />
        <div className="flex items-center font-extrabold text-lg text-slate-500">
          VS
        </div>
        <TeamCard
          title="GAST"
          players={state.guest}
          serverName={server.name}
          incomingName={incomingName}
        />
      </div>

      {/* Aufschlag-Info */}
      <div className="text-center text-sm text-slate-400 mb-3">
        Aufschlag:{" "}
        <strong className="text-yellow-400">🎾 {server.name}</strong> (
        {server.team})
      </div>

      {/* Pause */}
      <div className="mb-4">
        <BenchDisplay player={state.bench} />
      </div>

      {/* Nächster Wechsel */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={nextChange}
        className="mb-3"
      >
        <RefreshCw size={24} /> Nächster Wechsel
      </Button>

      {/* Sekundäre Aktionen */}
      <div className="flex gap-2.5">
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => setShowStats((v) => !v)}
        >
          <BarChart3 size={18} /> Statistik{" "}
          {showStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
        <Button
          variant={confirmReset ? "danger" : "secondary"}
          size="md"
          fullWidth
          onClick={reset}
          className={confirmReset ? "bg-red-600 hover:bg-red-500" : ""}
        >
          <RotateCcw size={18} />{" "}
          {confirmReset ? "Für alle? Nochmal tippen" : "Reset"}
        </Button>
      </div>

      {/* Statistik-Panel */}
      {showStats && (
        <div className="mt-3.5 bg-slate-800 rounded-xl p-3.5 space-y-4">
          <StatTable rows={statRows} />
          <PartnerMatrix
            players={players}
            partnerCount={state.partnerCount}
          />
        </div>
      )}
    </div>
  );
}
