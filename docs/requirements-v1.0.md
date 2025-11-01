# カフェ・オーダーシステム — 要件定義（v1.0）

> フロント：Next.js　バックエンド：Hono　DB：PostgreSQL
> 自然モチーフのカフェ向け注文・管理システム。ログイン不要で注文、レジ前払い。連打防止、店外いたずら防止、税率変更、分析まで一貫設計。

---

## 1. ゴール

* 来店客がQRスキャンのみで注文（ログイン不要）。
* 管理画面で商品・トッピング・注文・会計・分析を一元管理。
* レジ前払いのため決済機能なし。
* 終業時にLINE Notifyで売上を自動送信。

---

## 2. ユーザー

* **来店客**：ログイン不要で注文。
* **スタッフ**：注文・提供状況の確認、音通知。
* **管理者**：商品・トッピング・テーブル・権限・アナリティクス管理。

---

## 3. 画面概要

### お客様用

1. **QRスキャン入店**：`/t/{table_token}` → `SessionToken`(60分)発行。
2. **トップ**：おすすめ1品表示、キャンペーン。
3. **商品一覧**：カテゴリ・検索・商品カード（**セット商品はバッジ表示**）。
4. **商品詳細**：

   * 単品：トッピング選択、数量、サイズ。
   * **セット**：**セットビルダー**（ステップ式）

     1. セット内容の必須/任意スロットを表示（例：ドリンク1つ、サイド1つ）
     2. 各スロットで候補商品を選択（在庫/非表示は除外）
     3. 構成品ごとにトッピング選択（許可されている場合のみ）
     4. **価格表示**：**セット価格（管理者設定）** + Σ(構成品`extra_price`) + Σ(トッピング)
5. **カート**：合計・税・確認。"レジにお越しください"文言。テーブルNo常時表示。**セットの明細は親子行で表示**。
6. **注文完了**：注文番号と案内文。

### 管理用

1. ログイン（2FAなし）
2. ダッシュボード：注文数・売上推移。
3. 注文一覧：未清算→支払済→提供済のステータス変更、音通知。**セットは親子で展開表示**。
4. 商品管理（CRUD＋画像アップロード、**product_type設定：single/set**、**set時は「セット価格」を編集**）。
5. トッピング管理（CRUD＋商品紐付け）。
6. **セット管理（新規）**：

   * セット基本情報（名称、**価格=商品の`price_tax_incl`**、画像、表示/非表示）
   * 構成品マッピング：スロット（必須/任意、min/max、default、**extra_price**）
   * 並び順、公開範囲（カテゴリー）
7. テーブル管理（QR発行、状態確認）。（QR発行、状態確認）。
8. アナリティクス（売上・客数・TOP商品）。
9. 設定（営業時間、税率予約、LINE Notify）。

---

## 4. セキュリティ・セッション

* `SessionToken`：QRアクセス時に発行（60分）。最後の操作から60分で失効。
* `.env`設定例：

  ```
  SESSION_TTL_MINUTES=60
  SESSION_IDLE_TIMEOUT_MINUTES=60
  BUSINESS_HOURS_BLOCK=false
  GEOFENCE_ENABLED=false
  WIFI_REQUIRED=false
  TIMEZONE=Asia/Tokyo
  ```
* トークン失効後は401→QR再スキャン要求。
* Origin/CSP検証、営業時間外ブロックOFF。

---

## 5. 税率

* 税率は`TaxRateSchedule(rate, effective_from_date)`で管理。
* 変更は**日付指定**で予約可能（例：2026-01-01から10%→11%）。
* 適用は**注文確定日の有効税率**。

---

## 6. 不正対策

* `SessionToken`が有効な端末のみ注文可。
* URLを知っていても退店後は期限切れで注文不可。
* 同一UA/IP/テーブルの過剰注文をレート制限。
* 営業時間外ブロック：OFF（必要に応じてON）。
* ジオフェンス・Wi-Fi制約：OFF。

