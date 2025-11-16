# Implementation Plan: ユーザー認証とアプリ基本構造

**Branch**: `001-auth-and-navigation` | **Date**: 2025-11-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-auth-and-navigation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

ユーザー認証とアプリ基本構造を実装します。Googleログイン、セッション管理、2画面のボトムタブナビゲーション（地図・マイページ）、ログアウト機能を提供します。これはアプリケーションの基盤となるPhase 1の機能で、Expo SDK 54、React Native 0.81、Supabase Authを使用して、最小構成から段階的に構築します。

## Technical Context

**Language/Version**: TypeScript 5.9.x (strict mode)
**Primary Dependencies**:
- React Native 0.81.x
- Expo SDK 54.0.x
- React 19.0.0
- @react-navigation/native 7.1.x
- @react-navigation/bottom-tabs 7.8.x
- @react-navigation/stack 7.x.x
- @supabase/supabase-js 2.81.x

**Storage**: Supabase (PostgreSQL) - ユーザー認証とセッション管理
**Testing**: Jest (React Native標準) + React Native Testing Library
**Target Platform**: iOS 15+ / Android (API 36)
**Project Type**: Mobile (React Native/Expo)
**Performance Goals**:
- 認証フロー完了: 30秒以内
- タブ切り替え: 500ms以内
- 初回認証成功率: 95%以上

**Constraints**:
- Node.js 20.19.4以上必須
- iOS開発: Xcode 16.1以上
- Phase 1の範囲: 認証とナビゲーションのみ（地図表示、バックエンドAPIは含まない）
- 最小構成: 必要最小限のライブラリのみ使用

**Scale/Scope**:
- Phase 1完了時点: 4-5画面（ログイン、地図プレースホルダー、マイページ）
- 予想コード量: 1,000-1,500 LOC
- 開発期間: 1-2日

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. クリーンな基盤 ✅ PASS
- Phase 1として認証とナビゲーションの基盤のみを構築
- 段階的アプローチに準拠（Phase 2以降でマップ、バックエンドを追加）
- 先制的最適化なし（必要最小限の機能のみ）
- テスト完了後に次のフェーズへ進む計画

### II. 厳密な型安全性 ✅ PASS
- TypeScript 5.9.x、strict: true を使用
- すべてのコンポーネントpropsに型定義を追加予定
- `any`の使用を禁止（例外的ケースを除く）
- type aliasを優先（interfaceより）

### III. シンプル優先 ✅ PASS
- YAGNI原則に従い、Phase 1で必要な機能のみ実装
- 過度な抽象化を避ける（AuthContext、シンプルなナビゲーション構造）
- 複雑な状態管理は不要（React Contextで十分）
- カスタムユーティリティは最小限

### IV. 最新安定版スタック ✅ PASS
- React Native 0.81.x（最新安定版）
- Expo SDK 54.0.x（最新安定版）
- React Navigation 7.x（最新安定版）
- Supabase JS Client 2.81.x（最新安定版）
- 実験的機能は使用しない

### V. テスト・品質 ✅ PASS
- 認証フロー、ナビゲーションのユニットテスト作成予定
- 手動QAチェックリスト作成予定
- 各ユーザーストーリーの受け入れシナリオをテスト
- Phase 1完了前の品質ゲート設定

**判定**: すべてのゲートをPASS。Phase 0研究を開始可能。

---

### Phase 1デザイン完了後の再評価

**日時**: 2025-11-16
**成果物**: research.md, data-model.md, contracts/, quickstart.md

#### I. クリーンな基盤 ✅ PASS
- research.mdで技術的決定事項を明確化
- data-model.mdで最小限のエンティティ（User, Session, NavigationState）のみ定義
- Phase 1の範囲を逸脱していない（認証とナビゲーションのみ）

#### II. 厳密な型安全性 ✅ PASS
- すべてのエンティティにTypeScript型定義を記載
- Supabaseの型生成機能を活用する計画
- navigation/types.tsで型安全なナビゲーション実装

#### III. シンプル優先 ✅ PASS
- 複雑な状態管理を避け、React Context + Supabase Authで十分
- カスタムテーブル不要（Supabase Authの標準テーブルのみ）
- 過度な抽象化なし

#### IV. 最新安定版スタック ✅ PASS
- research.mdですべての技術選定を文書化
- 最新安定版のみ使用（RN 0.81, Expo 54, etc.）

#### V. テスト・品質 ✅ PASS
- quickstart.mdで動作確認手順を明記
- テストディレクトリ構造を定義（__tests__/integration, __tests__/unit）

