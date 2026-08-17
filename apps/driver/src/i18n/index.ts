import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import enCommon from './locales/en/common.json'
import enRuta from './locales/en/ruta.json'
import enCobros from './locales/en/cobros.json'
import esCommon from './locales/es/common.json'
import esRuta from './locales/es/ruta.json'
import esCobros from './locales/es/cobros.json'
import ptCommon from './locales/pt-BR/common.json'
import ptRuta from './locales/pt-BR/ruta.json'
import ptCobros from './locales/pt-BR/cobros.json'

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'es'
const lng = deviceLang === 'en' || deviceLang === 'pt' ? (deviceLang === 'pt' ? 'pt-BR' : 'en') : 'es'

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng,
  fallbackLng: 'es',
  resources: {
    en: { common: enCommon, ruta: enRuta, cobros: enCobros },
    es: { common: esCommon, ruta: esRuta, cobros: esCobros },
    'pt-BR': { common: ptCommon, ruta: ptRuta, cobros: ptCobros },
  },
  ns: ['common', 'ruta', 'cobros'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n
