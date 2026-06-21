import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FOOD_CATEGORIES, FoodCategory, FoodItem } from '../../constants/foodCategories';
import { notificationService } from '../../services/notifications';
import CategoryFoodsModal from './CategoryFoodsModal';

type Props = {
  onFoodLogged?: () => void;
};

export default function FoodCategoryBrowser({ onFoodLogged }: Props) {
  const [activeKey, setActiveKey] = useState(FOOD_CATEGORIES[0].key);
  const [detailCategory, setDetailCategory] = useState<FoodCategory | null>(null);
  const activeCategory = FOOD_CATEGORIES.find((c) => c.key === activeKey) ?? FOOD_CATEGORIES[0];

  const renderIcon = (
    item: { icon: string; iconSet: 'ionicons' | 'material' },
    size: number,
    color: string
  ) => {
    if (item.iconSet === 'material') {
      return <MaterialCommunityIcons name={item.icon as any} size={size} color={color} />;
    }
    return <Ionicons name={item.icon as any} size={size} color={color} />;
  };

  const handleAdd = async (foodName: string, kcal: number) => {
    Alert.alert('Added! 🎉', `${foodName} (${kcal} kcal) added to today's log.`);
    try {
      await notificationService.sendInstantNotification(
        '🍴 Food Logged',
        `${foodName} added to today's log — ${kcal} kcal`
      );
    } finally {
      onFoodLogged?.();
    }
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        {FOOD_CATEGORIES.map((cat) => {
          const active = cat.key === activeKey;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => {
                setActiveKey(cat.key);
                setDetailCategory(cat);
              }}
              activeOpacity={0.85}
            >
              {renderIcon(cat, 16, active ? '#FFFFFF' : '#9CA3AF')}
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsScroll}>
        {activeCategory.items.map((item) => (
          <View key={item.id} style={[styles.itemCard, { backgroundColor: item.color }]}>
            <View style={styles.itemIconCircle}>{renderIcon(item, 22, '#111214')}</View>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemKcal}>
              {item.kcal} kcal · {item.protein}g protein
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAdd(item.name, item.kcal)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <CategoryFoodsModal
        visible={!!detailCategory}
        category={detailCategory}
        onClose={() => setDetailCategory(null)}
        onAdd={(item: FoodItem) => handleAdd(item.name, item.kcal)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabsScroll: { marginBottom: 16 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    gap: 6,
  },
  tabActive: { backgroundColor: '#2F66F6' },
  tabText: { color: '#555555', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  itemsScroll: { marginBottom: 24 },
  itemCard: {
    width: 132,
    borderRadius: 18,
    padding: 14,
    marginRight: 12,
    position: 'relative',
  },
  itemIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  itemName: { fontSize: 14, fontWeight: '800', color: '#111214', marginBottom: 4 },
  itemKcal: { fontSize: 11, color: '#4B5563', fontWeight: '600', marginBottom: 6 },
  addButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#111214',
    alignItems: 'center',
    justifyContent: 'center',
  },
});