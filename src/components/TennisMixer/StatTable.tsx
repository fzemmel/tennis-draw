interface StatRow {
  name: string;
  play: number;
  bench: number;
  serve: number;
}

interface StatTableProps {
  rows: StatRow[];
}

export function StatTable({ rows }: StatTableProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">
        Einsätze, Pausen &amp; Aufschläge
      </h3>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-slate-400">
            <th className="py-1">Spieler</th>
            <th className="text-center">Gespielt</th>
            <th className="text-center">Pausiert</th>
            <th className="text-center">🎾 Aufschlag</th>
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
