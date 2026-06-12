import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../services/supabase';
import { Colors } from '../../constants/Colors';

const CATEGORIES = [
  { label: 'Strength', color: '#FF4D9E', desc: 'Build your muscles bigger and stronger with this exercise. Train everyday to get bulk.' },
  { label: 'Cardio', color: '#FF6B35', desc: 'Improve endurance and burn calories with high-intensity cardio sessions.' },
  { label: 'Flexibility', color: '#7B61FF', desc: 'Increase your range of motion and reduce injury risk with stretching routines.' },
  { label: 'HIIT', color: '#00B4D8', desc: 'High intensity interval training for maximum fat burn in minimum time.' },
];

type Workout = {
  id: string;
  title: string;
  category: string;
  exercises_count: number;
  reps: string;
  calories_burned: number;
  duration_minutes: number;
  sets: number;
  trainer_name: string;
  image_url: string;
};

export default function WorkoutScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Strength');
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTotal, setCategoryTotal] = useState(0);

  const fetchWorkouts = async (category: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('workouts_catalog')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    setFilteredWorkouts(data || []);
    setCategoryTotal(data?.length || 0);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts(selectedCategory);
    }, [selectedCategory])
  );

  const handleCategoryPress = (cat: string) => {
    setSelectedCategory(cat);
    fetchWorkouts(cat);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workouts</Text>
          <TouchableOpacity style={styles.searchBtn}>
            <Ionicons name="search-outline" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Category Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(cat.label)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={selectedCategory === cat.label
                  ? [cat.color, cat.color + 'CC']
                  : ['#f0f0f0', '#e8e8e8']}
                style={styles.categoryGradient}
              >
                <View style={styles.categoryTop}>
                  <Text style={[
                    styles.categoryLabel,
                    selectedCategory === cat.label && styles.categoryLabelActive,
                  ]}>
                    {cat.label}
                  </Text>
                  {selectedCategory === cat.label && (
                    <View style={styles.totalBadge}>
                      <Text style={styles.totalBadgeText}>{categoryTotal} Total</Text>
                    </View>
                  )}
                </View>
                {selectedCategory === cat.label && (
                  <Text style={styles.categoryDesc} numberOfLines={3}>{cat.desc}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Personalized Hero Card */}
        <View style={styles.personalizedContainer}>
          <View style={styles.personalizedCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' }}
              style={styles.personalizedImage}
            />
            <View style={styles.personalizedOverlay} />
            <View style={styles.personalizedContent}>
              <Text style={styles.personalizedTitle}>Personalized{'\n'}Workout & Training</Text>
              <Text style={styles.personalizedSubtitle}>
                Workout categories will help you get strength, get in better shape and embrace a healthy lifestyle
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                activeOpacity={0.85}
                onPress={() => router.push('/ai-chat')}
              >
                <Text style={styles.browseButtonText}>Browse Workouts →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Filtered Workouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory} Workouts
            </Text>
            <Text style={styles.seeAllGray}>{categoryTotal} total</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.pink} style={{ marginTop: 20 }} />
          ) : filteredWorkouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🏋️</Text>
              <Text style={styles.emptyText}>No {selectedCategory} workouts found.</Text>
              <Text style={styles.emptySubText}>Add workouts to Supabase to see them here.</Text>
            </View>
          ) : (
            filteredWorkouts.map((workout) => (
              <TouchableOpacity
                key={workout.id}
                style={styles.workoutRow}
                onPress={() => router.push({ pathname: '/workout-detail', params: { id: workout.id } })}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: workout.image_url || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200' }}
                  style={styles.workoutThumb}
                />
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutTitle}>{workout.title}</Text>
                  <Text style={styles.workoutMeta}>{workout.exercises_count} Exercises</Text>
                  <Text style={styles.workoutMeta}>{workout.reps || '10x reps Each'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a1a' },
  searchBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center',
  },
  categoryScroll: { marginBottom: 20 },
  categoryCard: { width: 160, borderRadius: 20, overflow: 'hidden' },
  categoryGradient: { padding: 16, minHeight: 90 },
  categoryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryLabel: { fontSize: 18, fontWeight: '700', color: '#666' },
  categoryLabelActive: { color: '#fff' },
  totalBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
  },
  totalBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  categoryDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 17 },
  personalizedContainer: { paddingHorizontal: 20, marginBottom: 24 },
  personalizedCard: { borderRadius: 24, overflow: 'hidden', height: 280 },
  personalizedImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  personalizedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  personalizedContent: { flex: 1, justifyContent: 'flex-end', padding: 24 },
  personalizedTitle: { fontSize: 24, fontWeight: '800', color: '#fff', lineHeight: 30, marginBottom: 8 },
  personalizedSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 19, marginBottom: 20 },
  browseButton: { backgroundColor: Colors.pink, paddingVertical: 14, borderRadius: 30, alignItems: 'center' },
  browseButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  section: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  seeAllGray: { fontSize: 13, color: '#aaa', fontWeight: '500' },
  workoutRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  workoutThumb: { width: 68, height: 68, borderRadius: 16, backgroundColor: '#f0f0f0' },
  workoutInfo: { flex: 1 },
  workoutTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  workoutMeta: { fontSize: 12, color: '#aaa', lineHeight: 17 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#555' },
  emptySubText: { fontSize: 13, color: '#aaa', textAlign: 'center' },
});