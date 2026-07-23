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
import comprasEs from '@/locales/es/compras.json'
import recuentosEs from '@/locales/es/recuentos.json'
import repartosEs from '@/locales/es/repartos.json'
import podEs from '@/locales/es/pod.json'
import auditEs from '@/locales/es/audit.json'
import cobrosEs from '@/locales/es/cobros.json'
import pedidosEs from '@/locales/es/pedidos.json'
import contratosEs from '@/locales/es/contratos.json'
import ordenesTrabajoEs from '@/locales/es/ordenesTrabajo.json'
import garantiasEs from '@/locales/es/garantias.json'
import cajaEs from '@/locales/es/caja.json'
import finanzasEs from '@/locales/es/finanzas.json'
import reportesEs from '@/locales/es/reportes.json'
import dashboardAnalyticsEs from '@/locales/es/dashboard-analytics.json'
import logisticaEs from '@/locales/es/logistica.json'
import pickingEs from '@/locales/es/picking.json'
import seguimientoEs from '@/locales/es/seguimiento.json'
import logisticaReportesEs from '@/locales/es/logisticaReportes.json'
import empresaEs from '@/locales/es/empresa.json'
import portalEs from '@/locales/es/portal.json'
import listasPreciosEs from '@/locales/es/listasPrecios.json'
import categoriasArticuloEs from '@/locales/es/categoriasArticulo.json'
import variantesEs from '@/locales/es/variantes.json'

import commonEn from '@/locales/en/common.json'
import clientesEn from '@/locales/en/clientes.json'
import articulosEn from '@/locales/en/articulos.json'
import facturacionEn from '@/locales/en/facturacion.json'
import zonasEntregaEn from '@/locales/en/zonasEntrega.json'
import chatEn from '@/locales/en/chat.json'
import proveedoresEn from '@/locales/en/proveedores.json'
import comprasEn from '@/locales/en/compras.json'
import recuentosEn from '@/locales/en/recuentos.json'
import repartosEn from '@/locales/en/repartos.json'
import podEn from '@/locales/en/pod.json'
import auditEn from '@/locales/en/audit.json'
import cobrosEn from '@/locales/en/cobros.json'
import pedidosEn from '@/locales/en/pedidos.json'
import contratosEn from '@/locales/en/contratos.json'
import ordenesTrabajoEn from '@/locales/en/ordenesTrabajo.json'
import garantiasEn from '@/locales/en/garantias.json'
import cajaEn from '@/locales/en/caja.json'
import finanzasEn from '@/locales/en/finanzas.json'
import reportesEn from '@/locales/en/reportes.json'
import dashboardAnalyticsEn from '@/locales/en/dashboard-analytics.json'
import logisticaEn from '@/locales/en/logistica.json'
import pickingEn from '@/locales/en/picking.json'
import seguimientoEn from '@/locales/en/seguimiento.json'
import logisticaReportesEn from '@/locales/en/logisticaReportes.json'
import empresaEn from '@/locales/en/empresa.json'
import portalEn from '@/locales/en/portal.json'
import listasPreciosEn from '@/locales/en/listasPrecios.json'
import categoriasArticuloEn from '@/locales/en/categoriasArticulo.json'
import variantesEn from '@/locales/en/variantes.json'

