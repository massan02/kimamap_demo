# AGENTS.md

このファイルは、AI コーディングアシスタント（Claude, Gemini 等）がこのプロジェクトで作業するためのガイドラインを定義します。

## 言語設定

- **常に日本語**でチャット・回答・ドキュメント作成を行うこと

## プロジェクト概要

**プロジェクト名:** kimamap_demo (気ままっぷ)  
**目的:** ユーザーの「気分」と「時間」に基づいて、現在地周辺の最適なお出かけプランを AI が自動提案するモバイルアプリケーション

**構成:** Expo (Frontend) + Express (Backend) のモノレポ構成

## 技術スタック

### フロントエンド (Client)

| 項目       | 技術                                                   |
| ---------- | ------------------------------------------------------ |
| Framework  | React Native 0.81.5 / Expo 54.0.25                     |
| Language   | TypeScript 5.9.2                                       |
| Navigation | React Navigation v7 (Native Stack & Bottom Tabs)       |
| Maps       | react-native-maps (Google Provider)                    |
| State/Auth | Supabase Client (@supabase/supabase-js), React Context |
| Styling    | `StyleSheet.create()`                                  |

### バックエンド (Server)

| 項目      | 技術                                             |
| --------- | ------------------------------------------------ |
| Framework | Express.js                                       |
| Language  | TypeScript                                       |
| Runtime   | Node.js 20.19.4+                                 |
| AI        | LangGraph Agent (Gemini + Google Maps Grounding) |

### インフラ・データ

- **Database/Auth:** Supabase (PostgreSQL, Google OAuth)

## ディレクトリ構造

```
kimamap_demo/
├── app/                    # フロントエンドソースコード
│   ├── contexts/           # React Context (AuthContextなど)
│   ├── lib/                # 外部ライブラリ設定 (supabase.ts)
│   ├── navigation/         # ナビゲーション設定
│   ├── screens/            # 画面コンポーネント
│   └── services/           # API通信ロジック
├── assets/                 # 静的アセット（画像など）
├── server/                 # バックエンドソースコード
│   └── src/
│       ├── app.ts          # Expressアプリ設定
│       ├── routes/         # APIルート
│       ├── agent/          # LangGraphエージェント
│       ├── tools/          # エージェント用ツール
│       └── data/           # モックデータ
├── App.tsx                 # アプリエントリーポイント
├── app.json                # Expo設定
├── package.json            # フロントエンド依存関係
└── tsconfig.json           # TypeScript設定
```

## 開発コマンド

### フロントエンド (`/` ルートディレクトリ)

```bash
npm install                  # 依存関係インストール
npm start                    # 開発サーバー起動 (または npx expo start)
npm run android              # Androidエミュレータ
npm run ios                  # iOSシミュレータ
npm run web                  # ブラウザ
npx expo start -c            # キャッシュクリア起動
npx tsc --noEmit             # 型チェック
```

### バックエンド (`/server` ディレクトリ)

```bash
cd server && npm install     # 依存関係インストール
cd server && npm run dev     # 開発サーバー起動 (ts-node-dev)
cd server && npm run build   # ビルド
cd server && npm start       # 本番起動
```

### 実機デバッグ (ngrok)

```bash
ngrok http 3000              # 別ターミナルで実行
# .env に EXPO_PUBLIC_API_URL=<ngrok-url>/api を設定後
npx expo start -c
```

## 環境変数 (.env)

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=<your-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-key>

# API接続
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# Google Maps (server側)
GOOGLE_MAPS_API_KEY=<your-key>
```

**注:** クライアント側で使用する変数は `EXPO_PUBLIC_` プレフィックス必須

## コーディング規約

### TypeScript

- `strict: true` を遵守
- `any` は極力避ける
- Type alias を優先

### React Native

- 関数コンポーネント + Hooks のみ
- `StyleSheet.create()` でスタイル定義
- SafeArea を必ず適用（iOS notch 対応）

### ファイル命名

| 種別           | 規則                 | 例                 |
| -------------- | -------------------- | ------------------ |
| コンポーネント | PascalCase           | `MapScreen.tsx`    |
| ユーティリティ | camelCase            | `api.ts`           |
| 定数           | SCREAMING_SNAKE_CASE | `API_ENDPOINTS.ts` |

## 開発ステータス

### 完了済み (Phase 1-3)

- [x] ナビゲーション実装 (Tab, Stack)
- [x] Google Maps 表示、現在地取得
- [x] Supabase 接続設定・認証機能
- [x] バックエンド初期構築 (Express)
- [x] 検索画面 UI (SearchScreen)
- [x] プラン作成ロジック (Gemini + Google Maps Grounding)
- [x] 検索結果表示・ルート描画 (SearchResultScreen)

### 進行中 (Phase 4 - データ永続化)

- [ ] Supabase テーブル設計
- [ ] 履歴保存機能の実装
- [ ] 保存済みプラン一覧画面
- [ ] お気に入り機能

## トラブルシューティング

```bash
# Metroキャッシュクリア
npx expo start -c

# node_modules再インストール
rm -rf node_modules package-lock.json && npm install

# 型定義修復
npx expo install --fix

# Podファイル再生成 (iOS)
cd ios && pod install && cd ..
```

## 参考リソース

- [Expo](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [Supabase](https://supabase.com/docs)
- [LangGraph](https://langchain-ai.github.io/langgraphjs/)
