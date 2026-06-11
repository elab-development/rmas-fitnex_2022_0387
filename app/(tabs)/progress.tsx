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

  // Pedometer
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [currentSteps, setCurrentSteps] = useState(0);
  const STEPS_GOAL = 8000;

  // Animacije
  const stepsAnim = useRef(new Animated.Value(0)).current;
  const caloriesAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
    setupPedometer();
  }, []);

  const setupPedometer = async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);

      if (isAvailable) {
        // Uzmi korake od ponoći danas
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();

        const result = await Pedometer.getStepCountAsync(start, end);
        if (result) {
          setCurrentSteps(result.steps);
          animateProgress(stepsAnim, result.steps / STEPS_GOAL);
        }

        // Live praćenje koraka
        const subscription = Pedometer.watchStepCount(result => {
          setCurrentSteps(prev => prev + result.steps);
        });

        return () => subscription.remove();
      } else {
        // Simulirani koraci ako pedometer nije dostupan
        const simulatedSteps = Math.floor(Math.random() * 5000) + 2000;
        setCurrentSteps(simulatedSteps);
        animateProgress(stepsAnim, simulatedSteps / STEPS_GOAL);
      }
    } catch (e) {
      const simulatedSteps = 3456;
      setCurrentSteps(simulatedSteps);
      animateProgress(stepsAnim, simulatedSteps / STEPS_GOAL);
    }
  };

  const animateProgress = (anim: Animated.Value, toValue: number) => {
    Animated.timing(anim, {
      toValue: Math.min(toValue, 1),
      duration: 1200,
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

      // Ishrana danas
      const { data: nutritionData } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`);
      setTodayNutrition(nutritionData || []);

      // Animacija kalorija
      const totalCals = nutritionData?.reduce((s, n) => s + (n.calories || 0), 0) || 0;
      const calGoal = profileData?.daily_calorie_goal || 2000;
      animateProgress(caloriesAnim, totalCals / calGoal);

      // Treninzi danas
      const { data: workoutData } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);
      setTodayWorkouts(workoutData || []);

    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading progress..." />;

  // Kalkulacije
  const totalCalories = todayNutrition.reduce((s, n) => s + (n.calories || 0), 0);
  const totalProtein = todayNutrition.reduce((s, n) => s + (n.protein || 0), 0);
  const totalCarbs = todayNutrition.reduce((s, n) => s + (n.carbs || 0), 0);
  const totalFat = todayNutrition.reduce((s, n) => s + (n.fat || 0), 0);
  const calorieGoal = profile?.daily_calorie_goal || 2000;
  const remainingCalories = Math.max(0, calorieGoal - totalCalories);
  const caloriePercent = Math.min(100, Math.round((totalCalories / calorieGoal) * 100));
  const stepsPercent = Math.min(100, Math.round((currentSteps / STEPS_GOAL) * 100));

  // Makro goals (standardni)
  const proteinGoal = Math.round((calorieGoal * 0.3) / 4);
  const carbsGoal = Math.round((calorieGoal * 0.45) / 4);
  const fatGoal = Math.round((calorieGoal * 0.25) / 9);

  // Water intake (simulirano)
  const waterGlasses = todayWorkouts.length > 0 ? 6 : 4;
  const waterGoal = 8;

  // Burned calories iz treninga
  const burnedCalories = todayWorkouts.reduce((s, w) => s + (w.calories_burned || 0), 0);
  const netCalories = totalCalories - burnedCalories;

  // Animated width za progress barove
  const stepsWidth = stepsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const caloriesWidth = caloriesAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
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

        {/* KALORIJE — GLAVNI KRUG */}
        <View style={styles.mainCircleContainer}>
          <LinearGradient
            colors={['#FFF0F6', '#FFE4F0']}
            style={styles.mainCircleCard}
          >
            <View style={styles.circleWrapper}>
              {/* Outer ring */}
              <View style={styles.circleOuter}>
                <View style={styles.circleInner}>
                  <Text style={styles.circleNumber}>{totalCalories}</Text>
                  <Text style={styles.circleLabel}>kcal eaten</Text>
                  <View style={styles.circleDivider} />
                  <Text style={styles.circleRemaining}>{remainingCalories} left</Text>
                </View>
              </View>

              {/* Burn i goal info */}
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

            {/* Progress bar */}
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

            {/* Net kalorije */}
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

        {/* MAKRO NUTRIJENTI */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          <View style={styles.macroGrid}>

            <View style={styles.macroCard}>
              <View style={[styles.macroIcon, { backgroundColor: '#FFE8E8' }]}>
                <MaterialCommunityIcons name="food-steak" size={20} color="#FF6B6B" />
              </View>
              <Text style={styles.macroName}>Protein</Text>
              <Text style={styles.macroValue}>{Math.round(totalProtein)}g</Text>
              <Text style={styles.macroGoal}>/ {proteinGoal}g</Text>
              <View style={styles.macroBarBg}>
                <View style={[
                  styles.macroBarFill,
                  {
                    width: `${Math.min(100, (totalProtein / proteinGoal) * 100)}%`,
                    backgroundColor: '#FF6B6B',
                  },
                ]} />
              </View>
            </View>

            <View style={styles.macroCard}>
              <View style={[styles.macroIcon, { backgroundColor: '#FFF3E0' }]}>
                <MaterialCommunityIcons name="bread-slice" size={20} color="#FFB74D" />
              </View>
              <Text style={styles.macroName}>Carbs</Text>
              <Text style={styles.macroValue}>{Math.round(totalCarbs)}g</Text>
              <Text style={styles.macroGoal}>/ {carbsGoal}g</Text>
              <View style={styles.macroBarBg}>
                <View style={[
                  styles.macroBarFill,
                  {
                    width: `${Math.min(100, (totalCarbs / carbsGoal) * 100)}%`,
                    backgroundColor: '#FFB74D',
                  },
                ]} />
              </View>
            </View>

            <View style={styles.macroCard}>
              <View style={[styles.macroIcon, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="oil" size={20} color="#66BB6A" />
              </View>
              <Text style={styles.macroName}>Fat</Text>
              <Text style={styles.macroValue}>{Math.round(totalFat)}g</Text>
              <Text style={styles.macroGoal}>/ {fatGoal}g</Text>
              <View style={styles.macroBarBg}>
                <View style={[
                  styles.macroBarFill,
                  {
                    width: `${Math.min(100, (totalFat / fatGoal) * 100)}%`,
                    backgroundColor: '#66BB6A',
                  },
                ]} />
              </View>
            </View>

          </View>
        </View>

        {/* KORACI */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steps Today</Text>
          <LinearGradient
            colors={['#111214', '#2D2F33']}
            style={styles.stepsCard}
          >
            <View style={styles.stepsTop}>
              <View>
                <Text style={styles.stepsNumber}>
                  {currentSteps.toLocaleString()}
                </Text>
                <Text style={styles.stepsGoalText}>Goal: {STEPS_GOAL.toLocaleString()} steps</Text>
              </View>
              <View style={styles.stepsCircle}>
                <Text style={styles.stepsPercent}>{stepsPercent}%</Text>
                <Text style={styles.stepsDone}>done</Text>
              </View>
            </View>

            {/* Steps progress bar */}
            <View style={styles.stepsBarBg}>
              <Animated.View
                style={[
                  styles.stepsBarFill,
                  { width: stepsWidth },
                ]}
              />
            </View>

            {/* Steps stats */}
            <View style={styles.stepsStats}>
              <View style={styles.stepsStat}>
                <Ionicons name="flame-outline" size={16} color="#FFB74D" />
                <Text style={styles.stepsStatText}>
                  {Math.round(currentSteps * 0.04)} kcal
                </Text>
                <Text style={styles.stepsStatLabel}>Burned</Text>
              </View>
              <View style={styles.stepsStat}>
                <Ionicons name="map-outline" size={16} color="#64B5F6" />
                <Text style={styles.stepsStatText}>
                  {(currentSteps * 0.0008).toFixed(1)} km
                </Text>
                <Text style={styles.stepsStatLabel}>Distance</Text>
              </View>
              <View style={styles.stepsStat}>
                <Ionicons name="time-outline" size={16} color="#81C784" />
                <Text style={styles.stepsStatText}>
                  {Math.round(currentSteps / 100)} min
                </Text>
                <Text style={styles.stepsStatLabel}>Active</Text>
              </View>
            </View>

            {!isPedometerAvailable && (
              <Text style={styles.pedometerNote}>
                * Pedometer not available on this device
              </Text>
            )}
          </LinearGradient>
        </View>

        {/* VODA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Water Intake 💧</Text>
          <View style={styles.waterCard}>
            <View style={styles.waterGlasses}>
              {Array.from({ length: waterGoal }).map((_, i) => (
                <TouchableOpacity key={i} style={styles.glassButton}>
                  <Ionicons
                    name={i < waterGlasses ? 'water' : 'water-outline'}
                    size={32}
                    color={i < waterGlasses ? '#64B5F6' : Colors.gray}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.waterText}>
              {waterGlasses} / {waterGoal} glasses  ({Math.round(waterGlasses * 0.25)}L / {waterGoal * 0.25}L)
            </Text>
          </View>
        </View>

        {/* TRENINZI DANAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Workouts 🏋️</Text>
          {todayWorkouts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>😴</Text>
              <Text style={styles.emptyTitle}>No workouts logged today</Text>
              <Text style={styles.emptySubtitle}>Add a workout to boost your Fitnex Score!</Text>
            </View>
          ) : (
            todayWorkouts.map((workout, i) => (
              <View key={i} style={styles.workoutItem}>
                <View style={styles.workoutIcon}>
                  <MaterialCommunityIcons name="dumbbell" size={20} color={Colors.pink} />
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.title}</Text>
                  <Text style={styles.workoutMeta}>
                    {workout.duration_minutes}min • {workout.calories_burned} kcal
                  </Text>
                </View>
                <View style={styles.workoutBadge}>
                  <Text style={styles.workoutBadgeText}>✓ Done</Text>
                </View>
              </View>
            ))
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
                <Text style={styles.summaryValue}>{todayWorkouts.length}</Text>
                <Text style={styles.summaryLabel}>Workouts</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{waterGlasses}</Text>
                <Text style={styles.summaryLabel}>Glasses H₂O</Text>
              </View>
            </View>

            {/* Motivaciona poruka */}
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
  mainCircleCard: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  circleWrapper: { alignItems: 'center', gap: 16 },
  circleOuter: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 12,
    borderColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  circleInner: { alignItems: 'center', gap: 4 },
  circleNumber: { fontSize: 40, fontWeight: '900', color: Colors.textPrimary },
  circleLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  circleDivider: { width: 40, height: 1, backgroundColor: Colors.gray, marginVertical: 4 },
  circleRemaining: { fontSize: 14, color: Colors.pink, fontWeight: '700' },
  circleInfo: {
    flexDirection: 'row',
    gap: 32,
    alignItems: 'center',
  },
  circleInfoItem: { alignItems: 'center', gap: 4 },
  circleInfoValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  circleInfoLabel: { fontSize: 12, color: Colors.textSecondary },
  circleInfoDivider: { width: 1, height: 40, backgroundColor: Colors.gray },
  progressBarContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
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
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
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
  macroIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroName: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  macroValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  macroGoal: { fontSize: 11, color: Colors.textSecondary },
  macroBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.gray,
    borderRadius: 3,
    overflow: 'hidden',
  },
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
  stepsBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  stepsBarFill: {
    height: '100%',
    backgroundColor: Colors.pink,
    borderRadius: 5,
  },
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
  waterGlasses: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  glassButton: { padding: 4 },
  waterText: { textAlign: 'center', fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
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
    borderWidth: 1,
    borderColor: Colors.gray,
    marginBottom: 8,
  },
  workoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutInfo: { flex: 1 },
  workoutName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  workoutMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  workoutBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  workoutBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.success },
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
  motivationRow: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
  },
  motivationText: { fontSize: 14, fontWeight: '700', color: Colors.white, textAlign: 'center' },
});