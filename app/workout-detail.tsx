import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Dimensions, ScrollView, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../services/supabase';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

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
  description: string;
};

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  image_url?: string;
};

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Stanja za nove funkcionalnosti (Details Modal i Timer)
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (id) fetchWorkout();
    return () => clearInterval(timerRef.current);
  }, [id]);

  const fetchWorkout = async () => {
    const { data } = await supabase
      .from('workouts_catalog')
      .select('*')
      .eq('id', id)
      .single();
    setWorkout(data);

    if (data) {
      setTimeLeft(data.duration_minutes * 60);
    }

    const { data: exData } = await supabase
      .from('workout_exercises')
      .select('*')
      .eq('workout_id', id)
      .order('order_index', { ascending: true });
    setExercises(exData || []);
    setLoading(false);
  };

  // Funkcija za pokretanje tajmera odbrojavanja
  const startTimer = () => {
    if (isTimerRunning) return;
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          setIsTimerRunning(false);
          setStarted(false);
          Alert.alert("🎉 Workout finished!", "Great job! You killed it!");
          return workout ? workout.duration_minutes * 60 : 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Funkcija za pauziranje tajmera
  const pauseTimer = () => {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
  };

  // Funkcija za potpuno zaustavljanje i resetovanje tajmera
  const stopTimer = () => {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setStarted(false);
    if (workout) {
      setTimeLeft(workout.duration_minutes * 60);
    }
  };

  // Formatiranje sekundi u prikaz 00:00
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStart = async () => {
    if (!workout) return;

    // Ako tajmer radi, klik na glavno dugme ga pauzira
    if (isTimerRunning) {
      pauseTimer();
      return;
    }

    // Ako je pauziran ili resetovan, klik ga ponovo pokreće
    if (started && !isTimerRunning) {
      startTimer();
      return;
    }

    // Prvi pokret treninga - upis u bazu i startovanje tajmera
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase.from('workouts').insert({
        user_id: user.id,
        catalog_id: workout.id,
        title: workout.title,
        category: workout.category,
        duration_minutes: workout.duration_minutes,
        calories_burned: workout.calories_burned,
        exercises_count: workout.exercises_count,
      });
      
      setStarted(true);
      startTimer();
      
      Alert.alert('🎉 Workout Started!', `${workout.title} has been started. Timer is running!`);
    } catch (e) {
      Alert.alert('Error', 'Could not start workout.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.pink} />
      </View>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={{ color: '#888', fontSize: 16 }}>Workout not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: workout.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' }}
        style={styles.heroImage}
        resizeMode="cover"
      />
      <View style={styles.heroOverlay} />

      <SafeAreaView style={styles.safeTop} edges={['top']}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* TAJMER PRIKAZ - Prikazuje se samo kada je trening aktivan ili pauziran */}
      {started && timeLeft < workout.duration_minutes * 60 && (
        <View style={[styles.timerBadge, !isTimerRunning && styles.timerBadgePaused]}>
          <Ionicons 
            name={isTimerRunning ? "time-outline" : "pause-circle-outline"} 
            size={16} 
            color="#fff" 
            style={{ marginRight: 6 }} 
          />
          <Text style={styles.timerText}>
            {formatTime(timeLeft)} {!isTimerRunning && '(Paused)'}
          </Text>
        </View>
      )}

      <View style={styles.totalBadge}>
        <Text style={styles.totalBadgeText}>{workout.exercises_count} Total</Text>
      </View>

      <View style={styles.sheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
          <Text style={styles.trainerName}>With {workout.trainer_name || 'Coach'}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {started ? formatTime(timeLeft) : `${workout.duration_minutes}min`}
              </Text>
              <Text style={styles.statLabel}>{started ? 'Time Left' : 'Time'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workout.calories_burned}kcal</Text>
              <Text style={styles.statLabel}>Calorie</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workout.sets || 3}x{workout.exercises_count}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
          </View>

          {workout.description ? (
            <Text style={styles.description}>{workout.description}</Text>
          ) : null}

          {exercises.length > 0 && (
            <View style={styles.exercisesSection}>
              <Text style={styles.exercisesSectionTitle}>Overview Exercises</Text>
              {exercises.map((ex, i) => (
                <View key={ex.id} style={styles.exerciseRow}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{i + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.exerciseMeta}>{ex.sets} sets • {ex.reps} reps</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* AKCIONI DUGMIĆI */}
        <View style={styles.actionRow}>
          {/* Ako je trening pokrenut, Details dugme postaje STOP dugme */}
          {started ? (
            <TouchableOpacity 
              style={styles.stopBtn} 
              activeOpacity={0.8}
              onPress={stopTimer}
            >
              <Ionicons name="square" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.stopBtnText}>Stop</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.detailsBtn} 
              activeOpacity={0.8}
              onPress={() => setIsDetailsVisible(true)}
            >
              <Text style={styles.detailsBtnText}>Details</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.startBtn, 
              started && !isTimerRunning && styles.startBtnPaused,
              isTimerRunning && styles.startBtnRunning
            ]}
            onPress={handleStart}
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                  name={isTimerRunning ? "pause" : started ? "play" : "play"} 
                  size={16} 
                  color="#fff" 
                  style={{ marginRight: 6 }} 
                />
                <Text style={styles.startBtnText}>
                  {isTimerRunning ? 'Pause' : started ? 'Resume' : 'Start'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= MODAL ZA DETAILS DUGME ================= */}
      <Modal
        visible={isDetailsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Full Exercise Details</Text>
              <TouchableOpacity 
                style={styles.closeModalBtn} 
                onPress={() => setIsDetailsVisible(false)}
              >
                <Ionicons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {exercises.map((ex, i) => (
                <View key={ex.id} style={styles.detailedExerciseCard}>
                  <Image 
                    source={{ uri: ex.image_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200' }}
                    style={styles.detailedExerciseImage}
                    resizeMode="cover"
                  />
                  <View style={styles.detailedExerciseInfo}>
                    <Text style={styles.detailedExerciseIndex}>Exercise {i + 1}</Text>
                    <Text style={styles.detailedExerciseName}>{ex.name}</Text>
                    
                    <View style={styles.detailedStatsGrid}>
                      <View style={styles.detailedBadge}>
                        <Text style={styles.detailedBadgeText}>🏋️ {ex.sets} Sets</Text>
                      </View>
                      <View style={styles.detailedBadge}>
                        <Text style={styles.detailedBadgeText}>🔄 {ex.reps} Reps</Text>
                      </View>
                      <View style={styles.detailedBadge}>
                        <Text style={styles.detailedBadgeText}>⏱️ {ex.rest_seconds}s Rest</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroImage: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: height * 0.58, width: '100%',
  },
  heroOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: height * 0.58, backgroundColor: 'rgba(0,0,0,0.35)',
  },
  safeTop: { position: 'absolute', top: 0, left: 0, right: 0 },
  backBtn: {
    margin: 16, width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  totalBadge: {
    position: 'absolute', top: 60, right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  totalBadgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  
  timerBadge: {
    position: 'absolute', top: 60, left: 70,
    backgroundColor: '#FF2A7A',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    shadowColor: '#FF2A7A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5,
  },
  timerBadgePaused: {
    backgroundColor: '#777',
    shadowColor: '#777',
  },
  timerText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    top: height * 0.42,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 28,
  },
  workoutTitle: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  trainerName: { fontSize: 14, color: '#aaa', marginBottom: 24, fontWeight: '500' },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8f8f8', borderRadius: 18,
    paddingVertical: 16, marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  statLabel: { fontSize: 12, color: '#aaa', marginTop: 2, fontWeight: '500' },
  statDivider: { width: 1, height: 36, backgroundColor: '#e8e8e8' },
  description: { fontSize: 14, color: '#777', lineHeight: 21, marginBottom: 20 },
  exercisesSection: { marginTop: 8 },
  exercisesSectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 14 },
  exerciseRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  exerciseNumber: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.pink + '20', alignItems: 'center', justifyContent: 'center',
  },
  exerciseNumberText: { fontSize: 14, fontWeight: '700', color: Colors.pink },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  exerciseMeta: { fontSize: 12, color: '#aaa', marginTop: 2 },
  actionRow: {
    position: 'absolute', bottom: 36, left: 24, right: 24,
    flexDirection: 'row', gap: 12, backgroundColor: '#fff', paddingVertical: 10
  },
  detailsBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 30,
    alignItems: 'center', backgroundColor: '#f0f0f0',
  },
  detailsBtnText: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  stopBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 30,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#333',
  },
  stopBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  startBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.pink,
  },
  startBtnRunning: { backgroundColor: '#FF8A00' }, 
  startBtnPaused: { backgroundColor: '#4CAF50' },
  startBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    height: height * 0.82, paddingHorizontal: 24, paddingTop: 24,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
  },
  modalHeaderTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  closeModalBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center',
  },
  detailedExerciseCard: {
    flexDirection: 'row', backgroundColor: '#f8f8f8', borderRadius: 20,
    padding: 12, marginBottom: 16, gap: 14, alignItems: 'center',
  },
  detailedExerciseImage: {
    width: 85, height: 85, borderRadius: 16, backgroundColor: '#e0e0e0',
  },
  detailedExerciseInfo: { flex: 1 },
  detailedExerciseIndex: { fontSize: 11, fontWeight: '800', color: Colors.pink, textTransform: 'uppercase' },
  detailedExerciseName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginTop: 2, marginBottom: 8 },
  detailedStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  detailedBadge: {
    backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
    borderWidth: 1, borderColor: '#eee',
  },
  detailedBadgeText: { fontSize: 11, color: '#555', fontWeight: '600' },
});