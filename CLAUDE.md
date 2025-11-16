# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**気ままっぷ (Kimamap)** プロジェクトの新規開発環境です。旧環境（`/Users/murasakimasato/Github/kimamap`）が膨れ上がったため、**最小構成からクリーンに再構築**し、将来的に本番環境として採用する可能性があります。

### プロジェクトの目的
ユーザーの「気分」と「時間」から現在地周辺の最適なおでかけルートをAIが自動提案するモバイルアプリケーション

### 開発方針
- **最小構成からスタート** - 必要最小限のライブラリのみ使用
- **段階的な機能追加** - フェーズごとに機能を追加
- **最新の安定版を採用** - 2025年1月時点の最新安定版を使用
- **シンプルな設計** - 過度な抽象化を避ける

## 技術スタック（2025年1月最新安定版）

### フロントエンド
- **React Native**: 0.81.x
  - Android 16 (API 36) サポート
  - iOSプリコンパイルビルド対応（ビルド時間最大10倍高速化）
  - Node.js 20.19.4以上、Xcode 16.1以上が必須
- **Expo SDK**: 54.0.x
  - 新アーキテクチャ対応
  - プリコンパイルXCFramework
- **TypeScript**: 5.9.x
  - `import defer` 構文サポート
  - `node20` オプション安定版
- **React**: 19.0.0

### バックエンド
- **Node.js**: 22 LTS (Jod) または 24 LTS (Krypton)
  - v22: 2027年4月までサポート
  - v24: 2028年4月までサポート（推奨）
- **Express**: 5.1.0
  - async/await自動エラーハンドリング（try/catch不要）
  - Node.js 18未満サポート終了
- **Supabase JS Client**: 2.81.x
  - Node.js 18サポート終了（v2.79.0以降）
  - 型推論の強化

### 段階的に追加するライブラリ

#### Phase 2: ナビゲーション
- `@react-navigation/native`: 7.1.x
- `@react-navigation/bottom-tabs`: 7.8.x
- `@react-navigation/stack`: 7.x.x
- `react-native-screens`: 4.x.x
- `react-native-safe-area-context`: 5.x.x

#### Phase 3: マップ機能
- `react-native-maps`: 1.26.x
- `expo-location`: 19.0.x

#### Phase 4: その他機能
- **状態管理**: 必要に応じて検討（React Queryなど）
- **UIライブラリ**: 必要に応じて検討（最小構成ではカスタムコンポーネント優先）

## 開発コマンド

### Phase 1: 最小構成のセットアップ

```bash
# プロジェクト初期化
npx create-expo-app@latest . --template blank-typescript

# Expo SDK 54にアップグレード（必要に応じて）
npx expo install expo@^54.0.0

# 開発サーバー起動
npm start
npm run android  # Android
npm run ios      # iOS
```

### Phase 2以降: 機能追加時

```bash
# ナビゲーション追加
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context

# マップ機能追加
npx expo install react-native-maps expo-location

# Supabase統合
npm install @supabase/supabase-js@^2.81.0
```

### バックエンド開発

```bash
# サーバーディレクトリ作成・初期化
mkdir server && cd server
npm init -y
npm install express@^5.1.0 @supabase/supabase-js@^2.81.0
npm install -D typescript tsx @types/node @types/express

# 開発サーバー起動（tsx watch使用）
npm run dev

# 本番ビルド
npm run build
npm start

# テスト・Lint
npm test
npm run lint
npm run lint:fix
```

## プロジェクト構造（段階的に構築）

### Phase 1: 最小構成
```
kimamap_demo/
├── app/
│   └── index.tsx         # エントリーポイント
├── App.tsx               # ルートコンポーネント
├── app.json              # Expo設定
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

### Phase 2: ナビゲーション追加後
```
kimamap_demo/
├── app/
│   ├── navigation/       # ナビゲーション設定
│   └── screens/          # 画面コンポーネント
```

### Phase 3: 機能拡張後
```
kimamap_demo/
├── app/
│   ├── components/       # 再利用可能コンポーネント
│   ├── navigation/
│   ├── screens/
│   └── services/         # APIクライアントなど
├── config/               # 設定ファイル（環境変数など）
└── server/               # バックエンド
    ├── src/
    │   ├── routes/
    │   ├── controllers/
    │   └── services/
    └── package.json
