import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import locales
import enTranslation from '../locales/en.json';
import esTranslation from '../locales/es.json';
import frTranslation from '../locales/fr.json';
import zhTranslation from '../locales/zh.json';
import ruTranslation from '../locales/ru.json';

// Define supported languages
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    flag: 'https://media.istockphoto.com/id/1340109886/vector/united-states-flag-icon.jpg',
    nativeName: 'English'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    flag: 'https://cdn.countryflags.com/thumbs/spain/flag-400.png',
    nativeName: 'Español'
  },
  fr: {
    code: 'fr',
    name: 'French',
    flag: 'https://cdn.countryflags.com/thumbs/france/flag-400.png',
    nativeName: 'Français'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    flag: 'https://cdn.countryflags.com/thumbs/china/flag-400.png',
    nativeName: '中文'
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    flag: 'https://cdn.countryflags.com/thumbs/russia/flag-400.png',
    nativeName: 'Русский'
  }
};

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      es: { translation: esTranslation },
      fr: { translation: frTranslation },
      zh: { translation: zhTranslation },
      ru: { translation: ruTranslation }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

export default i18n;
