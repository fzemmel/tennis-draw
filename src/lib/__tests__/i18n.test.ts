import { describe, expect, it } from "vitest";
import { getTranslations } from "../i18n";

describe("getTranslations", () => {
  it("returns representative German strings", () => {
    const de = getTranslations("de");

    expect(de.loading).toBe("Lädt…");
    expect(de.nextChange).toBe("Nächster Wechsel");
    expect(de.teamLabel.HEIM).toBe("HEIM");
  });

  it("returns representative English strings", () => {
    const en = getTranslations("en");

    expect(en.loading).toBe("Loading…");
    expect(en.nextChange).toBe("Next change");
    expect(en.teamLabel.GAST).toBe("GUEST");
  });

  it("handles singular and plural forms per locale", () => {
    const de = getTranslations("de");
    const en = getTranslations("en");

    expect(de.splash.moreNeeded(1)).toBe("1 weiterer Spieler nötig.");
    expect(de.splash.moreNeeded(2)).toBe("2 weitere Spieler nötig.");
    expect(en.splash.moreNeeded(1)).toBe("1 more player needed.");
    expect(en.splash.moreNeeded(2)).toBe("2 more players needed.");
  });
});
