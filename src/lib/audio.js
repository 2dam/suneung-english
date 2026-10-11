import { useEffect, useState } from 'react'

// public/audio/manifest.json: { "<문제 id>": "/audio/<파일>.mp3" }
// scripts/make-audio.mjs가 음원을 만들면서 갱신한다. 없거나 비어 있으면 임시 음성(브라우저 TTS)으로 대체한다.
let manifestPromise = null

function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch('/audio/manifest.json')
      .then((response) => (response.ok ? response.json() : {}))
      .catch(() => ({}))
  }
  return manifestPromise
}

/** 문제 id에 해당하는 음원 주소(없으면 null). */
export function useAudioUrl(id) {
  const [state, setState] = useState({ id: null, url: null })

  useEffect(() => {
    let alive = true
    loadManifest().then((manifest) => {
      if (alive) setState({ id, url: typeof manifest[id] === 'string' ? manifest[id] : null })
    })
    return () => {
      alive = false
    }
  }, [id])

  return state.id === id ? state.url : null
}
