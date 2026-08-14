# Ripple API

NestJS backend for Ripple, running on Fastify with PostgreSQL/Prisma.

## Setup

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
```

## Development

```bash
npm run start:dev
```

## Testing

```bash
npm run test
npm run test:e2e
```

## Modules

- `auth` — registration, login, JWT access/refresh token rotation
- `users` — profiles, avatar upload
- `posts` — post CRUD, image upload, feed
- `comments` — comments on posts
- `likes` — like/unlike toggling
- `follows` — follow/unfollow, follower and following lists
- `search` — user and post search
- `uploads` — storage abstraction (Cloudinary)
- `flags` — feature flags with deterministic per-user/device rollout percentages, used to gate OTA-delivered mobile features
