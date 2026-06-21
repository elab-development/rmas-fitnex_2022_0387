import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons  } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { RoutineContent } from '../../constants/routines';

type Props = {
  visible: boolean;
  routine: RoutineContent | null;
  onClose: () => void;
};

export default function RoutineModal({ visible, routine, onClose }: Props) {
  if (!routine) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={[styles.hero, { backgroundColor: routine.color }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#111214" />
            </TouchableOpacity>
            {routine.image ? (
              <Image source={routine.image} style={styles.heroImage} resizeMode="contain" />
            ) : routine.icon ? (
              <View style={styles.heroIconCircle}>
                {routine.icon.set === 'material' ? (
                  <MaterialCommunityIcons name={routine.icon.name as any} size={36} color="#111214" />
                ) : (
                  <Ionicons name={routine.icon.name as any} size={36} color="#111214" />
                )}
              </View>
            ) : null}
            <Text style={styles.heroTitle}>{routine.title}</Text>
            <Text style={styles.heroSubtitle}>{routine.subtitle}</Text>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.intro}>{routine.intro}</Text>

            <Text style={styles.tipsHeader}>Quick Tips</Text>
            {routine.tips.map((tip, idx) => (
              <View key={idx} style={styles.tipRow}>
                <View style={styles.tipBullet}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}

            <TouchableOpacity style={styles.gotItButton} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.gotItText}>Got it</Text>
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: '85%',
    overflow: 'hidden',
  },
  hero: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: { width: 90, height: 90, marginBottom: 8 },
  heroIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#111214' },
  heroSubtitle: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginTop: 2 },
  body: { paddingHorizontal: 24, paddingTop: 20 },
  intro: { fontSize: 14, color: '#4B5563', lineHeight: 21, fontWeight: '500', marginBottom: 20 },
  tipsHeader: { fontSize: 16, fontWeight: '800', color: '#111214', marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  tipBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  tipText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19, fontWeight: '500' },
  gotItButton: {
    backgroundColor: '#111214',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  gotItText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});