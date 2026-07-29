import { getTranslations, type Language } from "../../lib/i18n";

interface BenchDisplayProps {
  player: string;
  language: Language;
}

export function BenchDisplay({ player, language }: BenchDisplayProps) {
  const t = getTranslations(language);

  return (
    <div className="bg-slate-800 rounded-xl px-3.5 py-2.5 text-center border border-dashed border-slate-600">
      <span className="text-sm text-slate-400">{t.bench.label} </span>
      <span className="text-lg font-bold">{player}</span>
    </div>
  );
}
