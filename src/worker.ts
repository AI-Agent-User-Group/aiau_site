export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const addSecurityHeaders = (r: Response) => {
      const csp = [
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

      const headers = new Headers(r.headers);
      headers.set('Content-Security-Policy', csp);
      headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      return new Response(r.body, { status: r.status, headers });
    };

    // Try static asset first
    const res = await env.ASSETS.fetch(request);
    if (res && res.status !== 404) return addSecurityHeaders(res);

    // Fallback rules:
    // 1) If path maps to a directory that has an index.html (prerendered), serve it
    // 2) Else serve root index.html (SPA fallback)
    const url = new URL(request.url);
    const path = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
    const dirIndex = new URL(`${path}index.html`, url);
    const tryDir = await env.ASSETS.fetch(new Request(dirIndex, request));
    if (tryDir && tryDir.status !== 404) return addSecurityHeaders(tryDir);
    // If direct file not found, serve 404.html when not root
    if (url.pathname !== '/' && !url.pathname.startsWith('/assets/')) {
      const nf = await env.ASSETS.fetch(new Request(new URL('/404.html', url), request));
      if (nf && nf.status !== 404) return addSecurityHeaders(new Response(nf.body, { status: 404, headers: nf.headers }));
    }
    const root = await env.ASSETS.fetch(new Request(new URL('/index.html', url), request));
    return addSecurityHeaders(root);
  },
};


