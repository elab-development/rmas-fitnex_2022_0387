import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const MEAL_TYPES = [
  { label: 'Breakfast', icon: 'egg-outline' },
  { label: 'Brunch', icon: 'basket-outline' },
  { label: 'Lunch', icon: 'restaurant-outline' },
  { label: 'Dinner', icon: 'fish-outline' },
  { label: 'Drinks', icon: 'cafe-outline' },
  { label: 'Snack', icon: 'nutrition-outline' },
];

export default function ScanBarcodeScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!permission) {
    return <View style={styles.centered}><ActivityIndicator color={Colors.pink} /></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="camera-outline" size={48} color={Colors.pink} style={{ marginBottom: 16 }} />
        <Text style={styles.permissionText}>We need camera access to scan barcodes</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${data}.json`);
      const json = await res.json();

      if (json.status === 1) {
        const p = json.product;
        const nutriments = p.nutriments || {};

        setProduct({
          name: p.product_name || 'Unknown product',
          image_url: p.image_url || null,
          calories: Math.round(nutriments['energy-kcal_100g'] || 0),
          protein_g: Math.round(nutriments['proteins_100g'] || 0),
          carbs_g: Math.round(nutriments['carbohydrates_100g'] || 0),
          fat_g: Math.round(nutriments['fat_100g'] || 0),
        });
      } else {
        Alert.alert('Not found', 'This product was not found in the database.');
        setScanned(false);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not fetch product info.');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedType) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('meals').insert({
      user_id: user?.id,
      meal_type: selectedType,
      name: product.name,
      calories: product.calories,
      protein_g: product.protein_g,
      carbs_g: product.carbs_g,
      fat_g: product.fat_g,
      image_url: product.image_url,
    });

    setSaving(false);

    if (!error) {
      router.push({
        pathname: '/(tabs)/nutrition',
        params: { showModal: 'true' },
      });
    } else {
      console.log('insert error:', error);
      Alert.alert('Error', error.message);
    }
  };

  // ── Result screen ─────────────────────────────
  if (product) {
    return (
      <SafeAreaView style={styles.resultContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.resultScroll}>
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, styles.productImagePlaceholder]}>
              <Ionicons name="nutrition-outline" size={48} color="#ccc" />
            </View>
          )}

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCal}>{product.calories} kcal / 100g</Text>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{product.protein_g}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{product.carbs_g}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{product.fat_g}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>

          <Text style={styles.selectLabel}>Select meal type</Text>
          <View style={styles.typeGrid}>
            {MEAL_TYPES.map(item => {
              const isSelected = selectedType === item.label;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                  onPress={() => setSelectedType(item.label)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={28}
                    color={isSelected ? Colors.white : '#555'}
                  />
                  <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.saveButton, !selectedType && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!selectedType || saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Add Meal  →</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Camera view ─────────────────────────────
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <TouchableOpacity onPress={() => router.back()} style={styles.backButtonOverlay}>
        <Ionicons name="arrow-back" size={20} color="#fff" />
      </TouchableOpacity>

      <View style={styles.scanOverlay}>
        <View style={styles.scanBox}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        <Text style={styles.scanText}>
          {loading ? 'Looking up product...' : 'Align barcode within frame'}
        </Text>
        {loading && <ActivityIndicator color={Colors.pink} style={{ marginTop: 12 }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', padding: 24,
  },
  camera: { flex: 1 },
  backButtonOverlay: {
    position: 'absolute', top: 50, left: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  backButton: {
    margin: 16, width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center',
  },
  scanOverlay: {
    position: 'absolute', bottom: 100, left: 0, right: 0,
    alignItems: 'center',
  },
  scanBox: {
    width: 260, height: 160,
    position: 'relative',
    marginBottom: 20,
  },
  corner: {
    position: 'absolute',
    width: 30, height: 30,
    borderColor: Colors.pink,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },
  scanText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  permissionText: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 20 },
  permissionButton: {
    backgroundColor: Colors.pink, paddingVertical: 14,
    paddingHorizontal: 32, borderRadius: 30,
  },
  permissionButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  // Result screen
  resultContainer: { flex: 1, backgroundColor: '#fff' },
  resultScroll: { paddingHorizontal: 24, paddingBottom: 20, alignItems: 'center' },
  productImage: {
    width: 160, height: 160, borderRadius: 80,
    marginBottom: 20, marginTop: 8,
  },
  productImagePlaceholder: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center', justifyContent: 'center',
  },
  productName: {
    fontSize: 22, fontWeight: '700', color: '#1a1a1a',
    textAlign: 'center', marginBottom: 6,
  },
  productCal: { fontSize: 14, color: '#888', marginBottom: 24 },
  macroRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: '#f8f8f8', borderRadius: 16,
    paddingVertical: 16, width: '100%', marginBottom: 32,
  },
  macroItem: { alignItems: 'center', flex: 1 },
  macroDivider: { width: 1, height: 30, backgroundColor: '#e0e0e0' },
  macroValue: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  macroLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  selectLabel: {
    fontSize: 16, fontWeight: '600', color: '#1a1a1a',
    alignSelf: 'flex-start', marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', width: '100%', rowGap: 12,
  },
  typeCard: {
    width: '31%', aspectRatio: 1,
    backgroundColor: '#f5f5f5', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  typeCardSelected: { backgroundColor: Colors.pink },
  typeLabel: { fontSize: 13, color: '#555', fontWeight: '500' },
  typeLabelSelected: { color: '#fff', fontWeight: '600' },
  saveButton: {
    marginHorizontal: 24, marginBottom: 16,
    backgroundColor: Colors.pink, paddingVertical: 18,
    borderRadius: 30, alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});