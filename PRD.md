# プロダクト要件定義（PRD）

## 1. 概要

- プロダクト名: Tier Map（フロントエンド）
- 目的: 地域×ジャンルで選んだ3〜5件のスポットを巡り、評価してティア表（S/A/B）を作成・共有できる体験を提供する。

## 2. スコープ（現行）

- スポット検索（地域×ジャンル／最大5件）（データ取得は `/api/spots` 経由）
- ラリー作成（並び替え／名称編集）
- 評価（★1〜5、任意メモ）
- ティア表の自動生成と表示（S/A/B）
- 共有ページ（SNSリンク生成、URLコピー）
- 認証（Google／GitHub／Email+Password）

## 3. 認証要件

- サポート: Google OAuth, GitHub OAuth, Email+Password（存在しない場合は自動登録）
- Cookie: HttpOnly, Secure(本番), SameSite=strict, path='/'
- ルート保護: `/search`, `/candidates`, `/rallies/*` は認証必須。`/login` は未認証ユーザーのみ。
- エンドポイント:
  - POST `/api/auth/oauth`（プロバイダ開始）
  - GET `/api/auth/callback`（コード交換→Cookie設定）
  - POST `/api/auth/email/login`（ログイン/自動登録）
  - POST `/api/auth/logout`（ログアウト）

## 4. データ取得方針

- スポット検索はフロントから `GET /api/spots` を呼ぶ。
  - バックエンド側で Google Maps/Places/Geocoding を呼び出し、最大5件に制限。
  - キャッシュはサーバ側で実装（将来のコスト最適化前提）。
- フロントエンドからのDB直接操作は行わない（認証以外）。

## 5. ルーティング仕様（App Router）

- `/login` 認証ページ
- `/search` 検索ページ
- `/candidates` 候補一覧
- `/rallies` 一覧
- `/rallies/create` 作成
- `/rallies/[id]` 詳細
- `/rallies/[id]/evaluate/[spotId]` 評価
- `/rallies/[id]/tier` ティア表
- `/rallies/[id]/share` 共有

## 6. 環境変数（すべてNEXT*PUBLIC*）

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_API_BASE_URL=... # 必要に応じて
```

- セキュリティ: SupabaseはRLSで保護、Google API KeyはHTTPリファラ制限とAPI制限を実施。

## 7. 非機能要件

- ビルド: Next.js 16（Turbopack）で成功すること
- 静的最適化: 可能なページは静的生成
- Lint: ESLint無警告
- 型: TypeScript無エラー

## 8. 今回の変更（Issue #18）

- 認証フローの統合（Google/GitHub/Email+Password、Route Handler実装、Cookie設定）
- すべての環境変数を `NEXT_PUBLIC_` プレフィックスで統一
- ルーティングを `/rally/*` から `/rallies/*` に統一
- 候補検索の呼び出しを `/api/spots` に統一（クライアントは `features/candidates/lib/google-places.ts`）
- ログアウトボタンはログイン時のみ表示（`shared/components/layout/Header.tsx`）
- `evaluate/[spotId]` と `tier/page` のモックデータ廃止→API連携

## 9. 未対応（今後の課題）

- OGP画像生成API
- Supabase Analytics（`analytics_events` への記録）
- Google Mapsの実際の地図表示
- ラリー/評価の永続化API
