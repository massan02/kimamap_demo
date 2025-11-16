# Data Model: ユーザー認証とアプリ基本構造

**Feature**: 001-auth-and-navigation
**Date**: 2025-11-16
**Phase**: 1

## 概要

Phase 1で扱うデータモデルは認証とナビゲーション状態の管理に限定されます。データベーススキーマは Supabase Auth が自動管理するため、カスタムテーブルは不要です。

---

## エンティティ定義

### 1. User（ユーザー）

**説明**: Googleアカウント情報を持つ認証済みアプリユーザー

**データソース**: Supabase Auth（`auth.users`テーブル - 自動管理）

**フィールド**:

| フィールド名 | 型 | 必須 | 説明 | 検証ルール |
|------------|-----|-----|------|----------|
| id | UUID | ○ | ユーザー一意識別子 | Supabaseが自動生成 |
| email | string | ○ | メールアドレス | Googleアカウントから取得 |
| user_metadata.name | string | ○ | 表示名 | Googleアカウントから取得 |
| user_metadata.avatar_url | string | × | プロフィール画像URL | Googleアカウントから取得 |
| created_at | timestamp | ○ | アカウント作成日時 | Supabaseが自動設定 |
| last_sign_in_at | timestamp | × | 最終ログイン日時 | Supabaseが自動更新 |

**関連性**:
- Session（1:N） - 1人のユーザーは複数のセッションを持つ（デバイスごと）

**状態遷移**:
```
[未登録] --Google OAuth完了--> [登録済み・ログイン中]
[登録済み・ログイン中] --ログアウト--> [登録済み・ログアウト中]
[登録済み・ログアウト中] --再ログイン--> [登録済み・ログイン中]
```

**TypeScript型定義**:
```typescript
type User = {
  id: string
  email: string
  user_metadata: {
    name: string
    avatar_url?: string
  }
  created_at: string
  last_sign_in_at?: string
}
```

---

### 2. Session（セッション）

**説明**: アクティブなユーザー認証セッション

**データソース**: Supabase Auth（`auth.sessions`テーブル - 自動管理） + AsyncStorage（クライアント側永続化）

**フィールド**:

| フィールド名 | 型 | 必須 | 説明 | 検証ルール |
|------------|-----|-----|------|----------|
| access_token | string (JWT) | ○ | アクセストークン | 有効期限: 1時間 |
| refresh_token | string | ○ | リフレッシュトークン | 有効期限: 30日 |
| expires_at | number (Unix timestamp) | ○ | アクセストークン有効期限 | - |
| user | User | ○ | ユーザー情報（参照） | - |

**ライフサイクル**:
- **作成**: Google OAuthログイン成功時
- **更新**: アクセストークン有効期限の60分前に自動リフレッシュ
- **削除**: ログアウト時、またはリフレッシュトークン期限切れ時

**状態遷移**:
```
[セッションなし] --ログイン成功--> [有効なセッション]
[有効なセッション] --有効期限接近--> [リフレッシュ中]
[リフレッシュ中] --リフレッシュ成功--> [有効なセッション]
[リフレッシュ中] --リフレッシュ失敗--> [セッション期限切れ]
[有効なセッション] --ログアウト--> [セッションなし]
[有効なセッション] --30日経過--> [セッション期限切れ]
```

**TypeScript型定義**:
```typescript
type Session = {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}
```

---

### 3. NavigationState（ナビゲーション状態）

**説明**: 現在のタブ選択と画面状態（クライアント側のみ）

**データソース**: React Navigation State（メモリ上） + AsyncStorage（オプション - セッション永続化用）

**フィールド**:

| フィールド名 | 型 | 必須 | 説明 | 検証ルール |
|------------|-----|-----|------|----------|
| activeTab | 'Map' \| 'Profile' | ○ | 現在アクティブなタブ | 2つのタブのいずれか |
| screenState | Record<string, any> | × | 画面固有の状態データ（スクロール位置など） | - |

**状態遷移**:
```
[Map] --Profileタブタップ--> [Profile]
[Profile] --Mapタブタップ--> [Map]
```

**TypeScript型定義**:
```typescript
type TabName = 'Map' | 'Profile'

type NavigationState = {
  activeTab: TabName
  screenState?: {
    [screenName: string]: any
  }
}
```

---

## データフロー

### 1. 初回ログインフロー

```
[ユーザー]
  → LoginScreen: "Googleでログイン"ボタンタップ
  → Supabase Auth: signInWithOAuth({ provider: 'google' })
  → Google OAuth: 同意画面表示
  → Google OAuth: 認証成功
  → Supabase Auth: User + Sessionを作成
  → AsyncStorage: Sessionを永続化
  → AuthContext: session状態を更新
  → RootNavigator: MainTabs画面へ遷移
  → BottomTabNavigator: Map画面をデフォルト表示
```

### 2. セッション復元フロー（アプリ再起動）

```
[ユーザー]
  → App起動
  → AuthContext: AsyncStorageからSession読み込み
  → Supabase Auth: getSession()でSession検証
  → Case A: Session有効
      → RootNavigator: MainTabs画面へ遷移
  → Case B: Session期限切れ
      → RootNavigator: Login画面へ遷移
```

### 3. ログアウトフロー

```
[ユーザー]
  → ProfileScreen: "ログアウト"ボタンタップ
  → Supabase Auth: signOut()
  → AsyncStorage: Sessionを削除
  → AuthContext: session状態をnullに更新
  → RootNavigator: Login画面へ遷移
```

---

## セキュリティ考慮事項

### 1. トークン管理
- **アクセストークン**: メモリ上のみ保持（XSS対策）
- **リフレッシュトークン**: AsyncStorageに暗号化して保存（Supabase自動処理）
- **トークン送信**: HTTPS通信のみ（Supabaseがデフォルト）

### 2. セッション検証
- アプリ起動時にセッション有効性を検証
- APIリクエスト前にトークン有効期限をチェック
- 無効なセッション検出時は自動ログアウト

### 3. OAuth セキュリティ
- PKCE（Proof Key for Code Exchange）をSupabaseが自動適用
- State パラメータでCSRF攻撃を防止（Supabaseが自動処理）

---

## パフォーマンス最適化

### 1. セッション読み込み
- AsyncStorageの非同期読み込み中はローディング画面表示
- セッション復元は並列実行（ブロッキングしない）

### 2. ナビゲーション
- タブ画面の遅延ロード（初回表示時のみマウント）
- 画面状態の保持（タブ切り替え時に再レンダリングしない）

---

## データベーススキーマ（Phase 1範囲外）

Phase 1ではカスタムテーブルを作成しません。Supabase Authの標準テーブル（`auth.users`, `auth.sessions`）のみを使用します。

**Phase 4で追加予定**:
- `public.plans` - ユーザーが作成したプラン（保存済み機能）
- Row Level Security (RLS) - ユーザーごとのデータアクセス制御

---

## 検証ルール

### 1. ユーザー入力検証（Phase 1では該当なし）
Phase 1にはユーザー入力フォームがないため、検証ルールは不要です。

### 2. セッション検証
- アクセストークンのJWT署名検証（Supabaseが自動実行）
- トークン有効期限チェック（`expires_at < Date.now()`）
- リフレッシュトークンの有効性チェック（Supabaseが自動実行）

---

## 次のステップ

- Contracts（API契約）の定義: Phase 1ではバックエンドAPIがないため、contracts/は空ディレクトリ
- Quickstart: 開発者向けセットアップガイドの作成
