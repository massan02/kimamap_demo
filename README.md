# KimaMap Demo

KimaMAP は、ユーザーの興味や気分に基づいて福岡周辺の旅行プランを自動生成するアプリです。

## セットアップ手順

### 1. リポジトリのクローン　（Github Desktop 経由でエディタで開けてたら必要なし）

```bash
git clone https://github.com/massan02/kimamap_demo.git
cd kimamap_demo
```

### 2. 環境変数の設定

#### クライアント（Expo）側

1. ルートディレクトリに `.env` ファイルを作成:

```bash
cp .env.example .env
```

2. `.env` を discord で送った api キーに変更

#### サーバー側

1. `server/` ディレクトリに `.env` ファイルを作成:

```bash
cd server
cp .env.example .env  # または手動で作成
```

2. `.env` を discord で送った api キーに変更

### 3. 依存パッケージのインストール

クライアントとサーバーの両方で `npm install` を実行:

```bash
# ルートディレクトリ（クライアント）
npm install

# サーバーディレクトリ
cd server
npm install
```

### 4. 開発サーバーの起動

3 つのターミナルを使用します。

#### ターミナル 1: バックエンドサーバー

```bash
cd server
npm run dev
```

サーバーが `http://localhost:3000` で起動します。

#### ターミナル 2: Expo（フロントエンド）

```bash
# ルートディレクトリで
npm start
```

QR コードが表示されるので、Expo Go アプリでスキャンしてください。

#### ターミナル 3: ngrok

実機でテストする場合、`localhost` にはアクセスできないため、ngrok などのトンネルサービスを使用します(ngrok の登録が各自必要になるかも):

```bash
ngrok http 3000
```

表示された URL を `EXPO_PUBLIC_API_URL` に設定してください。

## プロジェクト構成

```
kimamap_demo/
├── app/              # Expo Router のページ
├── server/           # Express バックエンド
│   ├── src/
│   │   ├── agent/    # LangGraph エージェント
│   │   └── tools/    # Google Maps などのツール
│   └── package.json
├── .env.example      # クライアント用環境変数テンプレート
└── package.json
```

## 主な機能

- 🔐 Google OAuth によるログイン (Supabase Auth)
- 📍 現在地の取得
- 🤖 AI による旅行プラン生成 (Gemini + LangGraph)
- 🗺️ Google Maps による経路計算

## 参考ドキュメント

- [AGENTS.md](./AGENTS.md) - AI エージェントの構成詳細
- [SUPABASE_GOOGLE_OAUTH_SETUP.md](./SUPABASE_GOOGLE_OAUTH_SETUP.md) - OAuth 設定ガイド
