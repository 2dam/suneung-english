import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getLevel } from '../data/levels'
import { TYPES, typeLabel } from '../data/types'
import Passage, { CIRCLED } from './Passage'

/**
 * 인쇄용 문서. 화면에서는 숨겨져 있고(@media print에서만 보임), 마운트되면 인쇄 창을 연다.
 * mode: 'questions'(문제지) | 'answers'(정답·해설) | 'both'(문제+해설)
 */
export default function PrintSheet({ job, onDone }) {
  const { title, questions, mode } = job

  useEffect(() => {
    document.body.classList.add('printing')
    const finish = () => {
      document.body.classList.remove('printing')
      onDone()
    }
    window.addEventListener('afterprint', finish, { once: true })
    // 렌더가 끝난 뒤에 인쇄 창을 연다.
    const timer = setTimeout(() => window.print(), 150)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('afterprint', finish)
      document.body.classList.remove('printing')
    }
  }, [onDone])

  const showQuestions = mode === 'questions' || mode === 'both'
  const showAnswers = mode === 'answers' || mode === 'both'
  const levelName = (question) => getLevel(question.level)?.name || ''

  return createPortal(
    <div className="print-root">
      <h1>
        {title} — {mode === 'questions' ? '문제지' : mode === 'answers' ? '정답 및 해설' : '문제와 해설'}
      </h1>
      <p className="print-meta">수능영어 유형 연습 · 직접 만든 연습 문제</p>

      {mode === 'answers' && (
        <table className="answer-table">
          <tbody>
            <tr>
              {questions.map((question, i) => (
                <th key={question.id}>{question.no ?? i + 1}</th>
              ))}
            </tr>
            <tr>
              {questions.map((question) => (
                <td key={question.id}>{CIRCLED[question.answer]}</td>
              ))}
            </tr>
          </tbody>
        </table>
      )}

      {questions.map((question, i) => {
        const number = question.no ?? i + 1
        const isListening = TYPES[question.type]?.section === 'listening'
        const numbersOnly = question.options.every((option, optionIndex) => option === CIRCLED[optionIndex])
        return (
          <article key={question.id} className="print-q">
            <h2>
              {number}. {question.stem}
              <small>
                {' '}
                [{levelName(question)} · {typeLabel(question.type)}]
              </small>
            </h2>

            {showQuestions &&
              (isListening ? (
                <p className="print-note">(듣기 문항 — 음원을 들으며 풉니다. 대본은 정답 및 해설에 있습니다.)</p>
              ) : (
                <Passage text={question.passage} />
              ))}

            {showQuestions && !numbersOnly && (
              <ol className="print-options">
                {question.options.map((option, optionIndex) => (
                  <li key={optionIndex}>
                    {CIRCLED[optionIndex]} {option}
                  </li>
                ))}
              </ol>
            )}
            {showQuestions && numbersOnly && <p className="print-note">① ② ③ ④ ⑤ 중에서 고르시오.</p>}

            {showAnswers && (
              <div className="print-answer">
                <p>
                  <b>정답 {CIRCLED[question.answer]}</b> — {question.why}
                </p>
                {isListening && (
                  <p className="print-script">
                    {question.script.map((line, lineIndex) => (
                      <span key={lineIndex}>
                        <b>{line.speaker}:</b> {line.text}{' '}
                      </span>
                    ))}
                  </p>
                )}
                {question.translation && <p className="print-note">해석: {question.translation}</p>}
                <ul>
                  {question.optionNotes.map((note, noteIndex) => (
                    <li key={noteIndex}>
                      {CIRCLED[noteIndex]} {note}
                    </li>
                  ))}
                </ul>
                {question.trap && <p>🧠 함정: {question.trap}</p>}
                {question.tip && <p>💡 전략: {question.tip}</p>}
              </div>
            )}
          </article>
        )
      })}
    </div>,
    document.body,
  )
}
