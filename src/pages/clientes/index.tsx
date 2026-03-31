import { useState, useEffect, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { clientesAPI } from '@/lib/api'
import { Cliente } from '@/types'
import ClienteForm from './ClienteForm'

export default function ClientesPage() {
  const { t } = useTranslation('clientes')
  const { t: tc } = useTranslation('common')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [selectedRow, setSelectedRow] = useState(0)
  const tableRef = useRef<HTMLTableElement>(null)

  const loadClientes = async (search?: string) => {
    setLoading(true)
    try {
      const data = await clientesAPI.list(search)
      setClientes(data || [])
      setSelectedRow(0)
    } catch (error) {
      console.error('Error loading clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClientes()
  }, [])

  useHotkeys('f2', () => {
    const input = document.getElementById('search-clientes') as HTMLInputElement
    input?.focus()
  })

  useHotkeys('f3', () => {
    setSelectedCliente(null)
    setShowForm(true)
  })

  useHotkeys('escape', () => {
    if (showForm) setShowForm(false)
  })

  const handleSearch = (value: string) => {
    setFiltro(value)
    if (value.length > 0) {
      loadClientes(value)
    } else {
      loadClientes()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedRow(Math.min(selectedRow + 1, clientes.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedRow(Math.max(selectedRow - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      setSelectedCliente(clientes[index])
      setShowForm(true)
    }
  }

  const handleClienteGuardado = async (_cliente: Cliente) => {
    setShowForm(false)
    await loadClientes(filtro)
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          id="search-clientes"
          type="text"
          placeholder={t('search.placeholder')}
          value={filtro}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <button
          data-testid="btn-nuevo-cliente"
          onClick={() => {
            setSelectedCliente(null)
            setShowForm(true)
          }}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          ➕ {tc('actions.new')} (F3)
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">{tc('status.loading')}</div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">{t('empty')}</div>
        ) : (
          <table
            ref={tableRef}
            aria-label={t('title')}
            className="w-full border-collapse bg-white dark:bg-slate-800 rounded overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
              <tr className="border-b border-slate-200 dark:border-slate-600">
                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.codigo')}</th>
                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.rsocial')}</th>
                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.cuit')}</th>
                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.condIva')}</th>
                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.telef')}</th>
                <th className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{t('table.activo')}</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente, idx) => (
                <tr
                  key={cliente.id}
                  role="row"
                  aria-selected={selectedRow === idx}
                  onClick={() => setSelectedRow(idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  tabIndex={0}
                  className={`border-b border-slate-200 dark:border-slate-700 cursor-pointer transition ${
                    selectedRow === idx
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">{cliente.codigo}</td>
                  <td className="px-4 py-3">{cliente.rsocial}</td>
                  <td className="px-4 py-3 font-mono text-sm">{cliente.cuit || '-'}</td>
                  <td className="px-4 py-3">{cliente.condIva}</td>
                  <td className="px-4 py-3">{cliente.telef || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    {cliente.activo ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <ClienteForm
          cliente={selectedCliente}
          onClose={() => setShowForm(false)}
          onGuardado={handleClienteGuardado}
        />
      )}
    </div>
  )
}
