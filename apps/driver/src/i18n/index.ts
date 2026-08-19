import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import enCommon from './locales/en/common.json'
import enRuta from './locales/en/ruta.json'
import enCobros from './locales/en/cobros.json'
import enPod from './locales/en/pod.json'
import esCommon from './locales/es/common.json'
import esRuta from './locales/es/ruta.json'
import esCobros from './locales/es/cobros.json'
import esPod from './locales/es/pod.json'
import ptCommon from './locales/pt-BR/common.json'
import ptRuta from './locales/pt-BR/ruta.json'
import ptCobros from './locales/pt-BR/cobros.json'
import ptPod from './locales/pt-BR/pod.json'
import enDevolucion from './locales/en/devolucion.json'
import esDevolucion from './locales/es/devolucion.json'
import ptDevolucion from './locales/pt-BR/devolucion.json'

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'es'
const lng = deviceLang === 'en' || deviceLang === 'pt' ? (deviceLang === 'pt' ? 'pt-BR' : 'en') : 'es'

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng,
  fallbackLng: 'es',
  resources: {
    en: { common: enCommon, ruta: enRuta, cobros: enCobros, pod: enPod, devolucion: enDevolucion },
    es: { common: esCommon, ruta: esRuta, cobros: esCobros, pod: esPod, devolucion: esDevolucion },
    'pt-BR': { common: ptCommon, ruta: ptRuta, cobros: ptCobros, pod: ptPod, devolucion: ptDevolucion },
  },
  ns: ['common', 'ruta', 'cobros', 'pod', 'devolucion'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n
