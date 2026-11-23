// 실제 서비스 주소. PDF를 로컬(localhost)에서 만들어도 QR은 이 주소를 가리켜야 한다.
export const SITE_URL = 'https://suneung.ichapterwise.com'

/** 듣기 문항 주소. 문제지의 듣기 문항 QR이 가리키며, 열면 그 문항의 듣기만 재생된다. */
export const listenUrl = (questionId) => `${SITE_URL}/?listen=${questionId}`
