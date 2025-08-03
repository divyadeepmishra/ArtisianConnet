import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { router } from 'expo-router';

const WIT_AI_TOKEN = process.env.EXPO_PUBLIC_WIT_AI_TOKEN;

type Message = {
  id: string;
  text: string;
  from: 'bot' | 'user';
};

export default function HelpScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Set an initial welcome message after the component mounts
  useEffect(() => {
    setMessages([
      {
        id: 'init',
        text: 'Hello! As an AI assistant, I can help with questions about order tracking or return policies.',
        from: 'bot',
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { id: Math.random().toString(), text: input, from: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    if (!WIT_AI_TOKEN) {
        console.error("Wit.ai token is missing. Check your .env file for EXPO_PUBLIC_WIT_AI_TOKEN.");
        const errorMessage: Message = { id: Math.random().toString(), text: "Configuration error. Could not connect to the AI service.", from: 'bot' };
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
        return;
    }

    try {
      const response = await fetch(`https://api.wit.ai/message?q=${encodeURIComponent(input)}`, {
        headers: { Authorization: `Bearer ${WIT_AI_TOKEN}` },
      });
      const data = await response.json();
      
      const intent = data.intents.length > 0 ? data.intents[0].name : 'unknown';
      let botResponseText = "I'm sorry, I don't understand. I can help with questions about order tracking or our return policy.";

      if (intent === 'track_order') {
        botResponseText = "You can track all your orders from the 'Profile' tab.";
      } else if (intent === 'return_policy') {
        botResponseText = "Our policy allows for returns within 30 days of purchase.";
      }
      
      const botMessage: Message = { id: Math.random().toString(), text: botResponseText, from: 'bot' };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error fetching from Wit.ai:", error);
      const errorMessage: Message = { id: Math.random().toString(), text: "Sorry, I'm having trouble connecting right now.", from: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isBot = item.from === 'bot';
    return (
      <View style={[styles.messageContainer, isBot ? styles.botContainer : styles.userContainer]}>
        <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
          <Text style={isBot ? styles.botText : styles.userText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
     <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
       <View style={styles.header}>
    <TouchableOpacity onPress={() => router.back()}>
      <Ionicons name="arrow-back" size={24} color="#000" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Support Assistant</Text>
    <View style={{ width: 24 }} />
  </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
         keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.chatArea}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isTyping && (
          <View style={styles.typingIndicator}>
             <ActivityIndicator size="small" color="#6B7280" />
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question..."
            placeholderTextColor="#9CA3AF"
            style={styles.textInput}
            multiline
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="arrow-forward-circle" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  keyboardAvoidingView: { flex: 1 },
  chatArea: { flex: 1 },
  messageContainer: { maxWidth: '80%', marginVertical: 4 },
  botContainer: { alignSelf: 'flex-start' },
  userContainer: { alignSelf: 'flex-end' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  botBubble: { backgroundColor: '#E5E7EB', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
  botText: { color: 'black' },
  userText: { color: 'white' },
  typingIndicator: { paddingLeft: 20, paddingBottom: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  sendButton: { marginLeft: 8 },
});