import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainTabNavigator from './app/navigation/MainTabNavigator';
import { AuthProvider, useAuth } from './app/contexts/AuthContext';
import LoginScreen from './app/screens/LoginScreen';
import { View, ActivityIndicator } from 'react-native';

// AuthProviderの内側で使うためのコンポーネント
function AppContent() {
  const { session, loading } = useAuth();

  // 読み込み中はくるくるを表示
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* セッションがあれば地図画面（MainTabNavigator）、なければログイン画面を表示 */}
      {session ? <MainTabNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    // アプリ全体に認証機能を提供
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}