import { computed, onMounted } from "vue";
import { defaultTranslations, type SiteTranslations } from "~~/shared/constants/translations";

export type SupportedLocale = "en" | "bn";

export const useTranslation = () => {
  // Shared reactive state across components
  const currentLocale = useState<SupportedLocale>("temple_current_locale", () => "en");
  const translations = useState<SiteTranslations>("temple_site_translations", () => defaultTranslations);

  // Fetch dynamic translations from CMS backend
  const { data, refresh } = useFetch<{ success: boolean; translations: SiteTranslations }>("/api/cms/translations", {
    key: "temple_cms_translations",
    default: () => ({ success: true, translations: defaultTranslations }),
    lazy: false,
  });

  // Watch/sync fetched translations
  if (data.value?.translations) {
    translations.value = {
      ...defaultTranslations,
      ...data.value.translations,
    };
  }

  // Restore user's saved preference on client mount
  onMounted(() => {
    if (import.meta.client) {
      const saved = localStorage.getItem("temple_locale");
      if (saved === "bn" || saved === "en") {
        currentLocale.value = saved;
        document.documentElement.setAttribute("lang", saved);
      }
    }
  });

  const setLocale = (locale: SupportedLocale) => {
    currentLocale.value = locale;
    if (import.meta.client) {
      localStorage.setItem("temple_locale", locale);
      document.documentElement.setAttribute("lang", locale);
    }
  };

  const toggleLocale = () => {
    const next = currentLocale.value === "en" ? "bn" : "en";
    setLocale(next);
  };

  const isBengali = computed(() => currentLocale.value === "bn");

  /**
   * Translate a key into the active locale.
   * If translation item is missing or empty, falls back gracefully.
   */
  const t = (key: string, fallback?: string): string => {
    const currentDict = translations.value || defaultTranslations;
    const item = currentDict[key] || defaultTranslations[key];

    if (!item) {
      return fallback !== undefined ? fallback : key;
    }

    if (currentLocale.value === "bn") {
      return item.bn?.trim() ? item.bn : (item.en?.trim() ? item.en : (fallback ?? key));
    }

    return item.en?.trim() ? item.en : (fallback ?? key);
  };

  return {
    currentLocale,
    setLocale,
    toggleLocale,
    translations,
    t,
    isBengali,
    refresh,
  };
};
