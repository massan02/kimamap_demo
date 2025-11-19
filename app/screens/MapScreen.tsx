import React from 'react';
import { StyleSheet, View } from 'react-native';
// 1. 地図の部品をインポート
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
export default function MapScreen() {
  return (
    <View style={styles.container}>
      {/* 2. MapViewコンポーネントを配置 */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE} // Google Mapsを使う指定
        // 3. 初期表示位置の設定（これがないと海が表示されることも）
        initialRegion={{
          latitude: 33.5902,  // 緯度（例：博多駅）
          longitude: 130.4207, // 経度
          latitudeDelta: 0.01, // ズームレベル（数字が小さいほど拡大）
          longitudeDelta: 0.01,
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',  // 横幅いっぱい
    height: '100%', // 縦幅いっぱい
  },
});
