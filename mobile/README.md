# Ripple Mobile

Expo (React Native) client for Ripple, with OTA updates via EAS Update.

## Development

```bash
npm install   # from the repo root, so workspace packages link correctly
npx expo start
```

Set `EXPO_PUBLIC_API_URL` if the API isn't reachable at the Metro host's IP on port 3001 (the default used for local dev).

## Structure

File-based routing via `expo-router`:

- `app/(tabs)` — Feed, Search, New post, Profile
- `app/[username]` — public profile, followers, following
- `app/posts/[id]` — post detail and comments
- `app/login.tsx`, `app/register.tsx` — presented as modals over the tabs
- `src/api` — the platform-specific pieces `@ripple/api-client` needs: secure-store-backed token storage and a persisted device id
- `src/lib/auth-context.tsx` — session state, backed by `@tanstack/react-query`
- `src/screens/ProfileScreen.tsx` — shared between the "my profile" tab and the public `[username]` route

## Feature flags

`src/hooks/useFeatureFlags.ts` fetches `/flags` from the API on launch and exposes `isEnabled(key)`. Flags are seeded via `backend/prisma/seed.ts` and evaluated server-side with deterministic per-device rollout percentages — see `backend/src/flags`.

This is how a feature (e.g. chat) can ship inside a normal OTA update but stay dark until you flip it on, gradually, without an app store release.

## OTA updates (EAS Update)

This is the one part that needs your own Expo account — run these once per machine/project:

```bash
npm install -g eas-cli
eas login
eas init            # creates the EAS project, writes the real projectId into app.json
eas update:configure
```

After `eas init`, replace the two `REPLACE_WITH_EAS_PROJECT_ID` placeholders in `app.json` if it didn't update them automatically.

**Publishing an update** (JS/asset changes only — no new native modules/permissions):

```bash
eas update --branch production --message "fix: post caption truncation"
```

**Building an installable binary** (needed once, and again whenever native dependencies change):

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

Build profiles and their update channels are defined in `eas.json` (`development`, `preview`, `production`).
