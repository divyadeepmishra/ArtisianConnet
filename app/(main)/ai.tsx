import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import Animated, {
    FadeInUp,
    SlideInDown,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Initialize genAI only if API key is available
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

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

    // Animation values
    const pulseValue = useSharedValue(1);

    const thinkingFrames = [
        "Thinking.🤔",
        "Thinking....🤔",
        "Thinking........🤔",
    ];
    
    const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Pulse animation for the AI icon
        pulseValue.value = withRepeat(
            withSequence(
                withSpring(1.1, { duration: 1000 }),
                withSpring(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

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

        // Check if API key is available
        if (!GEMINI_API_KEY || !model) {
            Alert.alert(
                'API Key Missing',
                'Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file to use the AI features.',
                [{ text: 'OK' }]
            );
            return;
        }

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

            if (thinkingIntervalRef.current) {
                clearInterval(thinkingIntervalRef.current);
                thinkingIntervalRef.current = null;
            }

            let animatedText = '';
            for (let i = 0; i < fullText.length; i++) {
                if (isStopped.current) break;
                animatedText += fullText[i];
                await new Promise(res => setTimeout(res, 1));
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

        return (
            <Animated.View 
                entering={FadeInUp.delay(200)}
                className={`max-w-[85%] mb-4 ${isBot ? 'self-start' : 'self-end'}`}
            >
                <View className={`
                    p-4 rounded-3xl shadow-sm
                    ${isBot 
                        ? 'bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }
                `}>
                    {isBot ? (
                        <Markdown style={markdownStyles}>{item.text}</Markdown>
                    ) : (
                        <Text className="text-white font-medium text-base">{item.text}</Text>
                    )}
                </View>
            </Animated.View>
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
        <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <Animated.View 
                entering={SlideInDown.delay(100)}
                className="bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-4"
            >
                <View className="flex-row items-center justify-between">
                    <Link href="/profile" asChild>
                        <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                            <Ionicons name="arrow-back" size={20} color="#374151" />
                        </TouchableOpacity>
                    </Link>
                    <View className="flex-row items-center space-x-2">
                        <Animated.View style={{ transform: [{ scale: pulseValue }] }}>
                            <Ionicons name="sparkles" size={24} color="#3B82F6" />
                        </Animated.View>
                        <Text className="text-xl font-bold text-gray-900">AI Assistant</Text>
                    </View>
                    <View className="w-10" />
                </View>
            </Animated.View>

            {!GEMINI_API_KEY && (
                <Animated.View 
                    entering={FadeInUp.delay(200)}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 mx-4 mt-4 p-4 rounded-2xl"
                >
                    <View className="flex-row items-center space-x-3">
                        <Ionicons name="warning" size={24} color="#F59E0B" />
                        <Text className="text-yellow-800 font-medium flex-1">
                            API Key Missing. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.
                        </Text>
                    </View>
                </Animated.View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            >
                {messages.length === 0 ? (
                    <Animated.View 
                        entering={FadeInUp.delay(300)}
                        className="flex-1 justify-center items-center px-8"
                    >
                        <View className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl items-center justify-center shadow-2xl mb-8">
                            <Ionicons name="sparkles" size={48} color="white" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
                            Ask me anything! ✨
                        </Text>
                        <Text className="text-gray-600 text-center mb-8 leading-6">
                            I can write songs, give advice, explain complex topics, or help you with creative projects.
                        </Text>
                        
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            contentContainerStyle={{ paddingHorizontal: 20 }}
                            className="mb-8"
                        >
                            <View className="flex-row space-x-3">
                                {examplePrompts.map((prompt, index) => (
                                    <Animated.View
                                        key={prompt}
                                        entering={FadeInUp.delay(400 + index * 100)}
                                    >
                                        <TouchableOpacity 
                                            onPress={() => setInput(prompt)}
                                            className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm"
                                        >
                                            <Text className="text-gray-700 font-medium text-sm">{prompt}</Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </View>
                        </ScrollView>
                    </Animated.View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Input Container */}
                <Animated.View 
                    entering={FadeInUp.delay(500)}
                    className="bg-white border-t border-gray-100 p-4"
                >
                    <View className="flex-row items-end space-x-3">
                        <View className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                            <TextInput
                                value={input}
                                onChangeText={setInput}
                                placeholder="Ask me anything..."
                                placeholderTextColor="#9CA3AF"
                                className="text-base text-gray-900"
                                multiline
                                maxLength={1000}
                            />
                        </View>
                        
                        {isTyping ? (
                            <TouchableOpacity 
                                onPress={handleStop}
                                className="w-12 h-12 bg-red-500 rounded-2xl items-center justify-center"
                            >
                                <Ionicons name="stop" size={24} color="white" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                onPress={handleSend}
                                disabled={!input.trim()}
                                className={`w-12 h-12 rounded-2xl items-center justify-center ${
                                    input.trim() 
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                                        : 'bg-gray-300'
                                }`}
                            >
                                <Ionicons 
                                    name="send" 
                                    size={20} 
                                    color={input.trim() ? 'white' : '#9CA3AF'} 
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const markdownStyles = {
    body: { color: '#111', fontSize: 16, lineHeight: 24 },
    paragraph: { marginTop: 4, marginBottom: 4 },
    code_block: { 
        backgroundColor: '#F3F4F6', 
        padding: 12, 
        borderRadius: 12,
        fontFamily: 'monospace',
        fontSize: 14
    },
    code_inline: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        fontFamily: 'monospace',
        fontSize: 14
    },
    strong: { fontWeight: '600' as const },
    em: { fontStyle: 'italic' as const },
    link: { color: '#3B82F6', textDecorationLine: 'underline' as const },
};
