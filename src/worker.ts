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

    // Defer static routing to Assets pipeline (SPA handling is configured in wrangler.toml)
    const res = await env.ASSETS.fetch(request);
    return addSecurityHeaders(res);
  },
};


