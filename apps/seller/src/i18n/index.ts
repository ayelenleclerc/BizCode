import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import enCommon from './locales/en/common.json'
import enClientes from './locales/en/clientes.json'
import enPedidos from './locales/en/pedidos.json'
import enAgenda from './locales/en/agenda.json'
import esCommon from './locales/es/common.json'
import esClientes from './locales/es/clientes.json'
import esPedidos from './locales/es/pedidos.json'
import esAgenda from './locales/es/agenda.json'
import ptCommon from './locales/pt-BR/common.json'
import ptClientes from './locales/pt-BR/clientes.json'
import ptPedidos from './locales/pt-BR/pedidos.json'
import ptAgenda from './locales/pt-BR/agenda.json'

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'es'
const lng = deviceLang === 'en' || deviceLang === 'pt' ? (deviceLang === 'pt' ? 'pt-BR' : 'en') : 'es'

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng,
  fallbackLng: 'es',
  resources: {
    en: { common: enCommon, clientes: enClientes, pedidos: enPedidos, agenda: enAgenda },
    es: { common: esCommon, clientes: esClientes, pedidos: esPedidos, agenda: esAgenda },
    'pt-BR': { common: ptCommon, clientes: ptClientes, pedidos: ptPedidos, agenda: ptAgenda },
  },
  ns: ['common', 'clientes', 'pedidos', 'agenda'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n
