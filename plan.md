# 내 차 유지비 계산기 — Implementation Plan

## 기술 스택

| 항목 | 선택 | 비고 |
|------|------|------|
| Framework | Next.js 16 (App Router) | Turbopack 개발 서버 |
| Styling | Tailwind CSS v4 | |
| UI 컴포넌트 | shadcn/ui | preset: b5KJgTbo1 (base-mira, mist) |
| 상태 관리 | URL Query Parameters | 서버 컴포넌트 친화적, 새로고침 유지 |
| 패키지 매니저 | bun | npm 대비 빠른 설치 |
| 배포 | Vercel | |

---

## 아키텍처 결정

| 결정 | 이유 |
|------|------|
| 입력 페이지 → Client Component | `useState`, `useRouter`, `useSearchParams` 필요 |
| 결과 페이지 → Server Component | `searchParams` prop(async) 만으로 충분, JS 번들 최소화 |
| 상태를 URL로 관리 | 새로고침·공유 시 값 보존, 뒤로가기 자연스럽게 동작 |
| 계산 로직 순수 함수로 분리 | `app/lib/calculator.ts` — 테스트 용이, 양쪽 페이지 공유 |

---

## 파일 구조

```
app/
├── components/
│   └── RacingBackground.tsx   # 야간 레이싱 트랙 SVG 배경
├── lib/
│   └── calculator.ts          # 계산 로직 + 타입 + formatKRW
├── result/
│   └── page.tsx               # 결과 페이지 (Server Component)
├── globals.css                # Tailwind + shadcn 테마 변수
├── layout.tsx                 # 공통 레이아웃 + RacingBackground
└── page.tsx                   # 입력 페이지 (Client Component)
components/
└── ui/
    ├── button.tsx             # shadcn Button (base-ui 기반)
    ├── card.tsx               # shadcn Card
    ├── input.tsx              # shadcn Input
    └── label.tsx              # shadcn Label
lib/
└── utils.ts                   # cn() 유틸
```

---

## 작업 분해 (Task Breakdown)

### Phase 1 · 기반 설정

| # | 작업 | 완료 |
|---|------|------|
| 1 | `npx create-next-app` (TypeScript, Tailwind, App Router) | ✅ |
| 2 | shadcn/ui 초기화 (`bunx shadcn@latest init`) | ✅ |
| 3 | 프리셋 적용 (`-p b5KJgTbo1`) | ✅ |
| 4 | shadcn 컴포넌트 추가 (button, input, label, card) | ✅ |

### Phase 2 · 핵심 로직

| # | 작업 | 완료 |
|---|------|------|
| 5 | `calculator.ts` — 유가·점검비 상수 정의 | ✅ |
| 6 | `calculate()` — 월/연 유지비 계산 함수 | ✅ |
| 7 | `formatKRW()` — 한국식 금액 포매터 | ✅ |

### Phase 3 · UI 구현

| # | 작업 | 완료 |
|---|------|------|
| 8 | `RacingBackground.tsx` — 야간 레이싱 SVG 배경 | ✅ |
| 9 | `layout.tsx` — 공통 레이아웃, Space Grotesk 폰트 | ✅ |
| 10 | `page.tsx` — 입력 폼 (shadcn Button/Input/Label/Card) | ✅ |
| 11 | `result/page.tsx` — 결과 페이지 (shadcn Card) | ✅ |

### Phase 4 · 유효성 검사 및 마감

| # | 작업 | 완료 |
|---|------|------|
| 12 | S4: 필수 미입력 → `aria-invalid` + 오류 메시지 | ✅ |
| 13 | S5: 연비 0 이하 → 오류 메시지 | ✅ |
| 14 | S6: 다시 계산 → URL 파라미터로 이전 값 복원 | ✅ |
| 15 | step 속성 (주행거리=100, 보험=1000) | ✅ |
| 16 | 프로덕션 빌드 확인 (`bun run build`) | ✅ |

### Phase 5 · 배포 (예정)

| # | 작업 | 완료 |
|---|------|------|
| 17 | GitHub 저장소 연결 | ⬜ |
| 18 | Vercel 배포 | ⬜ |
| 19 | 도메인 설정 (선택) | ⬜ |

---

## 계산 검증표

| 시나리오 | 주유비 | 보험 | 점검 | 월 합계 | 연 합계 |
|----------|--------|------|------|---------|---------|
| S1 중형/휘발유 1500km/12kmL/8만 | 206,250 | 80,000 | 40,000 | **326,250** | 3,915,000 |
| S2 경차/전기 800km/6kWh/4만 | 6,667 | 40,000 | 20,000 | **66,667** | 800,004 |
| S3 중형/휘발유 1000km/11kmL/없음 | 150,000 | 0 | 40,000 | **190,000** | 2,280,000 |

---

## 미결 사항 (Next Feature Cycle 후보)

| 아이디어 | 설명 |
|----------|------|
| 유가 직접 입력 | 실시간 유가 반영 or 사용자 커스텀 |
| 차량별 저장 | 여러 차량 비교 기능 |
| 공유 기능 | 결과 URL 복사 / 카카오 공유 |
| 다크 모드 | shadcn `.dark` 클래스 토글 |
| PWA | 오프라인 지원 |
