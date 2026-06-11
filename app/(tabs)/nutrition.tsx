import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Image, Modal, ScrollView, ActivityIndicator,
  ImageBackground, Dimensions
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { Colors } from '../../constants/Colors';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type Meal = {
  id: string;
  name: string;
  meal_type: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  image_url: string;
  created_at: string;
};

const FILTERS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Brunch', 'Drinks'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getLast7Days() {
  const days = [];
  for (let i = 3; i >= -3; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();
}

export default function NutritionScreen() {
  const router = useRouter();
  const { showModal: showModalParam } = useLocalSearchParams<{ showModal?: string }>();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [filtered, setFiltered] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hasEverAddedMeal, setHasEverAddedMeal] = useState(false);

  const days = getLast7Days();

  useEffect(() => {
    if (showModalParam === 'true') setShowModal(true);
  }, [showModalParam]);

  const fetchMeals = async (date: Date) => {
    setLoading(true);

    // Check if user has ANY meals ever
    const { data: { user } } = await supabase.auth.getUser();
    const { data: allMeals } = await supabase
      .from('meals')
      .select('id')
      .eq('user_id', user?.id);
    setHasEverAddedMeal((allMeals?.length ?? 0) > 0);

    // Fetch meals for selected date
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user?.id)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMeals(data);
      setFiltered(data);
      setActiveFilter('All');
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchMeals(selectedDate);
    }, [selectedDate])
  );

  const applyFilter = (filter: string) => {
    setActiveFilter(filter);
    if (filter === 'All') setFiltered(meals);
    else setFiltered(meals.filter(m => m.meal_type === filter));
  };

  // ── Empty state screen ──────────────────────────────────────
  if (!loading && !hasEverAddedMeal) {
    return (
      <ImageBackground
        source={require('../../assets/Add-meals-first.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.emptyContent}>
          <Text style={styles.emptyTitle}>No Meals</Text>
          <Text style={styles.emptySubtitle}>
            You have 0 meals. Create a new one and start tracking your fitness activity.
          </Text>
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => router.push('/add-meal')}
          >
            <Text style={styles.addNewButtonText}>Add New Meal  →</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  // ── Main screen ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Meals</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/add-meal')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendarStrip}>
        {days.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.dayItem, isSelected && styles.dayItemSelected]}
              onPress={() => { setSelectedDate(day); fetchMeals(day); }}
            >
              <Text style={[styles.dayMonth, isSelected && styles.dayTextSelected]}>
                {MONTH_NAMES[day.getMonth()]}
              </Text>
              <Text style={[styles.dayNumber, isSelected && styles.dayTextSelected]}>
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterStrip}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => applyFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Meals list */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.pink} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noMealsText}>No meals for this day.</Text>
          <Text style={styles.noMealsSubText}>Tap + to add your first meal!</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.mealCard}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.mealImage} />
              ) : (
                <View style={[styles.mealImage, styles.mealImagePlaceholder]}>
                  <Ionicons name="restaurant-outline" size={24} color="#ccc" />
                </View>
              )}
              <View style={styles.mealInfo}>
                <Text style={styles.mealName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.mealCal}>🔥 {item.calories} kcal</Text>
                <View style={styles.macroRow}>
                  <Text style={styles.macroText}>{item.protein_g}g Protein</Text>
                  <Text style={styles.macroText}>{item.fat_g}g Fat</Text>
                  <Text style={styles.macroText}>{item.carbs_g}g Carbs</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Food Added Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconSuccess}>
              <Ionicons name="checkmark" size={28} color={Colors.pink} />
            </View>
            <Text style={styles.modalTitle}>Food Added!</Text>
            <Text style={styles.modalSubtitle}>
              You have successfully added a meal to your diet schedule
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalButtonText}>Great, thanks! 🍴</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.modalClose} onPress={() => setShowModal(false)}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Empty state
  background: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  emptyContent: {
    flex: 1, justifyContent: 'flex-end',
    alignItems: 'center', paddingBottom: 120, paddingHorizontal: 30,
  },
  emptyTitle: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  emptySubtitle: { color: '#fff', fontSize: 14, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  addNewButton: {
    backgroundColor: '#FF4D9E', paddingVertical: 16,
    paddingHorizontal: 50, borderRadius: 30, width: '100%', alignItems: 'center',
  },
  addNewButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  // Main screen
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center',
  },
  calendarStrip: { paddingHorizontal: 12, marginBottom: 12 },
  dayItem: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, marginHorizontal: 4,
  },
  dayItemSelected: { backgroundColor: Colors.pink },
  dayMonth: { fontSize: 11, color: '#888' },
  dayNumber: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  dayTextSelected: { color: '#fff' },
  filterStrip: { paddingHorizontal: 16, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#fff',
  },
  filterChipActive: { backgroundColor: Colors.pink, borderColor: Colors.pink },
  filterText: { fontSize: 13, color: '#666' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  mealCard: {
    flexDirection: 'row', backgroundColor: '#fafafa', borderRadius: 16,
    padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  mealImage: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  mealImagePlaceholder: { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  mealCal: { fontSize: 12, color: '#888', marginBottom: 6 },
  macroRow: { flexDirection: 'row', gap: 8 },
  macroText: { fontSize: 11, color: '#aaa' },
  noMealsText: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 6 },
  noMealsSubText: { fontSize: 14, color: '#aaa' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 24,
    padding: 28, alignItems: 'center', width: '80%',
  },
  modalIconSuccess: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff0f6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    borderWidth: 1.5, borderColor: Colors.pink,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 20 },
  modalButton: { backgroundColor: '#1a1a1a', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 30 },
  modalButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  modalClose: {
    marginTop: 20, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center',
  },
});