import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Lấy token từ cookie
  const token = request.cookies.get('token')?.value

  // Các đường dẫn không cần xác thực
  const publicPaths = ['/login', '/register']
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname)

  // Nếu không có token và không phải public path, chuyển hướng đến login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Nếu có token và đang ở public path, chuyển hướng đến home
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

// Cấu hình các đường dẫn cần áp dụng middleware
export const config = {
  matcher: ['/', '/home', '/login', '/register', '/groups/:path*']
} 