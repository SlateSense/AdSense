import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { trackVisit } from "@/lib/traffic"

function isProtectedPath(pathname: string) {
  return pathname.startsWith("/admin/traffic") || pathname.startsWith("/api/admin/traffic")
}

function isTrackablePath(pathname: string) {
  if (pathname.startsWith("/_next")) return false
  if (pathname.startsWith("/api")) return false
  if (pathname === "/favicon.ico") return false
  if (pathname.startsWith("/admin/traffic")) return false
  if (pathname.includes(".")) return false
  return true
}

function unauthorizedResponse() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": "Basic realm=\"Traffic Dashboard\""
    }
  })
}

function isAuthorized(req: NextRequest) {
  const user = process.env.ADMIN_DASHBOARD_USER || ""
  const pass = process.env.ADMIN_DASHBOARD_PASS || ""
  if (!user || !pass) return false

  const auth = req.headers.get("authorization")
  if (!auth || !auth.startsWith("Basic ")) return false

  const raw = auth.slice(6)
  let decoded = ""
  try {
    decoded = atob(raw)
  } catch {
    return false
  }
  const [providedUser, providedPass] = decoded.split(":")
  return providedUser === user && providedPass === pass
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isTrackablePath(pathname)) {
    const userAgent = req.headers.get("user-agent") || "unknown"
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    trackVisit({ path: pathname, userAgent, ip })
  }

  if (isProtectedPath(pathname) && !isAuthorized(req)) {
    return unauthorizedResponse()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/:path*"]
}
