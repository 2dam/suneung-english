const CIRCLED = ['①', '②', '③', '④', '⑤']
// {1|close} → ①번호 + 밑줄, {u|word} → 번호 없는 밑줄(함축 의미 문제)
const MARK = /\{(\d|u)\|([^}]+)\}/g

// 어법 문제의 {1|close} 표기를 번호 붙은 밑줄로 바꿔 그린다.
function renderLine(line, key) {
  const parts = []
  let last = 0
  let match
  MARK.lastIndex = 0
  while ((match = MARK.exec(line)) !== null) {
    if (match.index > last) parts.push(line.slice(last, match.index))
    if (match[1] === 'u') {
      parts.push(<u key={`${key}-${match.index}`}>{match[2]}</u>)
    } else {
      parts.push(
        <span className="mark" key={`${key}-${match.index}`}>
          <b>{CIRCLED[Number(match[1]) - 1]}</b>
          <u>{match[2]}</u>
        </span>,
      )
    }
    last = match.index + match[0].length
  }
  if (last < line.length) parts.push(line.slice(last))
  return <p key={key}>{parts}</p>
}

export default function Passage({ text }) {
  return <div className="passage">{text.split('\n').map((line, index) => renderLine(line, index))}</div>
}

export { CIRCLED }
