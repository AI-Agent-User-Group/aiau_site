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
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "frame-src https://luma.com https://docs.google.com",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self' https://docs.google.com",
  "object-src 'none'",
  "frame-ancestors 'self'",
].join('; ');

const STATIC_ASSET_EXTENSIONS = /\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|otf|eot)$/i;

const SLOW_CHANGING_PAGES = new Set([
  '/privacy-policy',
  '/code-of-conduct',
  '/anti-harassment-policy',
  '/guidelines',
  '/manners',
  '/404',
  '/404.html',
]);

function getCacheControl(pathname: string): string {
  if (pathname.startsWith('/_astro/')) {
    return 'public, max-age=31556952, immutable';
  }

  if (STATIC_ASSET_EXTENSIONS.test(pathname)) {
    return 'public, max-age=604800';
  }

  if (pathname === '/') {
    return 'public, s-maxage=60, max-age=0';
  }

  if (SLOW_CHANGING_PAGES.has(pathname)) {
    return 'public, s-maxage=3600, max-age=0, stale-while-revalidate=86400';
  }

  return 'public, s-maxage=60, max-age=0';
}

function getLinkPreloads(pathname: string): string[] {
  const links: string[] = [];

  if (pathname === '/') {
    links.push('</favicon.svg>; rel=preload; as=image; type=image/svg+xml');
    links.push('</manifest.webmanifest>; rel=preload; as=manifest');
  }

  return links;
}

function withOptimizedHeaders(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  const { pathname } = new URL(request.url);

  headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  headers.set('X-DNS-Prefetch-Control', 'on');
  headers.set('Vary', 'Accept-Encoding');

  if (request.headers.get('Accept')?.includes('text/html')) {
    headers.set('Accept-CH', 'DPR, Width, Viewport-Width');
  }

  const cacheControl = getCacheControl(pathname);
  headers.set('Cache-Control', cacheControl);

  const preloads = getLinkPreloads(pathname);
  for (const link of preloads) {
    headers.append('Link', link);
  }

  return new Response(response.body, { status: response.status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    return withOptimizedHeaders(request, response);
  },
};
