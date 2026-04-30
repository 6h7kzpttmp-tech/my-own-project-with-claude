'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { CAR_TYPES, FUEL_TYPES, validate, type CarType, type FuelType, type ValidationErrors } from './lib/calculator'
import { CONSUMABLES, getStatus, getRemainingKm, formatRemaining } from './lib/consumables'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface FormValues {
  carType: CarType
  distance: string
  efficiency: string
  fuelType: FuelType
  insurance: string
}

type Errors = ValidationErrors

// ─── 유지비 계산 탭 ────────────────────────────────────────────────────────────

function MaintenanceCostForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [values, setValues] = useState<FormValues>({
    carType: (searchParams.get('carType') as CarType) || '중형',
    distance: searchParams.get('distance') || '',
    efficiency: searchParams.get('efficiency') || '',
    fuelType: (searchParams.get('fuelType') as FuelType) || '휘발유',
    insurance: searchParams.get('insurance') || '',
  })
  const [errors, setErrors] = useState<Errors>({})

  function runValidate(): boolean {
    const next = validate(values.distance, values.efficiency)
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!runValidate()) return
    const params = new URLSearchParams({
      carType: values.carType,
      distance: values.distance,
      efficiency: values.efficiency,
      fuelType: values.fuelType,
      insurance: values.insurance || '0',
    })
    router.push(`/result?${params.toString()}`)
  }

  const efficiencyUnit = values.fuelType === '전기' ? 'km/kWh' : 'km/L'

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label className="text-sm">차종</Label>
        <div className="grid grid-cols-5 gap-1.5">
          {CAR_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant={values.carType === type ? 'default' : 'outline'}
              className="h-9 text-sm"
              onClick={() => setValues((v) => ({ ...v, carType: type }))}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">유류 종류</Label>
        <div className="grid grid-cols-3 gap-2">
          {FUEL_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant={values.fuelType === type ? 'default' : 'outline'}
              className="h-10 text-sm"
              onClick={() => setValues((v) => ({ ...v, fuelType: type }))}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="distance" className="text-sm">월 평균 주행거리</Label>
        <div className="relative">
          <Input
            id="distance"
            type="number"
            value={values.distance}
            onChange={(e) => {
              setValues((v) => ({ ...v, distance: e.target.value }))
              if (errors.distance) setErrors((er) => ({ ...er, distance: undefined }))
            }}
            placeholder="예: 1500"
            min="0"
            step="100"
            aria-invalid={!!errors.distance || undefined}
            className="h-10 pr-12 text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">km</span>
        </div>
        {errors.distance && <p className="text-xs text-destructive">{errors.distance}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="efficiency" className="text-sm">연비</Label>
        <div className="relative">
          <Input
            id="efficiency"
            type="number"
            value={values.efficiency}
            onChange={(e) => {
              setValues((v) => ({ ...v, efficiency: e.target.value }))
              if (errors.efficiency) setErrors((er) => ({ ...er, efficiency: undefined }))
            }}
            placeholder="예: 12"
            min="0"
            step="0.1"
            aria-invalid={!!errors.efficiency || undefined}
            className="h-10 pr-20 text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{efficiencyUnit}</span>
        </div>
        {errors.efficiency && <p className="text-xs text-destructive">{errors.efficiency}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="insurance" className="text-sm">
          월 보험료 <span className="text-muted-foreground font-normal">(선택)</span>
        </Label>
        <div className="relative">
          <Input
            id="insurance"
            type="number"
            value={values.insurance}
            onChange={(e) => setValues((v) => ({ ...v, insurance: e.target.value }))}
            placeholder="예: 80000"
            min="0"
            step="1000"
            className="h-10 pr-8 text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">원</span>
        </div>
      </div>

      <Button type="submit" className="w-full h-11 text-sm font-semibold mt-2">
        계산하기
      </Button>
    </form>
  )
}

// ─── 소모품 교환시기 탭 ────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  ok:      { label: '양호',      className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  soon:    { label: '교환 임박', className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  overdue: { label: '교환 필요', className: 'bg-rose-500/15 text-rose-400 border border-rose-500/30' },
  unknown: { label: '입력 필요', className: 'bg-muted/50 text-muted-foreground border border-border' },
} as const

function ConsumablesForm() {
  const [currentKm, setCurrentKm] = useState('')
  const [lastKmMap, setLastKmMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(CONSUMABLES.map((c) => [c.id, '']))
  )

  const parsedCurrent = currentKm !== '' && !isNaN(Number(currentKm)) && Number(currentKm) >= 0
    ? Number(currentKm)
    : null

  function parsedLast(id: string): number | null {
    const val = lastKmMap[id]
    if (val === '' || isNaN(Number(val)) || Number(val) < 0) return null
    if (parsedCurrent !== null && Number(val) > parsedCurrent) return null
    return Number(val)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="currentKm" className="text-sm font-medium">현재 주행거리 (총 누적)</Label>
        <div className="relative">
          <Input
            id="currentKm"
            type="number"
            value={currentKm}
            onChange={(e) => setCurrentKm(e.target.value)}
            placeholder="예: 45000"
            min="0"
            step="1000"
            className="h-10 pr-12 text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">km</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">※ 교환 기준은 일반적인 권장값이며 차종·주행 환경에 따라 다를 수 있습니다.</p>

      <div className="space-y-3">
        {CONSUMABLES.map((c) => {
          const last = parsedLast(c.id)
          const status = getStatus(parsedCurrent, last, c.interval)
          const cfg = STATUS_CONFIG[status]
          const remaining = parsedCurrent !== null && last !== null
            ? getRemainingKm(parsedCurrent, last, c.interval)
            : null

          return (
            <div key={c.id} className="rounded-xl border border-border bg-card/60 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <span>{c.icon}</span>
                  {c.name}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                  {cfg.label}
                  {remaining !== null && ` · ${formatRemaining(remaining)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    id={`last-${c.id}`}
                    type="number"
                    value={lastKmMap[c.id]}
                    onChange={(e) => setLastKmMap((m) => ({ ...m, [c.id]: e.target.value }))}
                    placeholder="마지막 교환 거리"
                    min="0"
                    step="1000"
                    className="h-9 pr-12 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">km</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{c.note}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 메인 페이지 ───────────────────────────────────────────────────────────────

function AppTabs() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl ring-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="text-5xl mb-2">🚗</div>
          <CardTitle className="text-2xl font-bold">내 차 관리 계산기</CardTitle>
          <CardDescription className="text-sm">유지비 계산과 소모품 교환시기를 확인하세요</CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <Tabs defaultValue="cost">
            <TabsList className="w-full mb-5">
              <TabsTrigger value="cost" className="flex-1 text-sm">💰 유지비 계산</TabsTrigger>
              <TabsTrigger value="consumables" className="flex-1 text-sm">🔩 소모품 교환시기</TabsTrigger>
            </TabsList>

            <TabsContent value="cost" keepMounted className="data-[hidden]:hidden mt-0">
              <MaintenanceCostForm />
            </TabsContent>

            <TabsContent value="consumables" keepMounted className="data-[hidden]:hidden mt-0">
              <ConsumablesForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense>
      <AppTabs />
    </Suspense>
  )
}
