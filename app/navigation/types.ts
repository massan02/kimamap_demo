import { NavigatorScreenParams } from '@react-navigation/native';
import { Plan } from '../services/api';

export type MainTabParamList = {
  Map: { plan?: Plan };
  Profile: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Search: undefined;
};
