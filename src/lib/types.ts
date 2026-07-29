// ---------- Typen ----------

export interface GameState {
  home: [string, string];
  guest: [string, string];
  bench: string[];
  playCount: Record<string, number>;
  benchCount: Record<string, number>;
  serveCount: Record<string, number>;
  partnerCount: Record<string, number>;
  opponentCount: Record<string, number>;
  round: number;
  lastIn: string | null;
  lastChanges: ChangeEvent[];
  ts: number;
}

export interface ChangeEvent {
  in: string;
  out: string;
  team: "HEIM" | "GAST";
}

export interface ServerInfo {
  name: string;
  team: "HEIM" | "GAST";
}

export type SyncMode = "shared" | "local";
