import QRCode from 'qrcode'

/** 주소를 QR(SVG)로 그린다. 동기로 만들어져서 PDF 내보내기에서도 바로 렌더된다. */
export default function QrCode({ value, size = 96 }) {
  const { modules } = QRCode.create(value, { errorCorrectionLevel: 'M' })
  const margin = 2
  const count = modules.size + margin * 2
  const cells = []
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (modules.get(row, col)) cells.push(<rect key={`${row}-${col}`} x={col + margin} y={row + margin} width="1" height="1" />)
    }
  }
  return (
    <svg className="qr" role="img" aria-label="이 회차를 온라인으로 푸는 QR 코드" width={size} height={size} viewBox={`0 0 ${count} ${count}`} shapeRendering="crispEdges">
      <rect width={count} height={count} fill="#fff" />
      <g fill="#000">{cells}</g>
    </svg>
  )
}
