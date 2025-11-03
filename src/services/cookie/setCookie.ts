import 'server-only';

import { cookies } from 'next/headers';

interface SetCookieOptions {
  name: string;
  value: string;
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * サーバーサイドでCookieを設定
 */
export default async function setCookie(options: SetCookieOptions) {
  const {
    name,
    value,
    maxAge = 60 * 60 * 24, // デフォルト: 24時間
    path = '/',
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'strict',
  } = options;

  const cookieStore = await cookies();

  cookieStore.set(name, value, {
    maxAge,
    path,
    httpOnly,
    secure,
    sameSite,
  });
}
