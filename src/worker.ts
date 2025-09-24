export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // Try static asset first
    const res = await env.ASSETS.fetch(request);
    if (res && res.status !== 404) return res;

    // SPA fallback to index.html
    const url = new URL(request.url);
    return env.ASSETS.fetch(new Request(new URL('/index.html', url), request));
  },
};


