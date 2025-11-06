# モバイルレスポンシブ対応とAPI改善

## 概要
スマートフォンでの利用を想定したレスポンシブデザインの実装、Google Maps APIキーの統一、モックデータの削除を行いました。

## 主な変更内容

### 1. モバイルレスポンシブ対応

#### ヘッダーナビゲーション
- **新規作成**: `MobileHeader.tsx` - ハンバーガーメニュー付きモバイルヘッダー
- **変更**: `Header.tsx` - デスクトップ/モバイルで表示を分離
- メニュー内に閉じるボタンを追加し、ヘッダー全体を覆うレイアウトに変更

#### UIコンポーネントの最適化
- **`button.tsx`**: 最小タップ領域を44x44pxに設定（モバイル対応）
- **`layout.tsx`**: viewportメタタグを追加してモバイル表示を最適化

#### ページコンポーネントのレスポンシブ対応
以下のページでフォントサイズ、パディング、レイアウトをモバイル向けに調整：
- ホームページ (`page.tsx`)
- 検索ページ (`search/page.tsx`)
- ラリー一覧 (`rallies/page.tsx`)
- ラリー作成 (`rallies/create/page.tsx`)
- ラリー詳細 (`RallyDetailView.tsx`)
- ティア表 (`rallies/[id]/tier/page.tsx`)
- 共有ページ (`rallies/[id]/share/page.tsx`)
- 評価フォーム (`EvaluationForm.tsx`)
- ログインフォーム (`LoginContent.tsx`)

#### 地図表示の改善
- **`CandidatesList.tsx`**:
  - モバイルで地図を上部に固定（`sticky top-16`）
  - スポットリストをスクロール可能に
  - ボタンを下部に固定（`sticky bottom-0`）
- **`SpotMap.tsx`**: エラーメッセージを削除（プレースホルダー表示時）

### 2. Google Maps APIキーの統一

- **`api/spots/route.ts`**: `GOOGLE_MAPS_API_KEY` → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` に統一
- サーバーサイドとクライアントサイドで同じ環境変数名を使用

### 3. モックデータの削除

以下のファイルからモックデータとフォールバック処理を削除：
- **`google-places.ts`**: `getMockSpots` 関数を削除、エラー時は空配列を返す
- **`useRallies.ts`**: `getMockRallies` 関数を削除、エラー時は空配列を返す
- **`useRallyShare.ts`**: `getMockShareData` 関数を削除、エラー時は適切に処理
- **`useCreateRally.ts`**: モックスポットデータ生成を削除、実際のAPIから取得するように変更
- **`useEvaluation.ts`**: モックモードのログを削除、API未設定時はエラーをスロー

## 技術的な変更

### レスポンシブデザイン
- Tailwind CSSのブレークポイント（`sm:`, `md:`, `lg:`）を活用
- タッチデバイス向けの最小タップ領域（44x44px）を確保
- フォントサイズを16px以上に設定してiOSの自動ズームを防止

### レイアウト改善
- モバイル: 縦並びレイアウト（`flex-col`）
- デスクトップ: 横並びレイアウト（`grid grid-cols-2`）
- 地図の固定表示（`sticky`）でスクロール時の視認性を向上

## 影響範囲

### 新規ファイル
- `src/shared/components/layout/MobileHeader.tsx`

### 変更ファイル
- 23ファイルの修正

## テスト項目

- [ ] モバイル（375px幅）での表示確認
- [ ] タブレット（768px幅）での表示確認
- [ ] デスクトップ（1024px以上）での表示確認
- [ ] ハンバーガーメニューの開閉動作
- [ ] 地図の固定表示とスクロール動作
- [ ] Google Maps APIキーが正しく読み込まれること
- [ ] モックデータが表示されないこと

## 関連Issue
- モバイルレスポンシブ対応 (#26)

