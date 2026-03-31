/**
 * Component for displaying keyboard shortcut reference cards.
 * Shortcut constants are hooks so that descriptions can be translated.
 */
import { useTranslation } from 'react-i18next'

interface KeyboardShortcut {
  key: string
  description: string
}

interface KeyboardHintProps {
  shortcuts: KeyboardShortcut[]
  className?: string
}

export default function KeyboardHint({ shortcuts, className = '' }: KeyboardHintProps) {
  const { t } = useTranslation('common')
  return (
    <div
      className={`bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-3 text-xs text-slate-700 dark:text-slate-300 ${className}`}
    >
      <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">⌨️ {t('shortcuts.title')}:</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {shortcuts.map((shortcut, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
              {shortcut.key}
            </kbd>
            <span className="text-slate-500 dark:text-slate-400">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Hooks for translated keyboard shortcut arrays.
 * Must be called inside a React component.
 */
export function useInvoiceShortcuts(): KeyboardShortcut[] {
  const { t } = useTranslation('common')
  return [
    { key: 'Ins', description: t('shortcuts.new') },
    { key: 'Del', description: t('shortcuts.cancel') },
    { key: '↑↓', description: t('shortcuts.navigate') },
    { key: 'F5', description: t('shortcuts.save') },
    { key: 'Esc', description: t('shortcuts.cancel') },
  ]
}

/**
 * @deprecated Use useInvoiceShortcuts() hook instead.
 * Kept for backward compatibility during migration.
 */
export const INVOICE_SHORTCUTS: KeyboardShortcut[] = [
  { key: 'Ins', description: 'Agregar ítem' },
  { key: 'Del', description: 'Eliminar ítem' },
  { key: '↑↓', description: 'Navegar ítems' },
  { key: 'F5', description: 'Guardar' },
  { key: 'Esc', description: 'Cancelar' },
]
