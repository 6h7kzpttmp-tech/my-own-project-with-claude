'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { CAR_TYPES, FUEL_TYPES, validate, type CarType, type FuelType, type ValidationErrors } from './lib/calculator'
import { CONSUMABLES, getStatus, getRemainingKm, formatRemaining } from './lib/consumables'
import { translations, type Lang } from './lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

type Errors = ValidationErrors

// ─── 언어 스위치 ────────────────────────────────────────────────────────────────

function LangSwitch({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5 bg-muted/40">
      {(['ko', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-colors ${
            lang === l
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

// ─── 유지비 계산 탭 ────────────────────────────────────────────────────────────

function MaintenanceCostForm({ lang }: { lang: Lang }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = translations[lang]

  const [values, setValues] = useState<{
    carType: CarType; distance: string; efficiency: string; fuelType: FuelType; insurance: string
  }>({
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
      lang,
    })
    router.push(`/result?${params.toString()}`)
  }

  const efficiencyUnit = t.efficiencyUnit(values.fuelType)
  const errMsg = (key: Errors['distance']) =>
    key ? (key === 'required' ? t.errRequired : t.errMinOne) : undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label className="text-sm">{t.carType}</Label>
        <div className="grid grid-cols-5 gap-1.5">
          {CAR_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant={values.carType === type ? 'default' : 'outline'}
              className="h-9 text-xs"
              onClick={() => setValues((v) => ({ ...v, carType: type }))}
            >
              {t.carTypeNames[type]}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">{t.fuelType}</Label>
        <div className="grid grid-cols-3 gap-2">
          {FUEL_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant={values.fuelType === type ? 'default' : 'outline'}
              className="h-10 text-sm"
              onClick={() => setValues((v) => ({ ...v, fuelType: type }))}
            >
              {t.fuelTypeNames[type]}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="distance" className="text-sm">{t.mileage}</Label>
        <div className="relative">
          <Input
            id="distance"
            type="number"
            value={values.distance}
            onChange={(e) => {
              setValues((v) => ({ ...v, distance: e.target.value }))
              if (errors.distance) setErrors((er) => ({ ...er, distance: undefined }))
            }}
            placeholder={t.distancePlaceholder}
            min="0"
            step={t.distanceStep}
            aria-invalid={!!errors.distance || undefined}
            className="h-10 pr-12 text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{t.distanceUnit}</span>
        </div>
        {errors.distance && <p className="text-xs text-destructive">{errMsg(errors.distance)}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="efficiency" className="text-sm">{t.efficiency}</Label>
        <div className="relative">
          <Input
            id="efficiency"
            type="number"
            value={values.efficiency}
            onChange={(e) => {
              setValues((v) => ({ ...v, efficiency: e.target.value }))
              if (errors.efficiency) setErrors((er) => ({ ...er, efficiency: undefined }))
            }}
            placeholder={t.efficiencyPlaceholder}
            min="0"
            step={t.efficiencyStep}
            aria-invalid={!!errors.efficiency || undefined}
            className="h-10 pr-20 text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{efficiencyUnit}</span>
        </div>
        {errors.efficiency && <p className="text-xs text-destructive">{errMsg(errors.efficiency)}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="insurance" className="text-sm">
          {t.insurance} <span className="text-muted-foreground font-normal">({t.optional})</span>
        </Label>
        <div className="relative">
          <Input
            id="insurance"
            type="number"
            value={values.insurance}
            onChange={(e) => setValues((v) => ({ ...v, insurance: e.target.value }))}
            placeholder={t.insurancePlaceholder}
            min="0"
            step={t.insuranceStep}
            className="h-10 pr-8 text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{t.insuranceCurrency}</span>
        </div>
      </div>

      <Button type="submit" className="w-full h-11 text-sm font-semibold mt-2">
        {t.calculate}
      </Button>
    </form>
  )
}

// ─── 소모품 교환시기 탭 ────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  ok:      { className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  soon:    { className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  overdue: { className: 'bg-rose-500/15 text-rose-400 border border-rose-500/30' },
  unknown: { className: 'bg-muted/50 text-muted-foreground border border-border' },
} as const

function ConsumablesForm({ lang }: { lang: Lang }) {
  const t = translations[lang]
  const KM_PER_MILE = 1.60934
  const isEn = lang === 'en'

  const [currentVal, setCurrentVal] = useState('')
  const [lastValMap, setLastValMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(CONSUMABLES.map((c) => [c.id, '']))
  )

  // 입력값(km 또는 mi)을 내부 km으로 변환
  const toKm = (val: string) => {
    const n = Number(val)
    if (val === '' || isNaN(n) || n < 0) return null
    return isEn ? n * KM_PER_MILE : n
  }

  const parsedCurrentKm = toKm(currentVal)

  function parsedLastKm(id: string): number | null {
    const km = toKm(lastValMap[id])
    if (km === null) return null
    if (parsedCurrentKm !== null && km > parsedCurrentKm) return null
    return km
  }

  const statusLabels = {
    ok: t.statusOk, soon: t.statusSoon, overdue: t.statusOverdue, unknown: t.statusUnknown,
  }

  const distUnit = isEn ? 'mi' : 'km'
  const distStep = isEn ? '100' : '1000'
  const currentPlaceholder = isEn ? 'e.g. 28,000' : '예: 45000'
  const lastPlaceholder = isEn ? t.lastKm + ' (mi)' : t.lastKm

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="currentKm" className="text-sm font-medium">{t.currentKm}</Label>
        <div className="relative">
          <Input
            id="currentKm"
            type="number"
            value={currentVal}
            onChange={(e) => setCurrentVal(e.target.value)}
            placeholder={currentPlaceholder}
            min="0"
            step={distStep}
            className="h-10 pr-12 text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{distUnit}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{t.consumablesNote}</p>

      <div className="space-y-3">
        {CONSUMABLES.map((c) => {
          const lastKm = parsedLastKm(c.id)
          const status = getStatus(parsedCurrentKm, lastKm, c.interval)
          const cfg = STATUS_CONFIG[status]
          const remainingKm = parsedCurrentKm !== null && lastKm !== null
            ? getRemainingKm(parsedCurrentKm, lastKm, c.interval)
            : null

          return (
            <div key={c.id} className="rounded-xl border border-border bg-card/60 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <span>{c.icon}</span>
                  {isEn ? c.nameEn : c.name}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                  {statusLabels[status]}
                  {remainingKm !== null && ` · ${formatRemaining(remainingKm, lang)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    id={`last-${c.id}`}
                    type="number"
                    value={lastValMap[c.id]}
                    onChange={(e) => setLastValMap((m) => ({ ...m, [c.id]: e.target.value }))}
                    placeholder={lastPlaceholder}
                    min="0"
                    step={distStep}
                    className="h-9 pr-12 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{distUnit}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {isEn ? c.noteEn : c.note}
                </span>
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [lang, setLang] = useState<Lang>((searchParams.get('lang') as Lang) || 'ko')
  const t = translations[lang]

  function switchLang(newLang: Lang) {
    setLang(newLang)
    const p = new URLSearchParams(searchParams.toString())
    p.set('lang', newLang)
    router.replace(`/?${p.toString()}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl ring-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2 relative">
          <div className="absolute top-4 right-4">
            <LangSwitch lang={lang} onChange={switchLang} />
          </div>
          <div className="text-5xl mb-2">🚗</div>
          <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
          <CardDescription className="text-sm">{t.subtitle}</CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <Tabs defaultValue="cost">
            <TabsList className="w-full mb-5">
              <TabsTrigger value="cost" className="flex-1 text-sm">{t.tabCost}</TabsTrigger>
              <TabsTrigger value="consumables" className="flex-1 text-sm">{t.tabConsumables}</TabsTrigger>
            </TabsList>

            <TabsContent value="cost" keepMounted className="data-[hidden]:hidden mt-0">
              <MaintenanceCostForm lang={lang} />
            </TabsContent>

            <TabsContent value="consumables" keepMounted className="data-[hidden]:hidden mt-0">
              <ConsumablesForm lang={lang} />
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
