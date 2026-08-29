import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

const PUBLIC_PREFIXES = ["/login", "/auth", "/privacy", "/terms", "/reset-password"];

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (pathname !== "/api/health" && request.method !== "GET" && request.method !== "HEAD") {
      const limited = rateLimit(`api:${clientIp(request)}`, 80, 60_000);
      if (!limited.ok) {
        return NextResponse.json(
          { error: "Too many requests" },
          {
            status: 429,
            headers: { "Retry-After": String(limited.retryAfterSec) },
          }
        );
      }
    }
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    console.warn("[middleware] auth lookup failed", err);
    user = null;
  }

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname.startsWith("/login/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sw.js|workbox-.*|worker-.*|fallback-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
