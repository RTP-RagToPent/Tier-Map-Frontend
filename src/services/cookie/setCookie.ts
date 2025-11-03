import 'server-only';

import { cookies } from 'next/headers';

interface SetCookieProps {
  readonly name: string;
  readonly value: string;
  readonly maxAge: number; // 秒
  readonly path: string;
}

/**
 * クッキーを設定する関数
 */
export default async function setCookie({
  name,
  value,
  maxAge,
  path,
}: SetCookieProps): Promise<boolean> {
  try {
    if (!name || !value || !maxAge || !path) {
      throw new Error('クッキーの設定情報が不正です');
    }

    const cookieStore = await cookies();

    cookieStore.set({
      name,
      value,
      maxAge,
      path,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error setting cookie:', error);
    }
    return false;
  }
}
