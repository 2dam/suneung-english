import { useMemo } from 'react'
import { QUESTIONS } from '../data/questions'
import { TYPES, typeLabel } from '../data/types'

export default function PracticeSetup({ level, onStart }) {
  const pool = useMemo(() => QUESTIONS.filter((question) => question.level === level.id), [level.id])

  if (pool.length === 0) {
    return (
      <section className="panel empty">
        <h2>{level.name} 문제를 준비 중입니다</h2>
        <p className="muted">시범판에서는 중급 샘플 문제부터 열려 있습니다. 상단에서 등급을 바꿔 확인해 보세요.</p>
      </section>
    )
  }

  const listening = pool.filter((question) => TYPES[question.type]?.section === 'listening')
  const reading = pool.filter((question) => TYPES[question.type]?.section === 'reading')

  const typeCounts = {}
  pool.forEach((question) => {
    typeCounts[question.type] = (typeCounts[question.type] || 0) + 1
  })

  return (
    <section className="panel">
      <h2>{level.name} · 연습 시작</h2>
      <p className="muted">{level.target}</p>

      <div className="start-grid">
        <button type="button" className="btn primary" onClick={() => onStart(`${level.name} 전체`, pool)}>
          전체 풀기 ({pool.length}문항)
        </button>
        <button
          type="button"
          className="btn"
          disabled={listening.length === 0}
          onClick={() => onStart(`${level.name} 듣기`, listening)}
        >
          듣기만 ({listening.length})
        </button>
        <button
          type="button"
          className="btn"
          disabled={reading.length === 0}
          onClick={() => onStart(`${level.name} 읽기`, reading)}
        >
          읽기만 ({reading.length})
        </button>
      </div>

      <h3 className="section-title">유형별로 풀기</h3>
      <div className="chips">
        {Object.entries(typeCounts).map(([type, count]) => (
          <button
            key={type}
            type="button"
            className="chip"
            onClick={() =>
              onStart(
                `${level.name} · ${typeLabel(type)}`,
                pool.filter((question) => question.type === type),
              )
            }
          >
            {typeLabel(type)} <span>{count}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
