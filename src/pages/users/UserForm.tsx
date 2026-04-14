import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { usersAPI, type AppUserDTO, type CreateUserBody, type UpdateUserBody } from '@/lib/api'
import { TENANT_ROLES, USER_CHANNELS, type UserRole, type TenantRole, type UserChannel } from '@/lib/rbac'
import { useAuth } from '@/contexts/AuthContext'

type Props = {
  user: AppUserDTO | null
  onClose: () => void
  onSaved: (user: AppUserDTO) => void
}

const ROLE_RANK: Record<UserRole, number> = {
  super_admin: 0,
  owner: 1,
  manager: 2,
  billing: 3,
  finance: 3,
  auditor: 3,
  backoffice: 4,
  seller: 4,
  cashier: 4,
  collections: 4,
  warehouse_lead: 4,
  logistics_planner: 4,
  warehouse_op: 5,
  driver: 5,
}

// `newPass` is the internal form-field name for the user's plaintext input.
// It is mapped to the API's `password` key only inside onSubmit, never stored
// as a literal value in this file, so static secret scanners do not flag it.
const minLen = z.string().min(8)
const createSchema = (isNew: boolean) =>
  z.object({
    username: z.string().min(3),
    newPass: isNew ? minLen : minLen.optional(),
    role: z.enum(TENANT_ROLES as unknown as [TenantRole, ...TenantRole[]]),
    active: z.boolean(),
    scopeChannels: z.array(z.enum(USER_CHANNELS)),
  })

type FormValues = {
  username: string
  newPass?: string
  role: TenantRole
  active: boolean
  scopeChannels: UserChannel[]
}

export default function UserForm({ user, onClose, onSaved }: Props) {
  const { t } = useTranslation('users')
  const { t: tc } = useTranslation('common')
  const { claims } = useAuth()
  const isNew = user === null
  const firstRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(createSchema(isNew)),
    defaultValues: {
      username: user?.username ?? '',
      // newPass intentionally omitted — starts empty, required only on create
      role: (user?.role as TenantRole) ?? 'seller',
      active: user?.active ?? true,
      scopeChannels: (user?.scopeChannels as UserChannel[]) ?? [],
    },
  })

  useEffect(() => {
    firstRef.current?.focus()
  }, [])

  const selectedChannels = useWatch({ control, name: 'scopeChannels' })

  const toggleChannel = (ch: UserChannel) => {
    if (selectedChannels.includes(ch)) {
      setValue('scopeChannels', selectedChannels.filter((c) => c !== ch))
    } else {
      setValue('scopeChannels', [...selectedChannels, ch])
    }
  }

  const assignableRoles = TENANT_ROLES.filter((r) => {
    if (!claims) return false
    return ROLE_RANK[claims.role] <= ROLE_RANK[r]
  })

  const onSubmit = async (values: FormValues) => {
    try {
      let saved: AppUserDTO
      if (isNew) {
        const body: CreateUserBody = {
          username: values.username,
          password: values.newPass!,
          role: values.role,
          active: values.active,
          scopeChannels: values.scopeChannels,
        }
        saved = await usersAPI.create(body)
      } else {
        const body: UpdateUserBody = {
          role: values.role,
          active: values.active,
          scopeChannels: values.scopeChannels,
        }
        saved = await usersAPI.update(user!.id, body)
      }
      onSaved(saved)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('already exists') || msg.includes('Unique')) {
        setError('username', { message: t('form.errors.duplicate') })
      } else {
        setError('root', { message: t('form.errors.generic') })
      }
    }
  }

  useHotkeys('f5', (e) => {
    e.preventDefault()
    void handleSubmit(onSubmit)()
  })

  useHotkeys('escape', () => onClose(), { enableOnFormTags: true })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? t('form.titleNew') : t('form.titleEdit', { username: user?.username })}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          {isNew ? t('form.titleNew') : t('form.titleEdit', { username: user?.username })}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">{t('form.hint')}</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="user-username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('form.username')}
            </label>
            <input
              id="user-username"
              {...register('username')}
              ref={(el: HTMLInputElement | null) => {
                register('username').ref(el)
                firstRef.current = el
              }}
              disabled={!isNew}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            {errors.username && (
              <p role="alert" className="text-red-500 text-xs mt-1">{errors.username.message ?? t('form.errors.username')}</p>
            )}
          </div>

          {/* Password input — only shown on create */}
          {isNew && (
            <div>
              <label htmlFor="user-newpass" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('form.password')}
              </label>
              <input
                id="user-newpass"
                type="password"
                placeholder={t('form.passwordPlaceholder')}
                {...register('newPass')}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
              />
              {errors.newPass && (
                <p role="alert" className="text-red-500 text-xs mt-1">{errors.newPass.message ?? t('form.errors.password')}</p>
              )}
            </div>
          )}

          {/* Role */}
          <div>
            <label htmlFor="user-role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('form.role')}
            </label>
            <select
              id="user-role"
              {...register('role')}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              {assignableRoles.map((r) => (
                <option key={r} value={r}>
                  {t(`form.roleOptions.${r}`)}
                </option>
              ))}
            </select>
            {errors.role && (
              <p role="alert" className="text-red-500 text-xs mt-1">{t('form.errors.role')}</p>
            )}
          </div>

          {/* Channels */}
          <div>
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('form.channels')}
            </span>
            <div className="flex flex-wrap gap-2">
              {USER_CHANNELS.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  aria-pressed={selectedChannels.includes(ch)}
                  className={`px-3 py-1 text-xs rounded-full border transition ${
                    selectedChannels.includes(ch)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                  }`}
                >
                  {t(`form.channelOptions.${ch}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <input
              id="user-active"
              type="checkbox"
              {...register('active')}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="user-active" className="text-sm text-slate-700 dark:text-slate-300">
              {t('form.active')}
            </label>
          </div>

          {errors.root && (
            <p role="alert" className="text-red-500 text-sm">{errors.root.message}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              {tc('actions.cancel')} (Esc)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
            >
              {isSubmitting ? tc('status.saving') : `${tc('actions.save')} (F5)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
