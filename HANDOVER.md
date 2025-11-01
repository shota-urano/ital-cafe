# プロジェクト引継ぎドキュメント

## プロジェクト概要
**プロジェクト名**: Ital Cafe - カフェオーダーシステム  
**作成日時**: 2025-11-01  
**要件定義**: `/docs/requirements-v1.0.md`

### システム概要
- QRコードベースの注文システム（ログイン不要）
- 管理画面での商品・注文・分析管理
- セット商品対応、税率変更予約機能
- LINE Notify連携

## 技術スタック
- **フロントエンド**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **バックエンド**: Hono.js + Prisma ORM + TypeScript
- **データベース**: PostgreSQL 16
- **開発環境**: Docker Compose

## 完了済みタスク ✅

### 1. 環境構築 
- [x] Docker環境の構築 (`docker-compose.yml`)
- [x] PostgreSQL設定（初期化スクリプト含む）
- [x] 環境変数テンプレート (`.env.example`)

### 2. フロントエンド基盤
- [x] Next.js 15プロジェクト初期化
- [x] TypeScript設定
- [x] Tailwind CSS設定（自然モチーフのカラーパレット適用）
- [x] 基本的なディレクトリ構造
- [x] Providers設定（React Query、Theme）
- [x] グローバルスタイル設定

### 3. バックエンド基盤
- [x] Hono.jsサーバー初期化
- [x] Prismaスキーマ定義（全データモデル実装）
- [x] 基本的なAPIルート実装：
  - `/health` - ヘルスチェック
  - `/api/auth` - 認証（login/logout/verify）
  - `/api/products` - 商品管理
  - `/api/orders` - 注文管理
  - `/api/tables` - テーブル管理
- [x] CORS、Logger、エラーハンドリングミドルウェア

### 4. データベース設計
- [x] 全テーブル定義完了（Product、Order、SessionToken、Tax等）
- [x] セット商品対応（SetComponent）
- [x] リレーション設定完了

## 未完了タスク 📋

### 優先度: 高 🔴
- [ ] **初期データ投入スクリプト** (`/backend/prisma/seed.ts`)
  - 管理者ユーザー作成
  - サンプルテーブル作成
  - サンプル商品・トッピング作成
  - 税率初期設定

- [ ] **お客様用画面実装** (`/frontend/src/app/(customer)/*`)
  - [ ] QRコードスキャン画面 (`/t/[token]`)
  - [ ] トップページ（おすすめ表示）
  - [ ] 商品一覧・検索
  - [ ] 商品詳細モーダル
  - [ ] セットビルダー
  - [ ] カート機能
  - [ ] 注文完了画面

### 優先度: 中 🟡
- [ ] **管理画面実装** (`/frontend/src/app/admin/*`)
  - [ ] ログイン画面
  - [ ] ダッシュボード
  - [ ] 注文管理（リアルタイム更新）
  - [ ] 商品管理CRUD
  - [ ] セット商品管理
  - [ ] トッピング管理
  - [ ] テーブル管理・QR発行

- [ ] **共通UIコンポーネント** (`/frontend/src/components/*`)
  - [ ] デザインHTMLを参考にしたコンポーネント化
  - [ ] Storybook設定・ストーリー作成

### 優先度: 低 🟢
- [ ] **追加機能**
  - [ ] LINE Notify連携
  - [ ] アナリティクス実装
  - [ ] 画像最適化（WebP/AVIF）
  - [ ] 葉の落下アニメーション
  - [ ] 音通知機能

## 現在の環境状態

### ディレクトリ構造
```
ital-cafe/
├── frontend/          ✅ 初期設定完了
│   ├── src/
│   │   ├── app/      ✅ 基本レイアウト実装済
│   │   ├── components/ 📋 未実装
│   │   └── lib/      📋 未実装
│   └── package.json  ✅ 依存関係定義済
├── backend/          ✅ 初期設定完了
│   ├── src/
│   │   ├── routes/   ✅ 基本API実装済
│   │   └── db/       📋 Seed未実装
│   └── prisma/       ✅ スキーマ定義済
├── docker/           ✅ Docker設定完了
├── docs/             ✅ 要件定義・ルール文書
├── desing-html/      ✅ デザイン参考HTML
└── docker-compose.yml ✅ 設定完了
```

## 次の実装ステップ（推奨順序）

### Step 1: データベース初期化
```bash
# Prisma マイグレーション実行
docker-compose exec backend npx prisma db push

# Seed データ作成・実行
# backend/prisma/seed.ts を作成後
docker-compose exec backend npx prisma db seed
```

### Step 2: お客様用画面の基本実装
1. セッション管理フック作成
2. API通信層実装（axios wrapper）
3. QRスキャン → セッション発行フロー
4. 商品一覧・詳細表示

### Step 3: 管理画面の基本実装
1. 認証ガード実装
2. 管理画面レイアウト
3. 商品CRUD機能

## 動作確認チェックリスト

### 環境起動確認
```bash
# Docker環境起動
docker-compose up -d

# 確認項目
□ PostgreSQL起動確認 (port 5432)
□ Backend API起動確認 (http://localhost:8787)
□ Frontend起動確認 (http://localhost:3000)
□ ヘルスチェック成功 (http://localhost:8787/health)
```

### データベース確認
```bash
# Prisma Studio起動
docker-compose exec backend npx prisma studio

# 確認項目
□ 全テーブル作成確認
□ リレーション確認
```

### API動作確認
```bash
# ヘルスチェック
curl http://localhost:8787/health

# 確認項目
□ Health API: 200 OK
□ Products API: 動作確認
□ Auth API: 動作確認（初期ユーザー作成後）
```

## 重要な注意事項

### 開発ルール
1. **デザイン忠実性**: `/desing-html`のデザインを忠実に再現
2. **コンポーネント化**: 再利用可能な部分は共通化
3. **Storybook**: 全コンポーネントを登録
4. **ベストプラクティス**: 
   - Next.js: `/docs/rules/nextjs-best-practices.md`
   - Hono.js: `/docs/rules/honojs-best-practices.md`
5. **日本語対応**: レスポンスは日本語で

### セキュリティ考慮事項
- SessionToken: 60分有効
- JWT Secret: 本番環境では必ず変更
- CORS設定: 本番環境では適切に制限
- 環境変数: `.env`ファイルは絶対にコミットしない

## トラブルシューティング

### Docker関連
```bash
# コンテナログ確認
docker-compose logs -f [service-name]

# 完全リセット
docker-compose down -v
docker-compose up -d --build
```

### データベース関連
```bash
# マイグレーションリセット
docker-compose exec backend npx prisma migrate reset

# スキーマ同期
docker-compose exec backend npx prisma db push
```

## 連絡・参考情報

- 要件定義: `/docs/requirements-v1.0.md`
- エージェントルール: `/AGENTS.md`
- デザイン参考: `/desing-html/`

---

**最終更新**: 2025-11-01 11:35 JST  
**作業者**: AI Assistant (Claude)  
**次の作業者への申し送り**: データベースの初期データ投入から始めることを推奨します。お客様用画面の実装を優先し、その後管理画面を実装してください。
