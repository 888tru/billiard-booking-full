# 🎱 Billiard Booking System

Система онлайн-бронирования бильярдных столов с админ-панелью.

## Запуск локально

```bash
npm install
npm run dev
```

Открой http://localhost:3000

## Страницы

| URL | Описание |
|---|---|
| `/` | Главная — клуб инфо |
| `/booking` | Бронирование стола |
| `/admin` | Админ-панель |
| `/admin/bookings` | Управление бронями |
| `/admin/tables` | Статус столов |

## Деплой на Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

Или через GitHub:
1. Push на GitHub
2. Зайди на https://vercel.com/new
3. Import repo → Deploy

## Технологии

- **Frontend:** Next.js 16, TypeScript, TailwindCSS 4, React Query
- **Backend:** Next.js API Routes (заменяется на Go)
- **БД:** PostgreSQL (схема в `src/db/schema.sql`)
- **Realtime:** Server-Sent Events (SSE)

## API

| Endpoint | Методы | Описание |
|---|---|---|
| `/api/tables` | GET | Все столы |
| `/api/slots` | GET | Слоты по столу и дате |
| `/api/bookings` | GET, POST, PATCH | Бронирования |
| `/api/sessions` | GET, POST, PATCH | Игровые сессии |
| `/api/dashboard` | GET | Статистика |
| `/api/events` | GET (SSE) | Realtime обновления |
| `/api/payments` | POST | Оплата |

