import PrintSheet from './PrintSheet'

const MODE_LABEL = { questions: '문제지', answers: '정답 및 해설', both: '문제와 해설' }

/**
 * 인쇄 미리보기. 문서를 화면에 그대로 보여 주고, 거기서 인쇄한다.
 * 휴대폰 브라우저는 window.print()가 막히거나 숨은 문서를 못 찍는 경우가 있어서,
 * 화면에 보이는 문서에 대해 '인쇄하기' 버튼과 브라우저 메뉴의 인쇄/PDF 저장을 모두 쓸 수 있게 한다.
 */
export default function PrintPreview({ job, onClose }) {
  return (
    <>
      <main className="shell print-preview-bar">
        <p>
          <strong>{job.title}</strong> · {MODE_LABEL[job.mode] || '문서'}
        </p>
        <div className="row preview-buttons">
          <button type="button" className="btn primary" onClick={() => window.print()}>
            인쇄하기
          </button>
          <button type="button" className="btn" onClick={onClose}>
            닫기
          </button>
        </div>
        <p className="muted small">
          인쇄 창이 열리지 않으면 브라우저 메뉴(⋮ 또는 공유 버튼)에서 <b>인쇄</b>를 고르세요. <b>PDF로 저장</b>을 고르면 파일로
          받을 수도 있어요.
        </p>
      </main>
      <PrintSheet job={{ ...job, static: true, onScreen: true }} onDone={() => {}} />
    </>
  )
}
