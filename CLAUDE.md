# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 言語

- **常に日本語で回答し、ドキュメント類も日本語で記述**

## プロジェクト概要

**気ままっぷ (Kimamap)** - ユーザーの「気分」と「時間」から現在地周辺の最適なおでかけルートを AI が自動提案するモバイルアプリケーション

旧環境（`/Users/murasakimasato/Github/kimamap`）が膨れ上がったため、**最小構成からクリーンに再構築**。最新安定版を採用し、段階的に機能を追加していく方針。

## 現在の開発段階

**Learning Phase 完了 (Phase 1 & 2 部分実装済み)**:

- **ナビゲーション**: BottomTabNavigator 実装済み（Map, Profile）
- **地図**: Google Maps 表示、現在地取得・表示 実装済み
- **バックエンド**: Supabase 接続設定完了、データ取得テスト完了
- **認証**: Google OAuth 設定済み（実装は未完了）

### 次のフェーズ計画

- **Phase 1-3 の残り**: ログイン画面、AuthContext の実装
- **Phase 3**: 検索画面 UI、プラン作成ロジックの実装

## 技術スタック

### フロントエンド（実装済み）

- **React Native**: 0.81.5
- **Expo SDK**: 54.0.25
- **React**: 19.1.0
- **TypeScript**: 5.9.2
- **Node.js**: 20.19.4 以上
- **Navigation**: React Navigation v7
- **Maps**: react-native-maps (Google Provider)
- **Location**: expo-location

### 環境設定

- 厳密な型チェック有効（`tsconfig.json`: `strict: true`）
- 新アーキテクチャ有効（`app.json`: `newArchEnabled: true`）
- Edge-to-Edge 対応（Android）、SafeArea 対応必須

### バックエンド（実装中）

- **Supabase**: Auth (Google OAuth), Database (PostgreSQL)
- **Client**: @supabase/supabase-js

## よく使うコマンド

```bash
# 開発サーバー起動
npm start              # 全プラットフォーム対応
npm run android        # Android
npm run ios            # iOS
npm run web            # Web

# ライブラリ追加（Expo対応）
npx expo install <package-name>

# キャッシュクリア（ビルドエラー時）
npx expo start -c      # Metro Bundlerキャッシュクリア
npx expo start --clear # 完全クリア

# node_modules再インストール
rm -rf node_modules package-lock.json && npm install

# TypeScript型チェック
npx tsc --noEmit
```

## プロジェクト構造

### 現在の構成

```
kimamap_demo/
├── App.tsx                      # ルートコンポーネント
├── index.ts                     # エントリーポイント
├── app.json                     # Expo設定
├── tsconfig.json                # TypeScript厳密設定
├── package.json                 # 依存関係
├── .env                         # 環境変数（gitignore対象）
├── app/
│   ├── lib/
│   │   └── supabase.ts          # Supabase接続設定
│   ├── navigation/
│   │   └── BottomTabNavigator.tsx
│   └── screens/
│       ├── MapScreen.tsx        # 地図・現在地表示
│       └── ProfileScreen.tsx    # データ取得テスト用
├── assets/                      # スプラッシュ, アイコン画像
└── CLAUDE.md
```

### 環境変数設定（.env）

```bash
# Supabase設定（Supabase Dashboard → Settings → API から取得）
EXPO_PUBLIC_SUPABASE_URL=<your-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-key>

# Google Maps API Key（Phase 3で追加）
# EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=<your-key>
```

**注**: `EXPO_PUBLIC_` プレフィックスが必須（Expo 仕様）

## コーディング規約

### TypeScript

- `strict: true` の厳密な型定義を遵守
- `any` の使用は最小限に
- Type alias を優先（インターフェースより）

### React Native

- 関数コンポーネント + Hooks のみ
- `StyleSheet.create()` でスタイル定義
- `Platform.OS` でプラットフォーム分岐
- SafeArea を必ず適用（iOS notch 対応）

### ファイル命名規則

- コンポーネント: **PascalCase** （例: `HomeScreen.tsx`, `MapView.tsx`）
- ユーティリティ/関数: **camelCase** （例: `formatDate.ts`, `api.ts`）
- 定数: **SCREAMING_SNAKE_CASE** （例: `API_ENDPOINTS.ts`）

## 重要な制約・要件

### Expo/React Native

- **Node.js 20.19.4 以上必須**
- **iOS 開発**: Xcode 16.1 以上必須
- **Android**: API 36 サポート、Edge-to-Edge 対応
- **新アーキテクチャ**: 有効（app.json）

### 環境変数アクセス

- クライアント側: `process.env.EXPO_PUBLIC_*` でのみアクセス可能
- プリコンパイル時に埋め込まれるため、実行時に変更不可

### ビルド時の注意

- iOS: プリコンパイル XCFramework による高速化（ビルド時間最大 10 倍削減）
- Metro Bundler: キャッシュ問題は `expo start -c` で解決

## トラブルシューティング

### 開発サーバーが起動しない

```bash
# 1. Metroキャッシュクリア
npx expo start -c

# 2. node_modulesが壊れている場合
rm -rf node_modules package-lock.json
npm install
```

### TypeScript エラー（型不整合）

```bash
# 型定義の再生成/修復
npx expo install --fix

# 型チェック実行
npx tsc --noEmit
```

### iOS ビルドエラー

```bash
# Podファイル再生成（iosディレクトリがある場合）
cd ios && pod install && cd ..
```

### ネイティブモジュール追加後の問題

```bash
# Expoで管理されたライブラリの場合
npx expo install <package-name>

# ネイティブ再ビルド必要な場合は EAS Build を検討
```

## 参考リソース

- **Expo 公式ドキュメント**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/
- **Supabase**: https://supabase.com/docs
- **旧環境（参考用）**: `/Users/murasakimasato/Github/kimamap/`
