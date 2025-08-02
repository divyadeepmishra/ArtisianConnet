import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { PropsWithChildren } from 'react';

export default function ScreenWrapper({ children }: PropsWithChildren<{}>) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingHorizontal: 0,
        backgroundColor: '#F9FAFB',
      }}
    >
      {children}
    </SafeAreaView>
  );
}
