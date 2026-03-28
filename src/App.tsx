import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from './components/LanguageSelector'
import { supportedLanguages, type SupportedLanguage } from './i18n'
import './App.css'

interface Project {
  id: string
  title: string
  icon: string
  iconUrl?: string
  url: string
  createdAt: string
  description: Record<SupportedLanguage, string>
  theme: {
    light: {
      start: string
      end: string
      text: string
    }
    dark: {
      start: string
      end: string
      text: string
    }
  }
}

const defaultTileTheme = {
  light: {
    start: '#f5f5f5',
    end: '#ececec',
    text: '#1a1a1a',
  },
  dark: {
    start: '#202020',
    end: '#2b2b2b',
    text: '#f5f5f5',
  },
} as const

const isThemeVariant = (value: unknown): value is { start: string; end: string; text: string } => {
  return (
    isObjectRecord(value) &&
    typeof value.start === 'string' &&
    typeof value.end === 'string' &&
    typeof value.text === 'string'
  )
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const parseProjects = (payload: unknown): Project[] => {
  if (!Array.isArray(payload)) {
    return []
  }

  const parsedProjects: Project[] = []

  for (const item of payload) {
    if (!isObjectRecord(item)) {
      continue
    }

    const { id, title, icon, iconUrl, url, createdAt, description, theme } = item

    if (
      typeof id !== 'string' ||
      typeof title !== 'string' ||
      (typeof icon !== 'string' && typeof iconUrl !== 'string') ||
      typeof url !== 'string' ||
      typeof createdAt !== 'string' ||
      !isObjectRecord(description)
    ) {
      continue
    }

    const normalizedDescription: Record<SupportedLanguage, string> = {
      en: typeof description.en === 'string' ? description.en : '',
      es: typeof description.es === 'string' ? description.es : '',
      pl: typeof description.pl === 'string' ? description.pl : '',
    }

    const normalizedTheme =
      isObjectRecord(theme) && isThemeVariant(theme.light) && isThemeVariant(theme.dark)
        ? {
            light: theme.light,
            dark: theme.dark,
          }
        : defaultTileTheme

    parsedProjects.push({
      id,
      title,
      icon: typeof icon === 'string' ? icon : '',
      iconUrl: typeof iconUrl === 'string' ? iconUrl : undefined,
      url,
      createdAt,
      description: normalizedDescription,
      theme: normalizedTheme,
    })
  }

  return parsedProjects.sort(
    (projectA, projectB) =>
      new Date(projectB.createdAt).getTime() - new Date(projectA.createdAt).getTime(),
  )
}

const isSupportedLanguage = (value: string): value is SupportedLanguage => {
  return (supportedLanguages as readonly string[]).includes(value)
}

function App() {
  const { t, i18n } = useTranslation()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('/projects.json')

        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }

        const payload: unknown = await response.json()
        setProjects(parseProjects(payload))
        setHasError(false)
      } catch {
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    void loadProjects()
  }, [])

  const currentLanguage = useMemo(() => {
    const candidate = i18n.resolvedLanguage?.slice(0, 2) ?? i18n.language?.slice(0, 2) ?? 'en'
    return isSupportedLanguage(candidate) ? candidate : 'en'
  }, [i18n.language, i18n.resolvedLanguage])

  return (
    <div className="app-shell">
      <LanguageSelector />

      <header className="hero">
        <div className="logo-frame">
          <h1 className="logo-mark" aria-label={t('app.title')}>
            &lt;=&gt;
          </h1>
        </div>
      </header>

      {isLoading && <p className="status-message">{t('projects.loading')}</p>}
      {hasError && <p className="status-message status-error">{t('projects.error')}</p>}

      {!isLoading && !hasError && projects.length === 0 && (
        <p className="status-message">{t('projects.empty')}</p>
      )}

      {!isLoading && !hasError && projects.length > 0 && (
        <ul className="tiles-grid">
          {projects.map((project) => (
            <li key={project.id}>
              <a
                className="project-tile"
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title}. ${t('projects.open')}`}
                style={
                  {
                    '--tile-start-light': project.theme.light.start,
                    '--tile-end-light': project.theme.light.end,
                    '--tile-text-light': project.theme.light.text,
                    '--tile-start-dark': project.theme.dark.start,
                    '--tile-end-dark': project.theme.dark.end,
                    '--tile-text-dark': project.theme.dark.text,
                  } as CSSProperties
                }
              >
                <span className="tile-icon" aria-hidden="true">
                  {project.iconUrl ? <img src={project.iconUrl} alt="" /> : project.icon}
                </span>
                <div className="tile-content">
                  <h2>{project.title}</h2>
                  <p>{project.description[currentLanguage] || project.description.en}</p>
                  <span className="tile-action">{t('projects.open')}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
