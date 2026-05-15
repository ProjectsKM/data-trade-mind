// Same-origin requests don't need CORS headers. We only reflect a known set
// of trusted origins (production + Lovable preview subdomains) when the
// request comes from a browser that sent an Origin header. Wildcard origin
// is never used because these endpoints carry the user's bearer token.
const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/i,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/i,
  /^https?:\/\/localhost(?::\d+)?$/i,
];

function allowedOrigin(origin: string | null): string | null {
  if (!origin) return null;
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin)) ? origin : null;
}

export function corsHeaders(request?: Request): Record<string, string> {
  const origin = allowedOrigin(request?.headers.get("origin") ?? null);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

// Back-compat: a permissive-looking constant some callers still import,
// but with no Allow-Origin so it never opens CORS by accident.
export const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
} as const;

export function jsonResponse(data: unknown, status = 200, request?: Request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request) },
  });
}
