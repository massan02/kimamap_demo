import { NavigatorScreenParams } from '@react-navigation/native';
import { Plan } from '../services/api';

export type MapStackParamList = {
  MapScreen: { plan?: Plan };
  Search: undefined;
};

export type MainTabParamList = {
  Map: NavigatorScreenParams<MapStackParamList>;
  Profile: undefined;
};
