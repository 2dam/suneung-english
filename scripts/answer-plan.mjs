// 회차별 정답 배치 계획: 직접 순열을 만들다 생기는 실수와 주기적 패턴을 막는다.
//   node scripts/answer-plan.mjs m1 2        (학년, 회차 번호)
// 출력
//   - 1~45번 정답 번호(①~⑤). 각 번호 9개, 듣기 17문항은 3~4개씩, 같은 번호 연속은 최대 2번
//   - "정답을 가장 긴 보기로 쓸 문항" 번호: 길이로 정답을 짐작할 수 없도록 약 20%만 지정
//   - 순서 문항(36·37·43번)의 정답 배열
// 같은 학년·회차는 항상 같은 계획이 나온다(시드 고정).

const [grade, mockArg] = process.argv.slice(2)
if (!grade || !mockArg) {
  console.error('사용법: node scripts/answer-plan.mjs <m1|m2|m3> <회차번호>')
  process.exit(1)
}

function hash(text) {
  let h = 2166136261
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return h >>> 0
}
function rng(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function shuffle(list, random) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function spread(counts, random) {
  // counts: 번호별 개수. 연속 3개 이상이 없고 직전 문항과 가급적 다른 번호가 되도록 배치
  for (let attempt = 0; attempt < 5000; attempt++) {
    const pool = shuffle(Object.entries(counts).flatMap(([n, c]) => Array(c).fill(Number(n))), random)
    let ok = true
    for (let i = 2; i < pool.length; i++) if (pool[i] === pool[i - 1] && pool[i] === pool[i - 2]) ok = false
    if (ok) return pool
  }
  throw new Error('배치를 찾지 못했습니다')
}

const random = rng(hash(`${grade}-${mockArg}`))
// 듣기 17문항: 5개 번호에 3,3,3,4,4 (어느 번호가 4개인지 무작위)
const lCounts = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 }
for (const n of shuffle([1, 2, 3, 4, 5], random).slice(0, 2)) lCounts[n] += 1
// 읽기 28문항: 합이 번호당 9개가 되도록 5,5,6,6,6 (듣기에서 4개인 번호는 5개)
const rCounts = {}
for (const n of [1, 2, 3, 4, 5]) rCounts[n] = 9 - lCounts[n]
const listening = spread(lCounts, random)
const reading = spread(rCounts, random)
// 경계(17→18번)에서 같은 번호가 3번 이어지지 않는지만 확인한다
const plan = [...listening, ...reading]
for (let i = 2; i < plan.length; i++) {
  if (plan[i] === plan[i - 1] && plan[i] === plan[i - 2]) {
    ;[reading[0], reading[reading.length - 1]] = [reading[reading.length - 1], reading[0]]
    break
  }
}
const answers = [...listening, ...reading]

// 보기가 번호뿐이거나 정해진 배열인 문항은 길이 계획에서 제외
const fixed = new Set([4, 25, 29, 30, 35, 36, 37, 38, 39, 42, 43, 44])
const eligible = Array.from({ length: 45 }, (_, i) => i + 1).filter((n) => !fixed.has(n))
const longest = shuffle(eligible, random).slice(0, 6).sort((a, b) => a - b)

const dist = [0, 0, 0, 0, 0, 0]
answers.forEach((a) => dist[a]++)
console.log(`학년 ${grade} · 모의고사 ${mockArg}회`)
console.log('정답(1~45번): ' + answers.join(''))
console.log('  듣기 1~17 : ' + listening.join(''))
console.log('  읽기 18~45: ' + reading.join(''))
console.log('번호별 개수 ①~⑤: ' + dist.slice(1).join('/'))
console.log('정답을 가장 긴 보기로 쓸 문항: ' + longest.join(', '))
console.log('  (나머지 문항은 정답이 가장 긴 보기가 되지 않게 오답 보기 길이를 맞춘다)')
const labels = ['', '(A)-(C)-(B)', '(B)-(A)-(C)', '(B)-(C)-(A)', '(C)-(A)-(B)', '(C)-(B)-(A)']
const labels43 = ['', '(B)-(D)-(C)', '(C)-(B)-(D)', '(C)-(D)-(B)', '(D)-(B)-(C)', '(D)-(C)-(B)']
console.log(`순서 문항: 36번 ${labels[answers[35]]}, 37번 ${labels[answers[36]]}, 43번 ${labels43[answers[42]]}`)
