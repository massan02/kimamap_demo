import React, { createContext, useContext, useEffect, useState } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../config/supabase';
import type { AuthContextType } from '../types/auth';
import type { Session, User } from '@supabase/supabase-js';

// Web対応のため必要
WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URLからセッションを作成するヘルパー関数（PKCEフロー）
const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);

  // PKCEフローでは code パラメータを使用
  const { code } = params;

  if (!code) return;

  // 公式メソッドでコード交換（PKCE検証を含む）
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) throw error;
  return data.session;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ディープリンクURL監視（useLinkingURLが自動的にURL変更を追跡）
  const url = Linking.useLinkingURL();

  useEffect(() => {
    // 初回セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 認証状態変更のリスナー
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ディープリンクハンドリング（URL変更時にセッション作成）
  useEffect(() => {
    if (url) {
      createSessionFromUrl(url).catch((error) => {
        console.error('Error creating session from URL:', error);
      });
    }
  }, [url]);

  const signInWithGoogle = async () => {
    try {
      // リダイレクトURIを生成
      const redirectTo = makeRedirectUri({
        scheme: 'kimamap',
        path: 'auth/callback',
      });

      // OAuth URLを取得
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.url) {
        throw new Error('No OAuth URL returned');
      }

      // ブラウザでOAuth認証を開始
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      // リダイレクト後のURLからセッションを作成
      if (result.type === 'success') {
        const { url } = result;
        await createSessionFromUrl(url);
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
