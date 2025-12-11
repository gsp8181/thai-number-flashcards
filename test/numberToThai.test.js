import { describe, it, expect } from 'vitest'
import { numberToRomanization } from '../src/utils/numberToThai'

/*
Expected RTGS strings (long vowels doubled) for 0..29 and major units:

0: sǔuun
1: nʉ̀ng
2: sɔ̌ɔng
3: sǎam
4: sìi
5: hâa
6: hòk
7: jèt
8: pàaet
9: gâo
10: sìp
11: sìp èt
12: sìp sɔ̌ɔng
13: sìp sǎam
14: sìp sìi
15: sìp hâa
16: sìp hòk
17: sìp jèt
18: sìp pàaet
19: sìp gâo
20: yîi sìp
21: yîi sìp èt
22: yîi sìp sɔ̌ɔng
23: yîi sìp sǎam
24: yîi sìp sìi
25: yîi sìp hâa
26: yîi sìp hòk
27: yîi sìp jèt
28: yîi sìp pàaet
29: yîi sìp gâo

Units:
100: rɔ́ɔi
1000: phan
10000: mʉ̀ʉn
100000: sǎaen
1000000: láan
*/

const manualRomanMap = new Map([
    [0, 'sǔuun'],
    [1, 'nèung'],
    [2, 'sǒong'],
    [3, 'sǎam'],
    [4, 'sìi'],
    [5, 'hâa'],
    [6, 'hòk'],
    [7, 'jèt'],
    [8, 'pàaet'],
    [9, 'gâao'],
    [10, 'sìp'],
    [11, 'sìp èt'],
    [12, 'sìp sǒong'],
    [13, 'sìp sǎam'],
    [14, 'sìp sìi'],
    [15, 'sìp hâa'],
    [16, 'sìp hòk'],
    [17, 'sìp jèt'],
    [18, 'sìp pàaet'],
    [19, 'sìp gâao'],
    [20, 'yîi sìp'],
    [21, 'yîi sìp èt'],
    [22, 'yîi sìp sǒong'],
    [23, 'yîi sìp sǎam'],
    [24, 'yîi sìp sìi'],
    [25, 'yîi sìp hâa'],
    [26, 'yîi sìp hòk'],
    [27, 'yîi sìp jèt'],
    [28, 'yîi sìp pàaet'],
    [29, 'yîi sìp gâao'],
    [100, 'nèung róoi'],
    [1000, 'nèung phaan'],
    [10000, 'nèung mèuun'], 
    [100000, 'nèung sǎaen'],
    [1000000, 'nèung láan']
])



describe('numberToRomanization: exact-string comparisons', () => {
  it('matches the table for 0..29', () => {
    for (let i = 0; i <= 29; i++) {
      const expected = manualRomanMap.get(i)
      expect(numberToRomanization(i)).toBe(expected)
    }
  })

  it('matches units (hundred..million)', () => {
    const units = [100, 1000, 10000, 100000, 1000000]
    for (const u of units) {
      const expected = manualRomanMap.get(u)
      expect(numberToRomanization(u)).toBe(expected)
    }
  })
})