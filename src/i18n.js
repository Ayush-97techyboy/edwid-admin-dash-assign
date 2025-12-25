import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translations } from './utils/translations';

const resources = {
  en: { translation: translations.en },
  es: { translation: translations.es },
  fr: { translation: translations.fr },
  de: { translation: translations.de },
  hi: { translation: translations.hi },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
