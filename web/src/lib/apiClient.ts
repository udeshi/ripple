import { createRippleClient } from "@ripple/api-client";
import { browserTokenStore } from "./tokenStore";

export const rippleClient = createRippleClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
  tokenStore: browserTokenStore,
});
