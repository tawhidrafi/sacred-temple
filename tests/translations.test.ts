import { describe, it, expect } from "bun:test";
import { defaultTranslations, type SiteTranslations } from "../shared/constants/translations";

describe("Site Translations & Localization", () => {
  it("verifies defaultTranslations dictionary contains required keys and valid categories", () => {
    expect(defaultTranslations).toBeDefined();
    const keys = Object.keys(defaultTranslations);
    expect(keys.length).toBeGreaterThan(30);

    // Essential keys verification
    expect(defaultTranslations["nav.home"]).toBeDefined();
    expect(defaultTranslations["nav.about"]).toBeDefined();
    expect(defaultTranslations["nav.deities"]).toBeDefined();
    expect(defaultTranslations["nav.pujas"]).toBeDefined();
    expect(defaultTranslations["nav.track_booking"]).toBeDefined();
    expect(defaultTranslations["nav.festivals"]).toBeDefined();
    expect(defaultTranslations["nav.contact"]).toBeDefined();

    for (const [key, item] of Object.entries(defaultTranslations)) {
      expect(typeof item.en).toBe("string");
      expect(item.en.trim().length).toBeGreaterThan(0);
      expect(typeof item.bn).toBe("string");
      expect(item.bn.trim().length).toBeGreaterThan(0);
      expect(["nav", "footer", "common", "about", "deities", "puja", "events", "contact", "status"]).toContain(item.category);
    }
  });

  it("verifies locale translation fallback logic", () => {
    const mockDict: SiteTranslations = {
      "test.key": { en: "English Text", bn: "বাংলা লেখা", category: "common" },
      "test.english_only": { en: "English Only", bn: "", category: "common" },
    };

    const getTranslation = (key: string, locale: "en" | "bn", fallback?: string) => {
      const item = mockDict[key];
      if (!item) return fallback !== undefined ? fallback : key;
      if (locale === "bn") return item.bn?.trim() ? item.bn : item.en;
      return item.en;
    };

    expect(getTranslation("test.key", "en")).toBe("English Text");
    expect(getTranslation("test.key", "bn")).toBe("বাংলা লেখা");
    expect(getTranslation("test.english_only", "bn")).toBe("English Only"); // falls back to en
    expect(getTranslation("missing.key", "bn", "Default Fallback")).toBe("Default Fallback");
  });

  it("merges custom admin updates without losing default keys", () => {
    const customAdminUpdates: Partial<SiteTranslations> = {
      "nav.home": { en: "Main Sanctum", bn: "প্রধান ধাম", category: "nav" },
    };

    const merged: SiteTranslations = {
      ...defaultTranslations,
      ...customAdminUpdates,
    };

    expect(merged["nav.home"].en).toBe("Main Sanctum");
    expect(merged["nav.home"].bn).toBe("প্রধান ধাম");
    expect(merged["nav.about"].en).toBe(defaultTranslations["nav.about"].en);
  });
});
