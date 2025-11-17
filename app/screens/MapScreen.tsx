import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>マップ画面</Text>
      <Text style={styles.subtitle}>地図表示予定エリア</Text>
      <Text style={styles.note}>(Phase 3でreact-native-mapsを追加予定)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  note: {
    fontSize: 12,
    color: '#999',
  },
});
