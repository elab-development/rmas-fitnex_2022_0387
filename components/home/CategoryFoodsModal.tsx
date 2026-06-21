import React from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { FoodCategory, FoodItem } from '../../constants/foodCategories';

type Props = {
  visible: boolean;
  category: FoodCategory | null;
  onClose: () => void;
  onAdd: (item: FoodItem) => void;
};

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

export default function CategoryFoodsModal({ visible, category, onClose, onAdd }: Props) {
  if (!category) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Best {category.label} Picks</Text>
              <Text style={styles.headerSubtitle}>Popular, nutrient-dense choices</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={category.items}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={[styles.imageCircle, { backgroundColor: item.color }]}>
                  {renderIcon(item, 30, '#111214')}
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => onAdd(item)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.macrosRow}>
                    <View style={styles.macroPill}>
                      <Text style={styles.macroValue}>{item.kcal}</Text>
                      <Text style={styles.macroLabel}>kcal</Text>
                    </View>
                    <View style={styles.macroPill}>
                      <Text style={styles.macroValue}>{item.protein}g</Text>
                      <Text style={styles.macroLabel}>protein</Text>
                    </View>
                    <View style={styles.macroPill}>
                      <Text style={styles.macroValue}>{item.carbs}g</Text>
                      <Text style={styles.macroLabel}>carbs</Text>
                    </View>
                    <View style={styles.macroPill}>
                      <Text style={styles.macroValue}>{item.fat}g</Text>
                      <Text style={styles.macroLabel}>fat</Text>
                    </View>
                  </View>

                  <Text style={styles.description}>{item.description}</Text>
                </View>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '85%',
    minHeight: '55%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E2E2',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111214' },
  headerSubtitle: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginTop: 2 },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111214',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  imageCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: { fontSize: 15, fontWeight: '800', color: '#111214' },
  addButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#111214',
    alignItems: 'center',
    justifyContent: 'center',
  },
  macrosRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  macroPill: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  macroValue: { fontSize: 12, fontWeight: '800', color: '#111214' },
  macroLabel: { fontSize: 9, fontWeight: '600', color: '#9CA3AF' },
  description: { fontSize: 12, color: '#6B7280', fontWeight: '500', lineHeight: 17 },
});