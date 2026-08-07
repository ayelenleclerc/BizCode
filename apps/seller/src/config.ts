/**
 * @en Default API base for local Expo + `npm run server` (#167).
 * @es Base API por defecto para Expo local + `npm run server` (#167).
 * @pt-BR Base da API padrão para Expo local + `npm run server` (#167).
 */
export const SELLER_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3001/api'