import commonPt from '@/locales/pt-BR/common.json'
import clientesPt from '@/locales/pt-BR/clientes.json'
import articulosPt from '@/locales/pt-BR/articulos.json'
import facturacionPt from '@/locales/pt-BR/facturacion.json'
import zonasEntregaPt from '@/locales/pt-BR/zonasEntrega.json'
import chatPt from '@/locales/pt-BR/chat.json'
import proveedoresPt from '@/locales/pt-BR/proveedores.json'
import comprasPt from '@/locales/pt-BR/compras.json'
import recuentosPt from '@/locales/pt-BR/recuentos.json'
import repartosPt from '@/locales/pt-BR/repartos.json'
import podPt from '@/locales/pt-BR/pod.json'
import auditPt from '@/locales/pt-BR/audit.json'
import cobrosPt from '@/locales/pt-BR/cobros.json'
import pedidosPt from '@/locales/pt-BR/pedidos.json'
import contratosPt from '@/locales/pt-BR/contratos.json'
import ordenesTrabajoPt from '@/locales/pt-BR/ordenesTrabajo.json'
import garantiasPt from '@/locales/pt-BR/garantias.json'
import cajaPt from '@/locales/pt-BR/caja.json'
import finanzasPt from '@/locales/pt-BR/finanzas.json'
import reportesPt from '@/locales/pt-BR/reportes.json'
import dashboardAnalyticsPt from '@/locales/pt-BR/dashboard-analytics.json'
import logisticaPt from '@/locales/pt-BR/logistica.json'
import pickingPt from '@/locales/pt-BR/picking.json'
import seguimientoPt from '@/locales/pt-BR/seguimiento.json'
import logisticaReportesPt from '@/locales/pt-BR/logisticaReportes.json'
import empresaPt from '@/locales/pt-BR/empresa.json'
import portalPt from '@/locales/pt-BR/portal.json'
import listasPreciosPt from '@/locales/pt-BR/listasPrecios.json'
import categoriasArticuloPt from '@/locales/pt-BR/categoriasArticulo.json'
import variantesPt from '@/locales/pt-BR/variantes.json'

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
    ns: ['common', 'clientes', 'articulos', 'proveedores', 'compras', 'recuentos', 'repartos', 'pod', 'picking', 'seguimiento', 'logisticaReportes', 'facturacion', 'pedidos', 'contratos', 'ordenesTrabajo', 'garantias', 'caja', 'cobros', 'finanzas', 'reportes', 'dashboardAnalytics', 'logistica', 'zonasEntrega', 'empresa', 'portal', 'chat', 'audit', 'listasPrecios', 'categoriasArticulo', 'variantes'],
    resources: {
      es: {
        common: commonEs,
        clientes: clientesEs,
        articulos: articulosEs,
        proveedores: proveedoresEs,
        compras: comprasEs,
        recuentos: recuentosEs,
        repartos: repartosEs,
        pod: podEs,
        facturacion: facturacionEs,
        pedidos: pedidosEs,
        contratos: contratosEs,
        ordenesTrabajo: ordenesTrabajoEs,
        garantias: garantiasEs,
        caja: cajaEs,
        zonasEntrega: zonasEntregaEs,
        chat: chatEs,
        audit: auditEs,
        cobros: cobrosEs,
        finanzas: finanzasEs,
        reportes: reportesEs,
        dashboardAnalytics: dashboardAnalyticsEs,
        logistica: logisticaEs,
        picking: pickingEs,
        seguimiento: seguimientoEs,
        logisticaReportes: logisticaReportesEs,
        empresa: empresaEs,
        portal: portalEs,
        listasPrecios: listasPreciosEs,
        categoriasArticulo: categoriasArticuloEs,
        variantes: variantesEs,
      },
      en: {
        common: commonEn,
        clientes: clientesEn,
        articulos: articulosEn,
        proveedores: proveedoresEn,
        compras: comprasEn,
        recuentos: recuentosEn,
        repartos: repartosEn,
        pod: podEn,
        facturacion: facturacionEn,
        pedidos: pedidosEn,
        contratos: contratosEn,
        ordenesTrabajo: ordenesTrabajoEn,
        garantias: garantiasEn,
        caja: cajaEn,
        zonasEntrega: zonasEntregaEn,
        chat: chatEn,
        audit: auditEn,
        cobros: cobrosEn,
        finanzas: finanzasEn,
        reportes: reportesEn,
        dashboardAnalytics: dashboardAnalyticsEn,
        logistica: logisticaEn,
        picking: pickingEn,
        seguimiento: seguimientoEn,
        logisticaReportes: logisticaReportesEn,
        empresa: empresaEn,
        portal: portalEn,
        listasPrecios: listasPreciosEn,
        categoriasArticulo: categoriasArticuloEn,
        variantes: variantesEn,
      },
      'pt-BR': {
        common: commonPt,
        clientes: clientesPt,
        articulos: articulosPt,
        proveedores: proveedoresPt,
        compras: comprasPt,
        recuentos: recuentosPt,
        repartos: repartosPt,
        pod: podPt,
        facturacion: facturacionPt,
        pedidos: pedidosPt,
        contratos: contratosPt,
        ordenesTrabajo: ordenesTrabajoPt,
        garantias: garantiasPt,
        caja: cajaPt,
        zonasEntrega: zonasEntregaPt,
        chat: chatPt,
        audit: auditPt,
        cobros: cobrosPt,
        finanzas: finanzasPt,
        reportes: reportesPt,
        dashboardAnalytics: dashboardAnalyticsPt,
        logistica: logisticaPt,
        picking: pickingPt,
        seguimiento: seguimientoPt,
        logisticaReportes: logisticaReportesPt,
        empresa: empresaPt,
        portal: portalPt,
        listasPrecios: listasPreciosPt,
        categoriasArticulo: categoriasArticuloPt,
        variantes: variantesPt,
      },
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })

export default i18n
