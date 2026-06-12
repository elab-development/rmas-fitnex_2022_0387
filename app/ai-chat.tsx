import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  Dimensions, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/Colors';
import { supabase } from '../services/supabase';

const { width } = Dimensions.get('window');

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const QUICK_REPLIES = [
  'Build me a strength plan',
  'I want to lose weight',
  'Help me with cardio',
  'Beginner full body plan',
];

const SYSTEM_PROMPT = `You are Fitnex, a personal AI fitness coach. You help users create personalized workout plans based on their goals, fitness level, and available equipment.

When a user tells you their goal, create a specific, actionable workout plan with:
- Clear exercise names
- Sets and reps
- Rest periods
- Weekly schedule
- Motivational tips

Keep responses concise, friendly, and practical. Use emojis occasionally to keep it engaging. Always ask about fitness level and available equipment if not mentioned.`;

export default function AIChatScreen() {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams<{ conversationId?: string }>();
  const [convId, setConvId] = useState<string | null>(conversationId || null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hello, I'm Fitnex! 🏋️ I'm your personal sport assistant. How can I help you?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Ako se otvara postojeći chat — učitaj poruke
  useEffect(() => {
    if (conversationId) {
      loadExistingChat(conversationId);
    }
  }, [conversationId]);

  const loadExistingChat = async (id: string) => {
    try {
      const { data } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', id)
        .single();
      if (data?.messages?.length > 0) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.log('Load chat error:', e);
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      const assistantText = data.choices?.[0]?.message?.content
        || "I couldn't process that. Please try again.";

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantText,
      };

      const allMessages = [...newMessages, assistantMsg];
      setMessages(allMessages);

      // Sačuvaj u Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Title = prva user poruka, max 50 chars
        const firstUserMsg = allMessages.find(m => m.role === 'user');
        const title = firstUserMsg
          ? firstUserMsg.content.slice(0, 50)
          : 'Fitness Chat';

        if (convId) {
          // Update postojeći razgovor
          await supabase
            .from('ai_conversations')
            .update({
              messages: allMessages,
              title,
              updated_at: new Date().toISOString(),
            })
            .eq('id', convId);
        } else {
          // Napravi novi razgovor
          const { data: newConv } = await supabase
            .from('ai_conversations')
            .insert({
              user_id: user.id,
              messages: allMessages,
              title,
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (newConv) setConvId(newConv.id);
        }
      } catch (e) {
        // silently fail
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again! 💪",
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
        <View style={styles.avatar}>
            <Image 
            source={require('../assets/LOGO 1.png')} 
            style={styles.avatarImage} 
            resizeMode="cover"
            />
        </View>
        )}
        <View style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
        ]}>
          <Text style={[
            styles.bubbleText,
            isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant,
          ]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push('/ai-chats')}
        >
          <Ionicons name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Image 
                source={require('../assets/LOGO 1.png')} 
                style={styles.avatarImage} 
                resizeMode="cover"
            />
            </View>
          <View>
            <Text style={styles.headerName}>Fitnex</Text>
            <View style={styles.activeRow}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Always active</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Quick replies — samo na početku */}
        {messages.length <= 1 && (
          <View style={styles.quickReplies}>
            {QUICK_REPLIES.map((qr) => (
              <TouchableOpacity
                key={qr}
                style={styles.quickReply}
                onPress={() => sendMessage(qr)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickReplyText}>{qr}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Typing indicator */}
        {loading && (
            <View style={styles.typingRow}>
                <View style={styles.avatar}>
                <Image 
                    source={require('../assets/LOGO 1.png')} 
                    style={styles.avatarImage} 
                    resizeMode="cover"
                />
                </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={Colors.pink} />
              <Text style={styles.typingText}>Fitnex is thinking...</Text>
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#aaa"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.pink,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.pink,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  headerAvatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  headerName: { color: '#fff', fontWeight: '700', fontSize: 16 },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4CAF50' },
  activeText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  moreBtn: { padding: 8 },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  messageRowUser: { flexDirection: 'row-reverse' },
  avatar: {
    width: 31, height: 31, borderRadius: 16,
    backgroundColor: Colors.pink,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImage: { // <--- Novi stil
    width: '120%',
    height: '120%',
  },
  //avatarText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  bubble: {
    maxWidth: width * 0.72,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleAssistant: { backgroundColor: '#f5f5f5', borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: Colors.pink, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextAssistant: { color: '#1a1a1a' },
  bubbleTextUser: { color: '#fff' },
  quickReplies: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 8, marginBottom: 12,
  },
  quickReply: {
    borderWidth: 1.5, borderColor: Colors.pink,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  quickReplyText: { color: Colors.pink, fontSize: 13, fontWeight: '600' },
  typingRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, paddingHorizontal: 16, marginBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, borderBottomLeftRadius: 4,
  },
  typingText: { color: '#aaa', fontSize: 13 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    backgroundColor: '#fff', paddingBottom: 34,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 100,
    backgroundColor: '#f5f5f5', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: '#1a1a1a',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.pink,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#ddd' },
});