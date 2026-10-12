import { useEffect, useRef, useState } from 'react'
import { getLevel } from '../data/levels'
import { TYPES, typeLabel } from '../data/types'
import { stopSpeech } from '../lib/speech'
import ListeningPlayer from './ListeningPlayer'
import Passage, { CIRCLED } from './Passage'
import Visual from './Visual'

const formatTime = (seconds) => {
  const safe = Math.max(0, seconds)
  const m = String(Math.floor(safe / 60)).padStart(2, '0')
  const s = String(safe % 60).padStart(2, '0')
  return `${m}:${s}`
}

/**
 * 모의고사 모드: 제한 시간, 문항 번호판, 듣기 2회 제한, 끝나고 한꺼번에 채점.
 * 제출 시 onSubmit([{ id, picked(null=미응답), correct }])을 호출한다.
 */
export default function ExamRunner({ title, questions, minutes, onSubmit, onExit }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => questions.map(() => null))
  const [remaining, setRemaining] = useState(minutes * 60)
  const answersRef = useRef(answers)
  const submittedRef = useRef(false)

  const question = questions[index]
  const isListening = TYPES[question.type]?.section === 'listening'
  const rate = getLevel(question.level)?.speechRate ?? 0.95
  const numbersOnly = question.options.every((option, optionIndex) => option === CIRCLED[optionIndex])
  const answered = answers.filter((value) => value !== null).length

  const submit = () => {
    if (submittedRef.current) return
    submittedRef.current = true
    stopSpeech()
    onSubmit(
      questions.map((item, i) => {
        const picked = answersRef.current[i]
        return { id: item.id, picked, correct: picked === item.answer }
      }),
    )
  }

  useEffect(() => {
    const timer = setInterval(() => setRemaining((value) => value - 1), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (remaining <= 0) submit()
    // submit은 ref만 읽으므로 remaining 변화에만 반응하면 된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  const pick = (optionIndex) => {
    const next = [...answersRef.current]
    next[index] = optionIndex
    answersRef.current = next
    setAnswers(next)
  }

  const askSubmit = () => {
    const blank = questions.length - answered
    const message = blank > 0 ? `아직 풀지 않은 문제가 ${blank}개 있습니다. 제출할까요?` : '제출할까요?'
    if (window.confirm(message)) submit()
  }

  const exit = () => {
    if (!window.confirm('시험을 그만두면 기록이 저장되지 않습니다. 나갈까요?')) return
    submittedRef.current = true
    stopSpeech()
    onExit()
  }

  return (
    <section className="panel quiz exam">
      <div className="quiz-top">
        <span className="muted small">
          {title} · {answered} / {questions.length} 답안 선택
        </span>
        <span className={`timer ${remaining <= 300 ? 'hurry' : ''}`}>⏱ {formatTime(remaining)}</span>
      </div>

      <div className="navigator" role="group" aria-label="문항 번호판">
        {questions.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`nav-no ${i === index ? 'current' : ''} ${answers[i] !== null ? 'done' : ''}`}
            onClick={() => setIndex(i)}
          >
            {item.no ?? i + 1}
          </button>
        ))}
      </div>

      <span className="badge">{typeLabel(question.type)}</span>
      <h2 className="stem">
        {question.no ?? index + 1}. {question.stem}
      </h2>

      {isListening ? (
        <ListeningPlayer
          key={question.id}
          id={question.id}
          lines={question.script}
          rate={rate}
          showScript={false}
          maxPlays={2}
        />
      ) : (
        <Passage text={question.passage} />
      )}
      <Visual question={question} />

      <ul className={`options ${numbersOnly ? 'numbers-only' : ''}`}>
        {question.options.map((option, optionIndex) => (
          <li key={optionIndex}>
            <button
              type="button"
              className={`option ${answers[index] === optionIndex ? 'picked' : ''}`}
              onClick={() => pick(optionIndex)}
            >
              <b>{CIRCLED[optionIndex]}</b>
              {!numbersOnly && <span>{option}</span>}
            </button>
          </li>
        ))}
      </ul>

      <div className="exam-actions">
        <button type="button" className="btn" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          이전
        </button>
        <button type="button" className="btn" disabled={index === questions.length - 1} onClick={() => setIndex(index + 1)}>
          다음
        </button>
        <button type="button" className="btn primary" onClick={askSubmit}>
          제출
        </button>
      </div>
      <button type="button" className="link" onClick={exit}>
        시험 그만두기
      </button>
    </section>
  )
}
