import type { ChangeEvent } from "./types";

export const SUPPORTED_LANGUAGES = ["de", "en"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "de";

interface Translations {
  appName: string;
  loading: string;
  roundLabel: (round: number) => string;
  versus: string;
  serveLabel: string;
  nextChange: string;
  stats: string;
  reset: string;
  resetSharedConfirm: string;
  sync: {
    shared: string;
    local: string;
  };
  teamLabel: Record<ChangeEvent["team"], string>;
  changeNotice: (change: ChangeEvent) => string;
  bench: {
    label: string;
    badge: string;
    nextUp: string;
  };
  teamCard: {
    newBadge: string;
  };
  languageSelector: {
    label: string;
    switchTo: (language: Language) => string;
  };
  splash: {
    title: string;
    selectPlayers: string;
    addPlayerPlaceholder: string;
    addPlayer: string;
    removePlayer: (name: string) => string;
    lineup: string;
    selectedCount: (count: number) => string;
    emptySelection: string;
    moreNeeded: (count: number) => string;
    start: string;
  };
  statsPanel: {
    tableTitle: string;
    columns: {
      player: string;
      play: string;
      bench: string;
      serve: string;
    };
    partnerMatrixTitle: string;
    partnerMatrixFootnote: string;
  };
}

const translations: Record<Language, Translations> = {
  de: {
    appName: "Tennis-Mixer",
    loading: "Lädt…",
    roundLabel: (round) => `Spiel ${round}`,
    versus: "VS",
    serveLabel: "Aufschlag:",
    nextChange: "Nächster Wechsel",
    stats: "Statistik",
    reset: "Reset",
    resetSharedConfirm: "Für alle? Nochmal tippen",
    sync: {
      shared: "Synchron auf allen Geräten",
      local: "Nur lokal – synchron erst nach dem Veröffentlichen",
    },
    teamLabel: {
      HEIM: "HEIM",
      GAST: "GAST",
    },
    changeNotice: (change) =>
      `🔄 ${change.in} kommt rein für ${change.out} (${translations.de.teamLabel[change.team]})`,
    bench: {
      label: "PAUSE ☕",
      badge: "BANK",
      nextUp: "Nächster",
    },
    teamCard: {
      newBadge: "NEU",
    },
    languageSelector: {
      label: "Sprache",
      switchTo: (language) =>
        language === "de"
          ? "Sprache zu Deutsch wechseln"
          : "Sprache zu Englisch wechseln",
    },
    splash: {
      title: "Wer spielt heute?",
      selectPlayers: "Spieler auswählen",
      addPlayerPlaceholder: "Spieler hinzufügen…",
      addPlayer: "Spieler hinzufügen",
      removePlayer: (name) => `${name} entfernen`,
      lineup: "Aufstellung",
      selectedCount: (count) => `${count} ausgewählt`,
      emptySelection: "Wähle oben mind. 5 Spieler aus.",
      moreNeeded: (count) =>
        count === 1 ? "1 weiterer Spieler nötig." : `${count} weitere Spieler nötig.`,
      start: "Spiel starten →",
    },
    statsPanel: {
      tableTitle: "Einsätze, Pausen & Aufschläge",
      columns: {
        player: "Spieler",
        play: "Gespielt",
        bench: "Pausiert",
        serve: "🎾 Aufschlag",
      },
      partnerMatrixTitle: "Wie oft zusammen im Team",
      partnerMatrixFootnote:
        "Aufschlag rotiert nach Doppelregel reihum durch alle vier Plätze. Pausen & Auswechslungen sind über alle Spieler ausgeglichen.",
    },
  },
  en: {
    appName: "Tennis-Mixer",
    loading: "Loading…",
    roundLabel: (round) => `Game ${round}`,
    versus: "VS",
    serveLabel: "Serve:",
    nextChange: "Next change",
    stats: "Statistics",
    reset: "Reset",
    resetSharedConfirm: "For everyone? Tap again",
    sync: {
      shared: "Synced across all devices",
      local: "Local only – shared sync becomes available after publishing",
    },
    teamLabel: {
      HEIM: "HOME",
      GAST: "GUEST",
    },
    changeNotice: (change) =>
      `🔄 ${change.in} comes in for ${change.out} (${translations.en.teamLabel[change.team]})`,
    bench: {
      label: "BENCH ☕",
      badge: "BENCH",
      nextUp: "Next up",
    },
    teamCard: {
      newBadge: "NEW",
    },
    languageSelector: {
      label: "Language",
      switchTo: (language) =>
        language === "de"
          ? "Switch language to German"
          : "Switch language to English",
    },
    splash: {
      title: "Who is playing today?",
      selectPlayers: "Select players",
      addPlayerPlaceholder: "Add player…",
      addPlayer: "Add player",
      removePlayer: (name) => `Remove ${name}`,
      lineup: "Lineup",
      selectedCount: (count) => `${count} selected`,
      emptySelection: "Select at least 5 players above.",
      moreNeeded: (count) =>
        count === 1 ? "1 more player needed." : `${count} more players needed.`,
      start: "Start game →",
    },
    statsPanel: {
      tableTitle: "Games, benches & serves",
      columns: {
        player: "Player",
        play: "Played",
        bench: "Benched",
        serve: "🎾 Serve",
      },
      partnerMatrixTitle: "Times paired on the same team",
      partnerMatrixFootnote:
        "Serve rotates through all four court positions following doubles rules. Bench time and substitutions stay balanced across all players.",
    },
  },
};

export function isLanguage(value: unknown): value is Language {
  return (
    typeof value === "string" &&
    SUPPORTED_LANGUAGES.includes(value as Language)
  );
}

export function getTranslations(language: Language): Translations {
  return translations[language];
}
