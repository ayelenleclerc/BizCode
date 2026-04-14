import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Static imports — all locale files bundled at build time.
// Tauri desktop apps cannot use HTTP backend, so we import statically.
import commonEs from '@/locales/es/common.json'
import clientesEs from '@/locales/es/clientes.json'
import articulosEs from '@/locales/es/articulos.json'
import facturacionEs from '@/locales/es/facturacion.json'
import usersEs from '@/locales/es/users.json'

import commonEn from '@/locales/en/common.json'
import clientesEn from '@/locales/en/clientes.json'
import articulosEn from '@/locales/en/articulos.json'
import facturacionEn from '@/locales/en/facturacion.json'
import usersEn from '@/locales/en/users.json'

import commonPt from '@/locales/pt-BR/common.json'
import clientesPt from '@/locales/pt-BR/clientes.json'
import articulosPt from '@/locales/pt-BR/articulos.json'
import facturacionPt from '@/locales/pt-BR/facturacion.json'
import usersPt from '@/locales/pt-BR/users.json'

// Persist language preference in localStorage
const savedLang = typeof localStorage !== 'undefined'
  ? (localStorage.getItem('lang') ?? 'es')
  : 'es'

i18n
  .use(initReactI18next)
  .init({
    lng: savedLang,
    fallbackLng: 'es',
    defaultNS: 'common',
    ns: ['common', 'clientes', 'articulos', 'facturacion', 'users'],
    resources: {
      es: {
        common: commonEs,
        clientes: clientesEs,
        articulos: articulosEs,
        facturacion: facturacionEs,
        users: usersEs,
      },
      en: {
        common: commonEn,
        clientes: clientesEn,
        articulos: articulosEn,
        facturacion: facturacionEn,
        users: usersEn,
      },
      'pt-BR': {
        common: commonPt,
        clientes: clientesPt,
        articulos: articulosPt,
        facturacion: facturacionPt,
        users: usersPt,
      },
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })

export default i18n
