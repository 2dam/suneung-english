// 듣기 음원 생성: src/content의 듣기 문항 대본을 영어 음성(mp3)으로 만들어 public/audio에 저장한다.
//
//   GOOGLE_TTS_KEY=... npm run audio
//   npm run audio -- --force        이미 있는 음원도 다시 만든다
//   npm run audio -- --manifest     음원은 만들지 않고 manifest.json만 갱신한다
//   node scripts/make-audio.mjs --mocks=10   1~10회 문항만 만든다(A·B코스 전 학년)
//   node scripts/make-audio.mjs --only=m2b-01-01   지정한 id로 시작하는 문항만 만든다(시험용)
//     ※ npm run audio -- --only=... 는 npm이 --only를 가로채 전체를 만들어 버리니 node로 직접 실행한다.
//
// Google Cloud Text-to-Speech(REST)를 사용한다. 키는 환경변수로만 받고 저장소에 넣지 않는다.
// 앱은 public/audio/manifest.json에 있는 문제만 음원으로 재생하고, 없으면 브라우저 임시 음성으로 대체한다.
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { TYPES } from '../src/data/types.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = path.join(root, 'src', 'content')
const audioDir = path.join(root, 'public', 'audio')

// 화자별 음성. 요금 등급(Standard/WaveNet/Neural2)은 이름 중간 값으로 바뀐다.
const VOICE_TIER = 'Neural2'
const VOICES = { W: `en-US-${VOICE_TIER}-F`, M: `en-US-${VOICE_TIER}-D`, N: `en-US-${VOICE_TIER}-C` }
const RATE = { m1: 0.8, m2: 0.9, m3: 0.95 } // 학년별 속도(1.0이 기본)
const GAP_MS = 700 // 대사 사이 쉼
const OUT_BITRATE = '32k' // 저장 용량을 줄이려고 Google이 준 64kbps를 ffmpeg로 줄인다(말소리라 32k로 충분)
const args = new Set(process.argv.slice(2))
const only = [...args].find((a) => a.startsWith('--only='))?.slice(7)
const maxMock = Number([...args].find((a) => a.startsWith('--mocks='))?.slice(8)) || Infinity
// id(m1-01-01, m2b-01-01)에서 회차 번호를 읽는다.
const mockNo = (id) => Number(/^m\d+b?-(\d+)-/.exec(id)?.[1])

function listJson(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return listJson(full)
    return entry.name.endsWith('.json') ? [full] : []
  })
}

const escapeXml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Google은 한 요청에 한 목소리만 쓸 수 있어 대사마다 따로 호출해 mp3를 이어 붙인다.
// 대사 사이의 쉼은 각 대사 끝에 SSML <break>로 넣는다.
async function synthesize(question, key) {
  const rate = RATE[question.level] ?? 1
  const parts = []
  for (const line of question.script) {
    const voice = VOICES[line.speaker] || VOICES.N
    const ssml = `<speak>${escapeXml(line.text)}<break time="${GAP_MS}ms"/></speak>`
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { ssml },
        voice: { languageCode: 'en-US', name: voice },
        audioConfig: { audioEncoding: 'MP3', speakingRate: rate, sampleRateHertz: 24000 },
      }),
    })
    if (!response.ok) throw new Error(`Google TTS ${response.status}: ${await response.text()}`)
    parts.push(Buffer.from((await response.json()).audioContent, 'base64'))
  }
  return shrink(Buffer.concat(parts))
}

// mp3를 모노 22.05kHz, OUT_BITRATE로 다시 인코딩한다. ffmpeg가 PATH에 있어야 한다.
function shrink(mp3) {
  const result = spawnSync(
    'ffmpeg',
    ['-v', 'error', '-i', 'pipe:0', '-ac', '1', '-ar', '22050', '-b:a', OUT_BITRATE, '-f', 'mp3', 'pipe:1'],
    { input: mp3, maxBuffer: 64 * 1024 * 1024 },
  )
  if (result.error || result.status !== 0) {
    throw new Error(`ffmpeg 실행 실패: ${result.error?.message || result.stderr?.toString()}`)
  }
  return result.stdout
}

function writeManifest() {
  fs.mkdirSync(audioDir, { recursive: true })
  const manifest = {}
  for (const file of fs.readdirSync(audioDir).sort()) {
    if (file.endsWith('.mp3')) manifest[file.slice(0, -4)] = `/audio/${file}`
  }
  fs.writeFileSync(path.join(audioDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  return Object.keys(manifest).length
}

const questions = listJson(contentDir)
  .flatMap((file) => JSON.parse(fs.readFileSync(file, 'utf8')))
  .filter((q) => TYPES[q.type]?.section === 'listening' && Array.isArray(q.script))

if (args.has('--manifest')) {
  console.log(`manifest.json 갱신: 음원 ${writeManifest()}개`)
  process.exit(0)
}

const key = process.env.GOOGLE_TTS_KEY
if (!key) {
  console.error('GOOGLE_TTS_KEY 환경변수가 필요합니다. (키는 저장소에 넣지 마세요)')
  process.exit(1)
}
if (spawnSync('ffmpeg', ['-version']).error) {
  console.error('ffmpeg를 찾을 수 없습니다. 설치 후 PATH에 추가하세요. (예: winget install Gyan.FFmpeg)')
  process.exit(1)
}

fs.mkdirSync(audioDir, { recursive: true })
let made = 0
let skipped = 0
for (const question of questions) {
  if (only && !question.id.startsWith(only)) continue
  if (mockNo(question.id) > maxMock) continue
  const target = path.join(audioDir, `${question.id}.mp3`)
  if (fs.existsSync(target) && !args.has('--force')) {
    skipped++
    continue
  }
  const audio = await synthesize(question, key)
  fs.writeFileSync(target, audio)
  made++
  console.log(`생성: ${question.id} (${Math.round(audio.length / 1024)}KB)`)
}
console.log(`완료: 새로 ${made}개, 건너뜀 ${skipped}개, manifest ${writeManifest()}개`)
