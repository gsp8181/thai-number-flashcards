import { describe, it, expect } from 'vitest'
import { numberToThaiWords } from '../src/utils/numberToThai'

const expected = new Map([
  [0, 'ศูนย์'],
  [1, 'หนึ่ง'],
  [2, 'สอง'],
  [3, 'สาม'],
  [4, 'สี่'],
  [5, 'ห้า'],
  [6, 'หก'],
  [7, 'เจ็ด'],
  [8, 'แปด'],
  [9, 'เก้า'],
  [10, 'สิบ'],
  [11, 'สิบเอ็ด'],
  [12, 'สิบสอง'],
  [13, 'สิบสาม'],
  [14, 'สิบสี่'],
  [15, 'สิบห้า'],
  [16, 'สิบหก'],
  [17, 'สิบเจ็ด'],
  [18, 'สิบแปด'],
  [19, 'สิบเก้า'],
  [20, 'ยี่สิบ'],
  [21, 'ยี่สิบเอ็ด'],
  [22, 'ยี่สิบสอง'],
  [23, 'ยี่สิบสาม'],
  [24, 'ยี่สิบสี่'],
  [25, 'ยี่สิบห้า'],
  [26, 'ยี่สิบหก'],
  [27, 'ยี่สิบเจ็ด'],
  [28, 'ยี่สิบแปด'],
  [29, 'ยี่สิบเก้า'],
  [100, 'หนึ่งร้อย'],
  [1000, 'หนึ่งพัน'],
  [10000, 'หนึ่งหมื่น'],
  [100000, 'หนึ่งแสน'],
  [1000000, 'หนึ่งล้าน']
])

describe('numberToThaiWords', () => {
  it('returns Thai words for 0..29', () => {
    for (let i = 0; i <= 29; i++) {
      expect(numberToThaiWords(i)).toBe(expected.get(i))
    }
  })

  it('returns Thai words for major units', () => {
    const units = [100, 1000, 10000, 100000, 1000000]
    for (const u of units) {
      expect(numberToThaiWords(u)).toBe(expected.get(u))
    }
  })
})
