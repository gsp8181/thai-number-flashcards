import React from 'react'

export default function Card({ number, showAnswer, thaiWords, romanization, thaiNumerals }) {
  return (
    <div className="card">
      <div className="card-top">
        <div className="arabic">{number.toLocaleString()}</div>
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