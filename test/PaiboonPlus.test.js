import { describe, it, expect } from 'vitest'
import { numberToRomanization } from '../src/utils/numberToThai'

const expectedPB = new Map([
    [0, 'sǔun'],
    [1, 'nʉ̀ng'], 
    [2, 'sǒɔng'],     // Thai: สอง. Vowel: [ɔɔ], Tone: Rising
    [3, 'sǎam'],
    [4, 'sìi'],
    [5, 'hâa'],
    [6, 'hòk'],
    [7, 'jèt'],
    [8, 'bpɛ̀ɛt'],     // Thai: แปด. Initial: [bp], Vowel: [ɛɛ] (long), Tone: Low
    [9, 'gâao'],
    [10, 'sìp'],
    [11, 'sìp èt'],
    [12, 'sìp sǒɔng'],
    [13, 'sìp sǎam'],
    [14, 'sìp sìi'],
    [15, 'sìp hâa'],
    [16, 'sìp hòk'],
    [17, 'sìp jèt'],
    [18, 'sìp bpɛ̀ɛt'],
    [19, 'sìp gâao'],
    [20, 'yîi sìp'],   // Thai: ยี่สิบ. Initial: [y], Vowel: [ii] (long), Tone: Falling
    [21, 'yîi sìp èt'],
    [22, 'yîi sìp sǒɔng'],
    [23, 'yîi sìp sǎam'],
    [24, 'yîi sìp sìi'],
    [25, 'yîi sìp hâa'],
    [26, 'yîi sìp hòk'],
    [27, 'yîi sìp jèt'],
    [28, 'yîi sìp bpɛ̀ɛt'],
    [29, 'yîi sìp gâao'],
    [100, 'nʉ̀ng rɔ́ɔi'],   // Thai: ร้อย. Vowel: [ɔɔi], Tone: High
    [1000, 'nʉ̀ng phan'],  // Thai: พัน. Initial: [p], Vowel: [a] (short)
    [10000, 'nʉ̀ng mʉ̀ʉn'], // Thai: หมื่น. Vowel: [ʉʉ] (long), Tone: Low
    [100000, 'nʉ̀ng sǎɛn'], // Thai: แสน. Vowel: [ɛɛ] (long), Tone: Rising
    [1000000, 'nʉ̀ng láan'] // Thai: ล้าน. Vowel: [aa] (long), Tone: High
])

describe('numberToRomanization PB+ style', () => {
  it('matches expected PB+ forms for 0..29', () => {
    for (let i = 0; i <= 29; i++) {
      expect(numberToRomanization(i, 'PB+')).toBe(expectedPB.get(i))
    }
  })

  it('matches PB+ units', () => {
    const units = [100,1000,10000,100000,1000000]
    for (const u of units) {
      expect(numberToRomanization(u, 'PB+')).toBe(expectedPB.get(u))
    }
  })

    it('defaults to PB+ style when no style argument provided', () => {
    for (let i = 0; i <= 29; i++) {
      expect(numberToRomanization(i)).toBe(expectedPB.get(i))
    }
    const units = [100, 1000, 10000, 100000, 1000000]
    for (const u of units) {
      expect(numberToRomanization(u)).toBe(expectedPB.get(u))
    }
  })
})
