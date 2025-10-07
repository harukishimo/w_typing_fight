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

### Supabase 認証設定

Supabase を利用した Google ログインを有効化するには、以下の環境変数を `web` アプリ（Cloudflare Pages の環境変数、またはローカル開発時の `.env` ファイル）に設定してください。

```bash
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Supabase ダッシュボードでは Google プロバイダーを有効化し、**リダイレクト URL** に `https://{アプリのドメイン}/auth/callback` を登録します。ローカル開発では `http://localhost:5173/auth/callback` を追加してください。

ログインしていなくてもソロ練習・オンライン対戦は利用できますが、ランキングに名前を登録するには上記のログインが必要になります。

### 連勝ランキング用のデータベース

ローカルで Supabase CLI を使用している場合は、ルートに追加した `supabase/migrations/0001_leaderboard_win_streaks.sql` を適用すると、以下のテーブル／ビューが作成されます。

- `profiles`: ユーザーごとの表示名（NickName）管理
- `matches`: 対戦結果（勝者・敗者）ログ
- `user_streaks`: 連勝数の集計テーブル（トリガーで自動更新）
- `v_leaderboard_streaks`: 連勝ランキング表示用ビュー

Supabase CLI を利用している場合は `supabase migrate up` で反映できます。Cloudflare Workers などバックエンドから対戦結果を登録する際は、Service Role キーで `matches` テーブルへ INSERT し、トリガーによって `user_streaks` が更新されます。

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
