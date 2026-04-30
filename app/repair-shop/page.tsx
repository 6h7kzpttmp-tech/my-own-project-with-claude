'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { type Lang } from '../lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ── 타입 ──────────────────────────────────────────────────────────────────────

interface Shop {
  id: number
  name: string
  lat: number
  lon: number
  address: string
  distance: number
}

// ── 유틸 ──────────────────────────────────────────────────────────────────────

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDist(m: number, lang: Lang): string {
  if (lang === 'en') {
    const mi = m / 1609.34
    return mi < 0.1 ? `${Math.round(m * 3.281)} ft` : `${mi.toFixed(1)} mi`
  }
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`
}

// ── Overpass 검색 ──────────────────────────────────────────────────────────────

async function fetchNearbyShops(lat: number, lon: number): Promise<Shop[]> {
  const query = `
[out:json][timeout:15];
(
  node["shop"="car_repair"](around:5000,${lat},${lon});
  node["amenity"="car_repair"](around:5000,${lat},${lon});
  node["craft"="car_repair"](around:5000,${lat},${lon});
);
out body;
`
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
    headers: { 'Content-Type': 'text/plain' },
  })
  if (!res.ok) throw new Error('Overpass API error')
  const data = await res.json()

  return (data.elements as any[])
    .map((el) => ({
      id: el.id,
      name:
        el.tags?.['name:ko'] ||
        el.tags?.name ||
        el.tags?.['name:en'] ||
        '',
      lat: el.lat,
      lon: el.lon,
      address: [
        el.tags?.['addr:street'],
        el.tags?.['addr:housenumber'],
        el.tags?.['addr:city'],
      ]
        .filter(Boolean)
        .join(' ') || el.tags?.['addr:full'] || '',
      distance: haversineM(lat, lon, el.lat, el.lon),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10)
}

// ── Nominatim 지오코딩 ─────────────────────────────────────────────────────────

async function geocode(address: string): Promise<{ lat: number; lon: number }> {
  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}` +
    `&format=json&limit=1`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'CarMaintenanceCalculator/1.0', 'Accept-Language': 'ko,en' },
  })
  const data = await res.json()
  if (!data.length) throw new Error('not found')
  return { lat: Number(data[0].lat), lon: Number(data[0].lon) }
}

// ── UI ────────────────────────────────────────────────────────────────────────

const UI = {
  ko: {
    title: '정비소 검색',
    subtitle: '가까운 정비소를 찾아드립니다',
    addressLabel: '주소 입력',
    addressPlaceholder: '예: 서울시 강남구 역삼동',
    searchBtn: '검색',
    orText: '또는',
    geoBtn: '📍 현재 위치 사용',
    loading: '주변 정비소 검색 중...',
    results: (n: number) => `검색 결과 ${n}개`,
    noResults: '5km 이내 정비소를 찾을 수 없습니다.',
    newSearch: '다시 검색',
    openMap: '지도 보기',
    back: '← 결과로 돌아가기',
    errNotFound: '주소를 찾을 수 없습니다. 더 구체적으로 입력해 주세요.',
    errNetwork: '검색에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    errGeo: '위치 정보를 가져올 수 없습니다.',
    unnamed: '이름 없는 정비소',
  },
  en: {
    title: 'Find Auto Shop',
    subtitle: 'Locate nearby auto repair shops',
    addressLabel: 'Enter Address',
    addressPlaceholder: 'e.g. Gangnam, Seoul',
    searchBtn: 'Search',
    orText: 'or',
    geoBtn: '📍 Use Current Location',
    loading: 'Searching nearby shops...',
    results: (n: number) => `${n} shop${n !== 1 ? 's' : ''} found`,
    noResults: 'No shops found within 5 km.',
    newSearch: 'New Search',
    openMap: 'Open Map',
    back: '← Back to Results',
    errNotFound: 'Address not found. Please try a more specific address.',
    errNetwork: 'Search failed. Please try again.',
    errGeo: 'Could not get your location.',
    unnamed: 'Unnamed Shop',
  },
}

