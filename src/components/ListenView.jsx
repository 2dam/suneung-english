import { getLevel } from '../data/levels'
import { QUESTION_MAP } from '../data/questions'
import { TYPES, typeLabel } from '../data/types'
import ListeningPlayer from './ListeningPlayer'

/**
 * 듣기 문항 화면. 문제지의 듣기 QR을 스캔하면 열린다: 그 문항의 듣기만 재생한다(문제는 종이에 있다).
 * 녹음 음원이 없는 회차는 브라우저 음성으로 읽어 준다.
 */
export default function ListenView({ questionId }) {
  const question = QUESTION_MAP[questionId]
  if (!question || TYPES[question.type]?.section !== 'listening' || !Array.isArray(question.script)) {
    return (
      <main className="shell">
        <section className="panel empty">
          <h2>듣기 문항을 찾을 수 없어요</h2>
          <p className="muted">QR이 오래되었거나 주소가 잘못되었을 수 있습니다.</p>
        </section>
      </main>
    )
  }
  const level = getLevel(question.level)
  return (
    <main className="shell">
      <section className="panel">
        <h2>
          {question.no}번 · {typeLabel(question.type)}
        </h2>
        <p className="muted small">
          {level?.name} · 모의고사 {Number(question.set?.replace('mock-', ''))}회
        </p>
        <p>문제지를 보며 듣고 답을 고르세요.</p>
        <ListeningPlayer key={question.id} question={question} rate={level?.speechRate ?? 0.95} showScript={false} />
      </section>
    </main>
  )
}
