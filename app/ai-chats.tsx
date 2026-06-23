import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, Animated, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../services/supabase';
import { Colors } from '../constants/Colors';

const TABS = ['AI', 'Deleted'];

const ICON_COLORS = ['#FF4D9E', '#FF6B35', '#7B61FF', '#00B4D8', '#4CAF50', '#FFB74D'];
const SWIPE_THRESHOLD = -80;

type Conversation = {
  id: string;
  title: string;
  last_message: string;
  updated_at: string;
  messages: any[];
};

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function SwipeableChatRow({ item, index, onPress, onDelete }: {
  item: Conversation; index: number; onPress: () => void; onDelete: () => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dy) < 20,
      onPanResponderMove: (_, g) => translateX.setValue(Math.min(0, Math.max(-110, g.dx))),
      onPanResponderRelease: (_, g) => {
        if (g.dx < SWIPE_THRESHOLD) {
          Animated.spring(translateX, { toValue: -90, useNativeDriver: true }).start();
          setSwiped(true);
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          setSwiped(false);
        }
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    setSwiped(false);
  };

  const color = ICON_COLORS[index % ICON_COLORS.length];
  const lastMsg = item.messages?.[item.messages.length - 1];
  const preview = lastMsg?.content?.slice(0, 45) + (lastMsg?.content?.length > 45 ? '...' : '') || 'No messages yet';

  return (
    <View style={styles.swipeWrapper}>
      <View style={styles.deleteBackground}>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => { closeSwipe(); onDelete(); }}>
          <Ionicons name="trash-outline" size={22} color="#fff" />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Animated.View style={[styles.chatRowAnimated, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <TouchableOpacity
          style={styles.chatRow}
          onPress={() => swiped ? closeSwipe() : onPress()}
          onLongPress={() => Alert.alert('Delete Chat', `Delete "${item.title || 'this chat'}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: onDelete },
          ])}
          activeOpacity={0.75}
        >
          <View style={[styles.chatIcon, { backgroundColor: color + '22' }]}>
            <Ionicons name="chatbubble-ellipses" size={20} color={color} />
          </View>
          <View style={styles.chatInfo}>
            <Text style={styles.chatTitle} numberOfLines={1}>{item.title || 'New Chat'}</Text>
            <Text style={styles.chatPreview} numberOfLines={1}>{preview}</Text>
          </View>
          <View style={styles.chatRight}>
            <Text style={styles.chatTime}>{timeAgo(item.updated_at)}</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function AIChatsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('AI');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      setConversations(data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchConversations(); }, []));

  const handleDelete = (conv: Conversation) => {
    Alert.alert('Delete Chat', `Are you sure you want to delete "${conv.title || 'this chat'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setConversations(prev => prev.filter(c => c.id !== conv.id));
          const { error } = await supabase.from('ai_conversations').delete().eq('id', conv.id);
          if (error) { Alert.alert('Error', 'Could not delete chat.'); fetchConversations(); }
        },
      },
    ]);
  };

  const handleDeleteAll = () => {
    if (conversations.length === 0) return;
    Alert.alert('Delete All Chats', 'Delete all conversations? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All', style: 'destructive', onPress: async () => {
          const ids = conversations.map(c => c.id);
          setConversations([]);
          const { error } = await supabase.from('ai_conversations').delete().in('id', ids);
          if (error) { Alert.alert('Error', 'Could not delete all chats.'); fetchConversations(); }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/workout')}>
          <Ionicons name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My AI Chats</Text>
        {conversations.length > 0 && (
          <TouchableOpacity onPress={handleDeleteAll} style={styles.deleteAllBtn}>
            <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        )}
      </View>

     

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Earlier Today</Text>
        <Text style={styles.hint}>Swipe left to delete</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.pink} style={{ marginTop: 40 }} />
      ) : conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>No chats yet</Text>
          <Text style={styles.emptySubtitle}>Start a new conversation with your AI fitness coach</Text>
          <TouchableOpacity style={styles.newChatBtn} onPress={() => router.push('/ai-chat')}>
            <Text style={styles.newChatBtnText}>Create New Conversation →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <SwipeableChatRow
              item={item}
              index={index}
              onPress={() => router.push({ pathname: '/ai-chat', params: { conversationId: item.id } })}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/ai-chat')} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#1a1a2e', paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', flex: 1 },
  deleteAllBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  tabsRow: { flexDirection: 'row', backgroundColor: '#1a1a2e', paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
  tab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  tabActive: { backgroundColor: Colors.pink },
  tabText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  hint: { fontSize: 12, color: '#ccc' },
  swipeWrapper: { overflow: 'hidden' },
  deleteBackground: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 90, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF3B30', borderRadius: 12 },
  deleteBtn: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  deleteBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  chatRowAnimated: { backgroundColor: '#fff' },
  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  chatIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chatInfo: { flex: 1 },
  chatTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  chatPreview: { fontSize: 12, color: '#aaa' },
  chatRight: { alignItems: 'flex-end', gap: 4 },
  chatTime: { fontSize: 11, color: '#bbb' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  emptySubtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 20 },
  newChatBtn: { marginTop: 12, backgroundColor: Colors.pink, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30 },
  newChatBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  fab: { position: 'absolute', bottom: 30, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.pink, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.pink, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
});