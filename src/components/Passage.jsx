const CIRCLED = ['①', '②', '③', '④', '⑤']
const MARK = /\{(\d)\|([^}]+)\}/g

// 어법 문제의 {1|close} 표기를 번호 붙은 밑줄로 바꿔 그린다.
function renderLine(line, key) {
  const parts = []
  let last = 0
  let match
  MARK.lastIndex = 0
  while ((match = MARK.exec(line)) !== null) {
    if (match.index > last) parts.push(line.slice(last, match.index))
    const number = Number(match[1])
    parts.push(
      <span className="mark" key={`${key}-${match.index}`}>
        <b>{CIRCLED[number - 1]}</b>
        <u>{match[2]}</u>
      </span>,
    )
    last = match.index + match[0].length
  }
  if (last < line.length) parts.push(line.slice(last))
  return <p key={key}>{parts}</p>
}

export default function Passage({ text }) {
  return <div className="passage">{text.split('\n').map((line, index) => renderLine(line, index))}</div>
}

export { CIRCLED }
