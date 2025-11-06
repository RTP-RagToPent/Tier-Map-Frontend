# APIキーセキュリティガイド

## 概要

このプロジェクトでは、**サーバーサイド専用**のRoute Handlerを使用してAPIキーを隠蔽しています。
`NEXT_PUBLIC_`プレフィックスは使用せず、クライアントからAPIキーが露出しないように設計されています。

## アーキテクチャ

```
Client (Browser)
  ↓
Route Handler (/api/*)
  ↓ (APIキーを追加)
External API (Google Maps, Supabase)
```

## 環境変数

### サーバーサイド専用（`NEXT_PUBLIC_`不要）

```bash
# Supabase設定
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Backend API
API_BASE_URL=https://your-project.supabase.co/functions/v1
```

## Route Handlers

### 1. Supabase認証

#### `POST /api/supabase/auth`
Google OAuth認証のプロキシ

```typescript
// クライアント側のコード例
const response = await fetch('/api/supabase/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'signInWithOAuth',
    provider: 'google',
  }),
});
const { url } = await response.json();
window.location.href = url;
```

### 2. Google Places API

#### `GET /api/google/geocode?address={address}`
地域名を緯度経度に変換

#### `GET /api/google/places/search?query={query}&location={lat,lng}&radius={radius}&type={type}`
スポットを検索

#### `GET /api/google/places/photo?reference={photo_reference}&maxwidth={maxwidth}`
スポット写真を取得

#### `GET /api/google/spots?region={region}&genre={genre}`
統合エンドポイント（Geocoding + Places Search + Cache）

```typescript
// クライアント側のコード例
const response = await fetch(
  `/api/google/spots?region=${encodeURIComponent(region)}&genre=${encodeURIComponent(genre)}`
);
const { spots, source } = await response.json();
// source: 'cache' | 'api' | 'error'
```

## セキュリティのベストプラクティス

### ✅ やること

1. **サーバーサイドでAPIキーを管理**
   - 環境変数は`NEXT_PUBLIC_`プレフィックスなしで設定
   - `server-only`パッケージで保護

2. **Route Handlerを経由**
   - クライアントから直接外部APIを呼ばない
   - すべてのAPI呼び出しは`/api/*`を経由

3. **環境変数の検証**
   - `serverEnv`で型安全に環境変数を管理
   - 設定漏れをチェック関数で検出

### ❌ やらないこと

1. **`NEXT_PUBLIC_`プレフィックスを使用しない**
   ```bash
   # ❌ ダメな例
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx
   
   # ✅ 正しい例
   GOOGLE_MAPS_API_KEY=xxx
   ```

2. **クライアントから直接外部APIを呼ばない**
   ```typescript
   // ❌ ダメな例
   fetch(`https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`)
   
   // ✅ 正しい例
   fetch('/api/google/geocode?address=...')
   ```

3. **APIキーをハードコーディングしない**

## ファイル構成

```
src/
├── config/
│   └── server-env.ts          # サーバーサイド環境変数管理
├── lib/
│   ├── supabase-server.ts     # Supabaseサーバーユーティリティ
│   └── google-places-server.ts # Google Places APIサーバーユーティリティ
├── app/api/
│   ├── supabase/
│   │   ├── auth/route.ts      # Supabase認証プロキシ
│   │   └── session/route.ts   # セッション管理
│   └── google/
│       ├── geocode/route.ts   # Geocoding API
│       ├── places/
│       │   ├── search/route.ts # Places Search API
│       │   └── photo/route.ts  # Photo API
│       └── spots/route.ts     # 統合エンドポイント
└── features/
    └── candidates/
        └── lib/
            └── google-places.ts # クライアント側API呼び出し
```

## 移行ガイド

### Before（NEXT_PUBLIC_使用）

```typescript
// ❌ クライアント側でAPIキーが露出
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const url = `https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}`;
```

### After（Route Handler経由）

```typescript
// ✅ APIキーはサーバーサイドで管理
const response = await fetch('/api/google/geocode?address=...');
const data = await response.json();
```

## トラブルシューティング

### 環境変数が読み込まれない

1. `.env.local`ファイルを確認
2. サーバーを再起動（`npm run dev`）
3. `serverEnv`の設定を確認

### APIエラーが発生する

1. Route Handlerのログを確認
2. 環境変数が正しく設定されているか確認
3. APIキーの権限を確認

## 参考リンク

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [server-only package](https://www.npmjs.com/package/server-only)

