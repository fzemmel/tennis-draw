import { getTranslations, type Language } from "../../lib/i18n";

interface StatRow {
  name: string;
  play: number;
  bench: number;
  serve: number;
}

interface StatTableProps {
  rows: StatRow[];
  language: Language;
}

export function StatTable({ rows, language }: StatTableProps) {
  const t = getTranslations(language);

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">
        {t.statsPanel.tableTitle}
      </h3>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-slate-400">
            <th className="py-1">{t.statsPanel.columns.player}</th>
            <th className="text-center">{t.statsPanel.columns.play}</th>
            <th className="text-center">{t.statsPanel.columns.bench}</th>
            <th className="text-center">{t.statsPanel.columns.serve}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-slate-700">
              <td className="py-1.5 font-semibold">{r.name}</td>
              <td className="text-center">{r.play}</td>
              <td className="text-center">{r.bench}</td>
              <td className="text-center">{r.serve}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
