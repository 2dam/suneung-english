import { LEVELS } from '../data/levels'

export default function LevelSelect({ onSelect }) {
  return (
    <main className="shell">
      <header className="hero">
        <h1>수능영어 유형 연습</h1>
        <p>듣기 · 읽기 독창 문제와 보기별 해설, 오답노트까지.</p>
      </header>

      <h2 className="section-title">목표 등급을 골라 주세요</h2>
      <div className="level-grid">
        {LEVELS.map((level) => (
          <button key={level.id} type="button" className="level-card" onClick={() => onSelect(level.id)}>
            <strong>{level.name}</strong>
            <span className="target">{level.target}</span>
            <span className="desc">{level.desc}</span>
          </button>
        ))}
      </div>
      <p className="muted small disclaimer">
        이 앱의 모든 문제는 수능 유형을 참고해 새로 만든 연습 문제이며, 한국교육과정평가원·EBS와 관련이 없습니다.
      </p>
    </main>
  )
}
