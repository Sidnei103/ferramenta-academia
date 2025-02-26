import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Adicionar logs detalhados
  const session = request.cookies.get("session")
  const token = session?.value

  console.log("=== Middleware Debug ===")
  console.log("Path:", request.nextUrl.pathname)
  console.log("Has session cookie:", !!session)
  console.log("Token length:", token?.length ?? 0)

  // Check if we're on a protected route
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/hiring-") ||
    request.nextUrl.pathname.startsWith("/preparacao") ||
    request.nextUrl.pathname.startsWith("/candidatos")

  // Se não houver token em uma rota protegida
  if (isProtectedRoute && !token) {
    console.log("Redirecionando para login: Sem token")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Se houver token, permitir o acesso
  console.log("Permitindo acesso à rota")
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/hiring-:path*", "/preparacao/:path*", "/candidatos/:path*"],
}

