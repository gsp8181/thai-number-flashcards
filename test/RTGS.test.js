import { describe, it, expect } from 'vitest'
import { numberToRomanization } from '../src/utils/numberToThai'

const manualRomanMap = new Map([
    [0, 'sun'], // sǔuun (Low tone + long vowel 'u') -> RTGS: sun
    [1, 'nueng'], // nèung/nʉ̀ng (Falling/Rising tone + long vowel 'ue') -> RTGS: nueng
    [2, 'song'], // sǒong (Rising tone + long vowel 'o') -> RTGS: song
    [3, 'sam'], // sǎam (Rising tone + long vowel 'a') -> RTGS: sam
    [4, 'si'], // sìi (Low tone + long vowel 'i') -> RTGS: si
    [5, 'ha'], // hâa (Falling tone + long vowel 'a') -> RTGS: ha
    [6, 'hok'], // hòk (Low tone + short vowel 'o') -> RTGS: hok
    [7, 'chet'], // jèt (Low tone + short vowel 'e') -> RTGS: chet
    [8, 'paet'], // pàet (Low tone + long vowel 'ae') -> RTGS: paet
    [9, 'kao'], // gâao (Falling tone + diphthong 'ao') -> RTGS: kao
    [10, 'sip'], // sìp (Low tone + short vowel 'i') -> RTGS: sip
    [11, 'sip et'], // sìp èt -> RTGS: sip et (Note: 'et' is standard for the digit 1 in 11, 21, etc.)
    [12, 'sip song'], // sìp sǒong -> RTGS: sip song
    [13, 'sip sam'], // sìp sǎam -> RTGS: sip sam
    [14, 'sip si'], // sìp sìi -> RTGS: sip si
    [15, 'sip ha'], // sìp hâa -> RTGS: sip ha
    [16, 'sip hok'], // sìp hòk -> RTGS: sip hok
    [17, 'sip chet'], // sìp jèt -> RTGS: sip chet
    [18, 'sip paet'], // sìp pàet -> RTGS: sip paet
    [19, 'sip kao'], // sìp gâao -> RTGS: sip kao
    [20, 'yi sip'], // yîi sìp -> RTGS: yi sip
    [21, 'yi sip et'], // yîi sìp èt -> RTGS: yi sip et
    [22, 'yi sip song'], // yîi sìp sǒong -> RTGS: yi sip song
    [23, 'yi sip sam'], // yîi sìp sǎam -> RTGS: yi sip sam
    [24, 'yi sip si'], // yîi sìp sìi -> RTGS: yi sip si
    [25, 'yi sip ha'], // yîi sìp hâa -> RTGS: yi sip ha
    [26, 'yi sip hok'], // yîi sìp hòk -> RTGS: yi sip hok
    [27, 'yi sip chet'], // yîi sìp jèt -> RTGS: yi sip chet
    [28, 'yi sip paet'], // yîi sìp pàet -> RTGS: yi sip paet
    [29, 'yi sip kao'], // yîi sìp gâao -> RTGS: yi sip kao
    [100, 'nueng roi'], // róoi (High tone) -> RTGS: roi (Note: RTGS often omits 'nueng' for 100, 1000, etc., but 'nueng roi' is also sometimes used in teaching.)
    [1000, 'nueng phan'], // phan (Mid tone) -> RTGS: phan
    [10000, 'nueng muen'], // mʉ̀n (Low tone) -> RTGS: muen
    [100000, 'nueng saen'], // sǎen (Rising tone) -> RTGS: saen
    [1000000, 'nueng lan'] // láan (High tone) -> RTGS: lan
])




describe('numberToRomanization: exact-string comparisons', () => {
  it('matches the table for 0..29', () => {
    for (let i = 0; i <= 29; i++) {
      const expected = manualRomanMap.get(i)
        expect(numberToRomanization(i, 'RTGS')).toBe(expected)
    }
  })

  it('matches units (hundred..million)', () => {
    const units = [100, 1000, 10000, 100000, 1000000]
    for (const u of units) {
      const expected = manualRomanMap.get(u)
        expect(numberToRomanization(u, 'RTGS')).toBe(expected)
    }
  })
})