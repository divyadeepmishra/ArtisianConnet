import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ScrollView,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Link } from 'expo-router';
import Markdown from 'react-native-markdown-display';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined. Please set it in your .env file.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

type Message = {
    id: string;
    text: string;
    from: 'bot' | 'user';
};

export default function GeminiScreen() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList<Message>>(null);
    const typingId = useRef<string | null>(null);
    const isStopped = useRef(false);

    const thinkingFrames = [
        "Thinking.🤔",
        "Thinking....🤔",
        "Thinking........🤔",
    ];
    // Track thinking interval globally to clear it properly
    const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isTyping && thinkingIntervalRef.current === null) {
            let frameIndex = 0;
            thinkingIntervalRef.current = setInterval(() => {
                const frame = thinkingFrames[frameIndex % thinkingFrames.length];
                if (typingId.current) {
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === typingId.current ? { ...msg, text: frame } : msg
                        )
                    );
                }
                frameIndex++;
            }, 300);
        }

        return () => {
            if (thinkingIntervalRef.current) {
                clearInterval(thinkingIntervalRef.current);
                thinkingIntervalRef.current = null;
            }
        };
    }, [isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage: Message = { id: Math.random().toString(), text: input, from: 'user' };
        typingId.current = Math.random().toString();

        setMessages(prev => [
            ...prev,
            userMessage,
            { id: typingId.current!, text: "Thinking...", from: 'bot' }
        ]);
        setInput('');
        setIsTyping(true);
        isStopped.current = false;

        try {
            const result = await model.generateContent(input);
            const fullText = result.response.text();

            // ❗ Stop "Thinking..." animation before starting the response animation
            if (thinkingIntervalRef.current) {
                clearInterval(thinkingIntervalRef.current);
                thinkingIntervalRef.current = null;
            }

            let animatedText = '';
            for (let i = 0; i < fullText.length; i++) {
                if (isStopped.current) break;
                animatedText += fullText[i];
                await new Promise(res => setTimeout(res, 10));
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === typingId.current ? { ...msg, text: animatedText } : msg
                    )
                );
            }

        } catch (err) {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === typingId.current
                        ? { ...msg, text: "Sorry, something went wrong." }
                        : msg
                )
            );
        } finally {
            setIsTyping(false);
            typingId.current = null;
            if (thinkingIntervalRef.current) {
                clearInterval(thinkingIntervalRef.current);
                thinkingIntervalRef.current = null;
            }
        }
    };


    const handleStop = () => {
        isStopped.current = true;
        setIsTyping(false);
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isBot = item.from === 'bot';
        const bubbleStyle = isBot ? styles.botBubble : styles.userBubble;

        return (
            <View style={[styles.messageContainer, isBot ? styles.botContainer : styles.userContainer]}>
                <View style={[styles.bubble, bubbleStyle]}>
                    {isBot ? (
                        <Markdown style={markdownStyles}>{item.text}</Markdown>
                    ) : (
                        <Text style={styles.userText}>{item.text}</Text>
                    )}
                </View>
            </View>
        );
    };

    const examplePrompts = [
        "Write a song about Ocean Waves",
        "Can you help me plan a vacation?",
        "How do I make the perfect cup of coffee?",
        "What's the best way to learn a new language?",
        "Give me tips for staying productive"
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Link href="/profile" asChild>
                    <TouchableOpacity>
                        <Ionicons name="arrow-back" size={24} />
                    </TouchableOpacity>
                </Link>
                <Text style={styles.headerTitle}>GenAI Playground</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="sparkles" size={60} color="#9CA3AF" />
                        <Text style={styles.emptyText}>Ask me anything!</Text>
                        <Text style={styles.emptySubText}>I can write songs, give advice, or explain complex topics.</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 20 }}>
                            {examplePrompts.map(prompt => (
                                <TouchableOpacity key={prompt} onPress={() => setInput(prompt)} style={styles.promptChip}>
                                    <Text style={styles.promptChipText}>{prompt}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />
                )}

                <View style={styles.inputContainer}>
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="Write a song, ask for advice..."
                        placeholderTextColor="#9CA3AF"
                        style={styles.textInput}
                        multiline
                    />
                    {isTyping ? (
                        <TouchableOpacity onPress={handleStop} style={styles.stopButton}>
                            <Ionicons name="stop-circle" size={32} color="red" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                            <Ionicons name="arrow-forward-circle" size={32} color="#007AFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    keyboardAvoidingView: { flex: 1 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { fontSize: 22, fontWeight: 'bold', marginTop: 16 },
    emptySubText: { fontSize: 16, color: 'gray', marginTop: 8, textAlign: 'center' },
    promptChip: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 8,
    },
    promptChipText: { fontWeight: '500' },
    messageContainer: { maxWidth: '80%', marginVertical: 4 },
    botContainer: { alignSelf: 'flex-start' },
    userContainer: { alignSelf: 'flex-end' },
    bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
    botBubble: { backgroundColor: '#E5E7EB', borderBottomLeftRadius: 4 },
    userBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
    userText: { color: 'white', fontSize: 16 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingBottom: Platform.OS === 'ios' ? 20 : 12,
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
        marginRight: 8,
    },
    sendButton: { padding: 4 },
    stopButton: {
        padding: 4
    },
});

const markdownStyles = {
    body: { color: '#111', fontSize: 16 },
    paragraph: { marginTop: 4, marginBottom: 4 },
    code_block: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8 },
};
