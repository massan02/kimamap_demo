# Research: ユーザー認証とアプリ基本構造

**Feature**: 001-auth-and-navigation
**Date**: 2025-11-16
**Status**: 完了

## 目的

Phase 1の実装に必要な技術的決定事項を調査し、最適なアプローチを選択します。

---

## 1. Supabase Auth with Google OAuth

### 決定事項
Supabase AuthのGoogle OAuthプロバイダーを使用してユーザー認証を実装する。

### 理由
- Supabase Authは認証フロー全体を管理（トークン管理、セッション永続化、リフレッシュ）
- Google OAuth 2.0の複雑なフローを抽象化
- RLS（Row Level Security）との統合が容易
- セッション管理がビルトイン（30日間のデフォルト有効期限）
- React Native向けの公式サポート（`@supabase/supabase-js` 2.81.x）

### 実装アプローチ
1. SupabaseプロジェクトでGoogle OAuthプロバイダーを有効化
2. Google Cloud ConsoleでOAuth 2.0クライアントIDを作成
3. `supabase.auth.signInWithOAuth()` を使用してログインフロー開始
4. `supabase.auth.onAuthStateChange()` でセッション状態を監視
5. `supabase.auth.signOut()` でログアウト実装

### 考慮した代替案
- **Firebase Auth**: より多機能だが、本プロジェクトではSupabaseをデータベースとして使用するため、統合の観点でSupabase Authが優位
- **Auth0**: エンタープライズ向けで過剰な機能、コスト面でも不利
- **自前実装**: セキュリティリスクが高く、開発コストも増大

### 参考資料
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth with Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

## 2. React Navigation 7.x アーキテクチャ

### 決定事項
Bottom Tab Navigatorをルートナビゲーターとして使用し、2つのタブ（地図、マイページ）を実装する。

### 理由
- React Navigation 7.1.xは最新安定版で、React Native 0.81と完全互換
- Bottom Tabs Navigatorはモバイルアプリの標準的なナビゲーションパターン
- TypeScript型定義が強化され、型安全なナビゲーションが可能
- パフォーマンス最適化（遅延ロード、プリロード機能）

### ナビゲーション構造
```
RootNavigator (認証状態で分岐)
├── AuthStack
│   └── LoginScreen
└── MainTabs (BottomTabNavigator)
    ├── MapTab → MapScreen (Phase 1ではプレースホルダー)
    └── ProfileTab → ProfileScreen
```

### 実装パターン
- 認証状態をAuthContextで管理し、RootNavigatorで画面を分岐
- タブごとにStackNavigatorを用意（Phase 2以降の拡張に備える）
- 型安全なナビゲーションのため、`navigation/types.ts`で型定義

### 考慮した代替案
- **Stack Navigatorのみ**: タブUIがなく、UXが劣る
- **Drawer Navigator**: モバイルアプリでは Bottom Tabs の方が使いやすい
- **React Router Native**: React Navigationほど成熟していない

