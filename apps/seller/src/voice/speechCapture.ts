import type { SpokenLocale } from './parseSpokenOrder'

export type MicPermission = 'granted' | 'denied' | 'unavailable'

/**
 * @en Requests microphone (and speech recognition) permission (#266).
 * @es Pide permiso de micrófono (y reconocimiento de voz) (#266).
 * @pt-BR Solicita permissão de microfone (e reconhecimento de voz) (#266).
 */
export async function requestMicPermission(): Promise<MicPermission> {
  try {
    const speech = await import('expo-speech-recognition')
    const current = await speech.ExpoSpeechRecognitionModule.getPermissionsAsync()
    let status = current.granted
    if (!status) {
      const asked = await speech.ExpoSpeechRecognitionModule.requestPermissionsAsync()
      status = asked.granted
    }
    return status ? 'granted' : 'denied'
  } catch {
    try {
      const av = await import('expo-av')
      const current = await av.Audio.getPermissionsAsync()
      let granted = current.granted
      if (!granted) {
        const asked = await av.Audio.requestPermissionsAsync()
        granted = asked.granted
      }
      return granted ? 'granted' : 'denied'
    } catch {
      return 'unavailable'
    }
  }
}

/**
 * @en On-device STT for one utterance; empty string if unavailable (#266).
 * @es STT on-device de un utterance; string vacío si no está disponible (#266).
 * @pt-BR STT on-device de um utterance; string vazio se indisponível (#266).
 */
export async function transcribeOnDevice(locale: SpokenLocale): Promise<string> {
  const speech = await import('expo-speech-recognition')
  const lang = locale === 'en' ? 'en-US' : locale === 'pt-BR' ? 'pt-BR' : 'es-AR'
  return await new Promise((resolve, reject) => {
    const sub = speech.ExpoSpeechRecognitionModule.addListener('result', (ev) => {
      const text = ev.results?.[0]?.transcript?.trim() ?? ''
      sub.remove()
      end.remove()
      err.remove()
      resolve(text)
    })
    const end = speech.ExpoSpeechRecognitionModule.addListener('end', () => {
      sub.remove()
      end.remove()
      err.remove()
      resolve('')
    })
    const err = speech.ExpoSpeechRecognitionModule.addListener('error', (ev) => {
      sub.remove()
      end.remove()
      err.remove()
      reject(new Error(ev.message ?? 'speech-error'))
    })
    speech.ExpoSpeechRecognitionModule.start({
      lang,
      interimResults: false,
      continuous: false,
      requiresOnDeviceRecognition: true,
    })
    setTimeout(() => {
      try {
        speech.ExpoSpeechRecognitionModule.stop()
      } catch {
        resolve('')
      }
    }, 12_000)
  })
}

/**
 * @en Records a short m4a clip for Whisper upload (#266).
 * @es Graba un clip m4a corto para subir a Whisper (#266).
 * @pt-BR Grava um clip m4a curto para enviar ao Whisper (#266).
 */
export async function recordAudioClip(): Promise<{ uri: string; name: string; type: string } | null> {
  const av = await import('expo-av')
  await av.Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
  const recording = new av.Audio.Recording()
  await recording.prepareToRecordAsync(av.Audio.RecordingOptionsPresets.HIGH_QUALITY)
  await recording.startAsync()
  await new Promise((r) => setTimeout(r, 8_000))
  await recording.stopAndUnloadAsync()
  const uri = recording.getURI()
  if (!uri) return null
  return { uri, name: 'clip.m4a', type: 'audio/mp4' }
}
