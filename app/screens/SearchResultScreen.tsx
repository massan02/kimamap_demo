import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from 'react-native-maps';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { MapStackParamList } from '../navigation/types';
import polyline from '@mapbox/polyline';
import * as ExpoLocation from 'expo-location';

export default function SearchResultScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MapStackParamList, 'SearchResult'>>();
  const { plan, transportation, startingLocation, routeResult } = route.params;
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  // アプリ内の移動手段をGoogle Maps APIの形式にマッピング
  const getTravelMode = (mode: 'walk' | 'bicycle' | 'car'): string => {
    const modeMap = {
      walk: 'walking',
      bicycle: 'bicycling',
      car: 'driving',
    };
    return modeMap[mode];
  };

  // overviewPolylineをデコードして座標配列に変換
  const decodedPolyline = useMemo(() => {
    if (routeResult?.overviewPolyline) {
      try {
        const decoded = polyline.decode(routeResult.overviewPolyline);
        return decoded.map(([lat, lng]: [number, number]) => ({
          latitude: lat,
          longitude: lng,
        }));
      } catch (e) {
        console.warn('Failed to decode polyline:', e);
        return null;
      }
    }
    return null;
  }, [routeResult]);

  // フォールバック: スポット間の直線
  const fallbackCoordinates = useMemo(() => {
    const coords = plan.spots.map(spot => ({
      latitude: spot.location.lat,
      longitude: spot.location.lng,
    }));
    // 開始地点を先頭に追加
    if (startingLocation) {
      coords.unshift({
        latitude: startingLocation.lat,
        longitude: startingLocation.lng,
      });
    }
    return coords;
  }, [plan, startingLocation]);

  // 初回レンダリング時にルート全体を表示
  useEffect(() => {
    if (plan && mapRef.current) {
      // ポリラインの座標またはフォールバック座標を使用
      const coordinatesToFit = decodedPolyline || fallbackCoordinates;
      
      // マップの準備時間を考慮して少し遅延
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinatesToFit, {
          edgePadding: { 
            top: 100, 
            right: 50, 
            bottom: 300, // 下部の詳細パネル分空ける
            left: 50 
          },
          animated: true,
        });
      }, 500);
    }
  }, [plan, decodedPolyline, fallbackCoordinates]);

  // Google Mapsアプリでルートを開く
  const openGoogleMaps = () => {
    const spots = plan.spots;
    if (spots.length === 0) return;

    const encode = (value: string) => encodeURIComponent(value);
    const openUrl = (url: string) => {
      console.log('Opening Google Maps with URL:', url);
      Linking.openURL(url).catch(() => {
        Alert.alert('エラー', 'Google Mapsを開けませんでした');
      });
    };

    // 出発地: ユーザーの現在地（startingLocation）を使用
    const origin = `${startingLocation.lat},${startingLocation.lng}`;
    const destinationSpot = spots[spots.length - 1];
    // NOTE: 緯度経度だけを渡すとGoogle Maps側で「指定した地点」表示になりやすいので、
    // 可能なら名前/住所（+ placeId）で渡す。
    const destinationLabel =
      destinationSpot.name ||
      destinationSpot.address ||
      `${destinationSpot.location.lat},${destinationSpot.location.lng}`;
    
    // 経由地点: 最初のスポットから最後の1つ前まで全てを含める
    const waypointSpots = spots.length > 1 ? spots.slice(0, -1) : [];
    const waypointsLabel = waypointSpots
      .map(s => s.name || s.address || `${s.location.lat},${s.location.lng}`)
      .join('|');

    const travelMode = getTravelMode(transportation);
    
    // 基本URL
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encode(origin)}&destination=${encode(destinationLabel)}&travelmode=${encode(travelMode)}`;
    
    // Place ID対応: 目的地にPlace IDがあれば追加
    if (destinationSpot.placeId) {
      url += `&destination_place_id=${encode(destinationSpot.placeId)}`;
    }

    if (waypointsLabel) {
      url += `&waypoints=${encode(waypointsLabel)}`;

      // waypoint_place_ids は waypoints と同じ数・同じ順序で揃っている必要があるため、
      // 全スポット分の placeId が揃っている場合のみ付与する。
      const hasAllWaypointPlaceIds = waypointSpots.every(s => !!s.placeId);
      if (hasAllWaypointPlaceIds) {
        const waypointPlaceIds = waypointSpots.map(s => s.placeId as string).join('|');
        url += `&waypoint_place_ids=${encode(waypointPlaceIds)}`;
      }
    }

    const hasAllPlaceIds = spots.every(s => !!s.placeId);
    if (!hasAllPlaceIds) {
      Alert.alert(
        'お知らせ',
        'Place IDが揃わなかったため、Google Maps上で「指定した地点」と表示される場合があります。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '続ける', onPress: () => openUrl(url) },
        ]
      );
      return;
    }


    openUrl(url);
  };


  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: plan.spots[0].location.lat,
          longitude: plan.spots[0].location.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        mapPadding={{ 
          top: insets.top, 
          right: 0, 
          bottom: 255 + insets.bottom, // 詳細パネル分空ける
          left: 0 
        }}
      >
        <Polyline
          coordinates={decodedPolyline || fallbackCoordinates}
          strokeColor="#007AFF"
          strokeWidth={4}
        />
        {plan.spots.map((spot, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: spot.location.lat,
              longitude: spot.location.lng,
            }}
            title={`${index + 1}. ${spot.name}`}
          >
             <View style={styles.markerContainer}>
              <View style={styles.markerBubble}>
                <Text style={styles.markerText}>{index + 1}</Text>
              </View>
              <View style={styles.markerArrow} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header / Back Button */}
      <TouchableOpacity 
        style={[styles.backButton, { top: insets.top + 16 }]} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Bottom Sheet / Plan Details */}
      <View style={[styles.detailsContainer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handleBar} />
        <Text style={styles.planTitle}>{plan.title}</Text>
        <Text style={styles.planMeta}>
          所要時間: {Math.floor(plan.totalDuration / 60)}時間{plan.totalDuration % 60 > 0 ? ` ${plan.totalDuration % 60}分` : ''} • スポット {plan.spots.length}ヶ所
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.spotsScroll}>
          {plan.spots.map((spot, index) => (
            <View key={index} style={styles.spotCard}>
              <Text style={styles.spotOrder}>{index + 1}</Text>
              <View>
                <Text style={styles.spotName} numberOfLines={1}>{spot.name}</Text>
                <Text style={styles.spotCategory}>滞在: {spot.stayDuration}分</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        
        <TouchableOpacity style={styles.startButton} onPress={openGoogleMaps}>
          <Text style={styles.startButtonText}>案内を開始</Text>
          <MaterialIcons name="navigation" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  planMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  spotsScroll: {
    marginBottom: 16,
  },
  spotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    width: 160,
  },
  spotOrder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  spotName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  spotCategory: {
    fontSize: 12,
    color: '#888',
  },
  startButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerBubble: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#007AFF',
    transform: [{ translateY: -2 }],
  },
});
