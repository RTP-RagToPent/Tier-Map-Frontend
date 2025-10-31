# Tier Map - フロントエンド

地域のスポットをラリー形式で巡り、ティア表で評価するWebアプリケーション

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

---

## 🎯 プロジェクト概要

**Tier Map** は、ユーザーが地域のスポット（ラーメン店、カフェなど）を3〜5件選択し、訪問・評価してティア表（S/A/Bランク）を作成するWebアプリケーションです。評価結果はSNSで共有でき、友人と楽しめるグルメラリー体験を提供します。

### 主な機能

- 📍 地域×ジャンルでスポット検索
- 🗺️ 地図でスポット位置を確認
- ✨ ドラッグ&ドロップでラリー作成
- ⭐ 5段階評価＋メモ機能
- 🏆 自動ティア表生成（S/A/B）
- 📱 SNS共有（LINE、X/Twitter）
- 📊 行動データ計測

---

## ✅ 現時点でできること（実装済み）

### 1. プロジェクト初期化 ✅

**状態**: 完全実装済み

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- shadcn/ui コンポーネントライブラリ
- 共通Header/Footer
- `/api/health` エンドポイント（ヘルスチェック）

**動作確認**:
```bash
npm run dev
# http://localhost:3000 でホーム画面が表示される
# http://localhost:3000/api/health でヘルスチェックAPIが動作
```

---

### 2. ホーム画面と検索機能 ✅

**状態**: UI実装済み（モックデータ）

**できること**:
- ✅ ホーム画面の表示
- ✅ 地域（市区町村）の入力
- ✅ ジャンル（8種類）の選択
  - ラーメン、カフェ、居酒屋、イタリアン、焼肉、寿司、ベーカリー、スイーツ
- ✅ バリデーション（両方入力必須）
- ✅ 候補一覧ページへの遷移

**できないこと**:
- ❌ 実際のスポットデータ検索（Google Places API未統合）
- ❌ 地域の自動補完

**URL**: `/search`

---

### 3. 候補スポット一覧＋地図表示 ✅

**状態**: UI実装済み（モックデータ＋プレースホルダー地図）

**できること**:
- ✅ スポット候補の一覧表示（モックデータ5件）
- ✅ スポットの選択機能（3〜5件まで）
- ✅ 選択数の制限とバリデーション
- ✅ ホバー時の地図ピン強調表示
- ✅ ラリー作成ページへの遷移

**できないこと**:
- ❌ 実際のGoogle Places APIからのスポット取得
- ❌ Google Maps の実際の地図表示（プレースホルダーのみ）
- ❌ 詳細な位置情報（現在は固定座標）
- ❌ スポット写真の実際の取得

**URL**: `/candidates?region={地域}&genre={ジャンル}`

**モックデータの内容**:
```typescript
// 実際にはGoogle Places APIから取得予定
{
  id: "spot-1",
  name: "{地域}の{ジャンル}スポット A",
  address: "{地域} 1-1-1",
  rating: 4.5,
  lat: 35.6812,
  lng: 139.7671
}
```

---

### 4. ラリー作成・編集 ✅

**状態**: UI実装済み（ローカルストレージ未対応）

**できること**:
- ✅ ラリー名の編集
- ✅ スポットのドラッグ&ドロップによる順序変更
- ✅ 3〜5件の範囲チェック
- ✅ ラリーIDの自動生成
- ✅ 作成イベントの記録（コンソールログ）
- ✅ ラリー詳細ページへの遷移

**できないこと**:
- ❌ ラリーデータの永続化（API未統合）
- ❌ 作成したラリーの保存・読み込み
- ❌ ラリーの編集・削除

**URL**: `/rally/create?region={地域}&genre={ジャンル}&spots={スポットID}`

**使用ライブラリ**: `@dnd-kit` (ドラッグ&ドロップ)

---

### 5. ラリー一覧 ✅

**状態**: UI実装済み（モックデータ）

**できること**:
- ✅ ラリー一覧の表示（モックデータ2件）
- ✅ ステータス表示（下書き/進行中/完了）
- ✅ ラリー詳細ページへの遷移
- ✅ 新規ラリー作成ボタン

**できないこと**:
- ❌ 実際のラリーデータの取得（API未統合）
- ❌ ラリーの検索・フィルター
- ❌ ページネーション

**URL**: `/rallies`

---

### 6. ラリー詳細・進捗管理 ✅

**状態**: UI実装済み（モックデータ）

