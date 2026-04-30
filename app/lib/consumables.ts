export interface Consumable {
  id: string
  name: string
  nameEn: string
  interval: number // km
  icon: string
  note: string
  noteEn: string
}

// 1 km = 0.621371 mi → 반올림하여 noteEn 작성
export const CONSUMABLES: Consumable[] = [
  { id: 'engine_oil',  name: '엔진오일',      nameEn: 'Engine Oil',      interval: 10000, icon: '🔧', note: '일반적 기준 10,000km', noteEn: 'Recommended: 6,214 mi' },
  { id: 'mission_oil', name: '미션오일',      nameEn: 'Transmission Oil',interval: 50000, icon: '⚙️', note: '일반적 기준 50,000km', noteEn: 'Recommended: 31,069 mi' },
  { id: 'brake_fluid', name: '브레이크 오일', nameEn: 'Brake Fluid',     interval: 40000, icon: '🛑', note: '일반적 기준 40,000km', noteEn: 'Recommended: 24,855 mi' },
  { id: 'coolant',     name: '냉각수',        nameEn: 'Coolant',         interval: 40000, icon: '💧', note: '일반적 기준 40,000km', noteEn: 'Recommended: 24,855 mi' },
  { id: 'air_filter',  name: '에어 필터',     nameEn: 'Air Filter',      interval: 20000, icon: '💨', note: '일반적 기준 20,000km', noteEn: 'Recommended: 12,427 mi' },
  { id: 'spark_plug',  name: '점화 플러그',   nameEn: 'Spark Plug',      interval: 30000, icon: '⚡', note: '일반적 기준 30,000km', noteEn: 'Recommended: 18,641 mi' },
  { id: 'brake_pad',   name: '브레이크 패드', nameEn: 'Brake Pad',       interval: 40000, icon: '🔴', note: '일반적 기준 40,000km', noteEn: 'Recommended: 24,855 mi' },
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

export function formatRemaining(remaining: number, lang: 'ko' | 'en' = 'ko'): string {
  if (lang === 'en') {
    const mi = Math.round(Math.abs(remaining) / 1.60934)
    return remaining >= 0
      ? `${mi.toLocaleString('en-US')} mi left`
      : `${mi.toLocaleString('en-US')} mi over`
  }
  const abs = Math.abs(remaining).toLocaleString('ko-KR')
  return remaining >= 0 ? `${abs}km 남음` : `${abs}km 초과`
}
