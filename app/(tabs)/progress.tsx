import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pedometer } from 'expo-sensors';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.52;

export default function ProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [todayNutrition, setTodayNutrition] = useState<any[]>([]);
  const [todayWorkouts, setTodayWorkouts] = useState<any[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<Set<string>>(new Set());

  // Voda — klikabilno
  const [waterGlasses, setWaterGlasses] = useState(0);
  const waterGoal = 8;

  // Pedometer
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [currentSteps, setCurrentSteps] = useState(0);
  const STEPS_GOAL = 8000;

  // Animacije
  const stepsAnim = useRef(new Animated.Value(0)).current;
  const caloriesAnim = useRef(new Animated.Value(0)).current;
  const circleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
    setupPedometer();
  }, []);

  const setupPedometer = async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);

      if (isAvailable) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        const result = await Pedometer.getStepCountAsync(start, end);
        if (result) {
          setCurrentSteps(result.steps);
          animateValue(stepsAnim, result.steps / STEPS_GOAL);
        }
        const subscription = Pedometer.watchStepCount(result => {
          setCurrentSteps(prev => prev + result.steps);
        });
        return () => subscription.remove();
      } else {
        const simulatedSteps = 3456;
        setCurrentSteps(simulatedSteps);
        animateValue(stepsAnim, simulatedSteps / STEPS_GOAL);
      }
    } catch (e) {
      const simulatedSteps = 3456;
      setCurrentSteps(simulatedSteps);
      animateValue(stepsAnim, simulatedSteps / STEPS_GOAL);
    }
  };

  const animateValue = (anim: Animated.Value, toValue: number) => {
    Animated.timing(anim, {
      toValue: Math.min(toValue, 1),
      duration: 1400,
      useNativeDriver: false,
    }).start();
  };

