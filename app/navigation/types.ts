import { NavigatorScreenParams } from '@react-navigation/native';
import { Plan, Location, RouteResult } from '../services/api';

export type MapStackParamList = {
  MapScreen: undefined;
  Search: undefined;
  SearchResult: { 
    plan: Plan; 
    transportation: 'walk' | 'bicycle' | 'car';
    startingLocation: Location;
    routeResult?: RouteResult;
  };
};

export type MainTabParamList = {
  Map: NavigatorScreenParams<MapStackParamList>;
  Profile: undefined;
};
