import { describe, it, expect } from 'vitest'
import { numberToRomanization } from '../src/utils/numberToThai'

const expectedPB = new Map([
    [0, 'sǔun'],
    [1, 'nʉ̀ng'], // Original: nèung (RTGS-like) -> Paiboon+: nʉ̀ng
    [2, 'sǒong'],
    [3, 'sǎam'],
    [4, 'sìi'],
    [5, 'hâa'],
    [6, 'hòk'],
    [7, 'jèt'],
    [8, 'pàet'], // Original: pàaet (RTGS-like) -> Paiboon+: pàet
    [9, 'gâao'],
    [10, 'sìp'],
    [11, 'sìp èt'],
    [12, 'sìp sǒong'],
    [13, 'sìp sǎam'],
    [14, 'sìp sìi'],
    [15, 'sìp hâa'],
    [16, 'sìp hòk'],
    [17, 'sìp jèt'],
    [18, 'sìp pàet'], // Original: sìp pàaet (RTGS-like) -> Paiboon+: sìp pàet
    [19, 'sìp gâao'],
    [20, 'yîi sìp'],
    [21, 'yîi sìp èt'],
    [22, 'yîi sìp sǒong'],
    [23, 'yîi sìp sǎam'],
    [24, 'yîi sìp sìi'],
    [25, 'yîi sìp hâa'],
    [26, 'yîi sìp hòk'],
    [27, 'yîi sìp jèt'],
    [28, 'yîi sìp pàet'], // Original: yîi sìp pàaet (RTGS-like) -> Paiboon+: yîi sìp pàet
    [29, 'yîi sìp gâao'],
    [100, 'nʉ̀ng róoi'], // Original: nèung róoi (RTGS-like) -> Paiboon+: nʉ̀ng róoi
    [1000, 'nʉ̀ng phan'], // Original: nèung phaan (RTGS-like) -> Paiboon+: nʉ̀ng phan
    [10000, 'nʉ̀ng mʉ̀n'], // Original: nèung mèuun (RTGS-like) -> Paiboon+: nʉ̀ng mʉ̀n
    [100000, 'nʉ̀ng sǎen'], // Original: nèung sǎaen (RTGS-like) -> Paiboon+: nʉ̀ng sǎen
    [1000000, 'nʉ̀ng láan'] // Original: nèung láan (RTGS-like) -> Paiboon+: nʉ̀ng láan
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
