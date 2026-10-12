import { LEVELS } from '../data/levels'

export default function LevelSelect({ onSelect }) {
  return (
    <main className="shell">
      <header className="hero">
        <h1>중1,2,3학년 수능영어 완성하기</h1>
        <p>수능과 똑같은 45문항 형식으로, 중학교 수준 지문의 모의고사를 풀며 시험 형식에 익숙해져요.</p>
      </header>

      <h2 className="section-title">학년을 골라 주세요</h2>
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
        이 앱의 모든 문제는 수능 출제 형식을 참고해 중학생 수준으로 새로 만든 연습 문제이며, 한국교육과정평가원·EBS와
        관련이 없습니다.
      </p>
    </main>
  )
}
