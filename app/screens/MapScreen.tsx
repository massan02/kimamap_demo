import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainTabParamList } from '../navigation/types';

export default function MapScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MainTabParamList, 'Map'>>();
  const { plan } = route.params || {};

  const [region, setRegion] = useState<Region | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      
      if (!plan) {
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    })();
  }, []);

  // プランが渡されたら、ルート全体が見えるようにズーム
  useEffect(() => {
    if (plan && mapRef.current) {
      const coordinates = plan.spots.map(spot => ({
        latitude: spot.location.lat,
        longitude: spot.location.lng,
      }));
      
      // 少し遅延させないと地図の準備が間に合わない場合がある
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      }, 500);
    }
  }, [plan]);

  const handleCenterLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } else {
      // If no location yet, try fetching again or alert
      (async () => {
        try {
          let location = await Location.getCurrentPositionAsync({});
          setCurrentLocation(location);
          mapRef.current?.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        } catch (e) {
          Alert.alert('Could not get current location');
        }
      })();
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region || {
          latitude: 33.5902,
          longitude: 130.4207,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        {plan && (
          <Polyline
            coordinates={plan.spots.map(spot => ({
              latitude: spot.location.lat,
              longitude: spot.location.lng,
            }))}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        )}
      </MapView>
      
      <TouchableOpacity 
        style={styles.searchContainer} 
        activeOpacity={0.9}
        onPress={() => {
          // @ts-ignore - Navigation type definition is pending
          navigation.navigate('Search');
        }}
      >
        <MaterialIcons name="search" size={24} color="#666" />
        <Text style={styles.searchText}>どこに行きますか？</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={handleCenterLocation}
        activeOpacity={0.7}
      >
        <MaterialIcons name="my-location" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16, // Adjust if there's a tab bar, usually tab bar height is around 50-80
    backgroundColor: 'white',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchContainer: {
    position: 'absolute',
    top: 16, // ヘッダーに近づけて配置
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
});
