# Ripple

A full-stack social media application — posts, likes, comments, follows, profiles, and image uploads.

## Structure

```
ripple/
├── backend/   NestJS + Fastify API (PostgreSQL, Prisma, JWT auth)
└── web/       Next.js web client
```

## Stack

- **API**: NestJS on Fastify, PostgreSQL via Prisma, JWT access/refresh auth, Cloudinary for image storage
- **Web**: Next.js, TypeScript, Tailwind CSS

## Getting started

### API

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, JWT secrets, Cloudinary keys
npm install
npx prisma migrate dev
npm run start:dev
```

The API runs on `http://localhost:3001/api`.

### Web

```bash
cd web
npm install
npm run dev
```

The web app runs on `http://localhost:3000`.

## Features

- Email/password authentication with rotating refresh tokens
- User profiles with avatar upload
- Post creation with image upload, captions, and a paginated feed
- Likes and comments
- Follow / unfollow with follower and following lists
- User and post search
