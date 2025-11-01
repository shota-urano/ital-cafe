# Hono.js API ベストプラクティス 2025年最新版

## 基本設計とハンドラー

- 「Ruby on Rails風のコントローラ（Controller）」は不要  
  - ルート定義直後にハンドラーを書くことで型推論が効く  
  - どうしても抽象化したい場合は `factory.createHandlers()` を利用（型推論が正しく作用）  
  - 例：
    ```
    app.get('/books/:id', (c) => {
      const id = c.req.param('id')
      return c.json({ id })
    })
    ```

## TypeScript・型安全

- リクエスト/レスポンス型をインターフェース・型エイリアスで明示的に定義
- エラーハンドリングも型で管理

interface Item { id: number; name: string }
app.post('/items', (c) => {
const newItem: Item = c.req.body
// ...略
})

## ミドルウェア運用

- 必要な共通処理はミドルウェア化
- `factory.createMiddleware` で作成し、複数ハンドラーへ適用

  ```
  const middleware = factory.createMiddleware(async (c, next) => {
    c.set('foo', 'bar')
    await next()
  })
  app.use('/api', middleware)
  ```

- ロギング、バリデーション、認証・認可はミドルウェアで分離

## ルーター最適化

- デフォルトは RegExpRouter を使用（パフォーマンス最適）  
- SmartRouter, LinearRouter, PatternRouterなど、用途に合わせて切り替え可能

import { Hono } from 'hono/router/smart'
const app = new Hono()

- 軽量用途では `hono/tiny` バンドル利用も可能

## API設計

- RESTfulなHTTPメソッド（GET, POST, PUT, DELETE）を正しく運用
- パスパラメータ、クエリ・ボディ型を厳密に定義
- JSON/テキスト/ステータスコードの使い分け

## プロジェクト構成例

src/
├─ index.ts
├─ routes/
│ ├─ items.ts
│ └─ users.ts
├─ middlewares/
├─ types/
└─ utils/

## パフォーマンス最適化

- 必要最低限のミドルウェアのみを適用
- 軽量なハンドラー設計・不要な抽象化を避ける
- ストリームレスポンス/キャッシュ指示ヘッダー活用

## セキュリティ
- .envファイルによる秘密管理
- API認証・認可はミドルウェアで強制

## 開発体験（DX）向上

- ESLint, Prettier導入
- 型エラー時CIで検知
- OpenAPI/SwaggerによるAPI自動ドキュメント化

---

## 参考資料
- [Hono.js公式ベストプラクティス](https://hono.dev/docs/guides/best-practices)
- [Zenn記事/Hono API設計](https://zenn.dev/aishift/articles/a3dc8dcaac6bfa)
- ストリーム処理・ミドルウェア詳細は公式ドキュメントへ