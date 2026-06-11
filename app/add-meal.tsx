import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const MEAL_TYPES = [
  { label: 'Breakfast', icon: 'egg-outline' },
  { label: 'Brunch', icon: 'basket-outline' },
  { label: 'Lunch', icon: 'restaurant-outline' },
  { label: 'Dinner', icon: 'fish-outline' },
  { label: 'Drinks', icon: 'cafe-outline' },
  { label: 'Snack', icon: 'nutrition-outline' },
];

export default function AddMealScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>Add New Meal</Text>
      <Text style={styles.subtitle}>Please select meal type</Text>

      {/* Grid */}
      <View style={styles.grid}>
        {MEAL_TYPES.map((item) => {
          const isSelected = selected === item.label;
          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelected(item.label)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={item.icon as any}
                size={32}
                color={isSelected ? Colors.white : '#555'}
              />
              <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, !selected && styles.continueButtonDisabled]}
        onPress={() => {
          if (!selected) return;
          router.push({
            pathname: '/choose-meal',
            params: { meal_type: selected },
          });
        }}
        activeOpacity={0.8}
        disabled={!selected}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  card: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardSelected: {
    backgroundColor: Colors.pink,
  },
  cardLabel: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  cardLabelSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  continueButton: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: Colors.pink,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});