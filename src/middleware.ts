import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公開ページ（認証不要）
  const publicPaths = ['/login', '/api/auth/callback', '/api/auth/logout'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // 静的ファイルやAPIルートは除外
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/auth'))
  ) {
    return NextResponse.next();
  }

  // 認証トークンをチェック
  const accessToken = request.cookies.get('sb-access-token')?.value;

  // 認証が必要なページで未ログインの場合
  if (!isPublicPath && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ログイン済みでログインページにアクセスした場合
  if (pathname === '/login' && accessToken) {
    const homeUrl = new URL('/search', request.url);
    return NextResponse.redirect(homeUrl);
  }

  // ルートパス（/）はログインページにリダイレクト
  if (pathname === '/' && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ルートパス（/）でログイン済みの場合は/searchにリダイレクト
  if (pathname === '/' && accessToken) {
    const searchUrl = new URL('/search', request.url);
    return NextResponse.redirect(searchUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
