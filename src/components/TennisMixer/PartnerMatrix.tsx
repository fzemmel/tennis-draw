import { pairKey } from "../../lib/tennis";

interface PartnerMatrixProps {
  players: readonly string[];
  partnerCount: Record<string, number>;
}

export function PartnerMatrix({ players, partnerCount }: PartnerMatrixProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Wie oft zusammen im Team</h3>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr className="text-slate-400">
              <th />
              {players.map((p) => (
                <th key={p} className="p-1 font-semibold">
                  {p.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((a) => (
              <tr key={a} className="border-t border-slate-700">
                <td className="p-1 text-slate-400 font-semibold">
                  {a.slice(0, 3)}
                </td>
                {players.map((b) => {
                  const count =
                    a === b ? null : partnerCount[pairKey(a, b)] ?? 0;
                  return (
                    <td
                      key={b}
                      className={[
                        "p-1 text-center",
                        a === b
                          ? "text-slate-600"
                          : count === 0
                            ? "text-slate-500"
                            : "text-slate-50 bg-green-500/15",
                      ].join(" ")}
                    >
                      {a === b ? "–" : count}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-500 mt-2">
        Aufschlag rotiert nach Doppelregel reihum durch alle vier Plätze. Pausen
        &amp; Auswechslungen sind über alle Spieler ausgeglichen.
      </p>
    </div>
  );
}
