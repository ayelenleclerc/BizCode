import type { ExpoConfig } from 'expo/config'

/**
 * @en Expo config for App Driver. Sets EAS projectId and updates URL only when EAS_PROJECT_ID is set (operator `eas init`).
 * @es Config Expo de App Driver. Solo setea projectId y URL de updates si existe EAS_PROJECT_ID (`eas init` del operador).
 * @pt-BR Config Expo do App Driver. Só define projectId e URL de updates se EAS_PROJECT_ID existir (`eas init` do operador).
 */
const easProjectId = process.env.EAS_PROJECT_ID?.trim() ?? ''

const config = {
  name: 'BizCode Driver',
  slug: 'bizcode-driver',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'bizcode-driver',
  newArchEnabled: true,
  runtimeVersion: {
    policy: 'appVersion',
  },
  plugins: ['expo-router', 'expo-secure-store', 'expo-updates'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.bizcode.driver',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#1E40AF',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    package: 'com.bizcode.driver',
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  experiments: {
    typedRoutes: true,
  },
} as ExpoConfig

if (easProjectId) {
  config.extra = {
    eas: {
      projectId: easProjectId,
    },
  }
  config.updates = {
    url: `https://u.expo.dev/${easProjectId}`,
  }
}

export default config
