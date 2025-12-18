// Utilities to convert numbers to Thai words, RTGS-like romanization,
// and Thai numerals (๑, ๒, ...).
//
// Supports 1 .. 10,000,000 inclusive.

const digitsThai = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
const thaiNumeralsMap = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙']

const placesThai = [
    { div: 100000, label: 'แสน' },
    { div: 10000, label: 'หมื่น' },
    { div: 1000, label: 'พัน' },
    { div: 100, label: 'ร้อย' },
    { div: 10, label: 'สิบ' },
    { div: 1, label: '' }
]

const placesRoman = [
    { div: 100000, label: 'saen' },
    { div: 10000, label: 'muen' },
    { div: 1000, label: 'phan' },
    { div: 100, label: 'roi' },
    { div: 10, label: 'sip' },
    { div: 1, label: '' }
]

function numberToThaiNumerals(n) {
    if (n === null || n === undefined || n === '') return ''
    const num = Number(n)
    if (!Number.isFinite(num)) {
        return String(n).split('').map(ch => thaiNumeralsMap[Number(ch)] || ch).join('')
    }
    const sign = num < 0 ? '-' : ''
    const abs = Math.trunc(Math.abs(num))
    const grouped = abs.toLocaleString('en-US') // add commas in thousands positions
    return sign + grouped.split('').map(ch => (ch >= '0' && ch <= '9') ? thaiNumeralsMap[Number(ch)] : ch).join('')
}

// Generic romanization converter will use per-style digits and placeTokens provided in STYLES.

function convertBelowMillion(n) {
    // n: 0..999999
    if (n === 0) return ''
    let resultParts = []
    let remaining = n

    for (let i = 0; i < placesThai.length; i++) {
        const { div, label } = placesThai[i]
        const digit = Math.floor(remaining / div) % 10
        const isLastPlace = (i === placesThai.length - 1);
        
        if (digit === 0) {
            continue
        }

        if (div === 10) {
            // TENS PLACE SPECIAL CASES: 10 (สิบ), 20 (ยี่สิบ)
            if (digit === 1) {
                resultParts.push('สิบ')
            } else if (digit === 2) {
                resultParts.push('ยี่สิบ') // Corrected: Just 'ยี่สิบ'
            } else {
                resultParts.push(digitsThai[digit] + 'สิบ')
            }
        } else if (div === 1) {
            // UNITS PLACE SPECIAL CASE: 1 (หนึ่ง) becomes เอ็ด (et) when tens > 0
            const tensDigit = Math.floor((remaining % 100) / 10)
            if (digit === 1 && tensDigit > 0) {
                resultParts.push('เอ็ด')
            } else if (digit === 1 && tensDigit === 0 && remaining === 1) {
                // Number 1 on its own is 'หนึ่ง' (neung)
                resultParts.push(digitsThai[digit]) 
            } else if (digit === 1 && tensDigit === 0 && !isLastPlace) {
                 // For units place when tens is zero, we use the standard digit
                 resultParts.push(digitsThai[digit])
            } else if (digit !== 1) {
                resultParts.push(digitsThai[digit])
            }
        } else {
            // HUNDREDS, THOUSANDS, etc.
            resultParts.push(digitsThai[digit] + label)
        }
    }

    return resultParts.join('').trim()
}

function convertBelowMillionGeneric(n, cfg) {
    if (n === 0) return ''
    const digits = cfg.digits || []
    const p = cfg.placeTokens || {}

    const getDigit = (d) => (digits[d] != null ? digits[d] : '')
    const labelToken = (lbl) => {
        const v = p[lbl]
        return v == null ? '' : (typeof v === 'object' ? (v.r || String(v)) : String(v))
    }

    const handleTensPlace = (digit, sipToken) => {
        if (digit === 1) return sipToken
        if (digit === 2) return `${labelToken('yii')} ${sipToken}`
        return `${getDigit(digit)} ${sipToken}`
    }

    const handleUnitsPlace = (digit, tensDigit, remaining, isLastPlace, etToken) => {
        if (digit === 1 && tensDigit > 0) return etToken
        if (digit === 1 && tensDigit === 0 && remaining === 1) return getDigit(digit)
        if (digit === 1 && tensDigit === 0 && !isLastPlace) return getDigit(digit)
        if (digit !== 1) return getDigit(digit)
        return ''
    }

    let resultParts = []
    let remaining = n

    for (let i = 0; i < placesRoman.length; i++) {
        const { div, label } = placesRoman[i]
        const digit = Math.floor(remaining / div) % 10
        const isLastPlace = (i === placesRoman.length - 1)
        if (digit === 0) continue

        if (div === 10) {
            resultParts.push(handleTensPlace(digit, labelToken('sip')))
        } else if (div === 1) {
            const tensDigit = Math.floor((remaining % 100) / 10)
            const part = handleUnitsPlace(digit, tensDigit, remaining, isLastPlace, labelToken('et'))
            if (part) resultParts.push(part)
        } else {
            resultParts.push(getDigit(digit) + (label ? ' ' + labelToken(label) : ''))
        }
    }

    return resultParts.join(' ').replace(/\s+/g, ' ').trim()
}

