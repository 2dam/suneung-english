import { useEffect, useRef, useState } from 'react'
import { playScript, speechSupported } from '../lib/speech'

const SPEAKER_NAME = { W: '여', M: '남', N: '해설' }

export default function ListeningPlayer({ lines, rate, showScript }) {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(-1)
  const [plays, setPlays] = useState(0)
  const cancelRef = useRef(null)

  useEffect(() => () => cancelRef.current?.(), [])

  const play = () => {
    cancelRef.current?.()
    setPlaying(true)
    setPlays((count) => count + 1)
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
    setPlaying(false)
    setCurrent(-1)
  }

  return (
    <div className="listening">
      <div className="listening-bar">
        {speechSupported ? (
          <button type="button" className="btn primary" onClick={playing ? stop : play}>
            {playing ? '■ 정지' : plays === 0 ? '▶ 듣기 시작' : '↻ 다시 듣기'}
          </button>
        ) : (
          <p className="muted">이 브라우저는 음성 재생을 지원하지 않습니다. 대본으로 풀어 보세요.</p>
        )}
        <span className="muted small">{plays > 0 ? `${plays}회 재생` : '실전에서는 2번 들려줍니다'}</span>
      </div>
      <p className="muted small">임시 음성(브라우저 내장)입니다. 정식 버전은 녹음된 영어 음원으로 교체됩니다.</p>

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