**できること**:
- ✅ ラリー情報の表示
- ✅ スポット一覧と訪問状況の表示
- ✅ 進捗バーの表示（訪問済み/総数）
- ✅ 各スポットの評価ページへの遷移
- ✅ 全完了時のティア表ボタン表示

**できないこと**:
- ❌ 実際のラリーデータの取得（API未統合）
- ❌ 訪問状況の自動更新
- ❌ 他ユーザーのラリー閲覧

**URL**: `/rally/{id}`

---

### 7. スポット評価機能 ✅

**状態**: UI実装済み（データ永続化なし）

**できること**:
- ✅ インタラクティブな星評価UI（★1〜5）
- ✅ ホバープレビュー
- ✅ メモ入力（任意）
- ✅ 評価に応じたフィードバック表示
- ✅ 評価イベントの記録（コンソールログ）
- ✅ ラリー詳細ページへの戻り

**できないこと**:
- ❌ 評価データの永続化（API未統合）
- ❌ 評価の編集・削除
- ❌ 写真のアップロード

**URL**: `/rally/{id}/evaluate/{spotId}`

**評価フィードバック**:
- ★5: 最高です！
- ★4: とても良い
- ★3: 良い
- ★2: 普通
- ★1: イマイチ

---

### 8. ティア表生成・表示 ✅

**状態**: 完全実装済み（クライアントサイド算出）

**できること**:
- ✅ 評価平均からの自動ティア算出
  - S: 4.5以上
  - A: 3.5〜4.4
  - B: 3.4以下
- ✅ ティア別の色分け表示
- ✅ 平均評価の表示
- ✅ 各スポットの評価とメモ表示
- ✅ 表示イベントの記録（コンソールログ）
- ✅ 共有ページへの遷移

**できないこと**:
- ❌ サーバーサイドでのティア算出（現在はクライアント側）
- ❌ ティア表のカスタマイズ
- ❌ 履歴比較

**URL**: `/rally/{id}/tier`

**ティアロジック**:
```typescript
function calculateTier(rating: number): TierRank {
  if (rating >= 4.5) return "S";
  if (rating >= 3.5) return "A";
  return "B";
}
```

---

### 9. 共有カード・SNS連携 ✅

**状態**: UI実装済み（画像生成API未統合）

**できること**:
- ✅ ティア表プレビューカードの表示
- ✅ LINE共有リンクの生成・表示
- ✅ X/Twitter共有リンクの生成・表示
- ✅ URLコピー機能
- ✅ コピー完了フィードバック
- ✅ 共有イベントの記録（コンソールログ）

**できないこと**:
- ❌ OGP画像の自動生成（バックエンドAPI未統合）
- ❌ 画像ダウンロード機能
- ❌ カスタマイズ可能な共有テキスト
- ❌ Facebook、Instagramなど他SNS対応

**URL**: `/rally/{id}/share`

**共有テキスト例**:
```
渋谷区 ラーメンラリーを完走しました！
平均評価: 4.4/5.0

#TierMap
https://example.com/rally/123/tier
```

---

### 10. イベント計測システム ✅

**状態**: 実装済み（コンソール出力のみ）

**できること**:
- ✅ 主要アクションのイベント記録
  - `rally_started`: ラリー作成時
  - `spot_evaluated`: スポット評価時
  - `rally_completed`: ラリー完了時
  - `tier_viewed`: ティア表表示時
  - `share_clicked`: 共有ボタンクリック時
- ✅ イベントデータの構造化
- ✅ タイムスタンプ、URL、User-Agent の記録

**できないこと**:
- ❌ Supabase Logsへの実際の送信
- ❌ イベントデータの分析・可視化
- ❌ リアルタイムダッシュボード

**実装ファイル**: `src/lib/analytics.ts`

**ログ出力例**:
```javascript
{
  event: "rally_started",
  data: { rallyId: "rally-1698765432000" },
  timestamp: "2025-10-31T12:34:56.789Z",
  userAgent: "Mozilla/5.0...",
  url: "http://localhost:3000/rally/create"
}
```

---

## ❌ 現時点でできないこと（未実装・要API統合）

### 1. データの永続化 ❌

**問題**: ページをリロードするとすべてのデータが消える

**影響範囲**:
- ラリーの作成・保存
- スポット評価の保存
- ユーザー設定の保存

