# Quickstart: ユーザー認証とアプリ基本構造

**Feature**: 001-auth-and-navigation
**Phase**: 1
**所要時間**: 約30-45分

## 前提条件

### 必須ソフトウェア

- **Node.js**: 20.19.4以上
  ```bash
  node --version  # v20.19.4以上であることを確認
  ```

- **npm**: 10.x以上
  ```bash
  npm --version
  ```

- **Git**: 最新版
  ```bash
  git --version
  ```

### オプション（iOS開発の場合）

- **Xcode**: 16.1以上（macOSのみ）
- **CocoaPods**: 最新版
  ```bash
  sudo gem install cocoapods
  ```

### アカウント準備

1. **Supabaseアカウント**: https://supabase.com でサインアップ
2. **Googleアカウント**: OAuth設定用（既存のものでOK）

---

## セットアップ手順

### 1. Expoプロジェクトの初期化（初回のみ）

```bash
# プロジェクトディレクトリに移動
cd /home/user/kimamap_demo

# Expoプロジェクト初期化（blank-typescriptテンプレート）
npx create-expo-app@latest . --template blank-typescript

# Expo SDK 54にアップグレード（必要に応じて）
npx expo install expo@^54.0.0
```

### 2. 必要な依存関係のインストール

```bash
# React Navigation関連
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context

# Supabase Auth
npm install @supabase/supabase-js@^2.81.0

# AsyncStorage（セッション永続化用）
npx expo install @react-native-async-storage/async-storage
```

### 3. Supabaseプロジェクトのセットアップ

#### 3.1 プロジェクト作成

1. https://supabase.com/dashboard にアクセス
2. "New project" をクリック
3. プロジェクト名: `kimamap-demo`
4. Database Password: 安全なパスワードを設定（メモしておく）
5. Region: 最寄りのリージョン（例: Northeast Asia (Tokyo)）
6. "Create new project" をクリック

#### 3.2 Google OAuth設定

1. Supabaseダッシュボードで "Authentication" → "Providers" に移動
2. "Google" を有効化
3. Google Cloud Consoleでの設定:
   ```
   1. https://console.cloud.google.com/ にアクセス
   2. 新しいプロジェクトを作成（または既存プロジェクトを選択）
   3. "APIs & Services" → "Credentials" に移動
   4. "Create Credentials" → "OAuth 2.0 Client IDs" を選択
   5. Application type: "Web application"
   6. Authorized redirect URIs:
      https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
4. 生成された Client ID と Client Secret をSupabaseの Google Provider設定に入力
5. "Save" をクリック

#### 3.3 環境変数の設定

1. Supabaseダッシュボードで "Settings" → "API" に移動
2. 以下の値をコピー:
   - `Project URL`
   - `anon` / `public` key

3. プロジェクトルートに `.env` ファイルを作成:
   ```bash
   touch .env
   ```

4. `.env` に以下を記載:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. `.env.example` も作成（gitにコミット用）:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

6. `.gitignore` に `.env` が含まれていることを確認:
   ```bash
   echo ".env" >> .gitignore
   ```

---

## プロジェクト構造の作成

```bash
# 必要なディレクトリ構造を作成
mkdir -p app/contexts
mkdir -p app/navigation
mkdir -p app/screens
mkdir -p app/config
mkdir -p __tests__/integration
mkdir -p __tests__/unit
```

---

## 開発サーバーの起動

### Expo Goを使用する場合（推奨 - 初期開発）

```bash
# 開発サーバー起動
npm start

# または
npx expo start
```

スマートフォンでExpo Goアプリをインストールし、QRコードをスキャンしてアプリを起動します。

- iOS: App Store から "Expo Go" をダウンロード
- Android: Google Play から "Expo Go" をダウンロード

### iOSシミュレーターを使用する場合（macOSのみ）

```bash
npm run ios

# または
npx expo run:ios
```

### Androidエミュレーターを使用する場合

```bash
npm run android

# または
npx expo run:android
```

---

## 実装の開始

### 最初のステップ

1. **Supabaseクライアントの設定** (`app/config/supabase.ts`)
2. **AuthContextの実装** (`app/contexts/AuthContext.tsx`)
3. **画面コンポーネントの作成**:
   - `app/screens/LoginScreen.tsx`
   - `app/screens/MapScreen.tsx`
   - `app/screens/ProfileScreen.tsx`
4. **ナビゲーションの設定**:
   - `app/navigation/types.ts`
   - `app/navigation/BottomTabNavigator.tsx`
   - `app/navigation/RootNavigator.tsx`

詳細な実装手順は `tasks.md` を参照してください（`/speckit.tasks` コマンドで生成）。

---

## 動作確認

### 認証フローのテスト

1. アプリを起動
2. ログイン画面が表示されることを確認
3. "Googleでログイン" ボタンをタップ
4. Google OAuth同意画面が表示されることを確認
5. 認証を許可
6. 地図画面（プレースホルダー）が表示されることを確認
7. ボトムタブで "マイページ" に切り替え
8. プロフィール情報（メールアドレス、画像）が表示されることを確認
9. "ログアウト" ボタンをタップ
10. ログイン画面に戻ることを確認

### セッション永続化のテスト

1. ログイン状態でアプリを完全に終了
2. アプリを再度起動
3. ログイン画面をスキップして地図画面が表示されることを確認

---

## トラブルシューティング

### Metro Bundlerエラー

```bash
# キャッシュクリア
npx expo start --clear

# または
rm -rf node_modules .expo
npm install
```

### iOS Podエラー（macOSのみ）

```bash
cd ios
pod install
cd ..
npx expo run:ios
```

### Android Gradleエラー

```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Supabase認証エラー

1. `.env` ファイルの `EXPO_PUBLIC_SUPABASE_URL` と `EXPO_PUBLIC_SUPABASE_ANON_KEY` が正しいか確認
2. Google OAuth設定で Redirect URI が正しいか確認
3. Supabaseダッシュボードで Google Provider が有効化されているか確認

### TypeScriptエラー

```bash
# 型定義の再生成
npx expo install --fix

# TypeScriptキャッシュクリア
rm -rf .expo
npm start
```

---

## 次のステップ

1. **タスク分解**: `/speckit.tasks` コマンドでタスクを生成
2. **実装開始**: `/speckit.implement` コマンドで実装を開始
3. **テスト実行**: `npm test` でユニットテスト・統合テストを実行
4. **コミット**: 実装完了後、変更をコミット・プッシュ

---

## 参考資料

- [Expo公式ドキュメント](https://docs.expo.dev/)
- [React Navigation公式ドキュメント](https://reactnavigation.org/)
- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase Auth with React Native](https://supabase.com/docs/guides/auth/auth-helpers/react-native)
- [Google OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

**セットアップ完了時間の目安**: 30-45分（Supabaseプロジェクト作成を含む）