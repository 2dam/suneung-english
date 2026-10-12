import { CIRCLED } from './Passage'

/**
 * 그림·도표 자료. 수능의 그림 문항(듣기 4번)과 도표 문항(듣기 10번, 읽기 25번)을 같은 형식으로 푼다.
 *   picture: { title?, items: [{ no: 1~5, emoji, label }] }   번호가 붙은 다섯 부분
 *   chart:   { title, unit?, labels: [...], series: [{ name, values: [...] }] }  막대 그래프
 */
function Picture({ picture }) {
  return (
    <figure className="picture">
      {picture.title && <figcaption>{picture.title}</figcaption>}
      <ul>
        {picture.items.map((item) => (
          <li key={item.no}>
            <b>{CIRCLED[item.no - 1]}</b>
            <span className="pic-emoji" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="pic-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </figure>
  )
}

const SERIES_COLORS = ['var(--primary)', '#e0a030', '#2fa36b']

function Chart({ chart }) {
  const width = 360
  const height = 210
  const pad = { top: 26, right: 12, bottom: 44, left: 34 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const all = chart.series.flatMap((series) => series.values)
  const max = Math.max(...all)
  const step = max <= 10 ? 2 : max <= 50 ? 10 : 20
  const top = Math.ceil(max / step) * step
  const ticks = []
  for (let value = 0; value <= top; value += step) ticks.push(value)

  const groupW = innerW / chart.labels.length
  const barW = Math.min(30, (groupW * 0.7) / chart.series.length)

  return (
    <figure className="chart">
      {chart.title && <figcaption>{chart.title}</figcaption>}
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={chart.title || 'chart'}>
        {ticks.map((tick) => {
          const y = pad.top + innerH - (tick / top) * innerH
          return (
            <g key={tick}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="grid" />
              <text x={pad.left - 6} y={y + 4} textAnchor="end" className="tick">
                {tick}
              </text>
            </g>
          )
        })}
        {chart.labels.map((label, labelIndex) => {
          const groupX = pad.left + groupW * labelIndex + groupW / 2
          return (
            <g key={label}>
              {chart.series.map((series, seriesIndex) => {
                const value = series.values[labelIndex]
                const barH = (value / top) * innerH
                const x = groupX - (barW * chart.series.length) / 2 + barW * seriesIndex
                const y = pad.top + innerH - barH
                return (
                  <g key={series.name}>
                    <rect x={x} y={y} width={barW - 2} height={barH} fill={SERIES_COLORS[seriesIndex % 3]} rx="2" />
                    <text x={x + (barW - 2) / 2} y={y - 4} textAnchor="middle" className="value">
                      {value}
                    </text>
                  </g>
                )
              })}
              <text x={groupX} y={height - pad.bottom + 16} textAnchor="middle" className="axis">
                {label}
              </text>
            </g>
          )
        })}
      </svg>
      {chart.series.length > 1 && (
        <ul className="legend">
          {chart.series.map((series, index) => (
            <li key={series.name}>
              <i style={{ background: SERIES_COLORS[index % 3] }} /> {series.name}
            </li>
          ))}
        </ul>
      )}
      {chart.unit && <p className="chart-unit">(unit: {chart.unit})</p>}
    </figure>
  )
}

export default function Visual({ question }) {
  return (
    <>
      {question.picture && <Picture picture={question.picture} />}
      {question.chart && <Chart chart={question.chart} />}
    </>
  )
}
