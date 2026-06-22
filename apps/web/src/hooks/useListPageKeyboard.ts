import { useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

export type ListKeyboardNavOptions = {
  itemCount: number
  selectedRow: number
  setSelectedRow: (row: number) => void
  onOpenRow: (index: number) => void
}

/**
 * @en Row arrow/Enter handler for keyboard-navigable tables.
 * @es Manejador de flechas/Enter para tablas navegables por teclado.
 * @pt-BR Handler de setas/Enter para tabelas navegáveis por teclado.
 */
export function useListKeyboardNav({
  itemCount,
  selectedRow,
  setSelectedRow,
  onOpenRow,
}: ListKeyboardNavOptions) {
  return useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedRow(Math.min(selectedRow + 1, Math.max(itemCount - 1, 0)))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedRow(Math.max(selectedRow - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (itemCount > 0) onOpenRow(index)
      }
    },
    [itemCount, onOpenRow, selectedRow, setSelectedRow],
  )
}

export type ListPageHotkeysOptions = {
  searchInputId?: string
  onNew?: () => void
  onClose?: () => void
  isOverlayOpen?: boolean
}

/**
 * @en Standard list-page hotkeys: F2 search, F3 new, Esc close overlay.
 * @es Atajos estándar de listado: F2 búsqueda, F3 nuevo, Esc cerrar.
 * @pt-BR Atalhos padrão de listagem: F2 busca, F3 novo, Esc fechar.
 */
export function useListPageHotkeys({
  searchInputId,
  onNew,
  onClose,
  isOverlayOpen = false,
}: ListPageHotkeysOptions): void {
  useHotkeys(
    'f2',
    () => {
      if (!searchInputId) return
      const input = document.getElementById(searchInputId) as HTMLInputElement | null
      input?.focus()
    },
    { enabled: Boolean(searchInputId) },
  )

  useHotkeys(
    'f3',
    () => {
      onNew?.()
    },
    { enabled: Boolean(onNew) },
  )

  useHotkeys(
    'escape',
    () => {
      if (isOverlayOpen) onClose?.()
    },
    { enabled: Boolean(onClose) && isOverlayOpen },
  )
}

export type FormPageHotkeysOptions = {
  onSave?: () => void
  onClose: () => void
}

/**
 * @en Form hotkeys: F5 save, Esc cancel.
 * @es Atajos de formulario: F5 guardar, Esc cancelar.
 * @pt-BR Atalhos de formulário: F5 salvar, Esc cancelar.
 */
export function useFormPageHotkeys({ onSave, onClose }: FormPageHotkeysOptions): void {
  useHotkeys(
    'f5',
    (e) => {
      e.preventDefault()
      onSave?.()
    },
    { enabled: Boolean(onSave) },
  )
  useHotkeys('escape', () => onClose(), { enableOnFormTags: true })
}
