// 임시 듣기 음성: 브라우저 내장 음성 합성(Web Speech API).
// 녹음 음원(mp3)이 없는 문항에서만 쓴다. 음원과 같은 순서로 읽는다: 한국어 발문 → 1초 → 차임벨 1초 → 1초 → 영어 대본 → (마지막 문항) 마무리.
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

export const speechSupported = Boolean(synth)

/** 이 기기에 영어 음성이 있는지. 없으면 영어 대본을 다른 언어 음성이 읽어 발음이 크게 어긋난다. */
export const hasEnglishVoice = () => Boolean(synth) && synth.getVoices().some((v) => v.lang && v.lang.toLowerCase().startsWith('en'))

const FEMALE_HINT = /female|zira|samantha|susan|aria|jenny|hazel|karen|victoria|catherine/i
const MALE_HINT = /\bmale\b|david|mark|george|guy|daniel|alex|richard|james|ryan/i

const voicesOf = (prefix) => synth.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith(prefix))

function pickVoice(speaker) {
  const voices = voicesOf('en')
  if (voices.length === 0) return null
  if (speaker === 'W') return voices.find((v) => FEMALE_HINT.test(v.name)) || voices[0]
  return voices.find((v) => MALE_HINT.test(v.name) && !FEMALE_HINT.test(v.name)) || voices[0]
}

/** 방송 시작 차임벨(두 음). 소리를 낼 수 없는 환경에서는 바로 끝낸다. */
function playChime() {
  return new Promise((resolve) => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return resolve()
      const ctx = new Ctx()
      const tone = (frequency, start, length) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.frequency.value = frequency
        osc.connect(gain)
        gain.connect(ctx.destination)
        const t = ctx.currentTime + start
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.exponentialRampToValueAtTime(0.3, t + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + length)
        osc.start(t)
        osc.stop(t + length + 0.05)
      }
      tone(1046, 0, 0.4)
      tone(784, 0.4, 0.6)
      setTimeout(() => {
        ctx.close()
        resolve()
      }, 1000)
    } catch {
      resolve()
    }
  })
}

/**
 * 대본(lines: [{speaker:'W'|'M'|'N', text}])을 순서대로 읽어 준다.
 * intro/outro: 영어 대본 앞뒤에 한국어로 읽을 문장 배열(src/lib/prompt.js). 반환값은 재생을 중단하는 함수.
 */
export function playScript(lines, { rate = 0.95, intro = [], outro = [], onLine, onEnd } = {}) {
  if (!synth) {
    onEnd?.()
    return () => {}
  }
  synth.cancel()
  let cancelled = false
  let timer = null

  // gap: 이 단계가 끝난 뒤 다음 단계까지의 쉼(ms). 한국어 발문 끝 1초 → 차임벨 1초 → 1초 → 영어.
  const steps = [
    ...intro.map((text, i) => ({ text, lang: 'ko-KR', gap: i === intro.length - 1 ? 1000 : 500 })),
    { chime: true, gap: 1000 },
    ...lines.map((line, index) => ({ text: line.text, lang: 'en-US', speaker: line.speaker, index })),
    ...outro.map((text) => ({ text, lang: 'ko-KR' })),
  ]

  const run = (i) => {
    if (cancelled) return
    if (i >= steps.length) {
      onEnd?.()
      return
    }
    const step = steps[i]
    const next = () => {
      timer = setTimeout(() => run(i + 1), step.gap ?? 500)
    }
    if (step.chime) {
      playChime().then(() => !cancelled && next())
      return
    }
    if (step.index !== undefined) onLine?.(step.index)
    const utterance = new SpeechSynthesisUtterance(step.text)
    utterance.lang = step.lang
    if (step.lang === 'ko-KR') {
      utterance.rate = 1
      const ko = voicesOf('ko')[0]
      if (ko) utterance.voice = ko
    } else {
      utterance.rate = rate
      // 음성 목록에 남/여 구분이 없는 환경을 위해 음높이도 함께 달리한다.
      utterance.pitch = step.speaker === 'W' ? 1.15 : step.speaker === 'M' ? 0.85 : 1
      const voice = pickVoice(step.speaker)
      if (voice) utterance.voice = voice
    }
    utterance.onend = next
    utterance.onerror = () => {
      if (!cancelled) onEnd?.()
    }
    synth.speak(utterance)
  }

  run(0)
  return () => {
    cancelled = true
    clearTimeout(timer)
    synth.cancel()
  }
}

export function stopSpeech() {
  synth?.cancel()
}
