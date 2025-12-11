// Utilities to convert numbers to Thai words, RTGS-like romanization,
// and Thai numerals (๑, ๒, ...).
//
// Supports 1 .. 10,000,000 inclusive.

const digitsThai = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
const thaiNumeralsMap = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙']

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
        const isLastPlace = (i === places.length - 1);
        
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
    const places = [
        { div: 100000, label: 'saen' },
        { div: 10000, label: 'muen' },
        { div: 1000, label: 'phan' },
        { div: 100, label: 'roi' },
        { div: 10, label: 'sip' },
        { div: 1, label: '' }
    ]

    const digits = cfg.digits || []
    const p = cfg.placeTokens || {}

    const getDigit = (d) => (digits[d] != null ? digits[d] : '')
    const labelToken = (lbl) => {
        const v = p[lbl]
        return v == null ? '' : (typeof v === 'object' ? (v.r || String(v)) : String(v))
    }

    let resultParts = []
    let remaining = n

    for (let i = 0; i < places.length; i++) {
        const { div, label } = places[i]
        const digit = Math.floor(remaining / div) % 10
        const isLastPlace = (i === places.length - 1)
        if (digit === 0) continue

        if (div === 10) {
            const sipToken = labelToken('sip')
            if (digit === 1) {
                resultParts.push(sipToken)
            } else if (digit === 2) {
                const yiiToken = labelToken('yii')
                resultParts.push(`${yiiToken} ${sipToken}`)
            } else {
                resultParts.push(`${getDigit(digit)} ${sipToken}`)
            }
        } else if (div === 1) {
            const tensDigit = Math.floor((remaining % 100) / 10)
            const etToken = labelToken('et')
            if (digit === 1 && tensDigit > 0) {
                resultParts.push(etToken)
            } else if (digit === 1 && tensDigit === 0 && remaining === 1) {
                resultParts.push(getDigit(digit))
            } else if (digit === 1 && tensDigit === 0 && !isLastPlace) {
                resultParts.push(getDigit(digit))
            } else if (digit !== 1) {
                resultParts.push(getDigit(digit))
            }
        } else {
            resultParts.push(getDigit(digit) + (label ? ' ' + labelToken(label) : ''))
        }
    }

    return resultParts.join(' ').replace(/\s+/g, ' ').trim()
}

function convertBelowMillionRomanPB(n) {
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
        const isLastPlace = (i === places.length - 1)
        if (digit === 0) continue

        if (div === 10) {
            const sipToken = placeTokensPB.sip
            if (digit === 1) {
                resultParts.push(sipToken)
            } else if (digit === 2) {
                const yiiToken = placeTokensPB.yii
                resultParts.push(`${yiiToken} ${sipToken}`)
            } else {
                resultParts.push(`${formatDigitPB(digit)} ${sipToken}`)
            }
        } else if (div === 1) {
            const tensDigit = Math.floor((remaining % 100) / 10)
            const etToken = placeTokensPB.et
            if (digit === 1 && tensDigit > 0) {
                resultParts.push(etToken)
            } else if (digit === 1 && tensDigit === 0 && remaining === 1) {
                resultParts.push(formatDigitPB(digit))
            } else if (digit === 1 && tensDigit === 0 && !isLastPlace) {
                resultParts.push(formatDigitPB(digit))
            } else if (digit !== 1) {
                resultParts.push(formatDigitPB(digit))
            }
        } else {
            resultParts.push(formatDigitPB(digit) + (label ? formatLabelPB(label) : ''))
        }
    }

    return resultParts.join(' ').replace(/\s+/g, ' ').trim()
}

function convertBelowMillionRomanRTGS(n) {
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
        const isLastPlace = (i === places.length - 1)
        if (digit === 0) continue

        if (div === 10) {
            const sipToken = placeTokensRTGSSimple.sip
            if (digit === 1) {
                resultParts.push(sipToken)
            } else if (digit === 2) {
                const yiiToken = placeTokensRTGSSimple.yii
                resultParts.push(`${yiiToken} ${sipToken}`)
            } else {
                resultParts.push(`${formatDigitRTGS(digit)} ${sipToken}`)
            }
        } else if (div === 1) {
            const tensDigit = Math.floor((remaining % 100) / 10)
            const etToken = placeTokensRTGSSimple.et
            if (digit === 1 && tensDigit > 0) {
                resultParts.push(etToken)
            } else if (digit === 1 && tensDigit === 0 && remaining === 1) {
                resultParts.push(formatDigitRTGS(digit))
            } else if (digit === 1 && tensDigit === 0 && !isLastPlace) {
                resultParts.push(formatDigitRTGS(digit))
            } else if (digit !== 1) {
                resultParts.push(formatDigitRTGS(digit))
            }
        } else {
            resultParts.push(formatDigitRTGS(digit) + (label ? formatLabelRTGS(label) : ''))
        }
    }

    return resultParts.join(' ').replace(/\s+/g, ' ').trim()
}

// Style configuration object grouping tokens for each romanization style.
// Each style embeds its `digits` and `placeTokens`; converters are generic.
const STYLES = {
    'PB+': {
        name: 'PB+',
        digits: ['sǔun','nʉ̀ng','sǒong','sǎam','sìi','hâa','hòk','jèt','pàet','gâao'],
        placeTokens: { saen: 'sǎen', muen: 'mʉ̀n', phan: 'phan', roi: 'róoi', sip: 'sìp', laan: 'láan', yii: 'yîi', et: 'èt' },
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

export function numberToThaiWords(n) {
    n = Number(n)
    if (!Number.isFinite(n) || n === null || n === undefined) return ''
    if (n === 0) return digitsThai[0]
    if (n < 0) return 'ลบ ' + numberToThaiWords(-n)
    if (n > 10000000) return String(n)

    const millions = Math.floor(n / 1000000)
    const remainder = n % 1000000
    let parts = []

    if (millions > 0) {
        if (millions === 1) {
            parts.push(digitsThai[1])
        } else {
            parts.push(convertBelowMillion(millions))
        }
        parts.push('ล้าน')
    }

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

    // millions
    if (millions > 0) {
        if (millions === 1) {
            parts.push(getDigitFromCfg(1))
        } else {
            parts.push(cfg.convertBelowMillion(millions))
        }
        const laanStr = getLabelFromCfg('laan')
        parts.push(laanStr)
    }

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