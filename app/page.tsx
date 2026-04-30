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
          {/* Ferrari F1 Car Icon */}
          <div className="flex justify-center mb-3">
            <svg viewBox="0 0 240 82" width="150" height="51" aria-label="Ferrari F1 car" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ferrariRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF2400"/>
                  <stop offset="100%" stopColor="#C00000"/>
                </linearGradient>
                <linearGradient id="ferrariRedDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#CC1800"/>
                  <stop offset="100%" stopColor="#8B0000"/>
                </linearGradient>
                <radialGradient id="tireGrad" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#4a4a4a"/>
                  <stop offset="100%" stopColor="#0f0f0f"/>
                </radialGradient>
              </defs>

              {/* ── Rear Wing ── */}
              {/* End plates */}
              <rect x="6"  y="8" width="4" height="36" rx="1.5" fill="#111"/>
              <rect x="25" y="8" width="4" height="36" rx="1.5" fill="#111"/>
              {/* Main plane */}
              <rect x="5" y="8"  width="25" height="5.5" rx="2" fill="url(#ferrariRed)"/>
              {/* DRS flap */}
              <rect x="5" y="16" width="25" height="3.5" rx="1.5" fill="url(#ferrariRed)" opacity="0.85"/>
              {/* White SF stripe on wing */}
              <rect x="5" y="8" width="25" height="1.5" rx="1" fill="#fff" opacity="0.4"/>
              {/* Pillar */}
              <rect x="14" y="21" width="5" height="21" rx="1.5" fill="#1a1a1a"/>

              {/* ── Main Body ── */}
              <path d="
                M 32,65 L 32,40
                Q 37,24 58,19
                L 88,19 L 132,19
                Q 152,21 166,29
                Q 182,38 194,50
                Q 202,57 206,63
                L 206,65
                Q 188,68 165,67
                L 50,67
                Q 38,67 32,65 Z
              " fill="url(#ferrariRed)"/>

              {/* Sidepod undercut shadow */}
              <path d="M 62,67 L 62,58 Q 76,53 96,53 L 155,53 Q 168,54 176,59 L 176,67 Z"
                fill="url(#ferrariRedDark)" opacity="0.55"/>

              {/* ── Yellow SF Scuderia stripe ── */}
              <path d="M 35,46 L 88,46 L 88,50 L 35,50 Z" fill="#FFE600"/>
              <path d="M 133,46 L 164,49 L 164,53 L 133,50 Z" fill="#FFE600"/>

              {/* ── Air intake / engine cover inlet ── */}
              <path d="M 58,19 L 88,19 L 88,14 Q 73,11 58,14 Z" fill="#0a0a14"/>

              {/* ── Cockpit opening ── */}
              <path d="M 88,19 L 100,33 L 124,33 L 136,19 Z" fill="#080814"/>

              {/* ── Halo ── */}
              <path d="M 86,21 Q 112,4 138,21"
                stroke="#2a2a2a" strokeWidth="6" fill="none" strokeLinecap="round"/>
              <path d="M 86,21 Q 112,4 138,21"
                stroke="#707070" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              {/* Halo center pillar */}
              <rect x="109" y="4" width="5" height="17" rx="2" fill="#2a2a2a"/>
              <rect x="110" y="5" width="3" height="15" rx="1.5" fill="#606060"/>

              {/* ── Nose cone ── */}
              <path d="M 194,50 Q 205,57 208,63 L 208,67 L 194,67 Q 186,60 180,50 Z"
                fill="url(#ferrariRedDark)"/>

              {/* ── Front Wing — 3 elements ── */}
              {/* Upper cascade */}
              <path d="M 194,52 L 230,50 L 230,53 L 194,55 Z" fill="url(#ferrariRed)" opacity="0.7"/>
              {/* Mid element */}
              <path d="M 190,56 L 234,54 L 234,58 L 190,60 Z" fill="url(#ferrariRed)" opacity="0.85"/>
              {/* Main plane */}
              <path d="M 188,60 L 236,58 L 236,65 L 186,67 Z" fill="url(#ferrariRed)"/>
              {/* White stripe on main plane */}
              <path d="M 188,60 L 236,58 L 236,60 L 188,62 Z" fill="#fff" opacity="0.2"/>
              {/* Endplate */}
              <rect x="234" y="49" width="4.5" height="19" rx="1.5" fill="#111"/>
              {/* Nose-to-wing join */}
              <path d="M 207,62 L 235,59 L 235,66 L 207,67 Z" fill="url(#ferrariRedDark)"/>

              {/* ── Rear Tyre ── */}
              <circle cx="44"  cy="66" r="17" fill="url(#tireGrad)"/>
              <circle cx="44"  cy="66" r="9"  fill="#111"/>
              <circle cx="44"  cy="66" r="3.5" fill="#333"/>
              <circle cx="44"  cy="66" r="15" fill="none" stroke="#282828" strokeWidth="1"/>
              <path d="M 35,56 A 12,12 0 0 1 53,56" stroke="#555" strokeWidth="1.2" fill="none"/>

              {/* ── Front Tyre ── */}
              <circle cx="198" cy="66" r="14" fill="url(#tireGrad)"/>
              <circle cx="198" cy="66" r="7.5" fill="#111"/>
              <circle cx="198" cy="66" r="3"   fill="#333"/>
              <circle cx="198" cy="66" r="12" fill="none" stroke="#282828" strokeWidth="1"/>
              <path d="M 190,57 A 10,10 0 0 1 206,57" stroke="#555" strokeWidth="1.2" fill="none"/>

              {/* ── Wishbone suspension ── */}
              <line x1="44"  y1="52" x2="56"  y2="44" stroke="#3a3a3a" strokeWidth="1.5"/>
              <line x1="44"  y1="52" x2="36"  y2="44" stroke="#3a3a3a" strokeWidth="1.5"/>
              <line x1="198" y1="54" x2="186" y2="46" stroke="#3a3a3a" strokeWidth="1.5"/>
              <line x1="198" y1="54" x2="210" y2="49" stroke="#3a3a3a" strokeWidth="1.5"/>

              {/* ── Ground shadow ── */}
              <ellipse cx="119" cy="81" rx="94" ry="5" fill="#000" opacity="0.18"/>
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold tracking-wider" style={{ fontFamily: 'var(--font-racing)' }}>{t.title}</CardTitle>
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
