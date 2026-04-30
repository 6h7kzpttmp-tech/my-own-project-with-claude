import { describe, test, expect } from 'bun:test'
import { calculate, formatKRW, validate } from './calculator'

// ── calculate() ──────────────────────────────────────────────

describe('calculate()', () => {
  test('S1: 중형/휘발유 1500km 12kmL 보험8만 → 월 326,250원', () => {
    const r = calculate({ carType: '중형', distance: 1500, efficiency: 12, fuelType: '휘발유', insurance: 80000 })
    expect(r.fuelCost).toBe(206250)
    expect(r.insurance).toBe(80000)
    expect(r.maintenance).toBe(40000)
    expect(r.monthlyTotal).toBe(326250)
    expect(r.annualTotal).toBe(3915000)
  })

  test('S2: 경차/전기 800km 6kWh 보험4만 → 월 66,667원', () => {
    const r = calculate({ carType: '경차', distance: 800, efficiency: 6, fuelType: '전기', insurance: 40000 })
    expect(r.fuelCost).toBe(6667)
    expect(r.insurance).toBe(40000)
    expect(r.maintenance).toBe(20000)
    expect(r.monthlyTotal).toBe(66667)
    expect(r.annualTotal).toBe(800004)
  })

  test('S3: 보험 미입력 → 0원 처리', () => {
    const r = calculate({ carType: '중형', distance: 1000, efficiency: 11, fuelType: '휘발유', insurance: 0 })
    expect(r.insurance).toBe(0)
    expect(r.fuelCost).toBe(150000)
    expect(r.monthlyTotal).toBe(190000)
  })

  test('소형/경유 500km 15kmL → 주유비 50,000원', () => {
    const r = calculate({ carType: '소형', distance: 500, efficiency: 15, fuelType: '경유', insurance: 0 })
    expect(r.fuelCost).toBe(50000)
    expect(r.maintenance).toBe(30000)
  })

  test('SUV/휘발유 2000km 8kmL → 주유비 412,500원', () => {
    const r = calculate({ carType: 'SUV', distance: 2000, efficiency: 8, fuelType: '휘발유', insurance: 0 })
    expect(r.fuelCost).toBe(412500)
    expect(r.maintenance).toBe(50000)
  })

  test('대형 → 정기점검비 60,000원', () => {
    const r = calculate({ carType: '대형', distance: 1000, efficiency: 10, fuelType: '휘발유', insurance: 0 })
    expect(r.maintenance).toBe(60000)
  })

  test('annualTotal = monthlyTotal × 12', () => {
    const r = calculate({ carType: '중형', distance: 1500, efficiency: 12, fuelType: '휘발유', insurance: 80000 })
    expect(r.annualTotal).toBe(r.monthlyTotal * 12)
  })

  test('주유비는 Math.round 적용 (소수점 반올림)', () => {
    // 100 / 3 * 1650 = 55000 (정확히 나눠떨어지지 않음)
    const r = calculate({ carType: '경차', distance: 100, efficiency: 3, fuelType: '휘발유', insurance: 0 })
    expect(r.fuelCost).toBe(Math.round((100 / 3) * 1650))
  })
})

// ── formatKRW() ───────────────────────────────────────────────

describe('formatKRW()', () => {
  test('326,250 → "32만 6,250원"', () => {
    expect(formatKRW(326250)).toBe('32만 6,250원')
  })

  test('80,000 → "8만원"', () => {
    expect(formatKRW(80000)).toBe('8만원')
  })

  test('6,667 → "6,667원"', () => {
    expect(formatKRW(6667)).toBe('6,667원')
  })

  test('0 → "0원"', () => {
    expect(formatKRW(0)).toBe('0원')
  })

  test('9,999 → "9,999원"', () => {
    expect(formatKRW(9999)).toBe('9,999원')
  })

  test('10,000 → "1만원"', () => {
    expect(formatKRW(10000)).toBe('1만원')
  })

  test('3,915,000 → "391만 5,000원"', () => {
    expect(formatKRW(3915000)).toBe('391만 5,000원')
  })
})

// ── validate() ────────────────────────────────────────────────

describe('validate()', () => {
  test('S4a: 주행거리 빈값 → distance 오류', () => {
    const e = validate('', '12')
    expect(e.distance).toBe('required')
    expect(e.efficiency).toBeUndefined()
  })

  test('S4b: 연비 빈값 → efficiency 오류', () => {
    const e = validate('1500', '')
    expect(e.distance).toBeUndefined()
    expect(e.efficiency).toBe('required')
  })

  test('S4c: 둘 다 빈값 → 두 오류 모두', () => {
    const e = validate('', '')
    expect(e.distance).toBe('required')
    expect(e.efficiency).toBe('required')
  })

  test('S5: 연비 0 → "minOne"', () => {
    const e = validate('1500', '0')
    expect(e.efficiency).toBe('minOne')
  })

  test('연비 음수 → "minOne"', () => {
    const e = validate('1500', '-5')
    expect(e.efficiency).toBe('minOne')
  })

  test('정상 입력 → 오류 없음', () => {
    const e = validate('1500', '12')
    expect(Object.keys(e).length).toBe(0)
  })

  test('공백만 입력 → 필수 오류', () => {
    const e = validate('   ', '12')
    expect(e.distance).toBe('required')
  })
})
