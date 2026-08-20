import type { ExpoConfig } from 'expo/config'

/**
 * @en Expo config for App Driver. Sets EAS projectId and updates URL only when EAS_DRIVER_PROJECT_ID is set (operator `eas init`). TLS pins (#220) via withApiTlsPinning when EXPO_PUBLIC_API_TLS_PINS is set.
 * @es Config Expo de App Driver. Solo setea projectId y URL de updates si existe EAS_DRIVER_PROJECT_ID (`eas init` del operador). Pins TLS (#220) vía withApiTlsPinning si hay EXPO_PUBLIC_API_TLS_PINS.
 * @pt-BR Config Expo do App Driver. Só define projectId e URL de updates se EAS_DRIVER_PROJECT_ID existir (`eas init` do operador). Pins TLS (#220) via withApiTlsPinning se EXPO_PUBLIC_API_TLS_PINS existir.
 */
const easProjectId = process.env.EAS_DRIVER_PROJECT_ID?.trim() ?? ''

const config = {
  name: 'BizCode Driver',
  slug: 'bizcode-driver',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'bizcode-driver',
  newArchEnabled: true,
  jsEngine: 'hermes',
  runtimeVersion: {
    policy: 'appVersion',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-sqlite',
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
        color: '#1E40AF',
      },
    ],
    'expo-updates',
    [
      'expo-image-picker',
      {
        cameraPermission: 'Allow BizCode Driver to take a photo for proof of delivery.',
        photosPermission: 'Allow BizCode Driver to choose a photo for proof of delivery.',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          enableMinifyInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
        },
      },
    ],
    '../../plugins/withApiTlsPinning.cjs',
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.bizcode.driver',
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
    },
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
