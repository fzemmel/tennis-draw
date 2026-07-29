import { getTranslations, type Language } from "../../lib/i18n";
import { Wifi, WifiOff } from "lucide-react";
import type { SyncMode } from "../../lib/types";

interface SyncBadgeProps {
  mode: SyncMode;
  language: Language;
}

export function SyncBadge({ mode, language }: SyncBadgeProps) {
  const isShared = mode === "shared";
  const t = getTranslations(language);

  return (
    <div
      className={[
        "flex items-center justify-center gap-1.5 text-xs",
        isShared ? "text-green-400" : "text-amber-400",
      ].join(" ")}
    >
    {isShared ? <Wifi size={14} /> : <WifiOff size={14} />}
    {isShared ? t.sync.shared : t.sync.local}
    </div>
  );
}
