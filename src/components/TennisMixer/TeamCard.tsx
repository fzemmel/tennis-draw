import { getTranslations, type Language } from "../../lib/i18n";

interface TeamCardProps {
  title: "HEIM" | "GAST";
  players: [string, string];
  serverName: string;
  incomingNames?: string[];
  language: Language;
}

const borderColor: Record<TeamCardProps["title"], string> = {
  HEIM: "border-t-blue-500",
  GAST: "border-t-red-500",
};

const titleColor: Record<TeamCardProps["title"], string> = {
  HEIM: "text-blue-500",
  GAST: "text-red-500",
};

export function TeamCard({
  title,
  players,
  serverName,
  incomingNames,
  language,
}: TeamCardProps) {
  const t = getTranslations(language);

  return (
    <div
      className={[
        "flex-1 bg-slate-800 rounded-2xl px-2 py-3 text-center border-t-4",
        borderColor[title],
      ].join(" ")}
    >
      <div
        className={[
          "text-xs font-bold tracking-widest mb-2",
          titleColor[title],
        ].join(" ")}
      >
        {t.teamLabel[title]}
      </div>

      {players.map((player) => {
        const isServer = player === serverName;
        const isNew = incomingNames?.includes(player) ?? false;

        return (
          <div
            key={player}
            className={[
              "flex items-center justify-center gap-1.5 text-lg font-bold px-1 py-2 my-1 rounded-lg border",
              isServer
                ? "bg-yellow-400 text-slate-900 border-yellow-500"
                : "bg-white/[0.04] text-slate-50 border-transparent",
            ].join(" ")}
          >
            <span>
              {isServer ? "🎾 " : ""}
              {player}
            </span>
            {isNew && (
              <span
                className={[
                  "text-[10px] font-extrabold rounded-md px-1.5 py-px tracking-wide text-white",
                  isServer ? "bg-slate-900" : "bg-green-500",
                ].join(" ")}
              >
                {t.teamCard.newBadge}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
