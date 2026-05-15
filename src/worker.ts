type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

type Env = {
  ASSETS: AssetsBinding;
};

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "img-src 'self' https://aiau.group data:",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
  "font-src 'self' https://cdnjs.cloudflare.com",
  "frame-src https://luma.com https://docs.google.com",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self' https://docs.google.com",
  "object-src 'none'",
  "frame-ancestors 'self'",
].join('; ');

function withSecurityHeaders(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  const { pathname } = new URL(request.url);

  headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  if (pathname.startsWith('/_astro/')) {
    headers.set('Cache-Control', 'public, max-age=31556952, immutable');
  }

  return new Response(response.body, { status: response.status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    return withSecurityHeaders(request, response);
  },
};


