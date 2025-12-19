import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import { useEffect } from 'react';
import { createPlan } from '../services/api';
import { MainTabParamList, MapStackParamList } from '../navigation/types';

type SearchScreenNavigationProp = NativeStackNavigationProp<MapStackParamList, 'Search'>;

type Transportation = 'walk' | 'bicycle' | 'car';

const TRANSPORTATION_OPTIONS: { value: Transportation; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'walk', label: '徒歩', icon: 'walk' },
  { value: 'bicycle', label: '自転車', icon: 'bicycle' },
  { value: 'car', label: '自動車', icon: 'car' },
];

const DURATION_PRESETS = [
  { label: '30分', value: 30 },
  { label: '1時間', value: 60 },
  { label: '2時間', value: 120 },
  { label: '3時間', value: 180 },
  { label: '半日', value: 240 },
  { label: '1日', value: 480 },
];

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  
  // Form State
  const [query, setQuery] = useState('');
  const [transportation, setTransportation] = useState<Transportation>('walk');
  const [duration, setDuration] = useState(120);
  const [returnToStart, setReturnToStart] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('位置情報エラー', '現在地を取得するために位置情報の許可が必要です。');
          return;
        }

        const currentLocation = await ExpoLocation.getCurrentPositionAsync({});
        setLocation({
          lat: currentLocation.coords.latitude,
          lng: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.log('Error fetching location:', error);
        // Silent fail or show toast
      }
    })();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('入力エラー', '行きたい場所ややりたいことを入力してください。');
      return;
    }

    if (!location) {
      Alert.alert('位置情報エラー', '現在地が取得できていません。少々お待ちください。');
      return;
    }

    const searchData = {
      query,
      transportation,
      duration,
      returnToStart,
      startingLocation: location,
    };

    setLoading(true);
    try {
      console.log('Sending request:', searchData);
      const response = await createPlan(searchData);
      console.log('Plan received:', response.plan);
      
      Alert.alert(
        '成功', 
        'プランを取得しました！地図画面へ移動します。',
        [
          {
            text: 'OK',
            onPress: () => {
              // Close the modal first
              navigation.goBack();
              
              // Then navigate to the result screen.
              // Since code execution continues after goBack, this will queue the navigation
              // to happen immediately after the modal dismissal starts.
              navigation.navigate('SearchResult', { 
                plan: response.plan, 
                transportation,
                startingLocation: location,
                routeResult: response.routeResult,
              });
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error creating plan:', error);
      Alert.alert('エラー', 'プランの取得に失敗しました。サーバーが起動しているか確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>プランを作成</Text>
          <View style={{ width: 24 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Query Section */}
          <View style={styles.section}>
            <Text style={styles.label}>行きたい場所・やりたいこと</Text>
            <TextInput
              style={styles.textArea}
              placeholder="例: 美味しいラーメンと静かな公園に行きたい。その後カフェでゆっくりしたい。"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={query}
              onChangeText={setQuery}
              textAlignVertical="top"
            />
          </View>

          {/* Transportation Section */}
          <View style={styles.section}>
            <Text style={styles.label}>移動手段</Text>
            <View style={styles.transportationContainer}>
              {TRANSPORTATION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.transportationButton,
                    transportation === option.value && styles.transportationButtonActive
                  ]}
                  onPress={() => setTransportation(option.value)}
                >
                  <Ionicons 
                  //移動手段アイコン(選択されていたら色を変える)
                    name={option.icon} 
                    size={24} 
                    color={transportation === option.value ? '#C0A647' : '#666'} 
                  />
                  <Text style={[
                    styles.transportationLabel,
                    transportation === option.value && styles.transportationLabelActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration Section */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>所要時間</Text>
              <Text style={styles.valueLabel}>{Math.floor(duration / 60)}時間{duration % 60 > 0 ? ` ${duration % 60}分` : ''}</Text>
            </View>
            <View style={styles.durationContainer}>
              {DURATION_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.value}
                  style={[
                    styles.durationButton,
                    duration === preset.value && styles.durationButtonActive
                  ]}
                  onPress={() => setDuration(preset.value)}
                >
                  <Text style={[
                    styles.durationText,
                    duration === preset.value && styles.durationTextActive
                  ]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Return to Start Section */}
          <View style={styles.rowSection}>
            <View>
              <Text style={styles.label}>出発地に戻る</Text>
              <Text style={styles.subLabel}>周遊プランを作成します</Text>
            </View>
            <Switch
              //「出発地に戻る」のON/OFF
              value={returnToStart}
              onValueChange={setReturnToStart}
              trackColor={{ false: '#e0e0e0', true: '#FFE68C' }}
              thumbColor={'#fff'}
            />
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.searchButton, loading && styles.searchButtonDisabled]} 
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" />
                <Text style={styles.searchButtonText}>処理中...</Text>
              </>
            ) : (
              <>
                <Text style={styles.searchButtonText}>プランを提案してもらう</Text>
                {/* 星マークのスタイル */}
                <Ionicons name="sparkles" size={20} color="#C0A647" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  //出発地に戻るセクションスタイル
  rowSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  subLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  //ラベルの文字スタイル
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  //所要時間の文字スタイル
  valueLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C0A647',
  },
  //所要時間の選択時スタイル
  durationButtonActive: {
    backgroundColor: '#FFE68C',
    borderColor: '#C0A647',
  },
  //テキストエリアのスタイル
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#eee',
  },
  transportationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  //移動手段ボタンのスタイル
  transportationButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  transportationLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  //移動手段の選択時スタイル
  transportationButtonActive: {
    backgroundColor: '#FFE68C',
    borderColor: '#C0A647',
  },
  //移動手段の文字の色
  transportationLabelActive: {
    color: '#C0A647',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
  },
  //所要時間選択時のテキストスタイル
  durationTextActive: {
    color: '#C0A647',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  //プラン提案ボタンのスタイル
  searchButton: {
    backgroundColor: '#FFE68C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  //プラン提案ボタンのテキストスタイル
  searchButtonText: {
    color: '#C0A647',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
