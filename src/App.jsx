import React, { useEffect, useState, useRef } from 'react'
import Card from './components/Card'
import {
  numberToThaiWords,
  numberToRomanization,
  numberToThaiNumerals
} from './utils/numberToThai'

function App() {
  const [max, setMax] = useState(() => {
    try { const v = localStorage.getItem('max'); return v ? Number(v) : 100 } catch { return 100 }
  })
  const [current, setCurrent] = useState(null)
  const [history, setHistory] = useState([])
  const [index, setIndex] = useState(-1)
  const [showAnswer, setShowAnswer] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    try { const v = localStorage.getItem('ttsEnabled'); return v === null ? true : v === '1' } catch { return true }
  })
  const [autoAdvance, setAutoAdvance] = useState(() => {
    try { const v = localStorage.getItem('autoAdvance'); return v === '1' } catch { return false }
  })
  const [intervalSec, setIntervalSec] = useState(() => {
    try { const v = localStorage.getItem('intervalSec'); return v ? Number(v) : 5 } catch { return 5 }
  })
  const [showThaiNumerals, setShowThaiNumerals] = useState(() => {
    try { const v = localStorage.getItem('showThaiNumerals'); return v === null ? true : v === '1' } catch { return true }
  })
  const [showArabicNumerals, setShowArabicNumerals] = useState(() => {
    try { const v = localStorage.getItem('showArabicNumerals'); return v === null ? true : v === '1' } catch { return true }
  })
  const [romanStyle, setRomanStyle] = useState(() => {
    try { const v = localStorage.getItem('romanStyle'); return v || 'PB+' } catch { return 'PB+' }
  })
  const [score, setScore] = useState({ seen: 0, correct: 0 })
  const [versionHash, setVersionHash] = useState(null)

  const autoTimer = useRef(null)
  const autoPhase = useRef(0) // 0 = showing card, 1 = showing answer
  const autoTickRef = useRef(null)
  const showAnswerRef = useRef(showAnswer)
  const ttsEnabledRef = useRef(ttsEnabled)
  const currentRef = useRef(current)
  const historyRef = useRef(history)
  const indexRef = useRef(index)
  const lastIndexWhenTimerSet = useRef(index)

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

  useEffect(() => {
    showAnswerRef.current = showAnswer
  }, [showAnswer])

  useEffect(() => {
    ttsEnabledRef.current = ttsEnabled
  }, [ttsEnabled])

  // Helper to asynchronously get voices (some browsers populate async)
  function getVoicesAsync(timeout = 1500) {
    return new Promise((resolve) => {
      try {
        const v = window.speechSynthesis.getVoices()
        if (v && v.length) return resolve(v)
      } catch (e) {
        return resolve([])
      }
      let resolved = false
      const onChange = () => {
        if (resolved) return
        const v = window.speechSynthesis.getVoices()
        if (v && v.length) {
          resolved = true
          cleanup()
          resolve(v)
        }
      }
      const cleanup = () => {
        try {
          window.speechSynthesis.onvoiceschanged = null
        } catch (e) {}
        clearTimeout(timer)
      }
      try {
        window.speechSynthesis.onvoiceschanged = onChange
      } catch (e) {}
      const timer = setTimeout(() => {
        if (resolved) return
        resolved = true
        cleanup()
        try {
          resolve(window.speechSynthesis.getVoices() || [])
        } catch (e) {
          resolve([])
        }
      }, timeout)
    })
  }

  function findThaiVoice(voices) {
    if (!voices || !voices.length) return null
    let v = voices.find((x) => x.lang && x.lang.toLowerCase().startsWith('th'))
    if (v) return v
    v = voices.find((x) => /thai/i.test(x.name))
    if (v) return v
    v = voices.find((x) => x.lang && x.lang.toLowerCase().includes('th'))
    return v || null
  }

  useEffect(() => {
    currentRef.current = current
  }, [current])

  useEffect(() => {
    historyRef.current = history
  }, [history])

  useEffect(() => {
    indexRef.current = index
  }, [index])

  function startAuto() {
    stopAuto()
    const m = clampMax(max)
    if (m <= 0) return

    // start cycle: immediately show a new card then toggle reveal after interval
    autoPhase.current = 0
    nextRandom()
    setShowAnswer(false)

    const tick = async () => {
      if (indexRef.current !== lastIndexWhenTimerSet.current) {
        autoPhase.current = 0
        showAnswerRef.current = false
        setShowAnswer(false)
        lastIndexWhenTimerSet.current = indexRef.current
      }
      if (autoPhase.current === 0) {
        // reveal
        setShowAnswer(true)
        // speak when revealing automatically
        if (ttsEnabledRef.current && currentRef.current != null) {
          speakThai(numberToThaiWords(currentRef.current))
        }
        autoPhase.current = 1
      } else {
        // If the answer is currently hidden (user hid it), prefer to reveal instead of fetching a new number
        if (!showAnswerRef.current) {
          setShowAnswer(true)
          if (ttsEnabledRef.current && currentRef.current != null) {
            speakThai(numberToThaiWords(currentRef.current))
          }
          autoPhase.current = 1
        } else {
          // new card: if user is viewing older history, advance through history first
          const mm = clampMax(max)
          if (mm <= 0) {
            stopAuto()
            return
          }
          if (indexRef.current < (historyRef.current.length - 1)) {
            // advance in history instead of creating a new random
            nextInHistory()
          } else {
            nextRandom()
          }
          setShowAnswer(false)
          autoPhase.current = 0
        }
      }
      autoTimer.current = setTimeout(tick, Math.max(1000, intervalSec * 1000))
      lastIndexWhenTimerSet.current = indexRef.current
    }

    autoTickRef.current = tick
    autoTimer.current = setTimeout(tick, Math.max(1000, intervalSec * 1000))
    lastIndexWhenTimerSet.current = indexRef.current
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
    lastIndexWhenTimerSet.current = indexRef.current
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
    // set phase to showing card
    autoPhase.current = 0
    resetAutoIfRunning()
  }

  function handlePrev() {
    prev()
    autoPhase.current = 0
    resetAutoIfRunning()
  }

  function handleNextInHistory() {
    nextInHistory()
    autoPhase.current = 0
    resetAutoIfRunning()
  }

  function handleToggleReveal() {
    toggleReveal()
    // if user reveals, set phase to showing answer
    autoPhase.current = 1
    resetAutoIfRunning()
  }

  function handleMarkCorrect() {
    markCorrect()
    autoPhase.current = 0
    resetAutoIfRunning()
  }

  function pushToHistory(n) {
    setHistory((prev) => {
      // If user navigated back, truncate any "future" entries and append
      const base = prev.slice(0, indexRef.current + 1)
      const next = base.concat(n)
      // update index to point to the newly appended item
      setIndex(next.length - 1)
      setCurrent(n)
      setShowAnswer(false)
      return next
    })
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
    // Listen for service worker messages about updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (ev) => {
        try {
          const data = ev.data || {}
          if (data.type === 'UPDATED' && data.hash) {
            // if we have a different version, reload to pick up new assets
            if (data.hash !== versionHash) {
              // show version immediately and reload after short delay
              setVersionHash(data.hash)
              setTimeout(() => {
                window.location.reload()
              }, 1200)
            }
          }
        } catch (e) {
          // ignore
        }
      })
    }
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
            onChange={(e) => { const v = clampMax(e.target.value); setMax(v); try { localStorage.setItem('max', String(v)) } catch {} }}
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
          <label>
            <input
              type="checkbox"
              checked={ttsEnabled}
              onChange={async (e) => {
                const want = e.target.checked
                if (want) {
                  // check availability
                  if (!('speechSynthesis' in window)) {
                    alert('Text-to-speech is not available in this browser')
                    e.target.checked = false
                    setTtsEnabled(false)
                    return
                  }
                  const voices = await getVoicesAsync(2000)
                  const thai = findThaiVoice(voices)
                  if (!thai) {
                    alert('No Thai TTS voice detected. TTS will be disabled.')
                    e.target.checked = false
                    setTtsEnabled(false)
                    return
                  }
                }
                setTtsEnabled(want)
                    try { localStorage.setItem('ttsEnabled', want ? '1' : '0') } catch {}
              }}
            /> TTS
          </label>
          <label><input type="checkbox" checked={showThaiNumerals} onChange={(e) => { const v = e.target.checked; setShowThaiNumerals(v); try { localStorage.setItem('showThaiNumerals', v ? '1' : '0') } catch {} }} /> Show Thai numerals</label>
          <label><input type="checkbox" checked={showArabicNumerals} onChange={(e) => { const v = e.target.checked; setShowArabicNumerals(v); try { localStorage.setItem('showArabicNumerals', v ? '1' : '0') } catch {} }} /> Show Arabic numerals</label>
          <label>
            Romanization:
            <select value={romanStyle} onChange={(e) => { setRomanStyle(e.target.value); try { localStorage.setItem('romanStyle', e.target.value) } catch {} }}>
              <option value="PB+">PB+</option>
              <option value="RTGS+">RTGS (+Tone&Vowel)</option>
              <option value="RTGS">RTGS (simple)</option>
            </select>
          </label>
          <label><input type="checkbox" checked={autoAdvance} onChange={(e) => { const v = e.target.checked; setAutoAdvance(v); try { localStorage.setItem('autoAdvance', v ? '1' : '0') } catch {} }} disabled={clampMax(max) <= 0} /> Auto advance</label>
          <label>Interval (sec): <input type="number" min="1" value={intervalSec} onChange={(e) => { const v = Number(e.target.value) || 5; setIntervalSec(v); try { localStorage.setItem('intervalSec', String(v)) } catch {} }} /></label>
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
            romanization={numberToRomanization(current, romanStyle)}
            thaiNumerals={showThaiNumerals ? numberToThaiNumerals(current) : null}
            showArabicNumerals={showArabicNumerals}
            romanStyle={romanStyle}
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