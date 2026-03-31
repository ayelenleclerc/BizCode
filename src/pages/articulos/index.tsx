import { useState, useEffect, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { articulosAPI, rubrosAPI } from '@/lib/api'
import { Articulo, Rubro } from '@/types'
import ArticuloForm from './ArticuloForm'

export default function ArticulosPage() {
  const { t } = useTranslation('articulos')
  const { t: tc } = useTranslation('common')
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedArticulo, setSelectedArticulo] = useState<Articulo | null>(null)
  const [selectedRow, setSelectedRow] = useState(0)
  const tableRef = useRef<HTMLTableElement>(null)

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

  const handleArticuloGuardado = async () => {
    setShowForm(false)
    const data = await articulosAPI.list(filtro)
    setArticulos(data || [])
  }

  const ivaLabel = (condIva: string) => t(`iva.${condIva}` as `iva.1` | `iva.2` | `iva.3`)

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          id="search-articulos"
          type="text"
          placeholder={t('search.placeholder')}
          value={filtro}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <button
          data-testid="btn-nuevo-articulo"
          onClick={() => {
            setSelectedArticulo(null)
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
        ) : articulos.length === 0 ? (
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
                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.descripcion')}</th>
                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.rubro')}</th>
                <th className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{t('table.iva')}</th>
                <th className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-semibold">{t('table.precioLista1')}</th>
                <th className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-semibold">{t('table.precioLista2')}</th>
                <th className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{t('table.stock')}</th>
                <th className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{t('table.activo')}</th>
              </tr>
            </thead>
            <tbody>
              {articulos.map((articulo, idx) => (
                <tr
                  key={articulo.id}
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
                  <td className="px-4 py-3 font-semibold">{articulo.codigo}</td>
                  <td className="px-4 py-3">{articulo.descripcion}</td>
                  <td className="px-4 py-3">{articulo.rubro?.nombre || '-'}</td>
                  <td className="px-4 py-3 text-center">{ivaLabel(articulo.condIva)}</td>
                  <td className="px-4 py-3 text-right font-mono">${Number(articulo.precioLista1).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono">${Number(articulo.precioLista2).toFixed(2)}</td>
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
