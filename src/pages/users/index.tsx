import { useState, useEffect, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { usersAPI, type AppUserDTO } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import UserForm from './UserForm'

export default function UsersPage() {
  const { t } = useTranslation('users')
  const { t: tc } = useTranslation('common')
  const [users, setUsers] = useState<AppUserDTO[]>([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AppUserDTO | null>(null)
  const [selectedRow, setSelectedRow] = useState(0)
  const tableRef = useRef<HTMLTableElement>(null)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await usersAPI.list()
      setUsers(data ?? [])
      setSelectedRow(0)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  useHotkeys('f2', () => {
    const input = document.getElementById('search-users') as HTMLInputElement
    input?.focus()
  })

  useHotkeys('f3', () => {
    setSelectedUser(null)
    setShowForm(true)
  })

  useHotkeys('escape', () => {
    if (showForm) setShowForm(false)
  })

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedRow(Math.min(selectedRow + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedRow(Math.max(selectedRow - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      setSelectedUser(filtered[index])
      setShowForm(true)
    }
  }

  const filtered = filtro
    ? users.filter((u) => u.username.toLowerCase().includes(filtro.toLowerCase()))
    : users

  const handleSaved = async () => {
    setShowForm(false)
    await loadUsers()
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          id="search-users"
          type="text"
          placeholder={t('search.placeholder')}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <CanAccess permission="users.manage">
          <button
            data-testid="btn-nuevo-user"
            onClick={() => {
              setSelectedUser(null)
              setShowForm(true)
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            ➕ {tc('actions.new')} (F3)
          </button>
        </CanAccess>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">{tc('status.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">{t('empty')}</div>
        ) : (
          <table
            ref={tableRef}
            aria-label={t('title')}
            className="w-full border-collapse bg-white dark:bg-slate-800 rounded overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
              <tr className="border-b border-slate-200 dark:border-slate-600">
                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.username')}</th>
                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.role')}</th>
                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.channels')}</th>
                <th className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{t('table.active')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <tr
                  key={user.id}
                  role="row"
                  aria-selected={selectedRow === idx}
                  onClick={() => setSelectedRow(idx)}
                  onDoubleClick={() => {
                    setSelectedUser(user)
                    setShowForm(true)
                  }}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  tabIndex={0}
                  className={`border-b border-slate-200 dark:border-slate-700 cursor-pointer transition ${
                    selectedRow === idx
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-semibold">{user.username}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
                      {t(`form.roleOptions.${user.role}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.scopeChannels.length > 0
                      ? user.scopeChannels.map((ch) => t(`form.channelOptions.${ch}`)).join(', ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.active ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <UserForm
          user={selectedUser}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
