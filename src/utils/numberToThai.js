// Utilities to convert numbers to Thai words, RTGS-like romanization,
// and Thai numerals (๑, ๒, ...).
//
// Supports 1 .. 10,000,000 inclusive.

const digitsThai = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
// RTGS-style romanization: use precomposed strings matching expected table.
const digitsRTGS = [
    { r: 'sǔuun' }, // 0
    { r: 'nèung' }, // 1
    { r: 'sǒong' }, // 2
    { r: 'sǎam' },  // 3
    { r: 'sìi' },   // 4
    { r: 'hâa' },   // 5
    { r: 'hòk' },   // 6
    { r: 'jèt' },   // 7
    { r: 'pàaet' }, // 8
    { r: 'gâao' }   // 9
]
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

// --- Romanization helpers at module scope ---
// Removed dynamic tone/length helpers; use precomposed roman strings below.

function formatDigit(digit) {
    if (digit === null || digit === undefined) return ''
    const d = digitsRTGS[digit]
    if (!d) return ''
    return d.r
}

// Place token mapping used by romanization (precomposed strings)
const placeTokens = {
    saen: { r: 'sǎaen' },
    muen: { r: 'mèuun' },
    phan: { r: 'phaan' },
    roi:  { r: 'róoi' },
    sip:  { r: 'sìp' },
    laan: { r: 'láan' },
    yii:  { r: 'yîi' },
    et:   { r: 'èt' }
}

function formatLabel(lbl) {
    if (!lbl) return ''
    const tok = placeTokens[lbl]
    if (tok) return ' ' + tok.r
    return ' ' + lbl
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

function convertBelowMillionRoman(n) {
    if (n === 0) return ''
    // Add 'laan' to places for millions check in the main function (though not strictly needed here)
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

    // helpers moved to module scope (see below)

    // use module-scope placeTokens and formatLabel

    for (let i = 0; i < places.length; i++) {
        const { div, label } = places[i]
        const digit = Math.floor(remaining / div) % 10
        const isLastPlace = (i === places.length - 1);
        
        if (digit === 0) {
            continue
        }

        if (div === 10) {
            // TENS PLACE SPECIAL CASES: 10 (sìp), 20 (yîi sìp)
            const sipToken = placeTokens.sip.r
            if (digit === 1) {
                // 'sip' tens (10)
                resultParts.push(sipToken)
            } else if (digit === 2) {
                // 'yîi sìp' (20)
                const yiiToken = placeTokens.yii.r
                resultParts.push(`${yiiToken} ${sipToken}`)
            } else {
                // Standard (30, 40, etc.)
                resultParts.push(`${formatDigit(digit)} ${sipToken}`)
            }
        } else if (div === 1) {
            // UNITS PLACE SPECIAL CASE: 1 (nùeng) becomes èt (Low tone) when tens > 0
            const tensDigit = Math.floor((remaining % 100) / 10)
            const etToken = placeTokens.et.r
            
            if (digit === 1 && tensDigit > 0) {
                // 11, 21, 31, ... -> 'et'
                resultParts.push(etToken) 
            } else if (digit === 1 && tensDigit === 0 && remaining === 1) {
                // Number 1 on its own is 'nùeng'
                resultParts.push(formatDigit(digit))
            } else if (digit === 1 && tensDigit === 0 && !isLastPlace) {
                 // For units place when tens is zero, we use the standard digit
                 resultParts.push(formatDigit(digit))
            } else if (digit !== 1) {
                resultParts.push(formatDigit(digit))
            }
        } else {
            // HUNDREDS, THOUSANDS, etc.
            resultParts.push(formatDigit(digit) + (label ? formatLabel(label) : ''))
        }
    }

    return resultParts.join(' ').replace(/\s+/g, ' ').trim()
}

export function numberToThaiWords(n) {
    n = Number(n)
    if (!Number.isFinite(n) || n === null || n === undefined) return ''
    if (n === 0) return digitsThai[0] // 'ศูนย์'
    if (n < 0) return 'ลบ ' + numberToThaiWords(-n)
    if (n > 10000000) return String(n) // out of scope

    // handle millions (ล้าน)
    const millions = Math.floor(n / 1000000)
    const remainder = n % 1000000
    let parts = []
    
    if (millions > 0) {
        // 1,000,000 is always 'nùeng lâan' (หนึ่งล้าน)
        if (millions === 1) {
             // For 1,000,000, digitsThai[1] is 'หนึ่ง' (neung)
            parts.push(digitsThai[1]) 
        } else {
            // millions > 1: 'sǎawng lâan' (สองล้าน), 'sǎam lâan' (สามล้าน), etc.
            parts.push(convertBelowMillion(millions))
        }
        parts.push('ล้าน') // 'ล้าน'
    }
    
    if (remainder > 0) {
        parts.push(convertBelowMillion(remainder))
    }
    return parts.join('').trim()
}

export function numberToRomanization(n) {
    n = Number(n)
    if (!Number.isFinite(n) || n === null || n === undefined) return ''
    if (n === 0) return formatDigit(0) // Using formatDigit(0) for 'sǔun'
    if (n < 0) return 'lòp ' + numberToRomanization(-n) // 'ลบ' is 'lòp' (Low tone, short)
    if (n > 10000000) return String(n)

    const millions = Math.floor(n / 1000000)
    const remainder = n % 1000000
    let parts = []
    
    const laanToken = placeTokens.laan.r

    if (millions > 0) {
        if (millions === 1) {
            // 1,000,000 is 'nùeng lâan'
            parts.push(formatDigit(1))
        } else {
            // millions > 1
            parts.push(convertBelowMillionRoman(millions))
        }
        parts.push(laanToken) // 'lâan'
    }
    
    if (remainder > 0) {
        const remRoman = convertBelowMillionRoman(remainder)
        if (remRoman) parts.push(remRoman)
    }
    return parts.join(' ').trim()
}

export { numberToThaiNumerals }