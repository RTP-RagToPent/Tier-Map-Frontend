# Google Maps / Places API セットアップガイド

## 概要

このドキュメントは、Tier MapでGoogle Maps / Places APIを有効化し、実データを取得するための手順をまとめたものです。

## 🔧 必要なAPIの有効化

### 1. Google Cloud Consoleでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（例: `tier-map-poc`）
3. プロジェクトを選択

### 2. 必要なAPIを有効化

以下のAPIを有効化してください：

#### a. **Maps JavaScript API**

- 地図表示に使用
- URL: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com

#### b. **Places API (New)**

- スポット検索に使用
- URL: https://console.cloud.google.com/apis/library/places-backend.googleapis.com

#### c. **Geocoding API**

- 地域名を緯度経度に変換
- URL: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com

### 3. APIキーを作成（2つのAPIキーが必要）

**重要**: サーバーサイド用とクライアントサイド用で別々のAPIキーを作成する必要があります。

#### a. サーバーサイド用APIキー（Geocoding API、Places API用）

1. 「認証情報」→「認証情報を作成」→「APIキー」
2. APIキーが生成されます（例: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`）
3. **APIキーの制限設定**:
   - **アプリケーションの制限**: 「なし」または「IPアドレス」（HTTPリファラー制限は使用不可）
   - **API制限**: 「APIを制限」→ Geocoding API、Places API (New) を選択
4. このAPIキーを `GOOGLE_MAPS_API_KEY_SERVER` として保存

#### b. クライアントサイド用APIキー（Maps JavaScript API用）

1. 「認証情報」→「認証情報を作成」→「APIキー」
2. APIキーが生成されます（例: `AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYY`）
3. **APIキーの制限設定**:
   - **アプリケーションの制限**: 「HTTPリファラー（ウェブサイト）」→ `localhost:3000/*`, `yourdomain.com/*` を追加
   - **API制限**: 「APIを制限」→ Maps JavaScript API を選択
4. このAPIキーを `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` として保存

## 🔐 環境変数の設定

### 1. `.env.local` ファイルを作成

```bash
cp .env.example .env.local
```

### 2. APIキーを設定

`.env.local` に以下を記述：

```bash
# サーバーサイド用（Geocoding API、Places API用）
# 制限なしまたはIPアドレス制限を設定
GOOGLE_MAPS_API_KEY_SERVER=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# クライアントサイド用（Maps JavaScript API用）
# HTTPリファラー制限を設定可能
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYY

# Supabase設定（キャッシュ用）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### 3. なぜ2つのAPIキーが必要か？

- **サーバーサイドAPI（Geocoding API、Places API）**: HTTPリファラー制限が使用できないため、制限なしまたはIPアドレス制限が必要
- **クライアントサイドAPI（Maps JavaScript API）**: HTTPリファラー制限を使用できるため、セキュリティを強化可能

## 💰 料金とコスト管理

### 無料枠

- **$200/月** のクレジットが提供されます
- これにより、以下の利用が無料で可能：
  - **Geocoding API**: 約40,000回/月
  - **Places Text Search**: 約6,600回/月
  - **Places Photos**: 約28,000回/月

### コスト削減の工夫

1. **キャッシュの活用**: Supabaseにスポット情報を7日間キャッシュ
2. **Fields指定**: Places APIの`fields`パラメータで取得項目を最小限に
3. **検索結果の制限**: 最大5件までに制限（`MAX_RESULTS = 5`）

### 予算アラートの設定（推奨）

1. Google Cloud Console → 「お支払い」→「予算とアラート」
2. 予算額を設定（例: $50/月）
3. 80%, 90%, 100%到達時にメール通知

## 📊 Supabaseキャッシュテーブルのセットアップ

### 1. Supabaseプロジェクトを作成

1. [Supabase](https://supabase.com/)にアクセス
2. 新しいプロジェクトを作成

### 2. キャッシュテーブルを作成

`docs/supabase/schema-spots-cache.sql` を実行：

```bash
# Supabase SQL Editorで実行
# または、Supabase CLIを使用
supabase db push
```

### 3. Supabase認証情報を取得

1. Supabase Dashboard → Settings → API
2. `Project URL` と `anon public` キーをコピー
3. `.env.local` に設定

## 🧪 動作確認

### 1. 開発サーバーを起動

```bash
npm run dev
```

### 2. スポット検索をテスト

1. http://localhost:3000/search にアクセス
2. 地域に「渋谷区」、ジャンルに「ラーメン」を入力
3. 「探す」をクリック
4. Google APIから実データが取得されることを確認

### 3. ログを確認

ブラウザのコンソールで以下を確認：

- ✅ `Found X spots from Google Places API` → API呼び出し成功
- ✅ `Cache hit: X spots from Supabase` → キャッシュヒット
- ⚠️ `Using mock data` → APIキー未設定（モックフォールバック）

## 🐛 トラブルシューティング

### REQUEST_DENIED エラー（HTTPリファラー制限）

```
Geocoding failed: REQUEST_DENIED - API keys with referer restrictions cannot be used with this API.
```

**原因**: サーバーサイドAPI（Geocoding API、Places API）でHTTPリファラー制限が設定されたAPIキーを使用している

**解決方法**:

1. サーバーサイド用の新しいAPIキーを作成
2. サーバーサイド用APIキーには制限を設定しないか、IPアドレス制限を設定
3. `.env.local` に `GOOGLE_MAPS_API_KEY_SERVER` を設定
4. 開発サーバーを再起動

### APIキーが無効

```
Error: This API key is not authorized to use this service or API
```

→ Google Cloud ConsoleでAPIが有効化されているか確認

### CORS エラー

```
Access to fetch at 'https://maps.googleapis.com/...' has been blocked by CORS policy
```

→ Next.jsのAPI Routes経由で呼び出すか、APIキーの制限を確認

### Supabase接続エラー

```
Error: supabase client is not configured
```

→ `.env.local` にSupabase認証情報が設定されているか確認

## 📚 参考リンク

- [Google Places API ドキュメント](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Google Places API 料金](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- [Supabase ドキュメント](https://supabase.com/docs)

## ✅ チェックリスト

- [ ] Google Cloud プロジェクト作成
- [ ] Maps JavaScript API 有効化
- [ ] Places API 有効化
- [ ] Geocoding API 有効化
- [ ] サーバーサイド用APIキー作成（制限なしまたはIPアドレス制限）
- [ ] クライアントサイド用APIキー作成（HTTPリファラー制限）
- [ ] `.env.local` に `GOOGLE_MAPS_API_KEY_SERVER` を設定
- [ ] `.env.local` に `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` を設定
- [ ] Supabaseプロジェクト作成
- [ ] Supabaseキャッシュテーブル作成
- [ ] `.env.local` にSupabase認証情報設定
- [ ] 開発環境で動作確認
- [ ] 予算アラート設定
