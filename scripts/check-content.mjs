// 문제 데이터 검사: 빌드 전에 실행되어 잘못된 데이터가 배포되는 것을 막는다.
//   node scripts/check-content.mjs          (npm run check:content)
// 오류(ERROR)가 하나라도 있으면 종료 코드 1, 경고(WARN)는 표시만 한다.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TYPES } from '../src/data/types.js'
import { LEVELS } from '../src/data/levels.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = path.join(root, 'src', 'content')

const errors = []
const warns = []
const err = (id, msg) => errors.push(`${id}: ${msg}`)
const warn = (id, msg) => warns.push(`${id}: ${msg}`)

function listJson(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return listJson(full)
    return entry.name.endsWith('.json') ? [full] : []
  })
}

const questions = []
for (const file of listJson(contentDir)) {
  let data
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    err(path.relative(root, file), `JSON 문법 오류: ${e.message}`)
    continue
  }
  if (!Array.isArray(data)) {
    err(path.relative(root, file), '최상위가 배열이 아닙니다')
    continue
  }
  data.forEach((q) => questions.push({ ...q, __file: path.relative(root, file) }))
}

const levelIds = new Set(LEVELS.map((level) => level.id))
const seenIds = new Set()
const textOwner = new Map() // 지문/대본 -> group 값 (같은 group은 지문 공유 허용)
const CIRCLED_RE = /^[①②③④⑤]$/

for (const q of questions) {
  const id = q.id || `(id 없음, ${q.__file})`
  if (!q.id) err(id, 'id가 없습니다')
  else if (seenIds.has(q.id)) err(id, 'id가 중복됩니다')
  seenIds.add(q.id)

  if (!levelIds.has(q.level)) err(id, `level이 잘못됨: ${q.level}`)
  const info = TYPES[q.type]
  if (!info) {
    err(id, `알 수 없는 type: ${q.type}`)
    continue
  }
  if (q.id && !q.id.startsWith(`${q.level}-`)) warn(id, `id가 "${q.level}-"로 시작하지 않습니다`)
  if (!q.stem) err(id, 'stem(발문)이 없습니다')

  if (!Array.isArray(q.options) || q.options.length !== 5) err(id, 'options는 정확히 5개여야 합니다')
  else {
    if (q.options.some((o) => typeof o !== 'string' || o.trim() === '')) err(id, '빈 보기가 있습니다')
    if (new Set(q.options).size !== 5) err(id, '같은 보기가 있습니다')
  }
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 4) err(id, 'answer는 0~4 정수여야 합니다')
  if (!Array.isArray(q.optionNotes) || q.optionNotes.length !== 5) err(id, 'optionNotes는 정확히 5개여야 합니다')
  else if (q.optionNotes.some((n) => typeof n !== 'string' || n.trim() === '')) err(id, '빈 보기 해설이 있습니다')
  if (!q.why) err(id, 'why(정답 근거)가 없습니다')
  if (!q.translation) warn(id, 'translation(해석)이 없습니다')
  if (!q.tip) warn(id, 'tip(전략)이 없습니다')

  if (info.section === 'listening') {
    if (!Array.isArray(q.script) || q.script.length === 0) err(id, '듣기 문항에 script가 없습니다')
    else {
      q.script.forEach((line, i) => {
        if (!['W', 'M', 'N'].includes(line.speaker)) err(id, `script[${i}].speaker는 W/M/N 중 하나여야 합니다`)
        if (!line.text || !line.text.trim()) err(id, `script[${i}].text가 비었습니다`)
      })
    }
  } else {
    if (!q.passage || !q.passage.trim()) err(id, '읽기 문항에 passage가 없습니다')
  }

  // 문제 유형별 구조 검사
  if (q.type === 'grammar' && q.passage) {
    for (let n = 1; n <= 5; n++) {
      const count = (q.passage.match(new RegExp(`\\{${n}\\|`, 'g')) || []).length
      if (count !== 1) err(id, `어법 지문에 {${n}|...} 표기가 ${count}개입니다(1개여야 함)`)
    }
    if (Array.isArray(q.options) && !q.options.every((o) => CIRCLED_RE.test(o))) {
      err(id, '어법 문제의 보기는 ①~⑤ 번호여야 합니다')
    }
  }
  if (q.type === 'blank' && q.passage && !/_{5,}/.test(q.passage)) err(id, '빈칸 문제에 ____ 표기가 없습니다')
  if (q.type === 'order' && q.passage) {
    for (const mark of ['(A)', '(B)', '(C)']) {
      if (!q.passage.includes(mark)) err(id, `글의 순서 지문에 ${mark}가 없습니다`)
    }
  }

  // 지문/대본 중복 (같은 group이면 공유 허용)
  const text = info.section === 'listening' ? (q.script || []).map((l) => l.text).join(' ') : q.passage || ''
  if (text) {
    const key = text.replace(/\s+/g, ' ').trim().toLowerCase()
    if (textOwner.has(key) && (!q.group || textOwner.get(key) !== q.group)) {
      err(id, '다른 문항과 지문(대본)이 똑같습니다')
    }
    textOwner.set(key, q.group || null)
  }

  // 모의고사 문항 번호
  if (typeof q.set === 'string' && q.set.startsWith('mock-')) {
    if (!Number.isInteger(q.no) || q.no < 1 || q.no > 45) err(id, '모의고사 문항은 no(1~45)가 필요합니다')
    else if (info.section === 'listening' && q.no > 17) err(id, '듣기 문항은 1~17번이어야 합니다')
    else if (info.section === 'reading' && q.no < 18) err(id, '읽기 문항은 18~45번이어야 합니다')
  }
}

