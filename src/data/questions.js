// 문제는 src/content/<등급>/*.json 에 있고, 이 파일은 그것을 읽어 모으기만 한다.
// 형식과 작성 규칙은 README.md, 검사는 `npm run check:content`.
//
// 시범판(약 420문항)은 전부 번들에 포함해도 gzip 후 수백 KB 수준이다.
// 표준판(2,000문항 이상)으로 늘릴 때는 import.meta.glob을 비-eager로 바꿔 등급별로 나눠 불러온다.
const modules = import.meta.glob('../content/**/*.json', { eager: true, import: 'default' })

export const QUESTIONS = Object.keys(modules)
  .sort()
  .flatMap((path) => modules[path])

export const QUESTION_MAP = Object.fromEntries(QUESTIONS.map((question) => [question.id, question]))

export const isMock = (question) => typeof question.set === 'string' && question.set.startsWith('mock-')

/** 유형별 연습에 쓰는 문제(모의고사 문항은 모의고사에서만 쓴다). */
export const practiceQuestions = (levelId) =>
  QUESTIONS.filter((question) => question.level === levelId && !isMock(question))

/** 등급의 모의고사 회차 목록. 문항 번호(no) 순으로 정렬된다. */
export function mockExams(levelId) {
  const sets = new Map()
  QUESTIONS.filter((question) => question.level === levelId && isMock(question)).forEach((question) => {
    if (!sets.has(question.set)) sets.set(question.set, [])
    sets.get(question.set).push(question)
  })
  return [...sets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([set, questions]) => ({
      set,
      title: `모의고사 ${Number(set.replace('mock-', ''))}회`,
      questions: questions.sort((a, b) => a.no - b.no),
    }))
}
