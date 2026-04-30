import Link from 'next/link'
import { calculate, formatKRW, type CarType, type FuelType } from '../lib/calculator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function ResultPage({ searchParams }: Props) {
  const params = await searchParams

  const carType = (params.carType as CarType) || '중형'
  const distance = Number(params.distance || '0')
  const efficiency = Number(params.efficiency || '1')
  const fuelType = (params.fuelType as FuelType) || '휘발유'
  const insurance = Number(params.insurance || '0')

  const result = calculate({ carType, distance, efficiency, fuelType, insurance })

  const backParams = new URLSearchParams({
    carType,
    distance: String(distance),
    efficiency: String(efficiency),
    fuelType,
    insurance: String(insurance),
  })

  const breakdownItems = [
    {
      label: '주유비',
      icon: '⛽',
      value: result.fuelCost,
      description: `${distance}km ÷ ${efficiency}${fuelType === '전기' ? 'km/kWh' : 'km/L'} × ${fuelType === '휘발유' ? '1,650원/L' : fuelType === '경유' ? '1,500원/L' : '50원/kWh'}`,
    },
    {
      label: '보험료',
      icon: '🛡️',
      value: result.insurance,
      description: '입력하신 월 보험료',
    },
    {
      label: '정기점검비',
      icon: '🔧',
      value: result.maintenance,
      description: `${carType} 기준 추정값`,
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl ring-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="text-4xl mb-1">📊</div>
          <CardTitle className="text-xl font-bold">유지비 계산 결과</CardTitle>
          <CardDescription>{carType} · {fuelType}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* 월간 합계 강조 */}
          <div className="bg-primary rounded-xl p-6 text-center">
            <p className="text-primary-foreground/70 text-sm mb-1">월간 유지비 합계</p>
            <p className="text-primary-foreground text-4xl font-bold">{formatKRW(result.monthlyTotal)}</p>
            <p className="text-primary-foreground/70 text-sm mt-2">연간 {formatKRW(result.annualTotal)}</p>
          </div>

          {/* 항목별 breakdown */}
          <div className="space-y-2">
            {breakdownItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">{formatKRW(item.value)}</p>
              </div>
            ))}
          </div>

          {/* 연간 환산 */}
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <span className="text-sm font-medium text-foreground">연간 유지비</span>
              </div>
              <span className="text-sm font-bold text-primary">{formatKRW(result.annualTotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-7">
              월 {formatKRW(result.monthlyTotal)} × 12개월
            </p>
          </div>

          {/* 다시 계산하기 */}
          <Link
            href={`/?${backParams.toString()}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full h-11 text-sm justify-center')}
          >
            다시 계산하기
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
