// 1. 必要な部品をReactとReact Nativeから持ってくる
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // test_dataテーブルから全てのカラム(*)を取得
    const { data, error } = await supabase
      .from('test_data')
      .select('*');

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setData(data || []);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Test Data</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});