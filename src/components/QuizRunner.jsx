import { useState } from 'react'
import { getLevel } from '../data/levels'
import { TYPES, typeLabel } from '../data/types'
import { stopSpeech } from '../lib/speech'
import Explanation from './Explanation'
import ListeningPlayer from './ListeningPlayer'
import Passage, { CIRCLED } from './Passage'
import Visual from './Visual'

/** 연습 모드: 한 문제씩 풀고 바로 정답·해설을 본다. */
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
        <ListeningPlayer key={question.id} id={question.id} lines={question.script} rate={rate} showScript={revealed} />
      ) : (
        <Passage text={question.passage} />
      )}
      <Visual question={question} />

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
          <Explanation question={question} picked={picked} />
          <button type="button" className="btn primary full" onClick={goNext}>
            {isLast ? '결과 보기' : '다음 문제'}
          </button>
        </>
      )}
    </section>
  )
}
