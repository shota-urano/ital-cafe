# Ital Cafe - カフェオーダーシステム

自然モチーフのカフェ向け注文・管理システム

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **バックエンド**: Hono.js, Prisma ORM, TypeScript
- **データベース**: PostgreSQL 16
- **開発環境**: Docker Compose

## セットアップ

### 必要な環境

- Docker Desktop (Docker Compose含む)
- Node.js 20+ (ローカル開発用、オプション)
- Git

### 初回セットアップ

1. リポジトリのクローン
```bash
git clone <repository-url>
cd ital-cafe
```

2. 環境変数の設定
```bash
cp .env.example .env
# 必要に応じて .env を編集
```

3. Docker環境の起動
```bash
docker-compose up -d
```

4. データベースのマイグレーション
```bash
# コンテナ内でPrismaマイグレーション実行
docker-compose exec backend npx prisma migrate dev
```

5. アクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8787
- データベース: localhost:5432 (postgres/postgres)

## 開発

### Docker環境での開発

```bash
# 全サービス起動
docker-compose up

# バックグラウンドで起動
docker-compose up -d

# ログ確認
docker-compose logs -f [service-name]

# 停止
docker-compose down

# 完全リセット（ボリューム含む）
docker-compose down -v
```

### ローカル開発（オプション）

フロントエンド:
```bash
cd frontend
npm install
npm run dev
```

バックエンド:
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### データベース管理

```bash
# Prisma Studio起動
docker-compose exec backend npx prisma studio

# マイグレーション作成
docker-compose exec backend npx prisma migrate dev --name <migration-name>

# データベースリセット
docker-compose exec backend npx prisma migrate reset
```

## プロジェクト構造

```
ital-cafe/
├── frontend/          # Next.js フロントエンド
├── backend/           # Hono.js バックエンド
├── docker/           # Docker設定ファイル
├── docs/             # ドキュメント
├── desing-html/      # デザインHTML参考
└── docker-compose.yml
```

## 主な機能

- QRコード注文システム（ログイン不要）
- 商品・セット商品管理
- トッピング管理
- 注文・会計管理
- テーブル管理
- アナリティクス
- LINE Notify連携（日報送信）

## ライセンス

Private
