import PrintSheet from './PrintSheet'

/**
 * 문제지 화면. 목록의 QR을 스캔하면 열린다: 문제지를 화면에 보여 주고, 인쇄할지 묻는다.
 * job: { title, questions, mode, qrUrl }, examHref: 온라인으로 풀 때 가는 주소
 */
export default function SheetView({ job, examHref }) {
  return (
    <>
      <main className="shell sheet-bar">
        <p className="sheet-ask">
          <strong>{job.title}</strong> 문제지입니다. 인쇄할까요?
        </p>
        <div className="row sheet-buttons">
          <button type="button" className="btn primary" onClick={() => window.print()}>
            인쇄하기
          </button>
          <a className="btn" href={examHref}>
            아니요, 온라인으로 풀기
          </a>
        </div>
      </main>
      <PrintSheet job={{ ...job, static: true, onScreen: true }} onDone={() => {}} />
    </>
  )
}
