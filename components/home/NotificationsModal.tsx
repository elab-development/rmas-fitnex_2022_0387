import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getNotificationHistory, NotificationHistoryItem } from '../../services/notificationHistory';

type Props = {
  visible: boolean;
  onClose: () => void;
};

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  if (date.toDateString() === now.toDateString()) {
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function NotificationsModal({ visible, onClose }: Props) {
  const [items, setItems] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const history = await getNotificationHistory();
    setItems(history);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (visible) load();
  }, [visible, load]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>Everything sent to you, up to now</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.pink} style={{ marginTop: 40 }} />
          ) : items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={40} color="#C7C7C7" />
              <Text style={styles.emptyText}>No notifications yet.{'\n'}Check back later!</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <View style={styles.itemIconWrap}>
                    <Ionicons
                      name={item.type === 'instant' ? 'flash' : 'alarm'}
                      size={18}
                      color={Colors.pink}
                    />
                  </View>
                  <View style={styles.itemTextWrap}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemBody} numberOfLines={2}>
                      {item.body}
                    </Text>
                  </View>
                  <Text style={styles.itemTime}>{formatRelativeTime(item.date)}</Text>
                </View>
              )}
            />
          )}
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
    maxHeight: '80%',
    minHeight: '50%',
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
  emptyState: { alignItems: 'center', paddingVertical: 50 },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  itemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFE3EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTextWrap: { flex: 1, marginRight: 8 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#111214', marginBottom: 2 },
  itemBody: { fontSize: 12, color: '#6B7280', fontWeight: '500', lineHeight: 16 },
  itemTime: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
});