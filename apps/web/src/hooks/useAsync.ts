import { useEffect, useState } from 'react'

export type UseAsyncResult<T> = {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * @en Runs an async function once and exposes loading, data, and error state.
 * @es Ejecuta una función async una vez y expone estado de carga, datos y error.
 * @pt-BR Executa uma função assíncrona uma vez e expõe estado de carregamento, dados e erro.
 */
export function useAsync<T>(asyncFn: () => Promise<T>, deps: readonly unknown[] = []): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    void asyncFn()
      .then((result) => {
        if (!cancelled) {
          setData(result)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls refresh via deps
  }, deps)

  return { data, loading, error }
}
