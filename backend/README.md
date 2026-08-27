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
- `notifications` — likes, comments and follows create notifications transactionally with the event that caused them
- `reports` — any authenticated user can report a post, comment, or user
- `admin` — role-gated (`RolesGuard` + `@Roles('ADMIN')`): review/resolve reports, ban/unban users, delete any post or comment
- `chat` — issues Stream Chat (getstream.io) tokens; clients connect and create 1:1 channels directly against Stream once they have one. Set `STREAM_API_KEY`/`STREAM_API_SECRET` (free tier) or the endpoint returns a clean 503

Set `ADMIN_EMAIL` before running `npm run db:seed` to promote that user to `ADMIN`.
