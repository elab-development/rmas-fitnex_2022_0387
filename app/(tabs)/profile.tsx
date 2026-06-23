import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Colors } from '../../constants/Colors';
import { router } from 'expo-router';
import { useProfile } from '../../context/PorifleProvider';

const { width } = Dimensions.get('window');

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PRO_FEATURES = [
  { icon: 'analytics', label: 'Advanced Analytics', desc: 'Detailed insights into your progress' },
  { icon: 'nutrition', label: 'AI Meal Planner', desc: 'Personalized meal plans with AI' },
  { icon: 'barbell', label: 'Custom Workouts', desc: 'Build and save custom workout plans' },
  { icon: 'trophy', label: 'Challenges', desc: 'Join community fitness challenges' },
  { icon: 'sync', label: 'Device Sync', desc: 'Sync with Apple Health & Google Fit' },
  { icon: 'headset', label: 'Priority Support', desc: '24/7 dedicated support' },
];

export default function ProfileScreen() {
const { profile, profileImage, dailyCalorieGoal, loading, todaySteps } = useProfile();
  const [weeklyScores, setWeeklyScores] = useState<any[]>([]);
  const [showProModal, setShowProModal] = useState(false);
  const [todayScore, setTodayScore] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // OBRISANO: fetch profila — sad dolazi iz context-a

    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);

    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const { data: scoresData } = await supabase
      .from('daily_scores')
      .select('*')
      .eq('user_id', user.id)
      .in('date', dates);

    const mapped = dates.map((date, i) => {
      const found = scoresData?.find(s => s.date === date);
      return { day: DAYS[i], score: found?.score || 0, date };
    });

    setWeeklyScores(mapped);

    const todayStr = today.toISOString().split('T')[0];
    const todayData = scoresData?.find(s => s.date === todayStr);
    if (!todayData) {
      await generateTodayScore(user.id, todayStr, profile); // ← profile iz context-a
    } else {
      setTodayScore(todayData);
    }

  } catch (error: any) {
    console.log(error.message);
  } 
};

  const generateTodayScore = async (userId: string, date: string, profileData: any) => {
    try {
      // Proveri treninge danas
      const { data: workouts } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`);

      // Proveri ishranu danas
      const { data: nutrition } = await supabase
        .from('nutrition_logs')
        .select('calories')
        .eq('user_id', userId)
        .gte('logged_at', `${date}T00:00:00`)
        .lte('logged_at', `${date}T23:59:59`);

      const totalCalories = nutrition?.reduce((sum, n) => sum + (n.calories || 0), 0) || 0;
      const calorieGoal = profileData?.daily_calorie_goal || 2000;

      const workoutCompleted = (workouts?.length || 0) > 0;
      const caloriesCompleted = totalCalories >= calorieGoal * 0.8 && totalCalories <= calorieGoal * 1.2;

      // Scoring sistem
      let score = 0;
      if (workoutCompleted) score += 40;
      if (caloriesCompleted) score += 40;
      score += Math.min(20, Math.floor(totalCalories / calorieGoal * 20));

      const { data: newScore } = await supabase
        .from('daily_scores')
        .upsert({
          user_id: userId,
          date,
          calories_completed: caloriesCompleted,
          workout_completed: workoutCompleted,
          steps_completed: false,
          score,
        })
        .select()
        .single();

      setTodayScore(newScore);
    } catch (e: any) {
      console.log(e.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const maxScore = Math.max(...weeklyScores.map(s => s.score), 100);
  const totalWeeklyScore = weeklyScores.reduce((sum, s) => sum + s.score, 0);
  const fitnexScore = Math.min(100, Math.round(totalWeeklyScore / 7));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER SA SLIKOM */}
        <View style={styles.headerImageContainer}>
          <Image
            source={require('../../assets/profile-background.png')}
            style={styles.headerBg}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', Colors.white]}
            style={styles.headerFade}
          />
        </View>

        {/* PROFIL INFO */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {profileImage ?(
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#9CA3AF" />
              </View>
            )}
          </View>

          <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
          <Text style={styles.location}>
            {profile?.city ? `${profile.city}  ` : ''}
            <Text
              style={styles.memberBadge}
              onPress={() => setShowProModal(true)}
            >
              {profile?.membership_type || 'Basic Member'}
            </Text>
          </Text>
        </View>

        <View style={styles.body}>

          {/* FITNEX SCORE */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <View style={styles.scoreTitle}>
                <View style={styles.scoreDot} />
                <Text style={styles.scoreTitleText}>Fitnex Score</Text>
              </View>
              <TouchableOpacity style={styles.weeklyBadge}>
                <Text style={styles.weeklyBadgeText}>Weekly</Text>
              </TouchableOpacity>
            </View>

            {/* Score broj */}
            <View style={styles.scoreNumberContainer}>
              <View style={styles.scoreNumberBadge}>
                <Text style={styles.scoreNumber}>{fitnexScore}</Text>
              </View>
            </View>

            {/* Bar chart */}
            <View style={styles.chart}>
              {weeklyScores.map((item, index) => {
                const barHeight = maxScore > 0 ? (item.score / maxScore) * 80 : 4;
                const isToday = index === new Date().getDay() - 1;
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(barHeight, 4),
                            backgroundColor: isToday ? Colors.black : Colors.gray,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, isToday && styles.barLabelActive]}>
                      {item.day}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Y axis labels */}
            <View style={styles.yAxis}>
              {[100, 90, 80, 70, 60].map(v => (
                <Text key={v} style={styles.yAxisLabel}>{v}</Text>
              ))}
            </View>
          </View>

          {/* STATS KARTICE */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🎂</Text>
              <Text style={styles.statValue}>{profile?.age || '--'}yr</Text>
              <Text style={styles.statLabel}>Current Age</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⚖️</Text>
              <Text style={styles.statValue}>{profile?.weight || '--'}kg</Text>
              <Text style={styles.statLabel}>Weight</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{dailyCalorieGoal}</Text>
              <Text style={styles.statLabel}>Daily Intake</Text>
            </View>
          </View>

          {/* TODAY SCORE BREAKDOWN */}
          {todayScore && (
            <View style={styles.todayCard}>
              <Text style={styles.todayTitle}>Today's Score</Text>
              <View style={styles.todayRow}>
                <View style={styles.todayItem}>
                  <Text style={styles.todayEmoji}>🏋️</Text>
                  <Text style={styles.todayLabel}>Workout</Text>
                  <Text style={[styles.todayStatus, { color: todayScore.workout_completed ? Colors.success : Colors.error }]}>
                    {todayScore.workout_completed ? '+40pts' : '0pts'}
                  </Text>
                </View>
                <View style={styles.todayItem}>
                  <Text style={styles.todayEmoji}>🥗</Text>
                  <Text style={styles.todayLabel}>Calories</Text>
                  <Text style={[styles.todayStatus, { color: todayScore.calories_completed ? Colors.success : Colors.error }]}>
                    {todayScore.calories_completed ? '+40pts' : '0pts'}
                  </Text>
                </View>
                
              </View>
              <View style={styles.todayTotal}>
                <Text style={styles.todayTotalText}>Total today: {todayScore.score} pts</Text>
              </View>
            </View>
          )}
{/* Steps */}
<View style={styles.stepsCard}>
  <Text style={styles.todayTitle}>Today's Steps</Text>
  <View style={styles.stepsRow}>
    <Text style={styles.todayEmoji}>👟</Text>
    <Text style={styles.stepsNumber}>{todaySteps.toLocaleString()}</Text>
    <Text style={[styles.todayStatus, { color: todaySteps >= 10000 ? Colors.success : Colors.error }]}>
      {todaySteps >= 10000 ? 'Goal reached! +20pts' : `${10000 - todaySteps} steps to go`}
    </Text>
  </View>
</View>
          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* PRO MODAL */}
      <Modal
        visible={showProModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Upgrade to Pro ⚡</Text>
              <Text style={styles.modalSubtitle}>Unlock all premium features</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowProModal(false)}
              >
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalBody}>
              {PRO_FEATURES.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={feature.icon as any} size={20} color={Colors.pink} />
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureLabel}>{feature.label}</Text>
                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                </View>
              ))}

              <View style={styles.pricingContainer}>
                <TouchableOpacity style={styles.pricingCard}>
                  <Text style={styles.pricingPeriod}>Monthly</Text>
                  <Text style={styles.pricingPrice}>$9.99</Text>
                  <Text style={styles.pricingPer}>/month</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pricingCard, styles.pricingCardActive]}>
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>Best Value</Text>
                  </View>
                  <Text style={[styles.pricingPeriod, { color: Colors.white }]}>Yearly</Text>
                  <Text style={[styles.pricingPrice, { color: Colors.white }]}>$59.99</Text>
                  <Text style={[styles.pricingPer, { color: 'rgba(255,255,255,0.7)' }]}>/year</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.upgradeButton}>
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.upgradeGradient}
                >
                  <Text style={styles.upgradeText}>Upgrade Now →</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowProModal(false)}
              >
                <Text style={styles.cancelText}>Maybe later</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  headerImageContainer: {
    width: width,
    height: 200,
    position: 'relative',
  },
  headerBg: {
    position: 'absolute',
    width: width,
    height: 200,
  },
  headerFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -50,
    paddingBottom: 16,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: Colors.gray,
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  location: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  memberBadge: {
    color: Colors.pink,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  scoreCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray,
    position: 'relative',
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.black,
  },
  scoreTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  weeklyBadge: {
    backgroundColor: Colors.gray,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  weeklyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  scoreNumberContainer: {
    position: 'absolute',
    top: 48,
    left: 28,
    zIndex: 10,
  },
  scoreNumberBadge: {
    backgroundColor: Colors.black,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreNumber: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginTop: 8,
    paddingLeft: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barWrapper: {
    height: 80,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  barLabelActive: {
    color: Colors.black,
    fontWeight: '700',
  },
  yAxis: {
    position: 'absolute',
    left: 8,
    top: 48,
    gap: 8,
  },
  yAxisLabel: {
    fontSize: 10,
    color: Colors.textLight,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray,
    gap: 4,
  },
  statEmoji: { fontSize: 20 },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  todayCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  todayItem: {
    alignItems: 'center',
    gap: 4,
  },
  todayEmoji: { fontSize: 24 },
  todayLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  todayStatus: {
    fontSize: 13,
    fontWeight: '800',
  },
  todayTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
    alignItems: 'center',
  },
  todayTotalText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.error,
    marginTop: 8,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 24,
    paddingTop: 28,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  modalClose: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  modalBody: {
    padding: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pricingContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  pricingCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gray,
    gap: 4,
    position: 'relative',
  },
  pricingCardActive: {
    backgroundColor: Colors.darkPink,
    borderColor: Colors.darkPink,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: Colors.pink,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bestValueText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  pricingPeriod: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  pricingPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pricingPer: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  upgradeButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  upgradeGradient: {
    padding: 16,
    alignItems: 'center',
  },
  upgradeText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 12,
    marginBottom: 20,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  todayStepsCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stepsCard: {
  backgroundColor: Colors.white,
  borderRadius: 20,
  padding: 16,
  borderWidth: 1,
  borderColor: Colors.gray,
},
stepsRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},
stepsNumber: {
  fontSize: 28,
  fontWeight: '800',
  color: Colors.textPrimary,
},
});