const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      const today = new Date().toISOString().split('T')[0];

      // ← PROMENI OVO — čita iz meals tabele
      const { data: nutritionData } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);
      setTodayNutrition(nutritionData || []);

      const totalCals = nutritionData?.reduce((s, n) => s + (n.calories || 0), 0) || 0;
      const calGoal = profileData?.daily_calorie_goal || 2000;
      animateValue(caloriesAnim, totalCals / calGoal);
      animateValue(circleAnim, totalCals / calGoal);

      // Treninzi danas
      const { data: workoutData } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);
      setTodayWorkouts(workoutData || []);

      const { data: scoreData } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (scoreData) {
        setWaterGlasses(scoreData.water_glasses || 0);
      }

    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWaterToggle = async (index: number) => {
    // Ako klikneš na već popunjenu čašu — smanji, ako ne — povećaj
    const newWater = index < waterGlasses ? index : index + 1;
    setWaterGlasses(newWater);

    // Sačuvaj u bazu
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('daily_scores')
        .upsert({
          user_id: user.id,
          date: today,
          water_glasses: newWater,
        });
    } catch (e) {
      console.log(e);
    }
  };

  const handleWorkoutToggle = async (workoutId: string) => {
    const newCompleted = new Set(completedWorkouts);
    if (newCompleted.has(workoutId)) {
      newCompleted.delete(workoutId);
    } else {
      newCompleted.add(workoutId);
    }
    setCompletedWorkouts(newCompleted);

    // Sačuvaj u bazu
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('daily_scores')
        .upsert({
          user_id: user.id,
          date: today,
          workout_completed: newCompleted.size > 0,
        });
    } catch (e) {
      console.log(e);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading progress..." />;

  // Kalkulacije iz baze
  const totalCalories = todayNutrition.reduce((s, n) => s + (n.calories || 0), 0);
const totalProtein = todayNutrition.reduce((s, n) => s + (n.protein_g || 0), 0);
const totalCarbs = todayNutrition.reduce((s, n) => s + (n.carbs_g || 0), 0);
const totalFat = todayNutrition.reduce((s, n) => s + (n.fat_g || 0), 0);
  const calorieGoal = profile?.daily_calorie_goal || 2000;
  const remainingCalories = Math.max(0, calorieGoal - totalCalories);
  const caloriePercent = Math.min(100, Math.round((totalCalories / calorieGoal) * 100));
  const stepsPercent = Math.min(100, Math.round((currentSteps / STEPS_GOAL) * 100));

  const proteinGoal = Math.round((calorieGoal * 0.3) / 4);
  const carbsGoal = Math.round((calorieGoal * 0.45) / 4);
  const fatGoal = Math.round((calorieGoal * 0.25) / 9);

  const burnedCalories = todayWorkouts
    .filter(w => completedWorkouts.has(w.id))
    .reduce((s, w) => s + (w.calories_burned || 0), 0);
  const netCalories = totalCalories - burnedCalories;

  // Animated values
  const stepsWidth = stepsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const caloriesWidth = caloriesAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Animirani broj kalorija u krugu
  const animatedCalories = circleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, totalCalories],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            <Text style={styles.headerTitle}>Today's Progress</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
            <Ionicons name="refresh" size={22} color={Colors.pink} />
          </TouchableOpacity>
        </View>

        {/* KALORIJE — GLAVNI KRUG SA ANIMACIJOM */}
        <View style={styles.mainCircleContainer}>
          <LinearGradient
            colors={['#FFF0F6', '#FFE4F0']}
            style={styles.mainCircleCard}
          >
            <View style={styles.circleWrapper}>
              <View style={[
                styles.circleOuter,
                { borderColor: caloriePercent >= 100 ? Colors.error : Colors.pink },
              ]}>
                <View style={styles.circleInner}>
                  {/* Animirani broj */}
                  <AnimatedNumber value={totalCalories} style={styles.circleNumber} />
                  <Text style={styles.circleLabel}>kcal eaten</Text>
                  <View style={styles.circleDivider} />
                  <Text style={styles.circleRemaining}>{remainingCalories} left</Text>
                </View>
              </View>

              <View style={styles.circleInfo}>
                <View style={styles.circleInfoItem}>
                  <Ionicons name="flame" size={16} color={Colors.error} />
                  <Text style={styles.circleInfoValue}>{burnedCalories}</Text>
                  <Text style={styles.circleInfoLabel}>Burned</Text>
                </View>
                <View style={styles.circleInfoDivider} />
                <View style={styles.circleInfoItem}>
                  <Ionicons name="flag" size={16} color={Colors.success} />
                  <Text style={styles.circleInfoValue}>{calorieGoal}</Text>
                  <Text style={styles.circleInfoLabel}>Goal</Text>
                </View>
              </View>
            </View>

            {/* Progress bar sa animacijom */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: caloriesWidth,
                      backgroundColor: caloriePercent >= 100 ? Colors.error : Colors.pink,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressPercent}>{caloriePercent}%</Text>
            </View>

            <View style={styles.netCalRow}>
              <Text style={styles.netCalLabel}>Net calories</Text>
              <Text style={[
                styles.netCalValue,
                { color: netCalories > calorieGoal ? Colors.error : Colors.success },
              ]}>
                {netCalories} kcal
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* MAKRO NUTRIJENTI — iz baze */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          <View style={styles.macroGrid}>
            {[
              { name: 'Protein', value: totalProtein, goal: proteinGoal, color: '#FF6B6B', bg: '#FFE8E8', icon: 'food-steak' },
              { name: 'Carbs', value: totalCarbs, goal: carbsGoal, color: '#FFB74D', bg: '#FFF3E0', icon: 'bread-slice' },
              { name: 'Fat', value: totalFat, goal: fatGoal, color: '#66BB6A', bg: '#E8F5E9', icon: 'oil' },
            ].map((macro) => (
              <View key={macro.name} style={styles.macroCard}>
                <View style={[styles.macroIcon, { backgroundColor: macro.bg }]}>
                  <MaterialCommunityIcons name={macro.icon as any} size={20} color={macro.color} />
                </View>
                <Text style={styles.macroName}>{macro.name}</Text>
                <Text style={styles.macroValue}>{Math.round(macro.value)}g</Text>
                <Text style={styles.macroGoal}>/ {macro.goal}g</Text>
                <View style={styles.macroBarBg}>
                  <View style={[
                    styles.macroBarFill,
                    {
                      width: `${Math.min(100, (macro.value / macro.goal) * 100)}%`,
                      backgroundColor: macro.color,
                    },
                  ]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* KORACI */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steps Today</Text>
          <LinearGradient colors={['#111214', '#2D2F33']} style={styles.stepsCard}>
            <View style={styles.stepsTop}>
              <View>
                <Text style={styles.stepsNumber}>{currentSteps.toLocaleString()}</Text>
                <Text style={styles.stepsGoalText}>Goal: {STEPS_GOAL.toLocaleString()} steps</Text>
              </View>
              <View style={styles.stepsCircle}>
                <Text style={styles.stepsPercent}>{stepsPercent}%</Text>
                <Text style={styles.stepsDone}>done</Text>
              </View>
            </View>
            <View style={styles.stepsBarBg}>
              <Animated.View style={[styles.stepsBarFill, { width: stepsWidth }]} />
            </View>
            <View style={styles.stepsStats}>
              <View style={styles.stepsStat}>
                <Ionicons name="flame-outline" size={16} color="#FFB74D" />
                <Text style={styles.stepsStatText}>{Math.round(currentSteps * 0.04)} kcal</Text>
                <Text style={styles.stepsStatLabel}>Burned</Text>
              </View>
              <View style={styles.stepsStat}>
                <Ionicons name="map-outline" size={16} color="#64B5F6" />
                <Text style={styles.stepsStatText}>{(currentSteps * 0.0008).toFixed(1)} km</Text>
                <Text style={styles.stepsStatLabel}>Distance</Text>
              </View>
              <View style={styles.stepsStat}>
                <Ionicons name="time-outline" size={16} color="#81C784" />
                <Text style={styles.stepsStatText}>{Math.round(currentSteps / 100)} min</Text>
                <Text style={styles.stepsStatLabel}>Active</Text>
              </View>
            </View>
            {!isPedometerAvailable && (
              <Text style={styles.pedometerNote}>* Simulated steps — pedometer not available</Text>
            )}
          </LinearGradient>
        </View>

        {/* VODA — KLIKABILNO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Water Intake 💧</Text>
            <Text style={styles.waterCount}>{waterGlasses}/{waterGoal} glasses</Text>
          </View>
          <View style={styles.waterCard}>
            <View style={styles.waterGlasses}>
              {Array.from({ length: waterGoal }).map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.glassButton}
                  onPress={() => handleWaterToggle(i)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={i < waterGlasses ? 'water' : 'water-outline'}
                    size={36}
                    color={i < waterGlasses ? '#64B5F6' : Colors.gray}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.waterBarBg}>
              <View style={[
                styles.waterBarFill,
                { width: `${(waterGlasses / waterGoal) * 100}%` },
              ]} />
            </View>
            <Text style={styles.waterText}>
              {Math.round(waterGlasses * 0.25 * 10) / 10}L / {waterGoal * 0.25}L  •  Tap to track
            </Text>
          </View>
        </View>

        {/* TRENINZI — KLIKABILNO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Workouts 🏋️</Text>
          {todayWorkouts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>😴</Text>
              <Text style={styles.emptyTitle}>No workouts logged today</Text>
              <Text style={styles.emptySubtitle}>Add a workout to boost your Fitnex Score!</Text>
            </View>
          ) : (
            todayWorkouts.map((workout) => {
              const isDone = completedWorkouts.has(workout.id);
              return (
                <TouchableOpacity
                  key={workout.id}
                  style={[styles.workoutItem, isDone && styles.workoutItemDone]}
                  onPress={() => handleWorkoutToggle(workout.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.workoutIcon, isDone && styles.workoutIconDone]}>
                    <MaterialCommunityIcons
                      name="dumbbell"
                      size={20}
                      color={isDone ? Colors.white : Colors.pink}
                    />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{workout.title}</Text>
                    <Text style={styles.workoutMeta}>
                      {workout.duration_minutes}min • {workout.calories_burned} kcal
                    </Text>
                  </View>
                  {/* Checkbox */}
                  <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
                    {isDone && <Ionicons name="checkmark" size={18} color={Colors.white} />}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* DAILY SUMMARY */}
        <View style={styles.section}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryTitle}>Daily Summary 📊</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{caloriePercent}%</Text>
                <Text style={styles.summaryLabel}>Calorie goal</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{stepsPercent}%</Text>
                <Text style={styles.summaryLabel}>Steps goal</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{completedWorkouts.size}</Text>
                <Text style={styles.summaryLabel}>Workouts done</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{waterGlasses}</Text>
                <Text style={styles.summaryLabel}>Glasses H₂O</Text>
              </View>
            </View>
            <View style={styles.motivationRow}>
              <Text style={styles.motivationText}>
                {caloriePercent >= 80 && stepsPercent >= 80
                  ? '🔥 Crushing it today! Keep going!'
                  : caloriePercent >= 50
                  ? '💪 Great progress! Finish strong!'
                  : '🌟 Every step counts. You got this!'}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Komponenta za animirani broj
function AnimatedNumber({ value, style }: { value: number; style: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value,
      duration: 1400,
      useNativeDriver: false,
    }).start();

    const listener = anim.addListener(({ value: v }) => {
      setDisplayed(Math.round(v));
    });

    return () => anim.removeListener(listener);
  }, [value]);

  return <Text style={style}>{displayed}</Text>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerDate: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCircleContainer: { paddingHorizontal: 20, marginTop: 8 },
  mainCircleCard: { borderRadius: 24, padding: 20, alignItems: 'center', gap: 16 },
  circleWrapper: { alignItems: 'center', gap: 16 },
  circleOuter: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  circleInner: { alignItems: 'center', gap: 4 },
  circleNumber: { fontSize: 40, fontWeight: '900', color: Colors.textPrimary },
  circleLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  circleDivider: { width: 40, height: 1, backgroundColor: Colors.gray, marginVertical: 4 },
  circleRemaining: { fontSize: 14, color: Colors.pink, fontWeight: '700' },
  circleInfo: { flexDirection: 'row', gap: 32, alignItems: 'center' },
  circleInfoItem: { alignItems: 'center', gap: 4 },
  circleInfoValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  circleInfoLabel: { fontSize: 12, color: Colors.textSecondary },
  circleInfoDivider: { width: 1, height: 40, backgroundColor: Colors.gray },
  progressBarContainer: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressPercent: { fontSize: 13, fontWeight: '700', color: Colors.darkPink, minWidth: 36 },
  netCalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,93,163,0.2)',
  },
  netCalLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  netCalValue: { fontSize: 14, fontWeight: '800' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  waterCount: { fontSize: 14, fontWeight: '700', color: Colors.pink },
  macroGrid: { flexDirection: 'row', gap: 10 },
  macroCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  macroIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  macroName: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  macroValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  macroGoal: { fontSize: 11, color: Colors.textSecondary },
  macroBarBg: { width: '100%', height: 6, backgroundColor: Colors.gray, borderRadius: 3, overflow: 'hidden' },
  macroBarFill: { height: '100%', borderRadius: 3 },
  stepsCard: { borderRadius: 20, padding: 20, gap: 16 },
  stepsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepsNumber: { fontSize: 40, fontWeight: '900', color: Colors.white },
  stepsGoalText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  stepsCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsPercent: { fontSize: 18, fontWeight: '800', color: Colors.white },
  stepsDone: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  stepsBarBg: { width: '100%', height: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5, overflow: 'hidden' },
  stepsBarFill: { height: '100%', backgroundColor: Colors.pink, borderRadius: 5 },
  stepsStats: { flexDirection: 'row', justifyContent: 'space-around' },
  stepsStat: { alignItems: 'center', gap: 4 },
  stepsStatText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  stepsStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  pedometerNote: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  waterCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray,
    gap: 12,
  },
  waterGlasses: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  glassButton: { padding: 6 },
  waterBarBg: { width: '100%', height: 8, backgroundColor: Colors.gray, borderRadius: 4, overflow: 'hidden' },
  waterBarFill: { height: '100%', backgroundColor: '#64B5F6', borderRadius: 4 },
  waterText: { textAlign: 'center', fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.gray,
    marginBottom: 8,
  },
  workoutItemDone: {
    borderColor: Colors.success,
    backgroundColor: '#F0FFF4',
  },
  workoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutIconDone: {
    backgroundColor: Colors.success,
  },
  workoutInfo: { flex: 1 },
  workoutName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  workoutMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  summaryCard: { borderRadius: 24, padding: 20, gap: 16 },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: Colors.white },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryItem: {
    width: (width - 80) / 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  summaryValue: { fontSize: 28, fontWeight: '900', color: Colors.white },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  motivationRow: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12 },
  motivationText: { fontSize: 14, fontWeight: '700', color: Colors.white, textAlign: 'center' },
});