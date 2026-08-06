import 'fastify';

// @nestjs/passport (via passport) attaches the authenticated principal to
// `request.user` regardless of HTTP adapter. Fastify's own types don't know
// about this, so we declare it once here instead of casting `as any` at
// every call site that reads `req.user`.
declare module 'fastify' {
  interface FastifyRequest {
    user?: unknown;
  }
}
