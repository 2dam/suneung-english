// 작성한 회차가 answer-plan.mjs의 계획과 일치하는지 확인한다.
//   node scripts/check-plan.mjs m1 2
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const [grade, mockArg] = process.argv.slice(2)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const mock = String(mockArg).padStart(2, '0')

const planText = execFileSync('node', [path.join(root, 'scripts', 'answer-plan.mjs'), grade, String(Number(mockArg))], {
  encoding: 'utf8',
})
const planAnswers = planText.match(/정답\(1~45번\): (\d+)/)[1].split('').map(Number)
const planLongest = planText.match(/가장 긴 보기로 쓸 문항: ([\d, ]+)/)[1].split(',').map((s) => Number(s.trim()))

const dir = path.join(root, 'src', 'content', grade)
const questions = fs
  .readdirSync(dir)
  .filter((f) => f.startsWith(`mock-${mock}-`) && f.endsWith('.json'))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
  .sort((a, b) => a.no - b.no)

const problems = []
if (questions.length !== 45) problems.push(`문항 수가 ${questions.length}개입니다`)
for (const q of questions) {
  if (q.answer + 1 !== planAnswers[q.no - 1]) {
    problems.push(`${q.no}번: 정답 ${q.answer + 1} (계획 ${planAnswers[q.no - 1]})`)
  }
}
const CIRCLED = /^[①②③④⑤]$/
for (const q of questions) {
  if (q.options.every((o) => CIRCLED.test(o)) || /^\([A-D]\)/.test(q.options[0])) continue
  const lens = q.options.map((o) => o.length)
  const max = Math.max(...lens)
  const uniqueLongest = lens[q.answer] === max && lens.filter((l) => l === max).length === 1
  const shouldBe = planLongest.includes(q.no)
  if (shouldBe && !uniqueLongest) problems.push(`${q.no}번: 정답을 가장 긴 보기로 써야 합니다`)
  if (!shouldBe && uniqueLongest) problems.push(`${q.no}번: 정답이 가장 긴 보기입니다(계획에 없음)`)
}

if (problems.length) {
  console.log(`계획과 다른 점 ${problems.length}건 (${grade} · ${mockArg}회)`)
  problems.forEach((p) => console.log('  ' + p))
  process.exit(1)
}
console.log(`계획과 일치합니다 (${grade} · ${mockArg}회)`)
