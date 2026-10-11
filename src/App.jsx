import { useState } from 'react'
import { getLevel } from './data/levels'
import { QUESTION_MAP } from './data/questions'
import { load, save } from './lib/storage'
import { stopSpeech } from './lib/speech'
import LevelSelect from './components/LevelSelect'
import PracticeSetup from './components/PracticeSetup'
import QuizRunner from './components/QuizRunner'
import ResultView from './components/ResultView'
import WrongNotes from './components/WrongNotes'

export default function App() {
  const [levelId, setLevelId] = useState(() => load('level', null))
  const [tab, setTab] = useState('study')
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)
  // 오답노트: { [문제 id]: { count, last } }
  const [wrong, setWrong] = useState(() => load('wrong', {}))

  const level = getLevel(levelId)

  const chooseLevel = (id) => {
    save('level', id)
    setLevelId(id)
  }

  const start = (title, questions) => {
    if (questions.length === 0) return
    stopSpeech()
    setResult(null)
    setSession({ title, questions })
  }

  const startByIds = (title, ids) => start(title, ids.map((id) => QUESTION_MAP[id]).filter(Boolean))

  const updateWrong = (next) => {
    setWrong(next)
    save('wrong', next)
  }

  const finish = (items) => {
    const next = { ...wrong }
    items.forEach((item) => {
      if (item.correct) {
        delete next[item.id]
      } else {
        next[item.id] = { count: (next[item.id]?.count || 0) + 1, last: Date.now() }
      }
    })
    updateWrong(next)
    setResult({ title: session.title, items })
    setSession(null)
  }

  const goHome = () => {
    stopSpeech()
    setSession(null)
    setResult(null)
    setTab('study')
  }

  if (!level) return <LevelSelect onSelect={chooseLevel} />

  const wrongCount = Object.keys(wrong).filter((id) => QUESTION_MAP[id]).length

  return (
    <main className="shell">
      <header className="topbar">
        <button type="button" className="brand" onClick={goHome}>
          수능영어
        </button>
        <button type="button" className="level-chip" onClick={() => setLevelId(null)}>
          {level.name} · 변경
        </button>
      </header>

      {!session && !result && (
        <nav className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'study'} className={tab === 'study' ? 'on' : ''} onClick={() => setTab('study')}>
            학습
          </button>
          <button type="button" role="tab" aria-selected={tab === 'wrong'} className={tab === 'wrong' ? 'on' : ''} onClick={() => setTab('wrong')}>
            오답노트{wrongCount > 0 ? ` (${wrongCount})` : ''}
          </button>
        </nav>
      )}

      {session ? (
        <QuizRunner key={session.title + session.questions.length} title={session.title} questions={session.questions} onFinish={finish} onExit={goHome} />
      ) : result ? (
        <ResultView result={result} onRetryWrong={(ids) => startByIds('틀린 문제 복습', ids)} onHome={goHome} />
      ) : tab === 'study' ? (
        <PracticeSetup level={level} onStart={start} />
      ) : (
        <WrongNotes
          wrong={wrong}
          onRetry={(ids) => startByIds('오답 복습', ids)}
          onRemove={(id) => {
            const next = { ...wrong }
            delete next[id]
            updateWrong(next)
          }}
        />
      )}
    </main>
  )
}
