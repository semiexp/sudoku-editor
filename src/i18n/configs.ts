import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translation_en from "./en.json";
import translation_ja from "./ja.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: translation_en,
    },
    ja: {
      translation: translation_ja,
    },
  },
  lng: "ja",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});