**再評価判定**: すべてのゲートを引き続きPASS。実装フェーズへ進む準備完了。

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
kimamap_demo/
├── app/                      # React Native/Expoアプリケーション
│   ├── index.tsx            # エントリーポイント
│   ├── contexts/            # Reactコンテキスト
│   │   └── AuthContext.tsx # 認証状態管理
│   ├── navigation/          # ナビゲーション設定
│   │   ├── BottomTabNavigator.tsx
│   │   ├── RootNavigator.tsx
│   │   └── types.ts
│   ├── screens/             # 画面コンポーネント
│   │   ├── LoginScreen.tsx
│   │   ├── MapScreen.tsx   # Phase 1ではプレースホルダー
│   │   └── ProfileScreen.tsx
│   └── config/              # 設定ファイル
│       └── supabase.ts     # Supabaseクライアント初期化
│
├── __tests__/               # テストファイル
│   ├── integration/
│   │   └── auth.test.tsx
│   └── unit/
│       └── navigation.test.tsx
│
├── App.tsx                  # ルートコンポーネント
├── app.json                 # Expo設定
├── package.json
├── tsconfig.json
├── babel.config.js
├── .env.example             # 環境変数テンプレート
└── .env                     # 環境変数（gitignore対象）
```

**Structure Decision**: Phase 1はモバイルアプリのみ（バックエンドAPIは Phase 3で追加）。Expo推奨の`app/`ディレクトリ構造を採用し、機能ごとにディレクトリを分割（contexts, navigation, screens, config）。テストはルートの`__tests__/`に配置。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**該当なし** - すべてのConstitution Checkがパスしており、正当化が必要な違反はありません。

---

## 成果物サマリー

### Phase 0: Research（完了）
- ✅ `research.md` - 6つの技術的決定事項を文書化
  - Supabase Auth with Google OAuth
  - React Navigation 7.x アーキテクチャ
  - Expo SDK 54 セットアップ
  - セッション永続化パターン
  - エラーハンドリング戦略
  - TypeScript 型定義戦略

### Phase 1: Design（完了）
- ✅ `data-model.md` - 3つのエンティティ定義
  - User（Supabase Auth管理）
  - Session（Supabase Auth + AsyncStorage）
  - NavigationState（React Navigation管理）
- ✅ `contracts/` - Phase 1では該当なし（README.mdで説明）
- ✅ `quickstart.md` - セットアップガイド（30-45分）

---

## 次のステップ

### 1. タスク分解（即座に実行可能）

```bash
/speckit.tasks
```

このコマンドで `tasks.md` を生成し、実装タスクを依存関係順に分解します。

### 2. 実装開始

```bash
/speckit.implement
```

`tasks.md` に基づいて実装を開始します。

### 3. 主要な実装タスク（予想）

1. **Expoプロジェクトセットアップ** (30分)
   - `npx create-expo-app` 実行
   - 依存関係インストール
   - TypeScript設定

2. **Supabase設定** (45分)
   - Supabaseプロジェクト作成
   - Google OAuth設定
   - 環境変数設定

3. **認証実装** (3-4時間)
   - `app/config/supabase.ts`
   - `app/contexts/AuthContext.tsx`
   - `app/screens/LoginScreen.tsx`

4. **ナビゲーション実装** (2-3時間)
   - `app/navigation/types.ts`
   - `app/navigation/BottomTabNavigator.tsx`
   - `app/navigation/RootNavigator.tsx`

5. **画面実装** (2-3時間)
   - `app/screens/MapScreen.tsx` (プレースホルダー)
   - `app/screens/ProfileScreen.tsx`

6. **テスト実装** (2-3時間)
   - `__tests__/integration/auth.test.tsx`
   - `__tests__/unit/navigation.test.tsx`

**合計予想時間**: 8-10時間（実働1-2日）

---

## 品質ゲート（Phase 1完了前）

### 必須チェック項目

- [ ] すべての機能要件（FR-001 ~ FR-019）を満たしている
- [ ] 4つのユーザーストーリーの受け入れシナリオが全てパス
- [ ] TypeScript strictモードでビルドエラーなし
- [ ] 認証フローのユニットテスト・統合テストが通過
- [ ] ナビゲーションのユニットテストが通過
- [ ] 手動QAチェックリスト完了（`/speckit.checklist`で生成）
- [ ] Constitution準拠性確認完了

### パフォーマンス目標

- [ ] 認証フロー完了時間: 30秒以内
- [ ] タブ切り替え時間: 500ms以内
- [ ] 初回認証成功率: 95%以上（10回テストで9回以上成功）

### セキュリティ確認

- [ ] 環境変数（`.env`）がgitignore対象になっている
- [ ] Supabase Anon Keyが公開されていない（クライアント側で使用はOK）
- [ ] セッショントークンが安全に保存されている（AsyncStorage）

---

## リスクと緩和策

| リスク | 発生確率 | 影響 | 緩和策 |
|-------|---------|-----|--------|
| Google OAuth設定の複雑さ | 中 | 高 | quickstart.mdに詳細な手順を記載済み |
| React Native 0.81の新機能学習コスト | 低 | 中 | 主要な変更点をresearch.mdに文書化済み |
| Expo SDK 54のバグ | 低 | 高 | 最新安定版のみ使用、問題発生時は公式ドキュメント参照 |
| セッション永続化の実装ミス | 中 | 中 | Supabase Authのビルトイン機能を活用、カスタム実装を避ける |
| TypeScript型エラー | 低 | 低 | strictモード強制、リンター設定、型定義の明確化 |

---

## プランニング完了

**ステータス**: ✅ 完了
**日時**: 2025-11-16
**次のアクション**: `/speckit.tasks` でタスク分解を実行

---

**このプランは `/speckit.plan` コマンドにより生成されました。**