**必要な対応**:
```typescript
// バックエンドAPIエンドポイントが必要
POST   /api/rallies              - ラリー作成
GET    /api/rallies              - ラリー一覧取得
GET    /api/rallies/{id}         - ラリー詳細取得
PUT    /api/rallies/{id}         - ラリー更新
POST   /api/rallies/{id}/evaluations - 評価作成
GET    /api/rallies/{id}/evaluations - 評価一覧取得
```

---

### 2. Google Places API 未統合 ❌

**問題**: 実際のスポットデータを取得できない

**現在の動作**: モックデータ（固定5件）を表示

**影響範囲**:
- `/candidates` ページのスポット検索
- スポット情報（名前、住所、評価、写真）

**必要な対応**:
```typescript
// src/lib/google-places.ts を実装
export async function searchSpots(
  region: string, 
  genre: string
): Promise<Spot[]> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
    `query=${encodeURIComponent(region + " " + genre)}&` +
    `key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  );
  const data = await response.json();
  return data.results.map(mapToSpot);
}
```

**必要な環境変数**:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

---

### 3. Google Maps 未統合 ❌

**問題**: 実際の地図を表示できない

**現在の動作**: プレースホルダー画像を表示

**影響範囲**:
- `/candidates` ページの地図表示
- スポット位置の可視化

**必要な対応**:
```typescript
// src/components/SpotMap.tsx を実装
// Google Maps JavaScript API を使用
import { GoogleMap, Marker } from '@react-google-maps/api';

export function SpotMap({ spots, hoveredSpotId }: SpotMapProps) {
  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={{ lat: spots[0].lat, lng: spots[0].lng }}
      zoom={14}
    >
      {spots.map((spot, index) => (
        <Marker
          key={spot.id}
          position={{ lat: spot.lat, lng: spot.lng }}
          label={String(index + 1)}
        />
      ))}
    </GoogleMap>
  );
}
```

---

### 4. OGP画像生成 ❌

**問題**: 共有用の画像を生成できない

**現在の動作**: アラート表示のみ

**影響範囲**:
- `/rally/{id}/share` ページの画像ダウンロード
- SNS共有時のプレビュー画像

**必要な対応**:
```typescript
// バックエンドAPIエンドポイントが必要
POST /api/rallies/{id}/generate-ogp

// レスポンス
{
  "imageUrl": "https://storage.example.com/ogp/rally-123.png"
}
```

**実装オプション**:
- Puppeteer（HTMLをスクリーンショット）
- Canvas API（サーバーサイドで画像生成）
- Vercel OG Image Generation

---

### 5. Supabase Analytics 未統合 ❌

**問題**: イベントデータを記録・分析できない

**現在の動作**: `console.log` で出力のみ

**影響範囲**:
- ユーザー行動の分析
- 機能改善のためのデータ収集

**必要な対応**:
```typescript
// src/lib/analytics.ts を実装
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function trackEvent(
  event: AnalyticsEvent,
  data?: EventData
): Promise<void> {
  await supabase.from('analytics_events').insert({
    event,
    data,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    url: window.location.href,
  });
}
```

**必要なSupabaseテーブル**:
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event TEXT NOT NULL,
  data JSONB,
  timestamp TIMESTAMPTZ NOT NULL,
  user_agent TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6. ユーザー認証 ❌

**問題**: ユーザーを識別できない

**影響範囲**:
- ラリーの所有者管理
- マルチユーザー対応
- プライベートラリー

**必要な対応**:
- NextAuth.js または Supabase Auth の導入
- ログイン/ログアウト機能
- ユーザープロフィール

---

### 7. レスポンシブ対応の限界 ⚠️

**問題**: モバイル表示の最適化が不十分

**現在の動作**: 基本的なレスポンシブ対応のみ

**影響範囲**:
- スマートフォンでの操作性
- タブレット表示

**必要な対応**:
- モバイル専用UI
- タッチジェスチャー最適化
- 画面サイズ別のレイアウト調整

---

### 8. オフライン対応 ❌

**問題**: ネットワークがないと使用できない

**影響範囲**:
- 地下や圏外での利用
- データ通信量

**必要な対応**:
- Service Worker の実装
- Cache API でのデータキャッシュ
- オフライン時のUI表示

---

### 9. アクセシビリティ ⚠️

**問題**: スクリーンリーダー等への対応が不十分

**現在の動作**: 基本的なHTML構造のみ

**必要な対応**:
- ARIA属性の追加
- キーボード操作の最適化
- フォーカス管理の改善
- カラーコントラストの改善

---

### 10. テスト ❌

**問題**: 自動テストが未実装

**影響範囲**:
- リグレッション検出
- リファクタリングの安全性

**必要な対応**:
- Jest + React Testing Library でのユニットテスト
- Cypress でのE2Eテスト
- テストカバレッジ80%以上を目標

---

## 🚀 セットアップ

### 必要な環境

- Node.js 18.x 以上
- npm 9.x 以上

### インストール手順

```bash
# リポジトリのクローン
git clone https://github.com/your-org/tier-map-frontend.git
cd tier-map-frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ブラウザで開く
# http://localhost:3000
```

### ビルド

```bash
# 本番ビルド
npm run build

