import type { NavigatorScreenParams } from '@react-navigation/native';

export type OnboardingStackParamList = {
  OnboardingGoalName: undefined;
  OnboardingTargetDate: { goalTitle: string };
  OnboardingStart: { goalTitle: string; targetDateIso: string };
};

export type TabParamList = {
  Home: undefined;
  Capture: undefined;
  Journal: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  PlaceholderModal: undefined;
  CapsuleCreate: { goalId: string };
  CapsuleReveal: { capsuleId: string };
};

export {};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merge for React Navigation
    interface RootParamList extends RootStackParamList {}
  }
}
