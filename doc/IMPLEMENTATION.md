# Tier Map フロントエンド実装ドキュメント

## 📋 概要

このドキュメントは、Tier Map フロントエンドの実装内容を詳細に説明します。
全8件のIssueを完了し、ラリー形式でスポットを巡り、ティア表で評価するWebアプリケーションを実装しました。

**実装期間**: 2025年10月31日
**技術スタック**: Next.js 16 (App Router) / TypeScript / Tailwind CSS v4 / shadcn/ui

---

## 🎯 実装したIssue一覧

### ✅ [#1] プロジェクト初期化（Next.js/TS/Tailwind/shadcn/ui）

**実装内容**:
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4（最新版）
- shadcn/ui コンポーネントライブラリ
- 共通Header/Footer
- ヘルスチェックAPIエンドポイント

**実装ファイル**:
```
src/
├── app/
│   ├── layout.tsx              # ルートレイアウト（Header/Footer含む）
│   ├── page.tsx                # ホームページ
│   ├── globals.css             # グローバルスタイル（Tailwind設定）
│   └── api/
│       └── health/
│           └── route.ts        # ヘルスチェックAPI
├── components/
│   ├── Header.tsx              # 共通ヘッダー
│   ├── Footer.tsx              # 共通フッター
│   └── ui/                     # shadcn/ui コンポーネント
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── select.tsx
└── lib/
    └── utils.ts                # shadcn/ui ユーティリティ
```

**特徴**:
- ダークモード非対応（将来対応可能な構造）
- レスポンシブデザイン対応
- `/api/health` で `{"status": "ok", "timestamp": "...", "service": "tier-map-frontend"}` を返却

---

### ✅ [#2] ホーム画面：地域×ジャンル選択 UI

**実装内容**:
- 地域（市区町村）入力フォーム
- ジャンル選択ドロップダウン（8ジャンル対応）
- バリデーション付き「探す」ボタン

**実装ファイル**:
```
src/app/search/page.tsx         # 検索ページ
```

**対応ジャンル**:
1. ラーメン
2. カフェ
3. 居酒屋
4. イタリアン
5. 焼肉
6. 寿司
7. ベーカリー
8. スイーツ

**フロー**:
1. ユーザーが地域とジャンルを入力
2. 両方選択されていない場合はアラート表示
3. 選択完了後、候補一覧ページ（`/candidates?region=...&genre=...`）へ遷移

**技術的ポイント**:
- `useRouter` でクライアントサイドナビゲーション
- `Suspense` 境界でローディング状態管理

---

### ✅ [#3] 候補スポット一覧＋ミニ地図

**実装内容**:
- 3〜5件のスポット候補をカード形式で表示
- スポットの選択機能（最大5件まで）
- ミニ地図でスポット位置を可視化
- リストホバー時に地図のピンを強調表示

**実装ファイル**:
```
src/
├── app/candidates/page.tsx     # 候補一覧ページ
├── components/SpotMap.tsx      # 地図コンポーネント
├── lib/google-places.ts        # Google Places APIモック
└── types/spot.ts               # Spot/Rally型定義
```

**機能詳細**:

#### スポット選択
- 3〜5件の範囲で選択可能
- 選択中のカードは青色でハイライト
- 5件を超える選択を試みた場合はアラート表示

#### 地図表示
- 現在はプレースホルダー表示（Google Maps API統合準備済み）
- ホバーしたスポットのピンを強調表示
- 各スポットに番号付きピンを表示

#### データ構造
```typescript
interface Spot {
  id: string;
  name: string;
  address: string;
  rating?: number;
  lat: number;
  lng: number;
  photoUrl?: string;
}
```

**TODO**:
- Google Places API実装（`src/lib/google-places.ts`）
- Google Maps API統合（`src/components/SpotMap.tsx`）

---

### ✅ [#4] ラリー作成・編集（3〜5件選択／順番入替）

**実装内容**:
- ドラッグ&ドロップでスポット順序を編集
- ラリー名の編集機能
- 3〜5件の範囲チェック
- ラリーデータの保存（モック実装）

**実装ファイル**:
```
src/
├── app/rally/create/page.tsx        # ラリー作成ページ
└── components/SortableSpotList.tsx  # ドラッグ可能なリスト項目
```

**使用ライブラリ**:
- `@dnd-kit/core`: ドラッグ&ドロップコア機能
- `@dnd-kit/sortable`: ソート可能リスト
- `@dnd-kit/utilities`: ユーティリティ関数

