// 임시 듣기 음성: 브라우저 내장 음성 합성(Web Speech API).
// 정식 버전에서는 미리 생성한 영어 음원 파일(mp3)로 교체한다. 호출부는 playScript만 알면 된다.
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

export const speechSupported = Boolean(synth)

const FEMALE_HINT = /female|zira|samantha|susan|aria|jenny|hazel|karen|victoria|catherine/i
const MALE_HINT = /\bmale\b|david|mark|george|guy|daniel|alex|richard|james|ryan/i

function pickVoice(speaker) {
  const voices = synth.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'))
  if (voices.length === 0) return null
  if (speaker === 'W') return voices.find((v) => FEMALE_HINT.test(v.name)) || voices[0]
  return voices.find((v) => MALE_HINT.test(v.name) && !FEMALE_HINT.test(v.name)) || voices[0]
}

/**
 * 대본(lines: [{speaker:'W'|'M'|'N', text}])을 순서대로 읽어 준다.
 * 반환값은 재생을 중단하는 함수.
 */
export function playScript(lines, { rate = 0.95, onLine, onEnd } = {}) {
  if (!synth) {
    onEnd?.()
    return () => {}
  }
  synth.cancel()
  let cancelled = false

  const speak = (index) => {
    if (cancelled) return
    if (index >= lines.length) {
      onEnd?.()
      return
    }
    onLine?.(index)
    const line = lines[index]
    const utterance = new SpeechSynthesisUtterance(line.text)
    utterance.lang = 'en-US'
    utterance.rate = rate
    // 음성 목록에 남/여 구분이 없는 환경을 위해 음높이도 함께 달리한다.
    utterance.pitch = line.speaker === 'W' ? 1.15 : line.speaker === 'M' ? 0.85 : 1
    const voice = pickVoice(line.speaker)
    if (voice) utterance.voice = voice
    utterance.onend = () => speak(index + 1)
    utterance.onerror = () => {
      if (!cancelled) onEnd?.()
    }
    synth.speak(utterance)
  }

  speak(0)
  return () => {
    cancelled = true
    synth.cancel()
  }
}

export function stopSpeech() {
  synth?.cancel()
}
