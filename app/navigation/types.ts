import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

// Root Stack Navigator (認証状態に基づく画面分岐)
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
};

// Bottom Tab Navigator (メイン画面)
export type MainTabParamList = {
  Map: undefined;
  Profile: undefined;
};

// Screen Props型定義
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Navigation全体の型定義拡張
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
