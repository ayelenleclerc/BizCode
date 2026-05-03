import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Static imports — all locale files bundled at build time.
// Tauri desktop apps cannot use HTTP backend, so we import statically.
import commonEs from '@/locales/es/common.json'
import clientesEs from '@/locales/es/clientes.json'
import articulosEs from '@/locales/es/articulos.json'
import facturacionEs from '@/locales/es/facturacion.json'
import zonasEntregaEs from '@/locales/es/zonasEntrega.json'

import commonEn from '@/locales/en/common.json'
import clientesEn from '@/locales/en/clientes.json'
import articulosEn from '@/locales/en/articulos.json'
import facturacionEn from '@/locales/en/facturacion.json'
import zonasEntregaEn from '@/locales/en/zonasEntrega.json'

import commonPt from '@/locales/pt-BR/common.json'
import clientesPt from '@/locales/pt-BR/clientes.json'
import articulosPt from '@/locales/pt-BR/articulos.json'
import facturacionPt from '@/locales/pt-BR/facturacion.json'
import zonasEntregaPt from '@/locales/pt-BR/zonasEntrega.json'

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
    ns: ['common', 'clientes', 'articulos', 'facturacion', 'zonasEntrega'],
    resources: {
      es: {
        common: commonEs,
        clientes: clientesEs,
        articulos: articulosEs,
        facturacion: facturacionEs,
        zonasEntrega: zonasEntregaEs,
      },
      en: {
        common: commonEn,
        clientes: clientesEn,
        articulos: articulosEn,
        facturacion: facturacionEn,
        zonasEntrega: zonasEntregaEn,
      },
      'pt-BR': {
        common: commonPt,
        clientes: clientesPt,
        articulos: articulosPt,
        facturacion: facturacionPt,
        zonasEntrega: zonasEntregaPt,
      },
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })

export default i18n