// Style configuration object grouping tokens for each romanization style.
// Each style embeds its `digits` and `placeTokens`; converters are generic.
const STYLES = {
    'PB+': {
        name: 'PB+',
        digits: ['sǔun','nʉ̀ng','sǒɔng','sǎam','sìi','hâa','hòk','jèt','bpɛ̀ɛt','gâao'],
        placeTokens: { saen: 'sǎɛn', muen: 'mʉ̀ʉn', phan: 'phan', roi: 'rɔ́ɔi', sip: 'sìp', laan: 'láan', yii: 'yîi', et: 'èt' },
        convertBelowMillion: (n) => convertBelowMillionGeneric(n, STYLES['PB+'])
    },
    'RTGS+': {
        name: 'RTGS+',
        digits: ['sǔuun','nèung','sǒong','sǎam','sìi','hâa','hòk','jèt','pàaet','gâao'],
        placeTokens: { saen: 'sǎaen', muen: 'mèuun', phan: 'phaan', roi: 'róoi', sip: 'sìp', laan: 'láan', yii: 'yîi', et: 'èt' },
        convertBelowMillion: (n) => convertBelowMillionGeneric(n, STYLES['RTGS+'])
    },
    'RTGS': {
        name: 'RTGS',
        digits: ['sun','nueng','song','sam','si','ha','hok','chet','paet','kao'],
        placeTokens: { saen: 'saen', muen: 'muen', phan: 'phan', roi: 'roi', sip: 'sip', laan: 'lan', yii: 'yi', et: 'et' },
        convertBelowMillion: (n) => convertBelowMillionGeneric(n, STYLES['RTGS'])
    }
}

function handleMillions(millions, convertFunc, getDigitFunc, laanToken) {
    let parts = []
    if (millions > 0) {
        if (millions === 1) {
            parts.push(getDigitFunc(1))
        } else {
            parts.push(convertFunc(millions))
        }
        parts.push(laanToken)
    }
    return parts
}

export function numberToThaiWords(n) {
    n = Number(n)
    if (!Number.isFinite(n) || n === null || n === undefined) return ''
    if (n === 0) return digitsThai[0]
    if (n < 0) return 'ลบ ' + numberToThaiWords(-n)
    if (n > 10000000) return String(n)

    const millions = Math.floor(n / 1000000)
    const remainder = n % 1000000
    let parts = []

    parts.push(...handleMillions(millions, convertBelowMillion, (d) => digitsThai[d], 'ล้าน'))

    if (remainder > 0) {
        parts.push(convertBelowMillion(remainder))
    }
    return parts.join('').trim()
}

function numberToRomanizationWithStyle(n, style = 'PB+') {
    n = Number(n)
    if (!Number.isFinite(n) || n === null || n === undefined) return ''
    const cfg = STYLES[style] || STYLES['RTGS+']
    const getDigitFromCfg = (d) => (cfg && Array.isArray(cfg.digits) ? cfg.digits[d] : '')
    const getLabelFromCfg = (lbl) => {
        const v = cfg && cfg.placeTokens && cfg.placeTokens[lbl]
        if (v == null) return ''
        return (typeof v === 'object') ? (v.r || String(v)) : String(v)
    }
    if (n === 0) return getDigitFromCfg(0)
    if (n < 0) return 'lòp ' + numberToRomanizationWithStyle(-n, style)
    if (n > 10000000) return String(n)

    const millions = Math.floor(n / 1000000)
    const remainder = n % 1000000
    let parts = []

    parts.push(...handleMillions(millions, cfg.convertBelowMillion, getDigitFromCfg, getLabelFromCfg('laan')))

    if (remainder > 0) {
        const remRoman = cfg.convertBelowMillion(remainder)
        if (remRoman) parts.push(remRoman)
    }
    return parts.join(' ').trim()
}

export function numberToRomanization(n, style = 'PB+') {
    return numberToRomanizationWithStyle(n, style)
}

export { numberToThaiNumerals }