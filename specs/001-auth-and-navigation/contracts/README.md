# API Contracts

**Feature**: 001-auth-and-navigation
**Phase**: 1

## 概要

Phase 1では、カスタムバックエンドAPIを実装しないため、API契約は定義しません。

## Phase 1で使用する外部API

### Supabase Auth API

Phase 1では、Supabase Authの標準APIのみを使用します。これらはSupabaseが提供する公式APIであり、独自の契約定義は不要です。

**使用するSupabase Auth メソッド**:

1. **signInWithOAuth**
   - Provider: Google
   - Return: `{ data: { user, session }, error }`
   - Documentation: https://supabase.com/docs/reference/javascript/auth-signinwithoauth

2. **getSession**
   - Return: `{ data: { session }, error }`
   - Documentation: https://supabase.com/docs/reference/javascript/auth-getsession

3. **onAuthStateChange**
   - Callback: `(event, session) => void`
   - Events: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
   - Documentation: https://supabase.com/docs/reference/javascript/auth-onauthstatechange

4. **signOut**
   - Return: `{ error }`
   - Documentation: https://supabase.com/docs/reference/javascript/auth-signout

## Phase 3以降で追加予定

Phase 3でバックエンドサーバーを構築する際、以下のAPI契約を定義します:

- `POST /api/plan` - AIプラン生成API
- OpenAPI 3.0仕様書
- リクエスト/レスポンススキーマ（Zod）
- エラーレスポンス定義

---

**次の作業**: quickstart.md の作成
