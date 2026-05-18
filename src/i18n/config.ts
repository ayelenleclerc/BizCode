import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Static imports — all locale files bundled at build time.
// Tauri desktop apps cannot use HTTP backend, so we import statically.
import commonEs from '@/locales/es/common.json'
import clientesEs from '@/locales/es/clientes.json'
import articulosEs from '@/locales/es/articulos.json'
import facturacionEs from '@/locales/es/facturacion.json'
import zonasEntregaEs from '@/locales/es/zonasEntrega.json'
import chatEs from '@/locales/es/chat.json'
import proveedoresEs from '@/locales/es/proveedores.json'
import auditEs from '@/locales/es/audit.json'
import cobrosEs from '@/locales/es/cobros.json'
import pedidosEs from '@/locales/es/pedidos.json'
import finanzasEs from '@/locales/es/finanzas.json'
import reportesEs from '@/locales/es/reportes.json'
import logisticaEs from '@/locales/es/logistica.json'
import empresaEs from '@/locales/es/empresa.json'

import commonEn from '@/locales/en/common.json'
import clientesEn from '@/locales/en/clientes.json'
import articulosEn from '@/locales/en/articulos.json'
import facturacionEn from '@/locales/en/facturacion.json'
import zonasEntregaEn from '@/locales/en/zonasEntrega.json'
import chatEn from '@/locales/en/chat.json'
import proveedoresEn from '@/locales/en/proveedores.json'
import auditEn from '@/locales/en/audit.json'
import cobrosEn from '@/locales/en/cobros.json'
import pedidosEn from '@/locales/en/pedidos.json'
import finanzasEn from '@/locales/en/finanzas.json'
import reportesEn from '@/locales/en/reportes.json'
import logisticaEn from '@/locales/en/logistica.json'
import empresaEn from '@/locales/en/empresa.json'

import commonPt from '@/locales/pt-BR/common.json'
import clientesPt from '@/locales/pt-BR/clientes.json'
import articulosPt from '@/locales/pt-BR/articulos.json'
import facturacionPt from '@/locales/pt-BR/facturacion.json'
import zonasEntregaPt from '@/locales/pt-BR/zonasEntrega.json'
import chatPt from '@/locales/pt-BR/chat.json'
import proveedoresPt from '@/locales/pt-BR/proveedores.json'
import auditPt from '@/locales/pt-BR/audit.json'
import cobrosPt from '@/locales/pt-BR/cobros.json'
import pedidosPt from '@/locales/pt-BR/pedidos.json'
import finanzasPt from '@/locales/pt-BR/finanzas.json'
import reportesPt from '@/locales/pt-BR/reportes.json'
import logisticaPt from '@/locales/pt-BR/logistica.json'
import empresaPt from '@/locales/pt-BR/empresa.json'

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
    ns: ['common', 'clientes', 'articulos', 'proveedores', 'facturacion', 'pedidos', 'cobros', 'finanzas', 'reportes', 'logistica', 'zonasEntrega', 'empresa', 'chat', 'audit'],
    resources: {
      es: {
        common: commonEs,
        clientes: clientesEs,
        articulos: articulosEs,
        proveedores: proveedoresEs,
        facturacion: facturacionEs,
        pedidos: pedidosEs,
        zonasEntrega: zonasEntregaEs,
        chat: chatEs,
        audit: auditEs,
        cobros: cobrosEs,
        finanzas: finanzasEs,
        reportes: reportesEs,
        logistica: logisticaEs,
        empresa: empresaEs,
      },
      en: {
        common: commonEn,
        clientes: clientesEn,
        articulos: articulosEn,
        proveedores: proveedoresEn,
        facturacion: facturacionEn,
        pedidos: pedidosEn,
        zonasEntrega: zonasEntregaEn,
        chat: chatEn,
        audit: auditEn,
        cobros: cobrosEn,
        finanzas: finanzasEn,
        reportes: reportesEn,
        logistica: logisticaEn,
        empresa: empresaEn,
      },
      'pt-BR': {
        common: commonPt,
        clientes: clientesPt,
        articulos: articulosPt,
        proveedores: proveedoresPt,
        facturacion: facturacionPt,
        pedidos: pedidosPt,
        zonasEntrega: zonasEntregaPt,
        chat: chatPt,
        audit: auditPt,
        cobros: cobrosPt,
        finanzas: finanzasPt,
        reportes: reportesPt,
        logistica: logisticaPt,
        empresa: empresaPt,
      },
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })

export default i18n
