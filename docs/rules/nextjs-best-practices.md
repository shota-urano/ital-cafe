# Next.js ベストプラクティス 2025年最新版

## ディレクトリ構成と基本設計

- App Routerを優先採用し、Server/Client分離を明確にする  
- `src/`配下にドメインごとで整理  
- 主要ディレクトリ例:
src/
├─ app/
│ ├─ layout.tsx
│ ├─ page.tsx
│ ├─ error.tsx
│ └─ api/
│ └─ users/route.ts
├─ components/
├─ lib/
├─ hooks/
├─ styles/
└─ utils/

## TypeScript・型安全

- 全コンポーネント・API・fetch関数に型定義を徹底  
- 型安全なfetchラッパーでレスポンス/エラー形状まで明示的に管理  

## パフォーマンス最適化

- Server Components中心の設計にし、JSバンドルサイズとクライアント負荷を削減  
- キャッシュ制御（`cache: 'force-cache'` や `no-store`）を適切に使い分け  
- Edge Renderingを活用し、レイテンシ最小化  
- 画像は`next/image`を利用し自動最適化・WebP変換

## データフェッチ・API設計

- fetchラッパー層でエラーハンドリングと型管理  
- APIコールはサーバーコンポーネントまたは`useEffect`で責任分離  
- ISR(`revalidate`)を設定し、動的なデータ更新も担保  

## 開発体験向上

- Turbopackによる高速dev環境（起動速度最大3倍改善）  
- ESLint/Prettier連携、CI/CDでの自動整形  
- Importエイリアス`@/components`等でパス簡略化

## エラーハンドリング・ミドルウェア

- App Router配下に`error.js`・`not-found.js`設置  
- Middlewareでルート認証・ロギング・SSR前処理の実施  
- エラーバウンダリ（Error Boundary）導入

## 環境変数管理

- `.env.local` にAPIキー・シークレット管理し、ソースコードから分離

---

## ワンポイントTips
- ベストプラクティス全文は必ずAIエージェントや補助ツールに参照させること
- 参考実装や公式ガイドを定期チェックしてアップデート

---

## 参考資料
- Next.js公式ガイド: https://nextjs.org/docs/app/guides/production-checklist
- 最新ナレッジ: Zenn, Qiita, 技術ブログ