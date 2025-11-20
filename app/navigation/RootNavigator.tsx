import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import SearchScreen from '../screens/SearchScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ 
          presentation: 'modal', // 下から出てくるモーダル風の遷移
          animation: 'slide_from_bottom'
        }} 
      />
    </Stack.Navigator>
  );
}
