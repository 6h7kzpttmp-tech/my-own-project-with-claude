export type Lang = 'ko' | 'en'

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
  fuelPriceGasoline: '₩1,650/L',
  fuelPriceDiesel: '₩1,500/L',
  fuelPriceElectric: '₩50/kWh',
}

export const translations = { ko, en } as const

export function formatAmount(amount: number, lang: Lang): string {
  if (lang === 'en') {
    return `₩${amount.toLocaleString('en-US')}`
  }
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000)
    const rest = amount % 10000
    if (rest === 0) return `${man.toLocaleString('ko-KR')}만원`
    return `${man.toLocaleString('ko-KR')}만 ${rest.toLocaleString('ko-KR')}원`
  }
  return `${amount.toLocaleString('ko-KR')}원`
}
