/**
 * @en Default API base for local Expo + `npm run server` (#159).
 * @es Base API por defecto para Expo local + `npm run server` (#159).
 * @pt-BR Base da API padrão para Expo local + `npm run server` (#159).
 */
export const DRIVER_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3001/api'