**機能詳細**:

#### ドラッグ&ドロップ
```typescript
// センサー設定（ポインタ・キーボード対応）
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

// ドラッグ終了時の処理
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    setSpots((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }
};
```

#### ラリーデータ構造
```typescript
interface Rally {
  id: string;
  name: string;
  region: string;
  genre: string;
  spots: Spot[];
  createdAt: string;
  status: "draft" | "in_progress" | "completed";
}
```

**保存フロー**:
1. ユーザーがラリー名を編集（デフォルト: `{地域} {ジャンル}ラリー`）
2. スポットをドラッグして順序を調整
3. 「ラリーを保存」ボタンでIDを発行
4. アナリティクスイベント `rally_started` を送信
5. ラリー詳細ページ（`/rally/{id}`）へ遷移

**TODO**:
- バックエンドAPIへのラリー保存実装

---

### ✅ [#5] 評価画面（★1〜5／メモ）

**実装内容**:
- インタラクティブな星評価UI（ホバーエフェクト付き）
- メモ入力欄（任意）
- 評価データの保存

**実装ファイル**:
```
src/app/rally/[id]/evaluate/[spotId]/page.tsx
```

**機能詳細**:

#### 星評価UI
- ★1〜5の5段階評価
- ホバー時にプレビュー表示
- クリックで評価を確定
- 評価に応じたフィードバックテキスト
  - 5: 最高です！
  - 4: とても良い
  - 3: 良い
  - 2: 普通
  - 1: イマイチ

#### 評価データ構造
```typescript
interface SpotEvaluation {
  spotId: string;
  rating: number;      // 1-5
  memo?: string;
  visitedAt?: string;
}
```

**保存フロー**:
1. ユーザーが★をクリックして評価を選択（必須）
2. 任意でメモを入力
3. 「評価を保存」ボタンをクリック
4. アナリティクスイベント `spot_evaluated` を送信
5. ラリー詳細ページへ戻る

**TODO**:
- バックエンドAPIへの評価データ保存実装

---

### ✅ [#6] ティア表（S/A/B）表示

**実装内容**:
- 評価平均に基づく自動ティア算出
- ティア別のビジュアル表示（色分け）
- 平均評価の表示

**実装ファイル**:
```
src/
├── app/rally/[id]/tier/page.tsx  # ティア表ページ
└── lib/tier.ts                   # ティア算出ロジック
```

**ティア算出ロジック**:
```typescript
function calculateTier(rating: number): TierRank {
  if (rating >= 4.5) return "S";  // 4.5以上
  if (rating >= 3.5) return "A";  // 3.5〜4.4
  return "B";                      // 3.4以下
}
```

**ティア別スタイル**:

| ティア | 背景色 | ボーダー色 | バッジ色 | 説明 |
|--------|--------|-----------|---------|------|
| S | yellow-100 | yellow-500 | yellow-500 | 最高！ |
| A | blue-100 | blue-500 | blue-500 | とても良い |
| B | gray-100 | gray-500 | gray-500 | 普通 |

**表示内容**:
- ラリー名と地域・ジャンル
- 平均評価（全スポットの平均）
- ティア別グループ表示
  - 各スポット名と評価点
  - メモ（入力されている場合）

**フロー**:
1. ラリー完了時にティア表ページへ遷移
2. アナリティクスイベント `tier_viewed` を自動送信（useEffect）
3. 「共有カードを作成」ボタンで共有ページへ

**TODO**:
- バックエンドAPIからラリー評価データを取得

---

### ✅ [#7] 共有カード（OGP画像プレビュー＋LINE共有）

**実装内容**:
- ティア表のビジュアルプレビューカード
- SNS共有機能（LINE、X/Twitter）
- リンクコピー機能
- OGP画像ダウンロード準備

**実装ファイル**:
```
src/app/rally/[id]/share/page.tsx
```

**機能詳細**:

#### プレビューカード
- グラデーション背景（blue→purple）
- ラリー名、地域・ジャンル表示
- 平均評価の強調表示
- ティア別スポット数とリスト

#### 共有機能

