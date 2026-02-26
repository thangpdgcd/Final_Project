import i18n from "i18next";
import { initReactI18next } from "react-i18next";


import vi from "../translates/vn/vi.json";
import en from "../translates/en/en.json";

const DEFAULT_LANG = "vi";
const STORAGE_KEY = "app_language";

const savedLang =
  (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) ||
  DEFAULT_LANG;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: savedLang,
  fallbackLng: DEFAULT_LANG,
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (lang: "en" | "vi") => {
  i18n.changeLanguage(lang);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lang);
  }
};

export default i18n;

