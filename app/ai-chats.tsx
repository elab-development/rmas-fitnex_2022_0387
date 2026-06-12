import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../services/supabase';
import { Colors } from '../constants/Colors';

const TABS = ['AI', 'Archived', 'Deleted'];

const ICON_COLORS = ['#FF4D9E', '#FF6B35', '#7B61FF', '#00B4D8', '#4CAF50', '#FFB74D'];

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

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const handleNewChat = () => {
    router.push('/ai-chat');
  };

  const handleOpenChat = (conv: Conversation) => {
    router.push({
      pathname: '/ai-chat',
      params: { conversationId: conv.id },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/workout')}>
          <Ionicons name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My AI Chats</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Earlier Today label */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Earlier Today</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator color={Colors.pink} style={{ marginTop: 40 }} />
      ) : conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>No chats yet</Text>
          <Text style={styles.emptySubtitle}>Start a new conversation with your AI fitness coach</Text>
          <TouchableOpacity style={styles.newChatBtn} onPress={handleNewChat}>
            <Text style={styles.newChatBtnText}>Create New Conversation →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, gap: 4 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const color = ICON_COLORS[index % ICON_COLORS.length];
            const lastMsg = item.messages?.[item.messages.length - 1];
            const preview = lastMsg?.content?.slice(0, 45) + (lastMsg?.content?.length > 45 ? '...' : '') || 'No messages yet';

            return (
              <TouchableOpacity
                style={styles.chatRow}
                onPress={() => handleOpenChat(item)}
                activeOpacity={0.75}
              >
                {/* Icon */}
                <View style={[styles.chatIcon, { backgroundColor: color + '22' }]}>
                  <Ionicons name="chatbubble-ellipses" size={20} color={color} />
                </View>

                {/* Info */}
                <View style={styles.chatInfo}>
                  <Text style={styles.chatTitle} numberOfLines={1}>{item.title || 'New Chat'}</Text>
                  <Text style={styles.chatPreview} numberOfLines={1}>{preview}</Text>
                </View>

                {/* Time + arrow */}
                <View style={styles.chatRight}>
                  <Text style={styles.chatTime}>{timeAgo(item.updated_at)}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* FAB — new chat */}
      <TouchableOpacity style={styles.fab} onPress={handleNewChat} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.pink,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabActive: { backgroundColor: Colors.pink },
  tabText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  seeAll: { fontSize: 13, color: Colors.pink, fontWeight: '600' },
  chatRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  chatIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  chatInfo: { flex: 1 },
  chatTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  chatPreview: { fontSize: 12, color: '#aaa' },
  chatRight: { alignItems: 'flex-end', gap: 4 },
  chatTime: { fontSize: 11, color: '#bbb' },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, gap: 10,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  emptySubtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 20 },
  newChatBtn: {
    marginTop: 12, backgroundColor: Colors.pink,
    paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30,
  },
  newChatBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  fab: {
    position: 'absolute', bottom: 30, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.pink,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.pink, shadowOpacity: 0.4,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});