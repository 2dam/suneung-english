import { useState } from 'react'
import { getLevel } from '../data/levels'
import { TYPES, typeLabel } from '../data/types'
import { stopSpeech } from '../lib/speech'
import ListeningPlayer from './ListeningPlayer'
import Passage, { CIRCLED } from './Passage'

export default function QuizRunner({ title, questions, onFinish, onExit }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState([])

  const question = questions[index]
  const isLast = index === questions.length - 1
  const isListening = TYPES[question.type]?.section === 'listening'
  const rate = getLevel(question.level)?.speechRate ?? 0.95
  // 어법처럼 보기가 ①~⑤ 번호뿐인 문제는 번호만 한 줄로 보여 준다.
  const numbersOnly = question.options.every((option, optionIndex) => option === CIRCLED[optionIndex])

  const goNext = () => {
    const nextAnswers = [...answers, { id: question.id, picked, correct: picked === question.answer }]
    stopSpeech()
    if (isLast) {
      onFinish(nextAnswers)
      return
    }
    setAnswers(nextAnswers)
    setIndex(index + 1)
    setPicked(null)
    setRevealed(false)
  }

  const exit = () => {
    stopSpeech()
    onExit()
  }

  return (
    <section className="panel quiz">
      <div className="quiz-top">
        <span className="muted small">
          {title} · {index + 1} / {questions.length}
        </span>
        <button type="button" className="link" onClick={exit}>
          그만두기
        </button>
      </div>
      <div className="progress">
        <div style={{ width: `${((index + (revealed ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      <span className="badge">{typeLabel(question.type)}</span>
      <h2 className="stem">{question.stem}</h2>

      {isListening ? (
        <ListeningPlayer key={question.id} lines={question.script} rate={rate} showScript={revealed} />
      ) : (
        <Passage text={question.passage} />
      )}

      <ul className={`options ${numbersOnly ? 'numbers-only' : ''}`}>
        {question.options.map((option, optionIndex) => {
          let state = ''
          if (revealed) {
            if (optionIndex === question.answer) state = 'right'
            else if (optionIndex === picked) state = 'wrong'
          } else if (optionIndex === picked) {
            state = 'picked'
          }
          return (
            <li key={optionIndex}>
              <button
                type="button"
                className={`option ${state}`}
                disabled={revealed}
                onClick={() => setPicked(optionIndex)}
              >
                <b>{CIRCLED[optionIndex]}</b>
                {!numbersOnly && <span>{option}</span>}
              </button>
            </li>
          )
        })}
      </ul>

      {!revealed ? (
        <button type="button" className="btn primary full" disabled={picked === null} onClick={() => setRevealed(true)}>
          정답 확인
        </button>
      ) : (
        <>
          <div className={`explain ${picked === question.answer ? 'good' : 'bad'}`}>
            <h3>
              {picked === question.answer ? '정답입니다' : '오답입니다'} · 정답 {CIRCLED[question.answer]}
            </h3>
            <p>{question.why}</p>

            {question.translation && (
              <details>
                <summary>해석 보기</summary>
                <p>{question.translation}</p>
              </details>
            )}

            <h4>보기별 해설</h4>
            <ul className="notes">
              {question.optionNotes.map((note, noteIndex) => (
                <li key={noteIndex} className={noteIndex === question.answer ? 'right' : ''}>
                  <b>{CIRCLED[noteIndex]}</b> {note}
                </li>
              ))}
            </ul>

            {question.trap && <p className="trap">🧠 <b>함정</b> {question.trap}</p>}
            {question.tip && <p className="tip">💡 <b>전략</b> {question.tip}</p>}
          </div>
          <button type="button" className="btn primary full" onClick={goNext}>
            {isLast ? '결과 보기' : '다음 문제'}
          </button>
        </>
      )}
    </section>
  )
}
