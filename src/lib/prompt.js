// 듣기 방송의 한국어 안내 문장. 음원 생성(scripts/make-audio.mjs)과 임시 음성(브라우저 TTS)이 같은 문장을 쓴다.
// 수능 듣기 방송의 구성(문항 번호 + 발문을 한국어로 읽은 뒤 영어 대본)을 따르되 문장은 직접 쓴 것이다.
const OPENING = '지금부터 영어 듣기 평가를 시작하겠습니다. 문제지를 보며 방송을 듣고 답을 고르세요.'
const CLOSING = '이상으로 영어 듣기 평가를 마치겠습니다.'
// 문항 번호는 한자어 숫자로 읽는다(5번 → 오 번). 숫자로 적으면 음성이 "다섯 번"으로 읽을 수 있다.
const SINO = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']
export const sino = (n) => (n >= 10 ? (n >= 20 ? SINO[Math.floor(n / 10)] : '') + '십' : '') + SINO[n % 10]

const SET_NOTICE = `${sino(16)}번부터 ${sino(17)}번까지는 하나의 담화를 듣고 두 문제에 답하는 문제입니다.`

/** 발문에서 '[16~17]' 같은 묶음 표시를 뺀 문장. */
export const stemOf = (question) => question.stem.replace(/^\[\d+~\d+\]\s*/, '')

/** 영어 대본 앞에 한국어로 읽는 문장들(문항 번호와 발문). */
export function spokenBefore(question) {
  const lines = []
  if (question.no === 1) lines.push(OPENING)
  if (question.no === 16) lines.push(SET_NOTICE)
  lines.push(`${sino(question.no)}번. ${stemOf(question)}`)
  return lines
}

/** 영어 대본 뒤에 한국어로 읽는 문장들(마지막 문항만). */
export function spokenAfter(question) {
  return question.no === 17 ? [CLOSING] : []
}
