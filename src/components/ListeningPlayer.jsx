import { useEffect, useRef, useState } from 'react'
import { useAudioUrl } from '../lib/audio'
import { playScript, speechSupported } from '../lib/speech'

const SPEAKER_NAME = { W: '여', M: '남', N: '해설' }

/**
 * 듣기 플레이어. 녹음된 음원(audio manifest)이 있으면 그것을, 없으면 브라우저 음성으로 읽어 준다.
 * maxPlays를 주면 그 횟수까지만 재생할 수 있다(모의고사는 2회).
 */
export default function ListeningPlayer({ id, lines, rate, showScript, maxPlays = Infinity }) {
  const audioUrl = useAudioUrl(id)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(-1)
  const [plays, setPlays] = useState(0)
  const cancelRef = useRef(null)
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
      {!audioUrl && (
        <p className="muted small">임시 음성(브라우저 내장)입니다. 정식 버전은 녹음된 영어 음원으로 교체됩니다.</p>
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
