import { CIRCLED } from './Passage'

/** 정답·보기별 해설·함정·전략. picked가 null이면 미응답으로 표시한다. */
export default function Explanation({ question, picked, showVerdict = true }) {
  const correct = picked === question.answer
  const tone = picked === null ? 'none' : correct ? 'good' : 'bad'
  const verdict = picked === null ? '미응답' : correct ? '정답입니다' : '오답입니다'

  return (
    <div className={`explain ${tone}`}>
      {showVerdict && (
        <h3>
          {verdict} · 정답 {CIRCLED[question.answer]}
        </h3>
      )}
      <p>{question.why}</p>

      {question.translation && (
        <details>
          <summary>해석 보기</summary>
          <p>{question.translation}</p>
        </details>
      )}

      <h4>보기별 해설</h4>
      <ul className="notes">
        {question.optionNotes.map((note, index) => (
          <li key={index} className={index === question.answer ? 'right' : ''}>
            <b>{CIRCLED[index]}</b> {note}
          </li>
        ))}
      </ul>

      {question.trap && (
        <p className="trap">
          🧠 <b>함정</b> {question.trap}
        </p>
      )}
      {question.tip && (
        <p className="tip">
          💡 <b>전략</b> {question.tip}
        </p>
      )}
    </div>
  )
}
