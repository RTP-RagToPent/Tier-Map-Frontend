# Contributing Guide

Tier Map プロジェクトへのコントリビューションガイドです。

## 🏗️ アーキテクチャ

このプロジェクトは **Features-Based Architecture** を採用しています。

### ディレクトリ構成

```
src/
├── app/                    # Next.js App Router（ページ定義のみ）
├── features/               # 機能別モジュール（完全独立）
│   ├── search/            # スポット検索機能
│   ├── candidates/        # 候補スポット一覧・選択
│   ├── rally/             # ラリー作成・管理
│   ├── evaluation/        # スポット評価
│   ├── tier/              # ティア表生成・表示
│   └── share/             # 共有機能
└── shared/                 # 共通リソース
    ├── components/        # 共通UIコンポーネント
    ├── hooks/             # 共通カスタムフック
    ├── lib/               # ユーティリティ・API呼び出し
    ├── types/             # 共通型定義
    └── constants/         # 共通定数
```

## 📐 設計ルール

### 1. 依存関係の制限

**✅ 許可される import**:

```typescript
// features → shared
import { Button } from '@shared/components/ui/button';
import { useDebounce } from '@shared/hooks/useDebounce';

// app → features
import { SearchForm } from '@features/search/components/SearchForm';

// shared → shared
import { cn } from '@shared/lib/utils';
```

**❌ 禁止される import**:

```typescript
// features → features (NG!)
import { RallyCard } from '@features/rally/components/RallyCard';

// shared → features (NG!)
import { SearchForm } from '@features/search/components/SearchForm';
```

ESLint の `boundaries` プラグインがこれらを自動検出します。

### 2. Feature の構成

各 feature は以下の構造を持ちます（必要なもののみ）：

```
features/<feature-name>/
├── components/        # UIコンポーネント
├── hooks/             # カスタムフック
├── types/             # 型定義
├── constants/         # 定数
└── lib/               # ビジネスロジック・API呼び出し
```

**注意**: Barrel Export（index.ts）は使用しません。直接 import します。

### 3. Server/Client Component の分離

```typescript
// ✅ Server Component（デフォルト）
// ページやデータ取得が必要なコンポーネント
export async function RallyList() {
  const rallies = await getRallies(); // Server側でデータ取得
  return <div>{/* ... */}</div>;
}

// ✅ Client Component（必要時のみ）
// State やイベントハンドラが必要な場合
('use client');

import { useState } from 'react';

export function SearchForm() {
  const [data, setData] = useState();
  // ...
}
```

## 📝 命名規則

### ファイル名

| 種類           | 形式           | 例                                   |
| -------------- | -------------- | ------------------------------------ |
| コンポーネント | PascalCase.tsx | `SearchForm.tsx`, `RallyCard.tsx`    |
| フック         | camelCase.ts   | `useSearchForm.ts`, `useDebounce.ts` |
| 型定義         | camelCase.ts   | `search.ts`, `rally.ts`              |
| 定数           | camelCase.ts   | `genres.ts`, `routes.ts`             |
| ユーティリティ | camelCase.ts   | `formatDate.ts`, `validation.ts`     |

### 変数・関数名

```typescript
// ✅ Good
const GENRES = ['ラーメン', 'カフェ']; // 定数: UPPER_SNAKE_CASE
const userCount = 10; // 変数: camelCase
function getUserName() {} // 関数: camelCase
interface User {} // 型: PascalCase
type UserId = string; // 型エイリアス: PascalCase

// ❌ Bad
const Genres = [...]; // 定数が PascalCase
const user_count = 10; // snake_case
function GetUserName() {} // 関数が PascalCase
```

## 🔨 新機能の追加手順

### 1. Feature ディレクトリを作成

```bash
mkdir -p src/features/<feature-name>/{components,hooks,types,constants,lib}
```

### 2. 型定義を作成

```typescript
// src/features/<feature-name>/types/<domain>.ts
export interface Example {
  id: string;
  name: string;
}
```

### 3. コンポーネントを実装

```typescript
// src/features/<feature-name>/components/ExampleForm.tsx
'use client'; // 必要な場合のみ

import { Button } from '@shared/components/ui/button';

export function ExampleForm() {
  // ...
}
```

### 4. app/ ページから使用

```typescript
// src/app/example/page.tsx
import { ExampleForm } from '@features/<feature-name>/components/ExampleForm';

export default function ExamplePage() {
  return <ExampleForm />;
}
```

## 🧪 テスト

### ユニットテスト

```bash
# テストファイル命名: *.test.ts または *.spec.ts
src/features/search/hooks/useSearchForm.test.ts
```

### E2E テスト

```bash
# Cypress を使用
npm run cypress:open
```

## 📦 Import の順序

ESLint が自動で以下の順序に整形します：

```typescript
// 1. React
import { useState } from 'react';

// 2. 外部ライブラリ
import { z } from 'zod';

// 3. @shared
import { Button } from '@shared/components/ui/button';
import { ROUTES } from '@shared/constants/routes';

// 4. @features
import { SearchForm } from '@features/search/components/SearchForm';

// 5. 相対 import
import { useLocalHook } from './useLocalHook';
import type { LocalType } from './types';
```

## 🚀 開発フロー

### 1. ブランチ作成

```bash
git checkout -b feature/<feature-name>
# または
git checkout -b fix/<bug-description>
```

### 2. 開発

```bash
npm run dev
```

### 3. Lint チェック

```bash
npm run lint
```

### 4. ビルド確認

```bash
npm run build
```

### 5. プルリクエスト作成

- タイトル: `[Feature] 〇〇機能の追加` または `[Fix] 〇〇のバグ修正`
- 説明: 変更内容と理由を記載
- レビュワーを指定

## ⚠️ よくある間違い

### 1. features 間の直接 import

```typescript
// ❌ Bad
import { RallyCard } from '@features/rally/components/RallyCard';

// ✅ Good - shared/types 経由で型を共有
import type { Rally } from '@shared/types/spot';
```

### 2. Client Component で Server 処理

```typescript
// ❌ Bad
'use client';

import { supabase } from '@shared/lib/server/supabase/client';

export function MyComponent() {
  // Server側の処理を Client で実行してしまう
}

// ✅ Good - Server Component でデータ取得
// app/page.tsx
async function getData() {
  const data = await supabase.from('table').select();
  return data;
}

export default async function Page() {
  const data = await getData();
  return <ClientComponent data={data} />;
}
```

### 3. Barrel Export の使用

```typescript
// ❌ Bad - index.ts を作成しない
// src/features/search/index.ts
export * from './components/SearchForm';

// ✅ Good - 直接 import
import { SearchForm } from '@features/search/components/SearchForm';
```

## 📚 参考リソース

- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [ESLint Plugin Boundaries](https://github.com/javierbrea/eslint-plugin-boundaries)

## 💬 質問・相談

- Issue を作成
- Pull Request のコメント欄で質問
- チームの Slack チャンネル

---

**Happy Coding! 🎉**
