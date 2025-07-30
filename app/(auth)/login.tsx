import { useOAuth, useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import { Image, SafeAreaView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false); // Add a loading state

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/(tabs)/profile'); // Redirect to the profile page after successful sign-in
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
        router.replace('/profile'); // Redirect to the profile page after successful sign-in
      }
    } catch (err) {
      console.error('OAuth error', err);
    } finally {
      setIsLoading(false);
    }
  };

  // If we are loading, show a spinner
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center p-8">
        <Text className="text-4xl font-extrabold text-gray-900 mb-2">Welcome and Namaste 🙏</Text>
        <Text className="text-lg text-gray-500 mb-8">Sign in to continue.</Text>

        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Email Address"
          placeholderTextColor={'#A1A1AA'}
          className="bg-gray-100 text-base text-gray-800 p-4 mb-4 rounded-xl w-full"
          onChangeText={setEmailAddress}
        />
        <TextInput
          value={password}
          placeholder="Password"
          placeholderTextColor={'#A1A1AA'}
          secureTextEntry={true}
          className="bg-gray-100 text-base text-gray-800 p-4 mb-4 rounded-xl w-full"
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={onSignInPress}
          className="bg-gray-900 p-4 rounded-xl w-full items-center"
        >
          <Text className="text-white font-bold text-base">Sign In</Text>
        </TouchableOpacity>

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500 font-medium">OR</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <TouchableOpacity
          onPress={() => onSocialSignInPress('oauth_google')}
          className="bg-white border border-gray-200 p-4 rounded-xl w-full flex-row justify-center items-center mb-4"
        >
          <Image source={require('../../assets/images/google-logo.png')} className="w-6 h-6 mr-3" />
          <Text className="text-gray-800 font-bold text-base">Sign in with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSocialSignInPress('oauth_apple')}
          className="bg-white border border-gray-200 p-4 rounded-xl w-full flex-row justify-center items-center mb-4"
        >
          <Image source={require('../../assets/images/apple-logo.png')} className="w-6 h-6 mr-3" />
          <Text className="text-gray-800 font-bold text-base">Sign in with Apple</Text>
        </TouchableOpacity>

        <Link href="/signup" asChild>
          <TouchableOpacity className="mt-8">
            <View className="flex-row items-center justify-center">
              <Text className="text-gray-600">Don't have an account? </Text>
              <Text className="text-gray-900 font-bold">Sign Up</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}