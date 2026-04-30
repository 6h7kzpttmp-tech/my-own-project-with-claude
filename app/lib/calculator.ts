export type CarType = '경차' | '소형' | '중형' | 'SUV' | '대형'
export type FuelType = '휘발유' | '경유' | '전기'

const FUEL_PRICES: Record<FuelType, number> = {
  휘발유: 1650,
  경유: 1500,
  전기: 50,
}

const MAINTENANCE_COSTS: Record<CarType, number> = {
  경차: 20000,
  소형: 30000,
  중형: 40000,
  SUV: 50000,
  대형: 60000,
}

export interface CalcInput {
  carType: CarType
  distance: number
  efficiency: number
  fuelType: FuelType
  insurance: number
}

export interface CalcResult {
  fuelCost: number
  insurance: number
  maintenance: number
  monthlyTotal: number
  annualTotal: number
}

export function calculate(input: CalcInput): CalcResult {
  const fuelCost = Math.round((input.distance / input.efficiency) * FUEL_PRICES[input.fuelType])
  const maintenance = MAINTENANCE_COSTS[input.carType]
  const monthlyTotal = fuelCost + input.insurance + maintenance
  return {
    fuelCost,
    insurance: input.insurance,
    maintenance,
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
  }
}

export function formatKRW(amount: number): string {
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000)
    const rest = amount % 10000
    if (rest === 0) return `${man.toLocaleString('ko-KR')}만원`
    return `${man.toLocaleString('ko-KR')}만 ${rest.toLocaleString('ko-KR')}원`
  }
  return `${amount.toLocaleString('ko-KR')}원`
}

export const CAR_TYPES: CarType[] = ['경차', '소형', '중형', 'SUV', '대형']
export const FUEL_TYPES: FuelType[] = ['휘발유', '경유', '전기']

export type ValidationErrorKey = 'required' | 'minOne'

export interface ValidationErrors {
  distance?: ValidationErrorKey
  efficiency?: ValidationErrorKey
}

export function validate(distance: string, efficiency: string): ValidationErrors {
  const errors: ValidationErrors = {}
  if (!distance.trim()) errors.distance = 'required'
  if (!efficiency.trim()) errors.efficiency = 'required'
  else if (Number(efficiency) <= 0) errors.efficiency = 'minOne'
  return errors
}
