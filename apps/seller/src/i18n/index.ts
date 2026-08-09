import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import enCommon from './locales/en/common.json'
import enClientes from './locales/en/clientes.json'
import enPedidos from './locales/en/pedidos.json'
import esCommon from './locales/es/common.json'
import esClientes from './locales/es/clientes.json'
import esPedidos from './locales/es/pedidos.json'
import ptCommon from './locales/pt-BR/common.json'
import ptClientes from './locales/pt-BR/clientes.json'
import ptPedidos from './locales/pt-BR/pedidos.json'

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'es'
const lng = deviceLang === 'en' || deviceLang === 'pt' ? (deviceLang === 'pt' ? 'pt-BR' : 'en') : 'es'

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng,
  fallbackLng: 'es',
  resources: {
    en: { common: enCommon, clientes: enClientes, pedidos: enPedidos },
    es: { common: esCommon, clientes: esClientes, pedidos: esPedidos },
    'pt-BR': { common: ptCommon, clientes: ptClientes, pedidos: ptPedidos },
  },
  ns: ['common', 'clientes', 'pedidos'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n
