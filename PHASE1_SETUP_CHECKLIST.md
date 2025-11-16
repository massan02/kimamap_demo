# Phase 1 セットアップチェックリスト

**作成日**: 2025-11-16
**対象**: 001-auth-and-navigation

---

## 📋 Phase 1で必要な全作業

### ✅ 完了済み（確認不要）

- [x] Spec Kitの統合（`.specify/`ディレクトリ）
- [x] 仕様書の作成（`specs/001-auth-and-navigation/spec.md`）
- [x] 実装計画の作成（`specs/001-auth-and-navigation/plan.md`）
- [x] タスクリストの作成（`specs/001-auth-and-navigation/tasks.md`）

---

## 🔨 実施が必要な作業

### A. ローカルプロジェクトのセットアップ

#### A-1. Expoプロジェクトの初期化

```bash
# プロジェクトルートで実行
cd /home/user/kimamap_demo

# Expoプロジェクト初期化（blank-typescriptテンプレート）
npx create-expo-app@latest . --template blank-typescript

# 確認: package.jsonが作成されているか
ls -la package.json
```

**期待される結果**:
- `package.json`、`App.tsx`、`app.json`などが作成される
- `app/`ディレクトリが作成される

#### A-2. 必要な依存関係のインストール

```bash
# React Navigation関連
npx expo install @react-navigation/native@^7.1.0 @react-navigation/bottom-tabs@^7.8.0 @react-navigation/stack@^7.0.0
npx expo install react-native-screens@^4.0.0 react-native-safe-area-context@^5.0.0

# Supabase Auth
npm install @supabase/supabase-js@^2.81.0

# AsyncStorage（セッション永続化用）
npx expo install @react-native-async-storage/async-storage

# 確認: package.jsonに追加されているか
cat package.json | grep -A 20 "dependencies"
```

#### A-3. TypeScript設定

```bash
# tsconfig.jsonを確認・編集
cat tsconfig.json
```

**必要な設定（`tsconfig.json`）**:
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "esnext",
    "lib": ["esnext"],
    "jsx": "react-native",
    "moduleResolution": "node",
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "extends": "expo/tsconfig.base",
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### A-4. `.gitignore`ファイルの作成・確認

```bash
# .gitignoreを作成または確認
cat > .gitignore << 'EOF'
# Expo
.expo/
dist/
web-build/

# Dependencies
node_modules/

# Environment variables
.env
.env.local

# OS
.DS_Store
*.swp
*.swo
*~

# IDE
.vscode/
.idea/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript
*.tsbuildinfo

# Build
build/

# React Native
.expo-shared/
EOF

# 確認
cat .gitignore
```

#### A-5. `.env.example`ファイルの作成

```bash
# .env.exampleを作成
cat > .env.example << 'EOF'
# Supabase設定
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EOF

# 確認
cat .env.example
```

#### A-6. プロジェクトディレクトリ構造の作成

```bash
# 必要なディレクトリを作成
mkdir -p app/contexts
mkdir -p app/navigation
mkdir -p app/screens
mkdir -p app/config
mkdir -p __tests__/integration
mkdir -p __tests__/unit

# 確認
tree -L 2 app/ __tests__/
# または
find app/ __tests__/ -type d
```

---

### B. Supabaseプロジェクトのセットアップ

#### B-1. Supabaseプロジェクトの作成

**手順**:

1. **Supabaseダッシュボードにアクセス**
   - URL: https://supabase.com/dashboard

2. **新規プロジェクトを作成**
   - 「New project」をクリック
   - 組織を選択（または新規作成）

3. **プロジェクト情報を入力**
   ```
   Project name: kimamap-demo
   Database Password: [安全なパスワードを設定・メモする]
   Region: Northeast Asia (Tokyo)
   Pricing Plan: Free（開発用）
   ```

4. **「Create new project」をクリック**
   - プロジェクト作成には1-2分かかります

5. **プロジェクト作成完了を確認**
   - ダッシュボードにプロジェクトが表示されることを確認

#### B-2. Supabase認証情報の取得

**手順**:

1. **Settings → API に移動**
   - 左サイドバーから「Settings」→「API」をクリック

