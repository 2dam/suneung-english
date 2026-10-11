// 등급 3단계. speechRate는 듣기 음성 속도(1.0이 보통 속도).
export const LEVELS = [
  {
    id: 'basic',
    name: '기초',
    target: '3~5등급 → 3등급 목표',
    desc: '기본 어휘와 짧은 문장 중심. 듣기는 천천히, 오답 해설은 더 자세히.',
    speechRate: 0.85,
  },
  {
    id: 'mid',
    name: '중급',
    target: '2~3등급 → 2등급 목표',
    desc: '실전 지문 길이. 빈칸·순서·어법처럼 점수를 가르는 유형 집중.',
    speechRate: 0.95,
  },
  {
    id: 'high',
    name: '상급',
    target: '1~2등급 → 1등급 목표',
    desc: '고난도 추론·장문. 듣기는 실제 속도, 매력적인 오답까지 분석.',
    speechRate: 1.0,
  },
]

export const getLevel = (id) => LEVELS.find((level) => level.id === id) || null
