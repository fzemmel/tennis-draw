import { useState, useRef } from "react";
import { GripVertical, Plus, X } from "lucide-react";
import { Button } from "../ui/Button";
import { PLAYERS } from "../../lib/tennis";

interface SplashscreenProps {
  pool: string[];
  onStart: (orderedPlayers: string[]) => void;
  onPoolChange: (pool: string[]) => void;
}

export function Splashscreen({ pool, onStart, onPoolChange }: SplashscreenProps) {
  const [selected, setSelected] = useState<string[]>(pool.slice(0, 5));
  const [customInput, setCustomInput] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  function togglePlayer(name: string) {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((p) => p !== name);
      return [...prev, name];
    });
  }

  function addCustomPlayer() {
    const name = customInput.trim();
    if (!name || pool.includes(name)) return;
    const newPool = [...pool, name];
    onPoolChange(newPool);
    setSelected((prev) => [...prev, name]);
    setCustomInput("");
  }

  function removeFromPool(name: string) {
    const newPool = pool.filter((p) => p !== name);
    onPoolChange(newPool);
    setSelected((prev) => prev.filter((p) => p !== name));
  }

  // --- drag & drop reorder ---
  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    dragOverIndex.current = index;
  }

  function handleDrop() {
    if (dragIndex === null || dragOverIndex.current === null) return;
    if (dragIndex === dragOverIndex.current) return;
    const reordered = [...selected];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dragOverIndex.current, 0, moved);
    setSelected(reordered);
    setDragIndex(null);
    dragOverIndex.current = null;
  }

  function handleDragEnd() {
    setDragIndex(null);
    dragOverIndex.current = null;
  }

  const canStart = selected.length === 5;

  // Players in the pool that are not default (custom)
  const customPlayers = pool.filter((p) => !PLAYERS.includes(p));

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-2">🎾</div>
          <h1 className="text-2xl font-bold text-slate-50">Tennis-Mixer</h1>
          <p className="text-slate-400 text-sm mt-1">Who is playing today?</p>
        </div>

        {/* Player pool */}
        <div>
          <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">
            Select players
          </div>
          <div className="flex flex-wrap gap-2">
            {pool.map((name) => {
              const isSelected = selected.includes(name);
              const isCustom = customPlayers.includes(name);
              return (
                <div key={name} className="relative group">
                  <button
                    onClick={() => togglePlayer(name)}
                    className={[
                      "px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors border",
                      isSelected
                        ? "bg-green-500 text-white border-green-400"
                        : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600",
                    ].join(" ")}
                  >
                    {name}
                  </button>
                  {isCustom && (
                    <button
                      onClick={() => removeFromPool(name)}
                      className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white"
                      aria-label={`Remove ${name}`}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add custom player */}
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomPlayer()}
              placeholder="Add player…"
              maxLength={20}
              className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-slate-400"
            />
            <Button
              size="sm"
              onClick={addCustomPlayer}
              disabled={!customInput.trim() || pool.includes(customInput.trim())}
              aria-label="Add player"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* Ordered lineup */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Lineup
            </div>
            <div
              className={[
                "text-xs font-semibold",
                canStart ? "text-green-400" : "text-yellow-400",
              ].join(" ")}
            >
              {selected.length}/5 selected
            </div>
          </div>

          {selected.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">
              Select 5 players above.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {selected.map((name, index) => {
                const isBench = index === selected.length - 1 && selected.length === 5;
                const isDragging = dragIndex === index;
                return (
                  <div
                    key={name}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    className={[
                      "flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2.5 border transition-opacity",
                      isBench ? "border-yellow-500/50" : "border-slate-700",
                      isDragging ? "opacity-40" : "opacity-100",
                    ].join(" ")}
                  >
                    <GripVertical size={16} className="text-slate-500 shrink-0 cursor-grab active:cursor-grabbing" />
                    <span className="flex-1 text-slate-100 font-semibold text-sm">
                      {name}
                    </span>
                    {isBench && (
                      <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded-md px-1.5 py-0.5 tracking-wide">
                        BANK
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selected.length > 5 && (
            <p className="text-yellow-400 text-xs mt-2 text-center">
              Please select exactly 5 players ({selected.length} selected).
            </p>
          )}
          {selected.length < 5 && selected.length > 0 && (
            <p className="text-yellow-400 text-xs mt-2 text-center">
              {5 - selected.length} more player{5 - selected.length === 1 ? "" : "s"} needed.
            </p>
          )}
        </div>

        {/* Start button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canStart}
          onClick={() => canStart && onStart(selected)}
        >
          Start game →
        </Button>
      </div>
    </div>
  );
}
