// 모의고사를 PDF(문제지, 정답·해설)로 내보낸다.
//
//   npm run build && npx vite preview --port 4173      (다른 터미널)
//   node scripts/export-pdf.mjs [--base http://localhost:4173] [--out exports/pdf] [--course a]
//                               [--level m3] [--mock 10]
//
// 앱에 ?pdf=<코스>:<학년>:<회차>:<questions|answers> 주소로 접속하면 인쇄용 문서만 그려지고,
// 설치된 Chrome/Edge의 헤드리스 모드가 그것을 PDF로 저장한다.
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}
const base = opt('base', 'http://localhost:4173')
const outDir = resolve(opt('out', 'exports/pdf'))
const courseFilter = opt('course', null)
const levelFilter = opt('level', null)
const mockFilter = opt('mock', null)

const LEVEL_NAME = { m1: '중1', m2: '중2', m3: '중3' }
const COURSE_NAME = { a: 'A코스', b: 'B코스' }

const browsers = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]
const browser = browsers.find((path) => existsSync(path))
if (!browser) {
  console.error('Chrome 또는 Edge를 찾을 수 없습니다.')
  process.exit(1)
}

// 45문항이 모두 있는 회차만 찾는다.
const contentRoot = resolve('src/content')
const jobs = []
for (const course of readdirSync(contentRoot)) {
  if (courseFilter && course !== courseFilter) continue
  for (const level of readdirSync(join(contentRoot, course))) {
    if (levelFilter && level !== levelFilter) continue
    const counts = new Map()
    for (const file of readdirSync(join(contentRoot, course, level))) {
      const match = file.match(/^mock-(\d+)-/)
      if (!match) continue
      const items = JSON.parse(readFileSync(join(contentRoot, course, level, file), 'utf8'))
      counts.set(match[1], (counts.get(match[1]) || 0) + items.length)
    }
    for (const [number, count] of [...counts.entries()].sort()) {
      if (count !== 45) continue
      if (mockFilter && Number(number) !== Number(mockFilter)) continue
      for (const mode of ['questions', 'answers']) jobs.push({ course, level, number: Number(number), mode })
    }
  }
}

function run(job) {
  const dir = join(outDir, `${LEVEL_NAME[job.level]}_${COURSE_NAME[job.course]}`)
  mkdirSync(dir, { recursive: true })
  const label = job.mode === 'questions' ? '문제지' : '정답해설'
  const file = join(dir, `${LEVEL_NAME[job.level]}_${COURSE_NAME[job.course]}_모의고사${String(job.number).padStart(2, '0')}회_${label}.pdf`)
  const url = `${base}/?pdf=${job.course}:${job.level}:${job.number}:${job.mode}`
  const profile = mkdtempSync(join(tmpdir(), 'se-pdf-'))
  return new Promise((done, fail) => {
    const child = spawn(
      browser,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        `--user-data-dir=${profile}`,
        '--no-pdf-header-footer',
        '--virtual-time-budget=8000',
        `--print-to-pdf=${file}`,
        url,
      ],
      { stdio: 'ignore' },
    )
    child.on('exit', () => {
      rmSync(profile, { recursive: true, force: true })
      existsSync(file) ? done(file) : fail(new Error(`PDF 생성 실패: ${url}`))
    })
  })
}

console.log(`${jobs.length}개 PDF 생성 → ${outDir}`)
const queue = [...jobs]
let finished = 0
async function worker() {
  while (queue.length) {
    const job = queue.shift()
    try {
      await run(job)
    } catch (error) {
      console.error(error.message)
    }
    finished += 1
    if (finished % 6 === 0 || finished === jobs.length) console.log(`  ${finished}/${jobs.length}`)
  }
}
await Promise.all(Array.from({ length: 3 }, worker))
console.log('완료')
