import { QUESTION_MAP } from '../data/questions'
import { typeLabel } from '../data/types'

export default function ResultView({ result, onRetryWrong, onHome }) {
  const total = result.items.length
  const correct = result.items.filter((item) => item.correct).length
  const wrongIds = result.items.filter((item) => !item.correct).map((item) => item.id)
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100)

  return (
    <section className="panel">
      <h2>{result.title} 결과</h2>
      <p className="score">
        <strong>{correct}</strong> / {total} <span className="muted">({percent}%)</span>
      </p>

      <ul className="result-list">
        {result.items.map((item, index) => {
          const question = QUESTION_MAP[item.id]
          return (
            <li key={item.id} className={item.correct ? 'ok' : 'ng'}>
              <span className="mark-icon">{item.correct ? '○' : '✕'}</span>
              <span>
                {index + 1}. {question ? typeLabel(question.type) : item.id}
              </span>
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
        <button type="button" className="btn" onClick={onHome}>
          처음으로
        </button>
      </div>
    </section>
  )
}
