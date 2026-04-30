export type Lang = 'ko' | 'en'

// ── 단위 변환 상수 ──────────────────────────────────────────────────────────────
export const KM_PER_MILE  = 1.60934      // 1 mile = 1.60934 km
export const KML_PER_MPG  = 0.425144     // 1 mpg  = 0.425144 km/L
export const KRW_PER_USD  = 1350         // 1 USD  = 1,350 KRW (고정 환율)
export const L_PER_GALLON = 3.78541

// 유가를 달러/갤런(또는 달러/kWh)으로 변환
export const FUEL_PRICE_USD = {
  gasoline: `$${((1650 * L_PER_GALLON) / KRW_PER_USD).toFixed(2)}/gal`,  // $4.63/gal
  diesel:   `$${((1500 * L_PER_GALLON) / KRW_PER_USD).toFixed(2)}/gal`,  // $4.21/gal
  electric: `$${(50 / KRW_PER_USD).toFixed(3)}/kWh`,                      // $0.037/kWh
}

// ── EN 입력값(mile/mpg/$) → KO 내부 단위(km/km·L/₩) 변환 ─────────────────────
export function toKOUnits(
  distanceMi: number,
  efficiencyEn: number,
  fuelType: '휘발유' | '경유' | '전기',
  insuranceUSD: number,
): { distanceKm: number; efficiencyKmL: number; insuranceKRW: number } {
  return {
    distanceKm:    distanceMi * KM_PER_MILE,
    efficiencyKmL: fuelType === '전기'
      ? efficiencyEn * KM_PER_MILE    // mi/kWh → km/kWh
      : efficiencyEn * KML_PER_MPG,   // mpg    → km/L
    insuranceKRW: insuranceUSD * KRW_PER_USD,
  }
}

// ── 번역 사전 ───────────────────────────────────────────────────────────────────
const ko = {
  title: '내 차 관리 계산기',
  subtitle: '유지비 계산과 소모품 교환시기를 확인하세요',
  tabCost: '💰 유지비 계산',
  tabConsumables: '🔩 소모품 교환시기',
  carType: '차종',
  carTypeNames: { '경차': '경차', '소형': '소형', '중형': '중형', 'SUV': 'SUV', '대형': '대형' },
  fuelType: '유류 종류',
  fuelTypeNames: { '휘발유': '휘발유', '경유': '경유', '전기': '전기' },
  mileage: '월 평균 주행거리',
  distanceUnit: 'km',
  efficiencyUnit: (fuelType: string): string => fuelType === '전기' ? 'km/kWh' : 'km/L',
  distanceStep: '100',
  distancePlaceholder: '예: 1500',
  efficiencyStep: '0.1',
  efficiencyPlaceholder: '예: 12',
  insuranceStep: '1000',
  insurancePlaceholder: '예: 80000',
  insuranceCurrency: '원',
  efficiency: '연비',
  insurance: '월 보험료',
  optional: '선택',
  calculate: '계산하기',
  errRequired: '필수 입력값입니다',
  errMinOne: '1 이상의 값을 입력해주세요',
  currentKm: '현재 주행거리 (총 누적)',
  lastKm: '마지막 교환 거리',
  consumablesNote: '※ 교환 기준은 일반적인 권장값이며 차종·주행 환경에 따라 다를 수 있습니다.',
  statusOk: '양호',
  statusSoon: '교환 임박',
  statusOverdue: '교환 필요',
  statusUnknown: '입력 필요',
  resultTitle: '유지비 계산 결과',
  monthlyTotal: '월간 유지비 합계',
  annualPrefix: '연간',
  fuelCostLabel: '주유비',
  insuranceLabel: '보험료',
  maintenanceLabel: '정기점검비',
  insuranceDesc: '입력하신 월 보험료',
  maintenanceDescSuffix: '기준 추정값',
  annualLabel: '연간 유지비',
  months: '12개월',
  recalculate: '다시 계산하기',
  fuelPriceGasoline: '1,650원/L',
  fuelPriceDiesel: '1,500원/L',
  fuelPriceElectric: '50원/kWh',
}

const en: typeof ko = {
  title: 'My Car Manager',
  subtitle: 'Calculate costs & track maintenance intervals',
  tabCost: '💰 Cost Calculator',
  tabConsumables: '🔩 Maintenance',
  carType: 'Car Type',
  carTypeNames: { '경차': 'Mini', '소형': 'Small', '중형': 'Mid', 'SUV': 'SUV', '대형': 'Large' },
  fuelType: 'Fuel Type',
  fuelTypeNames: { '휘발유': 'Gasoline', '경유': 'Diesel', '전기': 'Electric' },
  mileage: 'Monthly Mileage',
  distanceUnit: 'mi',
  efficiencyUnit: (fuelType: string): string => fuelType === '전기' ? 'mi/kWh' : 'mpg',
  distanceStep: '10',
  distancePlaceholder: 'e.g. 900',
  efficiencyStep: '1',
  efficiencyPlaceholder: 'e.g. 25',
  insuranceStep: '10',
  insurancePlaceholder: 'e.g. 100',
  insuranceCurrency: '$',
  efficiency: 'Fuel Efficiency',
  insurance: 'Monthly Insurance',
  optional: 'Optional',
  calculate: 'Calculate',
  errRequired: 'This field is required',
  errMinOne: 'Must be 1 or greater',
  currentKm: 'Current Odometer (Total)',
  lastKm: 'Last service at',
  consumablesNote: '※ Based on general recommended intervals; may vary by vehicle and driving conditions.',
  statusOk: 'Good',
  statusSoon: 'Due Soon',
  statusOverdue: 'Overdue',
  statusUnknown: 'Enter data',
  resultTitle: 'Cost Summary',
  monthlyTotal: 'Monthly Total',
  annualPrefix: 'Annual',
  fuelCostLabel: 'Fuel Cost',
  insuranceLabel: 'Insurance',
  maintenanceLabel: 'Maintenance',
  insuranceDesc: 'Monthly insurance as entered',
  maintenanceDescSuffix: 'estimated for car type',
  annualLabel: 'Annual Cost',
  months: '12 months',
  recalculate: 'Recalculate',
  fuelPriceGasoline: FUEL_PRICE_USD.gasoline,
  fuelPriceDiesel: FUEL_PRICE_USD.diesel,
  fuelPriceElectric: FUEL_PRICE_USD.electric,
}

export const translations = { ko, en } as const

// ── 금액 포맷 ───────────────────────────────────────────────────────────────────
export function formatAmount(amountKRW: number, lang: Lang): string {
  if (lang === 'en') {
    const usd = amountKRW / KRW_PER_USD
    if (usd >= 1000) return `$${Math.round(usd).toLocaleString('en-US')}`
    if (usd >= 1)    return `$${usd.toFixed(2)}`
    return `$${usd.toFixed(3)}`
  }
  if (amountKRW >= 10000) {
    const man = Math.floor(amountKRW / 10000)
    const rest = amountKRW % 10000
    if (rest === 0) return `${man.toLocaleString('ko-KR')}만원`
    return `${man.toLocaleString('ko-KR')}만 ${rest.toLocaleString('ko-KR')}원`
  }
  return `${amountKRW.toLocaleString('ko-KR')}원`
}
