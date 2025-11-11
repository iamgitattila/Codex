import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuth = !!req.auth

  // Public routes
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static")

  // Protect dashboard and learning routes
  if (!isPublicRoute && !isAuth) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // Redirect authenticated users away from auth pages
  if (isAuth && pathname.startsWith("/auth/signin")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
