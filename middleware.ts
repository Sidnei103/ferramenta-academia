import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Get the token from the cookie
  const session = request.cookies.get("session")

  // Check if we're on a protected route
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/hiring-") ||
    request.nextUrl.pathname.startsWith("/preparacao") ||
    request.nextUrl.pathname.startsWith("/candidatos")

  if (isProtectedRoute && !session) {
    // Redirect to login if there's no session
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/hiring-:path*", "/preparacao/:path*", "/candidatos/:path*"],
}

