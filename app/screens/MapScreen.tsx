import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MapScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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
      
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

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
      </MapView>
      
      <TouchableOpacity 
        style={[styles.searchContainer, { top: insets.top + 16 }]} 
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
        <MaterialIcons name="my-location" size={24} color="#C0A647" />
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
  //どこに行きますか？テキストスタイル
  searchText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
});
