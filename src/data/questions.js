// 문제는 src/content/<코스>/<학년>/*.json 에 있고, 이 파일은 그것을 읽어 모으기만 한다.
// 코스(a, b)는 경로에서 읽어 각 문제에 course로 붙인다. 형식과 작성 규칙은 README.md,
// 검사는 `npm run check:content`.
//
// 현재 규모는 gzip 후 수백 KB 수준이다. 코스·회차가 늘어 수천 문항이 되면
// import.meta.glob을 비-eager로 바꿔 코스·학년별로 나눠 불러온다.
const modules = import.meta.glob('../content/**/*.json', { eager: true, import: 'default' })

export const QUESTIONS = Object.keys(modules)
  .sort()
  .flatMap((path) => {
    const course = path.split('/')[2] // ../content/<course>/<level>/file.json
    return modules[path].map((question) => ({ ...question, course }))
  })

export const QUESTION_MAP = Object.fromEntries(QUESTIONS.map((question) => [question.id, question]))

export const isMock = (question) => typeof question.set === 'string' && question.set.startsWith('mock-')

/** 유형별 연습에 쓰는 문제(모의고사 문항은 모의고사에서만 쓴다). */
export const practiceQuestions = (courseId, levelId) =>
  QUESTIONS.filter((question) => question.course === courseId && question.level === levelId && !isMock(question))

/** 코스·학년의 모의고사 회차 목록. 문항 번호(no) 순으로 정렬된다. */
export function mockExams(courseId, levelId) {
  const sets = new Map()
  QUESTIONS.filter(
    (question) => question.course === courseId && question.level === levelId && isMock(question),
  ).forEach((question) => {
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
