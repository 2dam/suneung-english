// 학년 3단계. 형식(45문항·70분·발문·번호별 유형)은 모두 수능과 같고, 지문 난이도만 학년별로 다르다.
//   speechRate  듣기 음성 속도(1.0이 보통 속도)
//   mockCount   제작 목표 회차 수(합계 100회)
//   spec        지문 난이도 기준. scripts/check-content.mjs가 벗어나면 경고한다.
//     readingWords [최소, 최대]  읽기 지문 단어 수(장문 세트는 1.7배까지 허용)
//     scriptWords  최대          듣기 대본 단어 수
//     avgSentence  최대          문장당 평균 단어 수
//     maxSentence  최대          가장 긴 문장의 단어 수
export const LEVELS = [
  {
    id: 'm1',
    name: '중1',
    target: '수능 형식 첫걸음',
    desc: '짧고 쉬운 지문으로 45문항 시험 형식에 익숙해지기. 듣기는 천천히.',
    speechRate: 0.8,
    mockCount: 30,
    spec: { readingWords: [35, 95], scriptWords: 75, avgSentence: 12, maxSentence: 18 },
  },
  {
    id: 'm2',
    name: '중2',
    target: '수능 형식 다지기',
    desc: '조금 긴 지문과 다양한 문법으로 유형별 풀이 방법을 익히기.',
    speechRate: 0.9,
    mockCount: 30,
    spec: { readingWords: [55, 125], scriptWords: 100, avgSentence: 14, maxSentence: 21 },
  },
  {
    id: 'm3',
    name: '중3',
    target: '수능 형식 완성',
    desc: '수능과 같은 길이에 가까운 지문으로 시간 배분까지 연습하기.',
    speechRate: 0.95,
    mockCount: 40,
    spec: { readingWords: [75, 160], scriptWords: 125, avgSentence: 17, maxSentence: 26 },
  },
]

export const getLevel = (id) => LEVELS.find((level) => level.id === id) || null
