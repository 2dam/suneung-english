// 수능 영어 유형 분류표 (듣기 17문항 + 읽기 28문항 = 45문항 규격).
// section: 'listening' | 'reading'. 문제 데이터의 type 값은 이 표의 key를 쓴다.
export const TYPES = {
  // 듣기
  'l-purpose': { section: 'listening', label: '듣기 · 목적' },
  'l-opinion': { section: 'listening', label: '듣기 · 의견' },
  'l-relation': { section: 'listening', label: '듣기 · 관계' },
  'l-picture': { section: 'listening', label: '듣기 · 그림 내용' },
  'l-todo': { section: 'listening', label: '듣기 · 할 일' },
  'l-price': { section: 'listening', label: '듣기 · 금액' },
  'l-reason': { section: 'listening', label: '듣기 · 이유' },
  'l-notmentioned': { section: 'listening', label: '듣기 · 언급 안 된 것' },
  'l-match': { section: 'listening', label: '듣기 · 내용 일치' },
  'l-chart': { section: 'listening', label: '듣기 · 도표' },
  'l-response': { section: 'listening', label: '듣기 · 응답 고르기' },
  'l-situation': { section: 'listening', label: '듣기 · 상황에 맞는 말' },
  'l-set': { section: 'listening', label: '듣기 · 세트 문항' },
  // 읽기
  purpose: { section: 'reading', label: '글의 목적' },
  mood: { section: 'reading', label: '심경·분위기' },
  claim: { section: 'reading', label: '주장' },
  implied: { section: 'reading', label: '함축 의미' },
  gist: { section: 'reading', label: '요지' },
  topic: { section: 'reading', label: '주제' },
  title: { section: 'reading', label: '제목' },
  chart: { section: 'reading', label: '도표' },
  match: { section: 'reading', label: '내용 일치' },
  notice: { section: 'reading', label: '안내문' },
  grammar: { section: 'reading', label: '어법' },
  vocab: { section: 'reading', label: '어휘' },
  blank: { section: 'reading', label: '빈칸 추론' },
  irrelevant: { section: 'reading', label: '무관한 문장' },
  order: { section: 'reading', label: '글의 순서' },
  insert: { section: 'reading', label: '문장 삽입' },
  summary: { section: 'reading', label: '요약문' },
  long: { section: 'reading', label: '장문' },
}

export const typeLabel = (type) => TYPES[type]?.label || type