### 参考資料
- [React Navigation v7 Documentation](https://reactnavigation.org/docs/getting-started)
- [Bottom Tab Navigator](https://reactnavigation.org/docs/bottom-tab-navigator)
- [Authentication flows](https://reactnavigation.org/docs/auth-flow)

---

## 3. Expo SDK 54 セットアップ

### 決定事項
Expo SDK 54.0.xの`blank-typescript`テンプレートを使用してプロジェクトを初期化する。

### 理由
- Expo SDK 54は React Native 0.81に対応
- プリコンパイルされたXCFrameworkによりiOSビルド時間が大幅短縮（最大10倍）
- 新アーキテクチャ（Fabric, Turbo Modules）のオプショナルサポート
- Expo Goでの開発が可能（初期開発が高速）
- `npx expo install`による依存関係の自動バージョン管理

### セットアップ手順
```bash
npx create-expo-app@latest . --template blank-typescript
npx expo install expo@^54.0.0
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npm install @supabase/supabase-js@^2.81.0
```

### 環境変数管理
- Expoでは`EXPO_PUBLIC_`プレフィックスを使用
- `.env`ファイル（gitignore対象）に以下を定義:
  ```
  EXPO_PUBLIC_SUPABASE_URL=<your-url>
  EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-key>
  ```

### 考慮した代替案
- **React Native CLI**: Expoより柔軟だが、初期セットアップが複雑で開発速度が遅い
- **Ignite CLI**: React Native Communityのボイラープレート、今回は最小構成から始めるため不要

### 参考資料
- [Expo SDK 54 Release Notes](https://blog.expo.dev/expo-sdk-54-0f56c84e1e7e)
- [Expo環境変数](https://docs.expo.dev/guides/environment-variables/)

---

## 4. セッション永続化パターン

### 決定事項
Supabase AuthのビルトインセッションストレージとReact Contextを組み合わせてセッション管理を実装する。

### 理由
- Supabase Authは自動的にセッションをローカルストレージに永続化
- React Native環境では`AsyncStorage`を使用（Supabaseが自動検出）
- セッショントークンの自動リフレッシュ（有効期限前に更新）
- `onAuthStateChange`リスナーでアプリ全体の認証状態を同期

### 実装パターン
```typescript
// AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // 初回セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // セッション変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### セッション有効期限
- デフォルト: 30日間
- 自動リフレッシュ: 有効期限の60分前
- 期限切れ時: 自動的にログイン画面へリダイレクト

### 考慮した代替案
- **Redux Persist**: 過剰な複雑性、Supabaseのビルトイン機能で十分
- **SecureStore**: より高セキュリティだが、Phase 1では不要（将来的に検討可）

### 参考資料
- [Supabase Auth Helpers for React Native](https://supabase.com/docs/guides/auth/auth-helpers/react-native)
- [AsyncStorage with Supabase](https://supabase.com/docs/reference/javascript/initializing#with-react-native-asyncstorage)

---

## 5. エラーハンドリング戦略

### 決定事項
認証フローでのネットワークエラーに対して、自動リトライ（2-3回）とユーザーフレンドリーなエラーメッセージを実装する。

### 理由
- 仕様（FR-017）で明示的に要求されている
- ネットワーク不安定時のUX向上
- エラーの種類に応じた適切なメッセージ表示

### エラー分類と対応
| エラータイプ | 自動リトライ | ユーザーメッセージ |
|------------|------------|----------------|
| ネットワークエラー | ○ (2-3回) | 「ネットワーク接続を確認してください」 |
| OAuth拒否 | × | 「ログインがキャンセルされました」 |
| Supabaseエラー | × | 「認証に失敗しました。後でもう一度お試しください」 |
| 無効なトークン | × (自動ログアウト) | 「セッションが期限切れです。再度ログインしてください」 |

### 実装パターン
```typescript
const signInWithGoogle = async () => {
  let retryCount = 0
  const maxRetries = 3

  while (retryCount < maxRetries) {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })
      if (!error) return
      throw error
    } catch (error) {
      if (isNetworkError(error) && retryCount < maxRetries - 1) {
        retryCount++
        await delay(2000 * retryCount) // Exponential backoff
        continue
      }
      showErrorMessage(error)
      break
    }
  }
}
```

### 参考資料
- [Error Handling Best Practices](https://reactnative.dev/docs/network#known-issues-with-fetch-and-cookie-based-authentication)

---

## 6. TypeScript 型定義戦略

### 決定事項
Supabaseの型生成機能を使用し、厳密な型安全性を確保する。

### 理由
- Supabase CLIで`database.types.ts`を自動生成可能
- ランタイムエラーを防止
- IDEの自動補完とリファクタリング支援

### 型定義構造
```typescript
// types/navigation.ts - ナビゲーション型
export type RootStackParamList = {
  Login: undefined
  Main: undefined
}

export type MainTabParamList = {
  Map: undefined
  Profile: undefined
}

// types/auth.ts - 認証型
export type AuthContextType = {
  session: Session | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

// types/database.ts - Supabase自動生成型（Phase 4で追加）
```

### 参考資料
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/generating-types)
- [React Navigation TypeScript](https://reactnavigation.org/docs/typescript/)

---

## 実装優先順位

1. **高優先度** (Phase 1 必須)
   - Expoプロジェクトセットアップ
   - Supabase認証統合
   - React Navigationセットアップ
   - AuthContext実装

2. **中優先度** (Phase 1完了前)
   - エラーハンドリング
   - テスト実装
   - TypeScript型定義の整備

3. **低優先度** (Phase 2以降)
   - パフォーマンス最適化
   - アクセシビリティ対応
   - アニメーション追加

---

## 未解決事項

**該当なし** - すべての技術的決定事項が明確になっています。

---

## 次のステップ

Phase 1: Data Model, Contracts, Quickstartの生成に進みます。
