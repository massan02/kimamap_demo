---

## Issue #76: Discover 導線（近場スワイプ）+ profiles 好みカテゴリ（大幅 UX 改修）

### 背景

- 現状は「Map → 検索（文章中心） → 結果 → Google Maps」フローが中心で、面倒なユーザーが離脱しやすい
- 「何も設定しなくても近場が出る」デフォルト体験を追加し、絞り込みは後から任意にする

### ゴール（ユーザー体験）

- Map タブを開いた瞬間に「近場スポットカード」が表示され、右/左スワイプだけで候補を貯められる
- 好みカテゴリを登録すると、それを多めに提示できる（ただし探索枠も混ぜる）
- Discover では徒歩分は概算（約 ◯ 分）で高速に、プラン確定時に Directions で正確化する

### 仕様（MVP）

- Discover は Map タブと同居（上：マップ、下：カードデッキ）
- カードは 1 バッチ 7 枚 → 使い切ったら「半径拡大」で次の 7 枚
- 条件入力は「絞り込み」として後から開ける（文章入力は任意に降格）
- 近場条件:
  - 営業中のみ（openNow）
  - 徒歩分は概算で「だいたい近い」を許容（厳密判定はプラン確定時）
- 右スワイプで候補追加、3 件以上で「この候補でプラン化」CTA を表示
- 0 件時の救済（案）: 半径拡大

### データ（Supabase）

- `profiles`
  - `preferred_place_types text[]`（最大 3 つ）
  - `onboarding_done boolean`
- 初回ログイン時に「好きなカテゴリ」を聞く（スキップ可、後で Profile から編集可）
- RLS: `id = auth.uid()` の行のみ読み書き

### API（案）

- `POST /api/spots/nearby`
  - request: `startingLocation`, `openNow`, `radiusMeters`, `limit`, `preferredTypes`, `excludePlaceIds`
  - response: カード用（`placeId/name/types/location/address/photo?/walkMinutesApprox/isOpenNow`）
- `POST /api/plan`（拡張案）
  - `seedPlaceIds` を受け取り、候補を必ず含める形でプラン生成に反映（既存`query`は任意）
  - プラン確定時に Directions でルート/総所要時間を確定（既存`routeResult`を活用）

### 受け入れ条件（チェックリスト）

- [ ] Map タブ起動後、位置情報許可済みなら 3 秒以内にカードが表示される（体感）
- [ ] カードに「営業中」「約徒歩 ◯ 分」「カテゴリ」が常に表示される
- [ ] 7 枚消化後に「半径拡大」で次の 7 枚が取得できる
- [ ] 3 件右スワイプで「プラン化」でき、プラン画面では徒歩分/ルートが正確化される
- [ ] 好みカテゴリは profiles に保存され、提示順に反映される
