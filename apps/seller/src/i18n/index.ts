import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import enCommon from './locales/en/common.json'
import enClientes from './locales/en/clientes.json'
import esCommon from './locales/es/common.json'
import esClientes from './locales/es/clientes.json'
import ptCommon from './locales/pt-BR/common.json'
import ptClientes from './locales/pt-BR/clientes.json'

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'es'
const lng = deviceLang === 'en' || deviceLang === 'pt' ? (deviceLang === 'pt' ? 'pt-BR' : 'en') : 'es'

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng,
  fallbackLng: 'es',
  resources: {
    en: { common: enCommon, clientes: enClientes },
    es: { common: esCommon, clientes: esClientes },
    'pt-BR': { common: ptCommon, clientes: ptClientes },
  },
  ns: ['common', 'clientes'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n
