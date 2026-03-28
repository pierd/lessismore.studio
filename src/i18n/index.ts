import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

export const supportedLanguages = ['en', 'es', 'pl'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

const resources = {
  en: {
    translation: {
      app: {
        title: 'Less is More Studio',
      },
      projects: {
        loading: 'Loading projects...',
        error: 'Could not load projects right now.',
        empty: 'No projects available yet.',
        open: 'Open',
      },
      language: {
        en: 'English',
        es: 'Español',
        pl: 'Polski',
      },
    },
  },
  es: {
    translation: {
      app: {
        title: 'Less is More Studio',
      },
      projects: {
        loading: 'Cargando proyectos...',
        error: 'No se pudieron cargar los proyectos por ahora.',
        empty: 'Todavía no hay proyectos disponibles.',
        open: 'Abrir',
      },
      language: {
        en: 'English',
        es: 'Español',
        pl: 'Polski',
      },
    },
  },
  pl: {
    translation: {
      app: {
        title: 'Less is More Studio',
      },
      projects: {
        loading: 'Ładowanie projektów...',
        error: 'Nie udało się teraz załadować projektów.',
        empty: 'Brak dostępnych projektów.',
        open: 'Otwórz',
      },
      language: {
        en: 'English',
        es: 'Español',
        pl: 'Polski',
      },
    },
  },
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
