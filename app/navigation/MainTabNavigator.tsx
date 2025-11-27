import React from 'react';
// 1. タブナビゲーターを作る関数をインポート
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// 2. さっき作った画面をインポート
import MapStackNavigator from './MapStackNavigator';
import ProfileScreen from '../screens/ProfileScreen';
// 3. タブナビゲーターの実体を作成
const Tab = createBottomTabNavigator();
export default function MainTabNavigator() {
  return (
    // 4. Tab.Navigator で全体を囲む
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      {/* 5. Tab.Screen で各画面を登録する */}
      {/* name: 内部で使う名前, component: 表示する画面 */}
      <Tab.Screen name="Map" component={MapStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}