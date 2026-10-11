const PREFIX = 'se:'

// 사생활 보호 모드·저장소 차단 환경에서도 화면이 깨지지 않도록 항상 try/catch로 감싼다.
export function load(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // 저장 실패는 무시: 이 앱의 학습 기록은 편의 기능이다.
  }
}