type Status = 'idle' | 'loading' | 'done' | 'error'

function RepairShopSearch() {
  const searchParams = useSearchParams()
  const lang: Lang = (searchParams.get('lang') as Lang) || 'ko'
  const u = UI[lang]

  const [address, setAddress] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [shops, setShops] = useState<Shop[]>([])
  const [errMsg, setErrMsg] = useState('')

  async function runSearch(lat: number, lon: number) {
    setStatus('loading')
    try {
      const results = await fetchNearbyShops(lat, lon)
      setShops(results)
      setStatus('done')
    } catch {
      setErrMsg(u.errNetwork)
      setStatus('error')
    }
  }

  async function handleAddressSearch() {
    if (!address.trim()) return
    setStatus('loading')
    try {
      const { lat, lon } = await geocode(address.trim())
      await runSearch(lat, lon)
    } catch {
      setErrMsg(u.errNotFound)
      setStatus('error')
    }
  }

  function handleGeo() {
    if (!navigator.geolocation) {
      setErrMsg(u.errGeo)
      setStatus('error')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => runSearch(pos.coords.latitude, pos.coords.longitude),
      () => { setErrMsg(u.errGeo); setStatus('error') },
    )
  }

  function reset() {
    setStatus('idle')
    setShops([])
    setErrMsg('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl ring-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-2 relative">
          <Link
            href={`/?lang=${lang}`}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'absolute top-3 left-3 text-xs gap-1 h-7',
            )}
          >
            {u.back}
          </Link>
          <div className="text-center mt-6">
            <div className="text-4xl mb-1">🔍</div>
            <CardTitle className="text-xl font-bold">{u.title}</CardTitle>
            <CardDescription className="text-sm">{u.subtitle}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">

          {/* ── 검색 폼 ── */}
          {(status === 'idle' || status === 'error') && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm">{u.addressLabel}</Label>
                <div className="flex gap-2">
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={u.addressPlaceholder}
                    className="h-10 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                  />
                  <Button onClick={handleAddressSearch} className="h-10 shrink-0 px-4">
                    {u.searchBtn}
                  </Button>
                </div>
              </div>

              <div className="relative flex items-center gap-2">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground">{u.orText}</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <Button variant="outline" className="w-full h-10 text-sm" onClick={handleGeo}>
                {u.geoBtn}
              </Button>

              {status === 'error' && (
                <p className="text-xs text-destructive text-center">{errMsg}</p>
              )}
            </>
          )}

          {/* ── 로딩 ── */}
          {status === 'loading' && (
            <div className="py-14 text-center space-y-4">
              <div className="text-4xl animate-spin inline-block">⚙️</div>
              <p className="text-sm text-muted-foreground">{u.loading}</p>
            </div>
          )}

          {/* ── 결과 ── */}
          {status === 'done' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{u.results(shops.length)}</p>
                <Button variant="ghost" size="sm" onClick={reset} className="text-xs h-7">
                  {u.newSearch}
                </Button>
              </div>

              {shops.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-3xl mb-3">🔧</div>
                  <p className="text-sm text-muted-foreground">{u.noResults}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
                  {shops.map((shop, i) => (
                    <div
                      key={shop.id}
                      className="flex items-start gap-3 rounded-xl bg-muted p-3"
                    >
                      <span className="text-primary font-bold text-sm mt-0.5 w-5 shrink-0 text-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {shop.name || u.unnamed}
                        </p>
                        {shop.address && (
                          <p className="text-xs text-muted-foreground leading-tight">{shop.address}</p>
                        )}
                        <p className="text-xs font-semibold text-primary">
                          {formatDist(shop.distance, lang)}
                        </p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          buttonVariants({ variant: 'outline', size: 'sm' }),
                          'text-xs h-7 shrink-0',
                        )}
                      >
                        {u.openMap}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </CardContent>
      </Card>
    </div>
  )
}

export default function RepairShopPage() {
  return (
    <Suspense>
      <RepairShopSearch />
    </Suspense>
  )
}
