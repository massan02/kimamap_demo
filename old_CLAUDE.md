# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**気ままっぷ (Kimamap)** は、ユーザーの「気分」と「時間」から現在地周辺の最適なおでかけルートを AI が自動提案する React Native モバイルアプリケーションです。Express.js バックエンドサーバーを使用して AI 機能と Google Maps API を統合しています。

### 主要機能

- **AI プラン作成機能** - 時間指定、気分選択、移動手段から最適ルートを提案
- **地図表示機能** - Google Maps 上でのルート・スポット表示
- **保存機能** - お気に入り店舗・おでかけ履歴の管理
- **AI 学習機能** - ユーザーフィードバックによる提案精度向上
- **天気情報表示** - WeatherWidget による天気情報表示

## 現状分析（2025 年 1 月時点）

### チーム構成・習熟度

- **テックリード**: React Native 経験あり、TypeScript 半年、Expo/Supabase 初心者レベル
- **他メンバー 4 名**: JavaScript 勉強中、React Native/TypeScript 未経験
- **AI 機能経験**: 全員なし（テックリードが API 連携予定）
- **地図機能**: メンバーが基本的な現在地表示機能作成済み

### 実装済み機能

#### フロントエンド

- **ナビゲーション**: ボトムタブ（Map・保存済み・マイページ）+ スタック
- **地図画面**: Google Maps 表示、検索バー、天気ウィジェット
- **検索画面**: 要望入力、履歴表示、移動手段・時間選択（UI 完成、機能未実装）
- **天気機能**: 位置情報ベースの現在天気・24 時間予報表示
- **ランディングページ**: アプリ紹介 UI（認証機能未実装）

#### バックエンド

- **サーバー基盤**: Express.js + TypeScript 環境構築済み
- **認証設定**: Supabase 設定済み（実装は未完了）

### 未実装・課題

- **AI プラン生成**: 検索実行後の処理
- **認証機能**: Google ログイン実装
- **データ保存**: お気に入り・履歴保存機能
- **ルート表示**: 地図上でのルート描画
- **バックエンド API**: 全エンドポイント未実装

## 技術スタック

### 確定技術

- **フロントエンド**: React Native (v0.79.2) + Expo (v53.0.9) + TypeScript
- **UI ライブラリ**: React Native Paper (v5.14.5)
- **地図機能**: React Native Maps (v1.20.1) + Google Maps API
- **位置情報**: Expo Location (v18.1.5)
- **ナビゲーション**: React Navigation v7 (Bottom Tabs + Stack)
- **バックエンド**: Node.js + Express + Supabase (v2.49.7)
- **データベース**: Supabase

### 検討中技術

- **状態管理**: TanStack React Query（使用可否検討中）

## 開発コマンド

### フロントエンド（React Native + Expo）

```bash
npm start                # Expo開発サーバー起動
npm run tunnel          # トンネル経由で外部アクセス可能にして起動
npm run android         # Android開発
npm run ios             # iOS開発
```

### バックエンド（サーバー）

```bash
cd server
npm run dev             # tsx watchによる開発サーバー起動
npm run build           # TypeScriptをdist/にビルド
npm start               # 本番サーバー起動
npm test                # Jestテスト実行
npm run lint            # ESLint実行
npm run lint:fix        # ESLint自動修正
```

## 重要な設定ファイル

- **フロントエンド設定**: `config/supabase.ts`、`config/maps.ts`、`config/env.ts`
- **TypeScript**: ルート `tsconfig.json`（Expo ベース）、`server/tsconfig.json`（Node.js）
- **Expo 設定**: `app.json`

## 環境変数

フロントエンド環境変数は `EXPO_PUBLIC_` プレフィックスを使用：

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## コーディング規約

### 基本原則

- TypeScript の厳密な型定義を使用
- 関数コンポーネントと Hooks を使用
- React Native Paper コンポーネントを優先使用
- 日本語コメントを適切に使用
- ESLint/Prettier 設定に従う

### React Native 固有

- StyleSheet を使用してスタイル定義
- Platform.OS でプラットフォーム固有処理を分岐
- react-native-maps + Google Maps API を地図機能で使用

### データ管理

- `config/supabase.ts`経由で Supabase アクセス
- 状態管理方法は要検討（React Query 導入可否含む）
- Supabase ベストプラクティスに従った認証・DB 操作

## 開発支援ツール（Spec Kit）

- **`.claude/commands/`**: Claude Code 専用コマンド（plan、specify、tasks）
- **`scripts/`**: 開発作業自動化スクリプト
- **`templates/`**: プロジェクト標準テンプレート
- **`memory/`**: プロジェクト憲法と更新チェックリスト

## 重要な注意点

- Expo 管理ワークフロー使用のため、ネイティブコード変更時は`expo prebuild`が必要
- 位置情報機能は実機でのテストが必要
- 地図表示時のパフォーマンスに注意
- プライバシーを考慮した位置情報処理の実装
- ディレクトリ構造は機能実装時に動的に作成する方針