---

## 7. データモデル

* Product(id, name, **price_tax_incl**, image_url, category, **product_type[single|set]**)
  ※`set` の**販売価格は管理者が自由に設定**（`price_tax_incl`）。構成品に `extra_price` を付与可能（合計=セット価格 + Σextra + Σtoppings）。
* Topping(id, name, price_tax_incl)
* ProductTopping(product_id, topping_id)
* **SetComponent**(id, **set_product_id**, component_product_id, required, min_qty, max_qty, default_qty, **extra_price**)
  ※`extra_price` は構成品を選んだ際に加算される任意の追加料金（±可）
* Order(id, table_no, subtotal, tax, total, status[unpaid|paid|served|expired])
* **OrderItem**(id, order_id, product_id, quantity, **parent_item_id?**)
  ※セットの構成品は `parent_item_id` に親アイテム（セット本体）を参照
* OrderItemTopping(order_item_id, topping_id)
* Table(id, number, qr_url, table_token)
* SessionToken(token, table_id, issued_at, expires_at, device_fingerprint, status[active|expired])
* TaxRateSchedule(id, rate, effective_from_date)
* User(id, name, role[admin|staff])
* AnalyticsDaily(date, revenue, customers, orders)

---

## 8. API概要

* `GET /t/{token}`：テーブル解決＋SessionToken発行。
* `POST /api/orders`：Idempotency-Key＋SessionToken必須。
  **Payload例（セット対応）**：

  ```json
  {
    "items": [
      { "product_id": 100, "qty": 1 },
      { "product_id": 200, "qty": 1, "type": "set",
        "components": [
          { "product_id": 201, "qty": 1, "toppings": [11,12] },
          { "product_id": 202, "qty": 1 }
        ],
        "toppings": []
      }
    ]
  }
  ```
* `GET /api/orders?status=unpaid|paid|served`
* `PATCH /api/orders/{id}/status`
* **セット商品管理**：

  * `GET /api/sets` `GET /api/sets/{id}`
  * `POST /api/sets` `PUT /api/sets/{id}` `DELETE /api/sets/{id}`
  * `POST /api/sets/{id}/components`（複数登録・順序・数量制約・追加料金）
* `POST /api/tax-schedule`：税率予約登録。
* `GET /api/tax-schedule/active?on=YYYY-MM-DD`
* `GET /api/analytics/summary`

---

## 9. アナリティクス

* 指標：売上・客数・AOV・時間帯別・商品別構成比。
* **集計基準：支払済（paid）ベース。**
* **セットの集計**：

  * デフォルト：**親（セットSKU）に売上を計上**、構成品は参考指標として件数のみ。
  * オプション：構成品へ売上按分（`base_price`は親、`extra_price/トッピング`は子へ配賦 など）
* 出力：日次折れ線、カテゴリ円グラフ、TOP商品/セット。

---

## 10. 画像最適化 / CDN

* アップロード時に**WebP/AVIF**生成。
* `<picture>`タグで最適形式を自動選択。

---

## 11. LINE連携

* 方式：LINE Notify（無料枠）。
* 終業時に日報自動送信（売上・客数・TOP3商品）。

---

## 12. UI/UXガイドライン

* 自然モチーフ（木・葉・水）。角丸8-16px、柔らかい影。
* カラー：深緑・アースカラー・若葉アクセント。
* テーブルNo常時表示。
* 軽微な葉の落下アニメーション。

---

## 13. 二重注文・連打対策

* `Idempotency-Key`必須。
* ボタン二重押下無効、再送キュー有。
* サーバ側で一意制約＋冪等設計。

---

## 14. 技術スタック

* Front：Next.js（App Router）+ TypeScript + Tailwind + React Query。
* Back：Hono。
* DB：PostgreSQL。
* LINE：LINE Notify。
* 共通：全てdockerを利用する

---


