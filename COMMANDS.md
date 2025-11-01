# よく使うコマンドリファレンス

## 🚀 クイックスタート

### 初回セットアップ（全自動）
```bash
# セットアップスクリプト実行
./scripts/setup.sh
```

### 手動セットアップ
```bash
# 1. 環境変数設定
cp .env.example .env

# 2. Docker環境起動
docker-compose up -d

# 3. データベース初期化
docker-compose exec backend npx prisma db push

# 4. Seedデータ投入（seed.ts作成後）
docker-compose exec backend npx prisma db seed
```

## 🐳 Docker操作

### 基本操作
```bash
# 起動
docker-compose up -d

# 停止
docker-compose down

# 再起動
docker-compose restart

# ログ確認
docker-compose logs -f
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres

# 完全リセット（データも削除）
docker-compose down -v
```

### ビルド関連
```bash
# イメージ再ビルド
docker-compose build

# キャッシュなしでビルド
docker-compose build --no-cache

# 特定サービスのみビルド
docker-compose build frontend
```

## 💾 データベース操作

### Prisma CLI
```bash
# Prisma Studio起動（GUI）
docker-compose exec backend npx prisma studio

# スキーマをDBに反映（開発用）
docker-compose exec backend npx prisma db push

# マイグレーション作成（本番用）
docker-compose exec backend npx prisma migrate dev --name <migration-name>

# マイグレーション実行
docker-compose exec backend npx prisma migrate deploy

# データベースリセット
docker-compose exec backend npx prisma migrate reset

# Prismaクライアント再生成
docker-compose exec backend npx prisma generate
```

### PostgreSQL直接操作
```bash
# PostgreSQLに接続
docker-compose exec postgres psql -U postgres -d ital_cafe

# バックアップ
docker-compose exec postgres pg_dump -U postgres ital_cafe > backup.sql

# リストア
docker-compose exec postgres psql -U postgres ital_cafe < backup.sql
```

## 🎨 フロントエンド開発

### Next.js操作
```bash
# 開発サーバー起動（Docker内）
docker-compose up frontend

# ローカル開発（Docker外）
cd frontend
npm install
npm run dev

# ビルド
npm run build

# 本番起動
npm start

# Lint実行
npm run lint
```

### Storybook
```bash
# Storybook起動
cd frontend
npm run storybook

# ビルド
npm run build-storybook
```

### コンポーネント作成
```bash
# shadcn/uiコンポーネント追加
cd frontend
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

## 🔧 バックエンド開発

### Hono.js操作
```bash
# 開発サーバー起動（Docker内）
docker-compose up backend

# ローカル開発（Docker外）
cd backend
npm install
npm run dev

# ビルド
npm run build

# 本番起動
npm start

# Lint実行
npm run lint
```

### API テスト
```bash
# ヘルスチェック
curl http://localhost:8787/health

# 商品一覧取得
curl http://localhost:8787/api/products

# ログイン（要ユーザー作成）
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

## 📝 Git操作

### ブランチ操作
```bash
# 機能ブランチ作成
git checkout -b feature/customer-ui

# 修正ブランチ作成
git checkout -b fix/session-timeout

# マージ
git checkout main
git merge feature/customer-ui
```

### コミット規約
```bash
# 機能追加
git commit -m "feat: 商品一覧画面を実装"

# バグ修正
git commit -m "fix: セッションタイムアウト処理を修正"

# ドキュメント
git commit -m "docs: READMEを更新"

# リファクタリング
git commit -m "refactor: APIクライアントを整理"
```

## 🔍 デバッグ・トラブルシューティング

### ログ確認
```bash
# リアルタイムログ
docker-compose logs -f

# エラーのみ表示
docker-compose logs -f | grep ERROR

# タイムスタンプ付き
docker-compose logs -t -f
```

### プロセス確認
```bash
# コンテナ状態確認
docker-compose ps

# リソース使用状況
docker stats

# ネットワーク確認
docker network ls
docker network inspect ital-cafe_ital-cafe-network
```

### キャッシュクリア
```bash
# Next.jsキャッシュクリア
rm -rf frontend/.next
docker-compose restart frontend

# node_modulesクリア
rm -rf frontend/node_modules backend/node_modules
docker-compose build --no-cache
```

## 🚢 デプロイ準備

### 本番ビルド
```bash
# 本番用イメージビルド
docker-compose -f docker-compose.prod.yml build

# 環境変数確認
cat .env.production

# マイグレーション実行
docker-compose exec backend npx prisma migrate deploy
```

### ヘルスチェック
```bash
# 全サービス確認
curl http://localhost:8787/health
curl http://localhost:3000
```

## 📊 パフォーマンス測定

### ビルドサイズ確認
```bash
# Next.jsバンドルサイズ
cd frontend && npm run build
# .next/analyze/client.html を確認

# Dockerイメージサイズ
docker images | grep ital-cafe
```

### 応答速度測定
```bash
# API応答速度
time curl http://localhost:8787/api/products

# 負荷テスト（Apache Bench）
ab -n 100 -c 10 http://localhost:8787/health
```

---

## ⚡ エイリアス設定（推奨）

`.bashrc`や`.zshrc`に追加：
```bash
# Ital Cafe shortcuts
alias dc='docker-compose'
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcexec='docker-compose exec'
alias prisma-studio='docker-compose exec backend npx prisma studio'
alias prisma-push='docker-compose exec backend npx prisma db push'
```

---

**最終更新**: 2025-11-01 11:37 JST
