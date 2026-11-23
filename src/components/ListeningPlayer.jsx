import { useEffect, useRef, useState } from 'react'
import { listenUrl } from '../data/site'
import { useAudioUrl } from '../lib/audio'
import { spokenAfter, spokenBefore } from '../lib/prompt'
import { hasEnglishVoice, playScript, speechSupported } from '../lib/speech'
import QrCode from './QrCode'

const SPEAKER_NAME = { W: '여', M: '남', N: '해설' }

/**
 * 듣기 플레이어. 녹음된 음원(audio manifest)이 있으면 그것을, 없으면 브라우저 음성으로 읽어 준다.
 * maxPlays를 주면 그 횟수까지만 재생할 수 있다(모의고사는 2회).
 * showQr: 이 문항의 듣기 QR(휴대폰으로 스캔하면 이 문항만 재생된다)을 함께 보여 준다.
 */
export default function ListeningPlayer({ question, rate, showScript, maxPlays = Infinity, showQr = false }) {
  const { id, script: lines } = question
  const audioUrl = useAudioUrl(id)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(-1)
  const [plays, setPlays] = useState(0)
  const cancelRef = useRef(null)
  // 음성 목록은 늦게 채워지는 브라우저가 있어 목록이 바뀔 때마다 다시 확인한다.
  const [englishVoice, setEnglishVoice] = useState(() => hasEnglishVoice())
  useEffect(() => {
    if (!speechSupported) return undefined
    const update = () => setEnglishVoice(hasEnglishVoice())
    window.speechSynthesis.addEventListener('voiceschanged', update)
    update()
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])
  const audioRef = useRef(null)

  useEffect(
    () => () => {
      cancelRef.current?.()
      audioRef.current?.pause()
    },
    [],
  )

  const exhausted = plays >= maxPlays

  const play = () => {
    if (exhausted) return
    setPlays((count) => count + 1)
    setPlaying(true)
    if (audioUrl && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => setPlaying(false))
      return
    }
    cancelRef.current?.()
    cancelRef.current = playScript(lines, {
      rate,
      intro: spokenBefore(question),
      outro: spokenAfter(question),
      onLine: setCurrent,
      onEnd: () => {
        setPlaying(false)
        setCurrent(-1)
      },
    })
  }

  const stop = () => {
    cancelRef.current?.()
    cancelRef.current = null
    audioRef.current?.pause()
    setPlaying(false)
    setCurrent(-1)
  }

  const canPlay = Boolean(audioUrl) || speechSupported
  const label = playing ? '■ 정지' : exhausted ? '재생 횟수를 모두 썼어요' : plays === 0 ? '▶ 듣기 시작' : '↻ 다시 듣기'

  return (
    <div className="listening">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" onEnded={() => setPlaying(false)} />}
      <div className="listening-bar">
        {canPlay ? (
          <button
            type="button"
            className="btn primary"
            disabled={exhausted && !playing}
            onClick={playing ? stop : play}
          >
            {label}
          </button>
        ) : (
          <p className="muted">이 브라우저는 음성 재생을 지원하지 않습니다. 대본으로 풀어 보세요.</p>
        )}
        <span className="muted small">
          {Number.isFinite(maxPlays) ? `${plays} / ${maxPlays}회 재생` : plays > 0 ? `${plays}회 재생` : ''}
        </span>
      </div>
      {showQr && (
        <div className="listen-qr">
          <QrCode value={listenUrl(id)} size={88} />
          <p className="muted small">휴대폰으로 스캔하면 이 문항의 듣기가 열려요.</p>
        </div>
      )}
      {!audioUrl && (
        <p className="muted small">
          {englishVoice
            ? '임시 음성(브라우저 내장)입니다. 정식 버전은 녹음된 영어 음원으로 교체됩니다.'
            : '이 회차는 아직 녹음 음원이 없고, 이 기기에는 영어 음성이 없어 영어 발음이 부정확합니다. 녹음 음원이 있는 회차(1~10회)를 이용하세요.'}
        </p>
      )}

      {showScript && (
        <ol className="script">
          {lines.map((line, index) => (
            <li key={index} className={index === current ? 'on' : ''}>
              <b>{SPEAKER_NAME[line.speaker] || line.speaker}</b> {line.text}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
