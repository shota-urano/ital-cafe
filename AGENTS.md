# basic rules
- response in japanese 

# 必ず参考にするファイル
- /home/shota6/workspace/ital-cafe/docs/requirements-v1.0.md
- /home/shota6/workspace/ital-cafe/COMMANDS.md
- /home/shota6/workspace/ital-cafe/HANDOVER.md
- /home/shota6/workspace/ital-cafe/PROGRESS.md

# 実装後ルール
- 完了タスクにチェックをつけていくこと

# ui/ux frontend rules
## 前提
デザイン設計を作成致しました。
デザイン部分(色とレイアウト)は忠実に守り、中身の部分に関しては要件定義を忠実に守ること
htmlで作成しているので、next.jsで利用できるように変換すること

## rules
- @desing-html内のend-user/manageを参考にすること
- modalの画面にはmodal部分の実装だけ参考にすること
- サイドメニューは適宜修正すること
- 色とレイアウトのみ参考にすること
- 必ずcomponent化し、再利用できる箇所は共通化すること
- storybooksに全componentを実装すること
- @docs/rules/nextjs-best-practices.mdを守ること
- shadcnを極力利用すること

# backend rules
- @docs/rules/honojs-best-practices.mdを守ること

# 環境構築
開発環境でも、本番環境でもdockerを利用します。
動作が遅くなったりすることが内容に開発すること
