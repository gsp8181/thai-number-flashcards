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

  const autoTimer = useRef(null)

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
    autoTimer.current = setInterval(() => {
      nextRandom()
    }, Math.max(1000, intervalSec * 1000))
  }

  function stopAuto() {
    if (autoTimer.current) {
      clearInterval(autoTimer.current)
      autoTimer.current = null
    }
  }

  function clampMax(n) {
    const num = Number(n) || 1
    return Math.min(Math.max(1, Math.floor(num)), 10000000)
  }

  function newRandomWithMax(m) {
    const n = Math.floor(Math.random() * m) + 1
    pushToHistory(n)
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
    newRandomWithMax(m)
  }

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

  return (
    <div className="app">
      <header>
        <h1>Thai Number Flashcards</h1>
        <p>Random flashcards up to a max number (1..10,000,000). Keyboard: Space reveal, ← previous, → next.</p>
      </header>

      <section className="controls">
        <label>
          Max number (1 - 10,000,000):
          <input
            type="number"
            min="1"
            max="10000000"
            value={max}
            onChange={(e) => setMax(clampMax(e.target.value))}
          />
        </label>

        <div className="btn-row">
          <button onClick={() => nextRandom()}>New Random</button>
          <button onClick={() => prev()} disabled={index <= 0}>Prev</button>
          <button onClick={() => nextInHistory()}>Next</button>
          <button onClick={() => toggleReveal()}>{showAnswer ? 'Hide' : 'Reveal'}</button>
          <button onClick={() => markCorrect()}>Mark Correct & Next</button>
        </div>

        <div className="toggles">
          <label><input type="checkbox" checked={ttsEnabled} onChange={(e) => setTtsEnabled(e.target.checked)} /> TTS</label>
          <label><input type="checkbox" checked={showThaiNumerals} onChange={(e) => setShowThaiNumerals(e.target.checked)} /> Show Thai numerals</label>
          <label><input type="checkbox" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} /> Auto advance</label>
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
        <small>Built with Vite + React. Deploy with GitHub Pages workflow in .github/workflows/pages.yml</small>
      </footer>
    </div>
  )
}

export default App