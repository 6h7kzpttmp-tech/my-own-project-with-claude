export interface Consumable {
  id: string
  name: string
  nameEn: string
  interval: number // km
  icon: string
  note: string
}

export const CONSUMABLES: Consumable[] = [
  { id: 'engine_oil',   name: '엔진오일',      nameEn: 'Engine Oil',     interval: 10000, icon: '🔧', note: '일반적 기준 10,000km' },
  { id: 'mission_oil',  name: '미션오일',      nameEn: 'Transmission Oil',interval: 50000, icon: '⚙️', note: '일반적 기준 50,000km' },
  { id: 'brake_fluid',  name: '브레이크 오일', nameEn: 'Brake Fluid',    interval: 40000, icon: '🛑', note: '일반적 기준 40,000km' },
  { id: 'coolant',      name: '냉각수',        nameEn: 'Coolant',        interval: 40000, icon: '💧', note: '일반적 기준 40,000km' },
  { id: 'air_filter',   name: '에어 필터',     nameEn: 'Air Filter',     interval: 20000, icon: '💨', note: '일반적 기준 20,000km' },
  { id: 'spark_plug',   name: '점화 플러그',   nameEn: 'Spark Plug',     interval: 30000, icon: '⚡', note: '일반적 기준 30,000km' },
  { id: 'brake_pad',    name: '브레이크 패드', nameEn: 'Brake Pad',      interval: 40000, icon: '🔴', note: '일반적 기준 40,000km' },
]

export type ConsumableStatus = 'ok' | 'soon' | 'overdue' | 'unknown'

export function getStatus(
  currentKm: number | null,
  lastKm: number | null,
  interval: number,
): ConsumableStatus {
  if (currentKm === null || lastKm === null) return 'unknown'
  if (lastKm > currentKm) return 'unknown'
  const remaining = lastKm + interval - currentKm
  if (remaining <= 0) return 'overdue'
  if (remaining <= interval * 0.1) return 'soon'
  return 'ok'
}

export function getRemainingKm(
  currentKm: number,
  lastKm: number,
  interval: number,
): number {
  return lastKm + interval - currentKm
}

export function formatRemaining(remaining: number): string {
  const abs = Math.abs(remaining).toLocaleString('ko-KR')
  return remaining >= 0 ? `${abs}km 남음` : `${abs}km 초과`
}
