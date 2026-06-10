export type AuthStackParamList = {
  splash: undefined;
  onboarding: undefined;
  login: undefined;
  register: undefined;
};

export type TabParamList = {
  index: undefined;
  workout: undefined;
  nutrition: undefined;
  progress: undefined;
  profile: undefined;
};

export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  'workout-detail': { id: string };
  'food-detail': { id: string };
  'map': undefined;
};