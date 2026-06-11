import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import { supabase } from '../../services/supabase';

const { width } = Dimensions.get('window');

const GOALS = [
  { id: 'lose_weight', label: '🔥 Lose Weight' },
  { id: 'maintain', label: '⚖️ Maintain Weight' },
  { id: 'gain_muscle', label: '💪 Gain Muscle' },
  { id: 'improve_fitness', label: '🏃 Improve Fitness' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: '🪑 Sedentary', desc: 'Little or no exercise', multiplier: 1.2 },
  { id: 'light', label: '🚶 Lightly Active', desc: '1-3 days/week', multiplier: 1.375 },
  { id: 'moderate', label: '🏋️ Moderately Active', desc: '3-5 days/week', multiplier: 1.55 },
  { id: 'very_active', label: '⚡ Very Active', desc: '6-7 days/week', multiplier: 1.725 },
];

export default function SetupProfile() {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [goal, setGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [loading, setLoading] = useState(false);

  // Izračunaj dnevne kalorije (Harris-Benedict formula)
  const calculateCalories = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    const multiplier = ACTIVITY_LEVELS.find(l => l.id === activityLevel)?.multiplier || 1.2;

    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
    } else {
      bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    }

    let calories = bmr * multiplier;

    // Prilagodi cilju
    if (goal === 'lose_weight') calories -= 500;
    if (goal === 'gain_muscle') calories += 300;

    return Math.round(calories);
  };

  const handleFinish = async () => {
    if (!age || !weight || !height || !gender || !goal || !activityLevel) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const calories = calculateCalories();

      const { error } = await supabase
        .from('profiles')
        .update({
          age: parseInt(age),
          weight: parseFloat(weight),
          height: parseFloat(height),
          daily_calorie_goal: calories,
          goal: goal,
          activity_level: activityLevel,
          profile_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const NumberSelector = ({
    value,
    onChange,
    min,
    max,
    unit,
    label,
  }: {
    value: string;
    onChange: (v: string) => void;
    min: number;
    max: number;
    unit: string;
    label: string;
  }) => {
    const num = parseInt(value) || min;
    return (
      <View style={styles.numberSelector}>
        <Text style={styles.numberLabel}>{label}</Text>
        <View style={styles.numberControls}>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() => num > min && onChange(String(num - 1))}
          >
            <Text style={styles.numberButtonText}>−</Text>
          </TouchableOpacity>
          <View style={styles.numberDisplay}>
            <Text style={styles.numberValue}>{num}</Text>
            <Text style={styles.numberUnit}>{unit}</Text>
          </View>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() => num < max && onChange(String(num + 1))}
          >
            <Text style={styles.numberButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#FFB3D9', '#FF5DA3', '#C42B76']}
      style={styles.container}
    >
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={[styles.progressDot, step >= i && styles.progressDotActive]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* STEP 1 — Osnovni podaci */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Let's get to know you! 👋</Text>
            <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

            {/* Gender */}
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.optionsRow}>
              {['male', 'female'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.optionButton, gender === g && styles.optionButtonActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.optionText, gender === g && styles.optionTextActive]}>
                    {g === 'male' ? '👨 Male' : '👩 Female'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <NumberSelector
              label="Age"
              value={age}
              onChange={setAge}
              min={10}
              max={100}
              unit="yrs"
            />
            <NumberSelector
              label="Weight"
              value={weight}
              onChange={setWeight}
              min={30}
              max={250}
              unit="kg"
            />
            <NumberSelector
              label="Height"
              value={height}
              onChange={setHeight}
              min={100}
              max={250}
              unit="cm"
            />
          </View>
        )}

        {/* STEP 2 — Cilj */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your goal? 🎯</Text>
            <Text style={styles.stepSubtitle}>We'll personalize your plan</Text>
            {GOALS.map(g => (
              <TouchableOpacity
                key={g.id}
                style={[styles.goalButton, goal === g.id && styles.goalButtonActive]}
                onPress={() => setGoal(g.id)}
              >
                <Text style={[styles.goalText, goal === g.id && styles.goalTextActive]}>
                  {g.label}
                </Text>
                {goal === g.id && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 3 — Fizička aktivnost */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Activity Level 💪</Text>
            <Text style={styles.stepSubtitle}>How active are you?</Text>
            {ACTIVITY_LEVELS.map(a => (
              <TouchableOpacity
                key={a.id}
                style={[styles.goalButton, activityLevel === a.id && styles.goalButtonActive]}
                onPress={() => setActivityLevel(a.id)}
              >
                <View>
                  <Text style={[styles.goalText, activityLevel === a.id && styles.goalTextActive]}>
                    {a.label}
                  </Text>
                  <Text style={[styles.goalDesc, activityLevel === a.id && styles.goalDescActive]}>
                    {a.desc}
                  </Text>
                </View>
                {activityLevel === a.id && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Dugmad */}
        <View style={styles.buttonsRow}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextBtn, step === 1 && { width: '100%' }]}
            onPress={() => {
              if (step < 3) setStep(step + 1);
              else handleFinish();
            }}
            disabled={loading}
          >
            <Text style={styles.nextBtnText}>
              {loading ? 'Saving...' : step === 3 ? 'Finish 🎉' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 60,
    paddingBottom: 8,
  },
  progressDot: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  progressDotActive: {
    backgroundColor: Colors.white,
  },
  content: {
    padding: Spacing.screenPadding,
    paddingBottom: 40,
  },
  stepContainer: {
    gap: 12,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  optionButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  optionText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  optionTextActive: {
    color: Colors.darkPink,
  },
  numberSelector: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  numberLabel: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  numberControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numberButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.darkPink,
  },
  numberDisplay: {
    alignItems: 'center',
  },
  numberValue: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
  },
  numberUnit: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  goalButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalButtonActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  goalText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  goalTextActive: {
    color: Colors.darkPink,
  },
  goalDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  goalDescActive: {
    color: Colors.pink,
  },
  checkmark: {
    color: Colors.darkPink,
    fontSize: 20,
    fontWeight: '800',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  backBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  backBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 2,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextBtnText: {
    color: Colors.darkPink,
    fontSize: 16,
    fontWeight: '800',
  },
});