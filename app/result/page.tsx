import Link from 'next/link'
import { calculate, type CarType, type FuelType } from '../lib/calculator'
import { translations, formatAmount, toKOUnits, type Lang } from '../lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function ResultPage({ searchParams }: Props) {
  const params = await searchParams

  const carType   = (params.carType as CarType)   || '중형'
  const fuelType  = (params.fuelType as FuelType)  || '휘발유'
  const lang      = (params.lang as Lang)          || 'ko'
  const t         = translations[lang]

  // URL에 저장된 값 (KO: km/km·L/₩, EN: mi/mpg/$)
  const rawDistance   = Number(params.distance   || '0')
  const rawEfficiency = Number(params.efficiency || '1')
  const rawInsurance  = Number(params.insurance  || '0')

  // 내부 계산은 항상 km/L/₩ 기준
  const { distanceKm, efficiencyKmL, insuranceKRW } = lang === 'en'
    ? toKOUnits(rawDistance, rawEfficiency, fuelType, rawInsurance)
    : { distanceKm: rawDistance, efficiencyKmL: rawEfficiency, insuranceKRW: rawInsurance }

  const result = calculate({
    carType, distance: distanceKm, efficiency: efficiencyKmL,
    fuelType, insurance: insuranceKRW,
  })

  const fmt = (n: number) => formatAmount(n, lang)

  const backParams = new URLSearchParams({
    carType, distance: String(rawDistance), efficiency: String(rawEfficiency),
    fuelType, insurance: String(rawInsurance), lang,
  })

  const toggleLangParams = new URLSearchParams({
    ...Object.fromEntries(backParams),
    lang: lang === 'ko' ? 'en' : 'ko',
  })

  // 연료 설명 (EN: mi/mpg/$, KO: km/km·L/원)
  const effUnit      = t.efficiencyUnit(fuelType)
  const fuelPriceStr =
    fuelType === '휘발유' ? t.fuelPriceGasoline :
    fuelType === '경유'   ? t.fuelPriceDiesel   : t.fuelPriceElectric

  const carTypeName  = t.carTypeNames[carType]
  const fuelTypeName = t.fuelTypeNames[fuelType]

  const breakdownItems = [
    {
      label: t.fuelCostLabel,
      icon: '⛽',
      value: result.fuelCost,
      description: `${rawDistance}${t.distanceUnit} ÷ ${rawEfficiency}${effUnit} × ${fuelPriceStr}`,
    },
    {
      label: t.insuranceLabel,
      icon: '🛡️',
      value: result.insurance,
      description: t.insuranceDesc,
    },
    {
      label: t.maintenanceLabel,
      icon: '🔧',
      value: result.maintenance,
      description: `${carTypeName} ${t.maintenanceDescSuffix}`,
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl ring-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2 relative">
          <Link
            href={`/result?${toggleLangParams.toString()}`}
            className="absolute top-4 right-4 flex items-center gap-0.5 rounded-lg border border-border p-0.5 bg-muted/40"
          >
            {(['ko', 'en'] as Lang[]).map((l) => (
              <span
                key={l}
                className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-colors ${
                  lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {l.toUpperCase()}
              </span>
            ))}
          </Link>
          <div className="text-4xl mb-1">📊</div>
          <CardTitle className="text-xl font-bold">{t.resultTitle}</CardTitle>
          <CardDescription>{carTypeName} · {fuelTypeName}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <div className="bg-primary rounded-xl p-6 text-center">
            <p className="text-primary-foreground/70 text-sm mb-1">{t.monthlyTotal}</p>
            <p className="text-primary-foreground text-4xl font-bold">{fmt(result.monthlyTotal)}</p>
            <p className="text-primary-foreground/70 text-sm mt-2">
              {t.annualPrefix} {fmt(result.annualTotal)}
            </p>
          </div>

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
                <p className="text-sm font-semibold text-foreground">{fmt(item.value)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <span className="text-sm font-medium text-foreground">{t.annualLabel}</span>
              </div>
              <span className="text-sm font-bold text-primary">{fmt(result.annualTotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-7">
              {fmt(result.monthlyTotal)} × {t.months}
            </p>
          </div>

          <Link
            href={`/?${backParams.toString()}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full h-11 text-sm justify-center')}
          >
            {t.recalculate}
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