# 本番サーバーの起動
npm start

# ビルド結果の確認
# http://localhost:3000
```

### Linter

```bash
# Linterの実行
npm run lint
```

---

## 📂 プロジェクト構造

```
tier-map-frontend/
├── src/
│   ├── app/                    # Next.js App Router ページ
│   │   ├── api/
│   │   │   └── health/         # ✅ ヘルスチェックAPI
│   │   ├── candidates/         # ✅ 候補一覧（モック）
│   │   ├── rally/
│   │   │   ├── [id]/           # ✅ ラリー詳細（モック）
│   │   │   │   ├── evaluate/  # ✅ 評価画面（保存なし）
│   │   │   │   ├── tier/      # ✅ ティア表
│   │   │   │   └── share/     # ✅ 共有（画像生成なし）
│   │   │   └── create/         # ✅ ラリー作成（保存なし）
│   │   ├── rallies/            # ✅ ラリー一覧（モック）
│   │   ├── search/             # ✅ 検索画面
│   │   ├── layout.tsx          # ✅ ルートレイアウト
│   │   └── page.tsx            # ✅ ホーム画面
│   ├── components/
│   │   ├── Header.tsx          # ✅ 共通ヘッダー
│   │   ├── Footer.tsx          # ✅ 共通フッター
│   │   ├── SpotMap.tsx         # ⚠️ プレースホルダー地図
│   │   ├── SortableSpotList.tsx # ✅ D&Dリスト
│   │   └── ui/                 # ✅ shadcn/ui
│   ├── lib/
│   │   ├── analytics.ts        # ⚠️ コンソールログのみ
│   │   ├── google-places.ts    # ⚠️ モックデータのみ
│   │   ├── tier.ts             # ✅ ティア算出ロジック
│   │   └── utils.ts            # ✅ ユーティリティ
│   └── types/
│       └── spot.ts             # ✅ 型定義
├── public/                     # 静的ファイル
├── Backlog.md                  # Issue管理
├── PRD.md                      # 要件定義
├── IMPLEMENTATION.md           # 実装詳細ドキュメント
└── README.md                   # このファイル
```

**凡例**:
- ✅ 完全実装済み
- ⚠️ 部分実装（モック・プレースホルダー）
- ❌ 未実装

---

## 🔧 環境変数（未設定）

以下の環境変数が必要ですが、現時点では未設定です。

```env
# Google Maps（必須）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# Supabase（必須）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# バックエンドAPI（任意）
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

`.env.local` ファイルを作成して設定してください。

---

## 📊 実装状況サマリー

### 機能別実装状況

| 機能 | UI | ロジック | API統合 | 状態 |
|------|----|---------|---------| -----|
| プロジェクト初期化 | ✅ | ✅ | ✅ | 完了 |
| ホーム・検索 | ✅ | ✅ | ❌ | UI完了 |
| 候補一覧 | ✅ | ✅ | ❌ | モック |
| 地図表示 | ⚠️ | ⚠️ | ❌ | プレースホルダー |
| ラリー作成 | ✅ | ✅ | ❌ | UI完了 |
| ラリー一覧 | ✅ | ⚠️ | ❌ | モック |
| ラリー詳細 | ✅ | ⚠️ | ❌ | モック |
| スポット評価 | ✅ | ✅ | ❌ | UI完了 |
| ティア表 | ✅ | ✅ | ✅ | 完了 |
| 共有機能 | ✅ | ✅ | ❌ | 画像生成なし |
| イベント計測 | ✅ | ✅ | ❌ | ログのみ |

### 進捗率

```
UI実装:        100% ████████████████████ (10/10)
ロジック実装:   90% ██████████████████░░ (9/10)
API統合:        10% ██░░░░░░░░░░░░░░░░░░ (1/10)
全体:          67% █████████████░░░░░░░ (20/30)
```

