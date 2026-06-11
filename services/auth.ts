import { supabase } from './supabase';

export const authService = {

  async register(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;

    if (data?.user) {
      // Ako nakon signUp-a odmah dobijemo sesiju, postavićemo je ručno za svaki slučaj
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          email,
          profile_completed: false,
        });
        
      if (profileError) {
        // Ako baza i dalje pravi problem sa Row Level Security politikom, 
        // to znači da sesija još nije stigla da se osveži na telefonu.
        throw profileError;
      }
    }
    return data;
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};