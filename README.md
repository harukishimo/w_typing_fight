# Type Fighter - タイピング対戦ゲーム

イベント会場向けの2人対戦型タイピングゲーム。

## 技術スタック

### フロントエンド
- **React + Vite + TypeScript**
- **Tailwind CSS** - UIスタイリング
- **Zustand** - 状態管理
- **Framer Motion** - アニメーション
- **howler.js** - 効果音
- デプロイ: Cloudflare Pages

### バックエンド
- **Cloudflare Workers + Durable Objects** - WebSocketリアルタイム通信
- **Supabase (PostgreSQL)** - データ永続化

## プロジェクト構成

```
w_typing_fight/
├── web/           # フロントエンド (React + Vite)
├── workers/       # Cloudflare Workers + Durable Objects
├── shared/        # 共通型定義・ユーティリティ
└── docs/          # 仕様書・ドキュメント
```

## セットアップ

### 前提条件
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### インストール

```bash
# 依存関係のインストール
pnpm install
```

### 開発サーバー起動

```bash
# 全サービスを並行起動
pnpm dev

# または個別に起動
pnpm web:dev      # フロントエンドのみ
pnpm workers:dev  # Workersのみ
```

### ビルド

```bash
pnpm build
```

## 開発ガイド

### 型定義の共有

`shared/` パッケージを通じて、フロントエンド・バックエンド間で型を共有しています。

```typescript
// web/ または workers/ から
import { Difficulty, DIFFICULTY_CONFIG, calculateDamage } from 'shared';
```

### Path Aliases

以下のエイリアスが設定されています：

```typescript
// web/ 内
import Component from '@/components/Component';
import { Difficulty } from 'shared';

// workers/ 内
import { PlayerState } from 'shared';
```

## ドキュメント

- [ダメージ計算ロジック仕様書](./docs/damage-calculation-spec.md)
- [プロジェクト概要](./description.md)

## ライセンス

MIT