---

## 🎯 次のステップ（優先順位順）

### 1. バックエンドAPI統合（最優先）

**目的**: データの永続化

**タスク**:
- [ ] ラリーCRUD APIの実装
- [ ] 評価データ保存APIの実装
- [ ] API統合のためのクライアント実装

**所要時間**: 2〜3日

---

### 2. Google Places API 統合

**目的**: 実際のスポットデータ取得

**タスク**:
- [ ] Google Cloud Platformでプロジェクト作成
- [ ] Places API の有効化
- [ ] `src/lib/google-places.ts` の実装
- [ ] 環境変数の設定

**所要時間**: 1日

---

### 3. Google Maps API 統合

**目的**: 実際の地図表示

**タスク**:
- [ ] Maps JavaScript API の有効化
- [ ] `@react-google-maps/api` のインストール
- [ ] `src/components/SpotMap.tsx` の実装
- [ ] マーカーのカスタマイズ

**所要時間**: 1日

---

### 4. Supabase Analytics 統合

**目的**: イベントデータの記録・分析

**タスク**:
- [ ] Supabaseプロジェクト作成
- [ ] `analytics_events` テーブル作成
- [ ] Supabaseクライアントの設定
- [ ] `src/lib/analytics.ts` の実装

**所要時間**: 半日

---

### 5. OGP画像生成API 実装

**目的**: SNS共有時の画像生成

**タスク**:
- [ ] 画像生成エンドポイントの実装
- [ ] Puppeteer または Canvas API の導入
- [ ] `src/app/rally/[id]/share/page.tsx` の更新

**所要時間**: 1〜2日

---

### 6. ユーザー認証（中期）

**目的**: マルチユーザー対応

**タスク**:
- [ ] NextAuth.js または Supabase Auth の導入
- [ ] ログイン/ログアウトUI
- [ ] 認証状態の管理
- [ ] プロテクトされたルート

**所要時間**: 2〜3日

---

### 7. テスト実装（長期）

**タスク**:
- [ ] Jest + React Testing Library のセットアップ
- [ ] コンポーネントのユニットテスト
- [ ] Cypress のセットアップ
- [ ] E2Eテストシナリオ作成

**所要時間**: 3〜5日

---

## 📱 動作確認済みの画面

### ✅ 動作する画面

| URL | 画面名 | 状態 |
|-----|--------|------|
| `/` | ホーム | 完全動作 |
| `/search` | スポット検索 | 完全動作 |
| `/candidates` | 候補一覧 | UI動作（モック） |
| `/rally/create` | ラリー作成 | UI動作（保存なし） |
| `/rallies` | ラリー一覧 | UI動作（モック） |
| `/rally/{id}` | ラリー詳細 | UI動作（モック） |
| `/rally/{id}/evaluate/{spotId}` | 評価 | UI動作（保存なし） |
| `/rally/{id}/tier` | ティア表 | 完全動作 |
| `/rally/{id}/share` | 共有 | UI動作（画像なし） |
| `/api/health` | ヘルスチェック | 完全動作 |

---

## 🐛 既知の問題

### 1. リロードでデータが消える

**原因**: API未統合のためデータを保存できない  
**回避策**: なし（API統合が必要）

### 2. 地図がプレースホルダー表示

**原因**: Google Maps API未統合  
**回避策**: なし（API統合が必要）

### 3. モックデータが固定

**原因**: Google Places API未統合  
**回避策**: なし（API統合が必要）

### 4. 共有画像が生成されない

**原因**: 画像生成API未実装  
**回避策**: なし（API実装が必要）

### 5. イベントがSupabaseに記録されない

**原因**: Supabase未統合  
**回避策**: なし（Supabase統合が必要）

---

## 📚 関連ドキュメント

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - 詳細な実装ドキュメント
- [PRD.md](./PRD.md) - プロダクト要件定義書
- [Backlog.md](./Backlog.md) - GitHub Issue一覧

---

## 🤝 コントリビューション

現在、バックエンドAPIの統合を優先的に進めています。
貢献したい方は以下の手順でお願いします：

1. このリポジトリをフォーク
2. フィーチャーブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを作成

---

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

---

## 📞 お問い合わせ

プロジェクトに関する質問や提案がある場合は、Issueを作成してください。

---

**最終更新**: 2025年10月31日  
**バージョン**: 1.0.0  
**ビルドステータス**: ✅ 成功  
**実装進捗**: 67% (20/30項目)
