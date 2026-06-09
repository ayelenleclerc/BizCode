export type ClienteDbfRecord = {
  CODIGO: number
  RSOCIAL: string
  CUIT?: string
  COND?: string
  BAJA?: boolean
  CREDITO?: number
}

export const validClienteSamples: ClienteDbfRecord[] = [
  {
    CODIGO: 1001,
    RSOCIAL: 'Cliente Valido SA',
    CUIT: undefined,
    COND: 'RI',
    BAJA: false,
    CREDITO: 15000,
  },
  {
    CODIGO: 1002,
    RSOCIAL: 'Acentos Ñandú',
    CUIT: undefined,
    COND: 'Mono',
    BAJA: false,
  },
]

export const invalidClienteSamples: Array<{ label: string; row: Partial<ClienteDbfRecord> }> = [
  { label: 'invalid condIva', row: { CODIGO: 2001, RSOCIAL: 'Condicion invalida', CUIT: '30-71234567-8', COND: 'R' } },
  { label: 'missing rsocial', row: { CODIGO: 2002, RSOCIAL: '', CUIT: '20-12345678-3', COND: 'RI' } },
]

export const edgeClienteSamples: ClienteDbfRecord[] = [
  {
    CODIGO: 3001,
    RSOCIAL: 'Caracteres "especiales"',
    CUIT: undefined,
    COND: 'Exento',
    BAJA: true,
    CREDITO: 0,
  },
]
