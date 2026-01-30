import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PATHS = ["/chat", "/conta"];

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!user && isProtected) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set(
      "next",
      pathname + (searchParams.toString() ? `?${searchParams}` : "")
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathname === "/login") {
    const nextPath = searchParams.get("next") || "/chat";
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/chat/:path*", "/conta/:path*", "/login"],
};
