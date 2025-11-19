import React from 'react';
// 1. ナビゲーション全体を管理するコンテナをインポート
import { NavigationContainer } from '@react-navigation/native';
// 2. さっき作ったタブナビゲーターをインポート
import BottomTabNavigator from './app/navigation/BottomTabNavigator';
export default function App() {
  return (
    // 3. アプリ全体を NavigationContainer で包む
    <NavigationContainer>
      {/* 4. ここにタブナビゲーターを表示！ */}
      <BottomTabNavigator />
    </NavigationContainer>
  );
}
