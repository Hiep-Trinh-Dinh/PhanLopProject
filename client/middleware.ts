import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value
  const { pathname } = request.nextUrl

  // Danh sách các route công khai không cần xác thực
  const publicRoutes = ['/','/login', '/register', '/forgot-password', '/verify-email', '/reset-password']
  
  // Nếu đã đăng nhập mà truy cập vào trang login/register
  if (token && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/home', request.url))
  }
  
  // Nếu chưa đăng nhập mà truy cập vào trang protected
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}