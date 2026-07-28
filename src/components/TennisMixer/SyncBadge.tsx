import { Wifi, WifiOff } from "lucide-react";
import type { SyncMode } from "../../lib/types";

interface SyncBadgeProps {
  mode: SyncMode;
}

export function SyncBadge({ mode }: SyncBadgeProps) {
  const isShared = mode === "shared";
  return (
    <div
      className={[
        "flex items-center justify-center gap-1.5 text-xs",
        isShared ? "text-green-400" : "text-amber-400",
      ].join(" ")}
    >
      {isShared ? <Wifi size={14} /> : <WifiOff size={14} />}
      {isShared
        ? "Synchron auf allen Handys"
        : "Nur lokal – synchron erst nach dem Veröffentlichen"}
    </div>
  );
}
