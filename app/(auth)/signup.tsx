import { useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeInUp,
    SlideInDown,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring
} from 'react-native-reanimated';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
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

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    
    // Button animation
    buttonScale.value = withSequence(
      withSpring(0.95, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    
    // Button animation
    buttonScale.value = withSequence(
      withSpring(0.95, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <View className="flex-1 justify-center p-7">
          {!pendingVerification && (
            <>
              {/* Logo and Welcome */}
              <Animated.View 
                entering={SlideInDown.delay(200)}
                className="items-center mb-12"
              >
                <Animated.View 
                  className="w-20 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl items-center justify-center shadow-2xl mb-6"
                  style={{ transform: [{ scale: logoScale }] }}
                >
                  <Ionicons name="person-add" size={40} color="white" />
                </Animated.View>
                <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
                  Join Us! 🎉
                </Text>
                <Text className="text-lg text-gray-600 text-center">
                  Create your account to get started
                </Text>
              </Animated.View>

              {/* Form */}
              <Animated.View entering={FadeInUp.delay(300)} className="space-y-6">
                {/* Name Inputs */}
                <View className="flex-row space-x-4">
                  <View className="flex-1 space-y-2">
                    <Text className="text-sm font-semibold text-gray-700 ml-1">First Name</Text>
                    <View className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                      <TextInput
                        value={firstName}
                        placeholder="John"
                        placeholderTextColor="#9CA3AF"
                        className="px-4 py-4 text-base text-gray-900"
                        onChangeText={setFirstName}
                      />
                    </View>
                  </View>
                  <View className="flex-1 space-y-2">
                    <Text className="text-sm font-semibold text-gray-700 ml-1">Last Name</Text>
                    <View className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                      <TextInput
                        value={lastName}
                        placeholder="Doe"
                        placeholderTextColor="#9CA3AF"
                        className="px-4 py-4 text-base text-gray-900"
                        onChangeText={setLastName}
                      />
                    </View>
                  </View>
                </View>

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
                      placeholder="Create a password"
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

                {/* Sign Up Button */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    onPress={onSignUpPress}
                    className="bg-orange-400 p-4 rounded-2xl shadow-lg mt-4"
                  >
                    <Text className="text-white font-bold text-lg text-center">Create Account</Text>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>

              {/* Sign In Link */}
              <Animated.View entering={FadeInUp.delay(400)} className="mt-8">
                <Link href="/login" asChild>
                  <TouchableOpacity className="items-center">
                    <Text className="text-gray-600 text-center">
                      Already have an account?{' '}
                      <Text className="text-blue-600 font-bold">Sign In</Text>
                    </Text>
                  </TouchableOpacity>
                </Link>
              </Animated.View>
            </>
          )}

          {pendingVerification && (
            <>
              {/* Verification Screen */}
              <Animated.View 
                entering={SlideInDown.delay(200)}
                className="items-center mb-12"
              >
                <View className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl items-center justify-center shadow-2xl mb-6">
                  <Ionicons name="checkmark-circle" size={40} color="white" />
                </View>
                <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
                  Check Your Email! 📧
                </Text>
                <Text className="text-lg text-gray-600 text-center">
                  We've sent a verification code to your email
                </Text>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(300)} className="space-y-6">
                <View className="space-y-2">
                  <Text className="text-sm font-semibold text-gray-700 ml-1">Verification Code</Text>
                  <View className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <TextInput
                      value={code}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="#9CA3AF"
                      className="px-4 py-4 text-base text-gray-900 text-center"
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>

                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    onPress={onVerifyPress}
                    className="bg-gradient-to-r from-green-500 to-blue-600 p-4 rounded-2xl shadow-lg"
                  >
                    <Text className="text-white font-bold text-lg text-center">Verify Email</Text>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}