export type AppUserDTO = {
  id: number
  username: string
  role: string
  active: boolean
  scopeChannels: string[]
  scopeBranchIds: number[]
  scopeWarehouseIds: number[]
  scopeRouteIds: number[]
  createdAt: string
  updatedAt?: string
}

export type CreateUserBody = {
  username: string
  password: string
  role: string
  active?: boolean
  scopeChannels?: string[]
  scopeBranchIds?: number[]
  scopeWarehouseIds?: number[]
  scopeRouteIds?: number[]
}

export type UpdateUserBody = {
  role?: string
  active?: boolean
  scopeChannels?: string[]
  scopeBranchIds?: number[]
  scopeWarehouseIds?: number[]
  scopeRouteIds?: number[]
}

/** @deprecated Use AppUserDTO — alias for issue #155 naming */
export type AppUser = AppUserDTO
