# ERP Qalam — Web Frontend

Next.js 14 (App Router) + React + Tailwind CSS + TypeScript + **next-intl**.

## Languages

| Code | Language | Status |
|------|----------|--------|
| `en` | English | Active |
| `ar` | Arabic (RTL) | Active |
| `ku` | Kurdish (RTL) | Active |
| `tr` | Turkish | Stub — enable in `i18n/routing.ts` when ready |

URLs are locale-prefixed: `/en/login`, `/ar/dashboard`, `/ku/register`

## Setup

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3001 (redirects to `/en`)

Ensure the API is running at http://localhost:3000 with CORS enabled.

## Structure

```
apps/web/
├── app/[locale]/        # Localized routes
├── messages/            # en.json, ar.json, ku.json, tr.json
├── i18n/                # routing, navigation, request config
├── middleware.ts        # Locale detection
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── layout/          # Sidebar, Header, LanguageSwitcher
│   └── ui/
└── lib/
    ├── api/
    └── auth/
```

## Adding translations

1. Add keys to `messages/en.json` (source of truth)
2. Mirror keys in `ar.json`, `ku.json`
3. Use `useTranslations('namespace')` in client components
4. Use `getTranslations('namespace')` in server components

## Enabling Turkish later

1. Translate `messages/tr.json`
2. Add `'tr'` to `locales` in `i18n/routing.ts`
3. Add `tr` to middleware matcher in `middleware.ts`
4. Remove `disabled` from Turkish option in `LanguageSwitcher`

## Demo credentials

| Email | Password |
|-------|----------|
| manager@qalam.dev | Manager123! |

School code for registration: `QALAM001`
