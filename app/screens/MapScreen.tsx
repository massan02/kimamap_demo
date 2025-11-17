import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MainTabScreenProps } from '../navigation/types';

type Props = MainTabScreenProps<'Map'>;

export default function MapScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>地図画面</Text>
      <Text style={styles.subtitle}>地図機能は準備中です</Text>
      <Text style={styles.description}>
        Phase 3で実装予定の機能：{'\n'}
        • 現在地の表示{'\n'}
        • おでかけルートの提案{'\n'}• スポット検索
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
});
