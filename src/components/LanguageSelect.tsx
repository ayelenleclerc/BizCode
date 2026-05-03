import { useTranslation } from 'react-i18next'
import i18n from '@/i18n/config'

const LANG_CODES = ['es', 'en', 'pt-BR'] as const

type LangCode = (typeof LANG_CODES)[number]

function isLangCode(value: string): value is LangCode {
  return (LANG_CODES as readonly string[]).includes(value)
}

type LanguageSelectProps = {
  /** @en Stable test id for the control (login vs layout). */
  'data-testid'?: string
  id?: string
  /** @en Wrapper div classes. */
  className?: string
  /** @en Classes for the native select (e.g. w-full). */
  selectClassName?: string
}

/**
 * @en Persists choice in `localStorage` key `lang` and updates i18next for the whole app.
 * @es Persiste la elección en `localStorage` (`lang`) y actualiza i18next en toda la app.
 * @pt-BR Persiste em `localStorage` (`lang`) e atualiza o i18next em todo o app.
 */
export default function LanguageSelect({
  'data-testid': dataTestId,
  id,
  className,
  selectClassName,
}: LanguageSelectProps) {
  const { t } = useTranslation('common')
  const current = isLangCode(i18n.language) ? i18n.language : 'es'

  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {t('language.legend')}
      </label>
      <select
        id={id}
        data-testid={dataTestId}
        aria-label={t('language.selectAria')}
        className={`rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 ${selectClassName ?? ''}`}
        value={current}
        onChange={(e) => {
          const next = e.target.value
          if (!isLangCode(next)) {
            return
          }
          void i18n.changeLanguage(next)
          localStorage.setItem('lang', next)
        }}
      >
        <option value="es">{t('language.optionEs')}</option>
        <option value="en">{t('language.optionEn')}</option>
        <option value="pt-BR">{t('language.optionPtBr')}</option>
      </select>
    </div>
  )
}
