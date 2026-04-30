'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { CAR_TYPES, FUEL_TYPES, type CarType, type FuelType } from './lib/calculator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface FormValues {
  carType: CarType
  distance: string
  efficiency: string
  fuelType: FuelType
  insurance: string
}

interface Errors {
  distance?: string
  efficiency?: string
}

function InputForm() {
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

  function validate(): boolean {
    const next: Errors = {}
    if (!values.distance.trim()) next.distance = '필수 입력값입니다'
    if (!values.efficiency.trim()) {
      next.efficiency = '필수 입력값입니다'
    } else if (Number(values.efficiency) <= 0) {
      next.efficiency = '1 이상의 값을 입력해주세요'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl ring-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="text-5xl mb-2">🚗</div>
          <CardTitle className="text-2xl font-bold">내 차 유지비 계산기</CardTitle>
          <CardDescription className="text-sm">월간·연간 유지비를 쉽게 계산해보세요</CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
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
        </CardContent>
      </Card>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense>
      <InputForm />
    </Suspense>
  )
}
