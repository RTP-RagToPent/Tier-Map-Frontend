# バックエンドAPI統合ガイド

## 概要
このドキュメントは、Tier MapフロントエンドとSupabase Edge Functionsで構築されたバックエンドAPIとの統合方法を説明します。

## 📋 前提条件

- Supabase Edge Functionsバックエンドがデプロイ済み
- APIエンドポイント: `https://your-project.supabase.co/functions/v1`
- セッションベース認証が実装されている

## 🔧 環境変数の設定

### 1. `.env.local` ファイルを作成

```bash
cp .env.example .env.local
```

### 2. 環境変数を設定

```bash
# Google Maps API（スポット検索用）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# バックエンドAPI Base URL（Supabase Edge Functions）
NEXT_PUBLIC_API_BASE_URL=https://your-project.supabase.co/functions/v1
```

**注意**: 
- `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` は、Google Places APIキャッシュ機能を使用する場合のみ必要です（オプション）
- バックエンドAPI呼び出しには `NEXT_PUBLIC_API_BASE_URL` のみが必要です

## 🌐 APIエンドポイント一覧

### 認証

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/login` | Google OAuth accessTokenでログイン |

### プロフィール

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/profiles` | プロフィール取得 |
| POST | `/profiles` | プロフィール作成 |
| PATCH | `/profiles` | プロフィール更新 |

### ラリー

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/rallies` | ラリー一覧取得 |
| POST | `/rallies` | ラリー作成 |
| GET | `/rallies/:rally_id` | ラリー詳細取得 |
| PATCH | `/rallies/:rally_id` | ラリー更新 |

### スポット

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/rallies/:rally_id/spots` | ラリーのスポット一覧取得 |
| POST | `/rallies/:rally_id/spots` | ラリーにスポットを追加 |
| GET | `/rallies/:rally_id/spots/:spot_id` | スポット詳細取得 |

### 評価

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/rallies/:rally_id/ratings` | ラリーの評価一覧取得 |
| POST | `/rallies/:rally_id/ratings` | 評価作成 |
| GET | `/rallies/:rally_id/ratings/:spot_id` | スポットの評価取得 |

## 🔐 認証フロー

### 1. セッショントークンの取得

```typescript
import { apiClient, setSessionToken } from '@shared/lib/api-client';

// Google OAuth accessTokenを使用してログイン
const response = await apiClient.login(googleAccessToken);
const { sessionToken } = response;

// セッショントークンを保存
setSessionToken(sessionToken);
```

### 2. 認証が必要なAPIの呼び出し

```typescript
// セッショントークンは自動的にヘッダーに追加されます
const rallies = await apiClient.getRallies();
```

### 3. ログアウト

```typescript
import { clearSessionToken } from '@shared/lib/api-client';

// セッショントークンをクリア
clearSessionToken();
```

## 📝 使用例

### ラリーを作成

```typescript
import { apiClient } from '@shared/lib/api-client';

// 1. ラリーを作成
const rally = await apiClient.createRally('渋谷区 ラーメンラリー', 'ラーメン');
console.log(rally.id); // ラリーID

// 2. スポットを追加
const spots = await apiClient.addRallySpots(rally.id, [
  { spot_id: 'place-id-1', name: 'ラーメンA' },
  { spot_id: 'place-id-2', name: 'ラーメンB' },
  { spot_id: 'place-id-3', name: 'ラーメンC' },
]);
```

### スポットを評価

```typescript
import { apiClient } from '@shared/lib/api-client';

const rating = await apiClient.createRating(
  rallyId,     // ラリーID
  spotId,      // スポットID (Google Place ID)
  5,           // 星評価 (1-5)
  'とても美味しかった！' // メモ（任意）
);
```

### ラリー詳細を取得

```typescript
import { apiClient } from '@shared/lib/api-client';

// 1. ラリー基本情報を取得
const rally = await apiClient.getRally(rallyId);

// 2. スポット一覧を取得
const spots = await apiClient.getRallySpots(rallyId);

