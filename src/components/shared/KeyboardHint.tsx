/**
 * Componente que muestra una referencia visual de atajos de teclado
 * Se puede usar en diferentes páginas para mostrar atajos contextuales
 */

interface KeyboardShortcut {
  key: string
  description: string
}

interface KeyboardHintProps {
  shortcuts: KeyboardShortcut[]
  className?: string
}

export default function KeyboardHint({ shortcuts, className = '' }: KeyboardHintProps) {
  return (
    <div
      className={`bg-slate-700 border border-slate-600 rounded p-3 text-xs text-slate-300 ${className}`}
    >
      <div className="font-semibold text-slate-100 mb-2">⌨️ Atajos de teclado:</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {shortcuts.map((shortcut, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-xs font-mono font-semibold text-slate-100">
              {shortcut.key}
            </kbd>
            <span className="text-slate-400">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Atajos globales disponibles en toda la app
 */
export const GLOBAL_SHORTCUTS: KeyboardShortcut[] = [
  { key: 'F2', description: 'Buscar' },
  { key: 'F3', description: 'Nuevo' },
  { key: 'F5', description: 'Guardar' },
  { key: 'Esc', description: 'Cancelar' },
  { key: '↑↓', description: 'Navegar' },
]

/**
 * Atajos específicos de tabla/grilla
 */
export const TABLE_SHORTCUTS: KeyboardShortcut[] = [
  { key: 'F2', description: 'Buscar' },
  { key: 'F3', description: 'Nuevo' },
  { key: '↑↓', description: 'Navegar filas' },
  { key: 'Enter', description: 'Editar' },
  { key: 'Esc', description: 'Cancelar' },
]

/**
 * Atajos de formulario
 */
export const FORM_SHORTCUTS: KeyboardShortcut[] = [
  { key: 'Tab', description: 'Campo siguiente' },
  { key: 'Shift+Tab', description: 'Campo anterior' },
  { key: 'F5', description: 'Guardar' },
  { key: 'Esc', description: 'Cancelar' },
]

/**
 * Atajos de grilla de facturación
 */
export const INVOICE_SHORTCUTS: KeyboardShortcut[] = [
  { key: 'Ins', description: 'Agregar ítem' },
  { key: 'Del', description: 'Eliminar ítem' },
  { key: '↑↓', description: 'Navegar ítems' },
  { key: 'F5', description: 'Guardar' },
  { key: 'Esc', description: 'Cancelar' },
]
