// 1. 必要な部品をReactとReact Nativeから持ってくる
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// 2. 関数コンポーネントを定義する（ファイル名と同じ名前にするのが通例）
export default function ProfileScreen() {
  // 3. 見た目（JSX）を返す
  return (
    // Viewは「箱（divのようなもの）」
    <View style={styles.container}>
      {/* Textは「文字」 */}
      <Text>ここはプロフィール画面です</Text>
    </View>
  );
}
// 4. スタイル（見た目の設定）を定義する
const styles = StyleSheet.create({
  container: {
    flex: 1,             // 画面いっぱいに広げる
    justifyContent: 'center', // 上下中央揃え
    alignItems: 'center',     // 左右中央揃え
    backgroundColor: '#fff',  // 背景色：白
  },
});