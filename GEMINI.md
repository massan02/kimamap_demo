# GEMINI.md

このファイルは、Gemini がこのプロジェクト（kimamap_demo）で作業するためのコンテキストとルールを定義します。

## 1. プロジェクト概要
**プロジェクト名:** kimamap_demo (気ままっぷ)
**目的:** ユーザーの「気分」と「時間」に基づいて、現在地周辺の最適なお出かけプランを提案するモバイルアプリケーション。
**構成:** 旧環境からのクリーンな再構築プロジェクト。Expo (Frontend) + Express (Backend) の構成。

## 2. 技術スタック

### フロントエンド (Client)
*   **Framework:** React Native 0.81.5 / Expo 54.0.25
*   **Language:** TypeScript 5.9.2
*   **UI Library:** React Native core components
*   **Navigation:** React Navigation v7 (Native Stack & Bottom Tabs)
*   **Maps:** react-native-maps (Google Provider)
*   **State/Auth:** Supabase Client (@supabase/supabase-js), React Context (予定)
*   **Styling:** `StyleSheet`

### バックエンド (Server)
*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Runtime:** Node.js
*   **Path:** `./server/` ディレクトリ配下

### インフラ・データ
*   **Database/Auth:** Supabase (PostgreSQL, Google OAuth)

### 開発環境と実行コマンド

### フロントエンド (`/`)
ルートディレクトリで実行します。

*   **依存関係インストール:** `npm install`
*   **開発サーバー起動:** `npm start` (または `npx expo start`)
    *   `npm run android`: Android エミュレータで起動
    *   `npm run ios`: iOS シミュレータで起動
    *   `npm run web`: ブラウザで起動
*   **キャッシュクリア起動:** `npx expo start -c` (ビルドエラー時などに有効)
*   **型チェック:** `npx tsc --noEmit`

**実機でのデバッグ (ngrok使用)**
実機からローカルサーバーに接続するために `ngrok` を使用します。
1.  `ngrok http 3000` を別ターミナルで実行し、Forwarding URL (例: `https://xxxx.ngrok-free.app`) を取得。
2.  ルート直下の `.env` ファイルに `EXPO_PUBLIC_API_URL=<URL>/api` を設定。
3.  `npx expo start -c` でアプリを起動。

### バックエンド (`/server`)
`server` ディレクトリ内で実行します。

*   **依存関係インストール:** `cd server && npm install`
*   **開発サーバー起動:** `cd server && npm run dev` (ts-node-dev によるホットリロード)
*   **ビルド:** `cd server && npm run build`
*   **本番起動:** `cd server && npm start`

## 4. 開発ルール (Conventions)

**言語設定**
*   **チャット・回答:** **常に日本語**で行うこと。
*   **ドキュメント:** **日本語**で記述すること。

**コーディング規約**
*   **TypeScript:** `strict: true` を遵守。`any` は極力避ける。Type alias を優先。
*   **React Components:** 関数コンポーネント (FC) + Hooks のみ使用。
*   **Styling:** `StyleSheet.create()` を使用。
*   **ファイル命名:**
    *   コンポーネント: `PascalCase` (例: `MapScreen.tsx`)
    *   関数・ユーティリティ: `camelCase` (例: `api.ts`)
    *   定数: `SCREAMING_SNAKE_CASE`
*   **環境変数:** クライアント側で使用する変数は `EXPO_PUBLIC_` プレフィックスが必須 (`.env` ファイル参照)。

## 5. ディレクトリ構造

```
kimamap_demo/
├── app/                    # フロントエンドのソースコード
│   ├── contexts/           # React Context (AuthContextなど)
│   ├── lib/                # 外部ライブラリ設定 (supabase.tsなど)
│   ├── navigation/         # ナビゲーション設定
│   ├── screens/            # 画面コンポーネント
│   └── services/           # API通信ロジック
├── assets/                 # 静的アセット (画像など)
├── server/                 # バックエンド (Express) ソースコード
│   └── src/
│       ├── app.ts          # Express アプリ設定
│       ├── routes/         # API ルート定義
│       └── data/           # モックデータなど
├── App.tsx                 # アプリのエントリーポイント
├── app.json                # Expo 設定
├── package.json            # フロントエンド依存関係
└── tsconfig.json           # TypeScript 設定
```

## 6. 現在のステータスと優先事項

**完了済み (Phase 1 & 2):**
*   [x] ナビゲーション実装 (Tab, Stack)
*   [x] Google Maps 表示、現在地取得
*   [x] Supabase 接続設定
*   [x] バックエンド初期構築 (Express)

**進行中・次期作業 (Phase 3):**
*   [ ] ログイン画面の実装
*   [ ] AuthContext の実装と認証フローの確立
*   [ ] 検索画面 (SearchScreen) のUI実装
*   [ ] プラン作成ロジックの実装

## 7. AI アシスタントへの指示
*   コードを変更する際は、既存のスタイルとプロジェクト構造を尊重してください。
*   `CLAUDE.md` に記載されている詳細なガイドラインも参照してください。
*   フロントエンドとバックエンドが分離されているため、変更対象のファイルパスに注意してください。
