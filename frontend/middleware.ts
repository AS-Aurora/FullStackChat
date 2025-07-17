import { NextResponse } from 'next/server'

export function middleware(request: import('next/server').NextRequest) {
  const token = request.cookies.get('jwt-auth')
  const { pathname } = request.nextUrl

    console.log('Path:', pathname)
  console.log('Token exists:', !!token)
  console.log('Token value:', token?.value)

    const publicRoutes = ['/login', '/signup', '/verify-email']
  const isPublicRoute = publicRoutes.includes(pathname)

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: ['/', '/login', '/signup']
}