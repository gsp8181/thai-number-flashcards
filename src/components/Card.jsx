import React from 'react'

export default function Card({ number, showAnswer, thaiWords, romanization, thaiNumerals, showArabicNumerals = true }) {
  return (
    <div className="card">
      <div className="card-top">
        {showArabicNumerals && <div className="arabic">{number.toLocaleString()}</div>}
        {showArabicNumerals && thaiNumerals && <div className="num-sep">•</div>}
        {thaiNumerals && <div className="thai-numeral">{thaiNumerals}</div>}
      </div>

      <div className="card-body">
        {showAnswer ? (
          <>
            <div className="thai-words">{thaiWords}</div>
            <div className="romanization">{romanization}</div>
          </>
        ) : (
          <div className="hidden-answer">● ● ●</div>
        )}
      </div>
    </div>
  )
}