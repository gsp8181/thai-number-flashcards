import { describe, it, expect } from 'vitest'
import { numberToThaiNumerals } from '../src/utils/numberToThai'

const expected = new Map([
  [0, '๐'],
  [1, '๑'],
  [2, '๒'],
  [3, '๓'],
  [4, '๔'],
  [5, '๕'],
  [6, '๖'],
  [7, '๗'],
  [8, '๘'],
  [9, '๙'],
  [10, '๑๐'],
  [11, '๑๑'],
  [12, '๑๒'],
  [13, '๑๓'],
  [14, '๑๔'],
  [15, '๑๕'],
  [16, '๑๖'],
  [17, '๑๗'],
  [18, '๑๘'],
  [19, '๑๙'],
  [20, '๒๐'],
  [21, '๒๑'],
  [22, '๒๒'],
  [23, '๒๓'],
  [24, '๒๔'],
  [25, '๒๕'],
  [26, '๒๖'],
  [27, '๒๗'],
  [28, '๒๘'],
  [29, '๒๙'],
  [100, '๑๐๐'],
  [1000, '๑,๐๐๐'],
  [10000, '๑๐,๐๐๐'],
  [100000, '๑๐๐,๐๐๐'],
  [1000000, '๑,๐๐๐,๐๐๐']
])

describe('numberToThaiNumerals', () => {
  it('formats 0..29 as Thai numerals', () => {
    for (let i = 0; i <= 29; i++) {
      expect(numberToThaiNumerals(i)).toBe(expected.get(i))
    }
  })

  it('formats large units with comma separation', () => {
    const units = [100, 1000, 10000, 100000, 1000000]
    for (const u of units) {
      expect(numberToThaiNumerals(u)).toBe(expected.get(u))
    }
  })
})
