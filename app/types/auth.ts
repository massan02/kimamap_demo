import type { Session, User } from '@supabase/supabase-js';

// 認証状態の型定義
export type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

// AuthContext の型定義
export type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

// OAuth エラーの型定義
export type OAuthError = {
  message: string;
  code?: string;
  details?: string;
};
