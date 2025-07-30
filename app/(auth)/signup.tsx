import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');

  const onSignUpPress = async () => {
    if (!isLoaded) return;
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center p-6">
        {!pendingVerification && (
          <>
            <Text className="text-4xl font-extrabold text-gray-900 mb-2">Create Account</Text>
            <Text className="text-lg text-gray-500 mb-8">Let's get you started.</Text>

            <View className="flex-row gap-4">
              <TextInput
                value={firstName}
                placeholder="First Name"
                placeholderTextColor={'#A1A1AA'}
                className="bg-gray-100 text-base text-gray-800 p-4 mb-4 rounded-xl flex-1"
                onChangeText={setFirstName}
              />
              <TextInput
                value={lastName}
                placeholder="Last Name"
                placeholderTextColor={'#A1A1AA'}
                className="bg-gray-100 text-base text-gray-800 p-4 mb-4 rounded-xl flex-1"
                onChangeText={setLastName}
              />
            </View>

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
              onPress={onSignUpPress}
              className="bg-gray-900 p-4 rounded-xl w-full items-center"
            >
              <Text className="text-white font-bold text-base">Create Account</Text>
            </TouchableOpacity>

            <Link href="/login" asChild>
              <TouchableOpacity className="mt-8">
                <View className="flex-row items-center justify-center">
                  <Text className="text-gray-600">Already have an account? </Text>
                  <Text className="text-gray-900 font-bold">Sign In</Text>
                </View>
              </TouchableOpacity>
            </Link>
          </>
        )}
        {pendingVerification && (
          <>
            <Text className="text-4xl font-extrabold text-gray-900 mb-2">Verify Your Email</Text>
            <Text className="text-lg text-gray-500 mb-8">Check your inbox for a verification code.</Text>
            <TextInput
              value={code}
              placeholder="Verification Code..."
              placeholderTextColor={'#A1A1AA'}
              className="bg-gray-100 text-base text-gray-800 p-4 mb-4 rounded-xl w-full"
              onChangeText={setCode}
            />
            <TouchableOpacity
              onPress={onVerifyPress}
              className="bg-gray-900 p-4 rounded-xl w-full items-center"
            >
              <Text className="text-white font-bold text-base">Verify Email</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}