# @ripple/api-client

Typed API client shared between `web` and `mobile`. Both apps get the same request/response types, the same refresh-token handling, and the same feature-flag lookup — only token storage differs per platform (`localStorage` on web, `expo-secure-store` on mobile), which is why `createRippleClient` takes a `TokenStore` rather than owning storage itself.

## Usage

```ts
import { createRippleClient } from "@ripple/api-client";

const client = createRippleClient({
  baseUrl: "http://localhost:3001/api",
  tokenStore, // platform-specific implementation
});

const feed = await client.posts.feed();
```
