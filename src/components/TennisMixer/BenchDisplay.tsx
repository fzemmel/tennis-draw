import { getTranslations, type Language } from "../../lib/i18n";

interface BenchDisplayProps {
  players: string[];
  language: Language;
}

export function BenchDisplay({ players, language }: BenchDisplayProps) {
  const t = getTranslations(language);
  const [nextUp, ...waiting] = players;

  return (
    <div className="bg-slate-800 rounded-xl px-3.5 py-2.5 border border-dashed border-slate-600">
      <div className="text-xs font-bold tracking-widest text-slate-400 uppercase text-center mb-2">
        {t.bench.label}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <div className="flex items-center gap-1.5 bg-yellow-500/15 border border-yellow-500/40 rounded-lg px-2.5 py-1">
          <span className="text-[10px] font-bold text-yellow-400 tracking-wide uppercase">
            {t.bench.nextUp}
          </span>
          <span className="text-base font-bold text-slate-50">{nextUp}</span>
        </div>
        {waiting.map((player) => (
          <div
            key={player}
            className="flex items-center gap-1.5 bg-slate-700/60 border border-slate-600 rounded-lg px-2.5 py-1"
          >
            <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">
              {t.bench.waiting}
            </span>
            <span className="text-base font-semibold text-slate-300">{player}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