2. **以下の情報をコピー**
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGci...（長い文字列）
   ```

3. **`.env`ファイルを作成**
   ```bash
   cat > .env << 'EOF'
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   EOF
   ```

4. **`.env`ファイルの内容を確認**
   ```bash
   cat .env
   ```

**⚠️ 注意**: `.env`ファイルは`.gitignore`に含まれているため、Gitにコミットされません。

---

### C. Google OAuthの設定

#### C-1. Google Cloud Consoleでの設定

**手順**:

1. **Google Cloud Consoleにアクセス**
   - URL: https://console.cloud.google.com/

2. **プロジェクトを作成または選択**
   - 上部のプロジェクトドロップダウンから「新しいプロジェクト」をクリック
   - プロジェクト名: `kimamap-demo`
   - 「作成」をクリック

3. **APIs & Services → Credentialsに移動**
   - 左サイドバーから「APIs & Services」→「Credentials」を選択

4. **OAuth同意画面を設定**
   - 「OAuth consent screen」タブをクリック
   - User Type: 「External」を選択
   - 「CREATE」をクリック

   **アプリ情報を入力**:
   ```
   App name: 気ままっぷ (Kimamap)
   User support email: [あなたのメールアドレス]
   Developer contact information: [あなたのメールアドレス]
   ```
   - 「SAVE AND CONTINUE」をクリック

   **Scopesはスキップ**:
   - 「SAVE AND CONTINUE」をクリック

   **Test usersを追加（オプション）**:
   - テスト段階で使用するGoogleアカウントを追加
   - 「SAVE AND CONTINUE」をクリック

5. **OAuth 2.0 Client IDを作成**
   - 「Credentials」タブに戻る
   - 「+ CREATE CREDENTIALS」→「OAuth 2.0 Client IDs」を選択

   **アプリケーションタイプを選択**:
   ```
   Application type: Web application
   Name: Kimamap Web Client
   ```

   **Authorized redirect URIsを追加**:
   - 「+ ADD URI」をクリック
   - 以下のURIを追加（`xxxxx`はあなたのSupabase Project Ref）:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```

   **Supabase Project Refの確認方法**:
   - Supabaseダッシュボード → Settings → API
   - Project URL: `https://xxxxx.supabase.co` の `xxxxx` 部分

6. **「CREATE」をクリック**
   - Client IDとClient Secretが表示される
   - **必ずメモする**（後でSupabaseに入力）

#### C-2. SupabaseでGoogle OAuthを有効化

**手順**:

1. **Supabaseダッシュボードにアクセス**
   - プロジェクト: `kimamap-demo`

2. **Authentication → Providersに移動**
   - 左サイドバーから「Authentication」→「Providers」を選択

3. **Googleプロバイダーを有効化**
   - 「Google」を探してクリック
   - 「Enable Sign in with Google」をONにする

4. **Google認証情報を入力**
   ```
   Client ID: [Google Cloud Consoleで取得したClient ID]
   Client Secret: [Google Cloud Consoleで取得したClient Secret]
   ```

5. **Redirect URLを確認**
   - 自動的に表示される以下のURLをコピー:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```
   - このURLがGoogle Cloud ConsoleのAuthorized redirect URIsに追加されているか確認

6. **「Save」をクリック**

#### C-3. 設定の動作確認

**ローカルでテスト**（後のフェーズで実施）:
```typescript
// app/config/supabase.ts を作成後にテスト
import { supabase } from './config/supabase'

const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})

if (error) {
  console.error('OAuth設定エラー:', error)
} else {
  console.log('OAuth設定成功')
}
```

---

## 🌟 Phase 1完了後の確認事項

### ローカル環境

- [ ] `npm start`でExpo開発サーバーが起動する
- [ ] TypeScriptコンパイルエラーがない
- [ ] `.gitignore`に`.env`が含まれている
- [ ] `.env`ファイルが作成され、Supabase認証情報が設定されている
- [ ] `.env.example`ファイルが作成されている
- [ ] 必要なディレクトリ（`app/contexts`、`app/navigation`など）が作成されている
- [ ] 必要な依存関係がすべてインストールされている

### Supabase

- [ ] Supabaseプロジェクト `kimamap-demo` が作成されている
- [ ] Project URLとAnon Keyを取得済み
- [ ] Google OAuthプロバイダーが有効化されている
- [ ] Google Client IDとClient Secretが設定されている

### Google Cloud Console

- [ ] Google Cloudプロジェクト `kimamap-demo` が作成されている
- [ ] OAuth同意画面が設定されている
- [ ] OAuth 2.0 Client IDが作成されている
- [ ] Authorized redirect URIsにSupabaseのコールバックURLが追加されている

---

## 📝 必要な環境変数の完全リスト

### `.env`ファイル（gitignore対象）

```bash
# Supabase設定（必須）
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Google Maps API Key（Phase 3で追加）
# EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

### `.env.example`ファイル（Gitにコミット）

```bash
# Supabase設定
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Maps API Key（Phase 3で追加）
# EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Phase 1で必要な環境変数**: 2つ
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Phase 3以降で追加予定**:
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`（地図機能用）

---

## 🚀 次のステップ

Phase 1完了後、以下のコマンドで確認:

```bash
# Expo開発サーバー起動
npm start

# TypeScriptコンパイルチェック
npx tsc --noEmit

# 環境変数が正しく読み込まれるか確認
npx expo start
# ターミナルでエラーがないか確認
```

Phase 1が完了したら、Phase 2（基盤実装）に進みます。

---

**このチェックリストは Phase 1 セットアップ専用です。**
**Phase 2以降のタスクは `specs/001-auth-and-navigation/tasks.md` を参照してください。**
