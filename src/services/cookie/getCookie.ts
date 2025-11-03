import 'server-only';

import { cookies } from 'next/headers';

/**
 * クッキーを取得する関数
 */
export async function getCookie(name: string): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value ?? null;
}

/**
 * クッキーを削除する関数
 */
export async function deleteCookie(name: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}
