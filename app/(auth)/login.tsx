import { useOAuth, useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInUp,
  SlideInDown,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring
} from 'react-native-reanimated';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Animation values
  const logoScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withSpring(1.05, { duration: 2000 }),
        withSpring(1, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    
    // Button animation
    buttonScale.value = withSequence(
      withSpring(0.95, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: 'oauth_apple' });

  const onSocialSignInPress = async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const oAuthFlow = strategy === 'oauth_google' ? startGoogleOAuthFlow : startAppleOAuthFlow;
      const redirectUrl = Linking.createURL('/(auth)/oauth-native-callback');
      const { createdSessionId, setActive } = await oAuthFlow({ redirectUrl });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/');
      }
    } catch (err) {
      console.error('OAuth error', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Animated.View 
          entering={FadeInUp}
          className="items-center space-y-4"
        >
          <View className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl items-center justify-center">
            <Ionicons name="sparkles" size={32} color="white" />
          </View>
          <Text className="text-lg font-semibold text-gray-700">Signing you in...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <View className="flex-1 justify-center p-8">
          {/* Logo and Welcome */}
          <Animated.View 
            entering={SlideInDown.delay(200)}
            className="items-center mb-12"
          >
            <Animated.View 
              className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl items-center justify-center shadow-2xl mb-6"
              style={{ transform: [{ scale: logoScale }] }}
            >
              <Ionicons name="sparkles" size={40} color="white" />
            </Animated.View>
            <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Welcome Back! 👋
            </Text>
            <Text className="text-lg text-gray-600 text-center">
              Sign in to continue your journey
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInUp.delay(300)} className="space-y-6">
            {/* Email Input */}
            <View className="space-y-2">
              <Text className="text-sm font-semibold text-gray-700 ml-1">Email Address</Text>
              <View className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <TextInput
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  className="px-4 py-4 text-base text-gray-900"
                  onChangeText={setEmailAddress}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="space-y-2">
              <Text className="text-sm font-semibold text-gray-700 ml-1">Password</Text>
              <View className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-row items-center">
                <TextInput
                  value={password}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  className="flex-1 px-4 py-4 text-base text-gray-900"
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  className="px-4"
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                onPress={onSignInPress}
                className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg"
              >
                <Text className="text-white font-bold text-lg text-center">Sign In</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Divider */}
          <Animated.View entering={FadeInUp.delay(400)} className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-500 font-medium">or continue with</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </Animated.View>

          {/* Social Buttons */}
          <Animated.View entering={FadeInUp.delay(500)} className="space-y-4">
            <TouchableOpacity
              onPress={() => onSocialSignInPress('oauth_google')}
              className="bg-white border border-gray-200 p-4 rounded-2xl flex-row justify-center items-center shadow-sm"
            >
              <Image source={require('../../assets/images/google-logo.png')} className="w-6 h-6 mr-3" />
              <Text className="text-gray-800 font-semibold text-base">Continue with Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => onSocialSignInPress('oauth_apple')}
              className="bg-white border border-gray-200 p-4 rounded-2xl flex-row justify-center items-center shadow-sm"
            >
              <Image source={require('../../assets/images/apple-logo.png')} className="w-6 h-6 mr-3" />
              <Text className="text-gray-800 font-semibold text-base">Continue with Apple</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Sign Up Link */}
          <Animated.View entering={FadeInUp.delay(600)} className="mt-8">
            <Link href="/signup" asChild>
              <TouchableOpacity className="items-center">
                <Text className="text-gray-600 text-center">
                  Don't have an account?{' '}
                  <Text className="text-blue-600 font-bold">Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}