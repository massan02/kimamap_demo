import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/MapScreen';
import SearchScreen from '../screens/SearchScreen';
import { MapStackParamList } from './types';

const Stack = createNativeStackNavigator<MapStackParamList>();

export default function MapStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapScreen" component={MapScreen} />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
