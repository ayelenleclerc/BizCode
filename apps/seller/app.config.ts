import type { ExpoConfig } from 'expo/config'

/**
 * @en Expo config for App Seller. Sets EAS projectId and updates URL only when EAS_PROJECT_ID is set (operator `eas init`).
 * @es Config Expo de App Seller. Solo setea projectId y URL de updates si existe EAS_PROJECT_ID (`eas init` del operador).
 * @pt-BR Config Expo do App Seller. Só define projectId e URL de updates se EAS_PROJECT_ID existir (`eas init` do operador).
 */
const easProjectId = process.env.EAS_PROJECT_ID?.trim() ?? ''

const config = {
  name: 'BizCode Seller',
  slug: 'bizcode-seller',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'bizcode-seller',
  newArchEnabled: true,
  runtimeVersion: {
    policy: 'appVersion',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-sqlite',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow BizCode Seller to use the camera for barcode scanning.',
        barcodeScannerEnabled: true,
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
        color: '#0F766E',
      },
    ],
    'expo-updates',
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.bizcode.seller',
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#0F766E',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    package: 'com.bizcode.seller',
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
