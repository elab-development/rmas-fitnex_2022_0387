import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

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
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileImage, setProfileImageState] = useState<string | null>(null);
  const [dailyCalorieGoal, setDailyCalorieGoalState] = useState(2000);
  const [loading, setLoading] = useState(true);

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