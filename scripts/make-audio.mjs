// 듣기 음원 생성: src/content의 듣기 문항 대본을 영어 음성(mp3)으로 만들어 public/audio에 저장한다.
//
//   AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=koreacentral npm run audio
//   npm run audio -- --force        이미 있는 음원도 다시 만든다
//   npm run audio -- --manifest     음원은 만들지 않고 manifest.json만 갱신한다
//
// Azure AI Speech(무료 월 50만 자)를 사용한다. 키와 지역은 환경변수로만 받고 저장소에 넣지 않는다.
// 앱은 public/audio/manifest.json에 있는 문제만 음원으로 재생하고, 없으면 브라우저 임시 음성으로 대체한다.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TYPES } from '../src/data/types.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = path.join(root, 'src', 'content')
const audioDir = path.join(root, 'public', 'audio')

const VOICES = { W: 'en-US-JennyNeural', M: 'en-US-GuyNeural', N: 'en-US-AriaNeural' }
const RATE = { basic: '-15%', mid: '-5%', high: '0%' } // 등급별 속도
const args = new Set(process.argv.slice(2))

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

function buildSsml(question) {
  const rate = RATE[question.level] || '0%'
  const voices = question.script
    .map(
      (line) =>
        `<voice name="${VOICES[line.speaker] || VOICES.N}"><prosody rate="${rate}">${escapeXml(line.text)}<break time="700ms"/></prosody></voice>`,
    )
    .join('')
  return `<speak version="1.0" xml:lang="en-US" xmlns="http://www.w3.org/2001/10/synthesis">${voices}</speak>`
}

async function synthesize(ssml, key, region) {
  const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'suneung-english-audio',
    },
    body: ssml,
  })
  if (!response.ok) throw new Error(`Azure TTS ${response.status}: ${await response.text()}`)
  return Buffer.from(await response.arrayBuffer())
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

const key = process.env.AZURE_SPEECH_KEY
const region = process.env.AZURE_SPEECH_REGION
if (!key || !region) {
  console.error('AZURE_SPEECH_KEY, AZURE_SPEECH_REGION 환경변수가 필요합니다. (키는 저장소에 넣지 마세요)')
  process.exit(1)
}

fs.mkdirSync(audioDir, { recursive: true })
let made = 0
let skipped = 0
for (const question of questions) {
  const target = path.join(audioDir, `${question.id}.mp3`)
  if (fs.existsSync(target) && !args.has('--force')) {
    skipped++
    continue
  }
  const audio = await synthesize(buildSsml(question), key, region)
  fs.writeFileSync(target, audio)
  made++
  console.log(`생성: ${question.id} (${Math.round(audio.length / 1024)}KB)`)
}
console.log(`완료: 새로 ${made}개, 건너뜀 ${skipped}개, manifest ${writeManifest()}개`)
