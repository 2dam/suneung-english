// 실제 서비스 주소. PDF를 로컬(localhost)에서 만들어도 QR은 이 주소를 가리켜야 한다.
export const SITE_URL = 'https://suneung.ichapterwise.com'

/** 문제지 주소. 목록 화면의 QR이 가리키며, 열면 문제지가 나오고 인쇄할지 묻는다. */
export const sheetUrl = (courseId, levelId, number) => `${SITE_URL}/?sheet=${courseId}:${levelId}:${number}`

/** 회차 바로가기 주소. 열면 해당 회차 모의고사가 바로 시작된다(시험지에 인쇄되는 QR이 가리킨다). */
export const examUrl = (courseId, levelId, number) => `${SITE_URL}/?exam=${courseId}:${levelId}:${number}`
