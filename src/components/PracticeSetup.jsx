import { useMemo } from 'react'
import { mockExams, practiceQuestions } from '../data/questions'
import { TYPES, typeLabel } from '../data/types'

function PrintButtons({ title, questions, onPrint }) {
  return (
    <span className="print-buttons">
      <button type="button" className="link" onClick={() => onPrint(title, questions, 'questions')}>
        문제지 인쇄
      </button>
      <button type="button" className="link" onClick={() => onPrint(title, questions, 'answers')}>
        정답·해설 인쇄
      </button>
    </span>
  )
}

export default function PracticeSetup({ level, onStart, onStartExam, onPrint }) {
  const pool = useMemo(() => practiceQuestions(level.id), [level.id])
  const exams = useMemo(() => mockExams(level.id), [level.id])

  if (pool.length === 0 && exams.length === 0) {
    return (
      <section className="panel empty">
        <h2>{level.name} 문제를 준비 중입니다</h2>
        <p className="muted">아직 제작 중이에요. 다른 학년을 먼저 풀어 보세요.</p>
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
    <>
      {exams.length > 0 && (
        <section className="panel">
          <h2>{level.name} · 모의고사</h2>
          <p className="muted">45문항 · 70분 · 듣기는 2번까지 · 끝나고 한꺼번에 채점</p>
          <ul className="exam-list">
            {exams.map((exam) => {
              const complete = exam.questions.length === 45
              return (
                <li key={exam.set}>
                  <div>
                    <strong>{exam.title}</strong>
                    <span className="muted small"> {exam.questions.length}문항{complete ? '' : ' (작성 중)'}</span>
                  </div>
                  <div className="row">
                    <button type="button" className="btn primary small-btn" onClick={() => onStartExam(exam)}>
                      시험 시작
                    </button>
                    <PrintButtons title={`${level.name} ${exam.title}`} questions={exam.questions} onPrint={onPrint} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {pool.length > 0 && (
        <section className="panel">
          <h2>{level.name} · 유형 연습</h2>
          <p className="muted">{level.target} · 한 문제씩 풀고 바로 해설을 봅니다</p>

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

          <p className="print-row">
            <PrintButtons title={`${level.name} 유형 연습`} questions={pool} onPrint={onPrint} />
          </p>
        </section>
      )}
    </>
  )
}
