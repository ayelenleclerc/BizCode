import { useState, useEffect, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { articulosAPI, rubrosAPI } from '@/lib/api'
import { Articulo, Rubro } from '@/types'
import ArticuloForm from './ArticuloForm'
import KeyboardHint, { TABLE_SHORTCUTS } from '@/components/shared/KeyboardHint'

export default function ArticulosPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedArticulo, setSelectedArticulo] = useState<Articulo | null>(null)
  const [selectedRow, setSelectedRow] = useState(0)
  const tableRef = useRef<HTMLTableElement>(null)

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [artData, rubData] = await Promise.all([
          articulosAPI.list(),
          rubrosAPI.list(),
        ])
        setArticulos(artData || [])
        setRubros(rubData || [])
        setSelectedRow(0)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Hotkeys
  useHotkeys('f2', () => {
    const input = document.getElementById('search-articulos') as HTMLInputElement
    input?.focus()
  })

  useHotkeys('f3', () => {
    setSelectedArticulo(null)
    setShowForm(true)
  })

  useHotkeys('escape', () => {
    if (showForm) setShowForm(false)
  })

  // Búsqueda
  const handleSearch = async (value: string) => {
    setFiltro(value)
    if (value.length > 0) {
      const data = await articulosAPI.list(value)
      setArticulos(data || [])
    } else {
      const data = await articulosAPI.list()
      setArticulos(data || [])
    }
  }

  // Navegar tabla
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedRow(Math.min(selectedRow + 1, articulos.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedRow(Math.max(selectedRow - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      setSelectedArticulo(articulos[index])
      setShowForm(true)
    }
  }

  // Al guardar artículo
  const handleArticuloGuardado = async () => {
    setShowForm(false)
    const data = await articulosAPI.list(filtro)
    setArticulos(data || [])
  }

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Artículos</h1>
      </div>

      {/* Keyboard Hint */}
      <KeyboardHint shortcuts={TABLE_SHORTCUTS} className="mb-6" />

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <input
          id="search-articulos"
          type="text"
          placeholder="Buscar por código o descripción... (F2)"
          value={filtro}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={() => {
            setSelectedArticulo(null)
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
        ) : articulos.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No hay artículos. Crea uno con F3.
          </div>
        ) : (
          <table
            ref={tableRef}
            className="w-full border-collapse bg-slate-800 rounded overflow-hidden"
          >
            <thead className="bg-slate-700 sticky top-0">
              <tr className="border-b border-slate-600">
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Código</th>
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Descripción</th>
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Rubro</th>
                <th className="px-4 py-3 text-center text-slate-300 font-semibold">IVA</th>
                <th className="px-4 py-3 text-right text-slate-300 font-semibold">P. Lista 1</th>
                <th className="px-4 py-3 text-right text-slate-300 font-semibold">Costo</th>
                <th className="px-4 py-3 text-center text-slate-300 font-semibold">Stock</th>
                <th className="px-4 py-3 text-center text-slate-300 font-semibold">Activo</th>
              </tr>
            </thead>
            <tbody>
              {articulos.map((articulo, idx) => (
                <tr
                  key={articulo.id}
                  onClick={() => setSelectedRow(idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  tabIndex={0}
                  className={`border-b border-slate-700 cursor-pointer transition ${
                    selectedRow === idx
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-700 text-slate-100'
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">{articulo.codigo}</td>
                  <td className="px-4 py-3">{articulo.descripcion}</td>
                  <td className="px-4 py-3">{articulo.rubro?.nombre || '-'}</td>
                  <td className="px-4 py-3 text-center">{articulo.condIva === '1' ? '21%' : articulo.condIva === '2' ? '10.5%' : 'Exento'}</td>
                  <td className="px-4 py-3 text-right font-mono">${Number(articulo.precioLista1).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono">${Number(articulo.costo).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">{articulo.stock}</td>
                  <td className="px-4 py-3 text-center">
                    {articulo.activo ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ArticuloForm
          articulo={selectedArticulo}
          rubros={rubros}
          onClose={() => setShowForm(false)}
          onGuardado={handleArticuloGuardado}
        />
      )}
    </div>
  )
}