// 모의고사 회차별 검사: 번호 중복, 완성도
const mockGroups = new Map()
for (const q of questions) {
  if (typeof q.set === 'string' && q.set.startsWith('mock-')) {
    const key = `${q.level}/${q.set}`
    if (!mockGroups.has(key)) mockGroups.set(key, [])
    mockGroups.get(key).push(q)
  }
}
for (const [key, group] of mockGroups) {
  const nos = group.map((q) => q.no)
  const dup = nos.filter((n, i) => nos.indexOf(n) !== i)
  if (dup.length) err(key, `문항 번호가 중복됩니다: ${[...new Set(dup)].join(', ')}`)
  if (group.length !== 45) warn(key, `45문항 중 ${group.length}문항만 작성됨(작성 중)`)
}

// 정답 위치 분포: 한쪽으로 쏠리면 정답을 찍기 쉬워진다
function distribution(label, list) {
  if (list.length < 10) return
  const counts = [0, 0, 0, 0, 0]
  list.forEach((q) => Number.isInteger(q.answer) && counts[q.answer]++)
  const max = Math.max(...counts)
  if (max / list.length > 0.3) {
    warn(label, `정답 위치가 한쪽으로 쏠림 (①~⑤: ${counts.join('/')}, n=${list.length})`)
  }
}
for (const level of LEVELS) distribution(level.id, questions.filter((q) => q.level === level.id))
for (const [key, group] of mockGroups) distribution(key, group)

// 요약
console.log(`문항 ${questions.length}개, 파일 ${new Set(questions.map((q) => q.__file)).size}개`)
for (const level of LEVELS) {
  const list = questions.filter((q) => q.level === level.id)
  const listening = list.filter((q) => TYPES[q.type]?.section === 'listening').length
  console.log(`  ${level.name}(${level.id}): ${list.length}문항 (듣기 ${listening} / 읽기 ${list.length - listening})`)
}
if (warns.length) {
  console.log(`\n경고 ${warns.length}건`)
  warns.slice(0, 40).forEach((w) => console.log('  WARN ' + w))
  if (warns.length > 40) console.log(`  ... 외 ${warns.length - 40}건`)
}
if (errors.length) {
  console.log(`\n오류 ${errors.length}건`)
  errors.forEach((e) => console.log('  ERROR ' + e))
  process.exit(1)
}
console.log('\n검사 통과')
