import { useState, useEffect, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { clientesAPI } from '@/lib/api'
import { Cliente } from '@/types'
import ClienteForm from './ClienteForm'
import KeyboardHint, { TABLE_SHORTCUTS } from '@/components/shared/KeyboardHint'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [selectedRow, setSelectedRow] = useState(0)
  const tableRef = useRef<HTMLTableElement>(null)

  // Cargar clientes
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

  // Hotkeys
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

  // Búsqueda
  const handleSearch = (value: string) => {
    setFiltro(value)
    if (value.length > 0) {
      loadClientes(value)
    } else {
      loadClientes()
    }
  }

  // Seleccionar fila y abrir edición con Enter
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

  // Al guardar cliente
  const handleClienteGuardado = async (cliente: Cliente) => {
    setShowForm(false)
    await loadClientes(filtro)
  }

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Clientes</h1>
      </div>

      {/* Keyboard Hint */}
      <KeyboardHint shortcuts={TABLE_SHORTCUTS} className="mb-6" />

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <input
          id="search-clientes"
          type="text"
          placeholder="Buscar por código, razón social o CUIT... (F2)"
          value={filtro}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={() => {
            setSelectedCliente(null)
            setShowForm(true)
          }}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          ➕ Nuevo (F3)
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Cargando...</div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No hay clientes. Crea uno con F3.
          </div>
        ) : (
          <table
            ref={tableRef}
            className="w-full border-collapse bg-slate-800 rounded overflow-hidden"
          >
            <thead className="bg-slate-700 sticky top-0">
              <tr className="border-b border-slate-600">
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Código</th>
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Razón Social</th>
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">CUIT</th>
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Cond. IVA</th>
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Teléfono</th>
                <th className="px-4 py-3 text-center text-slate-300 font-semibold">Activo</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente, idx) => (
                <tr
                  key={cliente.id}
                  onClick={() => setSelectedRow(idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  tabIndex={0}
                  className={`border-b border-slate-700 cursor-pointer transition ${
                    selectedRow === idx
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-700 text-slate-100'
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

      {/* Form Modal */}
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
