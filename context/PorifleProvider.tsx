import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Pedometer } from 'expo-sensors';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  daily_calorie_goal: number;
  city: string;
  age: number;
  weight: number;
  membership_type: string;

}

interface ProfileContextType {
  profile: Profile | null;
  profileImage: string | null;
  dailyCalorieGoal: number;
  loading: boolean;
  setProfileImage: (url: string) => void;
  setDailyCalorieGoal: (cal: number) => void;
  refreshProfile: () => Promise<void>;
    todaySteps: number;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileImage, setProfileImageState] = useState<string | null>(null);
  const [dailyCalorieGoal, setDailyCalorieGoalState] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [todaySteps, setTodaySteps] = useState(0);

  const refreshProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      if (data.avatar_url) setProfileImageState(data.avatar_url);
      setDailyCalorieGoalState(data.daily_calorie_goal || 2000);
    } catch (e: any) {
      console.log('ProfileContext error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
  refreshProfile();
}, []);

useEffect(() => {
  let subscription: any;

 const startPedometer = async () => {
  const isAvailable = await Pedometer.isAvailableAsync();
  console.log('Pedometer available:', isAvailable);
  if (!isAvailable) return;

  subscription = Pedometer.watchStepCount(result => {
    console.log('New steps:', result.steps);
    setTodaySteps(prev => prev + result.steps);
  });
};

  startPedometer();

  return () => {
    if (subscription) subscription.remove();
  };
}, []);

  const setProfileImage = (url: string) => setProfileImageState(url);
  const setDailyCalorieGoal = (cal: number) => setDailyCalorieGoalState(cal);

  return (
    <ProfileContext.Provider value={{
      profile,
      profileImage,
      dailyCalorieGoal,
      loading,
      setProfileImage,
      setDailyCalorieGoal,
      refreshProfile,
      todaySteps,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}