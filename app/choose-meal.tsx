import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, SafeAreaView, Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

type Meal = {
  id: string;
  name: string;
  tag: string;
  duration_min: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  image_url: string;
};

export default function ChooseMealScreen() {
  const router = useRouter();
  const { meal_type } = useLocalSearchParams<{ meal_type: string }>();
  
  console.log('meal_type received:', meal_type);

  const [meals, setMeals] = useState<Meal[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      const { data, error } = await supabase
        .from('meals_catalog')
        .select('*')
        .eq('category', meal_type);
             console.log('data:', data);
      console.log('error:', error);
      if (!error && data) setMeals(data);
      setLoading(false);
    };
    fetchMeals();
  }, [meal_type]);

  const current = meals[index];

const handleAddMeal = async () => {
  console.log('handleAddMeal called');
  console.log('current:', current);
  console.log('index:', index);
  console.log('meals length:', meals.length);
  
  if (!current) {
    console.log('NO CURRENT MEAL!');
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  console.log('user:', user?.id);
  
  const { error } = await supabase.from('meals').insert({
    user_id: user?.id,
    catalog_id: current.id,
    meal_type,
    name: current.name,
    calories: current.calories,
    protein_g: current.protein_g,
    carbs_g: current.carbs_g,
    fat_g: current.fat_g,
    image_url: current.image_url,
  });

  console.log('insert error:', error);

  if (!error) {
    router.push({
      pathname: '/(tabs)/nutrition',
      params: { showModal: 'true' },
    });
  }
};

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.pink} />
      </View>
    );
  }

  if (!current) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={styles.noMeals}>No meals found for {meal_type}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color="#333" />
      </TouchableOpacity>

      {/* Meal image */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: current.image_url }} style={styles.image} />

        {/* Left arrow */}
        {index > 0 && (
          <TouchableOpacity style={styles.arrowLeft} onPress={() => setIndex(index - 1)}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
        )}

        {/* Right arrow */}
        {index < meals.length - 1 && (
          <TouchableOpacity style={styles.arrowRight} onPress={() => setIndex(index + 1)}>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        {current.tag ? (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{current.tag}</Text>
          </View>
        ) : null}

        <Text style={styles.mealName}>{current.name}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{current.duration_min}min</Text>
          <Text style={styles.metaText}>{current.calories}Kcal</Text>
        </View>

        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{current.protein_g}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{current.carbs_g}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{current.fat_g}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
      </View>

      {/* Add meal button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddMeal} activeOpacity={0.8}>
        <Text style={styles.addButtonText}>Add meal  →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    margin: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: width,
    height: width * 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: width * 0.78,
    height: width * 0.78,
    borderRadius: width * 0.39,
  },
  arrowLeft: {
    position: 'absolute',
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowRight: {
    position: 'absolute',
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    paddingHorizontal: 28,
    paddingTop: 16,
    alignItems: 'center',
  },
  tagBadge: {
    borderWidth: 1.5,
    borderColor: Colors.pink,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 12,
  },
  tagText: {
    color: Colors.pink,
    fontSize: 13,
    fontWeight: '600',
  },
  mealName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  metaText: {
    fontSize: 14,
    color: '#888',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    paddingVertical: 14,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  macroLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  addButton: {
    position: 'absolute',
    bottom: 36,
    left: 24,
    right: 24,
    backgroundColor: Colors.pink,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  noMeals: {
    color: '#888',
    fontSize: 16,
  },
});