# Lumen

Expo 앱과 Next.js 웹이 같은 UI·데이터 레이어를 공유하는 Nx 모노레포입니다.

## 구조

- `apps/app` — Expo Router (모바일)
- `apps/web` — Next.js pages + `@expo/next-adapter` (Vercel)
- `libs/ui` — NativeWind 5 + 공통 컴포넌트 (`src/lib`에 테마·토큰)
- `libs/i18n` — ko / en / ja 카탈로그
- `libs/data` — ky + React Query + 인메모리 MSW + Supabase 클라이언트
- `libs/structure` — Zod 스키마 + OpenAPI JSON
- `supabase/` — SQL·RLS·Realtime publication·로컬 config

## 개발

```bash
pnpm install
cp .env.example .env
pnpm dev:web
pnpm dev:app
```

기본 데이터 소스는 인메모리 MSW(`DATA_SOURCE=mock`)입니다. 변경(프로필·메시지·친구·설정)은 다음 GET에 반영됩니다. Supabase URL·anon key와 `DATA_SOURCE=supabase`를 넣으면 실제 클라이언트로 전환됩니다.

## 테스트

```bash
pnpm test
pnpm test:integration
pnpm e2e:web          # Playwright
pnpm e2e:app          # Detox (로컬 iOS 시뮬레이터 필요)
```

## 빌드

```bash
pnpm build:web
```
