import { QUESTION_MAP } from '../data/questions'
import { TYPES, typeLabel } from '../data/types'
import Explanation from './Explanation'
import { CIRCLED } from './Passage'

function sectionScore(items, section) {
  const list = items.filter((item) => TYPES[QUESTION_MAP[item.id]?.type]?.section === section)
  return { total: list.length, correct: list.filter((item) => item.correct).length }
}

export default function ResultView({ result, onRetryWrong, onHome, onPrint }) {
  const total = result.items.length
  const correct = result.items.filter((item) => item.correct).length
  const wrongIds = result.items.filter((item) => !item.correct).map((item) => item.id)
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100)
  const listening = sectionScore(result.items, 'listening')
  const reading = sectionScore(result.items, 'reading')
  const questions = result.items.map((item) => QUESTION_MAP[item.id]).filter(Boolean)

  return (
    <section className="panel">
      <h2>{result.title} 결과</h2>
      <p className="score">
        <strong>{correct}</strong> / {total} <span className="muted">({percent}%)</span>
      </p>
      {listening.total > 0 && reading.total > 0 && (
        <p className="muted">
          듣기 {listening.correct}/{listening.total} · 읽기 {reading.correct}/{reading.total}
        </p>
      )}

      <ul className="result-list">
        {result.items.map((item, index) => {
          const question = QUESTION_MAP[item.id]
          if (!question) return null
          const number = question.no ?? index + 1
          return (
            <li key={item.id} className={item.correct ? 'ok' : 'ng'}>
              <details>
                <summary>
                  <span className="mark-icon">{item.correct ? '○' : item.picked === null ? '–' : '✕'}</span>
                  <span>
                    {number}. {typeLabel(question.type)}
                    <span className="muted small">
                      {' '}
                      · 내 답 {item.picked === null ? '미응답' : CIRCLED[item.picked]} / 정답 {CIRCLED[question.answer]}
                    </span>
                  </span>
                </summary>
                <p className="result-stem">{question.stem}</p>
                <Explanation question={question} picked={item.picked} showVerdict={false} />
              </details>
            </li>
          )
        })}
      </ul>

      <div className="start-grid">
        {wrongIds.length > 0 && (
          <button type="button" className="btn primary" onClick={() => onRetryWrong(wrongIds)}>
            틀린 문제 다시 풀기 ({wrongIds.length})
          </button>
        )}
        <button type="button" className="btn" onClick={() => onPrint(result.title, questions, 'both')}>
          문제·해설 인쇄
        </button>
        <button type="button" className="btn" onClick={onHome}>
          처음으로
        </button>
      </div>
    </section>
  )
}