```

## 環境変数

Expoでは `EXPO_PUBLIC_` プレフィックスを使用：

```bash
# .env（gitignore対象）
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
```

## コーディング規約

### TypeScript
- 厳密な型定義を使用（`strict: true`）
- `any` の使用は最小限に
- インターフェースよりtype aliasを優先（小規模プロジェクトのため）

### React Native
- 関数コンポーネント + Hooks
- `StyleSheet.create()` でスタイル定義
- `Platform.OS` でプラットフォーム分岐
- コンポーネントは単一責任の原則に従う

### Express 5の特徴を活用
```typescript
// Express 5では自動エラーハンドリング
app.get('/api/data', async (req, res) => {
  // try/catch不要 - エラーは自動でnext()に渡される
  const data = await fetchData();
  res.json(data);
});
```

### ファイル命名規則
- コンポーネント: PascalCase（例: `MapScreen.tsx`）
- ユーティリティ: camelCase（例: `formatDate.ts`）
- 定数: SCREAMING_SNAKE_CASE（例: `API_ENDPOINTS.ts`）

## 重要な注意点

### React Native 0.81の要件
- **Node.js 20.19.4以上が必須**
- iOS開発にはXcode 16.1以上が必要
- ビルド時間が大幅に短縮（プリコンパイルビルド）

### Expo SDK 54
- 新アーキテクチャ対応（オプション）
- Expoモジュールのプリコンパイル化によりビルド高速化

### Express 5の変更点
- async/awaitミドルウェアで自動エラーハンドリング
- Node.js 18未満のサポート終了
- ReDoS対策（正規表現パターンの制限）

### Supabase Client 2.81
- Node.js 18サポート終了
- 型推論の改善（組み込み関数対応）

## 開発フロー

### 1. 最小構成で起動
```bash
npx create-expo-app@latest . --template blank-typescript
npm start
```

### 2. 機能ごとに段階追加
- ナビゲーション → マップ → バックエンド統合の順

### 3. 旧環境からの参照
```bash
# 旧環境のファイルを参考にする場合
cat /Users/murasakimasato/Github/kimamap/[ファイルパス]

# 必要に応じてコピー（そのまま使わず、最小構成に合わせて調整）
cp /Users/murasakimasato/Github/kimamap/[ファイル] ./temp/
```

## Spec Kit統合

このディレクトリにはSpec Kitが統合されています。

### 利用可能なコマンド
- `/speckit.specify` - 機能仕様作成
- `/speckit.plan` - 実装計画策定
- `/speckit.tasks` - タスク分解
- `/speckit.implement` - 実装実行
- `/speckit.checklist` - チェックリスト生成
- `/speckit.constitution` - プロジェクト憲法管理
- `/speckit.clarify` - 仕様明確化
- `/speckit.analyze` - 成果物整合性分析

### 推奨ワークフロー
1. `/speckit.specify` で機能仕様を定義
2. `/speckit.plan` で実装計画を立案
3. `/speckit.tasks` でタスクに分解
4. `/speckit.implement` で実装実行

## トラブルシューティング

### ビルドエラー
```bash
# キャッシュクリア
npx expo start -c

# node_modules再インストール
rm -rf node_modules package-lock.json
npm install

# iOS Podファイル再生成
cd ios && pod install && cd ..
```

### Metro Bundlerエラー
```bash
# Metroキャッシュクリア
npx expo start --clear
```

### TypeScriptエラー
```bash
# 型定義再生成
npx expo install --fix
```

## 参考リソース

- **旧環境**: `/Users/murasakimasato/Github/kimamap/`
- **Expo公式ドキュメント**: https://docs.expo.dev/
- **React Navigation公式**: https://reactnavigation.org/
- **Supabase公式**: https://supabase.com/docs

##　回答の際の注意点
- 常に日本語で回答し、ドキュメント類も日本語で記述すること

## Active Technologies
- TypeScript 5.9.x (strict mode) (001-auth-and-navigation)
- Supabase (PostgreSQL) - ユーザー認証とセッション管理 (001-auth-and-navigation)

## Recent Changes
- 001-auth-and-navigation: Added TypeScript 5.9.x (strict mode)
