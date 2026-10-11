import { QUESTION_MAP } from '../data/questions'
import { typeLabel } from '../data/types'

export default function WrongNotes({ wrong, onRetry, onRemove }) {
  const entries = Object.entries(wrong)
    .filter(([id]) => QUESTION_MAP[id])
    .sort((a, b) => b[1].last - a[1].last)

  if (entries.length === 0) {
    return (
      <section className="panel empty">
        <h2>오답노트가 비어 있어요</h2>
        <p className="muted">문제를 풀다가 틀린 문제가 여기에 자동으로 모입니다.</p>
      </section>
    )
  }

  return (
    <section className="panel">
      <h2>오답노트 ({entries.length})</h2>
      <button type="button" className="btn primary full" onClick={() => onRetry(entries.map(([id]) => id))}>
        오답 전체 다시 풀기
      </button>

      <ul className="wrong-list">
        {entries.map(([id, info]) => {
          const question = QUESTION_MAP[id]
          const preview = (question.passage || question.script?.[0]?.text || '').replace(/\{\d\|([^}]+)\}/g, '$1')
          return (
            <li key={id}>
              <div>
                <span className="badge">{typeLabel(question.type)}</span>
                <span className="muted small"> · {info.count}회 틀림</span>
              </div>
              <p className="preview">{preview.slice(0, 90)}…</p>
              <div className="row">
                <button type="button" className="btn small-btn" onClick={() => onRetry([id])}>
                  다시 풀기
                </button>
                <button type="button" className="link" onClick={() => onRemove(id)}>
                  삭제
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
