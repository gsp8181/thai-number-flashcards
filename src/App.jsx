import React, { useEffect, useState, useRef } from 'react'
import Card from './components/Card'
import {
  numberToThaiWords,
  numberToRomanization,
  numberToThaiNumerals
} from './utils/numberToThai'

function App() {
  const [max, setMax] = useState(100)
  const [current, setCurrent] = useState(null)
  const [history, setHistory] = useState([])
  const [index, setIndex] = useState(-1)
  const [showAnswer, setShowAnswer] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [intervalSec, setIntervalSec] = useState(5)
  const [showThaiNumerals, setShowThaiNumerals] = useState(true)
  const [score, setScore] = useState({ seen: 0, correct: 0 })
  const [versionHash, setVersionHash] = useState(null)

  const autoTimer = useRef(null)
  const autoPhase = useRef(0) // 0 = showing card, 1 = showing answer
  const autoTickRef = useRef(null)

  useEffect(() => {
    function handleKeys(e) {
      if (e.code === 'Space') {
        e.preventDefault()
        toggleReveal()
      } else if (e.key === 'ArrowRight') {
        nextRandom()
      } else if (e.key === 'ArrowLeft') {
        prev()
      }
    }
    window.addEventListener('keydown', handleKeys)
    return () => window.removeEventListener('keydown', handleKeys)
  }, [index, history, current, showAnswer])

  useEffect(() => {
    if (autoAdvance) {
      startAuto()
    } else {
      stopAuto()
    }
    return () => stopAuto()
  }, [autoAdvance, intervalSec, max])

  function startAuto() {
    stopAuto()
    const m = clampMax(max)
    if (m <= 0) return

    // start cycle: immediately show a new card then toggle reveal after interval
    autoPhase.current = 0
    nextRandom()
    setShowAnswer(false)

    const tick = async () => {
      if (autoPhase.current === 0) {
        // reveal
        setShowAnswer(true)
        autoPhase.current = 1
      } else {
        // new card
        const mm = clampMax(max)
        if (mm <= 0) {
          stopAuto()
          return
        }
        nextRandom()
        setShowAnswer(false)
        autoPhase.current = 0
      }
      autoTimer.current = setTimeout(tick, Math.max(1000, intervalSec * 1000))
    }

    autoTickRef.current = tick
    autoTimer.current = setTimeout(tick, Math.max(1000, intervalSec * 1000))
  }

  function stopAuto() {
    if (autoTimer.current) {
      clearTimeout(autoTimer.current)
      autoTimer.current = null
    }
  }

  function resetAutoIfRunning() {
    if (!autoAdvance) return
    if (!autoTickRef.current) return
    if (autoTimer.current) {
      clearTimeout(autoTimer.current)
    }
    autoTimer.current = setTimeout(autoTickRef.current, Math.max(1000, intervalSec * 1000))
  }

  function clampMax(n) {
    // Allow empty string and zero as valid while keeping bounds
    if (n === '' || n === null) return 0
    const num = Number(n)
    if (Number.isNaN(num)) return 0
    return Math.min(Math.max(0, Math.floor(num)), 10000000)
  }

  function newRandomWithMax(m) {
    if (m <= 0) return
    const n = Math.floor(Math.random() * m) + 1
    pushToHistory(n)
  }

  // UI wrapper handlers that also reset the auto timer when the user acts
  function handleNextRandom() {
    nextRandom()
    resetAutoIfRunning()
  }

  function handlePrev() {
    prev()
    resetAutoIfRunning()
  }

  function handleNextInHistory() {
    nextInHistory()
    resetAutoIfRunning()
  }

  function handleToggleReveal() {
    toggleReveal()
    resetAutoIfRunning()
  }

  function handleMarkCorrect() {
    markCorrect()
    resetAutoIfRunning()
  }

  function pushToHistory(n) {
    const nextHistory = history.slice(0, index + 1)
    nextHistory.push(n)
    setHistory(nextHistory)
    setIndex(nextHistory.length - 1)
    setCurrent(n)
    setShowAnswer(false)
    setScore((s) => ({ ...s, seen: s.seen + 1 }))
  }

  function nextRandom() {
    const m = clampMax(max)
    if (m <= 0) return
    newRandomWithMax(m)
  }

  // When max becomes 0, ensure auto-advance is disabled and timers stopped
  useEffect(() => {
    if (clampMax(max) <= 0) {
      setAutoAdvance(false)
      stopAuto()
    }
  }, [max])

  function prev() {
    if (index > 0) {
      const newIndex = index - 1
      setIndex(newIndex)
      setCurrent(history[newIndex])
      setShowAnswer(false)
    }
  }

  function nextInHistory() {
    if (index < history.length - 1) {
      const newIndex = index + 1
      setIndex(newIndex)
      setCurrent(history[newIndex])
      setShowAnswer(false)
    } else {
      nextRandom()
    }
  }

  function toggleReveal() {
    const willShow = !showAnswer
    setShowAnswer(willShow)
    if (willShow && ttsEnabled && current != null) {
      speakThai(numberToThaiWords(current))
    }
  }

  function markCorrect() {
    setScore((s) => ({ ...s, correct: s.correct + 1 }))
    nextRandom()
  }

  function speakThai(text) {
    if (!window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'th-TH'
    // try to pick a Thai voice if available
    const voices = window.speechSynthesis.getVoices()
    const thVoice = voices.find((v) => v.lang && v.lang.startsWith('th'))
    if (thVoice) utter.voice = thVoice
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  useEffect(() => {
    // try to load the build version produced during CI (version.json)
    fetch('version.json', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('no version')
        return r.json()
      })
      .then((j) => setVersionHash(j && j.hash ? j.hash : null))
      .catch(() => setVersionHash(null))
  }, [])

  return (
    <div className="app">
      <header>
        <h1>Thai Number Flashcards</h1>
        <p>Keyboard: Space reveal, ← previous, → next.</p>
      </header>

      <section className="controls">
        <label>
          Max number:
          <input
            type="number"
            min="0"
            max="10000000"
            value={max}
            onChange={(e) => setMax(clampMax(e.target.value))}
          />
        </label>

        <div className="btn-row">
          <button onClick={() => handleNextRandom()} disabled={clampMax(max) <= 0}>New Random</button>
          <button onClick={() => handlePrev()} disabled={index <= 0}>Prev</button>
          <button onClick={() => handleNextInHistory()} disabled={clampMax(max) <= 0}>Next</button>
          <button onClick={() => handleToggleReveal()}>{showAnswer ? 'Hide' : 'Reveal'}</button>
          <button onClick={() => handleMarkCorrect()} disabled={clampMax(max) <= 0}>Mark Correct & Next</button>
        </div>

        <div className="toggles">
          <label><input type="checkbox" checked={ttsEnabled} onChange={(e) => setTtsEnabled(e.target.checked)} /> TTS</label>
          <label><input type="checkbox" checked={showThaiNumerals} onChange={(e) => setShowThaiNumerals(e.target.checked)} /> Show Thai numerals</label>
          <label><input type="checkbox" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} disabled={clampMax(max) <= 0} /> Auto advance</label>
          <label>Interval (sec): <input type="number" min="1" value={intervalSec} onChange={(e) => setIntervalSec(Number(e.target.value) || 5)} /></label>
        </div>
      </section>

      <main>
        {current == null ? (
          <div className="placeholder">
            <p>Press "New Random" to start</p>
          </div>
        ) : (
          <Card
            number={current}
            showAnswer={showAnswer}
            thaiWords={numberToThaiWords(current)}
            romanization={numberToRomanization(current)}
            thaiNumerals={showThaiNumerals ? numberToThaiNumerals(current) : null}
          />
        )}
      </main>

      <footer>
        <div>Seen: {score.seen} • Correct: {score.correct}</div>
        <small>{versionHash ? `Build: ${versionHash}` : 'Unknown build'} • Created by gsp8181</small>
      </footer>
    </div>
  )
}

export default App