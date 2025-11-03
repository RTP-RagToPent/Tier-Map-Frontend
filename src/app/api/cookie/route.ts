import { NextRequest, NextResponse } from 'next/server';

import { getCookie } from '@/services/cookie/getCookie';
import setCookie from '@/services/cookie/setCookie';

// POST: 任意の Cookie を発行
export async function POST(req: NextRequest) {
  try {
    const { name, value, maxAge, path } = await req.json();

    const ok = await setCookie({ name, value, maxAge, path });
    if (!ok) {
      return NextResponse.json({ ok: false, message: 'failed to set cookie' }, { status: 400 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, message: 'bad request' }, { status: 400 });
  }
}

// GET: name をクエリで受け取り値を返す（確認用）
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name');
  if (!name) return NextResponse.json({ value: null }, { status: 400 });
  const value = await getCookie(name);
  return NextResponse.json({ value }, { status: 200 });
}

