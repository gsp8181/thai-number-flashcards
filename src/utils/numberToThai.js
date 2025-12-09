// Utilities to convert numbers to Thai words, RTGS-like romanization,
// and Thai numerals (๑, ๒, ...).
//
// Supports 1 .. 10,000,000 inclusive.

const digitsThai = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
const digitsRoman = ['soon', 'neung', 'song', 'sam', 'si', 'ha', 'hok', 'jet', 'paet', 'kao']
const digitsPhonetic = ['soon', 'neung', 'song', 'sam', 'see', 'ha', 'hok', 'jet', 'paet', 'gao']
const thaiNumeralsMap = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙']

function numberToThaiNumerals(n) {
  return String(n).split('').map(ch => thaiNumeralsMap[Number(ch)] || ch).join('')
}

function convertBelowMillion(n) {
  // n: 0..999999
  if (n === 0) return ''
  const places = [
    { div: 100000, label: 'แสน' },
    { div: 10000, label: 'หมื่น' },
    { div: 1000, label: 'พัน' },
    { div: 100, label: 'ร้อย' },
    { div: 10, label: 'สิบ' },
    { div: 1, label: '' }
  ]

  let resultParts = []
  let remaining = n

  for (let i = 0; i < places.length; i++) {
    const { div, label } = places[i]
    const digit = Math.floor(remaining / div) % 10

    if (div === 10) {
      // tens place special
      if (digit === 0) {
        // nothing
      } else if (digit === 1) {
        resultParts.push('สิบ')
      } else if (digit === 2) {
        resultParts.push('ยี่สิบ')
      } else {
        resultParts.push(digitsThai[digit] + 'สิบ')
      }
    } else if (div === 1) {
      // units place special handling: if unit==1 and tens>0 => เอ็ด
      const tensDigit = Math.floor((remaining % 100) / 10)
      if (digit === 0) {
        // nothing
      } else if (digit === 1 && tensDigit > 0) {
        resultParts.push('เอ็ด')
      } else {
        resultParts.push(digitsThai[digit])
      }
    } else {
      if (digit === 0) {
        // nothing
      } else {
        resultParts.push(digitsThai[digit] + label)
      }
    }
  }

  return resultParts.join('')
}

function convertBelowMillionRoman(n) {
  if (n === 0) return ''
  const places = [
    { div: 100000, label: 'saen' },
    { div: 10000, label: 'muen' },
    { div: 1000, label: 'phan' },
    { div: 100, label: 'roi' },
    { div: 10, label: 'sip' },
    { div: 1, label: '' }
  ]

  let resultParts = []
  let remaining = n

  for (let i = 0; i < places.length; i++) {
    const { div, label } = places[i]
    const digit = Math.floor(remaining / div) % 10

    if (div === 10) {
      if (digit === 0) {
        // nothing
      } else if (digit === 1) {
        resultParts.push('sip')
      } else if (digit === 2) {
        resultParts.push('yi sip')
      } else {
        resultParts.push(digitsRoman[digit] + ' ' + label)
      }
    } else if (div === 1) {
      const tensDigit = Math.floor((remaining % 100) / 10)
      if (digit === 0) {
        // nothing
      } else if (digit === 1 && tensDigit > 0) {
        resultParts.push('et') // 'เอ็ด' ~ et (approx)
      } else {
        resultParts.push(digitsRoman[digit])
      }
    } else {
      if (digit === 0) {
        // nothing
      } else {
        resultParts.push(digitsRoman[digit] + (label ? ' ' + label : ''))
      }
    }
  }

  return resultParts.join(' ').replace(/\s+/g, ' ').trim()
}

export function numberToThaiWords(n) {
  n = Number(n)
  if (!Number.isFinite(n) || n === null || n === undefined) return ''
  if (n === 0) return digitsThai[0]
  if (n < 0) return 'ลบ ' + numberToThaiWords(-n)
  if (n > 10000000) return String(n) // out of scope

  // handle millions (ล้าน)
  const millions = Math.floor(n / 1000000)
  const remainder = n % 1000000
  let parts = []
  if (millions > 0) {
    // millions may itself require Thai grammar (e.g., 2 ล้าน = สองล้าน)
    parts.push(convertBelowMillion(millions) || digitsThai[millions] || '')
    parts.push('ล้าน')
  }
  if (remainder > 0) {
    parts.push(convertBelowMillion(remainder))
  }
  return parts.join('').trim()
}

export function numberToRomanization(n) {
  n = Number(n)
  if (!Number.isFinite(n) || n === null || n === undefined) return ''
  if (n === 0) return digitsRoman[0]
  if (n < 0) return 'lop ' + numberToRomanization(-n)
  if (n > 10000000) return String(n)

  const millions = Math.floor(n / 1000000)
  const remainder = n % 1000000
  let parts = []
  if (millions > 0) {
    parts.push(convertBelowMillionRoman(millions) || digitsRoman[millions])
    parts.push('lan') // ล้าน ~ lan
  }
  if (remainder > 0) {
    const remRoman = convertBelowMillionRoman(remainder)
    if (remRoman) parts.push(remRoman)
  }
  return parts.join(' ').trim()
}

export { numberToThaiNumerals }