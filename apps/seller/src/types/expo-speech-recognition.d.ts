declare module 'expo-speech-recognition' {
  export const ExpoSpeechRecognitionModule: {
    getPermissionsAsync: () => Promise<{ granted: boolean }>
    requestPermissionsAsync: () => Promise<{ granted: boolean }>
    start: (options: {
      lang?: string
      interimResults?: boolean
      continuous?: boolean
      requiresOnDeviceRecognition?: boolean
    }) => void
    stop: () => void
    addListener: (
      event: 'result' | 'end' | 'error',
      cb: (ev: {
        results?: Array<{ transcript?: string }>
        message?: string
      }) => void,
    ) => { remove: () => void }
  }
}
