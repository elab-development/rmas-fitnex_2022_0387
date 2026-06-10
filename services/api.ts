import { supabase } from './supabase';

export const profileService = {

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;
    return data;
  },
};

export const workoutService = {

  async getWorkouts(userId: string) {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createWorkout(workout: any) {
    const { data, error } = await supabase
      .from('workouts')
      .insert(workout)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateWorkout(id: string, updates: any) {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  async deleteWorkout(id: string) {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const nutritionService = {

  async getNutritionLogs(userId: string) {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createNutritionLog(log: any) {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert(log)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteNutritionLog(id: string) {
    const { error } = await supabase
      .from('nutrition_logs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};