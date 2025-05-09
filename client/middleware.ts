import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/verify-email', '/reset-password'];

  // Xử lý các route công khai
  if (publicRoutes.includes(pathname)) {
    if (token) {
      try {
        const response = await fetch('http://localhost:8080/api/auth/me', {
          method: 'GET',
          headers: {
            'Cookie': `auth_token=${token}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.admin) {
            return NextResponse.redirect(new URL('/admin', request.url));
          }
          return NextResponse.redirect(new URL('/home', request.url));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    }
    return NextResponse.next();
  }

  // Xử lý các route admin
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/me', {
        method: 'GET',
        headers: {
          'Cookie': `auth_token=${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      const userData = await response.json();
      if (!userData.admin) {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    } catch (error) {
      console.error('Error verifying admin:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Xử lý các route không phải admin và không công khai
  if (token) {
    try {
      const response = await fetch('http://localhost:8080/api/auth/me', {
        method: 'GET',
        headers: {
          'Cookie': `auth_token=${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        // Nếu là admin, không cho phép truy cập các trang không phải admin
        if (userData.admin) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Nếu không có token và không phải route công khai, chuyển hướng về trang chủ
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};