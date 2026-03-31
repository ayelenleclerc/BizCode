import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Cargar preferencia de tema
    const saved = localStorage.getItem('theme')
    if (saved) {
      const dark = saved === 'dark'
      setIsDark(dark)
      if (dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      // Default dark
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
    if (newDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex h-screen bg-slate-900 dark:bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 dark:bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Logo / Header */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-blue-400">BizCode</h1>
          <p className="text-sm text-slate-400 mt-1">v0.1.0 MVP</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/clientes"
            className={`block px-4 py-3 rounded transition ${
              isActive('/clientes')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            📋 Clientes
          </Link>
          <Link
            to="/articulos"
            className={`block px-4 py-3 rounded transition ${
              isActive('/articulos')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            📦 Artículos
          </Link>
          <Link
            to="/facturacion"
            className={`block px-4 py-3 rounded transition ${
              isActive('/facturacion')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🧾 Facturación
          </Link>
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={toggleTheme}
            className="w-full px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 transition text-slate-200"
            title="Alternar tema claro/oscuro"
          >
            {isDark ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-slate-800 dark:bg-slate-800 border-b border-slate-700 px-8 py-3">
          <h2 className="text-xl font-semibold text-slate-100">
            Sistema de Gestión Comercial
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            💡 Atajos globales: <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">F2</kbd> Buscar •
            <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs ml-1">F3</kbd> Nuevo •
            <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs ml-1">F5</kbd> Guardar •
            <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs ml-1">Esc</kbd> Cancelar •
            <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs ml-1">↑↓</kbd> Navegar
          </p>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-900 dark:bg-slate-900">
          {children}
        </div>
      </main>
    </div>
  )
}