// 3. 評価データを取得
const ratings = await apiClient.getRallyRatings(rallyId);
```

## 🛡️ エラーハンドリング

### APIエラーのキャッチ

```typescript
try {
  const rallies = await apiClient.getRallies();
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message);
    alert(error.message);
  }
}
```

### セッショントークンエラー

セッショントークンが無効または期限切れの場合：

```typescript
try {
  const rallies = await apiClient.getRallies();
} catch (error) {
  if (error.message.includes('Session token not found')) {
    // ログインページにリダイレクト
    router.push('/login');
  }
}
```

## 🎨 フロントエンドでの実装

### カスタムHooksでの使用

```typescript
// src/features/rally/hooks/useRallies.ts
import { useEffect, useState } from 'react';
import { apiClient, isApiConfigured } from '@shared/lib/api-client';

export function useRallies() {
  const [rallies, setRallies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRallies = async () => {
      try {
        if (!isApiConfigured()) {
          // モックデータにフォールバック
          setRallies(getMockRallies());
          return;
        }

        const response = await apiClient.getRallies();
        setRallies(response.rallies);
      } catch (error) {
        console.error(error);
        // エラー時はモックデータ
        setRallies(getMockRallies());
      } finally {
        setLoading(false);
      }
    };

    fetchRallies();
  }, []);

  return { rallies, loading };
}
```

### ページコンポーネントでの使用

```typescript
// src/app/rallies/page.tsx
import { useRallies } from '@features/rally/hooks/useRallies';

export default function RalliesPage() {
  const { rallies, loading } = useRallies();

  if (loading) return <div>読み込み中...</div>;

  return (
    <div>
      {rallies.map(rally => (
        <div key={rally.id}>{rally.name}</div>
      ))}
    </div>
  );
}
```

## 🧪 モックモードとフォールバック

APIが設定されていない場合、自動的にモックデータにフォールバックします：

```typescript
import { isApiConfigured } from '@shared/lib/api-client';

if (!isApiConfigured()) {
  console.warn('⚠️  API not configured, using mock data');
  // モックデータを使用
}
```

これにより、バックエンドAPIなしでもフロントエンドの開発を継続できます。

## 📊 レスポンス形式

### 成功レスポンス

```json
{
  "id": 1,
  "name": "渋谷区 ラーメンラリー",
  "genre": "ラーメン",
  "message": "Rally created successfully"
}
```

### エラーレスポンス

```json
{
  "error": "Invalid session token",
  "message": "Authentication failed"
}
```

## 🔍 デバッグ

### APIリクエストのログ

```typescript
// ブラウザのコンソールでAPIリクエストを確認
// src/shared/lib/api-client.ts で console.log を追加
```

### 環境変数の確認

```typescript
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('API Configured:', isApiConfigured());
```

## ✅ チェックリスト

- [ ] Supabaseバックエンド（Edge Functions）がデプロイ済み
- [ ] `.env.local` に `NEXT_PUBLIC_API_BASE_URL` を設定
- [ ] （オプション）Google Places APIキャッシュ用に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
- [ ] 認証フローが実装されている（Google OAuth）
- [ ] セッショントークンが正しく保存されている
- [ ] APIエンドポイントが正常に応答する
- [ ] エラーハンドリングが適切に実装されている

## 📚 関連ドキュメント

- [GOOGLE_API_SETUP.md](./GOOGLE_API_SETUP.md) - Google Places API統合
- [API型定義](../src/shared/types/api.ts) - TypeScript型定義
- [APIクライアント](../src/shared/lib/api-client.ts) - APIクライアント実装

## 🐛 トラブルシューティング

### APIが呼び出せない

1. `NEXT_PUBLIC_API_BASE_URL` が正しく設定されているか確認
2. セッショントークンが保存されているか確認（`localStorage`）
3. CORSエラーが発生していないか確認

### セッショントークンエラー

1. ログインが正常に完了しているか確認
2. トークンの有効期限が切れていないか確認
3. 再ログインを試す

### モックデータが表示される

1. `NEXT_PUBLIC_API_BASE_URL` が設定されているか確認
2. バックエンドAPIが起動しているか確認
3. ネットワーク接続を確認

