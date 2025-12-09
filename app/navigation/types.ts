import { NavigatorScreenParams } from '@react-navigation/native';
import { Plan } from '../services/api';

export type MapStackParamList = {
  MapScreen: undefined;
  Search: undefined;
  SearchResult: { plan: Plan; transportation: 'walk' | 'bicycle' | 'car' };
};

export type MainTabParamList = {
  Map: NavigatorScreenParams<MapStackParamList>;
  Profile: undefined;
};