**LINE共有**:
```typescript
const handleShareLine = async () => {
  await analytics.shareClicked(rallyId, "line");
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(
    `${shareText}\n${shareUrl}`
  )}`;
  window.open(lineUrl, "_blank");
};
```

**X/Twitter共有**:
```typescript
const handleShareTwitter = async () => {
  await analytics.shareClicked(rallyId, "twitter");
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;
  window.open(twitterUrl, "_blank");
};
```

**リンクコピー**:
```typescript
const handleCopyLink = async () => {
  await analytics.shareClicked(rallyId, "link");
  navigator.clipboard.writeText(shareUrl);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

**共有テキスト**:
```
{ラリー名}を完走しました！
平均評価: {平均}/5.0

#TierMap
{ティア表URL}
```

**TODO**:
- バックエンドAPIでOGP画像生成実装
- 画像ダウンロード機能の実装

---

### ✅ [#8] 計測イベント送信（Supabase Logs）

**実装内容**:
- イベントトラッキングシステム
- 主要アクションの計測
- Supabase Logs連携準備

**実装ファイル**:
```
src/lib/analytics.ts
```

**計測イベント一覧**:

| イベント名 | トリガー | 送信データ |
|-----------|---------|-----------|
| `rally_started` | ラリー作成時 | rallyId |
| `spot_evaluated` | スポット評価時 | rallyId, spotId, rating |
| `rally_completed` | ラリー完了時 | rallyId |
| `tier_viewed` | ティア表表示時 | rallyId |
| `share_clicked` | 共有ボタンクリック時 | rallyId, shareType |

**実装方法**:
```typescript
export async function trackEvent(
  event: AnalyticsEvent,
  data?: EventData
): Promise<void> {
  const eventPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.log("Analytics Event:", eventPayload);

  // TODO: 実際のSupabase Logs APIまたはAnalyticsサービスに送信
  // await supabase.from('analytics_events').insert(eventPayload);
}
```

**便利なラッパー関数**:
```typescript
export const analytics = {
  rallyStarted: (rallyId: string) => trackEvent("rally_started", { rallyId }),
  spotEvaluated: (rallyId, spotId, rating) => trackEvent("spot_evaluated", { rallyId, spotId, rating }),
  rallyCompleted: (rallyId) => trackEvent("rally_completed", { rallyId }),
  tierViewed: (rallyId) => trackEvent("tier_viewed", { rallyId }),
  shareClicked: (rallyId, shareType) => trackEvent("share_clicked", { rallyId, shareType }),
};
```

**統合箇所**:
- ラリー作成完了時（`src/app/rally/create/page.tsx`）
- スポット評価保存時（`src/app/rally/[id]/evaluate/[spotId]/page.tsx`）
- ティア表表示時（`src/app/rally/[id]/tier/page.tsx`）
- 共有ボタンクリック時（`src/app/rally/[id]/share/page.tsx`）

**TODO**:
- Supabase クライアント設定
- analytics_events テーブル作成
- 実際のAPI呼び出し実装

---

## 📁 ディレクトリ構造

```
tier-map-frontend/
├── src/
│   ├── app/                              # App Router ページ
│   │   ├── api/
│   │   │   └── health/
│   │   │       └── route.ts              # [#1] ヘルスチェックAPI
│   │   ├── candidates/
│   │   │   └── page.tsx                  # [#3] 候補スポット一覧
│   │   ├── rally/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx              # ラリー詳細
│   │   │   │   ├── evaluate/
│   │   │   │   │   └── [spotId]/
│   │   │   │   │       └── page.tsx      # [#5] 評価画面
│   │   │   │   ├── tier/
│   │   │   │   │   └── page.tsx          # [#6] ティア表
│   │   │   │   └── share/
│   │   │   │       └── page.tsx          # [#7] 共有カード
│   │   │   └── create/
│   │   │       └── page.tsx              # [#4] ラリー作成
│   │   ├── rallies/
│   │   │   └── page.tsx                  # ラリー一覧
│   │   ├── search/
│   │   │   └── page.tsx                  # [#2] 検索画面
│   │   ├── layout.tsx                    # [#1] ルートレイアウト
│   │   ├── page.tsx                      # [#1] ホーム
│   │   ├── globals.css                   # [#1] グローバルスタイル
│   │   └── favicon.ico
│   ├── components/
│   │   ├── Header.tsx                    # [#1] 共通ヘッダー
│   │   ├── Footer.tsx                    # [#1] 共通フッター
│   │   ├── SpotMap.tsx                   # [#3] 地図コンポーネント
│   │   ├── SortableSpotList.tsx          # [#4] ドラッグ可能リスト
│   │   └── ui/                           # [#1] shadcn/ui コンポーネント
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── select.tsx
│   ├── lib/
│   │   ├── analytics.ts                  # [#8] イベントトラッキング
│   │   ├── google-places.ts              # [#3] Google Places API
│   │   ├── tier.ts                       # [#6] ティア算出ロジック
│   │   └── utils.ts                      # [#1] shadcn/ui ユーティリティ
│   └── types/
│       └── spot.ts                       # [#3] 型定義
├── public/                               # 静的ファイル
├── components.json                       # [#1] shadcn/ui 設定
├── package.json                          # 依存関係
├── tsconfig.json                         # TypeScript設定
├── next.config.ts                        # Next.js設定
├── postcss.config.mjs                    # PostCSS設定
├── eslint.config.mjs                     # ESLint設定
├── Backlog.md                            # Issue管理
├── PRD.md                                # 要件定義
└── IMPLEMENTATION.md                     # このファイル
```

---

## 🛠️ 技術スタック詳細

### フレームワーク・ライブラリ

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.0.1 | Reactフレームワーク（App Router） |
| React | 19.2.0 | UIライブラリ |
| TypeScript | ^5 | 型安全性 |
| Tailwind CSS | ^4 | スタイリング |
| shadcn/ui | 3.5.0 | UIコンポーネントライブラリ |
| @dnd-kit | latest | ドラッグ&ドロップ |

### 依存パッケージ

**本番環境**:
```json
{
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "next": "16.0.1",
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x",
  "class-variance-authority": "^0.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x"
}
```

**開発環境**:
```json
{
  "typescript": "^5",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "@tailwindcss/postcss": "^4",
  "tailwindcss": "^4",
  "eslint": "^9",
  "eslint-config-next": "16.0.1"
}
```

---

## 🎨 デザインシステム

### カラーパレット

```css
/* グローバル変数 (globals.css) */
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

### Tailwind カスタムカラー

| 用途 | クラス | 色 |
|------|--------|-----|
| プライマリ | `bg-blue-600` | #2563eb |
| 成功 | `bg-green-500` | #22c55e |
| 警告 | `bg-yellow-500` | #eab308 |
| エラー | `bg-red-500` | #ef4444 |
| ニュートラル | `bg-gray-500` | #6b7280 |

### タイポグラフィ

| 要素 | クラス | サイズ |
|------|--------|--------|
| 見出し1 | `text-4xl font-bold` | 2.25rem (36px) |
| 見出し2 | `text-3xl font-bold` | 1.875rem (30px) |
| 見出し3 | `text-2xl font-semibold` | 1.5rem (24px) |
| 見出し4 | `text-xl font-semibold` | 1.25rem (20px) |
| 本文 | `text-base` | 1rem (16px) |
| 小さい文字 | `text-sm` | 0.875rem (14px) |

### スペーシング

- コンテナ: `container mx-auto px-4`
- セクション間: `py-8` または `py-12`
- 要素間: `space-y-4` または `gap-4`

---

## 🔄 ユーザーフロー

### 1. ラリー作成フロー

```
ホーム (/)
  ↓ 「スポットを探す」クリック
検索画面 (/search)
  ↓ 地域・ジャンル選択して「探す」
候補一覧 (/candidates?region=...&genre=...)
  ↓ 3〜5件選択して「ラリーを作成」
ラリー作成 (/rally/create?spots=...)
  ↓ 順序調整して「保存」
  ↓ [イベント: rally_started]
ラリー詳細 (/rally/{id})
```

### 2. 評価フロー

```
ラリー詳細 (/rally/{id})
  ↓ 各スポットの「評価する」ボタン
評価画面 (/rally/{id}/evaluate/{spotId})
  ↓ ★評価とメモ入力して「保存」
  ↓ [イベント: spot_evaluated]
ラリー詳細に戻る
  ↓ 全スポット評価完了
  ↓ [イベント: rally_completed]
  ↓ 「ティア表を見る」ボタン表示
ティア表 (/rally/{id}/tier)
  ↓ [イベント: tier_viewed]
```

### 3. 共有フロー

```
ティア表 (/rally/{id}/tier)
  ↓ 「共有カードを作成」
共有ページ (/rally/{id}/share)
  ↓ LINE/Twitter/リンクコピー選択
  ↓ [イベント: share_clicked]
外部サービスへ共有
```

---

## 🔌 API統合ポイント（TODO）

### 1. Google Places API

**ファイル**: `src/lib/google-places.ts`

```typescript
// 現在の実装（モック）
export async function searchSpots(region: string, genre: string): Promise<Spot[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return mockSpots;
}

// 実装すべき内容
export async function searchSpots(region: string, genre: string): Promise<Spot[]> {
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
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 2. ラリー CRUD API

**必要なエンドポイント**:

```typescript
// POST /api/rallies - ラリー作成
interface CreateRallyRequest {
  name: string;
  region: string;
  genre: string;
  spots: Spot[];
}

// GET /api/rallies - ラリー一覧取得
interface ListRalliesResponse {
  rallies: Rally[];
}

// GET /api/rallies/{id} - ラリー詳細取得
interface GetRallyResponse {
  rally: Rally;
  evaluations: SpotEvaluation[];
}

// PUT /api/rallies/{id} - ラリー更新
interface UpdateRallyRequest {
  name?: string;
  status?: "draft" | "in_progress" | "completed";
}
```

**統合箇所**:
- `src/app/rally/create/page.tsx` - ラリー作成
- `src/app/rallies/page.tsx` - ラリー一覧
- `src/app/rally/[id]/page.tsx` - ラリー詳細

### 3. 評価 API

**必要なエンドポイント**:

```typescript
// POST /api/rallies/{rallyId}/evaluations
interface CreateEvaluationRequest {
  spotId: string;
  rating: number;
  memo?: string;
  visitedAt: string;
}

// GET /api/rallies/{rallyId}/evaluations
interface ListEvaluationsResponse {
  evaluations: SpotEvaluation[];
}
```

**統合箇所**:
- `src/app/rally/[id]/evaluate/[spotId]/page.tsx`

### 4. ティア算出 API（オプション）

**ファイル**: `src/lib/tier.ts`

現在はクライアントサイドで算出していますが、バックエンドで算出する場合:

```typescript
// GET /api/rallies/{id}/tier
interface GetTierResponse {
  averageRating: number;
  tiers: {
    S: TierSpot[];
    A: TierSpot[];
    B: TierSpot[];
  };
}
```

### 5. 共有画像生成 API

**必要なエンドポイント**:

```typescript
// POST /api/rallies/{id}/generate-ogp
interface GenerateOGPRequest {
  rallyId: string;
}

interface GenerateOGPResponse {
  imageUrl: string;
}
```

**統合箇所**:
- `src/app/rally/[id]/share/page.tsx` - `handleDownloadImage`

### 6. Supabase Analytics

**ファイル**: `src/lib/analytics.ts`

```typescript
// Supabase クライアント設定
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function trackEvent(
  event: AnalyticsEvent,
  data?: EventData
): Promise<void> {
  const eventPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    url: window.location.href,
  };

  await supabase.from('analytics_events').insert(eventPayload);
}
```

**必要な環境変数**:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**必要なテーブル**:
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

CREATE INDEX idx_analytics_events_event ON analytics_events(event);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
```

---

## 🚀 ビルド・デプロイ

### ローカル開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動 (http://localhost:3000)
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Linter実行
npm run lint
```

### 環境変数（.env.local）

```env
# Google Maps
GOOGLE_MAPS_API_KEY=your_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# バックエンドAPI（必要に応じて）
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

### ビルド結果

```
Route (app)
┌ ○ /                              # 静的
├ ○ /_not-found                    # 静的
├ ƒ /api/health                    # 動的API
├ ○ /candidates                    # 静的
├ ○ /rallies                       # 静的
├ ƒ /rally/[id]                    # 動的
├ ƒ /rally/[id]/evaluate/[spotId]  # 動的
├ ƒ /rally/[id]/share              # 動的
├ ƒ /rally/[id]/tier               # 動的
├ ○ /rally/create                  # 静的
└ ○ /search                        # 静的

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

### Vercel デプロイ

```bash
# Vercel CLIインストール
npm i -g vercel

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

**必須設定**:
1. 環境変数を Vercel ダッシュボードで設定
2. Root Directory: `tier-map-frontend`（必要に応じて）
3. Build Command: `npm run build`
4. Output Directory: `.next`

---

## 📊 パフォーマンス最適化

### 実装済み

1. **画像最適化**: Next.js の Image コンポーネント使用準備
2. **コード分割**: App Router による自動コード分割
3. **Suspense境界**: ローディング状態の適切な管理
4. **動的インポート**: アナリティクスライブラリの遅延ロード

### 今後の改善案

1. **ISR（Incremental Static Regeneration）**: ラリー詳細ページで実装
2. **画像最適化**: WebP形式、適切なサイズ設定
3. **キャッシング**: React Query または SWR 導入
4. **バンドルサイズ削減**: 未使用コンポーネントの削除

---

## 🧪 テスト戦略（未実装）

### 推奨テストフレームワーク

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev cypress # E2Eテスト
```

### テストカバレッジ目標

| レイヤー | ツール | カバレッジ目標 |
|---------|--------|--------------|
| ユニットテスト | Jest | 80%以上 |
| コンポーネントテスト | React Testing Library | 70%以上 |
| E2Eテスト | Cypress | 主要フロー |

### 優先度の高いテスト

1. ティア算出ロジック（`src/lib/tier.ts`）
2. ドラッグ&ドロップ機能（`src/components/SortableSpotList.tsx`）
3. 評価フロー（`/rally/[id]/evaluate/[spotId]`）
4. 共有機能（`/rally/[id]/share`）

---

## 🔒 セキュリティ

### 実装済み

1. **TypeScript**: 型安全性による脆弱性低減
2. **Next.js**: XSS対策（自動エスケープ）
3. **環境変数**: APIキーの適切な管理

### 今後の対策

1. **CSP（Content Security Policy）**: next.config.ts で設定
2. **CSRF対策**: バックエンドAPI連携時に実装
3. **Rate Limiting**: APIエンドポイントで実装
4. **認証・認可**: ユーザー機能追加時に実装

---

## 📝 コーディング規約

### TypeScript

- すべての関数に型注釈を付与
- `any` 型の使用を避ける
- インターフェースは `interface` を優先
- コンポーネントのProps は必ず型定義

### React

- 関数コンポーネントを使用
- カスタムフックで状態管理ロジックを分離
- `"use client"` ディレクティブを適切に使用
- Suspense境界で非同期処理を囲む

### CSS（Tailwind）

- ユーティリティファーストアプローチ
- カスタムCSSは最小限に
- レスポンシブデザインは `sm:`, `md:`, `lg:` プレフィックス
- カラーはTailwindパレットを使用

### ファイル命名

- コンポーネント: PascalCase（`Header.tsx`）
- ページ: snake_case（`page.tsx`）
- ユーティリティ: camelCase（`analytics.ts`）

---

## 🐛 既知の問題・制約

### 1. Google Maps未統合

**現状**: プレースホルダー表示
**影響**: 地図機能が正常に動作しない
**対応**: Google Maps API統合が必要

### 2. モックデータ使用

**現状**: すべてのデータがハードコード
**影響**: 実際のデータ永続化ができない
**対応**: バックエンドAPI統合が必要

### 3. 認証機能なし

**現状**: ユーザー識別なし
**影響**: マルチユーザー対応不可
**対応**: NextAuth.js または Supabase Auth 導入

### 4. オフライン対応なし

**現状**: ネットワーク必須
**影響**: オフライン時に使用不可
**対応**: Service Worker + Cache API 実装

### 5. 画像アップロード未対応

**現状**: プレースホルダー画像のみ
**影響**: ユーザー独自の写真を追加できない
**対応**: 画像アップロード機能の追加

---

## 📚 参考リソース

### 公式ドキュメント

- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [dnd-kit](https://docs.dndkit.com/)

### 関連Issue・PRD

- `Backlog.md`: GitHub Issue一覧
- `PRD.md`: プロダクト要件定義書

---

## 🎉 まとめ

### 実装完了した機能（8/8）

✅ プロジェクト初期化
✅ ホーム画面：地域×ジャンル選択
✅ 候補スポット一覧＋ミニ地図
✅ ラリー作成・編集（D&D対応）
✅ 評価画面（★1〜5／メモ）
✅ ティア表（S/A/B）表示
✅ 共有カード（SNS連携）
✅ 計測イベント送信

### 次のステップ

1. **バックエンドAPI統合**
   - Google Places API
   - ラリー・評価データの永続化
   - Supabase Analytics

2. **機能追加**
   - ユーザー認証
   - ラリーの検索・フィルター
   - コメント・いいね機能
   - ランキング機能

3. **UI/UX改善**
   - ローディングアニメーション
   - エラーハンドリングの強化
   - アクセシビリティ対応
   - モバイル最適化

4. **パフォーマンス最適化**
   - 画像最適化
   - キャッシング戦略
   - バンドルサイズ削減

---

**作成日**: 2025年10月31日
**バージョン**: 1.0.0
**ビルドステータス**: ✅ 成功

